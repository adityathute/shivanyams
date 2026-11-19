"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { usePortalData, type ImportantDate } from "../data/portal-data";
import { usePortalLanguage } from "../context/PortalLanguageContext";
import { PortalFooter } from "../layout/footer/PortalFooter";
import { PortalContentNotFound } from "./PortalContentNotFound";
import "./PortalPostDetail.css";
import {
  CategoryGrid,
  getPortalApiUrl,
  getCategoryTitle,
  type Category,
  type Language as CategoryLanguage,
} from "../category/CategoryGrid";
import { useImportantLinks } from "../utils/useImportantLinks";
import { getBaseText } from "../../../i18n/dictionaries/base";
import { LinkIcon } from "shivanya-ui";
import "../home/UpdatesSection.css";

type CategorySlug =
  | "jobs"
  | "schemes"
  | "examination"
  | "results"
  | "admit-cards"
  | "guides"
  | "videos"
  | "tools";

const categoryTypes: Record<Exclude<CategorySlug, "videos">, string> = {
  jobs: "job",
  schemes: "scheme",
  examination: "examination",
  results: "result",
  "admit-cards": "admit",
  guides: "guide",
  tools: "tool",
};

export function createPostSlug(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

function formatDate(value: string, language: string) {
  if (!value) return "";
  const locale =
    language === "mr" ? "mr-IN" : language === "hi" ? "hi-IN" : "en-IN";
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
}

function formatTime(value: string | null | undefined, language: string) {
  if (!value) return "";
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;
  const locale =
    language === "mr" ? "mr-IN" : language === "hi" ? "hi-IN" : "en-IN";
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatMonthYear(
  month?: number | null,
  year?: number | null,
  language = "en",
) {
  if (!month || !year || month < 1 || month > 12) return "";
  const locale =
    language === "mr" ? "mr-IN" : language === "hi" ? "hi-IN" : "en-IN";
  return new Date(year, month - 1, 1).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });
}

function renderImportantDateValue(entry: ImportantDate, language: string) {
  const withTime = entry.date_format === "revised_with_time";
  if (entry.date_format === "range") {
    const start = formatDate(entry.start_date || "", language);
    const end = formatDate(entry.end_date || "", language);
    return start && end ? (
      <>
        {start} – {end}
      </>
    ) : (
      start || end
    );
  }

  if (entry.date_format === "month_year") {
    return formatMonthYear(entry.month, entry.year, language);
  }

  if (entry.date_format === "revised" || withTime) {
    const oldDate = formatDate(entry.old_date || "", language);
    const newDate = formatDate(entry.new_date || "", language);
    const oldTime = withTime ? formatTime(entry.old_time, language) : "";
    const newTime = withTime ? formatTime(entry.new_time, language) : "";
    return (
      <>
        <s>
          {oldDate}
          {oldTime ? ` (${oldTime})` : ""}
        </s>
        {" → "}
        <strong>
          {newDate}
          {newTime ? ` (${newTime})` : ""}
        </strong>
      </>
    );
  }

  const date = formatDate(entry.date || "", language);
  const time = formatTime(entry.time, language);
  return (
    <>
      {date}
      {time ? ` (${time})` : ""}
    </>
  );
}

