from decimal import Decimal
from datetime import timedelta
import logging
import time

from django.conf import settings
from django.db import transaction
from django.db.models import Sum, Q, Count, F
from django.shortcuts import get_object_or_404
from django.utils import timezone

from django.db.models import Prefetch
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from apps.core.permissions import IsStaffMember, IsAdmin

from rest_framework.response import Response
from apps.cart.models import Cart
from apps.invoices.models import Invoice
from apps.payments.models import Payment
from apps.payments.services import create_ssl_session
from apps.products.models import Product
from apps.shipping.models import ShippingAddress, ShippingCharge
from apps.shipping.serializers import (ShippingAddressSerializer,)
from .models import ( Coupon, Order, OrderStatusHistory, OrderItem, ReturnRequestImage, ReturnRequest, Refund, PAYMENT,)
from .serializers import ( OrderSerializer, OrderItemSerializer, OrderStatusHistorySerializer, ReturnRequestSerializer, ReturnRequestImageSerializer, RefundSerializer, )
# from django.db import transaction
from .tasks import send_order_confirmation_email
from apps.core.responses import (success_response, error_response,)

logger = logging.getLogger(__name__)

class OrderViewSet(viewsets.ModelViewSet):

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_client_ip(self, request):

        x_forwarded_for = request.META.get(
            "HTTP_X_FORWARDED_FOR"
        )

        if x_forwarded_for:
            return x_forwarded_for.split(",")[0].strip()

        return request.META.get("REMOTE_ADDR")

    def update(self, request, *args, **kwargs):
        return error_response(
            message="Orders cannot be edited.",
            status=405,
        )

    def partial_update(self, request, *args, **kwargs):
        return error_response(
            message="Orders cannot be edited.",
            status=405,
        )

    def destroy(self, request, *args, **kwargs):
        return error_response(
            message="Orders cannot be deleted.",
            status=405,
        )

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser or user.groups.filter(
            name__in=["Admin", "Staff"]
        ).exists():
            return (
                Order.objects
                .select_related(
                    "user",
                    "shipping_address",
                    "coupon",
                    "payment",
                )
                .prefetch_related(
                    Prefetch(
                        "items",
                        queryset=OrderItem.objects.select_related(
                            "product"
                        ),
                    ),
                    Prefetch(
                        "status_history",
                        queryset=OrderStatusHistory.objects.select_related(
                            "changed_by"
                        ),
                    ),
                )
                .order_by("-created_at")
            )

        return (
            Order.objects
            .filter(user=user)
            .select_related(
                "user",
                "shipping_address",
                "coupon",
                "payment",
            )
            .prefetch_related(
                Prefetch(
                    "items",
                    queryset=OrderItem.objects.select_related(
                        "product"
                    ),
                ),
                Prefetch(
                    "status_history",
                    queryset=OrderStatusHistory.objects.select_related(
                        "changed_by"
                    ),
                ),
            )
            .order_by("-created_at")
        )

    def perform_create(self, serializer):

        serializer.save(
            user=self.request.user
        )

    @action(
        detail=True,
        methods=["get"],
    )
    def history(self, request, pk=None):

        order = self.get_object()

        history = (
            order.status_history
            .select_related("changed_by")
            .all()
        )

        serializer = OrderStatusHistorySerializer(
            history,
            many=True,
        )

        return success_response(
            data={
                "order_number": order.order_number,
                "current_status": order.status,
                "timeline": serializer.data,
            },
            message="Order history fetched successfully.",
        )


    @action(
        detail=False,
        methods=["post"],
    )
    def checkout(self, request):

        checkout_start = time.perf_counter()

        shipping_address_id = request.data.get(
            "shipping_address_id"
        )

        payment_method = request.data.get(
            "payment_method",
            "COD",
        )

        # -------------------------------------------------
        # VALIDATE SHIPPING ADDRESS
        # -------------------------------------------------

        if not shipping_address_id:
            return error_response(
                message="Shipping address is required.",
                status=400,
            )

        shipping = (
            ShippingAddress.objects
            .filter(
                id=shipping_address_id,
                user=request.user,
            )
            .first()
        )

        if not shipping:
            return error_response(
                message="Shipping address not found.",
                status=400,
            )

        shipping_charge = (
            ShippingCharge.objects
            .filter(
                district__iexact=shipping.district,
                is_active=True,
            )
            .first()
        )

        if not shipping_charge:
            return error_response(
                message="Shipping charge is not available for this district.",
                status=400,
            )

        delivery_charge = shipping_charge.charge

        # -------------------------------------------------
        # VALIDATE PAYMENT
        # -------------------------------------------------

        payment_choices = dict(PAYMENT)

        if payment_method not in payment_choices:
            return error_response(
                message="Invalid payment method.",
                status=400,
            )

        # -------------------------------------------------
        # GET CART
        # -------------------------------------------------

        cart_items = (
            Cart.objects
            .filter(user=request.user)
            .select_related("product")
        )

        if not cart_items.exists():
            return error_response(
                message="Cart is empty.",
                status=400,
            )

        # -------------------------------------------------
        # CREATE ORDER + STOCK LOCK
        # -------------------------------------------------

        payment_url = None

        try:

            with transaction.atomic():

                # Re-fetch cart inside transaction
                cart_items = list(
                    Cart.objects
                    .filter(user=request.user)
                    .select_related("product")
                    .select_for_update()
                    .order_by("product_id")
                )

                if not cart_items:
                    return error_response(
                        message="Cart is empty.",
                        status=400,
                    )

                total = Decimal("0.00")

                order = Order.objects.create(
                    user=request.user,
                    shipping_address=shipping,
                    payment_method=payment_method,
                    ip_address=self.get_client_ip(request),
                )

                OrderStatusHistory.objects.create(
                    order=order,
                    status="Pending",
                    remarks="Order placed successfully",
                    changed_by=request.user,
                )

                # -----------------------------------------
                # ORDER ITEMS
                # -----------------------------------------

                for item in cart_items:

                    product = (
                        item.product.__class__
                        .objects
                        .select_for_update()
                        .get(
                            pk=item.product.pk
                        )
                    )

                    # STOCK CHECK
                    if product.stock < item.quantity:

                        raise ValueError(
                            f"Only {product.stock} items "
                            f"available for "
                            f"{product.name}."
                        )

                    # -------------------------------------
                    # PRICE
                    # -------------------------------------

                    price = product.price

                    if (
                        hasattr(product, "discount_price")
                        and product.discount_price
                        and product.discount_price < product.price
                    ):
                        price = product.discount_price

                    # -------------------------------------
                    # ORDER ITEM
                    # -------------------------------------

                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=item.quantity,
                        price=price,
                    )

                    # -------------------------------------
                    # STOCK
                    # -------------------------------------

                    product.stock -= item.quantity

                    product.save(
                        update_fields=["stock"]
                    )

                    total += (
                        price *
                        item.quantity
                    )

                order.stock_deducted = True

                order.save(
                    update_fields=["stock_deducted"]
                )

                # -----------------------------------------
                # COUPON
                # -----------------------------------------

                coupon = None
                coupon_code = request.data.get("coupon_code")
                discount_amount = Decimal("0.00")

                if coupon_code:

                    coupon_code = (
                        str(coupon_code)
                        .strip()
                        .upper()
                    )

                    try:
                        coupon = Coupon.objects.get(
                            code__iexact=coupon_code
                        )
                    except Coupon.DoesNotExist:
                        raise ValueError(
                            "Invalid coupon code."
                        )

                    now = timezone.now()

                    if not coupon.active:
                        raise ValueError(
                            "This coupon is inactive."
                        )

                    if now < coupon.valid_from:
                        raise ValueError(
                            "This coupon is not active yet."
                        )

                    if now > coupon.valid_to:
                        raise ValueError(
                            "This coupon has expired."
                        )

                    discount_amount = (
                        total *
                        Decimal(coupon.discount) /
                        Decimal("100")
                    )

                    discount_amount = min(
                        discount_amount,
                        total,
                    )

                # -----------------------------------------
                # DELIVERY + GRAND TOTAL
                # -----------------------------------------

                grand_total = (
                    total
                    - discount_amount
                    + delivery_charge
                )

                order.coupon = coupon
                order.total_price = total
                order.discount_amount = discount_amount
                order.delivery_charge = delivery_charge
                order.grand_total = grand_total

                order.save(
                    update_fields=[
                        "coupon",
                        "total_price",
                        "discount_amount",
                        "delivery_charge",
                        "grand_total",
                    ]
                )

                # -----------------------------------------
                # PAYMENT RECORD
                # -----------------------------------------

                payment = Payment.objects.create(
                    order=order,
                    method=payment_method,
                    amount=grand_total,
                )

                # -----------------------------------------
                # INVOICE
                # -----------------------------------------

                invoice = Invoice.objects.create(
                    order=order
                )

                # -----------------------------------------
                # CLEAR CART
                # -----------------------------------------

                Cart.objects.filter(
                    user=request.user
                ).delete()

        except ValueError as exc:

            return error_response(
                message=str(exc),
                status=400,
            )

        except Exception as exc:

            logger.exception(
                "Checkout failed for user %s: %s",
                request.user.id,
                exc,
            )

            return error_response(
                message="Unable to place order.",
                status=500,
            )

        # =================================================
        # SSL COMMERZ — OUTSIDE DATABASE TRANSACTION
        # =================================================

        if payment_method == "SSL":

            try:

                ssl_start = time.perf_counter()

                ssl = create_ssl_session(order)

                logger.info(
                    "SSL SESSION: %.3f sec",
                    time.perf_counter() - ssl_start,
                )

                if not ssl:
                    raise ValueError(
                        "Payment gateway error."
                    )

                if ssl.get("status") != "SUCCESS":

                    logger.error(
                        "SSL payment failed for order %s: %s",
                        order.order_number,
                        ssl,
                    )

                    raise ValueError(
                        ssl.get(
                            "failedreason",
                            "Payment gateway error.",
                        )
                    )

                payment_url = ssl.get(
                    "GatewayPageURL"
                )

                if not payment_url:
                    raise ValueError(
                        "Payment gateway did not return a payment URL."
                    )

            except ValueError as exc:

                logger.error(
                    "SSLCommerz initiation failed for order %s: %s",
                    order.order_number,
                    exc,
                )

                # -----------------------------------------
                # COMPENSATE FAILED SSL ORDER
                # -----------------------------------------

                try:

                    with transaction.atomic():

                        failed_order = (
                            Order.objects
                            .select_for_update()
                            .get(pk=order.pk)
                        )

                        failed_payment = (
                            Payment.objects
                            .select_for_update()
                            .get(order=failed_order)
                        )

                        if failed_order.stock_deducted:

                            items = (
                                failed_order.items
                                .select_related("product")
                                .order_by("product_id")
                            )

                            for item in items:

                                product = (
                                    Product.objects
                                    .select_for_update()
                                    .get(
                                        pk=item.product_id
                                    )
                                )

                                product.stock += item.quantity

                                product.save(
                                    update_fields=[
                                        "stock"
                                    ]
                                )

                            failed_order.stock_deducted = False

                        failed_payment.status = "Failed"

                        failed_payment.save(
                            update_fields=[
                                "status"
                            ]
                        )

                        failed_order.status = "Cancelled"

                        failed_order.save(
                            update_fields=[
                                "status",
                                "stock_deducted",
                                "updated_at",
                            ]
                        )

                        OrderStatusHistory.objects.create(
                            order=failed_order,
                            status="Cancelled",
                            remarks=(
                                "SSLCommerz payment "
                                "initiation failed."
                            ),
                            changed_by=request.user,
                        )

                except Exception:

                    logger.exception(
                        "Failed to compensate SSL order %s",
                        order.order_number,
                    )

                return error_response(
                    message=str(exc),
                    status=400,
                )

            except Exception as exc:

                logger.exception(
                    "SSLCommerz error for order %s: %s",
                    order.order_number,
                    exc,
                )

                # -----------------------------------------
                # COMPENSATE UNEXPECTED SSL FAILURE
                # -----------------------------------------

                try:

                    with transaction.atomic():

                        failed_order = (
                            Order.objects
                            .select_for_update()
                            .get(pk=order.pk)
                        )

                        failed_payment = (
                            Payment.objects
                            .select_for_update()
                            .get(order=failed_order)
                        )

                        if failed_order.stock_deducted:

                            items = (
                                failed_order.items
                                .select_related("product")
                                .order_by("product_id")
                            )

                            for item in items:

                                product = (
                                    Product.objects
                                    .select_for_update()
                                    .get(
                                        pk=item.product_id
                                    )
                                )

                                product.stock += item.quantity

                                product.save(
                                    update_fields=[
                                        "stock"
                                    ]
                                )

                            failed_order.stock_deducted = False

                        failed_payment.status = "Failed"

                        failed_payment.save(
                            update_fields=[
                                "status"
                            ]
                        )

                        failed_order.status = "Cancelled"

                        failed_order.save(
                            update_fields=[
                                "status",
                                "stock_deducted",
                                "updated_at",
                            ]
                        )

                        OrderStatusHistory.objects.create(
                            order=failed_order,
                            status="Cancelled",
                            remarks=(
                                "SSLCommerz payment "
                                "initiation failed."
                            ),
                            changed_by=request.user,
                        )

                except Exception:

                    logger.exception(
                        "Failed to compensate SSL order %s",
                        order.order_number,
                    )

                return error_response(
                    message="Payment gateway error.",
                    status=400,
                )

        # -------------------------------------------------
        # BACKGROUND EMAIL + PDF
        # -------------------------------------------------

        def _send_confirmation():

            try:

                send_order_confirmation_email.delay(
                    order.id,
                    invoice.id,
                    request.user.id,
                )

            except Exception:

                try:

                    send_order_confirmation_email(
                        order.id,
                        invoice.id,
                        request.user.id,
                    )

                except Exception as mail_exc:

                    logger.warning(
                        "Order confirmation email skipped: %s",
                        mail_exc,
                    )

        transaction.on_commit(
            _send_confirmation
        )

        # -------------------------------------------------
        # TOTAL TIME
        # -------------------------------------------------

        logger.info(
            "CHECKOUT TOTAL: %.3f sec",
            time.perf_counter() - checkout_start,
        )

        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        return success_response(
            data={
                "payment_url": payment_url,
                "order_number": order.order_number,
                "grand_total": order.grand_total,
            },
            message="Order placed successfully.",
            status=201,
        )

    @action(
        detail=False,
        methods=["get"],
        url_path=(
            r"track/(?P<order_number>[^/.]+)"
        ),
    )
    def track(
        self,
        request,
        order_number=None,
    ):

        order = get_object_or_404(
            Order.objects.select_related(
                "shipping_address",
                "payment",
            ),
            order_number=order_number,
            user=request.user,
        )

        history = (
            order.status_history
            .select_related("changed_by")
            .all()
        )

        history_data = []

        for item in history:

            history_data.append(
                {
                    "status": item.status,
                    "remarks": item.remarks,
                    "changed_by": (
                        item.changed_by.username
                        if item.changed_by
                        else None
                    ),
                    "changed_at": item.changed_at,
                }
            )

        status_progress = {
            "Pending": 10,
            "Processing": 40,
            "Shipped": 75,
            "Delivered": 100,
            "Cancelled": 0,
        }

        progress = status_progress.get(
            order.status,
            0,
        )

        stages = [
            {
                "title": "Pending",
                "completed": order.status in [
                    "Pending",
                    "Processing",
                    "Shipped",
                    "Delivered",
                ],
            },
            {
                "title": "Processing",
                "completed": order.status in [
                    "Processing",
                    "Shipped",
                    "Delivered",
                ],
            },
            {
                "title": "Shipped",
                "completed": order.status in [
                    "Shipped",
                    "Delivered",
                ],
            },
            {
                "title": "Delivered",
                "completed": (
                    order.status == "Delivered"
                ),
            },
        ]

        estimated_delivery = (
            order.created_at +
            timedelta(days=5)
        ).strftime("%d-%m-%Y")

        payment_status = None

        try:
            payment_status = order.payment.status
        except Exception:
            payment_status = None

        return success_response(
            data={
                "order_number": order.order_number,
                "current_status": order.status,
                "progress": progress,
                "estimated_delivery": (
                    estimated_delivery
                ),
                "payment_method": (
                    order.payment_method
                ),
                "payment_status": payment_status,
                "grand_total": order.grand_total,
                "created_at": order.created_at,
                "stages": stages,
                "timeline": history_data,
            },
            message=(
                "Order tracking fetched successfully."
            ),
        )

    @action(
        detail=True,
        methods=["post"],
    )
    def cancel(self, request, pk=None):

        with transaction.atomic():

            order = (
                Order.objects
                .select_for_update()
                .get(pk=pk)
            )

            if order.user != request.user:
                return error_response(
                    message="You do not have permission to cancel this order.",
                    status=403,
                )

            if order.status not in [
                "Pending",
                "Confirmed",
            ]:
                return error_response(
                    message="Order cannot be cancelled at this stage.",
                    status=400,
                )

            if order.stock_deducted:

                items = (
                    order.items
                    .select_related("product")
                    .select_for_update()
                    .order_by("product_id")
                )

                for item in items:

                    item.product.stock += item.quantity

                    item.product.save(
                        update_fields=["stock"]
                    )

                order.stock_deducted = False

            order.status = "Cancelled"

            order.save(
                update_fields=[
                    "status",
                    "stock_deducted",
                ]
            )

            OrderStatusHistory.objects.create(
                order=order,
                status="Cancelled",
                remarks="Cancelled by customer",
                changed_by=request.user,
            )

        return success_response(
            message="Order cancelled successfully."
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsStaffMember],
    )
    def update_status(self, request, pk=None):

        new_status = request.data.get("status")

        remarks = request.data.get(
            "remarks",
            "",
        ).strip()

        valid_status = [
            "Pending",
            "Confirmed",
            "Processing",
            "Shipped",
            "Out for Delivery",
            "Delivered",
            "Cancelled",
        ]

        if new_status not in valid_status:
            return Response(
                {
                    "error": "Invalid order status."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():

            order = (
                Order.objects
                .select_for_update()
                .get(pk=pk)
            )

            current_status = order.status

            if new_status == current_status:
                return Response(
                    {
                        "error": (
                            f"Order is already "
                            f"{current_status}."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            allowed_transitions = {
                "Pending": {
                    "Confirmed",
                    "Cancelled",
                },
                "Confirmed": {
                    "Processing",
                    "Cancelled",
                },
                "Processing": {
                    "Shipped",
                },
                "Shipped": {
                    "Out for Delivery",
                },
                "Out for Delivery": {
                    "Delivered",
                },
                "Delivered": set(),
                "Cancelled": set(),
            }

            if new_status not in allowed_transitions.get(
                current_status,
                set(),
            ):
                return Response(
                    {
                        "error": (
                            f"Cannot change order status "
                            f"from {current_status} "
                            f"to {new_status}."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            order.status = new_status

            order.save(
                update_fields=["status"]
            )

            OrderStatusHistory.objects.create(
                order=order,
                status=new_status,
                remarks=(
                    remarks
                    or f"Status changed to {new_status}"
                ),
                changed_by=request.user,
            )

        return success_response(
            data={
                "order_number": order.order_number,
                "status": order.status,
            },
            message="Order status updated successfully.",
        )

    @action(
        detail=True,
        methods=["post"],
    )
    def return_request(
        self,
        request,
        pk=None,
    ):

        # Keep object-level permission checking.
        self.get_object()

        images = request.FILES.getlist("images")

        if len(images) > 5:
            return error_response(
                message="You can upload a maximum of 5 images.",
                status=400,
            )

        serializer = ReturnRequestSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        with transaction.atomic():

            # Lock the order so concurrent return requests
            # for the same order are processed one at a time.
            order = (
                Order.objects
                .select_for_update()
                .get(pk=pk)
            )

            if order.status != "Delivered":
                return error_response(
                    message=(
                        "Only delivered orders can be returned."
                    ),
                    status=400,
                )

            # -------------------------------------------------
            # 48 HOURS RETURN WINDOW
            # -------------------------------------------------

            delivered_history = (
                order.status_history
                .filter(status="Delivered")
                .order_by("-changed_at")
                .first()
            )

            if not delivered_history:
                return error_response(
                    message=(
                        "Delivery time could not be determined."
                    ),
                    status=400,
                )

            delivered_at = delivered_history.changed_at
            now = timezone.now()

            return_deadline = (
                delivered_at + timedelta(hours=48)
            )

            # -------------------------------------------------
            # RETURN WINDOW EXPIRED
            # -------------------------------------------------

            if now > return_deadline:
                return error_response(
                    message=(
                        "Return period has expired. "
                        "Returns are only accepted within "
                        "48 hours of delivery."
                    ),
                    status=400,
                )

            # -------------------------------------------------
            # CHECK EXISTING RETURN REQUEST
            # -------------------------------------------------

            if ReturnRequest.objects.filter(
                order=order
            ).exists():
                return error_response(
                    message=(
                        "Return request already exists."
                    ),
                    status=400,
                )

            # -------------------------------------------------
            # CREATE RETURN REQUEST + IMAGES ATOMICALLY
            # -------------------------------------------------

            return_request = serializer.save(
                order=order
            )

            for image in images:

                ReturnRequestImage.objects.create(
                    return_request=return_request,
                    image=image,
                )

        return_images = list(
            return_request.images.all()
        )

        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        return success_response(
            data={
                "return_request_id": return_request.id,
                "order_number": order.order_number,
                "status": return_request.status,
                "delivered_at": delivered_at,
                "return_deadline": return_deadline,
                "hours_remaining": max(
                    0,
                    int(
                        (
                            return_deadline - now
                        ).total_seconds() / 3600
                    ),
                ),
                "images": ReturnRequestImageSerializer(
                    return_images,
                    many=True,
                    context={
                        "request": request,
                    },
                ).data,
            },
            message=(
                "Return request submitted "
                "successfully."
            ),
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAdmin],
    )
    def approve_return(
        self,
        request,
        pk=None,
    ):

        with transaction.atomic():

            order = (
                Order.objects
                .select_for_update()
                .get(pk=pk)
            )

            try:
                return_request = (
                    ReturnRequest.objects
                    .select_for_update()
                    .get(order=order)
                )
            except ReturnRequest.DoesNotExist:
                return error_response(
                    message="Return request not found.",
                    status=404,
                )

            if Refund.objects.filter(
                return_request=return_request
            ).exists():
                return error_response(
                    message="Refund already exists.",
                    status=400,
                )

            if return_request.status != "Pending":
                return error_response(
                    message=(
                        "Return request cannot be approved "
                        f"because it is already "
                        f"{return_request.status}."
                    ),
                    status=400,
                )

            return_request.status = "Approved"

            return_request.save(
                update_fields=["status"]
            )

            refund = Refund.objects.create(
                return_request=return_request,
                amount=order.grand_total,
                status="Completed",
                refunded_at=timezone.now(),
            )

        serializer = RefundSerializer(refund)

        return success_response(
            data=serializer.data,
            message="Return request approved successfully.",
        )
    
    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAdmin],
    )
    def reject_return(
        self,
        request,
        pk=None,
    ):

        with transaction.atomic():

            order = (
                Order.objects
                .select_for_update()
                .get(pk=pk)
            )

            try:
                return_request = (
                    ReturnRequest.objects
                    .select_for_update()
                    .get(order=order)
                )
            except ReturnRequest.DoesNotExist:
                return error_response(
                    message="Return request not found.",
                    status=404,
                )

            if return_request.status != "Pending":
                return error_response(
                    message=(
                        "Return request cannot be rejected "
                        f"because it is already "
                        f"{return_request.status}."
                    ),
                    status=400,
                )

            return_request.status = "Rejected"

            return_request.save(
                update_fields=["status"]
            )

        return success_response(
            message="Return request rejected successfully."
        )
            # -------------------------------------------------
        # REFUNDS
        # -------------------------------------------------

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[IsAdmin],
    )
    def refunds(
        self,
        request,
    ):

        refunds = (
            Refund.objects
            .select_related(
                "return_request",
                "return_request__order",
            )
            .order_by("-id")
        )

        # -----------------------------------------
        # PAGINATION
        # -----------------------------------------

        paginator = self.pagination_class()

        page = paginator.paginate_queryset(
            refunds,
            request,
            view=self,
        )

        serializer = RefundSerializer(
            page,
            many=True,
        )

        return paginator.get_paginated_response(
            serializer.data
        )

        # -------------------------------------------------
        # PENDING RETURNS
        # -------------------------------------------------

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[IsAdmin],
    )
    def pending_returns(
        self,
        request,
    ):

        returns = (
            ReturnRequest.objects
            .filter(status="Pending")
            .select_related(
                "order",
                "order__user",
                "order__shipping_address",
            )
            .prefetch_related(
                "images"
            )
            .order_by("-created_at")
        )

        # -----------------------------------------
        # PAGINATION
        # -----------------------------------------

        paginator = self.pagination_class()

        page = paginator.paginate_queryset(
            returns,
            request,
            view=self,
        )

        serializer = ReturnRequestSerializer(
            page,
            many=True,
            context={
                "request": request,
            },
        )

        return paginator.get_paginated_response(
            serializer.data
        )

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[IsAdmin],
    )
    def refund_summary(
        self,
        request,
    ):

        summary = (
            Refund.objects
            .aggregate(
                total=Count("id"),
                completed=Count(
                    "id",
                    filter=Q(status="Completed"),
                ),
                pending=Count(
                    "id",
                    filter=Q(status="Pending"),
                ),
                rejected=Count(
                    "id",
                    filter=Q(status="Rejected"),
                ),
                total_amount=Sum(
                    "amount",
                    filter=Q(status="Completed"),
                ),
            )
        )

        total_amount = (
            summary["total_amount"]
            or Decimal("0.00")
        )

        return success_response(
            data={
                "total_refunds": summary["total"],
                "completed": summary["completed"],
                "pending": summary["pending"],
                "rejected": summary["rejected"],
                "total_amount": total_amount,
            },
            message=(
                "Refund summary fetched successfully."
            ),
        )

    @action(
        detail=False,
        methods=["get"],
        url_path="my_orders",
    )
    def my_orders(
        self,
        request,
    ):

        orders = (
            Order.objects
            .filter(user=request.user)
            .select_related(
                "user",
                "shipping_address",
                "coupon",
                "payment",
            )
            .prefetch_related(
                Prefetch(
                    "items",
                    queryset=OrderItem.objects.select_related("product"),
                ),
                Prefetch(
                    "status_history",
                    queryset=OrderStatusHistory.objects.select_related("changed_by"),
                ),
            )
            .order_by("-created_at")
        )

        # -----------------------------------------
        # PAGINATION
        # -----------------------------------------

        paginator = self.pagination_class()

        page = paginator.paginate_queryset(
            orders,
            request,
            view=self,
        )

        serializer = self.get_serializer(
            page,
            many=True,
        )

        return paginator.get_paginated_response(
            serializer.data
        )

        # -------------------------------------------------
        # ADMIN ORDERS
        # -------------------------------------------------

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[IsStaffMember],
        url_path="admin-orders",
    )
    def admin_orders(
        self,
        request,
    ):

        orders = (
            Order.objects
            .select_related(
                "user",
                "shipping_address",
                "coupon",
                "payment",
            )
            .prefetch_related(
                Prefetch(
                    "items",
                    queryset=OrderItem.objects.select_related("product"),
                ),
                Prefetch(
                    "status_history",
                    queryset=OrderStatusHistory.objects.select_related("changed_by"),
                ),
            )
            .order_by("-created_at")
        )

        # -----------------------------------------
        # PAGINATION
        # -----------------------------------------

        paginator = self.pagination_class()

        page = paginator.paginate_queryset(
            orders,
            request,
            view=self,
        )

        serializer = self.get_serializer(
            page,
            many=True,
        )

        return paginator.get_paginated_response(
            serializer.data
        )

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[IsAdmin],
        url_path="admin-customers",
    )
    def admin_customers(self, request):

        from django.contrib.auth import get_user_model

        User = get_user_model()

        customers = (
            User.objects
            .filter(is_staff=False)
            .annotate(
                total_orders=Count(
                    "orders",
                    distinct=True,
                ),
                total_spent=Sum(
                    "orders__grand_total",
                    filter=Q(
                        orders__status="Delivered"
                    ),
                ),
            )
            .order_by("-date_joined")
        )

        # -----------------------------------------
        # PAGINATION
        # -----------------------------------------

        paginator = self.pagination_class()

        page = paginator.paginate_queryset(
            customers,
            request,
            view=self,
        )

        data = []

        for customer in page:

            data.append({
                "id": customer.id,
                "username": customer.username,
                "email": customer.email,
                "first_name": customer.first_name,
                "last_name": customer.last_name,
                "date_joined": customer.date_joined,
                "total_orders": customer.total_orders,
                "total_spent": (
                    customer.total_spent
                    or Decimal("0.00")
                ),
            })

        return paginator.get_paginated_response(
            data
        )


    def recalculate_order_total(
        self,
        order,
    ):

        total = (
            order.items
            .aggregate(
                total=Sum(
                    F("price") * F("quantity")
                )
            )
            .get("total")
            or Decimal("0.00")
        )

        # -----------------------------------------
        # SHIPPING CHARGE
        # -----------------------------------------

        shipping_charge = (
            ShippingCharge.objects
            .filter(
                district__iexact=order.shipping_address.district,
                is_active=True,
            )
            .first()
        )

        if shipping_charge:
            delivery_charge = shipping_charge.charge
        else:
            delivery_charge = Decimal("0.00")

        # -----------------------------------------
        # COUPON DISCOUNT
        # -----------------------------------------

        discount_amount = Decimal("0.00")

        if order.coupon:
            coupon = order.coupon

            discount_amount = (
                total
                * Decimal(coupon.discount)
                / Decimal("100")
            )

            discount_amount = min(
                discount_amount,
                total,
            )

        # -----------------------------------------
        # TOTAL
        # -----------------------------------------

        order.total_price = total
        order.discount_amount = discount_amount
        order.delivery_charge = delivery_charge

        order.grand_total = (
            total
            - discount_amount
            + delivery_charge
        )

        order.save(
            update_fields=[
                "total_price",
                "discount_amount",
                "delivery_charge",
                "grand_total",
                "updated_at",
            ]
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="add-item",
    )
    def add_item(self, request, pk=None):

        # -----------------------------------------
        # VALIDATE QUANTITY
        # -----------------------------------------

        product_id = request.data.get("product_id")
        quantity = request.data.get("quantity", 1)

        if not product_id:
            return error_response(
                message="Product is required.",
                status=400,
            )

        try:
            quantity = int(quantity)

            if quantity <= 0:
                raise ValueError

        except (TypeError, ValueError):

            return error_response(
                message="Invalid quantity.",
                status=400,
            )

        # -----------------------------------------
        # TRANSACTION
        # -----------------------------------------

        try:
            order = self.get_object()

            with transaction.atomic():

                # Get order inside transaction
                order = (
                    Order.objects
                    .select_for_update()
                    .select_related(
                        "shipping_address",
                        "coupon",
                    )
                    .get(pk=pk)
                )

                # ---------------------------------
                # ORDER STATUS
                # ---------------------------------

                if order.status != "Pending":

                    return error_response(
                        message=(
                            "Products can only be "
                            "added to pending orders."
                        ),
                        status=400,
                    )

                # ---------------------------------
                # LOCK ACTIVE PRODUCT
                # ---------------------------------

                try:

                    product = (
                        Product.objects
                        .select_for_update()
                        .get(
                            pk = product_id,
                            is_active=True,
                            )
                    )

                except Product.DoesNotExist:
                    return error_response(
                        message="Product not found.",
                        status=404,
                    )

                # ---------------------------------
                # STOCK CHECK
                # ---------------------------------

                if product.stock < quantity:

                    return error_response(
                        message=(
                            f"Only {product.stock} "
                            f"items available."
                        ),
                        status=400,
                    )

                # ---------------------------------
                # EXISTING ORDER ITEM
                # ---------------------------------

                existing_item = (
                    OrderItem.objects
                    .select_for_update()
                    .filter(
                        order=order,
                        product=product,
                    )
                    .first()
                )
                # ---------------------------------
                # UPDATE / CREATE
                # ---------------------------------

                if existing_item:

                    existing_item.quantity += quantity

                    existing_item.save(
                        update_fields=[
                            "quantity"
                        ]
                    )

                else:

                    price = product.price

                    if (
                        hasattr(
                            product,
                            "discount_price",
                        )
                        and product.discount_price
                        and product.discount_price
                        < product.price
                    ):
                        price = product.discount_price

                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=quantity,
                        price=price,
                    )

                # ---------------------------------
                # REDUCE STOCK
                # ---------------------------------

                product.stock -= quantity

                product.save(
                    update_fields=[
                        "stock"
                    ]
                )

                # ---------------------------------
                # RECALCULATE TOTAL
                # ---------------------------------

                self.recalculate_order_total(order)

        except Order.DoesNotExist:

            return error_response(
                message="Order not found.",
                status=404,
            )

        except Exception as exc:

            logger.exception(
                "Add item failed for order %s: %s",
                pk,
                exc,
            )

            return error_response(
                message="Unable to add product to order.",
                status=500,
            )

        return success_response(
            message="Product added to order successfully."
        )

    @action(
        detail=True,
        methods=["delete"],
        url_path="remove-item",
    )
    def remove_item(self, request, pk=None):

        # Keep object-level permission checking.
        self.get_object()

        item_id = request.data.get(
            "item_id"
        )

        if not item_id:
            return error_response(
                message="Order item is required.",
                status=400,
            )

        try:

            with transaction.atomic():

                # Lock the order so concurrent cart modifications
                # for the same order are processed one at a time.
                order = (
                    Order.objects
                    .select_for_update()
                    .select_related(
                        "shipping_address",
                        "coupon",
                    )
                    .get(pk=pk)
                )
                if order.status != "Pending":
                    return error_response(
                        message=(
                            "Products can only be removed "
                            "from pending orders."
                        ),
                        status=400,
                    )

                item = (
                    order.items
                    .select_for_update()
                    .get(
                        id=item_id
                    )
                )

                # Return stock
                product = (
                    Product.objects
                    .select_for_update()
                    .get(
                        pk=item.product_id
                    )
                )

                product.stock += item.quantity

                product.save(
                    update_fields=[
                        "stock"
                    ]
                )

                item.delete()

                self.recalculate_order_total(
                    order
                )

        except OrderItem.DoesNotExist:

            return error_response(
                message="Order item not found.",
                status=404,
            )

        return success_response(
            message="Product removed from order successfully."
        )

    @action(
        detail=True,
        methods=["patch"],
        url_path="update-item",
    )
    def update_item(self, request, pk=None):

        # Keep object-level permission checking.
        self.get_object()

        item_id = request.data.get("item_id")
        quantity = request.data.get("quantity")

        # -----------------------------------------
        # VALIDATION
        # -----------------------------------------

        if not item_id:
            return error_response(
                message="Order item is required.",
                status=400,
            )

        if quantity is None:
            return error_response(
                message="Quantity is required.",
                status=400,
            )

        try:

            quantity = int(quantity)

            if quantity <= 0:
                raise ValueError

        except (TypeError, ValueError):

            return error_response(
                message="Invalid quantity.",
                status=400,
            )

        # -----------------------------------------
        # TRANSACTION
        # -----------------------------------------

        try:

            with transaction.atomic():

                # Lock order before checking its status.
                order = (
                    Order.objects
                    .select_for_update()
                    .select_related(
                        "shipping_address",
                        "coupon",
                    )
                    .get(pk=pk)
                )

                # -----------------------------------------
                # ORDER STATUS CHECK
                # -----------------------------------------

                if order.status != "Pending":
                    return error_response(
                        message=(
                            "Products can only be updated "
                            "in pending orders."
                        ),
                        status=400,
                    )

                # -----------------------------------------
                # LOCK ORDER ITEM
                # -----------------------------------------

                try:

                    item = (
                        OrderItem.objects
                        .select_for_update()
                        .get(
                            id=item_id,
                            order=order,
                        )
                    )

                except OrderItem.DoesNotExist:

                    return error_response(
                        message="Order item not found.",
                        status=404,
                    )

                # -----------------------------------------
                # LOCK PRODUCT
                # -----------------------------------------

                product = (
                    Product.objects
                    .select_for_update()
                    .get(
                        pk=item.product_id
                    )
                )

                old_quantity = item.quantity

                # -----------------------------------------
                # SAME QUANTITY
                # -----------------------------------------

                if old_quantity == quantity:

                    return success_response(
                        message=(
                            "Quantity is already "
                            "set to this value."
                        )
                    )

                # -----------------------------------------
                # INCREASE QUANTITY
                # -----------------------------------------

                if quantity > old_quantity:

                    additional_quantity = (
                        quantity - old_quantity
                    )

                    if product.stock < additional_quantity:

                        return error_response(
                            message=(
                                f"Only {product.stock} "
                                f"additional items "
                                f"available."
                            ),
                            status=400,
                        )

                    product.stock -= additional_quantity

                # -----------------------------------------
                # DECREASE QUANTITY
                # -----------------------------------------

                else:

                    returned_quantity = (
                        old_quantity - quantity
                    )

                    product.stock += returned_quantity

                # -----------------------------------------
                # SAVE
                # -----------------------------------------

                item.quantity = quantity

                item.save(
                    update_fields=[
                        "quantity"
                    ]
                )

                product.save(
                    update_fields=[
                        "stock"
                    ]
                )

                # -----------------------------------------
                # RECALCULATE TOTAL
                # -----------------------------------------

                self.recalculate_order_total(
                    order
                )

        except Order.DoesNotExist:

            return error_response(
                message="Order not found.",
                status=404,
            )

        except Product.DoesNotExist:

            return error_response(
                message="Product not found.",
                status=404,
            )

        except Exception as exc:

            logger.exception(
                "Update order item failed for order %s: %s",
                pk,
                exc,
            )

            return error_response(
                message="Unable to update order item.",
                status=500,
            )

        return success_response(
            message="Order item quantity updated successfully."
        )


class ShippingAddressViewSet(viewsets.ModelViewSet):
    serializer_class = (
        ShippingAddressSerializer
    )

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return ShippingAddress.objects.filter(
            user=self.request.user
        )

    def perform_create(
        self,
        serializer,
    ):

        serializer.save(
            user=self.request.user
        )