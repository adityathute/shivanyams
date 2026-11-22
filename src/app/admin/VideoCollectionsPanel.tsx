"use client";

import { useCallback, useEffect, useState } from "react";
import { API_URL } from "../../components/portal/category/CategoryGrid";
import { adminFetch } from "./admin-utils";

type Collection = { id: number; collection_type: string; title_en: string; slug: string; external_url: string; is_published: boolean; video_ids?: number[] };

export default function VideoCollectionsPanel() {
  const [items, setItems] = useState<Collection[]>([]);
  const [type, setType] = useState("playlist");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [videoIds, setVideoIds] = useState("");
  const [published, setPublished] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    const response = await adminFetch(`${API_URL}/admin/video-collections/`);
    if (!response.ok) throw new Error("Unable to load video collections.");
    const payload = await response.json();
    setItems(Array.isArray(payload.results) ? payload.results : []);
  }, []);

  useEffect(() => { void refresh().catch((error) => setMessage(error instanceof Error ? error.message : "Unable to load collections.")); }, [refresh]);

  async function createCollection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const ids = videoIds.split(",").map((value) => Number(value.trim())).filter((value) => Number.isInteger(value) && value > 0);
      const response = await adminFetch(`${API_URL}/admin/video-collections/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection_type: type, title_en: title.trim(), slug: slug.trim(), description_en: description.trim(), external_url: externalUrl.trim(), thumbnail_url: thumbnail.trim(), is_published: published, video_ids: ids }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || payload.slug?.[0] || payload.video_ids?.[0] || payload.external_url?.[0] || "Unable to save collection.");
      setTitle(""); setSlug(""); setDescription(""); setExternalUrl(""); setThumbnail(""); setVideoIds(""); setPublished(false);
      setMessage("Collection created."); await refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save collection."); }
    finally { setBusy(false); }
  }

  async function removeCollection(id: number) {
    if (!window.confirm("Delete this collection? Its videos will remain published.")) return;
    setBusy(true);
    try { const response = await adminFetch(`${API_URL}/admin/video-collections/${id}/`, { method: "DELETE" }); if (!response.ok) throw new Error("Unable to delete collection."); setItems((current) => current.filter((item) => item.id !== id)); setMessage("Collection deleted."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to delete collection."); }
    finally { setBusy(false); }
  }

  return <section className="video-collections-admin">
    <header><div><h2>Video playlists, series & channels</h2><p>Organize existing YouTube video posts into curated collections. Video playback stays on YouTube.</p></div><span>{items.length} collections</span></header>
    <form onSubmit={createCollection} className="video-collection-form">
      <label>Collection type<select value={type} onChange={(event) => setType(event.target.value)}><option value="playlist">YouTube Playlist</option><option value="series">Video Series</option><option value="channel">Channel</option></select></label>
      <label>English title<input required maxLength={180} value={title} onChange={(event) => { setTitle(event.target.value); if (!slug) setSlug(event.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")); }} /></label>
      <label>URL slug<input required maxLength={200} value={slug} onChange={(event) => setSlug(event.target.value)} /></label>
      <label>YouTube playlist / channel URL<input type="url" placeholder="https://www.youtube.com/playlist?list=..." value={externalUrl} onChange={(event) => setExternalUrl(event.target.value)} /></label>
      <label>Thumbnail URL<input type="url" value={thumbnail} onChange={(event) => setThumbnail(event.target.value)} /></label>
      <label>Description<textarea rows={2} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
      <label>Video post IDs (comma separated)<input placeholder="Example: 14, 27, 31" value={videoIds} onChange={(event) => setVideoIds(event.target.value)} /><small>Use IDs from existing Video posts. Order here becomes collection order.</small></label>
      <label className="video-collection-publish"><input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} /> Publish collection</label>
      <button type="submit" disabled={busy || !title.trim() || !slug.trim()}>{busy ? "Saving…" : "Create collection"}</button>
    </form>
    {items.map((item) => <div className="video-collection-admin-row" key={item.id}><div><strong>{item.title_en}</strong><small>{item.collection_type} · /videos/collections/{item.slug} · {item.is_published ? "Published" : "Draft"}</small>{item.external_url ? <a href={item.external_url} target="_blank" rel="noreferrer">Open YouTube link</a> : null}</div><button type="button" disabled={busy} onClick={() => void removeCollection(item.id)}>Delete</button></div>)}
    {message ? <p role="status">{message}</p> : null}
  </section>;
}
