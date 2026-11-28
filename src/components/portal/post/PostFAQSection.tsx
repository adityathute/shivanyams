/*
 * File Location: shivanyams/src/components/portal/post/PostFAQSection.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: a3e802f7ba90b45a1d57fd180d9672e768de93fd
 * Both repositories are read-only references.
 * Cleanup Status: Cleanup Pending
 * Cleanup Info: Batch 12 post-detail audit. UI Audit: 5 SDK components: CloseIcon, ConfirmDialog, DeleteIcon, FavoriteIcon as LikeIcon, QuestionMarkCircleIcon. CSS mapping: PostFAQSection.css (116 selector blocks; 95 unique; 19 repeated selector names / 21 repeated occurrences). Legacy CSS cascade, modal accessibility and moderation-flow verification pending.
 */
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "shivanya-auth";
import { CloseIcon, ConfirmDialog, DeleteIcon, FavoriteIcon as LikeIcon, QuestionMarkCircleIcon } from "shivanya-ui";
import { authenticatedFetch } from "../../../lib/authenticated-fetch";
import { getPortalApiUrl } from "../category/CategoryGrid";
import { usePortalAuth } from "../context/PortalAuthContext";
import type { PostFAQ } from "../data/portal-data";
import { getCommentModerationIssue } from "./comment-moderation";
import "./../../../styles/legacy/components/portal/post/PostFAQSection.css";

type Props = {
  postId: number;
  faqs: PostFAQ[];
  language: string;
};

function getLocalizedText(language: string, en?: string, mr?: string, hi?: string) {
  const values = language === "mr"
    ? [mr, en, hi]
    : language === "hi"
      ? [hi, en, mr]
      : [en, mr, hi];

  return values.find((value) => value?.trim()) || "";
}

const copy = {
  en: {
    heading: "Frequently Asked Questions (FAQ)",
    emptyTitle: "No questions yet",
    emptyDescription: "Be the first to ask a question.",
    ask: "Ask Question",
    title: "Ask a question",
    description: "Have a question about this post? Send it to our team.",
    placeholder: "Write your question here...",
    cancel: "Cancel",
    submit: "Submit question",
    submitting: "Submitting...",
    success: "Your question has been submitted. It is now under review.",
    underReview: "Under review",
    publicLabel: "Public", privateLabel: "Private", helpful: "Helpful", markedHelpful: "Marked helpful",
    error: "Unable to submit your question. Please try again.",
    required: "Please enter your question.",
  },
  mr: {
    heading: "वारंवार विचारले जाणारे प्रश्न (FAQ)",
    emptyTitle: "अजून कोणतेही प्रश्न नाहीत",
    emptyDescription: "प्रश्न विचारणारे पहिले व्हा.",
    ask: "प्रश्न विचारा",
    title: "प्रश्न विचारा",
    description: "या पोस्टबद्दल काही प्रश्न आहे? आम्हाला पाठवा.",
    placeholder: "तुमचा प्रश्न येथे लिहा...",
    cancel: "रद्द करा",
    submit: "प्रश्न पाठवा",
    submitting: "पाठवत आहे...",
    success: "तुमचा प्रश्न पाठवला आहे. तो सध्या तपासणीसाठी आहे.",
    underReview: "तपासणी सुरू आहे",
    publicLabel: "सार्वजनिक", privateLabel: "खाजगी", helpful: "उपयुक्त", markedHelpful: "उपयुक्त म्हणून नोंदवले",
    error: "प्रश्न पाठवता आला नाही. कृपया पुन्हा प्रयत्न करा.",
    required: "कृपया तुमचा प्रश्न लिहा.",
  },
  hi: {
    heading: "अक्सर पूछे जाने वाले प्रश्न (FAQ)",
    emptyTitle: "अभी तक कोई प्रश्न नहीं",
    emptyDescription: "प्रश्न पूछने वाले पहले व्यक्ति बनें.",
    ask: "प्रश्न पूछें",
    title: "प्रश्न पूछें",
    description: "इस पोस्ट के बारे में कोई सवाल है? हमें भेजें।",
    placeholder: "अपना प्रश्न यहाँ लिखें...",
    cancel: "रद्द करें",
    submit: "प्रश्न भेजें",
    submitting: "भेज रहे हैं...",
    success: "आपका प्रश्न भेज दिया गया है। यह अभी समीक्षा के अधीन है।",
    underReview: "समीक्षा के अधीन",
    publicLabel: "सार्वजनिक", privateLabel: "निजी", helpful: "उपयोगी", markedHelpful: "उपयोगी के रूप में दर्ज",
    error: "प्रश्न भेजा नहीं जा सका। कृपया फिर से प्रयास करें।",
    required: "कृपया अपना प्रश्न लिखें।",
  },
} as const;

