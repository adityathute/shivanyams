"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { API_URL } from "../../components/portal/category/CategoryGrid";
import { adminFetch } from "./admin-utils";

type EditorialNotification = {
  id: number;
  title: string;
  message: string;
  action_url: string;
  created_at: string;
  read_at: string | null;
};

export default function EditorialNotificationCenter() {
  const [items, setItems] = useState<EditorialNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const response = await adminFetch(`${API_URL}/editorial/notifications/?limit=30`);
      if (!response.ok) return;
      const data = await response.json();
      setItems(Array.isArray(data.results) ? data.results : []);
      setUnread(Number(data.unread_count) || 0);
    } catch {
      // Notification availability must not block the admin workspace.
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const markRead = async (ids: number[], all = false) => {
    setBusy(true);
    try {
      const response = await adminFetch(`${API_URL}/editorial/notifications/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(all ? { all: true } : { ids }),
      });
      if (response.ok) await refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="editorial-notification-center">
      <button type="button" onClick={() => { setOpen((value) => !value); void refresh(); }} aria-expanded={open}>
        Notifications {unread > 0 && <span aria-label={`${unread} unread`}>{unread > 99 ? "99+" : unread}</span>}
      </button>
      {open && (
        <section className="editorial-notification-panel" aria-label="Editorial notifications">
          <header>
            <strong>Editorial notifications</strong>
            <button type="button" disabled={busy || unread === 0} onClick={() => void markRead([], true)}>Mark all read</button>
          </header>
          {items.length === 0 ? <p>No notifications yet.</p> : items.map((item) => (
            <article key={item.id} data-unread={!item.read_at}>
              <div><strong>{item.title}</strong><p>{item.message}</p><small>{new Date(item.created_at).toLocaleString()}</small></div>
              <div className="editorial-notification-actions">
                {item.action_url && <Link href={item.action_url} onClick={() => { if (!item.read_at) void markRead([item.id]); }}>Open</Link>}
                {!item.read_at && <button type="button" disabled={busy} onClick={() => void markRead([item.id])}>Mark read</button>}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
