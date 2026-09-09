from django.db.models import Sum
from rest_framework.decorators import api_view
from apps.core.permissions import IsStaffMember
from rest_framework.decorators import permission_classes
from rest_framework.response import Response
from apps.orders.models import Order
from apps.accounts.models import User
from apps.payments.models import Payment
from apps.invoices.models import Invoice
from django.db.models import Count, Sum, F
from django.db.models.functions import TruncMonth
from apps.orders.models import OrderItem
from django.utils import timezone
from datetime import timedelta
from apps.products.models import Product
from django.shortcuts import get_object_or_404
from apps.orders.models import Order, OrderStatusHistory


@api_view(["GET"])
@permission_classes([IsStaffMember])
def dashboard_stats(request):

    total_orders = Order.objects.count()

    pending_orders = Order.objects.filter(
        status="Pending"
    ).count()

    delivered_orders = Order.objects.filter(
        status="Delivered"
    ).count()

    total_products = Product.objects.count()

    total_customers = User.objects.filter(
        is_staff=False
    ).count()

    revenue = (
        Order.objects.filter(
            status__in=[
                "Confirmed",
                "Processing",
                "Shipped",
                "Out for Delivery",
                "Delivered",
            ]
        )
        .aggregate(total=Sum("grand_total"))
        .get("total")
        or 0
    )

    return Response({
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "delivered_orders": delivered_orders,
        "total_products": total_products,
        "total_customers": total_customers,
        "revenue": revenue,
    })
@api_view(["GET"])
@permission_classes([IsStaffMember])
def monthly_sales(request):

    sales = (
        Order.objects.filter(status__in=["Confirmed","Processing","Shipped","Out for Delivery","Delivered"])
        .annotate(month=TruncMonth("created_at"))
        .values("month")
        .annotate(
            revenue=Sum("grand_total")
        )
        .order_by("month")
    )

    return Response(sales)


@api_view(["GET"])
@permission_classes([IsStaffMember])
def sales_report(request):
    sales = (
        Order.objects
        .filter(status__in=["Confirmed","Processing","Shipped","Out for Delivery","Delivered"])
        .annotate(month=TruncMonth("created_at"))
        .values("month")
        .annotate(
            orders=Count("id"),
            revenue=Sum("grand_total"),
        )
        .order_by("month")
    )

    data = []

    for item in sales:
        data.append({
            "month": item["month"],
            "orders": item["orders"],
            "revenue": float(item["revenue"] or 0),
        })

    return Response(data)

@api_view(["GET"])
@permission_classes([IsStaffMember])
def top_products(request):
    """Top selling products by quantity sold."""
    from django.db.models import DecimalField, ExpressionWrapper

    products = (
        OrderItem.objects
        .values("product_id", "product__name")
        .annotate(
            sold=Sum("quantity"),
            revenue=Sum(
                ExpressionWrapper(
                    F("quantity") * F("price"),
                    output_field=DecimalField(max_digits=14, decimal_places=2),
                )
            ),
        )
        .order_by("-sold")[:10]
    )

    data = []
    for p in products:
        sold = p.get("sold") or 0
        revenue = p.get("revenue") or 0
        data.append({
            "name": p.get("product__name") or "Unknown",
            "product_id": p.get("product_id"),
            "sold": sold,
            "revenue": float(revenue),
            "total_sold": sold,
            "total_revenue": float(revenue),
        })
    return Response(data)

@api_view(["GET"])
@permission_classes([IsStaffMember])
def revenue_analytics(request):
    """
    Revenue analytics.
    Counts orders that are confirmed or further (not Pending/Cancelled).
    """
    today = timezone.now()

    # Realistic revenue statuses (not only Delivered)
    REVENUE_STATUSES = [
        "Confirmed",
        "Processing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
    ]

    base_orders = Order.objects.filter(status__in=REVENUE_STATUSES)

    def sum_revenue(qs):
        return float(qs.aggregate(total=Sum("grand_total"))["total"] or 0)

    def count_orders(qs):
        return qs.count()

    today_qs = base_orders.filter(created_at__date=today.date())
    last_7_qs = base_orders.filter(created_at__gte=today - timedelta(days=7))
    last_30_qs = base_orders.filter(created_at__gte=today - timedelta(days=30))
    last_6m_qs = base_orders.filter(created_at__gte=today - timedelta(days=180))
    last_year_qs = base_orders.filter(created_at__gte=today - timedelta(days=365))

    today_revenue = sum_revenue(today_qs)
    last_7_days = sum_revenue(last_7_qs)
    last_30_days = sum_revenue(last_30_qs)
    last_6_months = sum_revenue(last_6m_qs)
    last_year = sum_revenue(last_year_qs)
    total_revenue = sum_revenue(base_orders)

    # Previous 30 days for growth calculation
    prev_30_qs = base_orders.filter(
        created_at__gte=today - timedelta(days=60),
        created_at__lt=today - timedelta(days=30),
    )
    prev_30_revenue = sum_revenue(prev_30_qs)

    if prev_30_revenue > 0:
        growth = round(((last_30_days - prev_30_revenue) / prev_30_revenue) * 100, 2)
    else:
        growth = 100.0 if last_30_days > 0 else 0.0

    total_orders_count = count_orders(base_orders)
    avg_order = round(total_revenue / total_orders_count, 2) if total_orders_count else 0

    return Response({
        # Period breakdown
        "today": today_revenue,
        "last_7_days": last_7_days,
        "last_30_days": last_30_days,
        "last_6_months": last_6_months,
        "last_year": last_year,
        "total_revenue": total_revenue,

        # Aliases the frontend already looks for
        "revenue": total_revenue,
        "totalRevenue": total_revenue,
        "amount": total_revenue,

        # Extra useful fields
        "orders": total_orders_count,
        "total_orders": total_orders_count,
        "orders_last_30_days": count_orders(last_30_qs),
        "average_order_value": avg_order,
        "averageOrderValue": avg_order,
        "avg_order_value": avg_order,
        "growth": growth,
        "revenue_growth": growth,
        "growth_percentage": growth,
    })
    
