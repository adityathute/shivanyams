/* File Location: shivanyams/src/components/portal/post/NewsletterSubscribeButton.tsx
 * References: shivanya-sdk v1.0.0 (Master, ce45f9f875056b0578da2438b9bfaaf3fb6622b9; read-only); shivanya-auth private (version/commit not verified).
 * Cleanup Status: Cleanup Pending
 * Cleanup Info: Batch 12 post-detail audit. UI Audit: 2 SDK components: IconButton, CloseIcon. CSS mapping: NewsletterSubscribeButton.css (36 selector blocks; 34 unique; 2 repeated selector names / 2 repeated occurrences). Invalid disabled cursor value corrected; remaining duplicate selectors and legacy modal styling pending.
 */
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "shivanya-auth";
import { IconButton, CloseIcon } from "shivanya-ui";
import "./../../../styles/legacy/components/portal/post/NewsletterSubscribeButton.css";
import { authenticatedFetch } from "../../../lib/authenticated-fetch";
import { getPortalApiUrl } from "../category/CategoryGrid";

type Language = "en" | "mr" | "hi";

const labels = {
  en: {
    button: "Subscribe",
    subscribed: "Subscribed",
    unsubscribe: "Unsubscribe",
    subscribedInfo: "You are subscribed to email updates. You can unsubscribe at any time.",
    unsubscribeError: "Unable to unsubscribe right now. Please try again.",
    unsubscribeSuccess: "You have successfully unsubscribed from ShivanyaMS updates.",
    title: "Stay Connected",
    subscribedTitle: "You’re Connected",
    description: "Stay connected with us for important updates.",
    email: "Email address",
    placeholder: "Enter your email address",
    submit: "Subscribe",
    close: "Close",
    success: "You are subscribed to ShivanyaMS updates.",
    alreadySubscribed: "This email is already subscribed to updates.",
    error: "Unable to subscribe right now. Please try again.",
    invalid: "Please enter a valid email address.",
  },
  mr: {
    button: "सबस्क्राइब करा",
    subscribed: "सबस्क्राइब केले",
    unsubscribe: "सबस्क्रिप्शन बंद करा",
    subscribedInfo: "तुम्ही ईमेल अपडेट्ससाठी सबस्क्राइब केले आहे. तुम्ही कधीही सबस्क्रिप्शन बंद करू शकता.",
    unsubscribeError: "सध्या सबस्क्रिप्शन बंद करता आले नाही. पुन्हा प्रयत्न करा.",
    unsubscribeSuccess: "तुम्ही ShivanyaMS अपडेट्समधून यशस्वीरीत्या अनसबस्क्राइब केले आहे.",
    title: "आमच्याशी जोडलेले राहा",
    subscribedTitle: "तुम्ही जोडले गेले आहात",
    description: "महत्त्वाच्या अपडेट्ससाठी आमच्याशी जोडलेले राहा.",
    email: "ईमेल पत्ता",
    placeholder: "तुमचा ईमेल पत्ता टाका",
    submit: "सबस्क्राइब करा",
    close: "बंद करा",
    success: "तुम्ही ShivanyaMS अपडेट्ससाठी सबस्क्राइब केले आहे.",
    alreadySubscribed: "हा ईमेल आधीपासून अपडेट्ससाठी सबस्क्राइब आहे.",
    error: "सध्या सबस्क्राइब करता आले नाही. पुन्हा प्रयत्न करा.",
    invalid: "कृपया योग्य ईमेल पत्ता टाका.",
  },
  hi: {
    button: "सब्सक्राइब करें",
    subscribed: "सब्सक्राइब किया",
    unsubscribe: "अनसब्सक्राइब करें",
    subscribedInfo: "आप ईमेल अपडेट्स के लिए सब्सक्राइब हैं। आप कभी भी अनसब्सक्राइब कर सकते हैं।",
    unsubscribeError: "अभी अनसब्सक्राइब नहीं हो सका। कृपया फिर से प्रयास करें.",
    unsubscribeSuccess: "आपने ShivanyaMS अपडेट्स से सफलतापूर्वक अनसब्सक्राइब कर लिया है।",
    title: "हमसे जुड़े रहें",
    subscribedTitle: "आप हमसे जुड़ गए हैं",
    description: "महत्वपूर्ण अपडेट्स के लिए हमसे जुड़े रहें।",
    email: "ईमेल पता",
    placeholder: "अपना ईमेल पता दर्ज करें",
    submit: "सब्सक्राइब करें",
    close: "बंद करें",
    success: "आपने ShivanyaMS अपडेट्स के लिए सब्सक्राइब कर लिया है।",
    alreadySubscribed: "यह ईमेल पहले से ही अपडेट्स के लिए सब्सक्राइब है।",
    error: "अभी सब्सक्राइब नहीं हो सका। कृपया फिर से प्रयास करें।",
    invalid: "कृपया सही ईमेल पता दर्ज करें।",
  },
};

