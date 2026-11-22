"""Shared pagination policy for portal list endpoints."""
from rest_framework.pagination import PageNumberPagination


class PortalPageNumberPagination(PageNumberPagination):
    """Stable page-number pagination with a bounded client page-size option."""

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100
