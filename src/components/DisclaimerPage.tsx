"use client";

import Link from "next/link";
import { Typography } from "shivanya-ui";
import type { Language } from "shivanya-i18n";

import { usePortalLanguage } from "./portal/PortalLanguageContext";
import {
  getDisclaimerPageText,
  type DisclaimerPageDictionaryKey,
} from "../i18n/dictionaries/DisclaimerPageDictionary";

import { PortalFooter } from "./portal/PortalFooter";

import "./ContactPage.css";
import "./DisclaimerPage.css";

export function DisclaimerPage() {
  const { language } = usePortalLanguage();

  const t = (key: DisclaimerPageDictionaryKey) =>
    getDisclaimerPageText(key, language as Language);

  return (
    <>
      <main className="contact-page disclaimer-page">
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
            {t("importantInformation")}
          </div>
        </div>

        <div className="disclaimer-content">
          <section className="disclaimer-card">
            <span className="contact-card-label">
              {t("marathiDisclaimerLabel")}
            </span>

            <h2>{t("marathiImportantNotice")}</h2>

            <p>{t("marathiParagraph1")}</p>
            <p>{t("marathiParagraph2")}</p>
            <p>{t("marathiParagraph3")}</p>
            <p>{t("marathiParagraph4")}</p>
            <p>{t("marathiParagraph5")}</p>
          </section>

          <section className="disclaimer-card">
            <span className="contact-card-label">
              {t("englishDisclaimerLabel")}
            </span>

            <h2>{t("aboutShivanyaMS")}</h2>

            <p>{t("englishParagraph1")}</p>
            <p>{t("englishParagraph2")}</p>
            <p>{t("englishParagraph3")}</p>
            <p>{t("englishParagraph4")}</p>
            <p>{t("englishParagraph5")}</p>
            <p>{t("englishParagraph6")}</p>
          </section>

          <section className="disclaimer-notice">
            <span className="disclaimer-notice-icon">⚠️</span>

            <div>
              <h2>{t("cautionHeading")}</h2>
              <p>{t("cautionDescription")}</p>
            </div>
          </section>

          <section className="disclaimer-card disclaimer-last">
            <span className="contact-card-label">
              {t("contactLabel")}
            </span>

            <h2>{t("questionsOrCorrections")}</h2>

            <p>{t("contactDescription")}</p>

            <Link
              href="/contact"
              className="disclaimer-contact-link"
            >
              {t("contactShivanyaMS")} <span>→</span>
            </Link>
          </section>
        </div>
      </main>

      <PortalFooter />
    </>
  );
}