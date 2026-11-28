/*
 * File Location: shivanyams/src/components/static-pages/Feedback/FeedbackPage.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: a3e802f7ba90b45a1d57fd180d9672e768de93fd
 * Both repositories are read-only references.
 * Cleanup Status: Cleanup Pending
 * Cleanup Info: Batch 20 audit; review complete, follow-up work remains tracked in PROJECT_STRUCTURE.md.
 */
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "shivanya-auth";
import { authenticatedFetch } from "../../../lib/authenticated-fetch";
import { containsAbusiveLanguage } from "../../../lib/contact-message-moderation";
import {
  MailIcon,
  Input,
  Select,
  Textarea,
  Button,
  Typography,
} from "shivanya-ui";
import type { Language } from "shivanya-i18n";

import { usePortalLanguage } from "../../portal/context/PortalLanguageContext";
import {
  getFeedbackPageText,
  type FeedbackPageDictionaryKey,
} from "../../../i18n/dictionaries/FeedbackPageDictionary";

import { PortalFooter } from "../../portal/layout/footer/PortalFooter";
import { API_URL } from "../../portal/category/CategoryGrid";

import "./../../../styles/legacy/components/static-pages/Contact/ContactPage.css";
import "./../../../styles/legacy/components/static-pages/Feedback/FeedbackPage.css";

type FeedbackOptionKey =
  | "categoryGeneral"
  | "categorySuggestion"
  | "categoryIssue"
  | "categoryFeature"
  | "categoryOther";

type RatingOptionKey =
  | "ratingExcellent"
  | "ratingGood"
  | "ratingAverage"
  | "ratingNeedsImprovement";

const feedbackOptions: {
  labelKey: FeedbackOptionKey;
  value: string;
}[] = [
  { labelKey: "categoryGeneral", value: "General Feedback" },
  { labelKey: "categorySuggestion", value: "Suggestion" },
  { labelKey: "categoryIssue", value: "Report an Issue" },
  { labelKey: "categoryFeature", value: "Feature Request" },
  { labelKey: "categoryOther", value: "Other" },
];

const ratingOptions: {
  labelKey: RatingOptionKey;
  value: string;
}[] = [
  { labelKey: "ratingExcellent", value: "Excellent" },
  { labelKey: "ratingGood", value: "Good" },
  { labelKey: "ratingAverage", value: "Average" },
  {
    labelKey: "ratingNeedsImprovement",
    value: "Needs Improvement",
  },
];

