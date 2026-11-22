"use client";

import { useCallback, useEffect, useState } from "react";
import { API_URL } from "../../components/portal/category/CategoryGrid";
import { adminFetch } from "./admin-utils";

type Asset = { id: number; original_name: string; kind: "image" | "document" | "video"; file_size: number; alt_text: string; caption: string; download_url: string; responsive_image_url?: string; image_width?: number; image_height?: number; processing_status?: string; video_duration_seconds?: number | null; video_width?: number | null; video_height?: number | null; video_poster_url?: string | null; video_variants?: Record<string, { path: string; file_size: number; width: number; height: number }>; variants?: Record<string, { url: string; width: number; height: number; format: string }>; attachment_id?: number; role?: string };

export default function EditorialMediaPanel({ postId }: { postId?: number }) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [attached, setAttached] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");

  const refresh = useCallback(async () => {
    const response = await adminFetch(`${API_URL}/admin/media/?limit=100&q=${encodeURIComponent(query)}`);
    if (!response.ok) return;
    const data = await response.json();
    setAssets(Array.isArray(data.results) ? data.results : []);
    if (postId) {
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
      {message && <p role="status">{message}</p>}
      <small>Images: JPG, PNG, WEBP, GIF (max 10 MB). Videos: MP4, MOV, WEBM (max 500 MB). Documents: PDF, TXT, CSV, DOC/DOCX, XLS/XLSX (max 20 MB).</small>
    </section>}
  </div>;
}