export function NewsletterSubscribeButton({ language = "en" }: { language?: Language }) {
  const { user, loading: authLoading } = useAuth();
  const t = labels[language] || labels.en;
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const isAccountSubscribed = Boolean(user && subscribed);
  const [unsubscribeToken, setUnsubscribeToken] = useState("");

  const subscribe = useCallback(async (guestEmail?: string) => {
    setBusy(true);
    setMessage("");
    try {
      const response = await authenticatedFetch(getPortalApiUrl("newsletter/subscribe/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          ...(user ? {} : { email: guestEmail?.trim().toLowerCase() || "" }),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.email?.[0] || payload.detail || t.error);
      }
      setSubscribed(Boolean(payload.subscribed));
      setUnsubscribeToken(payload.unsubscribe_token || "");
      setSuccess(true);
      setMessage(payload.already_subscribed ? t.alreadySubscribed : t.success);
      if (guestEmail) setEmail(guestEmail.trim().toLowerCase());
    } catch (error) {
      setSuccess(false);
      setMessage(error instanceof Error ? error.message : t.error);
    } finally {
      setBusy(false);
    }
  }, [language, user, t.error, t.success, t.alreadySubscribed]);

  useEffect(() => {
    let active = true;
    if (!user) {
      setSubscribed(false);
      setMessage("");
      setSuccess(false);
      setChecking(false);
      return;
    }

    setChecking(true);
    authenticatedFetch(getPortalApiUrl("newsletter/subscribe/"), { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((payload) => {
        if (!active || !payload) return;
        setSubscribed(Boolean(payload.subscribed));
        if (payload.subscribed) {
          setSuccess(true);
          setMessage(t.success);
        } else {
          setSuccess(false);
          setMessage("");
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setChecking(false);
      });

    return () => {
      active = false;
    };
  }, [user, t.success]);

  const unsubscribe = useCallback(async () => {
    setBusy(true);
    setMessage("");
    try {
      const response = await authenticatedFetch(getPortalApiUrl("newsletter/subscribe/"), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user ? {} : { email: email.trim().toLowerCase(), unsubscribe_token: unsubscribeToken }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || t.unsubscribeError);
      setSubscribed(false);
      setUnsubscribeToken("");
      setSuccess(false);
      if (!user) setMessage(t.unsubscribeSuccess);
    } catch (error) {
      setSuccess(false);
      setMessage(error instanceof Error ? error.message : t.unsubscribeError);
    } finally {
      setBusy(false);
    }
  }, [email, unsubscribeToken, user, t.unsubscribeError, t.unsubscribeSuccess]);

  function handleSubscribeClick() {
    setMessage("");
    if (user && subscribed) {
      void unsubscribe();
      return;
    }
    if (user) {
      void subscribe();
      return;
    }
    setSuccess(false);
    setOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setMessage(t.invalid);
      setSuccess(false);
      return;
    }
    await subscribe(normalizedEmail);
  }

  return (
    <>
      <div className="subscribe-content newsletter-subscribe-content">
        <h3>{isAccountSubscribed ? t.subscribedTitle : t.title}</h3>
        <p>{t.description}</p>
      </div>
      <button
        type="button"
        className={`subscribe-button${isAccountSubscribed ? " is-subscribed" : ""}`}
        onClick={handleSubscribeClick}
        disabled={authLoading || busy || checking}
        aria-label={isAccountSubscribed ? t.unsubscribe : t.button}
        aria-pressed={isAccountSubscribed}
      >
        {isAccountSubscribed ? t.unsubscribe : t.button}
      </button>
      {message && !open && !subscribed ? (
        <p className={success ? "newsletter-subscribe-inline success" : "newsletter-subscribe-inline"} role="status">
          {message}
        </p>
      ) : null}
      {open && typeof document !== "undefined" ? createPortal(
        <div className="newsletter-subscribe-overlay" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !busy) setOpen(false);
        }}>
          <section className="newsletter-subscribe-dialog" role="dialog" aria-modal="true" aria-labelledby="newsletter-subscribe-title">
            <IconButton
              size="md"
              variant="ghost"
              iconRotateOnHover
              className="newsletter-subscribe-close"
              onClick={() => setOpen(false)}
              aria-label={t.close}
              title={t.close}
            >
              <CloseIcon />
            </IconButton>
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
                disabled={busy}
              />
              {message ? <div className={success ? "newsletter-subscribe-message success" : "newsletter-subscribe-message"} role="status">{message}</div> : null}
              <div className="newsletter-subscribe-actions">
                <button type="submit" className="newsletter-subscribe-submit" disabled={busy || success}>
                  {success ? t.subscribed : t.submit}
                </button>
                <button type="button" className="newsletter-subscribe-unsubscribe" onClick={() => void unsubscribe()} disabled={busy || !success}>
                  {t.unsubscribe}
                </button>
              </div>
            </form>
          </section>
        </div>,
        document.body
      ) : null}
    </>
  );
}
