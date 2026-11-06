"use client";

import { Typography } from "shivanya-ui";
import type { Language } from "shivanya-i18n";

import { usePortalLanguage } from "./portal/PortalLanguageContext";
import {
  getPrivacyPageText,
  type PrivacyPageDictionaryKey,
} from "../i18n/dictionaries/PrivacyPageDictionary";

import { PortalFooter } from "./portal/PortalFooter";

import "./ContactPage.css";
import "./PrivacyPage.css";

export function PrivacyPage() {
  const { language } = usePortalLanguage();

  const t = (key: PrivacyPageDictionaryKey) =>
    getPrivacyPageText(key, language as Language);

  return (
    <>
      <main className="contact-page document-page privacy-page">
        <div className="document-page-header">
          <div>
            <Typography
              as="h1"
              variant="h1"
              className="document-page-title"
            >
              {t("pageTitle")}
            </Typography>

            <Typography className="document-page-description">
              {t("pageDescription")}
            </Typography>
          </div>
        </div>

        <article className="document-content">
          <span className="contact-card-label">
            {t("privacyDataLabel")}
          </span>

          <h2>{t("pageTitle")}</h2>

          <div className="privacy-updated">
            {t("lastUpdated")} {t("updatedDate")}
          </div>

          <p>{t("welcomeParagraph")}</p>

          <h3>{t("section1Title")}</h3>
          <p>{t("section1Paragraph")}</p>

          <h3>{t("section2Title")}</h3>
          <p>{t("section2Intro")}</p>

          <ul className="privacy-list">
            <li>{t("collectItem1")}</li>
            <li>{t("collectItem2")}</li>
            <li>{t("collectItem3")}</li>
          </ul>

          <p>{t("sensitiveInfoWarning")}</p>

          <h3>{t("section3Title")}</h3>
          <p>{t("section3Intro")}</p>

          <ul className="privacy-list">
            <li>{t("useItem1")}</li>
            <li>{t("useItem2")}</li>
            <li>{t("useItem3")}</li>
            <li>{t("useItem4")}</li>
          </ul>

          <h3>{t("section4Title")}</h3>
          <p>{t("section4Paragraph1")}</p>
          <p>{t("section4Paragraph2")}</p>

          <h3>{t("section5Title")}</h3>
          <p>{t("section5Paragraph1")}</p>
          <p>{t("section5Paragraph2")}</p>

          <h3>{t("section6Title")}</h3>
          <p>{t("section6Paragraph")}</p>

          <h3>{t("section7Title")}</h3>
          <p>{t("section7Paragraph")}</p>

          <h3>{t("section8Title")}</h3>
          <p>{t("section8Paragraph")}</p>

          <h3>{t("section9Title")}</h3>
          <p>{t("section9Paragraph")}</p>

          <h3>{t("section10Title")}</h3>
          <p>{t("section10Paragraph")}</p>

          <h3>{t("section11Title")}</h3>
          <p>{t("section11Paragraph")}</p>

          <div className="privacy-contact">
            <span className="privacy-contact-icon">✉</span>

            <div>
              <strong>{t("privacyContactName")}</strong>
              <a href="mailto:hello@shivanyams.com">
                hello@shivanyams.com
              </a>
            </div>
          </div>

          <div className="document-notice">
            <p>
              <strong>{t("privacyNoticeTitle")}</strong>{" "}
              {t("privacyNoticeDescription")}
            </p>
          </div>
        </article>
      </main>

      <PortalFooter />
    </>
  );
}