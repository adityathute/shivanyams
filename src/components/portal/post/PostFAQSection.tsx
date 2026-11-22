"use client";

import { useState } from "react";
import type { PostFAQ } from "../data/portal-data";
import "./PostFAQSection.css";

type Props = {
  faqs: PostFAQ[];
  language: string;
};

function getLocalizedText(language: string, en?: string, mr?: string, hi?: string) {
  const values = language === "mr"
    ? [mr, en, hi]
    : language === "hi"
      ? [hi, en, mr]
      : [en, mr, hi];

  return values.find((value) => value?.trim()) || "";
}

export function PostFAQSection({ faqs, language }: Props) {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  if (!faqs?.length) return null;

  const heading = language === "mr"
    ? "वारंवार विचारले जाणारे प्रश्न (FAQ)"
    : language === "hi"
      ? "अक्सर पूछे जाने वाले प्रश्न (FAQ)"
      : "Frequently Asked Questions (FAQ)";

  return (
    <section className="portal-faq-section" aria-labelledby="portal-faq-heading">
      <div className="portal-faq-heading">
        <h2 id="portal-faq-heading">{heading}</h2>
      </div>
      <div className="portal-faq-list">
        {faqs.map((faq, index) => {
          const isExpanded = expandedItems.includes(index);
          const question = getLocalizedText(language, faq.question_en, faq.question_mr, faq.question_hi) || faq.question_en;
          const answer = getLocalizedText(language, faq.answer_en, faq.answer_mr, faq.answer_hi) || faq.answer_en;
          const answerId = `portal-faq-answer-${faq.id ?? index}`;

          return (
            <div className={`portal-faq-item${isExpanded ? " is-open" : ""}`} key={faq.id ?? index}>
              <button
                type="button"
                className="portal-faq-question"
                aria-expanded={isExpanded}
                aria-controls={answerId}
                onClick={() => setExpandedItems((current) => isExpanded ? current.filter((item) => item !== index) : [...current, index])}
              >
                <span>{question}</span>
                <span className="portal-faq-chevron" aria-hidden="true" />
              </button>
              <div id={answerId} className="portal-faq-answer-panel" aria-hidden={!isExpanded}>
                <div className="portal-faq-answer-inner"><p>{answer}</p></div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
