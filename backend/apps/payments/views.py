from decimal import Decimal, InvalidOperation

from django.conf import settings
from django.db import transaction
from django.shortcuts import redirect

from rest_framework import viewsets
from rest_framework.decorators import (
    api_view,
    parser_classes,
    permission_classes,
)
from rest_framework.parsers import (
    BaseParser,
    FormParser,
    JSONParser,
    MultiPartParser,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.invoices.models import Invoice
from apps.orders.models import Order

from .models import Payment
from .serializers import PaymentSerializer
from .services import validate_payment, create_ssl_session


# =========================================================
# PLAIN TEXT PARSER
# =========================================================

class PlainTextParser(BaseParser):

    media_type = "text/plain"

    def parse(
        self,
        stream,
        media_type=None,
        parser_context=None,
    ):
        return stream.read().decode("utf-8")


# =========================================================
# COMMON PARSERS
# =========================================================

PAYMENT_PARSERS = [
    FormParser,
    MultiPartParser,
    JSONParser,
    PlainTextParser,
]


# =========================================================
# PAYMENT VIEWSET
# =========================================================

class PaymentViewSet(viewsets.ReadOnlyModelViewSet):

    serializer_class = PaymentSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return (
            Payment.objects
            .filter(
                order__user=self.request.user
            )
            .select_related("order")
        )


# =========================================================
# PAYMENT SUCCESS
# =========================================================

@api_view(["POST"])
@parser_classes(PAYMENT_PARSERS)
def payment_success(request):

    result = _process_success_payment(request)

    # -----------------------------------------------------
    # SUCCESS → REDIRECT TO FRONTEND
    # -----------------------------------------------------

    if (
        result.status_code == 200
        and result.data.get("success") is True
    ):

        order_number = result.data.get(
            "order_number"
        )

        return redirect(
            f"{settings.FRONTEND_URL.rstrip('/')}"
            f"/payment-success?order={order_number}"
        )

    # -----------------------------------------------------
    # VALIDATION FAILED
    # -----------------------------------------------------

    return result


# =========================================================
# PAYMENT IPN
# =========================================================

@api_view(["POST"])
@parser_classes(PAYMENT_PARSERS)
def payment_ipn(request):

    # IMPORTANT:
    # IPN is server-to-server.
    # NEVER redirect to frontend here.

    return _process_success_payment(request)


# =========================================================
# PROCESS SUCCESS PAYMENT
# =========================================================

def _process_success_payment(request):

    val_id = request.data.get("val_id")
    tran_id = request.data.get("tran_id")

    # -----------------------------------------------------
    # REQUIRED DATA
    # -----------------------------------------------------

    if not val_id or not tran_id:

        return Response(
            {
                "success": False,
                "error": (
                    "val_id and tran_id "
                    "are required"
                ),
            },
            status=400,
        )

    # -----------------------------------------------------
    # GET ORDER
    # -----------------------------------------------------

    try:

        with transaction.atomic():

            order = (
                Order.objects
                .select_for_update()
                .select_related("user")
                .get(
                    order_number=tran_id
                )
            )

            # -------------------------------------------------
            # GET PAYMENT
            # -------------------------------------------------

            try:

                payment = (
                    Payment.objects
                    .select_for_update()
                    .get(
                        order=order
                    )
                )

            except Payment.DoesNotExist:

                return Response(
                    {
                        "success": False,
                        "error": (
                            "Payment record "
                            "not found"
                        ),
                    },
                    status=404,
                )

            # -------------------------------------------------
            # PAYMENT METHOD CHECK
            # -------------------------------------------------

            if payment.method != "SSL":

                return Response(
                    {
                        "success": False,
                        "error": (
                            "Invalid payment method"
                        ),
                    },
                    status=400,
                )

            # -------------------------------------------------
            # DUPLICATE PAYMENT CHECK
            # -------------------------------------------------

            if payment.status == "Success":

                invoice = (
                    Invoice.objects
                    .filter(order=order)
                    .first()
                )

                return Response(
                    {
                        "success": True,
                        "message": (
                            "Payment already "
                            "completed"
                        ),
                        "order_number": (
                            order.order_number
                        ),
                        "transaction_id": (
                            payment.transaction_id
                        ),
                        "invoice_number": (
                            invoice.invoice_number
                            if invoice
                            else None
                        ),
                    }
                )

            # -------------------------------------------------
            # SSL VALIDATION
            # -------------------------------------------------

            try:

                validation = validate_payment(
                    val_id
                )

            except Exception as e:

                print(
                    "SSL VALIDATION ERROR:",
                    str(e)
                )

                return Response(
                    {
                        "success": False,
                        "error": (
                            "SSLCommerz "
                            "validation request failed"
                        ),
                    },
                    status=502,
                )

            # -------------------------------------------------
            # VALIDATION STATUS
            # -------------------------------------------------

            validation_status = validation.get(
                "status"
            )

            if validation_status not in [
                "VALID",
                "VALIDATED",
            ]:

                payment.status = "Failed"

                payment.save(
                    update_fields=[
                        "status"
                    ]
                )

                return Response(
                    {
                        "success": False,
                        "error": (
                            "Payment validation "
                            "failed"
                        ),
                    },
                    status=400,
                )

            # -------------------------------------------------
            # TRANSACTION ID CHECK
            # -------------------------------------------------

            ssl_tran_id = validation.get(
                "tran_id"
            )

            if ssl_tran_id != order.order_number:

                return Response(
                    {
                        "success": False,
                        "error": (
                            "Transaction ID "
                            "mismatch"
                        ),
                    },
                    status=400,
                )

            # -------------------------------------------------
            # CURRENCY VALIDATION
            # -------------------------------------------------

            validated_currency = validation.get(
                "currency"
            )

            if validated_currency != "BDT":

                return Response(
                    {
                        "success": False,
                        "error": (
                            "Payment currency "
                            "mismatch"
                        ),
                        "expected": "BDT",
                        "received": (
                            validated_currency
                        ),
                    },
                    status=400,
                )

            # -------------------------------------------------
            # AMOUNT VALIDATION
            # -------------------------------------------------

            try:

                validated_amount = Decimal(
                    str(
                        validation.get(
                            "amount"
                        )
                    )
                )

            except (
                InvalidOperation,
                TypeError,
                ValueError,
            ):

                return Response(
                    {
                        "success": False,
                        "error": (
                            "Invalid payment "
                            "amount"
                        ),
                    },
                    status=400,
                )

            order_amount = Decimal(
                str(
                    order.grand_total
                )
            )

            if validated_amount != order_amount:

                return Response(
                    {
                        "success": False,
                        "error": (
                            "Payment amount "
                            "mismatch"
                        ),
                        "expected": str(
                            order_amount
                        ),
                        "received": str(
                            validated_amount
                        ),
                    },
                    status=400,
                )

            # -------------------------------------------------
            # UPDATE PAYMENT
            # -------------------------------------------------

            payment.status = "Success"

            payment.transaction_id = (
                validation.get(
                    "bank_tran_id"
                )
                or validation.get(
                    "tran_id"
                )
            )

            payment.amount = (
                validated_amount
            )

            payment.save(
                update_fields=[
                    "status",
                    "transaction_id",
                    "amount",
                ]
            )

            # -------------------------------------------------
            # ORDER CONFIRMED
            # -------------------------------------------------

            order.status = "Confirmed"

            order.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

            # -------------------------------------------------
            # STOCK DEDUCTION
            # -------------------------------------------------

            if not order.stock_deducted:

                items = (
                    order.items
                    .select_related("product")
                    .all()
                )

                # ---------------------------------------------
                # FIRST CHECK ALL STOCK
                # ---------------------------------------------

                for item in items:

                    product = item.product

                    if (
                        product.stock
                        < item.quantity
                    ):

                        raise ValueError(
                            f"Insufficient stock "
                            f"for {product.name}"
                        )

                # ---------------------------------------------
                # THEN DEDUCT STOCK
                # ---------------------------------------------

                for item in items:

                    product = item.product

                    product.stock -= (
                        item.quantity
                    )

                    product.save(
                        update_fields=[
                            "stock"
                        ]
                    )

                # ---------------------------------------------
                # MARK STOCK DEDUCTED
                # ---------------------------------------------

                order.stock_deducted = True

                order.save(
                    update_fields=[
                        "stock_deducted",
                        "updated_at",
                    ]
                )

            # -------------------------------------------------
            # CREATE / GET INVOICE
            # -------------------------------------------------

            invoice, created = (
                Invoice.objects.get_or_create(
                    order=order,
                    defaults={
                        "invoice_number":
                            f"INV-{order.order_number}"
                    },
                )
            )

    # -----------------------------------------------------
    # STOCK ERROR
    # -----------------------------------------------------

    except ValueError as e:

        return Response(
            {
                "success": False,
                "error": str(e),
            },
            status=400,
        )

    # -----------------------------------------------------
    # ORDER NOT FOUND
    # -----------------------------------------------------

    except Order.DoesNotExist:

        return Response(
            {
                "success": False,
                "error": "Order not found",
            },
            status=404,
        )

    # -----------------------------------------------------
    # SUCCESS RESPONSE
    # -----------------------------------------------------

    return Response(
        {
            "success": True,
            "message": (
                "Payment Successful"
            ),
            "order_number": (
                order.order_number
            ),
            "transaction_id": (
                payment.transaction_id
            ),
            "payment_status": (
                payment.status
            ),
            "payment_amount": str(
                payment.amount
            ),
            "order_status": (
                order.status
            ),
            "stock_deducted": (
                order.stock_deducted
            ),
            "invoice_number": (
                invoice.invoice_number
            ),
        },
        status=200,
    )


# =========================================================
# PAYMENT FAIL
# =========================================================

@api_view(["POST"])
@parser_classes(PAYMENT_PARSERS)
def payment_fail(request):

    tran_id = request.data.get(
        "tran_id"
    )

    if not tran_id:

        return Response(
            {
                "success": False,
                "message": (
                    "Payment Failed"
                ),
            },
            status=400,
        )

    try:

        with transaction.atomic():

            order = (
                Order.objects
                .select_for_update()
                .get(
                    order_number=tran_id
                )
            )

            payment = (
                Payment.objects
                .select_for_update()
                .get(
                    order=order
                )
            )

            # ---------------------------------------------
            # DON'T OVERWRITE SUCCESS
            # ---------------------------------------------

            if payment.status == "Success":

                return Response(
                    {
                        "success": True,
                        "message": (
                            "Payment was already "
                            "successful"
                        ),
                        "order_number": (
                            order.order_number
                        ),
                    }
                )

            # ---------------------------------------------
            # PAYMENT FAILED
            # ---------------------------------------------

            payment.status = "Failed"

            payment.save(
                update_fields=[
                    "status"
                ]
            )

            # ---------------------------------------------
            # RESTORE STOCK
            # ---------------------------------------------

            if order.stock_deducted:

                for item in (
                    order.items
                    .select_related("product")
                ):

                    item.product.stock += (
                        item.quantity
                    )

                    item.product.save(
                        update_fields=[
                            "stock"
                        ]
                    )

                order.stock_deducted = False

            # ---------------------------------------------
            # ORDER CANCELLED
            # ---------------------------------------------

            order.status = "Cancelled"

            # IMPORTANT:
            # stock_deducted must also be saved.

            order.save(
                update_fields=[
                    "status",
                    "stock_deducted",
                    "updated_at",
                ]
            )

    except Order.DoesNotExist:

        return Response(
            {
                "success": False,
                "message": (
                    "Order not found"
                ),
            },
            status=404,
        )

    except Payment.DoesNotExist:

        return Response(
            {
                "success": False,
                "message": (
                    "Payment record not found"
                ),
            },
            status=404,
        )

    # -----------------------------------------------------
    # REDIRECT TO FRONTEND
    # -----------------------------------------------------

    return redirect(
        f"{settings.FRONTEND_URL.rstrip('/')}"
        f"/payment-failed?order={tran_id}"
    )


# =========================================================
# PAYMENT CANCEL
# =========================================================

@api_view(["POST"])
@parser_classes(PAYMENT_PARSERS)
def payment_cancel(request):

    tran_id = request.data.get(
        "tran_id"
    )

    if not tran_id:

        return Response(
            {
                "success": False,
                "message": (
                    "Payment Cancelled"
                ),
            },
            status=400,
        )

    try:

        with transaction.atomic():

            order = (
                Order.objects
                .select_for_update()
                .get(
                    order_number=tran_id
                )
            )

            payment = (
                Payment.objects
                .select_for_update()
                .get(
                    order=order
                )
            )

            # ---------------------------------------------
            # DON'T OVERWRITE SUCCESS
            # ---------------------------------------------

            if payment.status == "Success":

                return Response(
                    {
                        "success": True,
                        "message": (
                            "Payment was already "
                            "successful"
                        ),
                        "order_number": (
                            order.order_number
                        ),
                    }
                )

            # ---------------------------------------------
            # RESTORE STOCK
            # ---------------------------------------------

            if order.stock_deducted:

                for item in (
                    order.items
                    .select_related("product")
                ):

                    item.product.stock += (
                        item.quantity
                    )

                    item.product.save(
                        update_fields=[
                            "stock"
                        ]
                    )

                order.stock_deducted = False

            # ---------------------------------------------
            # ORDER CANCELLED
            # ---------------------------------------------

            order.status = "Cancelled"

            order.save(
                update_fields=[
                    "status",
                    "stock_deducted",
                    "updated_at",
                ]
            )

    except Order.DoesNotExist:

        return Response(
            {
                "success": False,
                "message": (
                    "Order not found"
                ),
            },
            status=404,
        )

    except Payment.DoesNotExist:

        return Response(
            {
                "success": False,
                "message": (
                    "Payment record not found"
                ),
            },
            status=404,
        )

    # -----------------------------------------------------
    # REDIRECT TO FRONTEND
    # -----------------------------------------------------

    return redirect(
        f"{settings.FRONTEND_URL.rstrip('/')}"
        f"/payment-cancelled?order={tran_id}"
    )


# =========================================================
# CREATE PAYMENT SESSION
# =========================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_payment_session(request):

    order_id = request.data.get(
        "order_id"
    )

    if not order_id:

        return Response(
            {
                "success": False,
                "error": "order_id is required",
            },
            status=400,
        )

    try:

        order = (
            Order.objects
            .select_related("user")
            .get(
                id=order_id,
                user=request.user,
            )
        )

    except Order.DoesNotExist:

        return Response(
            {
                "success": False,
                "error": "Order not found",
            },
            status=404,
        )

    try:

        result = create_ssl_session(
            order
        )

        return Response(
            result,
            status=200,
        )

    except Exception as e:

        print(
            "SSL SESSION ERROR:",
            str(e),
        )

        return Response(
            {
                "success": False,
                "error": (
                    "Unable to create "
                    "payment session"
                ),
            },
            status=502,
        )