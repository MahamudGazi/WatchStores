from io import BytesIO
import os
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


def generate_invoice_pdf(invoice):
    buffer = BytesIO()

    doc = SimpleDocTemplate(buffer)

    styles = getSampleStyleSheet()

    elements = []



    logo_path = os.path.join(
        "media",
        "logo.png",
    )

    if os.path.exists(logo_path):
        logo = Image(
            logo_path,
            width=120,
            height=60,
        )
        logo.hAlign = "CENTER"
        elements.append(logo)



    elements.append(
        Paragraph(
            "<b>WATCHSTORE</b>",
            styles["Title"],
        )
    )

    elements.append(
        Paragraph(
            "Premium Watch Collection",
            styles["Heading2"],
        )
    )

    elements.append(
        Paragraph(
            "Dhaka, Bangladesh",
            styles["Normal"],
        )
    )

    elements.append(Spacer(1, 20))



    elements.append(
        Paragraph(
            "<b>WATCHSTORE INVOICE</b>",
            styles["Title"],
        )
    )

    elements.append(
        Paragraph(
            f"<b>Invoice No:</b> {invoice.invoice_number}",
            styles["Normal"],
        )
    )

    elements.append(
        Paragraph(
            f"<b>Order No:</b> {invoice.order.order_number}",
            styles["Normal"],
        )
    )

    elements.append(
        Paragraph(
            f"<b>Date:</b> {invoice.created_at.strftime('%d-%m-%Y')}",
            styles["Normal"],
        )
    )

    elements.append(Spacer(1, 20))

    elements.append(
        Paragraph(
            "<b>Customer Information</b>",
            styles["Heading2"],
        )
    )

    elements.append(
        Paragraph(
            f"Name: {invoice.order.user.username}",
            styles["Normal"],
        )
    )


    elements.append(
        Paragraph(
            f"Email: {invoice.order.user.email}",
            styles["Normal"],
        )
    )

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

    for item in invoice.order.items.all():
        product_data.append([
            item.product.name,
            str(item.quantity),
            f"Tk {item.price}",
            f"Tk {item.price * item.quantity}",
        ])

    table = Table(product_data)

    table.setStyle(
        TableStyle([
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ])
    )

    elements.append(table)

    elements.append(
        Paragraph(
            "<b>Order Summary</b>",
            styles["Heading2"],
        )
    )

    summary_data = [
        ["Products Total", f"Tk {invoice.order.total_price}"],
        ["Delivery Charge", f"Tk {invoice.order.delivery_charge}"],
        ["Grand Total", f"Tk {invoice.order.grand_total}"],
    ]

    summary_table = Table(summary_data)

    summary_table.setStyle(
        TableStyle([
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
            ("BACKGROUND", (0, 0), (-1, -1), colors.whitesmoke),
            ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
        ])
    )

    elements.append(summary_table)

    elements.append(Spacer(1, 20))

    shipping = invoice.order.shipping_address

    if shipping:

        elements.append(
            Paragraph(
                "<b>Shipping Address</b>",
                styles["Heading2"],
            )
        )

        elements.append(
            Paragraph(
                f"Receiver: {shipping.full_name}",
                styles["Normal"],
            )
        )

        elements.append(
            Paragraph(
                f"Phone: {shipping.phone}",
                styles["Normal"],
            )
        )

        elements.append(
            Paragraph(
                f"Address: {shipping.address_line}",
                styles["Normal"],
            )
        )

        elements.append(
            Paragraph(
                f"City: {shipping.city}",
                styles["Normal"],
            )
        )

        elements.append(
            Paragraph(
                f"District: {shipping.district}",
                styles["Normal"],
            )
        )

        elements.append(
            Paragraph(
                f"Postal Code: {shipping.postal_code}",
                styles["Normal"],
            )
        )

        elements.append(
            Paragraph(
                f"Country: {shipping.country}",
                styles["Normal"],
            )
        )

        elements.append(Spacer(1, 20))

    elements.append(
        Paragraph(
            "<b>Payment Information</b>",
            styles["Heading2"],
        )
    )

    if invoice.qr_code:
        qr_path = invoice.qr_code.path

        if os.path.exists(qr_path):
            elements.append(Spacer(1, 20))

            elements.append(
                Paragraph(
                    "<b>Invoice QR Code</b>",
                    styles["Heading2"],
                )
            )

            qr = Image(
                qr_path,
                width=120,
                height=120,
            )

            qr.hAlign = "CENTER"

            elements.append(qr)

    elements.append(
        Paragraph(
            f"Method: {invoice.order.payment.method}",
            styles["Normal"],
        )
    )

    elements.append(
    Paragraph(
        f"Status: {invoice.order.payment.status}",
        styles["Normal"],
    )
)
    elements.append(Spacer(1, 20))


    elements.append(
        Paragraph(
            "<b>Thank you for shopping with WatchStore!</b>",
            styles["Heading2"],
        )
    )

    elements.append(
        Paragraph(
            "This invoice is computer generated and does not require a signature.",
            styles["Normal"],
        )
    )

    elements.append(
        Paragraph(
            "For support: support@watchstore.com | +8801700000000",
            styles["Normal"],
        )
    )

    doc.build(elements)

    pdf = buffer.getvalue()

    buffer.close()

    return pdf