export function PostFAQSection({ postId, faqs, language }: Props) {
  const { user } = useAuth();
  const { openLogin } = usePortalAuth();
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [questionDraft, setQuestionDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submittedQuestions, setSubmittedQuestions] = useState<Array<{ id: number; question: string }>>([]);
  const [deleteQuestionId, setDeleteQuestionId] = useState<number | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState(false);
  const [deletedPendingQuestionIds, setDeletedPendingQuestionIds] = useState<number[]>([]);
  const [helpfulStates, setHelpfulStates] = useState<Record<number, { count: number; voted: boolean; busy?: boolean; feedback?: boolean }>>({});

  const locale = language === "mr" || language === "hi" ? language : "en";
  const labels = copy[locale];
  const questionModerationIssue = getCommentModerationIssue(questionDraft);

  useEffect(() => {
    if (!user) {
      setSubmittedQuestions([]);
      return;
    }

    let cancelled = false;
    async function loadMyPendingQuestions() {
      try {
        const response = await authenticatedFetch(
          getPortalApiUrl(`content/${postId}/questions/`),
          { cache: "no-store" },
        );
        if (!response.ok) return;
        const payload = await response.json().catch(() => []);
        if (!cancelled && Array.isArray(payload)) {
          setSubmittedQuestions(payload.map((item: { id: number; question: string }) => ({
            id: Number(item.id),
            question: String(item.question || ""),
          })));
        }
      } catch {
        // Keep the locally submitted question visible if the refresh request fails.
      }
    }

    void loadMyPendingQuestions();
    return () => {
      cancelled = true;
    };
  }, [postId, user?.id]);

  useEffect(() => {
    if (!modalOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) setModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen, submitting]);

  useEffect(() => {
    if (!modalOpen) return;
    const previousOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previousOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [modalOpen]);

  function capitalizeFirstCharacter(value: string) {
    const clean = value.trim();
    if (!clean) return "";
    const characters = Array.from(clean);
    characters[0] = characters[0].toLocaleUpperCase(locale);
    return characters.join("");
  }

  function ensureQuestionMark(value: string) {
    const capitalized = capitalizeFirstCharacter(value);
    if (!capitalized || /[?؟]$/.test(capitalized)) return capitalized;
    return capitalized + "?";
  }

  useEffect(() => {
    const ids = faqs.filter((faq) => typeof faq.id === "number" && faq.id < 0 && faq.status !== "under_review" && Boolean(faq.answer_en)).map((faq) => Math.abs(Number(faq.id)));
    if (!ids.length) return;
    let cancelled = false;
    Promise.all(ids.map(async (id) => {
      try {
        const response = await fetch(getPortalApiUrl("questions/" + id + "/helpful/"), { credentials: "include", cache: "no-store" });
        if (!response.ok) return null;
        const payload = await response.json();
        return [id, { count: Number(payload.helpful_count) || 0, voted: Boolean(payload.has_voted) }] as const;
      } catch { return null; }
    })).then((results) => {
      if (cancelled) return;
      setHelpfulStates((current) => { const next = { ...current }; results.forEach((result) => { if (result) next[result[0]] = result[1]; }); return next; });
    });
    return () => { cancelled = true; };
  }, [faqs]);

  async function markHelpful(questionId: number) {
    const current = helpfulStates[questionId];
    if (current?.voted || current?.busy) return;
    setHelpfulStates((state) => ({ ...state, [questionId]: { count: current?.count || 0, voted: false, busy: true } }));
    try {
      const response = await fetch(getPortalApiUrl("questions/" + questionId + "/helpful/"), { method: "POST", credentials: "include" });
      if (!response.ok) throw new Error("Unable to record vote");
      const payload = await response.json();
      setHelpfulStates((state) => ({ ...state, [questionId]: { count: Number(payload.helpful_count) || 0, voted: true, busy: false, feedback: true } }));
      window.setTimeout(() => {
        setHelpfulStates((state) => ({ ...state, [questionId]: { ...state[questionId], feedback: false } }));
      }, 5000);
    } catch {
      setHelpfulStates((state) => ({ ...state, [questionId]: { count: current?.count || 0, voted: false, busy: false } }));
    }
  }
  async function deletePendingQuestion() {
    if (!deleteQuestionId || deletingQuestion) return;
    setDeletingQuestion(true);
    try {
      const response = await authenticatedFetch(
        getPortalApiUrl(`content/${postId}/questions/${deleteQuestionId}/`),
        { method: "DELETE" },
      );
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail || "Unable to delete your question.");
      }
      setSubmittedQuestions((current) => current.filter((item) => item.id !== deleteQuestionId));
      setDeletedPendingQuestionIds((current) => [...current, deleteQuestionId]);
      setDeleteQuestionId(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete your question.");
      setDeleteQuestionId(null);
    } finally {
      setDeletingQuestion(false);
    }
  }

  async function submitQuestion() {
    const question = ensureQuestionMark(questionDraft);
    if (!question) {
      setError(labels.required);
      return;
    }
    const moderationIssue = getCommentModerationIssue(question);
    if (moderationIssue) {
      setError(moderationIssue);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await authenticatedFetch(
        getPortalApiUrl(`content/${postId}/questions/`),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, language: locale }),
        },
      );
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.question || payload.detail || labels.error);
      }
      const payload = await response.json().catch(() => ({}));
      setSubmittedQuestions((current) => [
        ...current,
        { id: Number(payload.id) || Date.now(), question },
      ]);
      setQuestionDraft("");
      setModalOpen(false);
      setSuccess(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : labels.error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="portal-faq-section" aria-labelledby="portal-faq-heading">
      <div className="portal-faq-heading">
        <h2 id="portal-faq-heading">{labels.heading}</h2>
        <button
          type="button"
          className="portal-faq-ask-button"
          onClick={() => {
            if (!user) {
              openLogin(() => {
                setError("");
                setSuccess(false);
                setModalOpen(true);
              });
              return;
            }
            setError("");
            setSuccess(false);
            setModalOpen(true);
          }}
        >
          <QuestionMarkCircleIcon size={17} />
          <span>{labels.ask}</span>
        </button>
      </div>

      {success ? <p className="portal-faq-question-success" role="status">{labels.success}</p> : null}

      {faqs?.length || submittedQuestions.length ? (
        <div className="portal-faq-list">
          {submittedQuestions.filter((item) => !deletedPendingQuestionIds.includes(item.id) && !faqs.some((faq) => faq.id === -item.id)).map((item) => (
            <div className="portal-faq-item portal-faq-pending" key={`pending-${item.id}`}>
              <div className="portal-faq-question portal-faq-pending-question">
                <span className="portal-faq-pending-text">{ensureQuestionMark(item.question)}</span>
                <div className="portal-faq-pending-actions">
                  <span className="portal-faq-review-status">{labels.underReview}</span>
                  <button type="button" className="portal-faq-delete-button" onClick={() => setDeleteQuestionId(item.id)} aria-label="Delete your question" title="Delete question">
                    <DeleteIcon size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {[...faqs].sort((a, b) => Number(b.status === "under_review") - Number(a.status === "under_review")).map((faq, index) => {
            const isPending = faq.status === "under_review";
            const isExpanded = !isPending && expandedItems.includes(index);
            const rawQuestion = getLocalizedText(language, faq.question_en, faq.question_mr, faq.question_hi) || faq.question_en;
            const question = ensureQuestionMark(rawQuestion);
            const questionId = Math.abs(Number(faq.id || 0));
            const helpful = helpfulStates[questionId] || { count: Number(faq.helpful_count) || 0, voted: false };
            const askedBy = faq.is_mine ? "You" : (faq.author_name || "Member");
            const answer = capitalizeFirstCharacter(getLocalizedText(language, faq.answer_en, faq.answer_mr, faq.answer_hi) || faq.answer_en);
            const answerId = `portal-faq-answer-${faq.id ?? index}`;

            if (isPending) {
              if (deletedPendingQuestionIds.includes(questionId)) return null;
              return (
                <div className="portal-faq-item portal-faq-pending" key={faq.id ?? index}>
                  <div className="portal-faq-question portal-faq-pending-question">
                    <span className="portal-faq-pending-text">{question}</span>
                    {faq.is_mine ? (
                      <div className="portal-faq-pending-actions">
                        <span className="portal-faq-review-status">{labels.underReview}</span>
                        <button type="button" className="portal-faq-delete-button" onClick={() => setDeleteQuestionId(questionId)} aria-label="Delete your question" title="Delete question">
                          <DeleteIcon size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="portal-faq-pending-actions">
                        <span className="portal-faq-review-status">{labels.underReview}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div className={`portal-faq-item${isExpanded ? " is-open" : ""}`} key={faq.id ?? index}>
                <button
                  type="button"
                  className="portal-faq-question"
                  aria-expanded={isExpanded}
                  aria-controls={answerId}
                  onClick={() => setExpandedItems((current) => isExpanded ? current.filter((item) => item !== index) : [...current, index])}
                >
                  <span className="portal-faq-question-content">
                    <span className="portal-faq-question-text">{question}</span>
                    {isExpanded && faq.visibility ? <span className="portal-faq-asked-by">Asked by {askedBy}{helpful.count > 0 ? <span className="portal-faq-helpful-summary"> · Helpful ({helpful.count})</span> : null}</span> : null}
                  </span>
                  <span className="portal-faq-question-side"><span className="portal-faq-chevron" aria-hidden="true" /></span>
                </button>
                <div id={answerId} className="portal-faq-answer-panel" aria-hidden={!isExpanded}>
                  <div className={`portal-faq-answer-inner${helpful.feedback ? " has-helpful-feedback" : ""}`}>
                    <p>{answer}</p>
                    {faq.id && faq.id < 0 && (!helpful.voted || helpful.feedback) ? (
                      <div className="portal-faq-helpful-row">
                        {helpful.feedback ? (
                          <span className="portal-faq-thank-you" role="status">Thank you for your feedback!</span>
                        ) : (
                          <button
                            type="button"
                            className="portal-faq-helpful-button"
                            onClick={() => void markHelpful(questionId)}
                            disabled={Boolean(helpful.busy)}
                          >
                            <LikeIcon size="sm" />
                            <span>{labels.helpful}</span>
                          </button>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="portal-faq-empty-state">
          <span className="portal-faq-empty-icon" aria-hidden="true">
            <QuestionMarkCircleIcon size={25} />
          </span>
          <h3>{labels.emptyTitle}</h3>
          <p>{labels.emptyDescription}</p>
        </div>
      )}

      {deleteQuestionId !== null && typeof document !== "undefined" ? createPortal(
        <ConfirmDialog
          open
          title="Delete question permanently?"
          message="Your question will be permanently deleted and removed from this post. This action cannot be undone."
          confirmText={deletingQuestion ? "Deleting..." : "Delete permanently"}
          cancelText="Cancel"
          variant="danger"
          loading={deletingQuestion}
          onCancel={() => { if (!deletingQuestion) setDeleteQuestionId(null); }}
          onConfirm={() => void deletePendingQuestion()}
        />,
        document.body,
      ) : null}

      {modalOpen ? createPortal((
        <div
          className="portal-ask-question-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) setModalOpen(false);
          }}
        >
          <section className="portal-ask-question-modal" role="dialog" aria-modal="true" aria-labelledby="portal-ask-question-title">
            <div className="portal-ask-question-modal-heading">
              <div>
                <span className="portal-ask-question-icon"><QuestionMarkCircleIcon size={21} /></span>
                <div>
                  <h3 id="portal-ask-question-title">{labels.title}</h3>
                  <p>{labels.description}</p>
                </div>
              </div>
              <button type="button" className="portal-ask-question-close" onClick={() => setModalOpen(false)} disabled={submitting} aria-label="Close dialog">
                <CloseIcon size={18} />
              </button>
            </div>
            <label className="portal-ask-question-label" htmlFor="portal-ask-question-input">{labels.title}</label>
            <textarea
              id="portal-ask-question-input"
              value={questionDraft}
              onChange={(event) => {
                setQuestionDraft(event.target.value);
                if (error) setError("");
              }}
              placeholder={labels.placeholder}
              rows={5}
              maxLength={500}
              autoFocus
              disabled={submitting}
            />
            {questionModerationIssue ? <p className="portal-faq-moderation-warning" role="alert">{questionModerationIssue}</p> : null}
            <div className="portal-ask-question-footer">
              <span className={error ? "has-error" : ""} role={error ? "alert" : undefined}>{error || `${questionDraft.length}/500`}</span>
              <div>
                <button type="button" className="portal-ask-question-cancel" onClick={() => setModalOpen(false)} disabled={submitting}>{labels.cancel}</button>
                <button type="button" className="portal-ask-question-submit" onClick={() => void submitQuestion()} disabled={submitting || !questionDraft.trim() || Boolean(questionModerationIssue)}>{submitting ? labels.submitting : labels.submit}</button>
              </div>
            </div>
          </section>
        </div>
      ), document.body) : null}
    </section>
  );
}
