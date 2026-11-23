"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { usePortalData } from "../portal/data/portal-data";
import { usePortalLanguage } from "../portal/context/PortalLanguageContext";
import "./saved/SavedPostsPage.css";

const organizationLabels: Record<string, Record<string, string>> = {
  central: { en: "Central Government", mr: "केंद्र सरकार", hi: "केंद्र सरकार" },
  state: { en: "State Government", mr: "राज्य सरकार", hi: "राज्य सरकार" },
  district: { en: "District Administration", mr: "जिल्हा प्रशासन", hi: "जिला प्रशासन" },
  local: { en: "Local Government", mr: "स्थानिक स्वराज्य संस्था", hi: "स्थानीय शासन" },
  psu: { en: "Public Sector Undertaking", mr: "सार्वजनिक क्षेत्रातील उपक्रम", hi: "सार्वजनिक क्षेत्र का उपक्रम" },
  university: { en: "Government University", mr: "शासकीय विद्यापीठ", hi: "सरकारी विश्वविद्यालय" },
  bank: { en: "Government Bank", mr: "शासकीय बँक", hi: "सरकारी बैंक" },
  court: { en: "Court", mr: "न्यायालय", hi: "न्यायालय" },
  other: { en: "Other Government Organization", mr: "इतर शासकीय संस्था", hi: "अन्य सरकारी संगठन" },
};

const copy = {
  en: { eyebrow: "SHIVANYAMS • JOBS", title: "Related Jobs", description: "Browse published jobs matching this tag or organization.", count: "jobs found", loading: "Loading related jobs...", empty: "No published jobs were found for this selection." },
  mr: { eyebrow: "SHIVANYAMS • नोकऱ्या", title: "संबंधित नोकऱ्या", description: "या टॅग किंवा संस्थेशी संबंधित प्रकाशित नोकऱ्या पहा.", count: "नोकऱ्या मिळाल्या", loading: "संबंधित नोकऱ्या लोड होत आहेत...", empty: "या निवडीसाठी प्रकाशित नोकऱ्या उपलब्ध नाहीत." },
  hi: { eyebrow: "SHIVANYAMS • नौकरियां", title: "संबंधित नौकरियां", description: "इस टैग या संगठन से जुड़ी प्रकाशित नौकरियां देखें।", count: "नौकरियां मिलीं", loading: "संबंधित नौकरियां लोड हो रही हैं...", empty: "इस चयन के लिए कोई प्रकाशित नौकरी नहीं मिली।" },
};

function slugify(value: string) {
  return value.normalize("NFKD").toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
}

function localized(value: { en?: string; mr?: string; hi?: string }, language: string) {
  return value[language as "en" | "mr" | "hi"] || value.en || value.mr || value.hi || "";
}

function formatDate(value: string, language: string) {
  if (!value) return "";
  const locale = language === "mr" ? "mr-IN" : language === "hi" ? "hi-IN" : "en-IN";
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}

export function RelatedJobsPage() {
  const params = useParams<{ filterType: string; slug: string }>();
  const filterType = params.filterType;
  const slug = decodeURIComponent(params.slug || "");
  const { data } = usePortalData();
  const { language } = usePortalLanguage();
  const labels = copy[language];

  const jobs = useMemo(() => data.items.filter((item) => {
    if (item.type !== "job") return false;
    if (filterType === "organization") return slugify(item.organization_type || "") === slug;
    if (filterType === "tag") return (item.tags || []).some((tag) => slugify(tag) === slug);
    return false;
  }), [data.items, filterType, slug]);

  const heading = useMemo(() => {
    if (filterType === "organization") {
      const value = jobs[0]?.organization_type || "";
      return localized(organizationLabels[value] || { en: value }, language) || slug.replaceAll("-", " ");
    }
    const tag = jobs.flatMap((job) => job.tags || []).find((value) => slugify(value) === slug);
    return tag || slug.replaceAll("-", " ");
  }, [filterType, jobs, language, slug]);

  return (
    <div className="saved-page related-saved-page">
      <header className="saved-page-heading">
        <span className="saved-eyebrow">{labels.eyebrow}</span>
        <h1>{labels.title}</h1>
        <p>{labels.description}</p>
      </header>

      <section className="saved-panel">
        <div className="saved-section-heading">
          <h2>{heading}</h2>
          <span>{jobs.length} {labels.count}</span>
        </div>

        {data.loading ? (
          <div className="saved-empty-state saved-list-empty" role="status">
            {labels.loading}
          </div>
        ) : jobs.length ? (
          <div className="saved-post-list">
            {jobs.map((job) => {
              const title = localized({ en: job.title_en || job.title, mr: job.title_mr, hi: job.title_hi }, language);
              const summary = localized({ en: job.summary_en || job.description, mr: job.summary_mr, hi: job.summary_hi }, language);
              return (
                <article className="saved-post-row related-job-row" key={job.id}>
                  <a className="saved-post-link" href={`/jobs/${job.slug || slugify(job.title)}`}>
                    <span className="update-badge job">{job.category}</span>
                    <span className="saved-post-title">
                      {title}
                      {summary ? <small>{summary}</small> : null}
                    </span>
                    <time>{formatDate(job.date, language)}</time>
                  </a>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="saved-empty-state saved-list-empty">{labels.empty}</div>
        )}
      </section>
    </div>
  );
}
