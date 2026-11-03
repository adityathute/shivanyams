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

import { PortalFooter } from "./portal/PortalFooter";
import "./ContactPage.css";
import "./FeedbackPage.css";

const feedbackOptions = [
  { label: "सामान्य अभिप्राय", value: "General Feedback" },
  { label: "सूचना", value: "Suggestion" },
  { label: "समस्या कळवा", value: "Report an Issue" },
  { label: "नवीन सुविधा", value: "Feature Request" },
  { label: "इतर", value: "Other" },
];

const ratingOptions = [
  { label: "खूप छान", value: "Excellent" },
  { label: "छान", value: "Good" },
  { label: "ठीक आहे", value: "Average" },
  { label: "सुधारणा आवश्यक", value: "Needs Improvement" },
];

export function FeedbackPage() {
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

    const subject = `[ShivanyaMS Feedback] ${form.category}: ${form.subject}`;

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
      subject,
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <>
      <main className="contact-page feedback-page">
        <div className="contact-page-header">
          <div>
            <Typography as="h1" variant="h1" className="contact-page-title">
              Share your feedback.
            </Typography>

            <Typography className="contact-page-description">
              Tell us what you think about ShivanyaMS. Your feedback helps us
              improve.
            </Typography>
          </div>

          <div className="contact-header-badge">
            <span className="contact-status-dot" />
            We value your feedback
          </div>
        </div>

        <div className="contact-layout">
          <section className="contact-left">
            <div className="contact-info-card">
              <div className="contact-card-heading">
                <span className="contact-card-label">YOUR VOICE MATTERS</span>
                <h2>Help us improve</h2>
                <p>
                  Your suggestions and ideas help us make ShivanyaMS better
                  for everyone.
                </p>
              </div>

              <div className="feedback-benefits">
                <div className="feedback-benefit">
                  <span className="feedback-benefit-icon">💡</span>
                  <div>
                    <strong>Share your ideas</strong>
                    <p>Tell us what features you would like to see.</p>
                  </div>
                </div>

                <div className="feedback-benefit">
                  <span className="feedback-benefit-icon">🛠️</span>
                  <div>
                    <strong>Report a problem</strong>
                    <p>Help us find and fix issues.</p>
                  </div>
                </div>

                <div className="feedback-benefit">
                  <span className="feedback-benefit-icon">🚀</span>
                  <div>
                    <strong>Make things better</strong>
                    <p>Your feedback helps improve our services.</p>
                  </div>
                </div>
              </div>

              <div className="contact-info-divider" />

              <div className="contact-response-info">
                <span className="contact-response-indicator" />

                <div>
                  <strong>Thank you for helping us</strong>
                  <p>
                    Every suggestion matters and helps us build a better
                    experience.
                  </p>
                </div>
              </div>
            </div>

            <div className="contact-info-card feedback-email-card">
              <span className="contact-card-label">CONTACT US</span>
              <h2>Have more to share?</h2>
              <p>
                You can also send your feedback directly to our email.
              </p>

              <a
                className="contact-detail-item"
                href="mailto:hello@shivanyams.com"
              >
                <span className="contact-detail-icon">
                  <MailIcon size={21} />
                </span>

                <span className="contact-detail-content">
                  <small>Email address</small>
                  <strong>hello@shivanyams.com</strong>
                </span>

                <span className="contact-detail-arrow">↗</span>
              </a>
            </div>
          </section>

          <section className="contact-form-card">
            <div className="contact-form-heading">
              <div>
                <span className="contact-card-label">SEND FEEDBACK</span>
                <h2>We’re listening</h2>
                <p>Fill in the details and share your thoughts with us.</p>
              </div>

              <div className="contact-form-heading-icon">
                <MailIcon size={24} />
              </div>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form-row">
                <Input
                  label="Name (Optional)"
                  fullWidth
                  size="md"
                  autoComplete="name"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                />

                <Input
                  label="Email (Optional)"
                  fullWidth
                  size="md"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                />
              </div>

              <Select
                label="Feedback type"
                required
                fullWidth
                size="md"
                options={feedbackOptions}
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
              />

              <Select
                label="How was your experience?"
                required
                fullWidth
                size="md"
                options={ratingOptions}
                value={form.rating}
                onChange={(event) =>
                  setForm({ ...form, rating: event.target.value })
                }
              />

              <Input
                label="Subject"
                required
                fullWidth
                size="md"
                placeholder="Briefly describe your feedback"
                value={form.subject}
                onChange={(event) =>
                  setForm({ ...form, subject: event.target.value })
                }
              />

              <Textarea
                label="Your feedback"
                required
                fullWidth
                size="md"
                rows={6}
                placeholder="Share your ideas, suggestions, or experience..."
                value={form.message}
                onChange={(event) =>
                  setForm({ ...form, message: event.target.value })
                }
              />

              <div className="contact-form-footer">
                <p>
                  <span>💬</span>
                  Your feedback helps us improve.
                </p>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  endIcon={<span>→</span>}
                >
                  Send feedback
                </Button>
              </div>

              <div className="contact-email-fallback">
                Prefer email?{" "}
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