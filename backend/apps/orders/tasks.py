from celery import shared_task

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

from apps.invoices.models import Invoice
from apps.invoices.utils import generate_invoice_pdf


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
)
def send_order_confirmation_email(
    self,
    order_id,
    invoice_id,
    user_id,
):
    from django.contrib.auth import get_user_model
    from apps.orders.models import Order

    User = get_user_model()

    order = (
        Order.objects
        .select_related(
            "user",
            "shipping_address",
        )
        .prefetch_related("items")
        .get(id=order_id)
    )

    invoice = Invoice.objects.get(
        id=invoice_id
    )

    user = User.objects.get(
        id=user_id
    )

    html_content = render_to_string(
        "emails/order_confirmation.html",
        {
            "user": user,
            "order": order,
            "invoice": invoice,
            "items": order.items.all(),
        },
    )

    email = EmailMultiAlternatives(
        subject=(
            f"Order Confirmation - "
            f"{order.order_number}"
        ),
        body=(
            "Your order has been placed successfully."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )

    email.attach_alternative(
        html_content,
        "text/html",
    )

    pdf = generate_invoice_pdf(invoice)

    email.attach(
        filename=f"{invoice.invoice_number}.pdf",
        content=pdf,
        mimetype="application/pdf",
    )

    email.send(
        fail_silently=False
    )

    return {
        "success": True,
        "order_number": order.order_number,
        "email": user.email,
    }