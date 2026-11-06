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

import { usePortalLanguage } from "./portal/PortalLanguageContext";
import { getContactText } from "../i18n/dictionaries/ContactPageDictionary";

import { PortalFooter } from "./portal/PortalFooter";

import "./ContactPage.css";

const socialLinks = [
  {
    name: "WhatsApp",
    descriptionKey: "whatsappDescription",
    href: "https://whatsapp.com/channel/0029VbCnsGAJpe8iDaN4qM3g",
    icon: WhatsappIcon,
    className: "whatsapp",
  },
  {
    name: "Telegram",
    descriptionKey: "telegramDescription",
    href: "https://t.me/+Qk03yff1TUBkNzg1",
    icon: TelegramIcon,
    className: "telegram",
  },
  {
    name: "Instagram",
    descriptionKey: "instagramDescription",
    href: "https://www.instagram.com/shivanyams",
    icon: InstagramIcon,
    className: "instagram",
  },
  {
    name: "Facebook",
    descriptionKey: "facebookDescription",
    href: "https://www.facebook.com/profile.php?id=61596321414691",
    icon: FacebookIcon,
    className: "facebook",
  },
  {
    name: "YouTube",
    descriptionKey: "youtubeDescription",
    href: "https://www.youtube.com/@Shivanya-MS",
    icon: YoutubeIcon,
    className: "youtube",
  },
  {
    name: "X / Twitter",
    descriptionKey: "twitterDescription",
    href: "https://x.com/shivanyams",
    icon: TwitterIcon,
    className: "twitter",
  },
] as const;

const queryOptionKeys = [
  ["queryGeneral", "General Inquiry"],
  ["queryJobs", "Government Job Information"],
  ["querySchemes", "Government Scheme Information"],
  ["queryWebsite", "Website Issue"],
  ["queryCorrection", "Correction / Update Request"],
  ["queryBusiness", "Business / Partnership"],
  ["queryFeedback", "Feedback / Suggestion"],
  ["queryOther", "Other"],
] as const;

export function ContactPage() {
  const { language } = usePortalLanguage();

  const t = (key: Parameters<typeof getContactText>[0]) =>
    getContactText(key, language);

  const queryOptions = queryOptionKeys.map(([key, value]) => ({
    label: t(key),
    value,
  }));

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

    window.location.href =
      `mailto:hello@shivanyams.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <>
      <main className="contact-page">
        {/* Header */}
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
            {t("headerBadge")}
          </div>
        </div>

        <div className="contact-layout">
          {/* Left section */}
          <section className="contact-left">
            {/* Contact information */}
            <div className="contact-info-card">
              <div className="contact-card-heading">
                <span className="contact-card-label">
                  {t("getInTouch")}
                </span>

                <h2>{t("contactInformation")}</h2>

                <p>{t("contactInformationDescription")}</p>
              </div>

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
                  <span>{t("emailDescription")}</span>
                </span>

                <span className="contact-detail-arrow">↗</span>
              </a>

              <div className="contact-detail-item">
                <span className="contact-detail-icon">
                  <MapPinIcon size={21} />
                </span>

                <span className="contact-detail-content">
                  <small>{t("ourLocation")}</small>
                  <strong>{t("locationCity")}</strong>
                  <span>{t("locationCountry")}</span>
                </span>
              </div>

              <div className="contact-info-divider" />

              <div className="contact-response-info">
                <span className="contact-response-indicator" />

                <div>
                  <strong>{t("needAssistance")}</strong>

                  <p>{t("assistanceDescription")}</p>
                </div>
              </div>
            </div>

            {/* Social media */}
            <div className="contact-social-card">
              <div className="contact-social-heading">
                <div>
                  <span className="contact-card-label">
                    {t("stayConnected")}
                  </span>

                  <h2>{t("socialHeading")}</h2>
                </div>

                <span className="contact-social-count">
                  {t("socialChannels")}
                </span>
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

                        <small>
                          {t(social.descriptionKey)}
                        </small>
                      </span>

                      <span className="contact-social-arrow">↗</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Contact form */}
          <section className="contact-form-card">
            <div className="contact-form-heading">
              <div>
                <span className="contact-card-label">
                  {t("sendEnquiry")}
                </span>

                <h2>{t("sendMessage")}</h2>

                <p>{t("formDescription")}</p>
              </div>

              <div className="contact-form-heading-icon">
                <MailIcon size={24} />
              </div>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form-row">
                <Input
                  label={t("fullName")}
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
                  label={t("emailAddress")}
                  required
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
                label={t("queryType")}
                required
                fullWidth
                size="md"
                options={queryOptions}
                value={form.category}
                onChange={(event) =>
                  setForm({
                    ...form,
                    category: event.target.value,
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
                label={t("message")}
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
                  <span>🔒</span>
                  {t("privacyNote")}
                </p>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  endIcon={<span>→</span>}
                >
                  {t("sendEnquiryButton")}
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