@api_view(["GET"])
@permission_classes([IsStaffMember])
def low_stock_products(request):

    products = (
        Product.objects.filter(
            stock__lte=5,
            is_active=True
        )
        .values(
            "id",
            "name",
            "stock",
        )
    )

    return Response(products)

@api_view(["GET"])
@permission_classes([IsStaffMember])
def recent_orders(request):

    orders = (
        Order.objects
        .select_related("user")
        .order_by("-created_at")[:10]
        .values(
            "id",
            "user__username",
            "grand_total",
            "status",
            "created_at",
        )
    )

    return Response(orders)

@api_view(["GET"])
@permission_classes([IsStaffMember])
def order_status_summary(request):

    summary = (
        Order.objects
        .values("status")
        .annotate(
            total=Count("id")
        )
    )
    return Response(summary)

@api_view(["GET"])
@permission_classes([IsStaffMember])
def top_customers(request):

    customers = (
        Order.objects.filter(status__in=["Confirmed","Processing","Shipped","Out for Delivery","Delivered"])
        .values(username=F("user__username"))
        .annotate(
            orders=Count("id"),
            spent=Sum("grand_total")
        )
        .order_by("-spent")[:10]
    )

    return Response(customers)

@api_view(["GET"])
@permission_classes([IsStaffMember])
def inventory(request):

    products = Product.objects.all().values(
        "id",
        "name",
        "brand",
        "category__name",
        "sku",
        "price",
        "stock",
        "is_active",
    )

    data = []

    for product in products:

        stock = product["stock"] or 0

        if stock == 0:
            status = "Out of Stock"

        elif stock <= 5:
            status = "Low Stock"

        else:
            status = "In Stock"

        data.append({
            "id": product["id"],
            "name": product["name"],
            "brand": product["brand"],
            "category": product["category__name"],
            "sku": product["sku"],
            "price": product["price"],
            "stock": stock,
            "status": status,
            "is_active": product["is_active"],
        })

    return Response(data)

@api_view(["POST"])
@permission_classes([IsStaffMember])
def update_inventory(request, id):

    try:
        product = Product.objects.get(id=id)

    except Product.DoesNotExist:
        return Response(
            {"error": "Product not found"},
            status=404
        )

    # Stock update
    if "stock" in request.data:

        try:
            stock = int(request.data["stock"])

        except (ValueError, TypeError):
            return Response(
                {"error": "Stock must be a number"},
                status=400
            )

        if stock < 0:
            return Response(
                {"error": "Stock cannot be negative"},
                status=400
            )

        product.stock = stock

    # Active / Inactive update
    if "is_active" in request.data:

        product.is_active = bool(
            request.data["is_active"]
        )

    product.save()

    # Calculate stock status
    if product.stock == 0:
        stock_status = "Out of Stock"

    elif product.stock <= 5:
        stock_status = "Low Stock"

    else:
        stock_status = "In Stock"

    return Response({
        "message": "Product updated successfully",

        "id": product.id,

        "stock": product.stock,

        "status": stock_status,

        "is_active": product.is_active,
    })

@api_view(["GET"])
@permission_classes([IsStaffMember])
def recent_activity(request):

    activities = []

    recent_orders = (
        Order.objects
        .select_related("user")
        .order_by("-created_at")[:10]
    )

    for order in recent_orders:

        activities.append({
            "title": "New Order",
            "description": (
                f"Order #{order.id} placed by "
                f"{order.user.username}"
            ),
            "time": order.created_at,
        })

    return Response(activities)

@api_view(["GET"])
@permission_classes([IsStaffMember])
def admin_orders(request):

    orders = (
        Order.objects
        .select_related("user", "shipping_address")
        .prefetch_related("items__product")
        .order_by("-created_at")
    )

    data = []

    for order in orders:
        data.append({
            "id": order.id,
            "order_number": order.order_number,
            "customer": {
                "id": order.user.id,
                "username": order.user.username,
                "email": order.user.email,
            },
            "payment_method": order.payment_method,
            "total_price": order.total_price,
            "delivery_charge": order.delivery_charge,
            "grand_total": order.grand_total,
            "status": order.status,
            "created_at": order.created_at,
            "items_count": order.items.count(),
        })

    return Response(data)


