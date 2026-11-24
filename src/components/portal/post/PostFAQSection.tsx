"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CloseIcon, QuestionMarkCircleIcon } from "shivanya-ui";
import { authenticatedFetch } from "../../../lib/authenticated-fetch";
import { getPortalApiUrl } from "../category/CategoryGrid";
import type { PostFAQ } from "../data/portal-data";
import "./PostFAQSection.css";

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
    error: "प्रश्न भेजा नहीं जा सका। कृपया फिर से प्रयास करें।",
    required: "कृपया अपना प्रश्न लिखें।",
  },
} as const;

export function PostFAQSection({ postId, faqs, language }: Props) {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [questionDraft, setQuestionDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submittedQuestions, setSubmittedQuestions] = useState<Array<{ id: number; question: string }>>([]);

  const locale = language === "mr" || language === "hi" ? language : "en";
  const labels = copy[locale];

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

  async function submitQuestion() {
    const question = questionDraft.trim();
    if (!question) {
      setError(labels.required);
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
          {faqs.map((faq, index) => {
            const isExpanded = expandedItems.includes(index);
            const question = getLocalizedText(language, faq.question_en, faq.question_mr, faq.question_hi) || faq.question_en;
            const answer = getLocalizedText(language, faq.answer_en, faq.answer_mr, faq.answer_hi) || faq.answer_en;
            const answerId = `portal-faq-answer-${faq.id ?? index}`;

            return (
              <div className={`portal-faq-item${isExpanded ? " is-open" : ""}`} key={faq.id ?? index}>
                <button
                  type="button"
                  className="portal-faq-question"
                  aria-expanded={isExpanded}
                  aria-controls={answerId}
                  onClick={() => setExpandedItems((current) => isExpanded ? current.filter((item) => item !== index) : [...current, index])}
                >
                  <span>{question}</span>
                  <span className="portal-faq-chevron" aria-hidden="true" />
                </button>
                <div id={answerId} className="portal-faq-answer-panel" aria-hidden={!isExpanded}>
                  <div className="portal-faq-answer-inner"><p>{answer}</p></div>
                </div>
              </div>
            );
          })}
          {submittedQuestions.map((item) => (
            <div className="portal-faq-item portal-faq-pending" key={`pending-${item.id}`}>
              <div className="portal-faq-question portal-faq-pending-question">
                <span>{item.question}</span>
                <span className="portal-faq-review-status">{labels.underReview}</span>
              </div>
            </div>
          ))}
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
            <div className="portal-ask-question-footer">
              <span className={error ? "has-error" : ""} role={error ? "alert" : undefined}>{error || `${questionDraft.length}/500`}</span>
              <div>
                <button type="button" className="portal-ask-question-cancel" onClick={() => setModalOpen(false)} disabled={submitting}>{labels.cancel}</button>
                <button type="button" className="portal-ask-question-submit" onClick={() => void submitQuestion()} disabled={submitting || !questionDraft.trim()}>{submitting ? labels.submitting : labels.submit}</button>
              </div>
            </div>
          </section>
        </div>
      ), document.body) : null}
    </section>
  );
}
