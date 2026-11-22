"""Safe, storage-backend-agnostic image variants for editorial media assets."""
import warnings
from io import BytesIO

from django.core.files.base import ContentFile
from django.utils import timezone
from PIL import Image, ImageOps, UnidentifiedImageError

VARIANT_WIDTHS = {"thumbnail": 480, "medium": 960, "large": 1600}
SUPPORTED_IMAGE_FORMATS = {"JPEG", "PNG", "WEBP", "GIF"}
MAX_IMAGE_PIXELS = 40_000_000


def inspect_uploaded_image(upload):
    """Validate actual image bytes, not just the filename or browser MIME type."""
    position = upload.tell() if hasattr(upload, "tell") else 0
    try:
        Image.MAX_IMAGE_PIXELS = MAX_IMAGE_PIXELS
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            image = Image.open(upload)
            detected_format = (image.format or "").upper()
            width, height = image.size
            if detected_format not in SUPPORTED_IMAGE_FORMATS:
                raise ValueError("Unsupported image encoding.")
            if width < 1 or height < 1 or width * height > MAX_IMAGE_PIXELS:
                raise ValueError("Image dimensions exceed the safe processing limit.")
            image.verify()
            return detected_format, width, height
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError, Image.DecompressionBombWarning) as exc:
        raise ValueError("The uploaded file is not a valid, safe image.") from exc
    finally:
        upload.seek(position)


def generate_editorial_variants(asset):
    """Generate bounded WebP derivatives while retaining the uploaded original."""
    if asset.kind != "image":
        return asset
    asset.processing_status = "processing"
    asset.processing_error = ""
    asset.save(update_fields=["processing_status", "processing_error"])
    try:
        Image.MAX_IMAGE_PIXELS = MAX_IMAGE_PIXELS
        with asset.file.open("rb") as source:
            with warnings.catch_warnings():
                warnings.simplefilter("error", Image.DecompressionBombWarning)
                original = Image.open(source)
                original.load()
                if (original.format or "").upper() not in SUPPORTED_IMAGE_FORMATS:
                    raise ValueError("Unsupported image encoding.")
                original = ImageOps.exif_transpose(original)
                asset.image_width, asset.image_height = original.size
                if original.mode not in ("RGB", "RGBA"):
                    original = original.convert("RGBA" if "transparency" in original.info else "RGB")
                variants = {}
                for name, max_width in VARIANT_WIDTHS.items():
                    derivative = original.copy()
                    derivative.thumbnail((max_width, max_width), Image.Resampling.LANCZOS)
                    output = BytesIO()
                    derivative.save(output, format="WEBP", quality=82, method=6)
                    output.seek(0)
                    path = "editorial-media/variants/{}/{}/{}.webp".format(asset.owner_auth_id, asset.pk, name)
                    saved_path = asset.file.storage.save(path, ContentFile(output.read()))
                    variants[name] = {
                        "path": saved_path,
                        "width": derivative.width,
                        "height": derivative.height,
                        "format": "webp",
                    }
                asset.variants = variants
                asset.processing_status = "ready"
                asset.processing_error = ""
                asset.processed_at = timezone.now()
                asset.save(update_fields=["image_width", "image_height", "variants", "processing_status", "processing_error", "processed_at"])
    except Exception as exc:
        asset.processing_status = "failed"
        asset.processing_error = str(exc)[:500]
        asset.processed_at = timezone.now()
        asset.save(update_fields=["processing_status", "processing_error", "processed_at"])
    return asset
