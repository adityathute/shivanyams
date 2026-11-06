"use client";

import Image from "next/image";
import Link from "next/link";
import { Typography } from "shivanya-ui";

import { usePortalLanguage } from "./portal/PortalLanguageContext";
import { getAboutText } from "../i18n/dictionaries/AboutPageDictionary";
import { PortalFooter } from "./portal/PortalFooter";

import "./ContactPage.css";
import "./AboutPage.css";

export function AboutPage() {
  const { language } = usePortalLanguage();
  const t = (key: Parameters<typeof getAboutText>[0]) =>
    getAboutText(key, language);

  return (
    <>
      <main className="contact-page about-page">
        <section className="about-hero">
          <div className="about-hero-content">
            <span className="about-eyebrow">{t("heroEyebrow")}</span>

            <Typography as="h1" variant="h1" className="about-title">
              {t("heroTitle")}
            </Typography>

            <p className="about-hero-description">
              {t("heroDescription")}
            </p>

            <div className="about-hero-actions">
              <Link href="/" className="about-primary-button">
                {t("explore")} <span>→</span>
              </Link>

              <Link href="/contact" className="about-secondary-button">
                {t("contactUs")}
              </Link>
            </div>
          </div>

          <div className="about-hero-visual">
            <div className="about-visual-card">
              <Image
                src="/logo.png"
                alt="ShivanyaMS Logo"
                width={80}
                height={80}
                className="about-visual-logo"
              />

              <span className="about-visual-label">
                {t("visualLabel")}
              </span>

              <h2>{t("visualTitle")}</h2>
              <p>{t("visualDescription")}</p>

              <div className="about-visual-footer">
                <span className="about-visual-dot" />
                {t("visualFooter")}
              </div>
            </div>

            <div className="about-floating-badge">
              <span>✦</span> {t("visualBadge")}
            </div>
          </div>
        </section>

        <section className="about-intro">
          <div className="about-section-heading">
            <span className="about-eyebrow">{t("whoWeAre")}</span>
            <h2>{t("aboutTitle")}</h2>
          </div>

          <p>{t("intro1")}</p>
          <p>{t("intro2")}</p>
        </section>

        <section className="about-founder">
          <div className="about-founder-content">
            <span className="about-eyebrow">{t("founderEyebrow")}</span>
            <h2>{t("founderTitle")}</h2>
            <h3>{t("founderName")}</h3>

            <span className="about-founder-role">
              {t("founderRole")}
            </span>

            <p>{t("founderDescription1")}</p>
            <p>{t("founderDescription2")}</p>
          </div>

          <div className="about-founder-badge">
            <Image
              src="/logo.png"
              alt="ShivanyaMS"
              width={80}
              height={80}
            />
            <span>{t("builtWithVision")}</span>
            <strong>{t("accessibleMission")}</strong>
          </div>
        </section>

        <section className="about-services">
          <div className="about-section-heading">
            <span className="about-eyebrow">{t("whatYouCanFind")}</span>
            <h2>{t("featureTitle")}</h2>
            <p>{t("featureDescription")}</p>
          </div>

          <div className="about-feature-grid">
            <article className="about-feature-card">
              <div className="about-feature-icon about-icon-blue">
                <span>💼</span>
              </div>
              <h3>{t("jobsTitle")}</h3>
              <p>{t("jobsDescription")}</p>
            </article>

            <article className="about-feature-card">
              <div className="about-feature-icon about-icon-purple">
                <span>🏛️</span>
              </div>
              <h3>{t("schemesTitle")}</h3>
              <p>{t("schemesDescription")}</p>
            </article>

            <article className="about-feature-card">
              <div className="about-feature-icon about-icon-green">
                <span>📋</span>
              </div>
              <h3>{t("resultsTitle")}</h3>
              <p>{t("resultsDescription")}</p>
            </article>

            <article className="about-feature-card">
              <div className="about-feature-icon about-icon-orange">
                <span>📚</span>
              </div>
              <h3>{t("guidesTitle")}</h3>
              <p>{t("guidesDescription")}</p>
            </article>
          </div>
        </section>

        <section className="about-mission">
          <div className="about-mission-mark">✦</div>

          <div>
            <span className="about-eyebrow">{t("missionEyebrow")}</span>
            <h2>{t("missionTitle")}</h2>
            <p>{t("missionDescription")}</p>
          </div>
        </section>

        <section className="about-trust">
          <div className="about-section-heading">
            <span className="about-eyebrow">{t("commitment")}</span>
            <h2>{t("trustTitle")}</h2>
          </div>

          <div className="about-trust-grid">
            <div className="about-trust-item">
              <span className="about-trust-check">✓</span>
              <div>
                <h3>{t("clearInfo")}</h3>
                <p>{t("clearInfoDescription")}</p>
              </div>
            </div>

            <div className="about-trust-item">
              <span className="about-trust-check">✓</span>
              <div>
                <h3>{t("officialSources")}</h3>
                <p>{t("officialSourcesDescription")}</p>
              </div>
            </div>

            <div className="about-trust-item">
              <span className="about-trust-check">✓</span>
              <div>
                <h3>{t("continuousImprovement")}</h3>
                <p>{t("continuousImprovementDescription")}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-disclaimer">
          <span className="about-disclaimer-icon">ⓘ</span>

          <div>
            <h3>{t("importantInfo")}</h3>
            <p>{t("disclaimerDescription")}</p>

            <Link href="/disclaimer">
              {t("readDisclaimer")} <span>→</span>
            </Link>
          </div>
        </section>

        <section className="about-cta">
          <div>
            <span className="about-eyebrow">{t("feedbackEyebrow")}</span>
            <h2>{t("feedbackTitle")}</h2>
            <p>{t("feedbackDescription")}</p>
          </div>

          <div className="about-cta-actions">
            <Link href="/feedback" className="about-primary-button">
              {t("shareFeedback")} <span>→</span>
            </Link>

            <Link href="/contact" className="about-secondary-button">
              {t("contactUs")}
            </Link>
          </div>
        </section>
      </main>

      <PortalFooter />
    </>
  );
}