import logging
import re
import time
import uuid

logger = logging.getLogger("shivanyams.request")
REQUEST_ID_PATTERN = re.compile(r"^[A-Za-z0-9._-]{8,64}$")


class RequestCorrelationMiddleware:
    """Attach a safe request ID and emit one structured completion log."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        supplied = request.headers.get("X-Request-ID", "")
        request_id = supplied if REQUEST_ID_PATTERN.fullmatch(supplied) else uuid.uuid4().hex
        request.request_id = request_id
        started = time.perf_counter()
        response = self.get_response(request)
        elapsed_ms = round((time.perf_counter() - started) * 1000, 2)
        response["X-Request-ID"] = request_id
        logger.info("http_request_complete request_id=%s method=%s path=%s status=%s duration_ms=%s", request_id, request.method, request.path, response.status_code, elapsed_ms)
        return response
