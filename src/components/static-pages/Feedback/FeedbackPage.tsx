"use client";

import { useState, type FormEvent } from "react";
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

import "../Contact/ContactPage.css";
import "./FeedbackPage.css";

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
  const { language } = usePortalLanguage();

  const t = (key: FeedbackPageDictionaryKey) =>
    getFeedbackPageText(key, language as Language);

  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "General Feedback",
    rating: "Excellent",
    subject: "",
    message: "",
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const emailSubject = `[ShivanyaMS Feedback] ${form.category}: ${form.subject}`;

    const body = [
      `Name: ${form.name || "Not provided"}`,
      `Email: ${form.email || "Not provided"}`,
      `Feedback Type: ${form.category}`,
      `Rating: ${form.rating}`,
      "",
      "Feedback:",
      form.message,
    ].join("\n");

    window.location.href = `mailto:hello@shivanyams.com?subject=${encodeURIComponent(
      emailSubject,
    )}&body=${encodeURIComponent(body)}`;
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
              <div className="contact-form-row">
                <Input
                  label={t("nameOptional")}
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
                  fullWidth
                  size="md"
                  type="email"
                  autoComplete="email"
                  placeholder={t("emailPlaceholder")}
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
                placeholder={t("messagePlaceholder")}
                value={form.message}
                onChange={(event) =>
                  setForm({
                    ...form,
                    message: event.target.value,
                  })
                }
              />

              <div className="contact-form-footer">
                <p>
                  <span>💬</span>
                  {t("feedbackReminder")}
                </p>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  endIcon={<span>→</span>}
                >
                  {t("sendFeedbackButton")}
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