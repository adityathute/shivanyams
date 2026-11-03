"use client";

import { useState, type FormEvent } from "react";
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  YoutubeIcon,
  WhatsappIcon,
  TelegramIcon,
  MapPinIcon,
  MailIcon,
  Input,
  Select,
  Textarea,
  Button,
  Typography,
} from "shivanya-ui";

import { PortalFooter } from "./portal/PortalFooter";
import "./ContactPage.css";

const socialLinks = [
  {
    name: "WhatsApp",
    description: "Follow our WhatsApp channel",
    href: "https://whatsapp.com/channel/0029VbCnsGAJpe8iDaN4qM3g",
    icon: WhatsappIcon,
    className: "whatsapp",
  },
  {
    name: "Telegram",
    description: "Join our Telegram channel",
    href: "https://t.me/+Qk03yff1TUBkNzg1",
    icon: TelegramIcon,
    className: "telegram",
  },
  {
    name: "Instagram",
    description: "Connect with us on Instagram",
    href: "https://www.instagram.com/shivanyams",
    icon: InstagramIcon,
    className: "instagram",
  },
  {
    name: "Facebook",
    description: "Visit our Facebook page",
    href: "https://www.facebook.com/profile.php?id=61596321414691",
    icon: FacebookIcon,
    className: "facebook",
  },
  {
    name: "YouTube",
    description: "Watch our latest videos",
    href: "https://www.youtube.com/@Shivanya-MS",
    icon: YoutubeIcon,
    className: "youtube",
  },
  {
    name: "X / Twitter",
    description: "Follow our latest updates",
    href: "https://x.com/shivanyams",
    icon: TwitterIcon,
    className: "twitter",
  },
];

const queryOptions = [
  { label: "General Inquiry", value: "General Inquiry" },
  { label: "Government Job Information", value: "Government Job Information" },
  {
    label: "Government Scheme Information",
    value: "Government Scheme Information",
  },
  { label: "Website Issue", value: "Website Issue" },
  {
    label: "Correction / Update Request",
    value: "Correction / Update Request",
  },
  { label: "Business / Partnership", value: "Business / Partnership" },
  { label: "Feedback / Suggestion", value: "Feedback / Suggestion" },
  { label: "Other", value: "Other" },
];

export function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "General Inquiry",
    subject: "",
    message: "",
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subject = `[ShivanyaMS Contact] ${form.category}: ${form.subject}`;

    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Category: ${form.category}`,
      "",
      "Message:",
      form.message,
    ].join("\n");

    window.location.href = `mailto:hello@shivanyams.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <>
      <main className="contact-page">
        <div className="contact-page-header">
          <div>
            <Typography as="h1" variant="h1" className="contact-page-title">
              Let’s talk.
            </Typography>

            <Typography className="contact-page-description">
              Have a question, found an issue, or want to share feedback? We’re
              here to help.
            </Typography>
          </div>

          <div className="contact-header-badge">
            <span className="contact-status-dot" />
            We’re happy to hear from you
          </div>
        </div>

        <div className="contact-layout">
          <section className="contact-left">
            <div className="contact-info-card">
              <div className="contact-card-heading">
                <span className="contact-card-label">GET IN TOUCH</span>
                <h2>Contact information</h2>
                <p>Choose the easiest way to reach the ShivanyaMS team.</p>
              </div>

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
                  <span>Send us your questions anytime</span>
                </span>

                <span className="contact-detail-arrow">↗</span>
              </a>

              <div className="contact-detail-item">
                <span className="contact-detail-icon">
                  <MapPinIcon size={21} />
                </span>

                <span className="contact-detail-content">
                  <small>Our location</small>
                  <strong>Buldana, Maharashtra</strong>
                  <span>India</span>
                </span>
              </div>

              <div className="contact-info-divider" />

              <div className="contact-response-info">
                <span className="contact-response-indicator" />

                <div>
                  <strong>Need assistance?</strong>
                  <p>
                    Send us your query and we’ll get back to you as soon as
                    possible.
                  </p>
                </div>
              </div>
            </div>

            <div className="contact-social-card">
              <div className="contact-social-heading">
                <div>
                  <span className="contact-card-label">STAY CONNECTED</span>
                  <h2>Find us on social media</h2>
                </div>

                <span className="contact-social-count">06 channels</span>
              </div>

              <div className="contact-social-grid">
                {socialLinks.map((social) => {
                  const Icon = social.icon;

                  return (
                    <a
                      key={social.name}
                      className={`contact-social-item ${social.className}`}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="contact-social-icon">
                        <Icon size={21} />
                      </span>

                      <span className="contact-social-text">
                        <strong>{social.name}</strong>
                        <small>{social.description}</small>
                      </span>

                      <span className="contact-social-arrow">↗</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="contact-form-card">
            <div className="contact-form-heading">
              <div>
                <span className="contact-card-label">SEND AN ENQUIRY</span>
                <h2>Send us a message</h2>
                <p>Fill in the details below and tell us how we can help.</p>
              </div>

              <div className="contact-form-heading-icon">
                <MailIcon size={24} />
              </div>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form-row">
                <Input
                  label="Full name"
                  required
                  fullWidth
                  size="md"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                />

                <Input
                  label="Email address"
                  required
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
                label="Query type"
                required
                fullWidth
                size="md"
                options={queryOptions}
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
              />

              <Input
                label="Subject"
                required
                fullWidth
                size="md"
                placeholder="Briefly describe your query"
                value={form.subject}
                onChange={(event) =>
                  setForm({ ...form, subject: event.target.value })
                }
              />

              <Textarea
                label="Message"
                required
                fullWidth
                size="md"
                rows={6}
                placeholder="Write your message in detail..."
                value={form.message}
                onChange={(event) =>
                  setForm({ ...form, message: event.target.value })
                }
              />

              <div className="contact-form-footer">
                <p>
                  <span>🔒</span>
                  Your information will be included in your email.
                </p>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  endIcon={<span>→</span>}
                >
                  Send enquiry
                </Button>
              </div>

              <div className="contact-email-fallback">
                Prefer email?{" "}
                <a href="mailto:hello@shivanyams.com">hello@shivanyams.com</a>
              </div>
            </form>
          </section>
        </div>
      </main>
      <PortalFooter />
    </>
  );
}
