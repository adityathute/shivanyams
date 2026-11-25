"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePortalData, type ImportantDate, type Item, type PostFAQ } from "../data/portal-data";
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
import { LinkIcon, MailIcon } from "shivanya-ui";
import { formatCompactNumber } from "../../../lib/format-number";
import { POST_PAGE_USEFUL_LINKS_DISPLAY_LIMIT } from "../utils/important-links-config";
import {
  NOT_FOUND_RECOMMENDATIONS_LIMIT,
  getNotFoundRecommendationText,
} from "./not-found-recommendations-config";
import "../home/UpdatesSection.css";
import { authenticatedFetch } from "../../../lib/authenticated-fetch";
import { PostCommentsSection } from "./PostCommentsSection";
import { PostFAQSection } from "./PostFAQSection";
import { PostEngagementActions } from "./PostEngagementActions";
import { NewsletterSubscribeButton } from "./NewsletterSubscribeButton";

export type CategorySlug =
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

const categoryItemTypes: Record<CategorySlug, Item["type"]> = {
  jobs: "job",
  schemes: "scheme",
  examination: "examination",
  results: "result",
  "admit-cards": "admit",
  guides: "guide",
  videos: "video",
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

function getAnalyticsCsrfToken() {
  if (typeof document === "undefined") return null;

  const prefix = "csrftoken=";
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(prefix));

  if (!cookie) return null;

  try {
    return decodeURIComponent(cookie.slice(prefix.length));
  } catch {
    return cookie.slice(prefix.length);
  }
}