function getVideoEmbedUrl(value?: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    const segments = url.pathname.split("/").filter(Boolean);
    const id =
      host === "youtu.be"
        ? segments[0]
        : url.pathname === "/watch"
          ? url.searchParams.get("v")
          : ["embed", "shorts", "live"].includes(segments[0])
            ? segments[1]
            : null;
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

function getLocalizedText(
  language: string,
  en?: string,
  mr?: string,
  hi?: string,
) {
  const values =
    language === "mr"
      ? [mr, en, hi]
      : language === "hi"
        ? [hi, en, mr]
        : [en, mr, hi];

  return values.find((value) => value?.trim()) || "";
}

const detailLabels = {
  posted: {
    en: "Posted",
    mr: "प्रकाशित दिनांक",
    hi: "प्रकाशित तिथि",
  },
  lastUpdated: {
    en: "Last updated",
    mr: "शेवटचे अपडेट",
    hi: "अंतिम अपडेट",
  },
  eventDate: {
    en: "Event date",
    mr: "कार्यक्रमाची तारीख",
    hi: "कार्यक्रम की तारीख",
  },
  start: { en: "Start", mr: "सुरुवात", hi: "शुरुआत" },
  end: { en: "End", mr: "समाप्ती", hi: "समाप्ति" },
  advertisementNo: {
    en: "Advertisement No.",
    mr: "जाहिरात क्रमांक",
    hi: "विज्ञापन संख्या",
  },
  total: { en: "Total Posts", mr: "एकूण पदे", hi: "कुल पद" },
  examinationName: {
    en: "Name of the Examination",
    mr: "परीक्षेचे नाव",
    hi: "परीक्षा का नाम",
  },
  postDetails: {
    en: "Name of the Post & Details",
    mr: "पदाचे नाव आणि तपशील",
    hi: "पद का नाम और विवरण",
  },
  qualification: {
    en: "Educational Qualification",
    mr: "शैक्षणिक पात्रता",
    hi: "शैक्षणिक योग्यता",
  },
  jobLocation: {
    en: "Job location",
    mr: "नोकरीचे ठिकाण",
    hi: "नौकरी का स्थान",
  },
  ageLimit: { en: "Age Limit", mr: "वयोमर्यादा", hi: "आयु सीमा" },
  minimumAge: { en: "Minimum Age", mr: "किमान वय", hi: "न्यूनतम आयु" },
  maximumAge: { en: "Maximum Age", mr: "कमाल वय", hi: "अधिकतम आयु" },
  ageAsOn: { en: "Age Calculated As On", mr: "या तारखेनुसार वय", hi: "इस तारीख के अनुसार आयु" },
  eligibleDob: { en: "Eligible Date of Birth", mr: "पात्र जन्मतारीख", hi: "पात्र जन्म तिथि" },
  ageNote: { en: "Age Criteria Note", mr: "वयोमर्यादेबाबत टीप", hi: "आयु संबंधी टिप्पणी" },
  ageRelaxations: { en: "Category-wise Age Relaxation", mr: "प्रवर्गनिहाय वयोमर्यादा सवलत", hi: "श्रेणीवार आयु में छूट" },
  relaxationYears: { en: "Relaxation", mr: "वयोमर्यादेत सवलत", hi: "आयु में छूट" },
  years: { en: "years", mr: "वर्षे", hi: "वर्ष" },
  condition: { en: "Condition", mr: "अट", hi: "शर्त" },
  fee: { en: "Application Fee", mr: "अर्ज शुल्क", hi: "आवेदन शुल्क" },
  applicationMode: {
    en: "Application Mode",
    mr: "अर्ज करण्याची पद्धत",
    hi: "आवेदन का माध्यम",
  },
  interviewVenue: {
    en: "Venue of Interview",
    mr: "मुलाखतीचे ठिकाण",
    hi: "साक्षात्कार का स्थान",
  },
  importantDates: {
    en: "Important Dates",
    mr: "महत्त्वाच्या तारखा",
    hi: "महत्वपूर्ण तिथियां",
  },
  importantLinks: {
    en: "Important Links",
    mr: "महत्त्वाच्या लिंक्स",
    hi: "महत्वपूर्ण लिंक",
  },
  watchVideo: { en: "Watch video", mr: "व्हिडिओ पाहा", hi: "वीडियो देखें" },
  visitWebsite: {
    en: "Visit official website",
    mr: "अधिकृत वेबसाइटला भेट द्या",
    hi: "आधिकारिक वेबसाइट देखें",
  },
} as const;

function getDetailLabel(key: keyof typeof detailLabels, language: string) {
  const labels = detailLabels[key];
  return labels[language as keyof typeof labels] || labels.en;
}

const ageCategoryLabels: Record<string, Record<string, string>> = {
  SC: { en: "Scheduled Caste", mr: "अनुसूचित जाती", hi: "अनुसूचित जाति" },
  ST: { en: "Scheduled Tribe", mr: "अनुसूचित जमाती", hi: "अनुसूचित जनजाति" },
  OBC: { en: "Other Backward Classes", mr: "इतर मागासवर्ग", hi: "अन्य पिछड़ा वर्ग" },
  EWS: { en: "Economically Weaker Section", mr: "आर्थिकदृष्ट्या दुर्बल घटक", hi: "आर्थिक रूप से कमजोर वर्ग" },
  PWD: { en: "Persons with Disabilities", mr: "दिव्यांग व्यक्ती", hi: "दिव्यांगजन" },
  UR: { en: "Unreserved", mr: "खुला प्रवर्ग", hi: "अनारक्षित" },
  GENERAL: { en: "General", mr: "खुला प्रवर्ग", hi: "सामान्य" },
};

function getAgeCategoryLabel(code: string, name: string, language: string) {
  return ageCategoryLabels[code.toUpperCase()]?.[language] || name || code;
}

function detailLabelFallback(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const organizationTypeLabels: Record<string, Record<string, string>> = {
  central: { en: "Central Government", mr: "केंद्र सरकार", hi: "केंद्र सरकार" },
  state: { en: "State Government", mr: "राज्य सरकार", hi: "राज्य सरकार" },
  district: {
    en: "District Administration",
    mr: "जिल्हा प्रशासन",
    hi: "जिला प्रशासन",
  },
  local: {
    en: "Local Government",
    mr: "स्थानिक स्वराज्य संस्था",
    hi: "स्थानीय शासन",
  },
  psu: {
    en: "Public Sector Undertaking",
    mr: "सार्वजनिक क्षेत्रातील उपक्रम",
    hi: "सार्वजनिक क्षेत्र का उपक्रम",
  },
  university: {
    en: "Government University",
    mr: "शासकीय विद्यापीठ",
    hi: "सरकारी विश्वविद्यालय",
  },
  bank: { en: "Government Bank", mr: "शासकीय बँक", hi: "सरकारी बैंक" },
  court: { en: "Court", mr: "न्यायालय", hi: "न्यायालय" },
  other: {
    en: "Other Government Organization",
    mr: "इतर शासकीय संस्था",
    hi: "अन्य सरकारी संगठन",
  },
};

function getOrganizationTypeLabel(value: string | undefined, language: string) {
  if (!value) return "";
  const labels = organizationTypeLabels[value];
  return labels?.[language] || labels?.en || "";
}

export function PortalPostDetail({ category }: { category: CategorySlug }) {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(params.slug ?? "");
  const { data } = usePortalData();
  const { language } = usePortalLanguage();
  const { links, getLinkTitle } = useImportantLinks();

  const t = (key: Parameters<typeof getBaseText>[0]) =>
    getBaseText(key, language);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(getPortalApiUrl("categories/"), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load categories.");
        return response.json();
      })
      .then((payload) => {
        const list: Category[] = Array.isArray(payload)
          ? payload
          : (payload.results ?? []);
        setCategories(
          list.filter((entry) => entry.is_active ?? entry.active ?? false),
        );
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          console.error("Category loading failed:", error);
      });
    return () => controller.abort();
  }, []);

  const post = useMemo(() => {
    if (category === "videos") {
      const video = data.videos.find(
        (entry) =>
          (entry.slug || createPostSlug(entry.title)) === slug ||
          entry.id === slug,
      );
      return video
        ? {
            title:
              getLocalizedText(
                language,
                video.title_en,
                video.title_mr,
                video.title_hi,
              ) || video.title,
            description: "",
            category: video.language,
            date: "",
            link: video.url,
            image: video.thumbnail,
            body: "",
            organization: "",
            organizationType: "",
            tags: [] as string[],
            location: "",
            startDate: "",
            endDate: "",
            eventDate: "",
            importantDates: [] as ImportantDate[],
            jobDetails: undefined,
          }
        : null;
    }

    const type = categoryTypes[category];
    const item = data.items.find(
      (entry) =>
        entry.type === type &&
        ((entry.slug || createPostSlug(entry.title)) === slug ||
          entry.id === slug),
    );

    return item
      ? {
          title:
            getLocalizedText(
              language,
              item.title_en,
              item.title_mr,
              item.title_hi,
            ) || item.title,
          description:
            getLocalizedText(
              language,
              item.summary_en,
              item.summary_mr,
              item.summary_hi,
            ) || item.description,
          category:
            getLocalizedText(
              language,
              item.category_en,
              item.category_mr,
              item.category_hi,
            ) || item.category,
          updatedDate: item.updated_date || "",
          date: item.date,
          link: item.link,
          image: item.image || "",
          body:
            getLocalizedText(
              language,
              item.body_en,
              item.body_mr,
              item.body_hi,
            ) ||
            item.body ||
            "",
          organization: getOrganizationTypeLabel(
            item.organization_type,
            language,
          ),
          organizationType: item.organization_type || "",
          tags: item.tags || [],
          location: item.location || "",
          startDate: item.start_date || "",
          endDate: item.end_date || "",
          eventDate: item.event_date || "",
          importantDates: item.important_dates || [],
          jobDetails: item.job_details
            ? { ...item.job_details, location: item.job_details.location || "" }
            : undefined,
        }
      : null;
  }, [category, data.items, data.videos, slug, language]);

  const categoryApiSlug = category === "guides" ? "articles-guides" : category;
  const categoryRecord = categories.find(
    (entry) => entry.slug === categoryApiSlug,
  );
  const label = categoryRecord
    ? getCategoryTitle(categoryRecord, language as CategoryLanguage)
    : "";
  const embedUrl = category === "videos" ? getVideoEmbedUrl(post?.link) : null;

  const jobAgeDetails = post?.jobDetails;

  const ageLimitValue = (() => {
    if (!jobAgeDetails) return "";

    const min = jobAgeDetails.age_min;
    const max = jobAgeDetails.age_max;

    if (min != null && max != null) {
      return `${min} – ${max} ${getDetailLabel("years", language)}`;
    }
    if (min != null) {
      return `${min}+ ${getDetailLabel("years", language)}`;
    }
    if (max != null) {
      return `Up to ${max} ${getDetailLabel("years", language)}`;
    }

    const dobFrom = jobAgeDetails.eligible_dob_from
      ? formatDate(jobAgeDetails.eligible_dob_from, language)
      : "";
    const dobTo = jobAgeDetails.eligible_dob_to
      ? formatDate(jobAgeDetails.eligible_dob_to, language)
      : "";

    if (dobFrom || dobTo) {
      return [dobFrom, dobTo].filter(Boolean).join(" – ");
    }

    return jobAgeDetails.age_limit || "";
  })();

  const ageInfoRows: [string, string][] = [
    ...(ageLimitValue
      ? [[getDetailLabel("ageLimit", language), ageLimitValue] as [string, string]]
      : []),
    ...(jobAgeDetails?.age_as_on_date
      ? [[
          getDetailLabel("ageAsOn", language),
          formatDate(jobAgeDetails.age_as_on_date, language),
        ] as [string, string]]
      : []),
    ...(jobAgeDetails?.age_limit_note?.trim()
      ? [[
          getDetailLabel("ageNote", language),
          jobAgeDetails.age_limit_note.trim(),
        ] as [string, string]]
      : []),
  ];

  return (
    <>
      <main className="portal-post-detail">
        <div className="portal-post-detail-inner">
          <div
            className={`content-layout ${post && !data.loading ? "has-sidebar" : "no-sidebar"}`}
          >
            <div className="post-detail-main">
              {data.loading ? (
                <div className="portal-post-loading">Loading...</div>
              ) : post ? (
                <article className="portal-post-card">
                  <div className="portal-post-meta">
                    <span>{post.category || label}</span>

                    <div className="portal-post-dates">
                      {post.date ? (
                        <div className="portal-post-date-group">
                          <span className="portal-post-date-label">
                            {getDetailLabel("posted", language)}:
                          </span>
                          <time>{formatDate(post.date, language)}</time>
                        </div>
                      ) : null}

                      {post.updatedDate && post.updatedDate !== post.date ? (
                        <div className="portal-post-date-group">
                          <span className="portal-post-date-label">
                            {getDetailLabel("lastUpdated", language)}:
                          </span>
                          <time>{formatDate(post.updatedDate, language)}</time>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <h1>{post.title}</h1>

                  {post.organization || post.tags.length > 0 ? (
                    <div className="portal-post-context portal-post-taxonomy">
                      {post.organization ? (
                        <a
                          className="portal-organization-tag"
                          href={`/jobs/related/organization/${createPostSlug(post.organizationType)}`}
                          aria-label={`View jobs from ${post.organization}`}
                        >
                          {post.organization}
                        </a>
                      ) : null}
                      {post.tags.map((tag) => (
                        <a
                          className="portal-custom-tag"
                          href={`/jobs/related/tag/${createPostSlug(tag)}`}
                          key={tag}
                        >
                          {tag}
                        </a>
                      ))}
                    </div>
                  ) : null}

                  {!post.importantDates.length &&
                  (post.eventDate || post.startDate || post.endDate) ? (
                    <div className="portal-post-context">
                      {post.eventDate ? (
                        <span>
                          {getDetailLabel("eventDate", language)}:{" "}
                          {formatDate(post.eventDate, language)}
                        </span>
                      ) : null}
                      {post.startDate ? (
                        <span>
                          {getDetailLabel("start", language)}:{" "}
                          {formatDate(post.startDate, language)}
                        </span>
                      ) : null}
                      {post.endDate ? (
                        <span>
                          {getDetailLabel("end", language)}:{" "}
                          {formatDate(post.endDate, language)}
                        </span>
                      ) : null}
                    </div>
                  ) : null}

                  {post.image && !embedUrl ? (
                    <Image
                      className="portal-post-image"
                      src={post.image}
                      alt={post.title}
                      width={1200}
                      height={800}
                      sizes="(max-width: 768px) 100vw, 1200px"
                    />
                  ) : null}

                  {embedUrl ? (
                    <div className="portal-post-video">
                      <iframe
                        src={embedUrl}
                        title={post.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  ) : null}

                  {post.jobDetails ? (
                    <section className="portal-job-details">
                      <div className="portal-job-info-grid">
                        {[
                          [
                            getDetailLabel("advertisementNo", language),
                            post.jobDetails.advertisement_no,
                          ],
                          [
                            getDetailLabel("total", language),
                            post.jobDetails.total_posts,
                          ],
                          [
                            getDetailLabel("applicationMode", language),
                            post.jobDetails.application_mode,
                          ],
                          [
                            getDetailLabel("jobLocation", language),
                            post.jobDetails.location,
                          ],
                          ...ageInfoRows,
                        ]
                          .filter(
                            ([, value]) =>
                              value !== null &&
                              value !== undefined &&
                              String(value).trim() !== "",
                          )
                          .map(([name, value]) => {
                            const shouldCapitalize =
                              name === getDetailLabel("applicationMode", language) ||
                              name === getDetailLabel("jobLocation", language);
                            const formattedValue = shouldCapitalize
                              ? String(value).charAt(0).toUpperCase() +
                                String(value).slice(1)
                              : value;

                            return (
                              <div
                                className="portal-job-info-item"
                                key={name as string}
                              >
                                <span className="portal-job-info-label">
                                  {name}
                                </span>
                                <strong className="portal-job-info-value">
                                  {formattedValue}
                                </strong>
                              </div>
                            );
                          })}
                      </div>

                      {[
                        [
                          getDetailLabel("examinationName", language),
                          post.jobDetails.examination_name,
                        ],
                        [
                          getDetailLabel("postDetails", language),
                          post.jobDetails.post_details,
                        ],
                        [
                          getDetailLabel("qualification", language),
                          post.jobDetails.educational_qualification,
                        ],
                        [
                          getDetailLabel("fee", language),
                          post.jobDetails.application_fee,
                        ],
                        [
                          getDetailLabel("interviewVenue", language),
                          post.jobDetails.interview_venue,
                        ],
                      ]
                        .filter(([, value]) => Boolean(value))
                        .map(([name, value]) => (
                          <div
                            className="portal-job-detail-row"
                            key={name as string}
                          >
                            <strong>{name}</strong>
                            <span>{value}</span>
                          </div>
                        ))}

                      {post.jobDetails.important_links.length ? (
                        <div className="portal-job-detail-group">
                          <h2>{getDetailLabel("importantLinks", language)}</h2>
                          {post.jobDetails.important_links.map(
                            (entry, index) => (
                              <div
                                className="portal-job-detail-row"
                                key={index}
                              >
                                <strong>
                                  {getLocalizedText(
                                    language,
                                    entry.label_en,
                                    entry.label_mr,
                                    entry.label_hi,
                                  )}
                                </strong>
                                <a
                                  href={entry.url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {entry.url}
                                </a>
                              </div>
                            ),
                          )}
                        </div>
                      ) : null}
                    </section>
                  ) : null}

                  {post.importantDates.length ? (
                    <section className="portal-job-details portal-important-dates">
                      <div className="portal-job-detail-group">
                        <h2>{getDetailLabel("importantDates", language)}</h2>
                        {post.importantDates.map((entry, index) => {
                          const label = getLocalizedText(
                            language,
                            entry.label_en,
                            entry.label_mr,
                            entry.label_hi,
                          );
                          const description = getLocalizedText(
                            language,
                            entry.description_en,
                            entry.description_mr,
                            entry.description_hi,
                          );
                          return (
                            <div
                              className="portal-job-detail-row"
                              key={entry.id ?? `${entry.date_type}-${index}`}
                            >
                              <strong>
                                {label || detailLabelFallback(entry.date_type)}
                              </strong>
                              <span className="portal-important-date-value">
                                {renderImportantDateValue(entry, language)}
                                {description ? (
                                  <small className="portal-important-date-description">
                                    {description}
                                  </small>
                                ) : null}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  ) : null}

                  {post.description ? (
                    <p className="portal-post-summary">{post.description}</p>
                  ) : null}

                  {post.body ? (
                    <div className="portal-post-summary">{post.body}</div>
                  ) : null}

                  {post.link ? (
                    <a
                      className="portal-post-action"
                      href={post.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {category === "videos"
                        ? getDetailLabel("watchVideo", language)
                        : getDetailLabel("visitWebsite", language)}
                      <span aria-hidden="true">↗</span>
                    </a>
                  ) : null}
                </article>
              ) : (
                <PortalContentNotFound
                  categoryLabel={label || category}
                  categoryHref={`/${category}`}
                />
              )}
            </div>

            {/* RIGHT SIDE: Important Links - only when post exists */}
            {post && !data.loading && (
              <aside className="right-column">
                <section className="panelin important-panel">
                  <div className="section-heading">
                    <h2>{t("importantSections")}</h2>
                    <span>{t("usefulLinks")}</span>
                  </div>

                  {links.map((link) => (
                    <a
                      className="important-link"
                      href={link.url}
                      key={link.id}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <LinkIcon size={16} />
                      {getLinkTitle(link, language)}
                      <b>›</b>
                    </a>
                  ))}
                </section>
              </aside>
            )}
          </div>
        </div>
      </main>

      <div className="portal-post-category-grid">
        <CategoryGrid language={language as CategoryLanguage} />
      </div>

      <PortalFooter />
    </>
  );
}
