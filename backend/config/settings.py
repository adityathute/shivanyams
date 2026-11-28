# File Location: shivanyams/backend/config/settings.py
# References:
#   shivanya-sdk v1.0.0 (branch sdk-v2)
#   shivanya-auth v1.0.0 (branch auth-v2)
#
# Repository Commit: 312c7c24b5ab1211f534ce9c2f871004d0441398
# Both repositories are read-only references.
#

from pathlib import Path
from decouple import Csv, config

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = config("DJANGO_SECRET_KEY")
DEBUG = config("DJANGO_DEBUG", default=False, cast=bool)
ALLOWED_HOSTS = config(
    "DJANGO_ALLOWED_HOSTS", default="localhost,127.0.0.1", cast=Csv()
)

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "django_filters",
    "apps.portal",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("DB_NAME"),
        "USER": config("DB_USER"),
        "PASSWORD": config("DB_PASSWORD"),
        "HOST": config("DB_HOST", default="localhost"),
        "PORT": config("DB_PORT", default=5432, cast=int),
    }
}

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# SMTP configuration used for post-update subscriber notifications.
EMAIL_BACKEND = config(
    "EMAIL_BACKEND",
    default="django.core.mail.backends.smtp.EmailBackend",
)
EMAIL_HOST = config("EMAIL_HOST", default="")
EMAIL_PORT = config("EMAIL_PORT", default=587, cast=int)
EMAIL_USE_TLS = config("EMAIL_USE_TLS", default=True, cast=bool)
EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default="")
DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL", default=EMAIL_HOST_USER)
STATIC_URL = "static/"
CORS_ALLOWED_ORIGINS = config("CORS_ALLOWED_ORIGINS", default="", cast=Csv())
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = config(
    "CSRF_TRUSTED_ORIGINS",
    default=",".join(CORS_ALLOWED_ORIGINS),
    cast=Csv(),
)

# Production transport and cookie security. If TLS terminates at a trusted
# reverse proxy, explicitly enable DJANGO_USE_X_FORWARDED_PROTO.
SECURE_SSL_REDIRECT = config(
    "DJANGO_SECURE_SSL_REDIRECT", default=not DEBUG, cast=bool
)
SECURE_HSTS_SECONDS = config(
    "DJANGO_SECURE_HSTS_SECONDS", default=0, cast=int
)
SECURE_HSTS_INCLUDE_SUBDOMAINS = config(
    "DJANGO_SECURE_HSTS_INCLUDE_SUBDOMAINS", default=False, cast=bool
)
SECURE_HSTS_PRELOAD = config(
    "DJANGO_SECURE_HSTS_PRELOAD", default=False, cast=bool
)
SESSION_COOKIE_SECURE = config(
    "DJANGO_SESSION_COOKIE_SECURE", default=not DEBUG, cast=bool
)
CSRF_COOKIE_SECURE = config(
    "DJANGO_CSRF_COOKIE_SECURE", default=not DEBUG, cast=bool
)
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
X_FRAME_OPTIONS = "DENY"
SECURE_PROXY_SSL_HEADER = (
    ("HTTP_X_FORWARDED_PROTO", "https")
    if config("DJANGO_USE_X_FORWARDED_PROTO", default=False, cast=bool)
    else None
)

AUTH_ME_URL = config(
    "AUTH_ME_URL",
    default="http://127.0.0.1:8000/api/v1/auth/me/",
)
AUTH_REQUEST_TIMEOUT = config("AUTH_REQUEST_TIMEOUT", default=4, cast=int)
AUTH_ACCESS_COOKIE_NAME = config(
    "AUTH_ACCESS_COOKIE_NAME", default="shivanya_access"
)

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "apps.portal.authentication.ShivanyaAuthAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
}

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]