export function FeedbackPage() {
  const { user } = useAuth();
  const { language } = usePortalLanguage();

  const t = (key: FeedbackPageDictionaryKey) =>
    getFeedbackPageText(key, language as Language);

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "General Feedback",
    rating: "Excellent",
    subject: "",
    message: "",
  });

  useEffect(() => {
    const fullName = [user?.first_name, user?.last_name]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(" ");

    setForm((current) => ({
      ...current,
      name: fullName || current.name,
      email: user?.email ?? current.email,
    }));
  }, [user?.first_name, user?.last_name, user?.email]);

  const messageHasAbusiveLanguage = containsAbusiveLanguage(form.message);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    if (messageHasAbusiveLanguage) {
      setSubmitError("Please remove abusive or insulting language before submitting.");
      return;
    }
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setSubmitSuccess("");
    setSubmitError("");
    try {
      const response = await authenticatedFetch(`${API_URL}/contact-messages/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_type: "feedback",
          ...form,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Unable to submit your feedback. Please try again.");
      setSubmitSuccess("Thank you! Your feedback has been submitted successfully.");
      setForm({ name: [user?.first_name, user?.last_name].filter(Boolean).join(" "), email: user?.email ?? "", category: "General Feedback", rating: "Excellent", subject: "", message: "" });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to submit your feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <main className="contact-page feedback-page">
        <div className="contact-page-header">
          <div>
            <Typography
              as="h1"
              variant="h1"
              className="contact-page-title"
            >
              {t("pageTitle")}
            </Typography>

            <Typography className="contact-page-description">
              {t("pageDescription")}
            </Typography>
          </div>

          <div className="contact-header-badge">
            <span className="contact-status-dot" />
            {t("feedbackBadge")}
          </div>
        </div>

        <div className="contact-layout">
          <section className="contact-left">
            <div className="contact-info-card">
              <div className="contact-card-heading">
                <span className="contact-card-label">
                  {t("voiceMatters")}
                </span>

                <h2>{t("helpImprove")}</h2>

                <p>{t("helpImproveDescription")}</p>
              </div>

              <div className="feedback-benefits">
                <div className="feedback-benefit">
                  <span className="feedback-benefit-icon">💡</span>

                  <div>
                    <strong>{t("shareIdeas")}</strong>
                    <p>{t("shareIdeasDescription")}</p>
                  </div>
                </div>

                <div className="feedback-benefit">
                  <span className="feedback-benefit-icon">🛠️</span>

                  <div>
                    <strong>{t("reportProblem")}</strong>
                    <p>{t("reportProblemDescription")}</p>
                  </div>
                </div>

                <div className="feedback-benefit">
                  <span className="feedback-benefit-icon">🚀</span>

                  <div>
                    <strong>{t("makeThingsBetter")}</strong>
                    <p>{t("makeThingsBetterDescription")}</p>
                  </div>
                </div>
              </div>

              <div className="contact-info-divider" />

              <div className="contact-response-info">
                <span className="contact-response-indicator" />

                <div>
                  <strong>{t("thankYou")}</strong>
                  <p>{t("thankYouDescription")}</p>
                </div>
              </div>
            </div>

            <div className="contact-info-card feedback-email-card">
              <span className="contact-card-label">
                {t("contactUs")}
              </span>

              <h2>{t("moreToShare")}</h2>

              <p>{t("directEmailDescription")}</p>

              <a
                className="contact-detail-item"
                href="mailto:hello@shivanyams.com"
              >
                <span className="contact-detail-icon">
                  <MailIcon size={21} />
                </span>

                <span className="contact-detail-content">
                  <small>{t("emailAddress")}</small>
                  <strong>hello@shivanyams.com</strong>
                </span>

                <span className="contact-detail-arrow">↗</span>
              </a>
            </div>
          </section>

          <section className="contact-form-card">
            <div className="contact-form-heading">
              <div>
                <span className="contact-card-label">
                  {t("sendFeedback")}
                </span>

                <h2>{t("listening")}</h2>

                <p>{t("formDescription")}</p>
              </div>

              <div className="contact-form-heading-icon">
                <MailIcon size={24} />
              </div>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              {submitSuccess ? <div className="contact-form-feedback contact-form-feedback--success" role="status">{submitSuccess}</div> : null}
              {submitError ? <div className="contact-form-feedback contact-form-feedback--error" role="alert">{submitError}</div> : null}
              <div className="contact-form-row">
                <Input
                  label={t("nameOptional")}
                  required
                  fullWidth
                  size="md"
                  autoComplete="name"
                  placeholder={t("namePlaceholder")}
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                    })
                  }
                />

                <Input
                  label={t("emailOptional")}
                  required
                  fullWidth
                  size="md"
                  type="email"
                  autoComplete="email"
                  placeholder={t("emailPlaceholder")}
                  disabled={Boolean(user?.email)}
                  value={form.email}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      email: event.target.value,
                    })
                  }
                />
              </div>

              <Select
                label={t("feedbackType")}
                required
                fullWidth
                size="md"
                options={feedbackOptions.map((option) => ({
                  label: t(option.labelKey),
                  value: option.value,
                }))}
                value={form.category}
                onChange={(event) =>
                  setForm({
                    ...form,
                    category: event.target.value,
                  })
                }
              />

              <Select
                label={t("experienceRating")}
                required
                fullWidth
                size="md"
                options={ratingOptions.map((option) => ({
                  label: t(option.labelKey),
                  value: option.value,
                }))}
                value={form.rating}
                onChange={(event) =>
                  setForm({
                    ...form,
                    rating: event.target.value,
                  })
                }
              />

              <Input
                label={t("subject")}
                required
                fullWidth
                size="md"
                placeholder={t("subjectPlaceholder")}
                value={form.subject}
                onChange={(event) =>
                  setForm({
                    ...form,
                    subject: event.target.value,
                  })
                }
              />

              <Textarea
                label={t("yourFeedback")}
                required
                fullWidth
                size="md"
                rows={6}
                maxLength={2000}
                placeholder={t("messagePlaceholder")}
                value={form.message}
                onChange={(event) =>
                  setForm({
                    ...form,
                    message: event.target.value,
                  })
                }
              />
              <div className={`contact-message-guidance${messageHasAbusiveLanguage ? " contact-message-guidance--warning" : ""}`}>
                <span>{messageHasAbusiveLanguage ? "Please remove abusive or insulting language before submitting." : "Maximum 2,000 characters."}</span>
                <span>{form.message.length}/2,000</span>
              </div>

              <div className="contact-form-footer">
                <p>
                  <span>💬</span>
                  {t("feedbackReminder")}
                </p>

                <Button
                  type="submit"
                  disabled={submitting || messageHasAbusiveLanguage || !form.message.trim()}
                  variant="primary"
                  size="sm"
                  endIcon={<span>→</span>}
                >
                  {submitting ? "Submitting..." : t("sendFeedbackButton")}
                </Button>
              </div>

              <div className="contact-email-fallback">
                {t("preferEmail")}{" "}
                <a href="mailto:hello@shivanyams.com">
                  hello@shivanyams.com
                </a>
              </div>
            </form>
          </section>
        </div>
      </main>

      <PortalFooter />
    </>
  );
}