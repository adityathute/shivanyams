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
import { VideoPlayer } from "../../videos/VideoPlayer";

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


function formatRelativePostDate(value: string, language: string) {
  if (!value) return "";
  const date = /^\\d{4}-\\d{2}-\\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00`)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return formatDate(value, language);
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  const unit = (count: number, singular: string, plural = `${singular}s`) =>
    `${count} ${count === 1 ? singular : plural}`;

  if (seconds < 60) return `${Math.max(1, seconds)} sec ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0
      ? `${unit(minutes, "min")} ${unit(remainingSeconds, "sec")} ago`
      : `${unit(minutes, "min")} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${unit(hours, "hour")} ${unit(remainingMinutes, "min")} ago`
      : `${unit(hours, "hour")} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    const remainingHours = hours % 24;
    return remainingHours > 0
      ? `${unit(days, "day")} ${unit(remainingHours, "hour")} ago`
      : `${unit(days, "day")} ago`;
  }

  if (days < 30) {
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    return remainingDays > 0
      ? `${unit(weeks, "week")} ${unit(remainingDays, "day")} ago`
      : `${unit(weeks, "week")} ago`;
  }

  return formatDate(value, language);
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
  ageRelaxation: { en: "Category-wise age relaxation", mr: "प्रवर्गनिहाय वयोमर्यादा सवलत", hi: "श्रेणीवार आयु छूट" },
  reservation: { en: "Vacancy reservation", mr: "प्रवर्गनिहाय आरक्षण", hi: "श्रेणीवार आरक्षण" },
  educationRequirements: { en: "Education requirements", mr: "शैक्षणिक पात्रता", hi: "शैक्षणिक योग्यता" },
  subjectRequirements: { en: "Subject requirements", mr: "विषयाची अट", hi: "विषय संबंधी आवश्यकता" },
  experienceRequirements: { en: "Experience requirements", mr: "अनुभवाची अट", hi: "अनुभव संबंधी आवश्यकता" },
  years: { en: "years", mr: "वर्षे", hi: "वर्ष" },
  fee: { en: "Application Fee", mr: "अर्ज शुल्क", hi: "आवेदन शुल्क" },
  feeExempt: { en: "Exempt", mr: "सूट", hi: "छूट" },
  paymentOnline: { en: "Online payment", mr: "ऑनलाइन पेमेंट", hi: "ऑनलाइन भुगतान" },
  paymentOffline: { en: "Offline payment", mr: "ऑफलाइन पेमेंट", hi: "ऑफलाइन भुगतान" },
  paymentBoth: { en: "Online / Offline", mr: "ऑनलाइन / ऑफलाइन", hi: "ऑनलाइन / ऑफलाइन" },
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
  compensation: { en: "Salary & compensation", mr: "वेतन आणि मोबदला", hi: "वेतन और मुआवज़ा" },
  salaryRange: { en: "Salary range", mr: "वेतन श्रेणी", hi: "वेतन सीमा" },
  payScale: { en: "Pay scale", mr: "वेतनश्रेणी", hi: "वेतनमान" },
  gradePay: { en: "Grade pay", mr: "ग्रेड वेतन", hi: "ग्रेड वेतन" },
  salaryPeriod: { en: "Pay period", mr: "वेतन कालावधी", hi: "वेतन अवधि" },
  allowances: { en: "Allowances", mr: "भत्ते", hi: "भत्ते" },
  benefits: { en: "Benefits", mr: "लाभ", hi: "लाभ" },
  employmentConditions: { en: "Employment conditions", mr: "नोकरीच्या अटी", hi: "नौकरी की शर्तें" },
  probationPeriod: { en: "Probation period", mr: "परिविक्षा कालावधी", hi: "परिवीक्षा अवधि" },
  contractDuration: { en: "Contract duration", mr: "कराराचा कालावधी", hi: "अनुबंध अवधि" },
  workingHours: { en: "Working hours", mr: "कामाचे तास", hi: "कार्य समय" },
  serviceBond: { en: "Service bond", mr: "सेवा बंधपत्र", hi: "सेवा बंधपत्र" },
  retirementBenefits: { en: "Retirement benefits", mr: "निवृत्ती लाभ", hi: "सेवानिवृत्ति लाभ" },
  applicationInstructions: { en: "How to apply", mr: "अर्ज कसा करावा", hi: "आवेदन कैसे करें" },
  requiredDocuments: { en: "Required documents checklist", mr: "आवश्यक कागदपत्रांची यादी", hi: "आवश्यक दस्तावेज़ों की सूची" },
  mandatoryDocument: { en: "Mandatory", mr: "अनिवार्य", hi: "अनिवार्य" },
  optionalDocument: { en: "Optional", mr: "ऐच्छिक", hi: "वैकल्पिक" },
  recruitmentType: { en: "Recruitment type", mr: "भरतीचा प्रकार", hi: "भर्ती का प्रकार" },
  applicationStatus: { en: "Application status", mr: "अर्जाची स्थिती", hi: "आवेदन की स्थिति" },
  departmentName: { en: "Department", mr: "विभाग", hi: "विभाग" },
  designation: { en: "Designation", mr: "पदनाम", hi: "पदनाम" },
  selectionProcess: { en: "Selection process", mr: "निवड प्रक्रिया", hi: "चयन प्रक्रिया" },
  examPattern: { en: "Exam pattern", mr: "परीक्षा पद्धती", hi: "परीक्षा पैटर्न" },
  syllabus: { en: "Syllabus", mr: "अभ्यासक्रम", hi: "पाठ्यक्रम" },
  physicalTest: { en: "Physical test", mr: "शारीरिक चाचणी", hi: "शारीरिक परीक्षा" },
  interviewDetails: { en: "Interview details", mr: "मुलाखतीचा तपशील", hi: "साक्षात्कार विवरण" },
  applyNow: { en: "Apply online", mr: "ऑनलाइन अर्ज करा", hi: "ऑनलाइन आवेदन करें" },
  officialNotification: { en: "Official notification", mr: "अधिकृत जाहिरात", hi: "आधिकारिक अधिसूचना" },
  applicationOpen: { en: "Applications are open", mr: "अर्ज सुरू आहेत", hi: "आवेदन खुले हैं" },
  applicationClosed: { en: "Applications are closed", mr: "अर्ज बंद झाले आहेत", hi: "आवेदन बंद हैं" },

  applicationLinks: { en: "Application links", mr: "अर्जाच्या लिंक्स", hi: "आवेदन लिंक" },
  selectionProcess: { en: "Selection process", mr: "निवड प्रक्रिया", hi: "चयन प्रक्रिया" },
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
            examinationDetails: null,
            admitCardDetails: null,
            resultDetails: null,
            videoDetails: (video as unknown as { video_details?: Record<string, unknown> }).video_details || null,
            videoAttachments: (video as unknown as { media_attachments?: Array<Record<string, unknown>> }).media_attachments || [],
            relatedVideos: data.videos.filter((entry) => String(entry.id) !== String(video.id)).slice(0, 4),
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
          examinationDetails: item.examination_details || null,
          admitCardDetails: item.admit_card_details || null,
          resultDetails: item.result_details || null,
          videoDetails: (item as unknown as { video_details?: Record<string, unknown> }).video_details || null,
          videoAttachments: (item as unknown as { media_attachments?: Array<Record<string, unknown>> }).media_attachments || [],
          relatedVideos: data.videos.filter((entry) => String(entry.id) !== String(item.id)).slice(0, 4),
        }
      : null;
  }, [category, data.items, data.videos, slug, language, previewItem]);

  const hasPostBeenUpdated = Boolean(
    post?.createdAt &&
      post?.updatedAt &&
      new Date(post.updatedAt).getTime() > new Date(post.createdAt).getTime(),
  );
  const createdPostDate = post?.createdAt || post?.date || "";
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
        event_id: typeof window.crypto?.randomUUID === "function" ? window.crypto.randomUUID() : `pv-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        language,
        device,
        referrer_url: document.referrer,
      }),
      keepalive: true,
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`View tracking failed (${response.status}).`);
      }
    }).catch((error) => {
      if (trackedPostIdRef.current === postId) {
        trackedPostIdRef.current = null;
      }
      console.error("Post view tracking failed:", error);
    });
  }, [post?.postId, language, previewItem]);

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
                  <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                      __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Article",
                        headline: post.title,
                        description: post.description || undefined,
                        image: post.image || undefined,
                        datePublished: post.date || undefined,
                        dateModified: post.updated_date || post.date || undefined,
                        mainEntityOfPage: `${(process.env.NEXT_PUBLIC_SITE_URL || "https://www.shivanyams.com").replace(/\/+$/, "")}/${category}/${slug}`,
                        publisher: {
                          "@type": "Organization",
                          name: "ShivanyaMS",
                          url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.shivanyams.com",
                          logo: { "@type": "ImageObject", url: `${(process.env.NEXT_PUBLIC_SITE_URL || "https://www.shivanyams.com").replace(/\\/+$/, "")}/logo.png` },
                        },
                      }).replace(/</g, "\\u003c"),
                    }}
                  />
                  <div className="portal-post-compact-header">
                    <div className="portal-post-meta portal-post-meta-compact">
                      <span>{post.category || label}</span>
                      <div className="portal-post-dates">
                        {createdPostDate ? (
                          <div className="portal-post-date-group">
                            <span className="portal-post-date-label">
                              {getDetailLabel("posted", language)}:
                            </span>
                            <time dateTime={createdPostDate}>{formatRelativePostDate(createdPostDate, language)}</time>
                          </div>
                        ) : null}
                        {updatedPostDate ? (
                          <div className="portal-post-date-group">
                            <span className="portal-post-date-label">
                              {getDetailLabel("lastUpdated", language)}:
                            </span>
                            <time dateTime={updatedPostDate}>{formatRelativePostDate(updatedPostDate, language)}</time>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    {!previewItem ? (
                      <PostEngagementActions postId={post.postId} title={post.title} />
                    ) : null}
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
                          href={`/jobs/related/tag/${createPostSlug(tag)}`}
                          key={tag}
                        >
                          {tag}
                        </a>
                      ))}
                    </div>
                  ) : null}

                  {category === "videos" ? (
                    <VideoPlayer title={post.title} description={post.description} details={post.videoDetails as never} attachments={post.videoAttachments as never} related={post.relatedVideos as never} />
                  ) : null}

                  {post.body ? (
                    <div className="portal-post-summary">{post.body}</div>
                  ) : null}

                  {post.examinationDetails ? (() => {
                    const d = post.examinationDetails as Record<string, unknown>;
                    const rows: Array<[string, unknown]> = [
                      ["Exam status", d.exam_status], ["Examination", d.exam_name],
                      ["Exam type", d.exam_type], ["Mode", d.exam_mode],
                      ["Conducting authority", d.conducting_authority],
                      ["Duration (minutes)", d.exam_duration_minutes], ["Total marks", d.total_marks],
                      ["Passing marks", d.passing_marks], ["Negative marking", d.negative_marking],
                      ["Application starts", d.application_start_date], ["Application ends", d.application_end_date],
                      ["Examination date", d.exam_date], ["Expected result date", d.result_expected_date],
                      ["Notification number", d.notification_number],
                      ["Eligibility", getLocalizedText(language, String(d.eligibility_en || ""), String(d.eligibility_mr || ""), String(d.eligibility_hi || ""))],
                      ["Exam pattern", d.exam_pattern], ["Syllabus", d.syllabus], ["Instructions", d.instructions],
                    ];
                    const sections = Array.isArray(d.paper_sections) ? d.paper_sections : [];
                    const links = [["Notification", d.notification_url], ["Admit card", d.admit_card_url], ["Official website", d.official_website]] as Array<[string, unknown]>;
                    return <section className="portal-job-details portal-category-detail-panel"><h2>Examination information</h2><div className="portal-job-info-grid">{rows.filter(([,value]) => value !== null && value !== undefined && String(value).trim() !== "").map(([label,value]) => <div className="portal-job-info-item" key={label}><strong>{label}</strong><span>{String(value)}</span></div>)}</div>{sections.length ? <div className="portal-job-extra-section"><h3>Paper sections</h3><ul>{sections.map((entry,index) => <li key={index}>{typeof entry === "string" ? entry : String((entry as Record<string, unknown>).title || (entry as Record<string, unknown>).name || JSON.stringify(entry))}</li>)}</ul></div> : null}<div className="portal-job-official-actions">{links.filter(([,url]) => typeof url === "string" && url).map(([label,url]) => <a key={label} href={String(url)} target="_blank" rel="noopener noreferrer">{label}</a>)}</div></section>;
                  })() : null}

                  {post.admitCardDetails ? (() => {
                    const d = post.admitCardDetails as Record<string, unknown>;
                    const rows: Array<[string, unknown]> = [
                      ["Card status", d.card_status], ["Issuing authority", d.issuing_authority],
                      ["Examination", d.exam_name], ["Release date", d.release_date],
                      ["Examination date", d.examination_date], ["Available from", d.available_from],
                      ["Available until", d.available_until], ["Exam shift", d.exam_shift],
                      ["Reporting time", d.reporting_time], ["Exam centre", d.exam_center_name],
                      ["Centre address", d.exam_center_address], ["Credentials required", d.required_credentials],
                      ["Photo/signature requirements", d.photo_signature_requirements],
                      ["Helpdesk email", d.helpdesk_email], ["Helpdesk phone", d.helpdesk_phone],
                      ["Helpdesk hours", d.helpdesk_hours], ["Languages", Array.isArray(d.language_options) ? d.language_options.join(", ") : ""],
                      ["Correction window ends", d.correction_window_end], ["Correction contact", d.correction_contact],
                      ["Download instructions", d.download_instructions], ["Important instructions", d.important_instructions],
                    ];
                    const list = (value: unknown) => Array.isArray(value) ? value : [];
                    const links = [["Download admit card", d.download_url], ["Candidate login", d.login_url], ["Forgot credentials", d.forgot_credentials_url], ["Official website", d.official_website]] as Array<[string, unknown]>;
                    return <section className="portal-job-details portal-category-detail-panel"><h2>Admit card information</h2><div className="portal-job-info-grid">{rows.filter(([,value]) => value !== null && value !== undefined && String(value).trim() !== "").map(([label,value]) => <div className="portal-job-info-item" key={label}><strong>{label}</strong><span>{String(value)}</span></div>)}</div>{[["Documents to carry",list(d.documents_to_carry)],["Prohibited items",list(d.prohibited_items)],["Download steps",list(d.download_steps)]].map(([label,items]) => Array.isArray(items) && items.length ? <div className="portal-job-extra-section" key={String(label)}><h3>{String(label)}</h3><ol>{items.map((entry,index) => <li key={index}>{typeof entry === "string" ? entry : String((entry as Record<string, unknown>).title || (entry as Record<string, unknown>).description || JSON.stringify(entry))}</li>)}</ol></div> : null)}<div className="portal-job-official-actions">{links.filter(([,url]) => typeof url === "string" && url).map(([label,url]) => <a key={label} href={String(url)} target="_blank" rel="noopener noreferrer">{label}</a>)}</div></section>;
                  })() : null}

                  {post.resultDetails ? (() => {
                    const d = post.resultDetails as Record<string, unknown>;
                    const summary = getLocalizedText(language, String(d.result_summary_en || ""), String(d.result_summary_mr || ""), String(d.result_summary_hi || ""));
                    const rows: Array<[string, unknown]> = [
                      ["Result type", d.result_type], ["Result status", d.result_status],
                      ["Examination", d.examination_name], ["Result date", d.result_date],
                      ["Scorecard available from", d.scorecard_start_date], ["Scorecard available until", d.scorecard_end_date],
                      ["Login credentials", d.required_credentials], ["Instructions", d.instructions],
                    ];
                    const cutoffs = Array.isArray(d.cutoff_details) ? d.cutoff_details : [];
                    const links = [["View result", d.result_url], ["Merit list", d.merit_list_url], ["Cut-off", d.cut_off_url], ["Scorecard", d.scorecard_url], ["Candidate login", d.login_url], ["Official website", d.official_website]] as Array<[string, unknown]>;
                    return <section className="portal-job-details portal-category-detail-panel"><h2>Result information</h2>{summary ? <p>{summary}</p> : null}<div className="portal-job-info-grid">{rows.filter(([,value]) => value !== null && value !== undefined && String(value).trim() !== "").map(([label,value]) => <div className="portal-job-info-item" key={label}><strong>{label}</strong><span>{String(value)}</span></div>)}</div>{cutoffs.length ? <div className="portal-job-extra-section"><h3>Category-wise cut-off</h3><div className="portal-post-wise-table-wrap"><table className="portal-post-wise-table"><thead><tr><th>Category</th><th>Cut-off</th><th>Notes</th></tr></thead><tbody>{cutoffs.map((entry,index) => {const row=typeof entry==="object"&&entry!==null?entry as Record<string,unknown>:{category:entry};return <tr key={index}><td>{String(row.category || row.name || "")}</td><td>{String(row.marks ?? row.cutoff ?? "")}</td><td>{String(row.note || "")}</td></tr>;})}</tbody></table></div></div> : null}<div className="portal-job-official-actions">{links.filter(([,url]) => typeof url === "string" && url).map(([label,url]) => <a key={label} href={String(url)} target="_blank" rel="noopener noreferrer">{label}</a>)}</div></section>;
                  })() : null}

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
                              const ageRelaxations = (Array.isArray(entry.age_relaxations) ? entry.age_relaxations : []).map((rule) => {
                                const category = getLocalizedText(language, rule.category_en, rule.category_mr, rule.category_hi);
                                const note = getLocalizedText(language, rule.note_en, rule.note_mr, rule.note_hi);
                                const eligibility = getLocalizedText(language, rule.eligibility_en, rule.eligibility_mr, rule.eligibility_hi);
                                const parts = [
                                  rule.relaxation_years != null ? `+${rule.relaxation_years} ${getDetailLabel("years", language)}` : "",
                                  rule.maximum_age != null ? `${getDetailLabel("ageLimit", language)}: ${rule.maximum_age}` : "",
                                  note,
                                  eligibility,
                                ].filter(Boolean);
                                return category ? `${category}: ${parts.join(" · ")}` : "";
                              }).filter(Boolean);
                              const formatRequirements = (items: unknown, includeMetrics = false) =>
                                (Array.isArray(items) ? items : []).map((rule: Record<string, unknown>) => {
                                  const title = getLocalizedText(language, rule.title_en, rule.title_mr, rule.title_hi);
                                  const details = getLocalizedText(language, rule.details_en, rule.details_mr, rule.details_hi);
                                  const metrics = [
                                    includeMetrics && rule.minimum_percentage != null ? `${rule.minimum_percentage}%` : "",
                                    includeMetrics && rule.minimum_years != null ? `${rule.minimum_years} ${getDetailLabel("years", language)}` : "",
                                    rule.mandatory === true ? (language === "mr" ? "अनिवार्य" : language === "hi" ? "अनिवार्य" : "Mandatory") : "",
                                  ].filter(Boolean);
                                  return [title, details, metrics.join(" · ")].filter(Boolean).join(": ");
                                }).filter(Boolean);
                              const educationRequirements = formatRequirements(entry.education_requirements, true);
                              const subjectRequirements = formatRequirements(entry.subject_requirements);
                              const experienceRequirements = formatRequirements(entry.experience_requirements, true);
                              const reservationRules = (Array.isArray(entry.reservation_rules) ? entry.reservation_rules : []).map((rule) => {
                                const category = getLocalizedText(language, rule.category_en, rule.category_mr, rule.category_hi);
                                const type = rule.reservation_type === "horizontal"
                                  ? (language === "mr" ? "आडवे" : language === "hi" ? "क्षैतिज" : "Horizontal")
                                  : (language === "mr" ? "उभे" : language === "hi" ? "ऊर्ध्वाधर" : "Vertical");
                                const details = [
                                  rule.vacancies != null && rule.vacancies !== "" ? `${rule.vacancies} ${getDetailLabel("vacancies", language)}` : "",
                                  rule.percentage != null && rule.percentage !== "" ? `${rule.percentage}%` : "",
                                  rule.applies_to || "",
                                  getLocalizedText(language, rule.note_en, rule.note_mr, rule.note_hi),
                                ].filter(Boolean);
                                return category ? `${type} · ${category}: ${details.join(" · ")}` : "";
                              }).filter(Boolean);
                              const selectionStages = (Array.isArray(entry.selection_stages) ? entry.selection_stages : []).map((stage: Record<string, unknown>, stageIndex: number) => {
                                const title = getLocalizedText(language, String(stage.title_en || ""), String(stage.title_mr || ""), String(stage.title_hi || ""));
                                const details = getLocalizedText(language, String(stage.details_en || ""), String(stage.details_mr || ""), String(stage.details_hi || ""));
                                const typeLabels: Record<string, Record<string, string>> = {
                                  written_exam: { en: "Written examination", mr: "लेखी परीक्षा", hi: "लिखित परीक्षा" },
                                  skill_test: { en: "Skill test", mr: "कौशल्य चाचणी", hi: "कौशल परीक्षा" },
                                  physical_test: { en: "Physical test", mr: "शारीरिक चाचणी", hi: "शारीरिक परीक्षा" },
                                  interview: { en: "Interview", mr: "मुलाखत", hi: "साक्षात्कार" },
                                  document_verification: { en: "Document verification", mr: "कागदपत्र पडताळणी", hi: "दस्तावेज़ सत्यापन" },
                                  medical_exam: { en: "Medical examination", mr: "वैद्यकीय तपासणी", hi: "चिकित्सा परीक्षा" },
                                  trade_test: { en: "Trade test", mr: "व्यवसाय चाचणी", hi: "ट्रेड टेस्ट" },
                                  other: { en: "Other stage", mr: "इतर टप्पा", hi: "अन्य चरण" },
                                };
                                const type = typeLabels[String(stage.stage_type || "other")]?.[language] || typeLabels[String(stage.stage_type || "other")]?.en || "";
                                const duration = stage.duration_minutes ? `${stage.duration_minutes} ${language === "mr" ? "मिनिटे" : language === "hi" ? "मिनट" : "min"}` : "";
                                const requirement = stage.mandatory === false ? (language === "mr" ? "पर्यायी" : language === "hi" ? "वैकल्पिक" : "Optional") : (language === "mr" ? "अनिवार्य" : language === "hi" ? "अनिवार्य" : "Mandatory");
                                return [`${stageIndex + 1}. ${title || type}`, type, requirement, duration, details].filter(Boolean).join(" · ");
                              }).filter(Boolean);
                              const applicationLinks = (Array.isArray(entry.application_links) ? entry.application_links : []).map((item: Record<string, unknown>) => ({
                                label: getLocalizedText(language, String(item.label_en || ""), String(item.label_mr || ""), String(item.label_hi || "")),
                                url: String(item.url || ""),
                                instructions: getLocalizedText(language, String(item.instructions_en || ""), String(item.instructions_mr || ""), String(item.instructions_hi || "")),
                                linkType: String(item.link_type || "other"),
                              })).filter((item) => item.label && /^https?:\/\//i.test(item.url));
                              const postImportantDates = (Array.isArray(entry.important_dates) ? entry.important_dates : []).map((item: Record<string, unknown>) => {
                                const label = getLocalizedText(language, String(item.label_en || ""), String(item.label_mr || ""), String(item.label_hi || ""));
                                const dateFormat = String(item.date_format || "single");
                                const dateValue = dateFormat === "range"
                                  ? [item.start_date ? formatDate(String(item.start_date), language) : "", item.end_date ? formatDate(String(item.end_date), language) : ""].filter(Boolean).join(" – ")
                                  : dateFormat === "month_year"
                                    ? [item.month, item.year].filter(Boolean).join("/")
                                    : dateFormat === "revised" || dateFormat === "revised_with_time"
                                      ? [item.old_date ? formatDate(String(item.old_date), language) : "", "→", item.new_date ? formatDate(String(item.new_date), language) : ""].filter(Boolean).join(" ")
                                      : item.date ? formatDate(String(item.date), language) : "";
                                const description = getLocalizedText(language, String(item.description_en || ""), String(item.description_mr || ""), String(item.description_hi || ""));
                                return [label, dateValue, description].filter(Boolean).join(": ");
                              }).filter(Boolean);
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
                                const exemptionNote = getLocalizedText(
                                  language,
                                  fee.exemption_note_en,
                                  fee.exemption_note_mr,
                                  fee.exemption_note_hi,
                                );
                                const paymentInstructions = getLocalizedText(
                                  language,
                                  fee.payment_instructions_en,
                                  fee.payment_instructions_mr,
                                  fee.payment_instructions_hi,
                                );
                                const amount = fee.is_exempt
                                  ? getDetailLabel("feeExempt", language)
                                  : fee.fee_amount != null && fee.fee_amount !== ""
                                    ? `₹${Number(fee.fee_amount).toLocaleString("en-IN")}`
                                    : "—";
                                const paymentMode = fee.payment_mode === "online"
                                  ? getDetailLabel("paymentOnline", language)
                                  : fee.payment_mode === "offline"
                                    ? getDetailLabel("paymentOffline", language)
                                    : fee.payment_mode === "both"
                                      ? getDetailLabel("paymentBoth", language)
                                      : "";
                                return [categoryName || fee.category_name_en, amount, exemptionNote, feeNote, paymentMode, paymentInstructions]
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
                                ageRelaxations,
                                educationRequirements,
                                subjectRequirements,
                                experienceRequirements,
                                reservationRules,
                                postImportantDates,
                                applicationLinks,
                                selectionStages,
                                workLocations: (Array.isArray(entry.work_locations) ? entry.work_locations : []).map((location) => { const name = getLocalizedText(language, location.name_en, location.name_mr, location.name_hi); const parts = [name, location.office, location.city, location.district, location.state, location.country, location.vacancies != null ? `${location.vacancies} ${getDetailLabel("vacancies", language)}` : "", getLocalizedText(language, location.note_en, location.note_mr, location.note_hi)].filter(Boolean); return parts.join(" · "); }).filter(Boolean),
                                compensation: [entry.salary_min != null || entry.salary_max != null ? `${entry.salary_currency || "INR"} ${entry.salary_min ?? "—"} – ${entry.salary_max ?? "—"} / ${entry.salary_period || "monthly"}` : "", entry.pay_scale ? `Pay scale: ${entry.pay_scale}` : "", entry.grade_pay ? `Grade pay: ${entry.grade_pay}` : ""].filter(Boolean).join(" · "),
                                 employmentTerms: [entry.allowances, entry.benefits, entry.employment_conditions, entry.probation_period ? `Probation: ${entry.probation_period}` : "", entry.contract_duration ? `Contract: ${entry.contract_duration}` : "", entry.working_hours ? `Working hours: ${entry.working_hours}` : "", entry.service_bond, entry.retirement_benefits].filter(Boolean).join(" · "),
                                requiredDocuments: (Array.isArray(entry.required_documents) ? entry.required_documents : []).map((document) => ({ title: getLocalizedText(language, document.title_en, document.title_mr, document.title_hi), note: getLocalizedText(language, document.note_en, document.note_mr, document.note_hi), mandatory: document.mandatory !== false })).filter((document) => document.title),
                                physicalStandards: getLocalizedText(language, entry.physical_standards_en, entry.physical_standards_mr, entry.physical_standards_hi),
                                examMode: entry.exam_mode || "",
                                examMedium: getLocalizedText(language, entry.exam_medium_en, entry.exam_medium_mr, entry.exam_medium_hi),
                                examPattern: getLocalizedText(language, entry.exam_pattern_en, entry.exam_pattern_mr, entry.exam_pattern_hi),
                                syllabus: getLocalizedText(language, entry.syllabus_en, entry.syllabus_mr, entry.syllabus_hi),
                                additionalRecruitmentDetails: [{ label: language === "mr" ? "निवड निकष व गुणवत्ता गणना" : language === "hi" ? "चयन मानदंड और मेरिट गणना" : "Selection criteria and merit calculation", value: getLocalizedText(language, entry.selection_criteria_en, entry.selection_criteria_mr, entry.selection_criteria_hi) },{ label: language === "mr" ? "कौशल्य / टंकलेखन चाचणी" : language === "hi" ? "कौशल / टाइपिंग परीक्षा" : "Skill/typing test details", value: getLocalizedText(language, entry.skill_test_details_en, entry.skill_test_details_mr, entry.skill_test_details_hi) },{ label: language === "mr" ? "मुलाखतीचा तपशील" : language === "hi" ? "साक्षात्कार विवरण" : "Interview details", value: getLocalizedText(language, entry.interview_details_en, entry.interview_details_mr, entry.interview_details_hi) },{ label: language === "mr" ? "वैद्यकीय पात्रता निकष" : language === "hi" ? "चिकित्सा मानक" : "Medical fitness standards", value: getLocalizedText(language, entry.medical_standards_en, entry.medical_standards_mr, entry.medical_standards_hi) },{ label: language === "mr" ? "प्रशिक्षण व परिचय कार्यक्रम" : language === "hi" ? "प्रशिक्षण और परिचय" : "Training and induction details", value: getLocalizedText(language, entry.training_details_en, entry.training_details_mr, entry.training_details_hi) },{ label: language === "mr" ? "नियुक्ती पसंती व वाटप" : language === "hi" ? "तैनाती प्राथमिकता और आवंटन" : "Posting preferences and allocation", value: getLocalizedText(language, entry.posting_preferences_en, entry.posting_preferences_mr, entry.posting_preferences_hi) },{ label: language === "mr" ? "कागदपत्र पडताळणी प्रक्रिया" : language === "hi" ? "दस्तावेज़ सत्यापन प्रक्रिया" : "Document verification process", value: getLocalizedText(language, entry.document_verification_en, entry.document_verification_mr, entry.document_verification_hi) },{ label: language === "mr" ? "अर्ज सादर करण्याच्या सूचना" : language === "hi" ? "आवेदन जमा करने के निर्देश" : "Application submission guidelines", value: getLocalizedText(language, entry.application_guidelines_en, entry.application_guidelines_mr, entry.application_guidelines_hi) },{ label: language === "mr" ? "पदनिहाय आरक्षण धोरण" : language === "hi" ? "पद-विशिष्ट आरक्षण नीति" : "Post-specific reservation policy notes", value: getLocalizedText(language, entry.reservation_policy_en, entry.reservation_policy_mr, entry.reservation_policy_hi) },{ label: language === "mr" ? "पदासंबंधी अतिरिक्त सूचना" : language === "hi" ? "पद-विशिष्ट अतिरिक्त टिप्पणियाँ" : "Additional post-specific notes", value: getLocalizedText(language, entry.additional_post_notes_en, entry.additional_post_notes_mr, entry.additional_post_notes_hi) }].filter((item) => Boolean(item.value)),
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
                            const showAgeRelaxation = rows.some((row) => row.ageRelaxations.length > 0);
                            const showEducationRequirements = rows.some((row) => row.educationRequirements.length > 0);
                            const showSubjectRequirements = rows.some((row) => row.subjectRequirements.length > 0);
                            const showExperienceRequirements = rows.some((row) => row.experienceRequirements.length > 0);
                            const hasCommonFee = Boolean(
                              jobDetails.application_fee != null &&
                              String(jobDetails.application_fee).trim(),
                            );
                            const showPostFees = rows.some(
                              (row) => row.fees.length > 0,
                            );
                            const showReservations = rows.some((row) => row.reservationRules.length > 0);
                            const showPostImportantDates = rows.some((row) => row.postImportantDates.length > 0);
                            const showApplicationLinks = rows.some((row) => row.applicationLinks.length > 0);
                            const showSelectionStages = rows.some((row) => row.selectionStages.length > 0);
                            const showPostCompensation = rows.some((row) => row.compensation);
                            const showPostEmploymentTerms = rows.some((row) => row.employmentTerms);
                            const showPostRequiredDocuments = rows.some((row) => row.requiredDocuments.length > 0);
                            const showPhysicalStandards = rows.some((row) => row.physicalStandards);
                            const showExamMode = rows.some((row) => row.examMode);
                            const showExamMedium = rows.some((row) => row.examMedium);
                            const showExamPattern = rows.some((row) => row.examPattern);
                            const showSyllabus = rows.some((row) => row.syllabus);
                            const showAdditionalRecruitmentDetails = rows.some((row) => row.additionalRecruitmentDetails.length > 0);
                            const showWorkLocations = rows.some((row) => row.workLocations.length > 0);
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
                                      {showAgeRelaxation ? <th>{getDetailLabel("ageRelaxation", language)}</th> : null}
                                      {showEducationRequirements ? <th>{getDetailLabel("educationRequirements", language)}</th> : null}
                                      {showSubjectRequirements ? <th>{getDetailLabel("subjectRequirements", language)}</th> : null}
                                      {showExperienceRequirements ? <th>{getDetailLabel("experienceRequirements", language)}</th> : null}
                                      {showReservations ? <th>{getDetailLabel("reservation", language)}</th> : null}
                                      {showPostImportantDates ? <th>{getDetailLabel("importantDates", language)}</th> : null}
                                      {showApplicationLinks ? <th>{getDetailLabel("applicationLinks", language)}</th> : null}
                                      {showSelectionStages ? <th>{getDetailLabel("selectionProcess", language)}</th> : null}
                                      {showPostCompensation ? <th>{language === "mr" ? "वेतन / वेतनश्रेणी" : language === "hi" ? "वेतन / वेतनमान" : "Salary / Pay scale"}</th> : null}
                                      {showWorkLocations ? <th>{language === "mr" ? "नियुक्तीचे ठिकाण" : language === "hi" ? "कार्यस्थल" : "Work location"}</th> : null}
                                      {showPostEmploymentTerms ? <th>{language === "mr" ? "सेवेच्या अटी व लाभ" : language === "hi" ? "सेवा शर्तें और लाभ" : "Employment terms & benefits"}</th> : null}
                                      {showPostRequiredDocuments ? <th>{language === "mr" ? "आवश्यक कागदपत्रे" : language === "hi" ? "आवश्यक दस्तावेज़" : "Required documents"}</th> : null}
                                      {showPhysicalStandards ? <th>{language === "mr" ? "शारीरिक पात्रता" : language === "hi" ? "शारीरिक मानदंड" : "Physical standards"}</th> : null}
                                      {showExamMode ? <th>{language === "mr" ? "परीक्षेचे स्वरूप" : language === "hi" ? "परीक्षा का माध्यम" : "Exam mode"}</th> : null}
                                      {showExamMedium ? <th>{language === "mr" ? "परीक्षेचे माध्यम" : language === "hi" ? "परीक्षा की भाषा" : "Exam medium"}</th> : null}
                                      {showExamPattern ? <th>{language === "mr" ? "परीक्षा पद्धती" : language === "hi" ? "परीक्षा पैटर्न" : "Exam pattern"}</th> : null}
                                      {showSyllabus ? <th>{language === "mr" ? "अभ्यासक्रम" : language === "hi" ? "पाठ्यक्रम" : "Syllabus"}</th> : null}
                                      {showAdditionalRecruitmentDetails ? <th>{language === "mr" ? "अतिरिक्त भरती तपशील" : language === "hi" ? "अतिरिक्त भर्ती विवरण" : "Additional recruitment details"}</th> : null}
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
                                        {showAgeRelaxation ? <td>{row.ageRelaxations.length ? row.ageRelaxations.join("; ") : "—"}</td> : null}
                                        {showEducationRequirements ? <td>{row.educationRequirements.length ? row.educationRequirements.join("; ") : "—"}</td> : null}
                                        {showSubjectRequirements ? <td>{row.subjectRequirements.length ? row.subjectRequirements.join("; ") : "—"}</td> : null}
                                        {showExperienceRequirements ? <td>{row.experienceRequirements.length ? row.experienceRequirements.join("; ") : "—"}</td> : null}
                                        {showReservations ? <td>{row.reservationRules.length ? row.reservationRules.join("; ") : "—"}</td> : null}
                                        {showPostImportantDates ? <td>{row.postImportantDates.length ? row.postImportantDates.join("; ") : "—"}</td> : null}
                                        {showApplicationLinks ? (
                                          <td>
                                            {row.applicationLinks.length ? (
                                              <div className="portal-post-application-links">
                                                {row.applicationLinks.map((link, linkIndex) => (
                                                  <div key={link.url || linkIndex}>
                                                    <a href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a>
                                                    {link.instructions ? <small>{link.instructions}</small> : null}
                                                  </div>
                                                ))}
                                              </div>
                                            ) : "—"}
                                          </td>
                                        ) : null}
                                        {showSelectionStages ? <td>{row.selectionStages.length ? <ol className="portal-post-selection-stages">{row.selectionStages.map((stage, stageIndex) => <li key={`${stageIndex}-${stage}`}>{stage}</li>)}</ol> : "—"}</td> : null}
                                        {showPostCompensation ? <td>{row.compensation || "—"}</td> : null}
                                        {showWorkLocations ? <td>{row.workLocations.length ? row.workLocations.join("; ") : "—"}</td> : null}
                                        {showPostEmploymentTerms ? <td>{row.employmentTerms || "—"}</td> : null}
                                        {showPostRequiredDocuments ? <td>{row.requiredDocuments.length ? <ul>{row.requiredDocuments.map((document, documentIndex) => <li key={documentIndex}>{document.title} — {document.mandatory ? (language === "mr" ? "अनिवार्य" : language === "hi" ? "अनिवार्य" : "Mandatory") : (language === "mr" ? "ऐच्छिक" : language === "hi" ? "वैकल्पिक" : "Optional")}{document.note ? ` · ${document.note}` : ""}</li>)}</ul> : "—"}</td> : null}
                                        {showPhysicalStandards ? <td>{row.physicalStandards || "—"}</td> : null}
                                        {showExamMode ? <td>{row.examMode === "online" ? (language === "mr" ? "ऑनलाइन" : language === "hi" ? "ऑनलाइन" : "Online") : row.examMode === "offline" ? (language === "mr" ? "ऑफलाइन" : language === "hi" ? "ऑफलाइन" : "Offline") : row.examMode === "computer_based" ? (language === "mr" ? "संगणक आधारित परीक्षा" : language === "hi" ? "कंप्यूटर आधारित परीक्षा" : "Computer-based test") : row.examMode === "omr" ? (language === "mr" ? "ओएमआर आधारित" : language === "hi" ? "ओएमआर आधारित" : "OMR-based") : row.examMode === "descriptive" ? (language === "mr" ? "वर्णनात्मक" : language === "hi" ? "वर्णनात्मक" : "Descriptive") : row.examMode === "mixed" ? (language === "mr" ? "मिश्र" : language === "hi" ? "मिश्रित" : "Mixed") : (language === "mr" ? "अधिसूचनेनुसार" : language === "hi" ? "अधिसूचना अनुसार" : "As notified")}</td> : null}
                                        {showExamMedium ? <td>{row.examMedium || "—"}</td> : null}
                                        {showExamPattern ? <td>{row.examPattern || "—"}</td> : null}
                                        {showSyllabus ? <td>{row.syllabus || "—"}</td> : null}
                                        {showAdditionalRecruitmentDetails ? <td>{row.additionalRecruitmentDetails.length ? <ul>{row.additionalRecruitmentDetails.map((item, itemIndex) => <li key={itemIndex}><strong>{item.label}:</strong> {item.value}</li>)}</ul> : "—"}</td> : null}
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
                                      {showAgeRelaxation ? <td></td> : null}
                                      {showEducationRequirements ? <td></td> : null}
                                      {showSubjectRequirements ? <td></td> : null}
                                      {showExperienceRequirements ? <td></td> : null}
                                      {showReservations ? <td></td> : null}
                                      {showPostImportantDates ? <td></td> : null}
                                      {showApplicationLinks ? <td></td> : null}
                                      {showSelectionStages ? <td></td> : null}
                                      {showWorkLocations ? <td></td> : null}
                                      {showPostEmploymentTerms ? <td></td> : null}
                                      {showPostRequiredDocuments ? <td></td> : null}
                                      {showPhysicalStandards ? <td></td> : null}
                                      {showExamMode ? <td></td> : null}
                                      {showExamMedium ? <td></td> : null}
                                      {showExamPattern ? <td></td> : null}
                                      {showSyllabus ? <td></td> : null}
                                      {showAdditionalRecruitmentDetails ? <td></td> : null}
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


                    <div className="portal-job-extra-details">
                      <div className="portal-job-status-row">
                        <span className={jobDetails?.applications_open ? "is-open" : "is-closed"}>
                          {getDetailLabel(jobDetails?.applications_open ? "applicationOpen" : "applicationClosed", language)}
                        </span>
                        {jobDetails?.recruitment_type ? <span>{getDetailLabel("recruitmentType", language)}: {detailLabelFallback(jobDetails.recruitment_type)}</span> : null}
                      </div>
                      {(jobDetails?.salary_min != null || jobDetails?.salary_max != null || jobDetails?.pay_scale || jobDetails?.grade_pay) ? (
                        <section className="portal-job-extra-section portal-job-compensation">
                          <h2>{getDetailLabel("compensation", language)}</h2>
                          {jobDetails?.salary_min != null || jobDetails?.salary_max != null ? (
                            <p>{getDetailLabel("salaryRange", language)}: {jobDetails?.salary_min != null ? Number(jobDetails.salary_min).toLocaleString() : "—"} – {jobDetails?.salary_max != null ? Number(jobDetails.salary_max).toLocaleString() : "—"} {jobDetails?.salary_currency || "INR"}{jobDetails?.salary_period ? " / " + jobDetails.salary_period : ""}</p>
                          ) : null}
                        </section>
                      ) : null}
                      {[
                        [getDetailLabel("departmentName", language), jobDetails?.department],
                        [getDetailLabel("designation", language), jobDetails?.designation],
                        [getDetailLabel("postDetails", language), jobDetails?.post_details],
                        [getDetailLabel("selectionProcess", language), jobDetails?.selection_process],
                        [getDetailLabel("examPattern", language), jobDetails?.exam_pattern],
                        [getDetailLabel("syllabus", language), jobDetails?.syllabus],
                        [getDetailLabel("physicalTest", language), jobDetails?.physical_test_details],
                        [getDetailLabel("interviewDetails", language), jobDetails?.interview_details],
                        [getDetailLabel("payScale", language), jobDetails?.pay_scale],
                        [getDetailLabel("gradePay", language), jobDetails?.grade_pay],
                        [getDetailLabel("salaryPeriod", language), jobDetails?.salary_period],
                        [getDetailLabel("allowances", language), jobDetails?.allowances],
                        [getDetailLabel("benefits", language), jobDetails?.benefits],
                        [getDetailLabel("employmentConditions", language), jobDetails?.employment_conditions],
                        [getDetailLabel("probationPeriod", language), jobDetails?.probation_period],
                        [getDetailLabel("contractDuration", language), jobDetails?.contract_duration],
                        [getDetailLabel("workingHours", language), jobDetails?.working_hours],
                        [getDetailLabel("serviceBond", language), jobDetails?.service_bond],
                        [getDetailLabel("retirementBenefits", language), jobDetails?.retirement_benefits],
                      ].filter(([, value]) => Boolean(value && String(value).trim())).map(([heading, value]) => (
                        <section className="portal-job-extra-section" key={heading}>
                          <h2>{heading}</h2><p>{value}</p>
                        </section>
                      ))}
                      {(() => {
                        const instructions = getLocalizedText(language, jobDetails?.application_instructions_en, jobDetails?.application_instructions_mr, jobDetails?.application_instructions_hi);
                        const documents = Array.isArray(jobDetails?.required_documents) ? jobDetails.required_documents : [];
                        if (!instructions && documents.length === 0) return null;
                        return (
                          <section className="portal-job-extra-section portal-job-application-checklist">
                            {instructions ? (
                              <div className="portal-job-application-instructions">
                                <h2>{getDetailLabel("applicationInstructions", language)}</h2>
                                <p>{instructions}</p>
                              </div>
                            ) : null}
                            {documents.length ? (
                              <div className="portal-job-required-documents">
                                <h2>{getDetailLabel("requiredDocuments", language)}</h2>
                                <ul>
                                  {documents.map((document, index) => {
                                    const title = getLocalizedText(language, document.title_en, document.title_mr, document.title_hi);
                                    const note = getLocalizedText(language, document.note_en, document.note_mr, document.note_hi);
                                    if (!title) return null;
                                    return (
                                      <li key={index}>
                                        <span>{title}</span>
                                        <small>{document.mandatory === false ? getDetailLabel("optionalDocument", language) : getDetailLabel("mandatoryDocument", language)}</small>
                                        {note ? <p>{note}</p> : null}
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            ) : null}
                          </section>
                        );
                      })()}
                      <div className="portal-job-official-actions">
                        {jobDetails?.apply_url ? <a className="portal-job-action-primary" href={jobDetails.apply_url} target="_blank" rel="noopener noreferrer">{getDetailLabel("applyNow", language)}</a> : null}
                        {jobDetails?.official_notification_url ? <a href={jobDetails.official_notification_url} target="_blank" rel="noopener noreferrer">{getDetailLabel("officialNotification", language)}</a> : null}
                        {jobDetails?.official_website ? <a href={jobDetails.official_website} target="_blank" rel="noopener noreferrer">{getDetailLabel("visitWebsite", language)}</a> : null}
                      </div>
                    </div>
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
                </article>
                {!previewItem ? (
                  <>
                    <PostCommentsSection postId={post.postId} language={language} />
                    <PostFAQSection faqs={post.faqs} language={language} />
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
