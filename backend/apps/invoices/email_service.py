from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

from .utils import generate_invoice_pdf


def send_invoice_email(invoice):
    """
    Send professional invoice email with PDF attachment.
    """

    order = invoice.order
    user = order.user

    subject = f"WatchStore Invoice - {invoice.invoice_number}"

    context = {
        "invoice": invoice,
        "order": order,
        "user": user,
    }

    html_content = render_to_string(
        "emails/invoice.html",
        context,
    )

    email = EmailMultiAlternatives(
        subject=subject,
        body="Please view this email in HTML format.",
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

    email.send()