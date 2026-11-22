"use client";

import { useCallback, useEffect, useState } from "react";
import { API_URL } from "../../components/portal/category/CategoryGrid";
import { adminFetch } from "./admin-utils";

type Reply = { id: number; author_auth_id: string; content: string; created_at: string; can_edit: boolean };
type ThreadItem = { id: number; author_auth_id: string; content: string; created_at: string; edited_at: string | null; can_edit: boolean; replies: Reply[] };

export default function EditorialDiscussion({ postId }: { postId: number }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ThreadItem[]>([]);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const response = await adminFetch(`${API_URL}/admin/content/${postId}/discussion/`, { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.detail || "Unable to load discussion.");
    setItems(Array.isArray(payload.results) ? payload.results : []);
  }, [postId]);

  useEffect(() => { if (open) void refresh().catch((e) => setError(e.message)); }, [open, refresh]);

  async function send() {
    if (!draft.trim()) return;
    setBusy(true); setError("");
    try {
      const response = await adminFetch(`${API_URL}/admin/content/${postId}/discussion/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft, parent_id: replyTo }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || payload.content || "Unable to send message.");
      setDraft(""); setReplyTo(null); await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to send message."); }
    finally { setBusy(false); }
  }

  async function remove(id: number) {
    if (!window.confirm("Delete this discussion message and its replies?")) return;
    const response = await adminFetch(`${API_URL}/admin/editorial/discussion/${id}/`, { method: "DELETE" });
    if (!response.ok) { setError("Unable to delete message."); return; }
    await refresh();
  }

  return <div className="editorial-discussion">
    <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}>Discussion ({items.reduce((n, x) => n + 1 + x.replies.length, 0)})</button>
    {open && <section className="editorial-discussion-panel">
      <strong>Private editorial discussion</strong>
      <p>Visible only to administrators, reviewers and the content owner or assigned editor.</p>
      {items.map((item) => <article key={item.id}>
        <div><b>{item.author_auth_id}</b><small>{new Date(item.created_at).toLocaleString()}{item.edited_at ? " · edited" : ""}</small><p>{item.content}</p></div>
        <div className="editorial-discussion-actions">
          <button type="button" onClick={() => setReplyTo(item.id)}>Reply</button>
          {item.can_edit && <button type="button" onClick={() => void remove(item.id)}>Delete</button>}
        </div>
        {item.replies.map((reply) => <div className="editorial-discussion-reply" key={reply.id}>
          <b>{reply.author_auth_id}</b><small>{new Date(reply.created_at).toLocaleString()}</small><p>{reply.content}</p>
          {reply.can_edit && <button type="button" onClick={() => void remove(reply.id)}>Delete</button>}
        </div>)}
      </article>)}
      {replyTo && <p>Replying to message #{replyTo} <button type="button" onClick={() => setReplyTo(null)}>Cancel</button></p>}
      <textarea value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={10000} placeholder="Write an internal note or reviewer feedback..." rows={3} />
      {error && <p role="alert">{error}</p>}
      <button type="button" disabled={busy || !draft.trim()} onClick={() => void send()}>{busy ? "Sending…" : replyTo ? "Send reply" : "Add comment"}</button>
    </section>}
  </div>;
}
