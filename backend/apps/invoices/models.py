import uuid
import qrcode

from io import BytesIO

from django.db import models
from django.core.files import File
from django.utils import timezone
from django.conf import settings
from apps.orders.models import Order


class Invoice(models.Model):

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="invoice"
    )

    invoice_number = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        null=True,
    )

    qr_code = models.ImageField(
        upload_to="invoice_qr/",
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def save(self, *args, **kwargs):

        # Generate invoice number automatically
        if not self.invoice_number:

            year = timezone.now().year

            last_invoice = (
                Invoice.objects
                .filter(
                    created_at__year=year
                )
                .order_by("-id")
                .first()
            )

            if last_invoice:
                try:
                    last_number = int(
                        last_invoice.invoice_number.split("-")[-1]
                    )
                    next_number = last_number + 1
                except (ValueError, IndexError):
                    next_number = 1
            else:
                next_number = 1

            self.invoice_number = (
                f"INV-{year}-{next_number:06d}"
            )

        super().save(*args, **kwargs)

        # Generate QR code
        if not self.qr_code:

            qr = qrcode.make(
                f"{settings.BASE_URL.rstrip('/')}/"
                f"api/orders/track/"
                f"{self.order.order_number}/"
            )
            buffer = BytesIO()

            qr.save(
                buffer,
                format="PNG"
            )

            filename = (
                f"invoice_{self.invoice_number}.png"
            )

            self.qr_code.save(
                filename,
                File(buffer),
                save=False,
            )

            buffer.close()

            super().save(
                update_fields=["qr_code"]
            )

    def __str__(self):
        return self.invoice_number

