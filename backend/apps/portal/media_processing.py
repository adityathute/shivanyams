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


def process_editorial_video(asset, timeout_seconds=7200):
    """Create a poster and a browser-friendly MP4 derivative without replacing the source."""
    import json
    import os
    import shutil
    import subprocess
    import tempfile
    import uuid
    from django.core.files.base import ContentFile
    from django.utils import timezone

    if asset.kind != "video":
        raise ValueError("Only video media assets can be processed by this pipeline.")
    ffmpeg = shutil.which("ffmpeg")
    ffprobe = shutil.which("ffprobe")
    if not ffmpeg or not ffprobe:
        asset.processing_status = "failed"
        asset.processing_error = "FFmpeg and FFprobe are required on the server to process videos."
        asset.processed_at = timezone.now()
        asset.save(update_fields=["processing_status", "processing_error", "processed_at", "updated_at"])
        return asset

    asset.processing_status = "processing"
    asset.processing_error = ""
    asset.save(update_fields=["processing_status", "processing_error", "updated_at"])
    storage = asset.file.storage
    token = uuid.uuid4().hex
    try:
        with tempfile.TemporaryDirectory(prefix="editorial-video-") as workdir:
            source_path = os.path.join(workdir, "source" + os.path.splitext(asset.original_name)[1].lower())
            poster_path = os.path.join(workdir, "poster.jpg")
            output_path = os.path.join(workdir, "optimized.mp4")
            with asset.file.open("rb") as source, open(source_path, "wb") as target:
                shutil.copyfileobj(source, target, length=1024 * 1024)
            probe = subprocess.run(
                [ffprobe, "-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height", "-of", "json", source_path],
                check=True, capture_output=True, text=True, timeout=min(timeout_seconds, 180),
            )
            metadata = json.loads(probe.stdout or "{}")
            video_stream = next((item for item in metadata.get("streams", []) if item.get("codec_type") == "video"), None)
            if not video_stream:
                raise ValueError("The uploaded file does not contain a readable video stream.")
            duration = max(0, int(float((metadata.get("format") or {}).get("duration") or 0)))
            width, height = int(video_stream.get("width") or 0), int(video_stream.get("height") or 0)
            if not width or not height or width * height > 100_000_000:
                raise ValueError("Video dimensions are invalid or exceed the 100-megapixel processing limit.")
            poster_seek = min(1.0, max(0.0, duration / 2))
            subprocess.run(
                [ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-ss", str(poster_seek), "-i", source_path, "-frames:v", "1", "-vf", "scale='min(640,iw)':-2", "-q:v", "3", poster_path],
                check=True, capture_output=True, timeout=min(timeout_seconds, 300),
            )
            subprocess.run(
                [ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", source_path, "-map", "0:v:0", "-map", "0:a?", "-vf", "scale='min(1280,iw)':-2", "-c:v", "libx264", "-preset", "medium", "-crf", "26", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", "-max_muxing_queue_size", "1024", output_path],
                check=True, capture_output=True, timeout=timeout_seconds,
            )
            if not os.path.exists(poster_path) or not os.path.exists(output_path):
                raise ValueError("FFmpeg did not produce the expected poster and optimized video files.")
            poster_name = "editorial-media/video-posters/{}/{}.jpg".format(asset.pk, token)
            variant_name = "editorial-media/video-variants/{}/{}.mp4".format(asset.pk, token)
            with open(poster_path, "rb") as poster_file:
                saved_poster = storage.save(poster_name, ContentFile(poster_file.read()))
            with open(output_path, "rb") as video_file:
                saved_variant = storage.save(variant_name, ContentFile(video_file.read()))
            optimized_size = storage.size(saved_variant)
            asset.video_duration_seconds = duration
            asset.video_width = width
            asset.video_height = height
            asset.video_poster_path = saved_poster
            asset.video_variants = {"mp4_720p": {"path": saved_variant, "mime_type": "video/mp4", "file_size": optimized_size, "width": min(width, 1280), "height": min(height, 720)}}
            asset.processing_status = "completed"
            asset.processing_error = ""
            asset.processed_at = timezone.now()
            asset.save(update_fields=["video_duration_seconds", "video_width", "video_height", "video_poster_path", "video_variants", "processing_status", "processing_error", "processed_at", "updated_at"])
            return asset
    except Exception as exc:
        asset.processing_status = "failed"
        asset.processing_error = str(exc)[:500]
        asset.processed_at = timezone.now()
        asset.save(update_fields=["processing_status", "processing_error", "processed_at", "updated_at"])
        return asset