function getAnalyticsVisitorId() {
  const storageKey = "shivanyams_visitor_id";

  try {
    const existing = window.localStorage.getItem(storageKey);
    if (existing) return existing;

    const visitorId =
      typeof window.crypto?.randomUUID === "function"
        ? window.crypto.randomUUID()
        : `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    window.localStorage.setItem(storageKey, visitorId);
    return visitorId;
  } catch {
    return `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function formatPostHeaderDate(value: string, language: string) {
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
    const monthYears = entry.month_years?.length
      ? entry.month_years
      : entry.month && entry.year
        ? [{ month: entry.month, year: entry.year }]
        : [];

    const validEntries = monthYears.filter(
      (item) => item.month >= 1 && item.month <= 12 && item.year,
    );

    if (!validEntries.length) return "";

    const years = [...new Set(validEntries.map((item) => item.year))];

    if (years.length === 1) {
      const months = validEntries.map((item) =>
        new Date(item.year, item.month - 1, 1).toLocaleDateString(
          language === "mr" ? "mr-IN" : language === "hi" ? "hi-IN" : "en-IN",
          { month: "long" },
        ),
      );

      return `${months.join(" / ")} ${years[0]}`;
    }

    return validEntries
      .map((item) => formatMonthYear(item.month, item.year, language))
      .join(" / ");
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
  totalPostsUnit: {
    en: "Posts",
    mr: "जागा",
    hi: "पद",
  },
  postNumber: {
    en: "Post No.",
    mr: "पद क्र.",
    hi: "पद क्र.",
  },
  post: {
    en: "Post",
    mr: "पद",
    hi: "पद",
  },
  postName: {
    en: "Name of the Post",
    mr: "पदाचे नाव",
    hi: "पद का नाम",
  },
  feeNote: {
    en: "Application Fee Note",
    mr: "अर्ज शुल्क सूचना",
    hi: "आवेदन शुल्क संबंधी सूचना",
  },
  upTo: {
    en: "Up to",
    mr: "पर्यंत",
    hi: "अधिकतम",
  },
  posted: {
    en: "Posted",
    mr: "प्रकाशित दिनांक",
    hi: "प्रकाशित तिथि",
  },
  lastUpdated: {
    en: "Updated",
    mr: "अपडेट",
    hi: "अपडेट",
  },
  views: { en: "views", mr: "दृश्ये", hi: "व्यू" },
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
  vacancies: { en: "Vacancies", mr: "रिक्त पदे", hi: "रिक्तियां" },
  department: { en: "Department", mr: "विभाग", hi: "विभाग" },
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
  ageAsOn: {
    en: "Age Calculated As On",
    mr: "या तारखेनुसार वय",
    hi: "इस तारीख के अनुसार आयु",
  },
  ageNote: {
    en: "Age Criteria Note",
    mr: "वयोमर्यादेबाबत टीप",
    hi: "आयु संबंधी टिप्पणी",
  },
  years: { en: "years", mr: "वर्षे", hi: "वर्ष" },
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
    en: "Important Links", mr: "महत्त्वाच्या लिंक्स", hi: "महत्वपूर्ण लिंक",
  },
  faqs: { en: "Frequently Asked Questions (FAQ)", mr: "वारंवार विचारले जाणारे प्रश्न (FAQ)", hi: "अक्सर पूछे जाने वाले प्रश्न (FAQ)" },
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

export function PortalPostDetail({ category, previewItem }: { category: CategorySlug; previewItem?: Item | null }) {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(params.slug ?? "");
  const { data } = usePortalData();
  const { language } = usePortalLanguage();
  const { links, getLinkTitle } = useImportantLinks();

  const t = (key: Parameters<typeof getBaseText>[0]) =>
    getBaseText(key, language);
  const [categories, setCategories] = useState<Category[]>([]);
  const [trackedViewsCount, setTrackedViewsCount] = useState<{ postId: number; count: number } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    authenticatedFetch(getPortalApiUrl("categories/"), { signal: controller.signal })
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
    if (category === "videos" && !previewItem) {
      const video = data.videos.find(
        (entry) =>
          (entry.slug || createPostSlug(entry.title)) === slug ||
          entry.id === slug,
      );
      return video
        ? {
            postId: Number(video.id),
            viewsCount: Number(video.views_count) || 0,
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
            updatedDate: "",
            createdAt: "",
            updatedAt: "",
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
            faqs: [] as PostFAQ[],
            importantLinks: [] as {
              group_key: string;
              label_en: string;
              label_mr: string;
              label_hi: string;
              actions: { action_text_en: string; action_text_mr: string; action_text_hi: string; url: string }[];
            }[],
            jobDetails: undefined,
          }
        : null;
    }

    const type = category === "videos" ? "video" : categoryTypes[category];
    const item = previewItem || data.items.find(
      (entry) =>
        entry.type === type &&
        ((entry.slug || createPostSlug(entry.title)) === slug ||
          entry.id === slug),
    );

    return item
      ? {
          postId: Number(item.id),
          viewsCount: Number(item.views_count) || 0,
          comments_enabled: item.comments_enabled !== false,
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
          createdAt: item.created_at || "",
          updatedAt: item.updated_at || "",
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
          faqs: item.faqs || [],
          importantLinks: (() => {
            const groups = new Map<string, { group_key: string; label_en: string; label_mr: string; label_hi: string; actions: { action_text_en: string; action_text_mr: string; action_text_hi: string; url: string }[] }>();
            (item.important_links || []).filter((entry) => entry.is_active !== false && Boolean(entry.url)).forEach((entry, index) => {
              const key = entry.group_key || `legacy-${index}`;
              let group = groups.get(key);
              if (!group) {
                group = { group_key: key, label_en: entry.name_en || "", label_mr: entry.name_mr || "", label_hi: entry.name_hi || "", actions: [] };
                groups.set(key, group);
              }
              group.actions.push({ action_text_en: entry.action_text_en || "Click Here", action_text_mr: entry.action_text_mr || "", action_text_hi: entry.action_text_hi || "", url: entry.url });
            });
            return Array.from(groups.values());
          })(),
          jobDetails: item.job_details
            ? { ...item.job_details, location: item.job_details.location || "" }
            : undefined,
        }
      : null;
  }, [category, data.items, data.videos, slug, language, previewItem]);

  const hasPostBeenUpdated = Boolean(
    post?.createdAt &&
      post?.updatedAt &&
      new Date(post.updatedAt).getTime() > new Date(post.createdAt).getTime(),
  );
  const updatedPostDate = hasPostBeenUpdated ? post?.updatedAt || "" : "";

  const trackedPostIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (previewItem) return;
    const postId = post?.postId;
    if (!postId || !Number.isSafeInteger(postId) || postId <= 0) return;
    if (trackedPostIdRef.current === postId) return;

    trackedPostIdRef.current = postId;

    const visitorId = getAnalyticsVisitorId();
    const userAgent = navigator.userAgent;
    const device = /ipad|tablet/i.test(userAgent)
      ? "tablet"
      : /mobile|android|iphone|ipod/i.test(userAgent)
        ? "mobile"
        : "desktop";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const csrfToken = getAnalyticsCsrfToken();
    if (csrfToken) headers["X-CSRFToken"] = csrfToken;

    void authenticatedFetch(getPortalApiUrl(`content/${postId}/views/`), {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({
        visitor_id: visitorId,
        language,
        device,
        referrer_url: document.referrer,
      }),
      keepalive: true,
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`View tracking failed (${response.status}).`);
      }
      setTrackedViewsCount({ postId, count: (Number(post?.viewsCount) || 0) + 1 });
    }).catch((error) => {
      if (trackedPostIdRef.current === postId) {
        trackedPostIdRef.current = null;
      }
      console.error("Post view tracking failed:", error);
    });
  }, [post?.postId, post?.viewsCount, language, previewItem]);

  const categoryApiSlug = category === "guides" ? "articles-guides" : category;
  const categoryRecord = categories.find(
    (entry) => entry.slug === categoryApiSlug,
  );
  const label = categoryRecord
    ? getCategoryTitle(categoryRecord, language as CategoryLanguage)
    : "";

  const categoryPosts = useMemo(() => {
    if (category === "videos") {
      return data.videos.map((video) => ({
        id: video.id,
        slug: video.slug,
        title: video.title,
        title_en: video.title_en,
        title_mr: video.title_mr,
        title_hi: video.title_hi,
        views_count: video.views_count,
        date: video.date || video.published_at || "",
      }));
    }

    return data.items.filter((item) => item.type === categoryItemTypes[category]);
  }, [category, data.items, data.videos]);
  const hasViewedCategoryPosts = categoryPosts.some(
    (item) => Number(item.views_count) > 0,
  );
  const recommendedPosts = useMemo(() => {
    const sorted = [...categoryPosts].sort((a, b) => {
      if (hasViewedCategoryPosts) {
        return (Number(b.views_count) || 0) - (Number(a.views_count) || 0)
          || b.date.localeCompare(a.date);
      }
      return b.date.localeCompare(a.date);
    });
    return sorted.slice(0, NOT_FOUND_RECOMMENDATIONS_LIMIT);
  }, [categoryPosts, hasViewedCategoryPosts]);

  const jobAgeDetails = post?.jobDetails;
  const jobDetails = post?.jobDetails;

  const isTextOnlyAgeCriteria =
    jobAgeDetails?.age_criteria_type === "text_only";

  const ageLimitValue = (() => {
    if (!jobAgeDetails || isTextOnlyAgeCriteria) return "";

    const min = jobAgeDetails.age_min;
    const max = jobAgeDetails.age_max;

    if (min != null && max != null) {
      return `${min} – ${max} ${getDetailLabel("years", language)}`;
    }

    if (min != null) {
      return `${min}+ ${getDetailLabel("years", language)}`;
    }

    if (max != null) {
      return `${getDetailLabel("upTo", language)} ${max} ${getDetailLabel("years", language)}`;
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

    return "";
  })();

  const ageLimitNote = getLocalizedText(
    language,
    jobAgeDetails?.age_limit_note_en,
    jobAgeDetails?.age_limit_note_mr,
    jobAgeDetails?.age_limit_note_hi,
  );

  const applicationFeeNote = getLocalizedText(
    language,
    jobAgeDetails?.application_fee_note_en,
    jobAgeDetails?.application_fee_note_mr,
    jobAgeDetails?.application_fee_note_hi,
  );

  const overallPostAgeLimitValue = (() => {
    if (jobDetails?.age_mode !== "per_post" || !jobDetails.posts?.length) {
      return ageLimitValue;
    }

    const minimumAges = jobDetails.posts
      .map((entry) => entry.age_min)
      .filter((value): value is number => value != null && Number.isFinite(Number(value)))
      .map(Number);
    const maximumAges = jobDetails.posts
      .map((entry) => entry.age_max)
      .filter((value): value is number => value != null && Number.isFinite(Number(value)))
      .map(Number);

    if (!minimumAges.length && !maximumAges.length) return ageLimitValue;

    const min = minimumAges.length ? Math.min(...minimumAges) : null;
    const max = maximumAges.length ? Math.max(...maximumAges) : null;

    if (min != null && max != null) {
      return `${min} – ${max} ${getDetailLabel("years", language)}`;
    }
    if (min != null) return `${min}+ ${getDetailLabel("years", language)}`;
    return `${getDetailLabel("upTo", language)} ${max} ${getDetailLabel("years", language)}`;
  })();

  const ageInfoRows: [string, string][] = [
    ...(overallPostAgeLimitValue
      ? [
          [getDetailLabel("ageLimit", language), overallPostAgeLimitValue] as [
            string,
            string,
          ],
        ]
      : []),

    ...(jobAgeDetails?.age_as_on_date
      ? [
          [
            getDetailLabel("ageAsOn", language),
            formatDate(jobAgeDetails.age_as_on_date, language),
          ] as [string, string],
        ]
      : []),

    ...(ageLimitNote
      ? [
          [
            getDetailLabel(
              isTextOnlyAgeCriteria ? "ageLimit" : "ageNote",
              language,
            ),
            ageLimitNote,
          ] as [string, string],
        ]
      : []),
  ];

  const primarySummaryRows: [string, string | number | null | undefined][] = [
    [getDetailLabel("advertisementNo", language) ?? "", post?.jobDetails?.advertisement_no] as [string, string | number | null | undefined],
    [
      getDetailLabel("total", language) ?? "",
      post?.jobDetails?.total_posts != null && Number(post.jobDetails.total_posts) > 0
        ? `${post.jobDetails.total_posts} ${getDetailLabel("totalPostsUnit", language)}`
        : "",
    ] as [string, string | number | null | undefined],
    [getDetailLabel("applicationMode", language) ?? "", post?.jobDetails?.application_mode] as [string, string | number | null | undefined],
    [getDetailLabel("jobLocation", language) ?? "", post?.jobDetails?.location] as [string, string | number | null | undefined],
  ].filter(([, value]) =>
    value !== null &&
    value !== undefined &&
    String(value).trim() !== "" &&
    String(value).trim() !== "0"
  );

  return (
    <>
      <main className="portal-post-detail">
        {previewItem ? (
          <div className="portal-preview-banner" role="status">
            <strong>Preview mode</strong>
            <span>This post is not published. Only authorized admins can view this preview.</span>
          </div>
        ) : null}
        <div className="portal-post-detail-inner">
          <div
            className={`content-layout ${!data.loading && (post || recommendedPosts.length > 0) ? "has-sidebar" : "no-sidebar"}`}
          >
            <div className="post-detail-main">
              {data.loading ? (
                <div className="portal-post-loading">Loading...</div>
              ) : post ? (
                <>
                <article className="portal-post-card">
                  <div className="portal-post-compact-header">
                    <div className="portal-post-meta portal-post-meta-compact">
                      <span>{post.category || label}</span>
                    </div>
                    <div className="portal-post-header-meta-right">
                      {updatedPostDate ? (
                        <div className="portal-post-header-updated">
                          <span className="portal-post-date-label">{getDetailLabel("lastUpdated", language)}</span>
                          <time dateTime={updatedPostDate}>{formatPostHeaderDate(updatedPostDate, language)}</time>
                        </div>
                      ) : null}
                      <div className="portal-post-header-views">
                        <span>{formatCompactNumber(trackedViewsCount?.postId === post.postId ? trackedViewsCount.count : Number(post.viewsCount) || 0)}</span>
                        <span>views</span>
                      </div>
                    </div>
                  </div>

                  <h1>{post.title}</h1>

                  {post.description ? (
                    <p className="portal-post-summary">{post.description}</p>
                  ) : null}

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
                          href={`/tags/${createPostSlug(tag)}`}
                          key={tag}
                        >
                          {tag}
                        </a>
                      ))}
                    </div>
                  ) : null}

                  {post.body ? (
                    <div className="portal-post-summary">{post.body}</div>
                  ) : null}

                  {post.jobDetails ? (
                    <section className="portal-job-details">
                      <div className="portal-job-info-grid">
                        {primarySummaryRows.length > 0 ? (
                          <div
                            className={`portal-job-info-primary-grid portal-job-info-primary-grid-count-${primarySummaryRows.length}`}
                          >
                            {primarySummaryRows.map(([name, value]) => {
                              const shouldCapitalize =
                                name === getDetailLabel("applicationMode", language) ||
                                name === getDetailLabel("jobLocation", language);
                              const formattedValue = shouldCapitalize
                                ? String(value).charAt(0).toUpperCase() +
                                  String(value).slice(1)
                                : value;

                              return (
                                <div className="portal-job-info-item" key={name}>
                                  <span className="portal-job-info-label">{name}</span>
                                  <strong className="portal-job-info-value">
                                    {formattedValue}
                                  </strong>
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                        {[
                          ...ageInfoRows,

                          // Application Fee
                          ...(jobDetails?.application_fee
                            ? [
                                [
                                  getDetailLabel("fee", language),
                                  jobDetails.application_fee,
                                ] as [string, string],
                              ]
                            : []),

                          // Multilingual Application Fee Note
                          ...(applicationFeeNote
                            ? [
                                [
                                  getDetailLabel("feeNote", language),
                                  applicationFeeNote,
                                ] as [string, string],
                              ]
                            : []),
                        ]
                          .filter(
                            ([, value]) =>
                              value !== null &&
                              value !== undefined &&
                              String(value).trim() !== "",
                          )
                          .map(([name, value]) => {
                            const shouldCapitalize =
                              name ===
                                getDetailLabel("applicationMode", language) ||
                              name === getDetailLabel("jobLocation", language);

                            const formattedValue = shouldCapitalize
                              ? String(value).charAt(0).toUpperCase() +
                                String(value).slice(1)
                              : value;

                            const isAgeRow = ageInfoRows.some(
                              ([ageLabel]) => ageLabel === name,
                            );

                            const isAgeNote =
                              ageInfoRows.some(
                                ([ageLabel]) => ageLabel === name,
                              ) &&
                              (name === getDetailLabel("ageNote", language) ||
                                (isTextOnlyAgeCriteria &&
                                  name ===
                                    getDetailLabel("ageLimit", language)));

                            const isFeeRow =
                              name === getDetailLabel("fee", language);

                            const isFeeNoteRow =
                              name === getDetailLabel("feeNote", language);

                            let rowSpan = "";

                            if (isAgeRow) {
                              rowSpan =
                                ageInfoRows.length === 1
                                  ? "portal-job-info-item-age-full"
                                  : ageInfoRows.length === 2
                                    ? "portal-job-info-item-age-half"
                                    : isAgeNote
                                      ? "portal-job-info-item-age-note"
                                      : "portal-job-info-item-age-quarter";
                            } else if (isFeeRow) {
                              rowSpan = applicationFeeNote
                                ? "portal-job-info-item-fee"
                                : "portal-job-info-item-fee-full";
                            } else if (isFeeNoteRow) {
                              rowSpan = jobDetails?.application_fee
                                ? "portal-job-info-item-fee-note"
                                : "portal-job-info-item-fee-full";
                            }

                            return (
                              <div
                                className={`portal-job-info-item ${rowSpan}`}
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

                      {/* {[
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
                        ))} */}

                      {jobDetails?.posts?.length ? (
                        <div className="portal-post-wise-details">
                          <h2>{getDetailLabel("postDetails", language)}</h2>
                          {(() => {
                            const rows = jobDetails.posts.map((entry) => {
                              const postName = getLocalizedText(
                                language,
                                entry.post_name_en,
                                entry.post_name_mr,
                                entry.post_name_hi,
                              );
                              const educations = Array.isArray(entry.educations)
                                ? entry.educations
                                    .map((education) =>
                                      getLocalizedText(
                                        language,
                                        education.qualification_en,
                                        education.qualification_mr,
                                        education.qualification_hi,
                                      ),
                                    )
                                    .filter(Boolean)
                                : [];
                              const legacyQualification = getLocalizedText(
                                language,
                                entry.educational_qualification_en,
                                entry.educational_qualification_mr,
                                entry.educational_qualification_hi,
                              );
                              const educationItems = educations.length
                                ? educations
                                : legacyQualification
                                  ? [legacyQualification]
                                  : [];
                              const department = getLocalizedText(
                                language,
                                entry.department_en,
                                entry.department_mr,
                                entry.department_hi,
                              );
                              const ageType = entry.age_criteria_type;
                              const ageValue =
                                ageType === "text_only"
                                  ? ""
                                  : entry.age_min != null && entry.age_max != null
                                    ? `${entry.age_min} – ${entry.age_max} ${getDetailLabel("years", language)}`
                                    : entry.age_min != null
                                      ? `${entry.age_min}+ ${getDetailLabel("years", language)}`
                                      : entry.age_max != null
                                        ? `${getDetailLabel("upTo", language)} ${entry.age_max} ${getDetailLabel("years", language)}`
                                        : [
                                            entry.eligible_dob_from
                                              ? formatDate(entry.eligible_dob_from, language)
                                              : "",
                                            entry.eligible_dob_to
                                              ? formatDate(entry.eligible_dob_to, language)
                                              : "",
                                          ].filter(Boolean).join(" – ");
                              const ageNote = getLocalizedText(
                                language,
                                entry.age_limit_note_en,
                                entry.age_limit_note_mr,
                                entry.age_limit_note_hi,
                              );
                              const fees = (entry.fees || []).map((fee) => {
                                const categoryName = getLocalizedText(
                                  language,
                                  fee.category_name_en,
                                  fee.category_name_mr,
                                  fee.category_name_hi,
                                );
                                const feeNote = getLocalizedText(
                                  language,
                                  fee.fee_note_en,
                                  fee.fee_note_mr,
                                  fee.fee_note_hi,
                                );
                                const amount = fee.fee_amount != null && fee.fee_amount !== ""
                                  ? `₹${Number(fee.fee_amount).toLocaleString("en-IN")}`
                                  : "—";
                                return [categoryName || fee.category_name_en, amount, feeNote]
                                  .filter(Boolean)
                                  .join(": ");
                              });
                              return {
                                entry,
                                postName: postName || entry.post_name_en || "—",
                                educationItems,
                                department,
                                ageValue,
                                ageAsOn: entry.age_as_on_date
                                  ? formatDate(entry.age_as_on_date, language)
                                  : "",
                                ageNote,
                                fees,
                              };
                            });

                            const showDepartment = rows.some((row) => row.department);
                            const showAge =
                              jobDetails.age_mode === "per_post" &&
                              rows.some((row) => row.ageValue);
                            const showAgeNote =
                              jobDetails.age_mode === "per_post" &&
                              rows.some((row) => row.ageNote);
                            const hasCommonFee = Boolean(
                              jobDetails.application_fee != null &&
                              String(jobDetails.application_fee).trim(),
                            );
                            const showPostFees = rows.some(
                              (row) => row.fees.length > 0,
                            );
                            const totalVacancies = rows.reduce(
                              (total, row) => total + (Number(row.entry.vacancies) || 0),
                              0,
                            );
                            const commonEducationItems =
                              jobDetails.education_is_common_field && jobDetails.educational_qualification
                                ? [jobDetails.educational_qualification]
                                : rows[0]?.educationItems.length
                                  ? rows[0].educationItems
                                  : [jobDetails.educational_qualification].filter(Boolean);

                            return (
                              <>
                                <div className="portal-post-wise-table-wrap">
                                <table className="portal-post-wise-table">
                                  <thead>
                                    <tr>
                                      <th>{getDetailLabel("postNumber", language)}</th>
                                      <th>{getDetailLabel("postName", language)}</th>
                                      <th>{getDetailLabel("vacancies", language)}</th>
                                      {showDepartment ? <th>{getDetailLabel("department", language)}</th> : null}
                                      {showAge ? <th>{getDetailLabel("ageLimit", language)}</th> : null}
                                      {showAgeNote ? <th>{getDetailLabel("ageNote", language)}</th> : null}
                                      {showPostFees ? <th>{getDetailLabel("fee", language)}</th> : null}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {rows.map((row, index) => (
                                      <tr key={row.entry.id || `${row.entry.post_number}-${index}`}>
                                        <td>{row.entry.post_number ?? index + 1}</td>
                                        <td className="portal-post-wise-name">{row.postName}</td>
                                        <td>{row.entry.vacancies != null ? Number(row.entry.vacancies).toLocaleString("en-IN") : "—"}</td>
                                        {showDepartment ? <td>{row.department || "—"}</td> : null}
                                        {showAge ? <td>{row.ageValue || "—"}</td> : null}
                                        {showAgeNote ? <td>{row.ageNote || "—"}</td> : null}
                                        {showPostFees ? <td>{row.fees.length ? row.fees.join("; ") : "—"}</td> : null}
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot>
                                    <tr>
                                      <td></td>
                                      <th>{getDetailLabel("total", language)}</th>
                                      <th>{totalVacancies.toLocaleString("en-IN")}</th>
                                      {showDepartment ? <td></td> : null}
                                      {showAge ? <td></td> : null}
                                      {showAgeNote ? <td></td> : null}
                                      {showPostFees ? <td></td> : null}
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                              {jobDetails.education_mode === "common" && commonEducationItems.length ? (
                                <div className="portal-job-detail-group portal-education-details">
                                  <h2>{getDetailLabel("qualification", language)}</h2>
                                  <div className="portal-job-detail-row">
                                    <ul>
                                      {commonEducationItems.map((item, itemIndex) => (
                                        <li key={itemIndex}>{item}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              ) : null}
                              {jobDetails.education_mode === "per_post" && rows.some((row) => row.educationItems.length) ? (
                                <div className="portal-job-detail-group portal-education-details">
                                  <h3>{getDetailLabel("qualification", language)}</h3>
                                  {rows.filter((row) => row.educationItems.length).map((row, index) => (
                                    <div className="portal-education-post-card" key={row.entry.id || row.entry.post_number || index}>
                                      <div className="portal-education-post-heading">
                                        <strong>
                                          {row.entry.post_number || index + 1}. {row.postName || "—"}
                                        </strong>
                                      </div>
                                      <ul>
                                        {row.educationItems.map((item, itemIndex) => (
                                          <li key={itemIndex}>{item}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                              </>
                            );
                          })()}
                        </div>
                      ) : jobDetails?.education_mode === "common" && jobDetails?.educational_qualification ? (
                        <div className="portal-job-detail-group portal-education-details">
                          <h2>{getDetailLabel("qualification", language)}</h2>
                          <div className="portal-job-detail-row">
                            <span>{jobDetails.educational_qualification}</span>
                          </div>
                        </div>
                      ) : null}


                    </section>
                  ) : null}

                  {post.importantDates.length ? (
                    <section className="portal-job-details portal-important-dates">
                      <div className="portal-important-dates-heading">
                        <h2>{getDetailLabel("importantDates", language)}</h2>
                      </div>

                      <div className="portal-important-dates-list">
                        {post.importantDates.map((entry, index) => {
                          const label = getLocalizedText(
                            language,
                            entry.label_en,
                            entry.label_mr,
                            entry.label_hi,
                          );

                          const isDeadline =
                            entry.date_type === "application_end" ||
                            entry.date_type === "fee_last_date" ||
                            entry.date_type === "correction_window";

                          const description = getLocalizedText(
                            language,
                            entry.description_en,
                            entry.description_mr,
                            entry.description_hi,
                          );

                          const isRevised =
                            entry.date_format === "revised" ||
                            entry.date_format === "revised_with_time";

                          return (
                            <div
                              className={`portal-important-date-item ${
                                isRevised ? "is-revised" : ""
                              }`}
                              key={entry.id ?? `${entry.date_type}-${index}`}
                            >
                              <div className="portal-important-date-info">
                                <div className="portal-important-date-title">
                                  <span className="portal-important-date-dot" />
                                  <strong>
                                    {label ||
                                      detailLabelFallback(entry.date_type)}
                                  </strong>
                                </div>

                                {description ? (
                                  <p className="portal-important-date-description">
                                    {description}
                                  </p>
                                ) : null}
                              </div>

                              <div
                                className={`portal-important-date-value ${
                                  isDeadline ? "is-deadline" : ""
                                }`}
                              >
                                {isRevised ? (
                                  <>
                                    <s>
                                      {formatDate(
                                        entry.old_date || "",
                                        language,
                                      )}
                                      {entry.date_format ===
                                        "revised_with_time" && entry.old_time
                                        ? ` (${formatTime(entry.old_time, language)})`
                                        : ""}
                                    </s>

                                    <strong>
                                      {formatDate(
                                        entry.new_date || "",
                                        language,
                                      )}
                                      {entry.date_format ===
                                        "revised_with_time" && entry.new_time
                                        ? ` (${formatTime(entry.new_time, language)})`
                                        : ""}
                                    </strong>
                                  </>
                                ) : (
                                  renderImportantDateValue(entry, language)
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  ) : null}

                  {post.importantLinks.length ? (
                    <section className="portal-important-links">
                      <div className="portal-important-dates-heading">
                        <h2>{getDetailLabel("importantLinks", language)}</h2>
                      </div>
                      <div className="portal-important-links-list">
                        {post.importantLinks.map((group) => (
                          <div className="portal-important-link-item" key={group.group_key}>
                            <strong>{getLocalizedText(language, group.label_en, group.label_mr, group.label_hi)}</strong>
                            <div className="portal-important-link-actions">
                              {group.actions.map((action, actionIndex) => (
                                <a className="portal-important-link-action" href={action.url} key={actionIndex} target="_blank" rel="noopener noreferrer">
                                  {getLocalizedText(language, action.action_text_en || "Click Here", action.action_text_mr, action.action_text_hi) || "Click Here"}
                                  <span aria-hidden="true">↗</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : null}


                  {category === "videos" && post.link ? (
                    <a
                      className="portal-post-action"
                      href={post.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {getDetailLabel("watchVideo", language)}
                      <span aria-hidden="true">↗</span>
                    </a>
                  ) : null}
                {!previewItem ? (
                  <div className="portal-post-card-footer">
                    <PostEngagementActions postId={post.postId} title={post.title} placement="footer" />
                  </div>
                ) : null}
                </article>
                {!previewItem ? (
                  <>
                    {post.comments_enabled !== false ? <PostCommentsSection postId={post.postId} language={language} /> : null}
                    <PostFAQSection postId={post.postId} faqs={post.faqs} language={language} />
                  </>
                ) : null}
                </>
              ) : (
                <>
                  <PortalContentNotFound
                    categoryLabel={label || category}
                    categoryHref={`/${category}`}
                  />
                  {!data.loading && recommendedPosts.length === 0 ? (
                    <section className="subscribe-panel not-found-subscribe-panel">
                      <div className="subscribe-icon">
                        <MailIcon />
                      </div>
                      <NewsletterSubscribeButton language={language as "en" | "mr" | "hi"} />
                    </section>
                  ) : null}
                </>
              )}
            </div>

            {/* Right sidebar: useful links for a post, or category recommendations for a 404. */}
            {!data.loading && (post || recommendedPosts.length > 0) && (
              <aside className="right-column">
                {post ? (
                <>
                <section className="panelin important-panel">
                  <div className="section-heading">
                    <h2>{t("usefulLinks")}</h2>
                    <span>{t("usefulLinks")}</span>
                  </div>

                  {links.slice(0, POST_PAGE_USEFUL_LINKS_DISPLAY_LIMIT).map((link) => (
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

                <section className="subscribe-panel">
                  <div className="subscribe-icon">
                    <MailIcon />
                  </div>

                  <NewsletterSubscribeButton language={language as "en" | "mr" | "hi"} />
                </section>
                </>
                ) : (
                  <section className="panelin not-found-recommendations">
                    <div className="section-heading">
                      <h2>{getNotFoundRecommendationText(hasViewedCategoryPosts ? "mostViewed" : "latest", language)} {label || category}</h2>
                      <span>{getNotFoundRecommendationText(hasViewedCategoryPosts ? "popularPosts" : "recentPosts", language)}</span>
                    </div>
                    <div className="not-found-post-list">
                      {recommendedPosts.map((item, index) => (
                        <Link
                          className="not-found-post-link"
                          href={`/${category}/${item.slug || createPostSlug(item.title)}`}
                          key={item.id}
                        >
                          <span className="not-found-post-rank">{index + 1}</span>
                          <span className="not-found-post-copy">
                            <strong>{getLocalizedText(language, item.title_en, item.title_mr, item.title_hi) || item.title}</strong>
                            <small>{(Number(item.views_count) || 0).toLocaleString(language === "mr" ? "mr-IN" : language === "hi" ? "hi-IN" : "en-IN")} {getNotFoundRecommendationText("views", language)}</small>
                          </span>
                          <b aria-hidden="true">›</b>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
                {!post && recommendedPosts.length > 0 && recommendedPosts.length <= 3 ? (
                  <section className="subscribe-panel not-found-subscribe-panel">
                    <div className="subscribe-icon">
                      <MailIcon />
                    </div>
                    <div className="subscribe-content">
                      <h3>{t("subscribeTitle")}</h3>
                      <p>{t("subscribeDescription")}</p>
                    </div>
                    <NewsletterSubscribeButton language={language as "en" | "mr" | "hi"} />
                  </section>
                ) : null}
              </aside>
            )}
          </div>

        </div>
        <div className="portal-post-category-grid">
          <CategoryGrid language={language as CategoryLanguage} />
        </div>
      </main>

      <PortalFooter />
    </>
  );
}
