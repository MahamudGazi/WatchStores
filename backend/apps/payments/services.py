import requests

from django.conf import settings


# =========================================================
# SSLCommerz URL
# =========================================================

if settings.SSL_SANDBOX:

    BASE_URL = (
        "https://sandbox.sslcommerz.com/"
        "gwprocess/v4/api.php"
    )

    VALIDATION_URL = (
        "https://sandbox.sslcommerz.com/"
        "validator/api/validationserverAPI.php"
    )

else:

    BASE_URL = (
        "https://securepay.sslcommerz.com/"
        "gwprocess/v4/api.php"
    )

    VALIDATION_URL = (
        "https://securepay.sslcommerz.com/"
        "validator/api/validationserverAPI.php"
    )


# =========================================================
# CREATE SSL SESSION
# =========================================================

def create_ssl_session(order):

    backend_url = settings.BASE_URL.rstrip("/")

    payload = {

        # -------------------------------------------------
        # STORE INFORMATION
        # -------------------------------------------------

        "store_id": settings.SSL_STORE_ID,

        "store_passwd": settings.SSL_STORE_PASSWORD,


        # -------------------------------------------------
        # ORDER INFORMATION
        # -------------------------------------------------

        "total_amount": str(order.grand_total),

        "currency": "BDT",

        "tran_id": order.order_number,


        # -------------------------------------------------
        # BACKEND CALLBACK URLs
        #
        # SSLCommerz will POST payment result here.
        # Django will verify the payment and then redirect
        # the customer to React frontend.
        # -------------------------------------------------

        "success_url": (
            f"{backend_url}/api/payments/success/"
        ),

        "fail_url": (
            f"{backend_url}/api/payments/fail/"
        ),

        "cancel_url": (
            f"{backend_url}/api/payments/cancel/"
        ),


        # -------------------------------------------------
        # SERVER-TO-SERVER IPN
        # -------------------------------------------------

        "ipn_url": (
            f"{backend_url}/api/payments/ipn/"
        ),


        # -------------------------------------------------
        # PRODUCT INFORMATION
        # -------------------------------------------------

        "product_name": "Watch Order",

        "product_category": "Watch",

        "product_profile": "general",


        # -------------------------------------------------
        # CUSTOMER INFORMATION
        # -------------------------------------------------

        "cus_name": (
            order.user.get_full_name()
            or order.user.username
        ),

        "cus_email": (
            order.user.email
            or "customer@example.com"
        ),

        "cus_phone": "01700000000",

        "cus_add1": "Dhaka",

        "cus_add2": "",

        "cus_city": "Dhaka",

        "cus_state": "Dhaka",

        "cus_postcode": "1207",

        "cus_country": "Bangladesh",


        # -------------------------------------------------
        # SHIPPING INFORMATION
        # -------------------------------------------------

        "ship_name": (
            order.user.get_full_name()
            or order.user.username
        ),

        "ship_add1": "Dhaka",

        "ship_add2": "",

        "ship_city": "Dhaka",

        "ship_state": "Dhaka",

        "ship_postcode": "1207",

        "ship_country": "Bangladesh",

        "shipping_method": "NO",
    }


    # -----------------------------------------------------
    # CREATE SSL SESSION
    # -----------------------------------------------------

    response = requests.post(
        BASE_URL,
        data=payload,
        timeout=30,
    )

    response.raise_for_status()

    return response.json()


# =========================================================
# VALIDATE SSL PAYMENT
# =========================================================

def validate_payment(val_id):

    params = {

        "val_id": val_id,

        "store_id": settings.SSL_STORE_ID,

        "store_passwd": (
            settings.SSL_STORE_PASSWORD
        ),

        "v": 1,

        "format": "json",
    }


    response = requests.get(
        VALIDATION_URL,
        params=params,
        timeout=30,
    )

    response.raise_for_status()

    return response.json()


# =========================================================
# BKASH
# =========================================================

def create_bkash_payment(order):

    backend_url = settings.BASE_URL.rstrip("/")

    return {

        "success": True,

        "payment_id": (
            f"BKASH-{order.order_number}"
        ),

        "payment_url": (
            f"{backend_url}"
            "/api/payments/bkash/callback/"
            f"?order={order.order_number}"
        ),
    }


def verify_bkash_payment(payment_id):

    return {

        "success": True,

        "status": "Completed",

        "payment_id": payment_id,
    }


# =========================================================
# NAGAD
# =========================================================

def create_nagad_payment(order):

    backend_url = settings.BASE_URL.rstrip("/")

    return {

        "success": True,

        "payment_id": (
            f"NAGAD-{order.order_number}"
        ),

        "payment_url": (
            f"{backend_url}"
            "/api/payments/nagad/callback/"
            f"?order={order.order_number}"
        ),
    }


def verify_nagad_payment(payment_id):

    return {

        "success": True,

        "status": "Completed",

        "payment_id": payment_id,
    }