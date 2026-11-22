# ShivanyaMS V3 — Step 26: Video Processing Pipeline

## Delivered

- Added video processing metadata to `EditorialMediaAsset`: source duration and dimensions, poster storage path, optimized variant manifest, processing status and error.
- Added `process_editorial_video`, which inspects source streams with FFprobe, rejects missing video streams and unsafe dimensions, extracts a JPEG poster, and transcodes a browser-friendly H.264/AAC MP4 derivative with fast-start metadata.
- The original upload is retained unchanged. Derivatives are written through Django's configured storage backend.
- Added public poster delivery only for active videos attached to published posts, plus authenticated Admin Portal poster delivery.
- Public and admin video playback can request the optimized derivative with `?optimized=1`; existing byte-range streaming handles seeking.
- Extended the existing media processing management command to process images and videos.
- The Admin Media Library displays the generated poster, processing status, duration and source dimensions, and uses the optimized preview when available.

## Server requirements

- Install FFmpeg with FFprobe available on the backend process `PATH` (`ffmpeg` and `ffprobe` executables).
- Ensure the backend worker has temporary disk space for a source copy and transcode output; processing copies the original to a temporary work directory.
- Configure persistent Django media storage and backups. Video poster and optimized derivative paths are saved in the same storage backend as the source asset.
- Configure reverse-proxy upload/body limits for the existing 500 MB video upload limit.

## Processing command

Run from the backend directory after deploying the migration and installing FFmpeg:

```bash
python manage.py process_editorial_media --kind video --limit 25
```

Process both image and video assets:

```bash
python manage.py process_editorial_media --kind all --limit 100
```

Regenerate every active video derivative:

```bash
python manage.py process_editorial_media --kind video --all --limit 100
```

`--all` intentionally regenerates derivatives and stores new paths; old derivative cleanup should be handled by a future retention/cleanup task. Processing failures are retained on the asset as `processing_status=failed` with a diagnostic message. Re-running the command retries failed/pending assets.

## Deployment and verification notes

- Apply migration `0038_video_processing_metadata` during the approved deployment/migration phase.
- Confirm FFmpeg/FFprobe are installed before processing uploaded videos. Without them, uploads remain stored safely and processing is marked failed with a clear requirement message.
- Test MP4, MOV and WebM sources, videos with and without audio, short clips, portrait videos, seeking/range requests, public poster access and unpublished asset protection during the authorized test phase.
- No tests, builds, migrations or database operations were run for this step.
