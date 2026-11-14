"use client";

import Link from "next/link";
import { Typography } from "shivanya-ui";
import type { Language } from "shivanya-i18n";

import { usePortalLanguage } from "../../portal/context/PortalLanguageContext";
import {
  getTermsPageText,
  type TermsPageDictionaryKey,
} from "../../../i18n/dictionaries/TermsPageDictionary";

import { PortalFooter } from "../../portal/layout/footer/PortalFooter";

import "../Contact/ContactPage.css";
import "./TermsPage.css";

export function TermsPage() {
  const { language } = usePortalLanguage();

  const t = (key: TermsPageDictionaryKey) =>
    getTermsPageText(key, language as Language);

  return (
    <>
      <main className="contact-page document-page terms-page">
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

        <section className="document-content">
          <span className="contact-card-label">
            {t("termsLabel")}
          </span>

          <h2>{t("pageTitle")}</h2>

          <p className="terms-updated">
            <strong>{t("lastUpdated")}</strong>{" "}
            {t("updatedDate")}
          </p>

          <p>{t("introduction")}</p>

          <div className="document-divider" />

          <h3>{t("section1Title")}</h3>
          <p>{t("section1Paragraph")}</p>

          <h3>{t("section2Title")}</h3>
          <p>{t("section2Paragraph")}</p>

          <ul className="terms-list">
            <li>{t("contentItem1")}</li>
            <li>{t("contentItem2")}</li>
            <li>{t("contentItem3")}</li>
          </ul>

          <h3>{t("section3Title")}</h3>
          <p>{t("section3Paragraph")}</p>

          <h3>{t("section4Title")}</h3>
          <p>{t("section4Paragraph")}</p>

          <h3>{t("section5Title")}</h3>
          <p>{t("section5Paragraph")}</p>

          <h3>{t("section6Title")}</h3>
          <p>{t("section6Paragraph")}</p>

          <h3>{t("section7Title")}</h3>
          <p>{t("section7Intro")}</p>

          <ul className="terms-list">
            <li>{t("liabilityItem1")}</li>
            <li>{t("liabilityItem2")}</li>
            <li>{t("liabilityItem3")}</li>
            <li>{t("liabilityItem4")}</li>
          </ul>

          <h3>{t("section8Title")}</h3>
          <p>{t("section8Paragraph")}</p>

          <h3>{t("section9Title")}</h3>
          <p>{t("section9Intro")}</p>

          <ul className="terms-list">
            <li>{t("conductItem1")}</li>
            <li>{t("conductItem2")}</li>
            <li>{t("conductItem3")}</li>
            <li>{t("conductItem4")}</li>
          </ul>

          <h3>{t("section10Title")}</h3>
          <p>
            {t("section10BeforeLink")}{" "}
            <Link href="/privacy">
              {t("privacyPolicyLink")}
            </Link>
            {t("section10AfterLink")}
          </p>

          <h3>{t("section11Title")}</h3>
          <p>{t("section11Paragraph")}</p>

          <h3>{t("section12Title")}</h3>
          <p>{t("section12Paragraph")}</p>

          <p>
            <strong>{t("emailLabel")}</strong>{" "}
            <a href="mailto:hello@shivanyams.com">
              hello@shivanyams.com
            </a>
            <br />
            <strong>{t("websiteLabel")}</strong>{" "}
            <a href="https://shivanyams.com">
              shivanyams.com
            </a>
          </p>

          <div className="document-notice">
            <p>
              <strong>{t("noticeTitle")}</strong>{" "}
              {t("noticeDescription")}
            </p>
          </div>
        </section>
      </main>

      <PortalFooter />
    </>
  );
}