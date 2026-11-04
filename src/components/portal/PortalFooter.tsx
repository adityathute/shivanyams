"use client";

import { useAuth } from "shivanya-auth";

import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  YoutubeIcon,
  WhatsappIcon,
  TelegramIcon,
  MapPinIcon,
  MailIcon,
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
  const { user, loading } = useAuth();

  const isAdmin = user?.roles?.includes("admin") === true;

  return (
    <footer className="portal-footer" id="contact">
      <div className="footer-main">
        <div className="footer-brand">
          <a className="brand" href="/">
            <img
              src="/logo.png"
              alt="ShivanyaMS Logo"
              className="brand-logo-img"
            />
            <span>
              <strong>ShivanyaMS</strong>
              <small>Govt Jobs, Schemes &amp; Updates</small>
            </span>
          </a>
          <p>
            सरकारी नोकरी, योजना, निकाल, प्रवेशपत्र आणि महत्त्वाच्या अपडेट्सची
            माहिती – मराठी आणि English मध्ये.
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

            {/* <a
              href="https://threads.net/@your-page"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Threads"
            >
              <ThreadsIcon size={20} />
            </a> */}
          </div>
        </div>

        <div>
          <h3>महत्त्वाचे विभाग</h3>
          <a href="/jobs">सरकारी नोकरी</a>
          <a href="/schemes">शासकीय योजना</a>
          <a href="/results">निकाल</a>
          <a href="/admit-cards">प्रवेशपत्र</a>
          <a href="/guides">लेख / मार्गदर्शक</a>
          <a href="/videos">YouTube व्हिडिओ</a>
        </div>

        <div>
          <h3>उपयुक्त लिंक्स</h3>
          {links.slice(0, 6).map(([label, url]) => (
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
          {!loading && isAdmin && (
            <a href="/admin" className="admin-link">
              Admin
            </a>
          )}
        </div>
        <span>
          © {new Date().getFullYear()} ShivanyaMS. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
