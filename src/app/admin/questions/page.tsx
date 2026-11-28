/* File Location: shivanyams/src/app/admin/questions/page.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 312c7c24b5ab1211f534ce9c2f871004d0441398
 * Both repositories are read-only references.
 */
// Cleanup Status: Cleanup Pending

// Cleanup Information: Legacy admin/question CSS imports remain; question API payload and mutation contract need verification before marking clean.

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
import { ArrowLeftIcon, CloseIcon, QuestionMarkCircleIcon, RefreshIcon, Select } from "shivanya-ui";
import { API_URL } from "../../../components/portal/category/CategoryGrid";
import { adminFetch, formatCompactNumber } from "../admin-utils";
import "./../../../styles/legacy/app/admin/admin.css";
import "./../../../styles/legacy/app/admin/questions/questions.css";

type QuestionRow = {
  id: number;
  post: number;
  post_title: string;
  post_slug: string;
  author_name: string;
  user_auth_id: string;
  question: string;
  language: string;
  answer: string;
  answer_visibility: "public" | "private" | "hidden";
  answered: boolean;
  status: "active" | "deleted";
  helpful_count: number;
  created_at: string;
  answered_at: string | null;
};

type StatusFilter = "all" | "unanswered" | "answered" | "deleted";

export default function AdminQuestionsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAdmin = user?.roles?.includes("admin") === true;
  const [rows, setRows] = useState<QuestionRow[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [loadingRows, setLoadingRows] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionRow | null>(null);
  const [questionDraft, setQuestionDraft] = useState("");
  const [answerDraft, setAnswerDraft] = useState("");
  const [answerVisibility, setAnswerVisibility] = useState<"public" | "private" | "hidden">("public");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const loadQuestions = useCallback(async () => {
    setLoadingRows(true);
    setError("");
    try {
      const response = await adminFetch(`${API_URL}/admin/questions/?status=all`, { cache: "no-store" });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail || "Unable to load questions.");
      }
      const payload = await response.json();
      setRows(Array.isArray(payload.results) ? payload.results : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load questions.");
    } finally {
      setLoadingRows(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !isAdmin) router.replace("/");
  }, [loading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) void loadQuestions();
  }, [isAdmin, loadQuestions]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesStatus = statusFilter === "all"
        || (statusFilter === "deleted" ? row.status === "deleted"
          : row.status === "active" && (statusFilter === "answered" ? row.answered : !row.answered));
      const matchesSearch = !query || [
        row.question,
        row.answer,
        row.post_title,
        row.author_name,
        row.user_auth_id,
        String(row.id),
        String(row.post),
      ].some((value) => String(value ?? "").toLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [rows, search, statusFilter]);

  const activeRows = rows.filter((row) => row.status === "active");
  const answeredCount = activeRows.filter((row) => row.answered).length;
  const unansweredCount = activeRows.length - answeredCount;
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visibleRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  function openAnswer(row: QuestionRow) {
    setSelectedQuestion(row);
    setQuestionDraft(row.question || "");
    setAnswerDraft(row.answer || "");
    setAnswerVisibility(row.answer_visibility || "public");
    setError("");
  }

  async function saveAnswer() {
    if (!selectedQuestion || !questionDraft.trim() || !answerDraft.trim()) return;
    setSaving(true);
    setError("");
    try {
      const response = await adminFetch(`${API_URL}/admin/questions/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedQuestion.id,
          question: questionDraft.trim(),
          answer: answerDraft.trim(),
          answer_visibility: answerVisibility,
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.answer || payload.detail || "Unable to save the answer.");
      }
      setSelectedQuestion(null);
      setQuestionDraft("");
      setAnswerDraft("");
      await loadQuestions();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save the answer.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !isAdmin) return null;

  return (
    <main className="admin-page admin-questions-page">
      <div className="admin-shell">
        <header className="admin-topbar">
          <div>
            <span className="admin-eyebrow">SHIVANYAMS COMMUNITY</span>
            <h1>Questions</h1>
            <p>Review questions submitted by visitors and publish official answers in the post FAQ.</p>
          </div>
          <div className="admin-top-actions admin-questions-header-actions">
            <Link href="/admin" className="admin-secondary-button"><ArrowLeftIcon size={16} /><span>Back to dashboard</span></Link>
            <button type="button" className="admin-secondary-button" onClick={() => void loadQuestions()} disabled={loadingRows}>
              <RefreshIcon size={16} /><span>Refresh</span>
            </button>
          </div>
        </header>

        <section className="admin-post-panel admin-questions-panel">
          <div className="admin-panel-heading admin-questions-panel-heading">
            <div>
              <h2><QuestionMarkCircleIcon size={18} /> Post Questions</h2>
              <p>Publish answers to everyone or privately to the person who asked. You can also correct the question.</p>
            </div>
            <div className="admin-questions-totals">
              <div><strong>{formatCompactNumber(activeRows.length)}</strong><span>Total questions</span></div>
              <div><strong>{formatCompactNumber(unansweredCount)}</strong><span>Awaiting answer</span></div>
              <div><strong>{formatCompactNumber(answeredCount)}</strong><span>Answered</span></div>
            </div>
          </div>

          <div className="admin-filters admin-questions-filters">
            <input
              type="search"
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              placeholder="Search question, answer or post..."
              aria-label="Search questions"
            />
            <Select
              size="sm"
              fullWidth
              value={statusFilter}
              onChange={(event) => { setStatusFilter(event.target.value as StatusFilter); setPage(1); }}
              aria-label="Filter questions"
              options={[
                { value: "all", label: "All questions" },
                { value: "unanswered", label: "Awaiting answer" },
                { value: "answered", label: "Answered" },
                { value: "deleted", label: "Deleted" },
              ]}
            />
          </div>

          {error ? <div className="admin-error" role="alert">{error}</div> : null}
          {loadingRows ? <div className="admin-empty">Loading questions...</div> : filteredRows.length === 0 ? (
            <div className="admin-empty">No questions match these filters.</div>
          ) : (
            <div className="admin-table-wrap admin-questions-table-wrap">
              <table className="admin-post-table admin-questions-table">
                <thead><tr><th>Question</th><th>Post</th><th>Asked by</th><th>Language</th><th>Helpful</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={row.id}>
                      <td className="admin-questions-content"><span title={row.question}>{row.question}</span></td>
                      <td className="admin-questions-post"><span title={row.post_title || `Post #${row.post}`}>{row.post_title || `Post #${row.post}`}</span></td>
                      <td>{row.author_name || "Guest"}</td>
                      <td><span className="admin-questions-language">{({ en: "English", mr: "Marathi", hi: "Hindi" } as Record<string, string>)[row.language] || row.language.toUpperCase()}</span></td>
                      <td><span className="admin-questions-helpful-count" title={`${row.helpful_count || 0} helpful votes`}>{formatCompactNumber(row.helpful_count || 0)}</span></td>
                      <td><span className={`admin-status admin-questions-status ${row.status === "deleted" ? "status-rejected" : row.answered ? "status-approved" : "status-pending"}`}>{row.status === "deleted" ? "Deleted" : row.answered ? "Answered" : "Awaiting answer"}</span>{row.status === "active" && row.answered ? <span className={`admin-questions-visibility ${row.answer_visibility === "public" ? "is-public" : row.answer_visibility === "private" ? "is-private" : "is-hidden"}`}>{({ public: "Public", private: "Private", hidden: "Hidden" } as Record<string, string>)[row.answer_visibility || "public"]}</span> : null}</td>
                      <td className="admin-questions-date">{new Date(row.created_at).toLocaleString()}</td>
                      <td>{row.status === "deleted" ? <span className="admin-questions-deleted-action">Kept in records</span> : <button type="button" className="admin-questions-answer-button" onClick={() => openAnswer(row)}>{row.answered ? "Edit answer" : "Answer"}</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="admin-table-footer">
            <span>Showing {filteredRows.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filteredRows.length)} of {formatCompactNumber(filteredRows.length)} questions</span>
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

      {selectedQuestion ? (
        <div className="admin-questions-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !saving) setSelectedQuestion(null);
        }}>
          <section className="admin-questions-modal" role="dialog" aria-modal="true" aria-labelledby="admin-questions-modal-title">
            <div className="admin-questions-modal-head">
              <div>
                <span className="admin-eyebrow">SHIVANYAMS COMMUNITY</span>
                <h2 id="admin-questions-modal-title">{selectedQuestion.answered ? "Edit answer" : "Answer question"}</h2>
                <p>Your answer will be published in this post&apos;s FAQ.</p>
              </div>
              <button type="button" onClick={() => setSelectedQuestion(null)} disabled={saving} aria-label="Close answer dialog"><CloseIcon size={18} /></button>
            </div>
            <div className="admin-questions-context">
              <span>POST</span>
              <strong>{selectedQuestion.post_title || `Post #${selectedQuestion.post}`}</strong>
              <span>ORIGINAL VISITOR QUESTION</span>
              <p>{selectedQuestion.question}</p>
            </div>
            <label htmlFor="admin-question-correction">Question (you can correct the wording)</label>
            <textarea id="admin-question-correction" value={questionDraft} onChange={(event) => setQuestionDraft(event.target.value)} rows={3} maxLength={500} placeholder="Correct the visitor question..." disabled={saving} />
            <label htmlFor="admin-question-answer">Official answer</label>
            <textarea id="admin-question-answer" value={answerDraft} onChange={(event) => setAnswerDraft(event.target.value)} rows={5} maxLength={2000} placeholder="Write the official answer..." disabled={saving} />
            <div className="admin-questions-visibility-control">
              <label htmlFor="admin-question-visibility">Answer visibility</label>
              <Select
                size="sm"
                fullWidth
                value={answerVisibility}
                onChange={(event) => setAnswerVisibility(event.target.value as "public" | "private" | "hidden")}
                aria-label="Answer visibility"
                options={[
                  { value: "public", label: "Public — show in this post&apos;s FAQ for everyone" },
                  { value: "private", label: "Private — show only to the person who asked", disabled: !selectedQuestion.user_auth_id },
                  { value: "hidden", label: "Don't show anyone — keep it in Admin only" },
                ]}
              />
              {!selectedQuestion.user_auth_id ? <small>This question was submitted as a guest, so a private answer is unavailable. You can still publish it publicly or keep it hidden from everyone.</small> : null}
            </div>
            {error ? <p className="admin-questions-modal-error" role="alert">{error}</p> : null}
            <div className="admin-questions-modal-footer">
              <span>{answerDraft.length}/2000</span>
              <div>
                <button type="button" className="cancel" onClick={() => setSelectedQuestion(null)} disabled={saving}>Cancel</button>
                <button type="button" className="save" onClick={() => void saveAnswer()} disabled={saving || !questionDraft.trim() || !answerDraft.trim()}>{saving ? "Saving..." : "Save changes"}</button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
      <footer className="admin-footer">ShivanyaMS · Questions</footer>
    </main>
  );
}
