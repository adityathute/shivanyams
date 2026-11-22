"""Consistent, non-leaking handling for unexpected Portal API errors."""
import logging

from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger("apps.portal.api")


def portal_exception_handler(exc, context):
    """Keep DRF's established payload for known errors; hide unexpected details."""
    response = drf_exception_handler(exc, context)
    if response is not None:
        return response

    logger.error(
        "Unhandled Portal API exception",
        exc_info=(type(exc), exc, exc.__traceback__),
        extra={
            "view": context.get("view").__class__.__name__
            if context.get("view")
            else None,
        },
    )
    return Response(
        {
            "detail": "An unexpected error occurred. Please try again later.",
            "code": "server_error",
        },
        status=500,
    )
