"use client";

import { useState } from "react";
import { authenticatedFetch } from "../../../lib/authenticated-fetch";
import { getPortalApiUrl } from "../category/CategoryGrid";

type Language = "en" | "mr" | "hi";

const labels = {
  en: {
    button: "Subscribe",
    title: "Stay Updated",
    description: "Get new posts, important updates and ShivanyaMS announcements by email.",
    email: "Email address",
    placeholder: "Enter your email address",
    submit: "Subscribe",
    close: "Close",
    success: "You are subscribed to ShivanyaMS updates.",
    error: "Unable to subscribe right now. Please try again.",
    invalid: "Please enter a valid email address.",
  },
  mr: {
    button: "सबस्क्राइब करा",
    title: "नवीन अपडेट्स मिळवा",
    description: "नवीन पोस्ट, महत्त्वाच्या अपडेट्स आणि ShivanyaMS च्या सूचना ईमेलद्वारे मिळवा.",
    email: "ईमेल पत्ता",
    placeholder: "तुमचा ईमेल पत्ता टाका",
    submit: "सबस्क्राइब करा",
    close: "बंद करा",
    success: "तुम्ही ShivanyaMS अपडेट्ससाठी सबस्क्राइब केले आहे.",
    error: "सध्या सबस्क्राइब करता आले नाही. पुन्हा प्रयत्न करा.",
    invalid: "कृपया योग्य ईमेल पत्ता टाका.",
  },
  hi: {
    button: "सब्सक्राइब करें",
    title: "अपडेट रहें",
    description: "नई पोस्ट, जरूरी अपडेट और ShivanyaMS की घोषणाएँ ईमेल से पाएँ।",
    email: "ईमेल पता",
    placeholder: "अपना ईमेल पता दर्ज करें",
    submit: "सब्सक्राइब करें",
    close: "बंद करें",
    success: "आपने ShivanyaMS अपडेट्स के लिए सब्सक्राइब कर लिया है।",
    error: "अभी सब्सक्राइब नहीं हो सका। कृपया फिर से प्रयास करें।",
    invalid: "कृपया सही ईमेल पता दर्ज करें।",
  },
};

export function NewsletterSubscribeButton({ language = "en" }: { language?: Language }) {
  const t = labels[language] || labels.en;
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setMessage(t.invalid);
      setSuccess(false);
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const response = await authenticatedFetch(getPortalApiUrl("newsletter/subscribe/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, language }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.email?.[0] || payload.detail || t.error);
      }
      setSuccess(true);
      setMessage(t.success);
      setEmail(normalizedEmail);
    } catch (error) {
      setSuccess(false);
      setMessage(error instanceof Error ? error.message : t.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className="subscribe-button" onClick={() => { setOpen(true); setMessage(""); }}>
        {t.button}
      </button>
      {open ? (
        <div className="newsletter-subscribe-overlay" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !busy) setOpen(false);
        }}>
          <section className="newsletter-subscribe-dialog" role="dialog" aria-modal="true" aria-labelledby="newsletter-subscribe-title">
            <button type="button" className="newsletter-subscribe-close" onClick={() => setOpen(false)} aria-label={t.close}>×</button>
            <span className="newsletter-subscribe-eyebrow">SHIVANYAMS</span>
            <h2 id="newsletter-subscribe-title">{t.title}</h2>
            <p>{t.description}</p>
            <form onSubmit={(event) => void submit(event)}>
              <label htmlFor="newsletter-subscribe-email">{t.email}</label>
              <input
                id="newsletter-subscribe-email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                placeholder={t.placeholder}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={busy || success}
              />
              {message ? <div className={success ? "newsletter-subscribe-message success" : "newsletter-subscribe-message"} role="status">{message}</div> : null}
              {success ? (
                <button type="button" className="newsletter-subscribe-submit" onClick={() => setOpen(false)}>{t.close}</button>
              ) : (
                <button type="submit" className="newsletter-subscribe-submit" disabled={busy}>
                  {busy ? "…" : t.submit}
                </button>
              )}
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
