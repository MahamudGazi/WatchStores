from django.urls import path

from .views import (
    export_orders,
    dashboard_stats,
    monthly_sales,
    sales_report,
    recent_activity,
    recent_orders,
    top_products,
    revenue_analytics,
    low_stock_products,
    order_status_summary,
    top_customers,
    inventory,
    update_inventory,
    admin_orders,
    admin_order_detail,
    update_order_status,
    dashboard_notifications,
)

urlpatterns = [
    # Dashboard
    path("stats/", dashboard_stats, name="dashboard-stats"),
    path("export/orders/", export_orders, name="export-orders"),
    path("monthly-sales/", monthly_sales, name="monthly-sales"),
    path("sales/", sales_report, name="sales-report"),
    path("revenue/", revenue_analytics, name="revenue-analytics"),
    path("order-status/", order_status_summary, name="order-status"),
    path("recent-activity/", recent_activity, name="recent-activity"),
    path("notifications/", dashboard_notifications, name="dashboard-notifications"),

    # Dashboard widgets
    path("recent-orders/", recent_orders, name="recent-orders"),
    path("top-products/", top_products, name="top-products"),
    path("top-customers/", top_customers, name="top-customers"),
    path("low-stock-products/", low_stock_products, name="low-stock-products"),

    # Inventory
    path("inventory/", inventory, name="inventory"),
    path(
        "inventory/<int:id>/",
        update_inventory,
        name="update-inventory",
    ),

    # Admin Orders
    path("orders/", admin_orders, name="admin-orders"),
    path(
        "orders/<int:id>/",
        admin_order_detail,
        name="admin-order-detail",
    ),
    path(
        "orders/<int:id>/update_status/",
        update_order_status,
        name="update-order-status",
    ),
]