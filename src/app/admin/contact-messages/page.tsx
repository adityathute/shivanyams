"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
import { ArrowLeftIcon, Avatar, CloseIcon, IconButton, MailIcon, RefreshIcon, Select } from "shivanya-ui";
import { API_URL } from "../../../components/portal/category/CategoryGrid";
import { adminFetch, formatCompactNumber } from "../admin-utils";
import "./../../../styles/legacy/app/admin/admin.css";
import "./../../../styles/legacy/app/admin/comments/comments.css";
import "./../../../styles/legacy/app/admin/contact-messages/contact-messages.css";
import "./../../../styles/legacy/app/admin/contact-messages/contact-messages-type-column.css";
import "./../../../styles/legacy/app/admin/contact-messages/contact-messages-user-column.css";
import "./../../../styles/legacy/app/admin/contact-messages/contact-messages-stats.css";
import "./../../../styles/legacy/app/admin/contact-messages/contact-messages-filters.css";
import "./../../../styles/legacy/app/admin/contact-messages/contact-message-profile.css";

type ContactMessage = {
  id: number;
  submission_type: "contact" | "feedback";
  name: string;
  email: string;
  user_full_name: string;
  user_avatar: string;
  user_auth_id: string;
  is_registered_user: boolean;
  category: string;
  rating: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied";
  admin_reply: string;
  created_at: string;
  replied_at: string | null;
};

type Filter = "all" | "contact" | "feedback";
type StatusFilter = "all" | "new" | "read" | "replied";