@api_view(["GET"])
@permission_classes([IsStaffMember])
def admin_order_detail(request, id):

    try:
        order = (
            Order.objects
            .select_related(
                "user",
                "shipping_address",
            )
            .prefetch_related(
                "items__product",
                "status_history__changed_by",
            )
            .get(id=id)
        )

    except Order.DoesNotExist:
        return Response(
            {"error": "Order not found"},
            status=404,
        )

    data = {
        "id": order.id,
        "order_number": order.order_number,

        "customer": {
            "id": order.user.id,
            "username": order.user.username,
            "email": order.user.email,
        },

        "shipping_address": None,

        "payment_method": order.payment_method,

        "total_price": order.total_price,
        "delivery_charge": order.delivery_charge,
        "grand_total": order.grand_total,

        "status": order.status,
        "created_at": order.created_at,

        "items": [],
        "status_history": [],
    }

    if order.shipping_address:
        data["shipping_address"] = {
            "full_name": order.shipping_address.full_name,
            "phone": order.shipping_address.phone,
            "address_line": order.shipping_address.address_line,
            "city": order.shipping_address.city,
            "district": order.shipping_address.district,
            "postal_code": order.shipping_address.postal_code,
            "country": order.shipping_address.country,
        }

    for item in order.items.all():

        data["items"].append({
            "id": item.id,
            "product": item.product.name,
            "quantity": item.quantity,
            "price": item.price,
            "subtotal": item.subtotal,
        })

    for history in order.status_history.all():

        data["status_history"].append({
            "status": history.status,
            "remarks": history.remarks,
            "changed_by": (
                history.changed_by.username
                if history.changed_by
                else None
            ),
            "changed_at": history.changed_at,
        })

    return Response(data)


@api_view(["POST"])
@permission_classes([IsStaffMember])
def update_order_status(request, id):

    order = get_object_or_404(Order, id=id)

    new_status = request.data.get("status")
    remarks = request.data.get("remarks", "")

    valid_statuses = [
        choice[0]
        for choice in Order.STATUS
    ]

    if new_status not in valid_statuses:
        return Response(
            {
                "error": "Invalid order status",
                "allowed_statuses": valid_statuses,
            },
            status=400,
        )

    old_status = order.status

    order.status = new_status
    order.save(update_fields=["status"])

    OrderStatusHistory.objects.create(
        order=order,
        status=new_status,
        remarks=remarks,
        changed_by=request.user,
    )

    return Response({
        "message": "Order status updated successfully",

        "order_id": order.id,

        "order_number": order.order_number,

        "old_status": old_status,

        "status": order.status,

        "remarks": remarks,
    })

@api_view(["GET"])
@permission_classes([IsStaffMember])
def dashboard_notifications(request):

    notifications = []

    recent_orders = (
        Order.objects
        .select_related("user")
        .order_by("-created_at")[:10]
    )

    for order in recent_orders:
        notifications.append({
            "title": "New Order",
            "description": (
                f"Order #{order.order_number} "
                f"placed by {order.user.username}"
            ),
            "time": order.created_at,
        })

    low_stock = Product.objects.filter(
        stock__lte=5,
        is_active=True
    )

    for product in low_stock:
        notifications.append({
            "title": "Low Stock",
            "description": (
                f"{product.name} has only "
                f"{product.stock} items left."
            ),
            "time": timezone.now(),
        })

    notifications.sort(
        key=lambda x: x["time"],
        reverse=True
    )

    return Response(notifications[:20])


@api_view(["GET"])
@permission_classes([IsStaffMember])
def export_orders(request):
    """Simple JSON export of orders for admin download."""
    from django.http import HttpResponse
    import csv
    import io

    qs = Order.objects.all().select_related("user").order_by("-created_at")[:5000]

    fmt = request.query_params.get("format", "json")

    if fmt == "csv":
        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow([
            "order_number", "username", "status", "payment_method",
            "total_price", "delivery_charge", "grand_total", "created_at",
        ])
        for o in qs:
            writer.writerow([
                o.order_number or "",
                getattr(o.user, "username", ""),
                o.status,
                o.payment_method,
                o.total_price,
                o.delivery_charge,
                o.grand_total,
                o.created_at.isoformat() if o.created_at else "",
            ])
        resp = HttpResponse(buffer.getvalue(), content_type="text/csv")
        resp["Content-Disposition"] = 'attachment; filename="orders_export.csv"'
        return resp

    data = [
        {
            "order_number": o.order_number,
            "username": getattr(o.user, "username", None),
            "status": o.status,
            "payment_method": o.payment_method,
            "total_price": float(o.total_price or 0),
            "delivery_charge": float(o.delivery_charge or 0),
            "grand_total": float(o.grand_total or 0),
            "created_at": o.created_at.isoformat() if o.created_at else None,
        }
        for o in qs
    ]
    return Response({"count": len(data), "results": data})

