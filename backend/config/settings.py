from pathlib import Path
from decouple import config
import environ
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Ensure logs directory exists before configuring logging
LOGS_DIR = BASE_DIR / "logs"
LOGS_DIR.mkdir(parents=True, exist_ok=True)

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,

    "formatters": {
        "standard": {
            "format": "[{asctime}] {levelname} {name}: {message}",
            "style": "{",
        },
    },

    "handlers": {
        "info_file": {
            "level": "INFO",
            "class": "logging.FileHandler",
            "filename": str(LOGS_DIR / "info.log"),
            "formatter": "standard",
        },

        "warning_file": {
            "level": "WARNING",
            "class": "logging.FileHandler",
            "filename": str(LOGS_DIR / "warning.log"),
            "formatter": "standard",
        },

        "error_file": {
            "level": "ERROR",
            "class": "logging.FileHandler",
            "filename": str(LOGS_DIR / "error.log"),
            "formatter": "standard",
        },
    },

    "loggers": {
        "django": {
            "handlers": [
                "info_file",
                "warning_file",
                "error_file",
            ],
            "level": "INFO",
            "propagate": True,
        },
    },
}

env = environ.Env()

environ.Env.read_env(
    os.path.join(BASE_DIR, ".env")
)

SECRET_KEY = env("SECRET_KEY")
DEBUG = config("DEBUG", cast=bool, default=True)

ALLOWED_HOSTS = [
    host.strip()
    for host in config(
        "ALLOWED_HOSTS",
        default="127.0.0.1,localhost",
    ).split(",")
    if host.strip()
]

# Application definition
INSTALLED_APPS = [
    "jazzmin",

    "django_filters",
    "drf_spectacular",
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

     # Third Party
    'rest_framework',
    'corsheaders',
    "rest_framework_simplejwt.token_blacklist",

    # Local
    "apps.accounts",
    "apps.brands",
    "apps.categories",
    "apps.products",
    "apps.cart",
    "apps.wishlist",
    "apps.orders",
    "apps.coupons",
    "apps.payments",
    "apps.invoices",
    "apps.reviews",
    "apps.shipping",
    "apps.dashboard",
    "apps.settings.apps.SettingsConfig",
    # "apps.core",
    # "apps.notifications",
    # "apps.analytics",
    "apps.flash_sales",
    "apps.promotions",
]


JAZZMIN_SETTINGS = {
    "site_title": "Watch Store Admin",
    "site_header": "Watch Store",
    "site_brand": "Watch Store",

    "welcome_sign": "Welcome to Watch Store Dashboard",

    "site_logo": "images/logo.png",

    "copyright": "© 2026 Mahamud Gazi",

    "show_sidebar": True,
    "navigation_expanded": True,

    "search_model": [
        "products.Product",
        "orders.Order",
        "accounts.User",
        "reviews.Review",
    ],

    "order_with_respect_to": [
        "products",
        "orders",
        "shipping",
        "payments",
        "cart",
        "wishlist",
        "reviews",
        "brands",
        "categories",
        "coupons",
        "accounts",
    ],

    "icons": {
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",

        "accounts.User": "fas fa-user-circle",

        "products.Product": "fas fa-box-open",
        "brands.Brand": "fas fa-tags",
        "categories.Category": "fas fa-list",

        "orders.Order": "fas fa-shopping-cart",

        "cart.Cart": "fas fa-shopping-basket",

        "wishlist.Wishlist": "fas fa-heart",

        "payments.Payment": "fas fa-credit-card",

        "shipping.ShippingAddress": "fas fa-map-marker-alt",
        "shipping.ShippingCharge": "fas fa-truck",

        "reviews.Review": "fas fa-star",

        "coupons.Coupon": "fas fa-ticket-alt",

        "invoices.Invoice": "fas fa-file-invoice",
    },
}

JAZZMIN_UI_TWEAKS = {
    "theme": "darkly",
    "dark_mode_theme": "darkly",

    "navbar": "navbar-dark navbar-primary",

    "brand_colour": "navbar-primary",

    "accent": "accent-primary",

    "sidebar": "sidebar-dark-primary",

    "sidebar_nav_small_text": False,

    "sidebar_nav_compact_style": False,

    "sidebar_nav_child_indent": True,

    "sidebar_disable_expand": False,

    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-outline-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success",
    },
}


MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / "templates",],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": config("DB_NAME"),
        "USER": config("DB_USER"),
        "PASSWORD": config("DB_PASSWORD"),
        "HOST": config("DB_HOST"),
        "PORT": config("DB_PORT"),
        "CONN_MAX_AGE": 60,
        "OPTIONS": {
            "charset": "utf8mb4",
        },
    }
}


EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"

EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = env("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = f"WatchStore <{EMAIL_HOST_USER}>"


# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = "Asia/Dhaka"

USE_I18N = True

USE_TZ = True



# SSLCommerz Settings
SSL_SANDBOX = config("SSL_SANDBOX", cast=bool, default=True)
SSL_STORE_ID = config("STORE_ID", default="")
SSL_STORE_PASSWORD = config("STORE_PASSWORD", default="")

# Used for payment gateway callback URLs

BASE_URL = config(
    "BASE_URL",
    default="http://127.0.0.1:8000",
)

FRONTEND_URL = config(
    "FRONTEND_URL",
    default="http://localhost:5174",
)
# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = 'static/'


# ---------- CORS (Development) ----------
# ---------- CORS ----------
CORS_ALLOW_ALL_ORIGINS = config(
    "CORS_ALLOW_ALL_ORIGINS",
    cast=bool,
    default=True if DEBUG else False,
)

CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in config(
        "CORS_ALLOWED_ORIGINS",
        default="http://localhost:5174,http://127.0.0.1:5174",
    ).split(",")
    if origin.strip()
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]

AUTH_USER_MODEL = "accounts.User"

from datetime import timedelta

REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS":
    "drf_spectacular.openapi.AutoSchema",
    
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    
    "EXCEPTION_HANDLER": "apps.core.exceptions.custom_exception_handler",
    "DEFAULT_PAGINATION_CLASS": "apps.core.pagination.StandardResultsSetPagination",
    "PAGE_SIZE": 10,
    
    
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    
    
    
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],

    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",
        "user": "1000/hour",
        "login": "5/min",
    },
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}

SPECTACULAR_SETTINGS = {
    "TITLE": "WatchStore API",
    "DESCRIPTION": "Luxury WatchStore Backend API",
    "VERSION": "1.0.0",
}

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

CELERY_BROKER_URL = config(
    "CELERY_BROKER_URL",
    default="redis://127.0.0.1:6379/0",
)

# memory backend avoids Redis connection on local/dev
CELERY_RESULT_BACKEND = config(
    "CELERY_RESULT_BACKEND",
    default="cache+memory://",
)

CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = "Asia/Dhaka"
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_IGNORE_RESULT = True

# Local: tasks run in-process (no Redis needed)
CELERY_TASK_ALWAYS_EAGER = config(
    "CELERY_TASK_ALWAYS_EAGER",
    cast=bool,
    default=True if DEBUG else False,
)
CELERY_TASK_EAGER_PROPAGATES = False


# ============================================================
# Production Security Hardening
# Active when DEBUG=False
# ============================================================

if not DEBUG:
    # HTTPS / SSL
    SECURE_SSL_REDIRECT = config("SECURE_SSL_REDIRECT", cast=bool, default=True)
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

    # HSTS
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

    # Content / Browser security
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_BROWSER_XSS_FILTER = True
    X_FRAME_OPTIONS = "DENY"
    SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"

    # Cookies
    SESSION_COOKIE_HTTPONLY = True
    CSRF_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    CSRF_COOKIE_SAMESITE = "Lax"

# CSRF trusted origins (required for HTTPS admin / forms behind proxy)
CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in config(
        "CSRF_TRUSTED_ORIGINS",
        default="",
    ).split(",")
    if origin.strip()
]
# Also derive from CORS_ALLOWED_ORIGINS if not set
if not CSRF_TRUSTED_ORIGINS and CORS_ALLOWED_ORIGINS:
    CSRF_TRUSTED_ORIGINS = list(CORS_ALLOWED_ORIGINS)

# Force CORS_ALLOW_ALL_ORIGINS off in production
if not DEBUG:
    CORS_ALLOW_ALL_ORIGINS = False

# Static files for production (collectstatic)
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"] if (BASE_DIR / "static").exists() else []

# Media safety
FILE_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024  # 5 MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10 MB


# WhiteNoise compressed static files
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
