"use client";

import { useCallback, useEffect, useState } from "react";
import { API_URL } from "../../components/portal/category/CategoryGrid";
import { adminFetch } from "./admin-utils";

type CaptionTrack = { id: number; language: string; label: string; is_default: boolean; url: string };
type Asset = { id: number; original_name: string; kind: "image" | "document" | "video"; file_size: number; alt_text: string; caption: string; download_url: string; responsive_image_url?: string; image_width?: number; image_height?: number; processing_status?: string; video_duration_seconds?: number | null; video_width?: number | null; video_height?: number | null; video_poster_url?: string | null; video_variants?: Record<string, { path: string; file_size: number; width: number; height: number }>; variants?: Record<string, { url: string; width: number; height: number; format: string }>; attachment_id?: number; role?: string };

export default function EditorialMediaPanel({ postId }: { postId?: number }) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [attached, setAttached] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [captionTracks, setCaptionTracks] = useState<CaptionTrack[]>([]);
  const [captionLanguage, setCaptionLanguage] = useState("en");
  const [captionLabel, setCaptionLabel] = useState("English");
  const [captionDefault, setCaptionDefault] = useState(false);

  const refresh = useCallback(async () => {
    const response = await adminFetch(`${API_URL}/admin/media/?limit=100&q=${encodeURIComponent(query)}`);
    if (!response.ok) return;
    const data = await response.json();
    setAssets(Array.isArray(data.results) ? data.results : []);
    if (postId) {
      const captions = await adminFetch(`${API_URL}/admin/content/${postId}/video-captions/`);
      if (captions.ok) { const captionPayload = await captions.json(); setCaptionTracks(Array.isArray(captionPayload.results) ? captionPayload.results : []); }
      else setCaptionTracks([]);
      const linked = await adminFetch(`${API_URL}/admin/content/${postId}/media/`);
      if (linked.ok) {
        const payload = await linked.json();
        setAttached((payload.results || []).map((item: Asset) => item.id));
      }
    }
  }, [postId, query]);

  useEffect(() => { if (open) void refresh(); }, [open, refresh]);

  async function upload(file?: File) {
    if (!file) return;
    setBusy(true); setMessage("");
    try {
      const form = new FormData(); form.append("file", file);
      const response = await adminFetch(`${API_URL}/admin/media/`, { method: "POST", body: form });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || data.file || "Upload failed.");
      setMessage("Uploaded successfully."); await refresh();
    } catch (e) { setMessage(e instanceof Error ? e.message : "Upload failed."); }
    finally { setBusy(false); }
  }

  async function uploadCaption(file?: File) {
    if (!file || !postId) return;
    setBusy(true); setMessage("");
    try {
      const form = new FormData(); form.append("file", file); form.append("language", captionLanguage); form.append("label", captionLabel); form.append("is_default", String(captionDefault));
      const response = await adminFetch(`${API_URL}/admin/content/${postId}/video-captions/`, { method: "POST", body: form });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || data.file || data.language || "Caption upload failed.");
      setMessage("Caption track saved."); await refresh();
    } catch (e) { setMessage(e instanceof Error ? e.message : "Caption upload failed."); }
    finally { setBusy(false); }
  }

  async function deleteCaption(id: number) {
    setBusy(true);
    const response = await adminFetch(`${API_URL}/admin/video-captions/${id}/`, { method: "DELETE" });
    if (response.ok) { setCaptionTracks((current) => current.filter((track) => track.id !== id)); setMessage("Caption track removed."); }
    else setMessage("Unable to remove caption track.");
    setBusy(false);
  }

  async function attach(asset: Asset) {
    if (!postId) return;
    setBusy(true); setMessage("");
    try {
      const response = await adminFetch(`${API_URL}/admin/content/${postId}/media/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asset_id: asset.id, role: asset.kind === "image" ? "gallery" : asset.kind === "video" ? "video" : "document" }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "Unable to attach asset.");
      setAttached((current) => current.includes(asset.id) ? current : [...current, asset.id]);
      setMessage("Asset attached to this post.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Unable to attach asset."); }
    finally { setBusy(false); }
  }

  async function detach(asset: Asset) {
    if (!postId || !asset.attachment_id) return;
    setBusy(true);
    const response = await adminFetch(`${API_URL}/admin/content/${postId}/media/${asset.attachment_id}/`, { method: "DELETE" });
    if (response.ok) { setAttached((current) => current.filter((id) => id !== asset.id)); await refresh(); }
    else setMessage("Unable to detach asset.");
    setBusy(false);
  }

  return <div className="editorial-media-panel">
    <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}>{postId ? "Media" : "Media Library"}</button>
    {open && <section className="editorial-media-popover">
      <header><strong>{postId ? "Post media & attachments" : "Editorial media library"}</strong><button type="button" onClick={() => setOpen(false)}>Close</button></header>
      <label className="editorial-media-upload">Upload image, video or document
        <input type="file" accept=".jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.mov,.pdf,.txt,.csv,.doc,.docx,.xls,.xlsx" disabled={busy} onChange={(e) => { void upload(e.target.files?.[0]); e.currentTarget.value = ""; }} />
      </label>
      <input aria-label="Search media" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search files..." />
      <div className="editorial-media-list">{assets.map((asset) => <article key={asset.id}>
        {asset.kind === "video" ? <video className="editorial-media-thumbnail" src={asset.video_variants?.mp4_720p ? asset.download_url + "?optimized=1" : asset.download_url} poster={asset.video_poster_url || undefined} preload="metadata" controls /> : asset.kind === "image" && asset.variants?.thumbnail?.url
          ? <img className="editorial-media-thumbnail" src={asset.variants.thumbnail.url} alt={asset.alt_text || asset.original_name} loading="lazy" />
          : <span className="editorial-media-file-icon">{asset.kind === "document" ? "FILE" : "IMAGE"}</span>}
        <div className="editorial-media-file-info"><strong>{asset.original_name}</strong><small>{asset.kind} · {(asset.file_size / 1024).toFixed(0)} KB{asset.image_width && asset.image_height ? " · " + asset.image_width + "×" + asset.image_height : ""}</small><small>{asset.processing_status || "not processed"}{asset.kind === "video" && asset.video_duration_seconds != null ? " · " + Math.floor(asset.video_duration_seconds / 60) + ":" + String(asset.video_duration_seconds % 60).padStart(2, "0") : ""}{asset.kind === "video" && asset.video_width && asset.video_height ? " · " + asset.video_width + "×" + asset.video_height : ""}</small></div>
        <div className="editorial-media-actions">
          <a href={asset.download_url} target="_blank" rel="noreferrer">Open</a>
          {postId && (attached.includes(asset.id)
            ? <span>Attached</span>
            : <button type="button" disabled={busy} onClick={() => void attach(asset)}>Attach</button>)}
        </div>
      </article>)}</div>
      {postId && assets.some((asset) => asset.kind === "video" && attached.includes(asset.id)) ? <section className="editorial-caption-manager">
        <strong>Video captions & subtitles</strong>
        <div className="editorial-caption-fields">
          <select aria-label="Caption language" value={captionLanguage} onChange={(e) => { setCaptionLanguage(e.target.value); setCaptionLabel(e.target.selectedOptions[0]?.text || e.target.value); }}><option value="en">English</option><option value="mr">Marathi</option><option value="hi">Hindi</option></select>
          <input aria-label="Caption label" value={captionLabel} maxLength={80} onChange={(e) => setCaptionLabel(e.target.value)} />
          <label><input type="checkbox" checked={captionDefault} onChange={(e) => setCaptionDefault(e.target.checked)} /> Default</label>
          <label className="editorial-caption-upload">Upload .vtt<input type="file" accept=".vtt,text/vtt" disabled={busy} onChange={(e) => { void uploadCaption(e.target.files?.[0]); e.currentTarget.value = ""; }} /></label>
        </div>
        {captionTracks.map((track) => <div className="editorial-caption-row" key={track.id}><span><strong>{track.label}</strong><small>{track.language}{track.is_default ? " · Default" : ""}</small></span><button type="button" disabled={busy} onClick={() => void deleteCaption(track.id)}>Remove</button></div>)}
        <small>Upload WebVTT (.vtt) files up to 2 MB. Tracks appear in the public player CC menu after publication.</small>
      </section> : null}
      {message && <p role="status">{message}</p>}
      <small>Images: JPG, PNG, WEBP, GIF (max 10 MB). Videos: MP4, MOV, WEBM (max 500 MB). Documents: PDF, TXT, CSV, DOC/DOCX, XLS/XLSX (max 20 MB).</small>
    </section>}
  </div>;
}
