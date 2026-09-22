from django.http import HttpResponse
import os
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image,
)

from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.enums import TA_CENTER

from .models import Invoice
from .serializers import InvoiceSerializer


class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Invoice.objects
            .filter(order__user=self.request.user)
            .select_related(
                "order",
                "order__user",
                "order__payment",
            )
            .prefetch_related(
                "order__items__product",
            )
        )

    @action(detail=True, methods=["get"])
    def pdf(self, request, pk=None):

        invoice = self.get_object()
        order = invoice.order

        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = (
            f'attachment; filename="{invoice.invoice_number}.pdf"'
        )

        doc = SimpleDocTemplate(response)

        styles = getSampleStyleSheet()

        title_style = styles["Title"]
        title_style.alignment = TA_CENTER

        heading_style = styles["Heading2"]
        heading_style.alignment = TA_CENTER

        normal_style = styles["Normal"]
        normal_style.alignment = TA_CENTER

        elements = []

        # ==========================
        # Company Header
        # ==========================

        elements.append(
            Paragraph("<b>WATCHSTORE</b>", title_style)
        )

        elements.append(
            Paragraph(
                "Premium Watch Collection",
                heading_style,
            )
        )

        elements.append(
            Paragraph(
                "Dhaka, Bangladesh",
                normal_style,
            )
        )

        elements.append(
            Paragraph(
                "support@watchstore.com",
                normal_style,
            )
        )

        elements.append(
            Paragraph(
                "+8801700000000",
                normal_style,
            )
        )

        elements.append(Spacer(1, 20))

        elements.append(
            Paragraph(
                "<b>OFFICIAL INVOICE</b>",
                heading_style,
            )
        )

        elements.append(Spacer(1, 15))

        # ==========================
        # Customer Information
        # ==========================

        customer_data = [
            ["Invoice Number", invoice.invoice_number],
            ["Order Number", order.order_number],
            ["Customer", order.user.username],
            ["Email", order.user.email],
            ["Payment Method", order.payment.method],
            ["Payment Status", order.payment.status],
            ["Invoice Date", invoice.created_at.strftime("%d-%m-%Y %I:%M %p")],
        ]

        customer_table = Table(
            customer_data,
            colWidths=[170, 280],
        )

        customer_table.setStyle(
            TableStyle([
                ("GRID", (0, 0), (-1, -1), 1, colors.grey),

                ("BACKGROUND", (0, 0), (0, -1), colors.lightgrey),

                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),

                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
            ])
        )

        elements.append(customer_table)

        elements.append(Spacer(1, 20))

        # ==========================
        # Products
        # ==========================

        elements.append(
            Paragraph(
                "<b>Purchased Products</b>",
                styles["Heading2"],
            )
        )

        elements.append(Spacer(1, 10))

        product_data = [
            ["Product", "Qty", "Price", "Total"]
        ]

        for item in order.items.all():
            product_data.append([
                item.product.name,
                str(item.quantity),
                f"Tk {item.price}",
                f"Tk {item.price * item.quantity}",
            ])

        product_table = Table(
            product_data,
            colWidths=[220, 60, 90, 90]
        )

        product_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),

                ("GRID", (0, 0), (-1, -1), 1, colors.black),

                ("BACKGROUND", (0, 1), (-1, -1), colors.beige),

                ("ALIGN", (1, 1), (-1, -1), "CENTER"),

                ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
            ])
        )

        elements.append(product_table)

        elements.append(Spacer(1, 20))

        # ==========================
        # Order Summary
        # ==========================

        summary_data = [
            ["Description", "Amount"],
            ["Products Total", f"Tk {order.total_price}"],
            ["Delivery Charge", f"Tk {order.delivery_charge}"],
            ["Grand Total", f"Tk {order.grand_total}"],
        ]

        summary_table = Table(
            summary_data,
            colWidths=[250, 150]
        )

        summary_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.green),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),

                ("GRID", (0, 0), (-1, -1), 1, colors.black),

                ("BACKGROUND", (0, 1), (-1, -1), colors.whitesmoke),

                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),

                ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),

                ("ALIGN", (1, 1), (-1, -1), "RIGHT"),

                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
            ])
        )

        elements.append(summary_table)

        elements.append(Spacer(1, 25))

        if invoice.qr_code:
            qr_path = invoice.qr_code.path

            if os.path.exists(qr_path):
                elements.append(
                    Paragraph(
                        "<b>Scan QR Code</b>",
                        heading_style,
                    )
                )

                elements.append(Spacer(1, 10))

                qr_image = Image(
                    qr_path,
                    width=120,
                    height=120,
                )

                qr_image.hAlign = "CENTER"

                elements.append(qr_image)

                elements.append(Spacer(1, 20))


        elements.append(
            Paragraph(
                "<b>Thank you for shopping with WatchStore!</b>",
                heading_style,
            )
        )

        elements.append(
            Paragraph(
                "This is a computer generated invoice. No signature is required.",
                normal_style,
            )
        )

        doc.build(elements)

        return response