export default function AdminContactMessagesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAdmin = user?.roles?.includes("admin") === true;
  const [rows, setRows] = useState<ContactMessage[]>([]);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [reply, setReply] = useState("");
  const [typeFilter, setTypeFilter] = useState<Filter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [loadingRows, setLoadingRows] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const loadMessages = useCallback(async () => {
    setLoadingRows(true);
    setError("");
    try {
      const response = await adminFetch(`${API_URL}/admin/contact-messages/`, { cache: "no-store" });
      const payload = await response.json().catch(() => []);
      if (!response.ok) throw new Error(payload.detail || "Unable to load contact messages.");
      setRows(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load contact messages.");
    } finally {
      setLoadingRows(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !isAdmin) router.replace("/");
  }, [loading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) void loadMessages();
  }, [isAdmin, loadMessages]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesType = typeFilter === "all" || row.submission_type === typeFilter;
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      const matchesSearch = !query || [
        row.name, row.user_full_name, row.user_auth_id, row.email, row.category,
        row.subject, row.message, row.rating, String(row.id), row.submission_type, row.status,
      ].some((value) => String(value ?? "").toLowerCase().includes(query));
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [rows, search, typeFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visibleRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { if (page > pageCount) setPage(pageCount); }, [page, pageCount]);

  const newCount = rows.filter((row) => row.status === "new").length;
  const repliedCount = rows.filter((row) => row.status === "replied").length;

  async function openMessage(row: ContactMessage) {
    setSelected(row);
    setReply(row.admin_reply || "");
    setNotice("");
    setError("");
    if (row.status !== "new") return;
    try {
      const response = await adminFetch(`${API_URL}/admin/contact-messages/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, action: "read" }),
      });
      if (response.ok) {
        setRows((current) => current.map((item) => item.id === row.id ? { ...item, status: "read" } : item));
        setSelected((current) => current?.id === row.id ? { ...current, status: "read" } : current);
      }
    } catch {
      // Opening the message should remain available even if the read marker fails.
    }
  }

  async function sendReply() {
    if (!selected || !reply.trim() || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await adminFetch(`${API_URL}/admin/contact-messages/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, action: "reply", reply: reply.trim() }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Unable to send email reply.");
      const updated = { ...selected, status: "replied" as const, admin_reply: reply.trim(), replied_at: payload.replied_at };
      setSelected(updated);
      setRows((current) => current.map((item) => item.id === selected.id ? updated : item));
      setNotice(`Reply sent successfully to ${selected.email}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send email reply.");
    } finally {
      setBusy(false);
    }
  }

  if (loading || !isAdmin) return null;

  return (
    <main className="admin-page admin-contact-messages-page">
      <div className="admin-shell">
        <header className="admin-topbar">
          <div>
            <span className="admin-eyebrow">SHIVANYAMS COMMUNITY</span>
            <h1>Contact & Feedback</h1>
            <p>Read website enquiries and feedback, then reply directly to the sender by email.</p>
          </div>
          <div className="admin-top-actions admin-comments-header-actions">
            <Link href="/admin" className="admin-secondary-button"><ArrowLeftIcon size={16} /><span>Back to dashboard</span></Link>
            <button type="button" className="admin-secondary-button" onClick={() => void loadMessages()} disabled={loadingRows}><RefreshIcon size={16} /><span>Refresh</span></button>
          </div>
        </header>

        <section className="admin-post-panel admin-comments-panel admin-contact-messages-panel">
          <div className="admin-panel-heading admin-comments-panel-heading">
            <div>
              <h2><MailIcon size={18} /> Inbox</h2>
              <p>All submissions are stored in the portal database.</p>
            </div>
            <div className="admin-comments-totals">
              <div className="admin-comments-total"><strong>{formatCompactNumber(rows.length)}</strong><span>Total messages</span></div>
              <div className="admin-comments-total"><strong>{formatCompactNumber(newCount)}</strong><span>New</span></div>
              <div className="admin-comments-total"><strong>{formatCompactNumber(repliedCount)}</strong><span>Replied</span></div>
            </div>
          </div>

          <div className="admin-filters admin-contact-messages-filters">
            <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search sender, email, subject or message..." aria-label="Search messages" />
            <Select size="sm" fullWidth value={typeFilter} onChange={(event) => { setTypeFilter(event.target.value as Filter); setPage(1); }} aria-label="Filter submission type" options={[{ value: "all", label: "All submissions" }, { value: "contact", label: "Contact enquiries" }, { value: "feedback", label: "Feedback" }]} />
            <Select size="sm" fullWidth value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value as StatusFilter); setPage(1); }} aria-label="Filter message status" options={[{ value: "all", label: "All statuses" }, { value: "new", label: "New" }, { value: "read", label: "Read" }, { value: "replied", label: "Replied" }]} />
          </div>

          {error ? <div className="admin-error" role="alert">{error}</div> : null}
          {loadingRows ? <div className="admin-empty">Loading messages...</div> : filteredRows.length === 0 ? (
            <div className="admin-empty">No contact messages or feedback found.</div>
          ) : (
            <div className="admin-table-wrap admin-contact-messages-table-wrap">
              <table className="admin-post-table admin-contact-messages-table">
                <thead><tr><th>Type</th><th>Sender</th><th>User</th><th>Content</th><th>Subject</th><th>Category</th><th>Status</th><th>Received</th><th>Action</th></tr></thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={row.id} className={row.status === "new" ? "is-new" : ""}>
                      <td><span className={`admin-contact-type admin-contact-type--${row.submission_type}`}>{row.submission_type}</span></td>
                      <td><strong>{row.name || "Visitor"}</strong><small>{row.email || "No email provided"}</small></td>
                      <td>
                        {row.is_registered_user ? (
                          <div className="admin-comments-author">
                            <Avatar size="sm" name={row.user_full_name || "Member"} src={row.user_avatar?.trim() || undefined} />
                            <span>{row.user_full_name || (row.user_auth_id ? `User ${row.user_auth_id}` : "Member")}</span>
                          </div>
                        ) : "-"}
                      </td>
                      <td className="admin-contact-content" title={row.message}>{row.message || (row.submission_type === "feedback" ? "Your feedback" : "-")}</td>
                      <td className="admin-contact-subject" title={row.subject}>{row.subject}</td>
                      <td>{row.category}</td>
                      <td><span className={`admin-contact-status admin-contact-status--${row.status}`}>{row.status}</span></td>
                      <td>{new Date(row.created_at).toLocaleString()}</td>
                      <td><button type="button" className="admin-contact-open-button" onClick={() => void openMessage(row)}>View / Reply</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="admin-table-footer">
            <span>Showing {filteredRows.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filteredRows.length)} of {formatCompactNumber(filteredRows.length)} messages</span>
            <div className="admin-pagination">
              <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} aria-label="Rows per page">
                <option value={10}>10 rows</option><option value={15}>15 rows</option><option value={25}>25 rows</option><option value={50}>50 rows</option>
              </select>
              <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
              <span>Page {page} of {pageCount}</span>
              <button type="button" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)}>Next</button>
            </div>
          </div>
        </section>
      </div>

      {selected ? (
        <div className="admin-comments-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setSelected(null); }}>
          <section className="admin-comments-reply-modal admin-contact-message-modal" role="dialog" aria-modal="true" aria-labelledby="admin-contact-message-title">
            <div className="admin-comments-reply-modal-head">
              <div><span className="admin-eyebrow">{selected.submission_type === "contact" ? "CONTACT ENQUIRY" : "WEBSITE FEEDBACK"}</span><h2 id="admin-contact-message-title">{selected.subject}</h2><p>Received {new Date(selected.created_at).toLocaleString()}</p></div>
              <IconButton type="button" size="lg" variant="ghost" iconRotateOnHover className="admin-comments-reply-close" onClick={() => setSelected(null)} disabled={busy} aria-label="Close message"><CloseIcon /></IconButton>
            </div>
            {selected.is_registered_user ? (
              <div className="admin-contact-user-profile">
                <Avatar
                  size="lg"
                  name={selected.user_full_name || "Member"}
                  src={selected.user_avatar?.trim() || undefined}
                />
                <div className="admin-contact-user-profile-info">
                  <strong>{selected.user_full_name || "Registered member"}</strong>
                  <span>Registered ShivanyaMS account</span>
                  {selected.email ? <small>{selected.email}</small> : null}
                </div>
                <span className="admin-contact-user-profile-badge">Member</span>
              </div>
            ) : null}
            <div className="admin-contact-message-details">
              <div><span>From</span><strong>{selected.name || "Visitor"}</strong></div>
              <div><span>Email</span><strong>{selected.email || "Not provided"}</strong></div>
              <div><span>Category</span><strong>{selected.category}</strong></div>
              {selected.rating ? <div><span>Rating</span><strong>{selected.rating}</strong></div> : null}
            </div>
            <div className="admin-contact-message-body">{selected.message}</div>
            {selected.admin_reply ? <div className="admin-contact-previous-reply"><strong>Previous reply</strong><p>{selected.admin_reply}</p></div> : null}
            {notice ? <div className="admin-contact-inline-success" role="status">{notice}</div> : null}
            {error ? <div className="admin-error" role="alert">{error}</div> : null}
            <label className="admin-comments-reply-label" htmlFor="admin-contact-reply">Reply by email to {selected.email || "sender"}</label>
            <textarea id="admin-contact-reply" value={reply} onChange={(event) => setReply(event.target.value)} rows={5} maxLength={10000} placeholder="Write your reply..." disabled={!selected.email || busy} />
            {!selected.email ? <p className="admin-contact-no-email">This submission has no email address, so an email reply is unavailable.</p> : null}
            <div className="admin-comments-reply-modal-actions">
              <button type="button" className="cancel" onClick={() => setSelected(null)} disabled={busy}>Close</button>
              <button type="button" className="send" disabled={!selected.email || !reply.trim() || busy} onClick={() => void sendReply()}>{busy ? "Sending..." : "Send email reply"}</button>
            </div>
          </section>
        </div>
      ) : null}
      <footer className="admin-footer">ShivanyaMS · Contact & Feedback</footer>
    </main>
  );
}
