/*
 * File Location: shivanyams/src/components/portal/layout/footer/PortalFooter.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: a3e802f7ba90b45a1d57fd180d9672e768de93fd
 * Both repositories are read-only references.
 */
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "shivanya-ui";
import { useRouter } from "next/navigation";

import {
  STATIC_PORTAL_CATEGORIES,
  categoryConfig,
  getCategoryTitle,
  type Language,
} from "../../category/CategoryGrid";
import { getBaseText } from "../../../../i18n/dictionaries/base";

import { usePortalLanguage } from "../../context/PortalLanguageContext";
import { useImportantLinks } from "../../utils/useImportantLinks";

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
  LinkIcon,
} from "shivanya-ui";

export function PortalFooter() {
  const { language } = usePortalLanguage();
  const { links, getLinkTitle } = useImportantLinks();
  const router = useRouter();

  const sortedCategories = STATIC_PORTAL_CATEGORIES;

  return (
    <div className="portal-footer-area">
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
                <small>Public Updates</small>
              </span>
            </Link>
            <p className="footer-brand-desc">
              {getBaseText("footerDescription", language)}
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

            {sortedCategories.map((category) => {
              const config = categoryConfig[category.slug];

              return (
                <Link
                  key={category.slug}
                  href={config.href}
                  className="footer-category-link"
                >
                  <span className="footer-category-icon" aria-hidden="true">
                    {config.icon}
                  </span>
                  <span>
                    {getCategoryTitle(category, language as Language)}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="footer-useful-links-col">
            <h3>{getBaseText("usefulLinks", language)}</h3>

            {links.slice(0, 8).map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-useful-link"
              >
                <LinkIcon size={16} />
                <span>{getLinkTitle(link, language)}</span>
              </a>
            ))}
          </div>

          <div className="contact-col">
            <h3>{getBaseText("contactUs", language)}</h3>

            <p className="footer-contact-item">
              <MailIcon size={16} />
              <span>{getBaseText("contactEmail", language)}</span>
            </p>

            <p className="footer-contact-item">
              <MapPinIcon size={16} />
              <span>{getBaseText("contactLocation", language)}</span>
            </p>

            <Button
              variant="primary"
              size="md"
              className="contact-button"
              onClick={() => router.push("/contact")}
            >
              {getBaseText("contactButton", language)}
            </Button>
          </div>
        </div>
      </footer>

      <div className="footer-bottom">
        <div>
          <a href="/about">About Us</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/feedback">Feedback</a>
          <a href="/disclaimer">Disclaimer</a>
          <a href="/contact">Contact Us</a>
        </div>
        <span>
          © {new Date().getFullYear()} ShivanyaMS. All rights reserved.
        </span>
      </div>
    </div>
  );
}
