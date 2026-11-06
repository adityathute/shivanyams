"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type React from "react";

import {
  categoriesApi,
  categoryConfig,
  getCategoryTitle,
  type Category,
  type Language,
} from "./CategoryGrid";
import { getBaseText } from "../../i18n/dictionaries/base";

import { usePortalLanguage } from "./PortalLanguageContext";

import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  YoutubeIcon,
  WhatsappIcon,
  TelegramIcon,
  MapPinIcon,
  MailIcon,
  ThreadsIcon,
  GovernmentJobIcon,
  GovernmentSchemeIcon,
  ResultIcon,
  AdmitCardIcon,
  GuideIcon,
  VideoIcon,
  ExaminationIcon,
} from "shivanya-ui";

const links: [string, string][] = [
  ["MahaDBT Portal", "https://mahadbt2.maharashtra.gov.in/"],
  ["Aadhaar Official Website", "https://myaadhaar.uidai.gov.in/"],
  ["Ration Card Maharashtra", "https://mahafood.gov.in/"],
  ["PM Kisan Portal", "https://pmkisan.gov.in/"],
  ["MPSC Official Website", "https://mpsc.gov.in/"],
  ["Maharashtra Government", "https://www.maharashtra.gov.in/"],
  ["MH Police Recruitment", "https://www.mahapolice.gov.in/"],
];

export function PortalFooter() {
  const { language } = usePortalLanguage();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCategories() {
      try {
        const response = await fetch(categoriesApi, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const payload: Category[] | { results?: Category[] } =
          await response.json();

        const data = Array.isArray(payload) ? payload : (payload.results ?? []);

        setCategories(data.filter((category) => category.active));
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Footer categories loading failed:", error);
        }
      }
    }

    fetchCategories();

    return () => controller.abort();
  }, []);

const categoryOrder: Record<string, number> = {
  jobs: 1,
  schemes: 2,
  examination: 3,
  examinations: 3,
  results: 4,
  "admit-cards": 5,
  "articles-guides": 6,
  videos: 7,
};

const categoryIcons: Record<
  string,
  React.ComponentType<{ size?: number }>
> = {
  jobs: GovernmentJobIcon,
  schemes: GovernmentSchemeIcon,
  examination: ExaminationIcon,
  examinations: ExaminationIcon,
  results: ResultIcon,
  "admit-cards": AdmitCardIcon,
  guide: GuideIcon,
  guides: GuideIcon,
  articles: GuideIcon,
  videos: VideoIcon,
};

  return (
    <footer className="portal-footer" id="contact">
      <div className="footer-main">
        <div className="footer-brand">
          <Link className="brand" href="/">
            <Image
              src="/logo.png"
              alt="ShivanyaMS Logo"
              width={48}
              height={48}
              className="brand-logo-img"
              priority
            />

            <span>
              <strong>ShivanyaMS</strong>
              <small>Govt Jobs, Schemes &amp; Updates</small>
            </span>
          </Link>
          <p>
            सरकारी नोकरी, योजना, निकाल, प्रवेशपत्र आणि महत्त्वाच्या अपडेट्सची
            माहिती – मराठी, हिंदी आणि इंग्रजीमध्ये.
          </p>

          <div className="social-links">
            <a
              href="https://www.facebook.com/profile.php?id=61596321414691"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FacebookIcon size={20} />
            </a>

            <a
              href="https://www.instagram.com/shivanyams"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <InstagramIcon size={20} />
            </a>

            <a
              href="https://x.com/shivanyams"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <TwitterIcon size={20} />
            </a>

            <a
              href="https://www.youtube.com/@Shivanya-MS"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <YoutubeIcon size={20} />
            </a>

            <a
              href="https://whatsapp.com/channel/0029VbCnsGAJpe8iDaN4qM3g"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <WhatsappIcon size={20} />
            </a>

            <a
              href="https://t.me/+Qk03yff1TUBkNzg1"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
            >
              <TelegramIcon size={20} />
            </a>

            <a
              href="https://threads.net/@your-page"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Threads"
            >
              <ThreadsIcon size={20} />
            </a>
          </div>
        </div>

        <div className="footer-category-col">
          <h3>{getBaseText("importantSections", language)}</h3>

          {[...categories]
            .filter((category) => categoryConfig[category.slug])
            .sort(
              (a, b) =>
                (categoryOrder[a.slug] ?? 99) - (categoryOrder[b.slug] ?? 99),
            )
            .map((category) => {
              const config = categoryConfig[category.slug];
              const Icon = categoryIcons[category.slug];

              return (
                <Link
                  key={category.id}
                  href={config.href}
                  className="footer-category-link"
                >
                  {Icon && <Icon size={16} />}
                  <span>
                    {getCategoryTitle(category, language as Language)}
                  </span>
                </Link>
              );
            })}
        </div>

        <div>
          <h3>उपयुक्त लिंक्स</h3>
          {links.slice(0, 7).map(([label, url]) => (
            <a key={label} href={url} target="_blank" rel="noreferrer">
              {label}
            </a>
          ))}
        </div>

        <div className="contact-col">
          <h3>आमच्याशी संपर्क साधा</h3>
          <p className="footer-contact-item">
            <MailIcon size={16} />
            <span>hello@shivanyams.com</span>
          </p>
          <p className="footer-contact-item">
            <MapPinIcon size={16} />
            <span>Buldana, Maharashtra, India</span>
          </p>
          <a className="contact-button" href="contact">
            संपर्क साधा →
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <div>
          <a href="/about">About Us</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Use</a>
          <a href="/feedback">Feedback</a>
          <a href="/disclaimer">Disclaimer</a>
          <a href="/contact">Contact Us</a>
        </div>
        <span>
          © {new Date().getFullYear()} ShivanyaMS. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
