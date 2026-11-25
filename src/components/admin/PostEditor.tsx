"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Checkbox, Input, Select, Textarea } from "shivanya-ui";
import { API_URL, type Category } from "../portal/category/CategoryGrid";
import { adminFetch, formatCompactNumber, slugify } from "../../app/admin/admin-utils";
import "./../../styles/legacy/components/admin/PostEditor.css";

type OrganizationType = {
  value: string;
  label: string;
};
type ContentKind = {
  slug: string;
  label: string;
  api: string;
  detailKey: string;
};
type LinkInput = {
  name_en: string;
  name_mr: string;
  name_hi: string;
  group_key: string;
  action_text_en: string;
  action_text_mr: string;
  action_text_hi: string;
  url: string;
  sort_order: number;
  is_active: boolean;
};

type FAQInput = { question_en: string; question_mr: string; question_hi: string; answer_en: string; answer_mr: string; answer_hi: string; sort_order: number; is_active: boolean; };

type DateInput = {
  date_type: string;
  date_format: string;
  label_en: string;
  label_mr: string;
  label_hi: string;
  date: string;
  time: string;
  start_date: string;
  end_date: string;
  month: string;
  year: string;
  month_years: { month: string; year: string }[];
  old_date: string;
  new_date: string;
  old_time: string;
  new_time: string;
  description_en: string;
  description_mr: string;
  description_hi: string;
  sort_order: number;
};

type JobPostFeeInput = {
  category_name_en: string;
  category_name_mr: string;
  category_name_hi: string;
  fee_amount: string;
  fee_note_en: string;
  fee_note_mr: string;
  fee_note_hi: string;
  sort_order: number;
};

type JobPostEducationInput = {
  qualification_en: string;
  qualification_mr: string;
  qualification_hi: string;
  sort_order: number;
};

type JobPostInput = {
  post_number: string;
  post_name_en: string;
  post_name_mr: string;
  post_name_hi: string;
  department_en: string;
  department_mr: string;
  department_hi: string;
  vacancies: number | null;
  educational_qualification_en: string;
  educational_qualification_mr: string;
  educational_qualification_hi: string;
  age_criteria_type: string;
  age_min: number | null;
  age_max: number | null;
  age_as_on_date: string;
  eligible_dob_from: string;
  eligible_dob_to: string;
  age_limit_note_en: string;
  age_limit_note_mr: string;
  age_limit_note_hi: string;
  sort_order: number;
  fees: JobPostFeeInput[];
  educations: JobPostEducationInput[];
};

const createEmptyJobPostEducation = (sort_order: number): JobPostEducationInput => ({
  qualification_en: "",
  qualification_mr: "",
  qualification_hi: "",
  sort_order,
});

const createEmptyJobPostFee = (): JobPostFeeInput => ({
  category_name_en: "",
  category_name_mr: "",
  category_name_hi: "",
  fee_amount: "",
  fee_note_en: "",
  fee_note_mr: "",
  fee_note_hi: "",
  sort_order: 0,
});

const createEmptyJobPost = (sort_order: number): JobPostInput => ({
  post_number: "",
  post_name_en: "",
  post_name_mr: "",
  post_name_hi: "",
  department_en: "",
  department_mr: "",
  department_hi: "",
  vacancies: null,
  educational_qualification_en: "",
  educational_qualification_mr: "",
  educational_qualification_hi: "",
  age_criteria_type: "",
  age_min: null,
  age_max: null,
  age_as_on_date: "",
  eligible_dob_from: "",
  eligible_dob_to: "",
  age_limit_note_en: "",
  age_limit_note_mr: "",
  age_limit_note_hi: "",
  sort_order,
  fees: [],
  educations: [],
});

const DATE_TYPE_OPTIONS = [
  "application_start",
  "application_end",
  "fee_last_date",
  "correction_window",
  "application_reopening",
  "preliminary_exam",
  "main_exam",
  "other_exam",
  "exam_date",
  "admit_card",
  "answer_key",
  "objection_window",
  "result",
  "interview",
  "physical_test",
  "document_verification",
  "other",
] as const;

const DATE_FORMAT_OPTIONS = [
  { value: "single", label: "Single date" },
  { value: "range", label: "Date range" },
  { value: "month_year", label: "Month and year" },
  { value: "revised", label: "Revised date" },
  { value: "revised_with_time", label: "Revised date with time" },
] as const;

const MONTH_OPTIONS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function normalizeApiDate(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value !== "string") return String(value);

  const date = value.trim();
  if (!date) return null;

  // HTML date inputs and Django DateField use YYYY-MM-DD.
  const isoDate = date.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoDate) return isoDate[1];

  // Also handle older values stored/displayed as DD/MM/YYYY or DD-MM-YYYY.
  const localDate = date.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (localDate) {
    const [, day, month, year] = localDate;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return date;
}

function createEmptyDate(sortOrder: number): DateInput {
  return {
    date_type: "other",
    date_format: "single",
    label_en: "",
    label_mr: "",
    label_hi: "",
    date: "",
    time: "",
    start_date: "",
    end_date: "",
    month: "",
    year: "",
    month_years: [],
    old_date: "",
    new_date: "",
    old_time: "",
    new_time: "",
    description_en: "",
    description_mr: "",
    description_hi: "",
    sort_order: sortOrder,
  };
}

function normalizeDateInput(item: Partial<DateInput>): DateInput {
  return {
    ...createEmptyDate(item.sort_order ?? 0),
    ...item,
    date_format: item.date_format || "single",
    date: item.date || "",
    time: item.time ? item.time.slice(0, 5) : "",
    start_date: item.start_date || "",
    end_date: item.end_date || "",
    month: item.month == null ? "" : String(item.month),
    year: item.year == null ? "" : String(item.year),
    month_years: (item.month_years || []).map((entry) => ({
      month: String(entry.month),
      year: String(entry.year),
    })),
    old_date: item.old_date || "",
    new_date: item.new_date || "",
    old_time: item.old_time ? item.old_time.slice(0, 5) : "",
    new_time: item.new_time ? item.new_time.slice(0, 5) : "",
  };
}
type PostVersionInfo = { id: number; version_number: number; is_published: boolean; created_at: string; published_at?: string | null; payload?: PostRecord; };

type PostRecord = {
  id: number;
  status?: string;
  slug: string;
  organization_type?: string;
  title_en: string;
  title_mr?: string;
  title_hi?: string;
  summary_en?: string;
  summary_mr?: string;
  summary_hi?: string;
  body_en?: string;
  body_mr?: string;
  body_hi?: string;
  location?: string;
  state?: string;
  country?: string;
  featured_image_url?: string;
  default_language?: string;
  meta_title_en?: string;
  meta_description_en?: string;
  meta_keywords?: string[];
  comments_enabled?: boolean;
  reactions_enabled?: boolean;
  is_featured?: boolean;
  is_active?: boolean;
  category?: Category;
  important_links?: LinkInput[];
  faqs?: FAQInput[];
  important_dates?: DateInput[];
  job_details?: Record<string, unknown> | null;
  scheme_details?: Record<string, unknown> | null;
  examination_details?: Record<string, unknown> | null;
  admit_card_details?: Record<string, unknown> | null;
  result_details?: Record<string, unknown> | null;
  article_guide_details?: Record<string, unknown> | null;
  video_details?: Record<string, unknown> | null;
  tool_details?: Record<string, unknown> | null;
};

const KINDS: ContentKind[] = [
  { slug: "jobs", label: "Jobs", api: "jobs", detailKey: "job_details" },
  {
    slug: "schemes",
    label: "Schemes",
    api: "schemes",
    detailKey: "scheme_details",
  },
  {
    slug: "examination",
    label: "Examination",
    api: "examination",
    detailKey: "examination_details",
  },
  {
    slug: "admit-cards",
    label: "Admit Cards",
    api: "admit-card",
    detailKey: "admit_card_details",
  },
  {
    slug: "results",
    label: "Results",
    api: "results",
    detailKey: "result_details",
  },
  {
    slug: "articles-guides",
    label: "Articles & Guides",
    api: "articles",
    detailKey: "article_guide_details",
  },
  {
    slug: "videos",
    label: "Videos",
    api: "videos",
    detailKey: "video_details",
  },
  { slug: "tools", label: "Tools", api: "tools", detailKey: "tool_details" },
];

const DETAIL_OPTIONS: Record<string, string[]> = {
  age_criteria_type: [
    "age_range",
    "minimum_only",
    "maximum_only",
    "dob_range",
    "text_only",
  ],
  recruitment_type: [
    "regular",
    "contract",
    "apprenticeship",
    "temporary",
    "deputation",
    "other",
  ],
  application_mode: [
    "online",
    "offline",
    "both",
    "not_applicable",
    "not_required",
  ],
  scheme_type: [
    "central",
    "state",
    "district",
    "education",
    "farmer",
    "employment",
    "health",
    "financial",
    "other",
  ],
  exam_type: [
    "recruitment",
    "entrance",
    "departmental",
    "competitive",
    "other",
  ],
  exam_mode: ["online", "offline", "both", "other"],
  result_type: [
    "written",
    "final",
    "merit_list",
    "cut_off",
    "answer_key",
    "scorecard",
    "other",
  ],
  article_type: [
    "article",
    "how_to",
    "career",
    "preparation",
    "information",
    "other",
  ],
  provider: ["youtube", "vimeo", "self_hosted", "other"],
  tool_type: ["calculator", "checker", "converter", "generator", "other"],
};

const EMPTY = {
  title_en: "",
  title_mr: "",
  title_hi: "",
  slug: "",
  summary_en: "",
  summary_mr: "",
  summary_hi: "",
  body_en: "",
  body_mr: "",
  body_hi: "",
  location: "",
  state: "",
  country: "India",
  featured_image_url: "",
  default_language: "en",
  meta_title_en: "",
  meta_description_en: "",
  meta_keywords: "",
  comments_enabled: true,
  reactions_enabled: true,
  is_featured: false,
  is_active: true,
};

type FormState = typeof EMPTY;
type ContentLanguage = "en" | "mr" | "hi";
type PostInfoFieldGroup = "title" | "summary" | "body";

function normalizeAdminCategorySlug(slug: string) {
  const normalized = slug.trim().toLowerCase().replace(/[_\s]+/g, "-");
  if (normalized === "examination" || normalized === "exam") return "exams";
  if (normalized === "articles-guides" || normalized === "article-guide") return "guides";
  return normalized;
}

function detailKeyFor(api: string) {
  return KINDS.find((item) => item.api === api)?.detailKey ?? "job_details";
}

function detailTemplate(api: string): Record<string, unknown> {
  if (api === "jobs")
    return {
      advertisement_no: "",
      recruitment_type: "regular",
      total_vacancies: null,
      department: "",
      designation: "",
      post_details: "",
      education_mode: "per_post",
      age_mode: "per_post",
      fee_mode: "per_post",
      educational_qualification: "",
      educational_qualification_en: "",
      educational_qualification_mr: "",
      educational_qualification_hi: "",
      age_criteria_type: "age_range",
      age_min: null,
      age_max: null,
      age_as_on_date: "",
      eligible_dob_from: "",
      eligible_dob_to: "",
      age_limit_note_en: "",
      age_limit_note_mr: "",
      age_limit_note_hi: "",
      application_fee: "",
      application_fee_note_en: "",
      application_fee_note_mr: "",
      application_fee_note_hi: "",
      application_mode: "online",
      apply_url: "",
      apply_email: "",
      applications_open: true,
      selection_process: "",
      exam_pattern: "",
      syllabus: "",
      physical_test_details: "",
      interview_details: "",
      official_notification_url: "",
      official_website: "",
      posts: [],
    };
  if (api === "schemes")
    return {
      scheme_type: "other",
      beneficiaries: "",
      eligibility: "",
      benefits: "",
      required_documents: "",
      application_mode: "online",
      application_url: "",
      official_website: "",
      helpline_number: "",
    };
  if (api === "examination")
    return {
      exam_type: "recruitment",
      exam_mode: "other",
      exam_name: "",
      conducting_authority: "",
      exam_duration_minutes: null,
      total_marks: null,
      passing_marks: "",
      negative_marking: "",
      exam_pattern: "",
      syllabus: "",
      instructions: "",
      official_website: "",
    };
  if (api === "admit-card")
    return {
      issuing_authority: "",
      exam_name: "",
      release_date: null,
      examination_date: null,
      download_url: "",
      login_url: "",
      official_website: "",
      required_credentials: "",
      download_instructions: "",
      important_instructions: "",
    };
  if (api === "results")
    return {
      result_type: "other",
      examination_name: "",
      result_date: null,
      result_url: "",
      merit_list_url: "",
      cut_off_url: "",
      scorecard_url: "",
      official_website: "",
      instructions: "",
    };
  if (api === "articles")
    return {
      article_type: "article",
      reading_time_minutes: null,
      source_name: "",
      source_url: "",
    };
  if (api === "videos")
    return {
      provider: "youtube",
      video_url: "",
      embed_url: "",
      thumbnail_url: "",
      duration_seconds: null,
      available_languages: ["en"],
    };
  return {
    tool_key: "",
    tool_type: "other",
    instructions_en: "",
    instructions_mr: "",
    instructions_hi: "",
    configuration: {},
    is_interactive: true,
  };
}

export default function PostEditor({
  initialKind = "jobs",
  editSlug,
}: {
  initialKind?: string;
  editSlug?: string;
}) {
  const router = useRouter();
  const editing = Boolean(editSlug);
  const [categories, setCategories] = useState<Category[]>([]);
  const [kind, setKind] = useState(
    KINDS.find((item) => item.api === initialKind) ?? KINDS[0],
  );
  const [form, setForm] = useState<FormState>(EMPTY);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [details, setDetails] = useState<Record<string, unknown>>(
    detailTemplate(initialKind),
  );
  const [importantLinks, setImportantLinks] = useState<LinkInput[]>([]);
  const [faqs, setFaqs] = useState<FAQInput[]>([]);
  const [expandedFaqQuestionLanguages, setExpandedFaqQuestionLanguages] = useState<number[]>([]);
  const [expandedFaqAnswerLanguages, setExpandedFaqAnswerLanguages] = useState<number[]>([]);
  const [importantDates, setImportantDates] = useState<DateInput[]>([]);

  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [autosaveState, setAutosaveState] = useState<"idle" | "unsaved" | "saving" | "saved" | "error">("idle");
  const [autosaveBusy, setAutosaveBusy] = useState(false);
  const [autosaveRevision, setAutosaveRevision] = useState(0);
  const [postStatus, setPostStatus] = useState("draft");
  const [postCreated, setPostCreated] = useState(false);
  const [postVersions, setPostVersions] = useState<PostVersionInfo[]>([]);
  const postIdRef = useRef<number | null>(null);
  const currentSlugRef = useRef(editSlug || "");
  const versionHistoryRef = useRef<HTMLDetailsElement | null>(null);
  const lastSavedSnapshotRef = useRef("");
  const actionSnapshotRef = useRef<string | null>(null);
  const [actionBaselineReady, setActionBaselineReady] = useState(false);
  const autosaveInitializedRef = useRef(false);
  const saveInFlightRef = useRef(false);
  const pendingSaveRef = useRef(false);
  const [notice, setNotice] = useState("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    const closeVersionHistoryOnOutsideClick = (event: PointerEvent) => {
      const dropdown = versionHistoryRef.current;
      if (dropdown?.open && event.target instanceof Node && !dropdown.contains(event.target)) {
        dropdown.open = false;
      }
    };

    document.addEventListener("pointerdown", closeVersionHistoryOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeVersionHistoryOnOutsideClick);
  }, []);

  const [organizationType, setOrganizationType] = useState("");
  const [activeLanguage, setActiveLanguage] = useState<ContentLanguage>("en");
  const [postInfoLanguages, setPostInfoLanguages] = useState<Record<PostInfoFieldGroup, ContentLanguage[]>>({ title: ["en"], summary: ["en"], body: ["en"] });
  const [commonEducationLanguages, setCommonEducationLanguages] = useState<ContentLanguage[]>(["en"]);
  const [expandedPostLanguages, setExpandedPostLanguages] = useState<number[]>([]);
  const [expandedEducationLanguages, setExpandedEducationLanguages] = useState<string[]>([]);
  const [expandedAgeLanguages, setExpandedAgeLanguages] = useState<number[]>([]);
  const [expandedApplicationFeeLanguages, setExpandedApplicationFeeLanguages] = useState(false);
  const [expandedFeeCategoryLanguages, setExpandedFeeCategoryLanguages] = useState<string[]>([]);
  const [expandedFeeNoteLanguages, setExpandedFeeNoteLanguages] = useState<string[]>([]);
  const [expandedImportantDateLanguages, setExpandedImportantDateLanguages] = useState<number[]>([]);
  const [expandedImportantDateDescriptionLanguages, setExpandedImportantDateDescriptionLanguages] = useState<number[]>([]);
  const [expandedImportantLinkTitleLanguages, setExpandedImportantLinkTitleLanguages] = useState<string[]>([]);
  const [expandedImportantLinkActionLanguages, setExpandedImportantLinkActionLanguages] = useState<string[]>([]);

  const activeCategory = useMemo(
    () => categories.find((item) => normalizeAdminCategorySlug(item.slug) === normalizeAdminCategorySlug(kind.slug)),
    [categories, kind],
  );

  const [organizationTypes, setOrganizationTypes] = useState<
    OrganizationType[]
  >([]);

  useEffect(() => {
    const controller = new AbortController();

    const loadOrganizationTypes = async () => {
      try {
        const response = await adminFetch(`${API_URL}/admin/organization-types/`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load organization types");
        }

        const data = await response.json();
        setOrganizationTypes(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Organization types error:", error);
        }
      }
    };

    loadOrganizationTypes();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(`${API_URL}/categories/`, {
          signal: controller.signal,
        });
        if (!response.ok)
          throw new Error(`Category request failed (${response.status}).`);
        const payload = await response.json();
        const list: Category[] = Array.isArray(payload)
          ? payload
          : (payload.results ?? []);
        setCategories(
          list.filter((item) => item.is_active ?? item.active ?? false),
        );
      } catch (error) {
        if (!controller.signal.aborted)
          setNotice(
            error instanceof Error
              ? error.message
              : "Unable to load categories.",
          );
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!editSlug) {
      const template = detailTemplate(kind.api);
      setDetails(template);

      return;
    }
    const controller = new AbortController();
    async function loadPost() {
      try {
        const response = await adminFetch(
          `${API_URL}/admin/content/${kind.api}/${editSlug}/`,
          { signal: controller.signal },
        );
        const payload = await response.json();
        if (!response.ok)
          throw new Error(
            payload.detail || `Unable to load post (${response.status}).`,
          );
        let record = payload as PostRecord;
        postIdRef.current = record.id;
        currentSlugRef.current = record.slug;
        const versionsResponse = await adminFetch(`${API_URL}/admin/content/${record.id}/versions/`, { signal: controller.signal });
        if (versionsResponse.ok) {
          const versions = await versionsResponse.json() as PostVersionInfo[];
          setPostVersions(versions);
          const publishedVersionNumber = Math.max(0, ...versions.filter((version) => version.is_published).map((version) => version.version_number));
          const workingVersion = versions.find((version) => !version.is_published && version.version_number > publishedVersionNumber && version.payload);
          if (record.status === "published" && workingVersion?.payload) {
            // Open the unpublished working copy in the editor, while the public post remains unchanged.
            record = { ...record, ...workingVersion.payload, id: record.id, status: "published", slug: record.slug };
          }
        }
        setPostStatus(record.status || "draft");
        setOrganizationType(record.organization_type || "");
        setSlugManuallyEdited(false);
        const defaultLanguage = (record.default_language || "en") as ContentLanguage;
        setActiveLanguage(defaultLanguage);
        setPostInfoLanguages({ title: [defaultLanguage], summary: [defaultLanguage], body: [defaultLanguage] });
        setCommonEducationLanguages([defaultLanguage]);
        setForm({
          ...EMPTY,
          title_en: record.title_en || "",
          title_mr: record.title_mr || "",
          title_hi: record.title_hi || "",
          slug: record.slug || "",
          summary_en: record.summary_en || "",
          summary_mr: record.summary_mr || "",
          summary_hi: record.summary_hi || "",
          body_en: record.body_en || "",
          body_mr: record.body_mr || "",
          body_hi: record.body_hi || "",
          location: record.location || "",
          state: record.state || "",
          country: record.country || "India",
          featured_image_url: record.featured_image_url || "",
          default_language: record.default_language || "en",
          meta_title_en: record.meta_title_en || "",
          meta_description_en: record.meta_description_en || "",
          meta_keywords: "",
          comments_enabled: record.comments_enabled !== false,
          reactions_enabled: record.reactions_enabled !== false,
          is_featured: record.is_featured ?? false,
          is_active: record.is_active ?? true,
        });
        setTags(Array.isArray(record.meta_keywords) ? record.meta_keywords.filter(Boolean) : []);
        setTagInput("");
        setImportantLinks(
          (record.important_links || []).map((item: LinkInput, index) => ({
            ...item,
            name_en: String(item.name_en ?? ""),
            name_mr: String(item.name_mr ?? ""),
            name_hi: String(item.name_hi ?? ""),
            group_key: String(item.group_key || `legacy-${index}`),
            action_text_en: String(item.action_text_en ?? "Click Here"),
            action_text_mr: String(item.action_text_mr ?? ""),
            action_text_hi: String(item.action_text_hi ?? ""),
            url: String(item.url ?? ""),
          })),
        );
        setFaqs((record.faqs || []).map((item: FAQInput) => ({ ...item, question_en: String(item.question_en ?? ""), question_mr: String(item.question_mr ?? ""), question_hi: String(item.question_hi ?? ""), answer_en: String(item.answer_en ?? ""), answer_mr: String(item.answer_mr ?? ""), answer_hi: String(item.answer_hi ?? ""), sort_order: Number(item.sort_order ?? 0), is_active: item.is_active ?? true })));
        setImportantDates((record.important_dates || []).map((item) => normalizeDateInput(item)));
        const data = record[
          detailKeyFor(kind.api) as keyof PostRecord
        ] as Record<string, unknown> | null;

        const template: Record<string, unknown> = {
          ...detailTemplate(kind.api),
          ...(data || {}),
        };

        if (kind.api === "jobs") {
          const defaultEducationKey = `educational_qualification_${defaultLanguage}`;
          const legacyEducation = String(data?.educational_qualification || "");
          if (!template[defaultEducationKey] && legacyEducation) {
            template[defaultEducationKey] = legacyEducation;
          }
          const existingPosts = Array.isArray(data?.posts)
            ? (data.posts as Record<string, unknown>[])
            : [];

          template.posts = existingPosts.map((post, index) => ({
            ...createEmptyJobPost(index),
            ...post,
            fees: Array.isArray(post.fees)
              ? (post.fees as Record<string, unknown>[]).map((fee) => ({
                  ...createEmptyJobPostFee(),
                  ...fee,
                  fee_amount:
                    fee.fee_amount === null || fee.fee_amount === undefined
                      ? ""
                      : String(fee.fee_amount),
                }))
              : [],
            educations: Array.isArray(post.educations)
              ? (post.educations as Record<string, unknown>[]).map((education, educationIndex) => ({
                  ...createEmptyJobPostEducation(educationIndex),
                  ...education,
                }))
              : (
                  post.educational_qualification_en ||
                  post.educational_qualification_mr ||
                  post.educational_qualification_hi
                )
                ? [{
                    qualification_en: String(post.educational_qualification_en || ""),
                    qualification_mr: String(post.educational_qualification_mr || ""),
                    qualification_hi: String(post.educational_qualification_hi || ""),
                    sort_order: 0,
                  }]
                : [],
          }));
        }

        // Remove fields from the previous age-relaxation structure.
        if (kind.api === "jobs") {
          delete template.age_relaxation;
          delete template.age_relaxations;
          delete template.age_limit_note;
        }

        setDetails(template);
      } catch (error) {
        if (!controller.signal.aborted)
          setNotice(
            error instanceof Error ? error.message : "Unable to load post.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadPost();
    return () => controller.abort();
  }, [editSlug, kind.api]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateTitle(value: string) {
    const titleKey = `title_${form.default_language as ContentLanguage}` as keyof FormState;
    setForm((current) => ({
      ...current,
      [titleKey]: value,
      ...(!slugManuallyEdited ? { slug: slugify(value) } : {}),
    }));
  }

  useEffect(() => {
    const slug = form.slug.trim();
    if (!slug) {
      setSlugAvailable(null);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ slug });
        if (editing && editSlug) params.set("exclude_slug", editSlug);

        const response = await adminFetch(
          `${API_URL}/admin/content/slug-availability/?${params.toString()}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Unable to check slug availability.");
        const result = await response.json();
        if (!controller.signal.aborted) {
          setSlugAvailable(Boolean(result.available));

          // Automatically use the first available suggested slug when a collision is found.
          if (
            !result.available &&
            typeof result.suggested_slug === "string" &&
            result.suggested_slug &&
            result.suggested_slug !== slug
          ) {
            setForm((current) =>
              current.slug.trim() === slug
                ? { ...current, slug: result.suggested_slug }
                : current,
            );
          }
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Slug availability check failed:", error);
          setSlugAvailable(null);
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [form.slug, editSlug, editing]);

  function addTags(value: string) {
    const nextTags = value.split(",").map((tag) => tag.trim()).filter(Boolean);
    if (!nextTags.length) return;
    setTags((current) => {
      const seen = new Set(current.map((tag) => tag.toLocaleLowerCase()));
      return [...current, ...nextTags.filter((tag) => {
        const key = tag.toLocaleLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })];
    });
  }

  function handleTagInputChange(value: string) {
    if (!value.includes(",")) { setTagInput(value); return; }
    const parts = value.split(",");
    addTags(parts.slice(0, -1).join(","));
    setTagInput(parts[parts.length - 1] || "");
  }

  function commitTagInput() { addTags(tagInput); setTagInput(""); }

  function changeKind(api: string) {
    const next = KINDS.find((item) => item.api === api);
    if (!next || editing) return;
    setKind(next);
    const template = detailTemplate(next.api);
    setDetails(template);
  }

  function togglePostInfoLanguages(group: PostInfoFieldGroup) {
    setPostInfoLanguages((current) => {
      const otherLanguages = (["en", "mr", "hi"] as const).filter(
        (language) => language !== form.default_language,
      );
      const showingAll = otherLanguages.every((language) =>
        current[group].includes(language),
      );
      return {
        ...current,
        [group]: showingAll
          ? [form.default_language]
          : [form.default_language, ...otherLanguages],
      };
    });
  }

  function toggleCommonEducationLanguages() {
    setCommonEducationLanguages((current) => {
      const otherLanguages = (["en", "mr", "hi"] as const).filter(
        (language) => language !== form.default_language,
      );
      const showingAll = otherLanguages.every((language) => current.includes(language));
      return showingAll
        ? [form.default_language as ContentLanguage]
        : [form.default_language as ContentLanguage, ...otherLanguages];
    });
  }

  const commonEducationExpanded = (["en", "mr", "hi"] as const)
    .filter((language) => language !== form.default_language)
    .every((language) => commonEducationLanguages.includes(language));

  function updateDetail(key: string, value: unknown) {
    if (key === "age_criteria_type") {
      const criteriaType = String(value);
      setDetails((current) => ({
        ...current,
        age_criteria_type: criteriaType,
        ...(criteriaType === "age_range"
          ? {
              eligible_dob_from: "",
              eligible_dob_to: "",
            }
          : criteriaType === "minimum_only"
            ? {
                age_max: null,
                eligible_dob_from: "",
                eligible_dob_to: "",
              }
            : criteriaType === "maximum_only"
              ? {
                  age_min: null,
                  eligible_dob_from: "",
                  eligible_dob_to: "",
                }
              : criteriaType === "dob_range"
                ? {
                    age_min: null,
                    age_max: null,
                    age_as_on_date: "",
                  }
                : {
                    age_min: null,
                    age_max: null,
                    age_as_on_date: "",
                    eligible_dob_from: "",
                    eligible_dob_to: "",
                  }),
      }));
      return;
    }

    setDetails((current) => ({ ...current, [key]: value }));
  }

  function updateJobPost(postIndex: number, key: string, value: unknown) {
    setDetails((current) => {
      const posts = [...((current.posts as JobPostInput[]) || [])];

      const post = { ...posts[postIndex] };

      if (key === "age_criteria_type") {
        const criteriaType = String(value);

        Object.assign(post, {
          age_criteria_type: criteriaType,
          age_min: null,
          age_max: null,
          age_as_on_date: "",
          eligible_dob_from: "",
          eligible_dob_to: "",
          age_limit_note_en: post.age_limit_note_en,
          age_limit_note_mr: post.age_limit_note_mr,
          age_limit_note_hi: post.age_limit_note_hi,
        });
      } else {
        Object.assign(post, { [key]: value });
      }

      posts[postIndex] = post;

      return { ...current, posts };
    });
  }

  function addJobPost() {
    setDetails((current) => {
      const posts = (current.posts as JobPostInput[]) || [];

      return {
        ...current,
        posts: [...posts, createEmptyJobPost(posts.length)],
      };
    });
  }

  function removeJobPost(postIndex: number) {
    setDetails((current) => {
      const posts = (current.posts as JobPostInput[]).filter(
        (_, index) => index !== postIndex,
      );

      return {
        ...current,
        posts: posts.map((post, index) => ({
          ...post,
          sort_order: index,
        })),
      };
    });
  }

  function addJobPostEducation(postIndex: number) {
    setDetails((current) => {
      const posts = [...(current.posts as JobPostInput[])];
      const educations = posts[postIndex].educations || [];
      posts[postIndex] = {
        ...posts[postIndex],
        educations: [
          ...educations,
          createEmptyJobPostEducation(educations.length),
        ],
      };
      return { ...current, posts };
    });
  }

  function updateJobPostEducation(
    postIndex: number,
    educationIndex: number,
    key: string,
    value: string,
  ) {
    setDetails((current) => {
      const posts = [...(current.posts as JobPostInput[])];
      const educations = [...(posts[postIndex].educations || [])];
      educations[educationIndex] = {
        ...educations[educationIndex],
        [key]: value,
      };
      posts[postIndex] = { ...posts[postIndex], educations };
      return { ...current, posts };
    });
  }

  function removeJobPostEducation(postIndex: number, educationIndex: number) {
    setDetails((current) => {
      const posts = [...(current.posts as JobPostInput[])];
      posts[postIndex] = {
        ...posts[postIndex],
        educations: (posts[postIndex].educations || [])
          .filter((_, index) => index !== educationIndex)
          .map((education, index) => ({ ...education, sort_order: index })),
      };
      return { ...current, posts };
    });
  }

  function addJobPostFee(postIndex: number) {
    setDetails((current) => {
      const posts = [...(current.posts as JobPostInput[])];

      posts[postIndex] = {
        ...posts[postIndex],
        fees: [
          ...posts[postIndex].fees,
          {
            ...createEmptyJobPostFee(),
            sort_order: posts[postIndex].fees.length,
          },
        ],
      };

      return { ...current, posts };
    });
  }

  function updateJobPostFee(
    postIndex: number,
    feeIndex: number,
    key: string,
    value: unknown,
  ) {
    setDetails((current) => {
      const posts = [...(current.posts as JobPostInput[])];
      const fees = [...posts[postIndex].fees];

      fees[feeIndex] = {
        ...fees[feeIndex],
        [key]: value,
      };

      posts[postIndex] = {
        ...posts[postIndex],
        fees,
      };

      return { ...current, posts };
    });
  }

  function removeJobPostFee(postIndex: number, feeIndex: number) {
    setDetails((current) => {
      const posts = [...(current.posts as JobPostInput[])];

      posts[postIndex] = {
        ...posts[postIndex],
        fees: posts[postIndex].fees
          .filter((_, index) => index !== feeIndex)
          .map((fee, index) => ({
            ...fee,
            sort_order: index,
          })),
      };

      return { ...current, posts };
    });
  }

  function detailLabel(key: string) {
    const customLabels: Record<string, string> = {
      age_limit_note_en: "Age Limit Note (English)",
      age_limit_note_mr: "Age Limit Note (Marathi)",
      age_limit_note_hi: "Age Limit Note (Hindi)",

      application_fee_note_en: "Application Fee Note (English)",
      application_fee_note_mr: "Application Fee Note (Marathi)",
      application_fee_note_hi: "Application Fee Note (Hindi)",
    };

    return (
      customLabels[key] ||
      key
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    );
  }

  function normalizeJobPost(post: JobPostInput) {
    return {
      ...post,
      vacancies: post.vacancies === null ? null : Number(post.vacancies),
      age_min: post.age_min === null ? null : Number(post.age_min),
      age_max: post.age_max === null ? null : Number(post.age_max),
      age_as_on_date: normalizeApiDate(post.age_as_on_date),
      eligible_dob_from: normalizeApiDate(post.eligible_dob_from),
      eligible_dob_to: normalizeApiDate(post.eligible_dob_to),
      fees: post.fees.map((fee) => ({
        ...fee,
        fee_amount:
          fee.fee_amount.trim() === "" ? null : Number(fee.fee_amount),
      })),
      educations: (post.educations || [])
        .filter((education) =>
          education.qualification_en.trim() ||
          education.qualification_mr.trim() ||
          education.qualification_hi.trim()
        )
        .map((education, index) => ({ ...education, sort_order: index })),
    };
  }

  function getAutomaticJobModes(posts: JobPostInput[]) {
    const ageValues = posts.map((post) => ({
      age_criteria_type: post.age_criteria_type || "",
      age_min: post.age_min ?? null,
      age_max: post.age_max ?? null,
      age_as_on_date: post.age_as_on_date || "",
      eligible_dob_from: post.eligible_dob_from || "",
      eligible_dob_to: post.eligible_dob_to || "",
      age_limit_note_en: post.age_limit_note_en.trim(),
      age_limit_note_mr: post.age_limit_note_mr.trim(),
      age_limit_note_hi: post.age_limit_note_hi.trim(),
    }));
    const hasAgeData = ageValues.some((item) =>
      item.age_criteria_type ||
      item.age_min !== null ||
      item.age_max !== null ||
      item.age_as_on_date ||
      item.eligible_dob_from ||
      item.eligible_dob_to ||
      item.age_limit_note_en ||
      item.age_limit_note_mr ||
      item.age_limit_note_hi
    );
    const sameAge = ageValues.length > 0 &&
      ageValues.every((item) => JSON.stringify(item) === JSON.stringify(ageValues[0]));

    const feeValues = posts.map((post) =>
      (post.fees || [])
        .filter((fee) =>
          fee.category_name_en.trim() ||
          fee.category_name_mr.trim() ||
          fee.category_name_hi.trim() ||
          fee.fee_amount.trim() ||
          fee.fee_note_en.trim() ||
          fee.fee_note_mr.trim() ||
          fee.fee_note_hi.trim()
        )
        .map((fee) => ({
          category_name_en: fee.category_name_en.trim(),
          category_name_mr: fee.category_name_mr.trim(),
          category_name_hi: fee.category_name_hi.trim(),
          fee_amount: fee.fee_amount.trim(),
          fee_note_en: fee.fee_note_en.trim(),
          fee_note_mr: fee.fee_note_mr.trim(),
          fee_note_hi: fee.fee_note_hi.trim(),
        }))
    );
    const hasFeeData = feeValues.some((fees) => fees.length > 0);
    const sameFees = feeValues.length > 0 &&
      feeValues.every((fees) => JSON.stringify(fees) === JSON.stringify(feeValues[0]));

    return {
      age_mode: hasAgeData && sameAge ? "common" : "per_post",
      fee_mode: hasFeeData && sameFees ? "common" : "per_post",
    };
  }

  const payload = useMemo(() => ({
        ...form,
        organization_type: organizationType,
        slug: form.slug || slugify(form.title_en),
        meta_keywords: tags,

        [kind.detailKey]:
          kind.api === "jobs"
            ? {
                ...details,
                ...getAutomaticJobModes((details.posts as JobPostInput[]) || []),
                total_vacancies: ((details.posts as JobPostInput[]) || []).reduce(
                  (total, post) => total + Number(post.vacancies || 0),
                  0,
                ),
                age_as_on_date: normalizeApiDate(details.age_as_on_date),
                eligible_dob_from: normalizeApiDate(details.eligible_dob_from),
                eligible_dob_to: normalizeApiDate(details.eligible_dob_to),
                // Do not send a newly added but still-empty recruitment row.
                // DRF requires post_number and post_name_en for each nested JobPost;
                // keeping incomplete rows in editor state lets the admin finish
                // typing without causing an invalid autosave request.
                posts: ((details.posts as JobPostInput[]) || [])
                  .filter((post) => post.post_number.trim() && post.post_name_en.trim())
                  .map(normalizeJobPost),
              }
            : details,

        important_links: importantLinks
          .filter((item) => item.name_en.trim() && item.url.trim())
          .map((item) => ({
            ...item,
            action_text_en: item.action_text_en.trim() || "Click Here",
          })),
        faqs: faqs.filter((item) => item.question_en.trim() && item.answer_en.trim()).map((item, index) => ({ ...item, sort_order: index })),
        important_dates: importantDates
          .filter((item) => item.label_en.trim())
          .map((item) => ({
            ...item,
            sort_order: item.sort_order,
            date: item.date || null,
            time: item.time || null,
            start_date: item.start_date || null,
            end_date: item.end_date || null,
            month: item.month ? Number(item.month) : null,
            year: item.year ? Number(item.year) : null,
            month_years: item.month_years
              .filter((entry) => entry.month && entry.year)
              .map((entry) => ({
                month: Number(entry.month),
                year: Number(entry.year),
              })),
            old_date: item.old_date || null,
            new_date: item.new_date || null,
            old_time: item.old_time || null,
            new_time: item.new_time || null,
          })),
      }), [form, organizationType, tags, kind.detailKey, kind.api, details, importantLinks, faqs, importantDates]);

  const currentTitle = String(form.title_en || "").trim();
  const currentSnapshot = JSON.stringify(payload);
  const hasUnsavedChanges = !loading && (editing || Boolean(currentTitle)) && currentSnapshot !== lastSavedSnapshotRef.current;
  const hasPendingActionChanges =
    !loading &&
    actionBaselineReady &&
    actionSnapshotRef.current !== null &&
    currentSnapshot !== actionSnapshotRef.current;

  // New posts use their initial empty form as the action baseline. Autosave
  // must not clear this baseline: the status buttons stay available until the
  // administrator explicitly chooses Draft, Save & Exit, or Publish.
  useEffect(() => {
    if (editing || loading || actionSnapshotRef.current !== null) return;
    actionSnapshotRef.current = currentSnapshot;
    setActionBaselineReady(true);
  }, [editing, loading, currentSnapshot]);

  async function leaveEditor() {
    setNotice("");
    setSaving(true);
    try {
      if (hasUnsavedChanges) {
        if (!editing && (!currentTitle || !form.slug.trim() || slugAvailable !== true)) {
          if (currentTitle) throw new Error("Wait until the URL slug is confirmed as available before leaving.");
        } else {
          await persistPost();
        }
      }
      router.push("/admin");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to save your changes.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!hasUnsavedChanges && !autosaveBusy) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [hasUnsavedChanges, autosaveBusy]);

  async function persistPost() {
    if (!activeCategory) throw new Error("The selected category is not active in the backend.");
    if (postIdRef.current) {
      const response = await adminFetch(`${API_URL}/admin/content/${postIdRef.current}/versions/`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.detail || "Unable to save post version.");
      if (Array.isArray(result.versions)) setPostVersions(result.versions);
      lastSavedSnapshotRef.current = JSON.stringify(payload);
      setAutosaveState("saved");
      return result as Record<string, unknown>;
    }
    const creating = !postIdRef.current && !editing;
    const slug = String(payload.slug || form.slug || slugify(form.title_en));
    const url = creating
      ? `${API_URL}/admin/content/${kind.api}/`
      : `${API_URL}/admin/content/${kind.api}/${currentSlugRef.current || editSlug}/`;
    // A comments/reactions setting change should not rewrite nested post data.
    // Use a narrow PATCH so existing comments, replies and other related records
    // remain untouched while the interaction setting is updated.
    let settingsOnly: Record<string, unknown> | null = null;
    if (editing && lastSavedSnapshotRef.current) {
      try {
        const previous = JSON.parse(lastSavedSnapshotRef.current) as Record<string, unknown>;
        const changedKeys = Object.keys(payload).filter(
          (key) => JSON.stringify((payload as Record<string, unknown>)[key]) !== JSON.stringify(previous[key]),
        );
        if (changedKeys.length === 1 && changedKeys[0] === "comments_enabled") {
          settingsOnly = { comments_enabled: payload.comments_enabled };
        } else if (changedKeys.length === 1 && changedKeys[0] === "reactions_enabled") {
          settingsOnly = { reactions_enabled: payload.reactions_enabled };
        }
      } catch {
        settingsOnly = null;
      }
    }
    const response = await adminFetch(url, {
      method: creating ? "POST" : settingsOnly ? "PATCH" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settingsOnly || { ...payload, slug }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      const formatError = (value: unknown): string => {
        if (typeof value === "string") return value;
        if (Array.isArray(value)) return value.map(formatError).filter(Boolean).join(", ");
        if (value && typeof value === "object") {
          return Object.entries(value as Record<string, unknown>)
            .map(([key, nested]) => {
              const message = formatError(nested);
              return message ? key + ": " + message : "";
            })
            .filter(Boolean)
            .join(" · ");
        }
        return value == null ? "" : String(value);
      };
      const message = formatError(result.detail || result);
      throw new Error(message || "Save failed (" + response.status + ").");
    }
    if (typeof result.id === "number") {
      postIdRef.current = result.id;
      setPostCreated(true);
      if (typeof result.slug === "string") currentSlugRef.current = result.slug;
      if (typeof result.status === "string") setPostStatus(result.status);
      const versionResponse = await adminFetch(`${API_URL}/admin/content/${result.id}/versions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const versionResult = await versionResponse.json().catch(() => ({}));
      if (!versionResponse.ok) throw new Error(versionResult.detail || "Post created, but its initial version could not be saved. Retry saving.");
      if (Array.isArray(versionResult.versions)) setPostVersions(versionResult.versions);
      const savedSnapshot = JSON.stringify(payload);
      lastSavedSnapshotRef.current = savedSnapshot;
      actionSnapshotRef.current = savedSnapshot;
      setActionBaselineReady(true);
      setAutosaveState("saved");
      return versionResult as Record<string, unknown>;
    }
    if (typeof result.slug === "string") currentSlugRef.current = result.slug;
    if (typeof result.status === "string") setPostStatus(result.status);
    const savedSnapshot = JSON.stringify(payload);
    lastSavedSnapshotRef.current = savedSnapshot;
    // For a new post, successful autosave becomes the action baseline too.
    // This keeps Draft / Save & Exit / Publish disabled until the next edit,
    // matching the edit-post workflow.
    if (!editing) {
      actionSnapshotRef.current = savedSnapshot;
      setActionBaselineReady(true);
    }
    setAutosaveState("saved");
    return result as Record<string, unknown>;
  }

  useEffect(() => {
    if (loading || saving || !activeCategory) return;
    if (editing && !autosaveInitializedRef.current) {
      autosaveInitializedRef.current = true;
      lastSavedSnapshotRef.current = currentSnapshot;
      actionSnapshotRef.current = currentSnapshot;
      setActionBaselineReady(true);
      currentSlugRef.current = editSlug || currentSlugRef.current;
      return;
    }
    const title = String(form.title_en || "").trim();
    if (!title || !form.slug.trim() || slugAvailable !== true) return;
    const snapshot = JSON.stringify(payload);
    if (snapshot === lastSavedSnapshotRef.current) return;
    if (saveInFlightRef.current) {
      pendingSaveRef.current = true;
      setAutosaveState("unsaved");
      return;
    }
    setAutosaveState("unsaved");
    const timer = window.setTimeout(async () => {
      if (saveInFlightRef.current) {
        pendingSaveRef.current = true;
        return;
      }
      saveInFlightRef.current = true;
      setAutosaveBusy(true);
      setAutosaveState("saving");
      try {
        await persistPost();
      } catch (error) {
        // Autosave failures are reflected in the editor status; avoid noisy
        // console errors for expected validation responses.
        setAutosaveState("error");
      } finally {
        saveInFlightRef.current = false;
        setAutosaveBusy(false);
        if (pendingSaveRef.current) {
          pendingSaveRef.current = false;
          setAutosaveRevision((value) => value + 1);
        }
      }
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [loading, saving, activeCategory, editing, editSlug, payload, form, slugAvailable, autosaveRevision]);

  async function changePostStatus(status: "draft" | "published") {
    if (saveInFlightRef.current) return;
    setSaving(true);
    setNotice("");
    try {
      // Autosave may already have created/saved a new post. Do not issue a
      // second PUT just to run the requested status transition.
      const needsInitialDraftVersion = postStatus !== "published" && postVersions.length === 0;
      const savedResult =
        !postIdRef.current || currentSnapshot !== lastSavedSnapshotRef.current || needsInitialDraftVersion
          ? await persistPost()
          : {};
      const postId = postIdRef.current;
      if (!postId) throw new Error("The post has not been saved yet.");
      if (status === "published") {
        if (savedResult.is_published === true) {
          router.push("/admin");
          return;
        }
        const savedVersionId = typeof savedResult.id === "number" ? savedResult.id : null;
        const pendingVersionId = savedVersionId
          || postVersions.find((item) => !item.is_published && item.version_number > Math.max(0, ...postVersions.filter((version) => version.is_published).map((version) => version.version_number)))?.id;
        if (!pendingVersionId) throw new Error("There are no unpublished changes to publish.");
        const publishResponse = await adminFetch(`${API_URL}/admin/content/${postId}/versions/${pendingVersionId}/publish/`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}),
        });
        const publishResult = await publishResponse.json().catch(() => ({}));
        if (!publishResponse.ok) throw new Error(publishResult.detail || "Unable to publish this version.");
        router.push("/admin");
        return;
      }
      const response = await adminFetch(`${API_URL}/admin/content/${postId}/review/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.detail || `Unable to change post status (${response.status}).`);
      setPostStatus(result.status || status);
      router.push("/admin");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to update post.");
    } finally {
      setSaving(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saveInFlightRef.current) return;
    setNotice("");
    setSaving(true);
    try {
      await persistPost();
      router.push("/admin");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to save post.");
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <main className="post-editor-page">
        <div className="post-editor-loading">Loading post...</div>
      </main>
    );

  return (
    <main className="post-editor-page">
      <div className="post-editor-shell">
        <header className="post-editor-header">
          <div>
            <span>CONTENT MANAGEMENT</span>
            <h1>{editing ? "Edit Post" : "Add New Post"}</h1>
            <p>
              Manage multilingual content and category-specific information.
            </p>
          </div>
          <div className="post-editor-header-actions">
            {(editing || postCreated) && <span className={`post-editor-status-badge post-editor-status-badge--${postStatus.toLowerCase().replaceAll("_", "-")}`}>{postStatus === "published" ? <>Published{postVersions.some((item) => item.is_published) && <> · v{Math.max(...postVersions.filter((item) => item.is_published).map((item) => item.version_number))}</>}</> : postStatus.replaceAll("_", " ")}</span>}
            {(editing || postCreated) && postVersions.length > 0 && <div className="post-editor-publication-status">
              {postStatus === "published" ? (
                postVersions.some((item) => !item.is_published && item.version_number > Math.max(0, ...postVersions.filter((version) => version.is_published).map((version) => version.version_number))) && <span className="post-editor-unpublished-version">Unpublished changes · v{Math.max(...postVersions.filter((item) => !item.is_published && item.version_number > Math.max(0, ...postVersions.filter((version) => version.is_published).map((version) => version.version_number))).map((item) => item.version_number))}</span>
              ) : (
                <span className="post-editor-unpublished-version">Draft · v{Math.max(...postVersions.map((item) => item.version_number))}</span>
              )}
              <details ref={versionHistoryRef} className="post-editor-version-history"><summary>Version history ({postVersions.length})</summary><ol>{postVersions.map((version) => <li key={version.id}><button type="button" className="post-editor-version-preview" onClick={() => { const previewKind = kind.api === "articles" ? "guides" : kind.api === "admit-card" ? "admit-cards" : kind.api; router.push(`/admin/preview/${previewKind}/${encodeURIComponent(currentSlugRef.current)}?version=${version.id}`); }}><b>Version {version.version_number}</b><span>{version.is_published ? "Published" : postVersions.some((item) => item.is_published && item.version_number > version.version_number) ? "Superseded" : "Unpublished changes"}</span><time>{new Date(version.created_at).toLocaleString()}</time></button></li>)}</ol></details>
            </div>}
            <div className="post-editor-save-status" aria-live="polite">
              <span className={`post-editor-save-dot ${autosaveBusy ? "saving" : autosaveState}`} />
              {autosaveBusy || autosaveState === "saving" ? "Saving changes..." : autosaveState === "saved" ? "All changes saved" : autosaveState === "error" ? "Autosave failed — edit to retry" : autosaveState === "unsaved" ? "Unsaved changes" : editing ? "No changes to save" : form.title_en.trim() ? "Draft will be saved automatically" : "Add an English title to start autosaving"}
            </div>
          </div>
        </header>
        {notice && <div className="post-editor-notice">{notice}</div>}
        <form className="post-editor-form" onSubmit={submit}>
          <section>
            <div className="post-editor-section-title-row">
              <h2>Post Information</h2>
            </div>

            <div className="post-editor-grid post-editor-meta-row">
              <Select
                label="Category"
                value={kind.api}
                disabled={editing}
                fullWidth
                size="sm"
                options={KINDS.filter((item) => categories.some((category) => normalizeAdminCategorySlug(category.slug) === normalizeAdminCategorySlug(item.slug))).map((item) => ({
                  value: item.api,
                  label: item.label,
                }))}
                onChange={(event) => changeKind(event.target.value)}
              />
              <Select
                label="Default Language"
                value={form.default_language}
                fullWidth
                size="sm"
                options={[
                  { value: "en", label: "English" },
                  { value: "mr", label: "Marathi" },
                  { value: "hi", label: "Hindi" },
                ]}
                onChange={(event) => {
                  const nextLanguage = event.target.value as ContentLanguage;
                  update("default_language", nextLanguage);
                  setActiveLanguage(nextLanguage);
                  setPostInfoLanguages({ title: [nextLanguage], summary: [nextLanguage], body: [nextLanguage] });
                }}
              />
              <Select
                label="Government Organization Type"
                value={organizationType}
                fullWidth
                size="sm"
                options={[
                  { value: "", label: "Select organization type (Optional)" },
                  ...organizationTypes.map((type) => ({ value: type.value, label: type.label })),
                ]}
                onChange={(event) => setOrganizationType(event.target.value)}
              />
              <Input
                label="Location"
                value={form.location}
                onChange={(event) => update("location", event.target.value)}
                fullWidth
                size="sm"
              />
            </div>

            <div className="post-editor-translation-group">
              <div className="post-editor-translation-heading">
                <span>Title</span>
                <button
                  type="button"
                  className="post-editor-show-translations"
                  aria-expanded={postInfoLanguages.title.length === 3}
                  onClick={() => togglePostInfoLanguages("title")}
                >
                  {postInfoLanguages.title.length === 3 ? "− Hide other languages" : "+ Show other languages"}
                </button>
              </div>
              <div className="post-editor-grid post-editor-title-grid">
                <Input
                  label={`Title (${form.default_language.toUpperCase()})`}
                  required
                  maxLength={240}
                  value={String(form[`title_${form.default_language as ContentLanguage}`] ?? "")}
                  onChange={(event) => updateTitle(event.target.value)}
                  fullWidth
                  size="sm"
                />
                <Input
                  label="URL Slug"
                  value={form.slug}
                  onChange={(event) => {
                    setSlugManuallyEdited(true);
                    update("slug", event.target.value);
                  }}
                  placeholder="Generated automatically from title"
                  className={slugAvailable === false ? "post-editor-slug-unavailable" : ""}
                  fullWidth
                  size="sm"
                />
              </div>
              {postInfoLanguages.title.length === 3 && (
                <div className="post-editor-grid post-editor-title-translations">
                  {(["en", "mr", "hi"] as const).filter((language) => language !== form.default_language).map((language) => (
                    <Input
                      key={language}
                      label={`Title (${language.toUpperCase()})`}
                      maxLength={240}
                      value={String(form[`title_${language}`] ?? "")}
                      onChange={(event) => update(`title_${language}`, event.target.value)}
                      fullWidth
                      size="sm"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="post-editor-translation-group">
              <div className="post-editor-translation-heading">
                <span>Short Description</span>
                <button
                  type="button"
                  className="post-editor-show-translations"
                  aria-expanded={postInfoLanguages.summary.length === 3}
                  onClick={() => togglePostInfoLanguages("summary")}
                >
                  {postInfoLanguages.summary.length === 3 ? "− Hide other languages" : "+ Show other languages"}
                </button>
              </div>
              <div className="post-editor-grid post-editor-single-column">
                <Textarea
                  label={`Short Description (${form.default_language.toUpperCase()})`}
                  rows={3}
                  value={String(form[`summary_${form.default_language as ContentLanguage}`] ?? "")}
                  onChange={(event) => update(`summary_${form.default_language as ContentLanguage}`, event.target.value)}
                  fullWidth
                  size="sm"
                />
                {postInfoLanguages.summary.length === 3 && (["en", "mr", "hi"] as const).filter((language) => language !== form.default_language).map((language) => (
                  <Textarea
                    key={language}
                    label={`Short Description (${language.toUpperCase()})`}
                    rows={3}
                    value={String(form[`summary_${language}`] ?? "")}
                    onChange={(event) => update(`summary_${language}`, event.target.value)}
                    fullWidth
                    size="sm"
                  />
                ))}
              </div>
            </div>

            <div className="post-editor-translation-group">
              <div className="post-editor-translation-heading">
                <span>Full Content</span>
                <button
                  type="button"
                  className="post-editor-show-translations"
                  aria-expanded={postInfoLanguages.body.length === 3}
                  onClick={() => togglePostInfoLanguages("body")}
                >
                  {postInfoLanguages.body.length === 3 ? "− Hide other languages" : "+ Show other languages"}
                </button>
              </div>
              <div className="post-editor-grid post-editor-single-column">
                <Textarea
                  label={`Full Content (${form.default_language.toUpperCase()})`}
                  rows={8}
                  value={String(form[`body_${form.default_language as ContentLanguage}`] ?? "")}
                  onChange={(event) => update(`body_${form.default_language as ContentLanguage}`, event.target.value)}
                  fullWidth
                  size="sm"
                />
                {postInfoLanguages.body.length === 3 && (["en", "mr", "hi"] as const).filter((language) => language !== form.default_language).map((language) => (
                  <Textarea
                    key={language}
                    label={`Full Content (${language.toUpperCase()})`}
                    rows={6}
                    value={String(form[`body_${language}`] ?? "")}
                    onChange={(event) => update(`body_${language}`, event.target.value)}
                    fullWidth
                    size="sm"
                  />
                ))}
              </div>
            </div>

            <div className="post-editor-grid post-editor-single-column">
              <Input
                type="url"
                label="Featured Image URL"
                value={form.featured_image_url}
                onChange={(event) => update("featured_image_url", event.target.value)}
                fullWidth
                size="sm"
              />
            </div>
          </section>
          <section>
            <h2>{kind.label} Details</h2>
 
            {kind.api === "jobs" && (
              <>
                <div className="post-editor-grid post-editor-job-primary-fields">
                  <Input
                    label="Advertisement No"
                    value={String(details.advertisement_no ?? "")}
                    onChange={(event) => updateDetail("advertisement_no", event.target.value)}
                    fullWidth
                    size="sm"
                  />
                  <Select
                    label="Application Mode"
                    value={String(details.application_mode ?? "online")}
                    options={DETAIL_OPTIONS.application_mode.map((option) => ({ value: option, label: detailLabel(option) }))}
                    onChange={(event) => updateDetail("application_mode", event.target.value)}
                    fullWidth
                    size="sm"
                  />
                </div>
                <div className="post-editor-job-posts">
                  <div className="post-editor-section-heading post-editor-job-heading">
                    <h3>Individual Recruitment Posts</h3>
                    <div className="post-editor-job-heading-actions">
                      <Checkbox
                        label="Applications Open"
                        checked={Boolean(details.applications_open)}
                        onChange={(event) => updateDetail("applications_open", event.target.checked)}
                        size="sm"
                      />
                      <div className="post-editor-mode-switch" role="group" aria-label="Educational qualification mode">
                        <span>Education</span>
                        <button
                          type="button"
                          className={details.education_mode === "common" ? "active" : ""}
                          aria-pressed={details.education_mode === "common"}
                          onClick={() => updateDetail("education_mode", "common")}
                        >
                          Same for all
                        </button>
                        <button
                          type="button"
                          className={details.education_mode !== "common" ? "active" : ""}
                          aria-pressed={details.education_mode !== "common"}
                          onClick={() => updateDetail("education_mode", "per_post")}
                        >
                          Per post
                        </button>
                      </div>
                      <button type="button" onClick={addJobPost}>+ Add Post</button>
                    </div>
                  </div>
                  <div className="post-editor-job-overview">
                    <div className="post-editor-info-note">
                      <span className="post-editor-info-icon" aria-hidden="true">i</span>
                      <p>
                        Add education, age criteria and application fees for each post.
                        Matching details are grouped on the public page; different details
                        are shown separately.
                      </p>
                    </div>
                    <div className="post-editor-vacancy-total">
                      <span>Total vacancies</span>
                      <strong>{formatCompactNumber(((details.posts as JobPostInput[]) || []).reduce((total, post) => total + Number(post.vacancies || 0), 0))}</strong>
                      <small>Calculated from individual posts</small>
                    </div>
                  </div>

                {details.education_mode === "common" ? (
                  <div className="post-editor-common-education">
                    <div className="post-editor-translation-heading">
                      <div>
                        <h4>Educational Qualification</h4>
                        <small>One qualification shared by all recruitment posts</small>
                      </div>
                      <button
                        type="button"
                        className="post-editor-show-translations"
                        aria-expanded={commonEducationExpanded}
                        onClick={toggleCommonEducationLanguages}
                      >
                        {commonEducationExpanded ? "− Hide other languages" : "+ Show other languages"}
                      </button>
                    </div>
                    <div className="post-editor-grid post-editor-common-education-fields">
                      <Textarea
                        label={`Qualification (${form.default_language.toUpperCase()})`}
                        rows={3}
                        value={String(details[`educational_qualification_${form.default_language}`] || "")}
                        onChange={(event) => {
                          updateDetail(`educational_qualification_${form.default_language}`, event.target.value);
                          updateDetail("educational_qualification", event.target.value);
                        }}
                        fullWidth
                        size="sm"
                      />
                      {commonEducationExpanded && (
                        <div className="post-editor-common-education-translations">
                          {(["en", "mr", "hi"] as const)
                            .filter((language) => language !== form.default_language)
                            .map((language) => (
                              <Textarea
                                key={language}
                                label={`Qualification (${language.toUpperCase()})`}
                                rows={3}
                                value={String(details[`educational_qualification_${language}`] || "")}
                                onChange={(event) => updateDetail(`educational_qualification_${language}`, event.target.value)}
                                fullWidth
                                size="sm"
                              />
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                {(details.posts as JobPostInput[]).map((post, postIndex) => (
                  <details className="post-editor-repeat-card post-editor-job-post-card post-editor-collapsible" key={postIndex}>
                    <summary className="post-editor-card-summary">
                      <span><strong>{post.post_number ? `Post ${post.post_number}` : `Post ${postIndex + 1}`} · {post.post_name_en || "Untitled post"}</strong><small>{post.vacancies ?? 0} vacancies <span aria-hidden="true">·</span> {(post.educations || []).length} education <span aria-hidden="true">·</span> {(post.fees || []).length} fee categories</small></span>
                      
                    </summary>
                    <div className="post-editor-post-body">
                    <div className="post-editor-post-meta-row">
                      <Input
                        label="Post Number"
                        required
                        value={post.post_number}
                        onChange={(event) => updateJobPost(postIndex, "post_number", event.target.value)}
                        fullWidth
                        size="sm"
                      />
                      <Input
                        type="number"
                        label="Vacancies"
                        min={0}
                        value={post.vacancies ?? ""}
                        onChange={(event) => updateJobPost(postIndex, "vacancies", event.target.value === "" ? null : Number(event.target.value))}
                        fullWidth
                        size="sm"
                      />
                    </div>

                    <div className="post-editor-post-title-section">
                      <div className="post-editor-translation-heading">
                        <span>Post Title</span>
                        <button
                          type="button"
                          className="post-editor-show-translations"
                          aria-expanded={expandedPostLanguages.includes(postIndex)}
                          onClick={() => setExpandedPostLanguages((current) =>
                            current.includes(postIndex)
                              ? current.filter((index) => index !== postIndex)
                              : [...current, postIndex]
                          )}
                        >
                          {expandedPostLanguages.includes(postIndex) ? "− Hide other languages" : "+ Show other languages"}
                        </button>
                      </div>
                      <div className="post-editor-grid post-editor-single-column">
                        {([activeLanguage, ...(expandedPostLanguages.includes(postIndex)
                          ? (["en", "mr", "hi"] as ContentLanguage[]).filter((language) => language !== activeLanguage)
                          : [])] as ContentLanguage[]).map((lang) => (
                          <Input
                            key={lang}
                            label={`Title (${lang.toUpperCase()})`}
                            required={lang === "en"}
                            value={String(post[`post_name_${lang}`] ?? "")}
                            onChange={(event) => updateJobPost(postIndex, `post_name_${lang}`, event.target.value)}
                            fullWidth
                            size="sm"
                          />
                        ))}
                      </div>
                    </div>

                    <h4>Age Criteria</h4>
                    <div className="post-editor-grid post-editor-age-fields">
                      <Select
                        label="Age Criteria"
                        value={post.age_criteria_type}
                        options={[
                          { value: "", label: "Select age criteria for this post" },
                          ...DETAIL_OPTIONS.age_criteria_type.map((option) => ({ value: option, label: detailLabel(option) })),
                        ]}
                        onChange={(event) => updateJobPost(postIndex, "age_criteria_type", event.target.value)}
                        fullWidth
                        size="sm"
                      />

                      {post.age_criteria_type === "age_range" ||
                      post.age_criteria_type === "minimum_only" ? (
                        <Input type="number" label="Minimum Age" min={0} value={post.age_min ?? ""} onChange={(event) => updateJobPost(postIndex, "age_min", event.target.value === "" ? null : Number(event.target.value))} fullWidth size="sm" />
                      ) : null}

                      {post.age_criteria_type === "age_range" ||
                      post.age_criteria_type === "maximum_only" ? (
                        <Input type="number" label="Maximum Age" min={0} value={post.age_max ?? ""} onChange={(event) => updateJobPost(postIndex, "age_max", event.target.value === "" ? null : Number(event.target.value))} fullWidth size="sm" />
                      ) : null}

                      {post.age_criteria_type &&
                      !["dob_range", "text_only"].includes(
                        post.age_criteria_type,
                      ) ? (
                        <Input type="date" label="Age As On Date" value={post.age_as_on_date ?? ""} onChange={(event) => updateJobPost(postIndex, "age_as_on_date", event.target.value)} fullWidth size="sm" />
                      ) : null}

                      {post.age_criteria_type === "dob_range" ? (
                        <>
                          <Input type="date" label="Eligible Date of Birth From" value={post.eligible_dob_from ?? ""} onChange={(event) => updateJobPost(postIndex, "eligible_dob_from", event.target.value)} fullWidth size="sm" />
                          <Input type="date" label="Eligible Date of Birth To" value={post.eligible_dob_to ?? ""} onChange={(event) => updateJobPost(postIndex, "eligible_dob_to", event.target.value)} fullWidth size="sm" />
                        </>
                      ) : null}
                    </div>

                    <div className="post-editor-age-note-section">
                      <div className="post-editor-translation-heading">
                        <span>Age Limit Note</span>
                        <button
                          type="button"
                          className="post-editor-show-translations"
                          aria-expanded={expandedAgeLanguages.includes(postIndex)}
                          onClick={() => setExpandedAgeLanguages((current) =>
                            current.includes(postIndex)
                              ? current.filter((index) => index !== postIndex)
                              : [...current, postIndex]
                          )}
                        >
                          {expandedAgeLanguages.includes(postIndex) ? "− Hide other languages" : "+ Show other languages"}
                        </button>
                      </div>
                      <div className="post-editor-grid post-editor-single-column">
                        {([form.default_language as ContentLanguage, ...(expandedAgeLanguages.includes(postIndex)
                          ? (["en", "mr", "hi"] as ContentLanguage[]).filter((language) => language !== form.default_language)
                          : [])] as ContentLanguage[]).map((lang) => (
                          <Textarea
                            key={lang}
                            label={`Age Limit Note (${lang.toUpperCase()})`}
                            rows={2}
                            value={String(post[`age_limit_note_${lang}`] ?? "")}
                            onChange={(event) => updateJobPost(postIndex, `age_limit_note_${lang}`, event.target.value)}
                            fullWidth
                            size="sm"
                          />
                        ))}
                      </div>
                    </div>

                    <section className="post-editor-post-detail-section post-editor-fees-section">
                      <div className="post-editor-subsection-heading">
                      <div><h4>Application fees</h4><small>Fees can be different for each post</small></div>
                      <button className="post-editor-add-button" type="button" onClick={() => addJobPostFee(postIndex)}>
                        <span aria-hidden="true">＋</span> Add fee category
                      </button>
                    </div>

                    {post.fees.map((fee, feeIndex) => (
                      <details className="post-editor-repeat-card post-editor-nested-card post-editor-collapsible" key={feeIndex}>
                        <summary className="post-editor-card-summary">
                          <span><strong>Fee category {feeIndex + 1}</strong><small>{fee.category_name_en || "Add category"}{fee.fee_amount !== "" ? ` · ₹${fee.fee_amount}` : ""}</small></span>
                        </summary>

                        <div className="post-editor-fee-fields">
                          <div className="post-editor-fee-amount">
                            <Input type="number" label="Fee Amount" min={0} step="0.01" value={fee.fee_amount} onChange={(event) => updateJobPostFee(postIndex, feeIndex, "fee_amount", event.target.value)} fullWidth size="sm" />
                          </div>

                          <div className="post-editor-fee-translation">
                            <div className="post-editor-translation-heading">
                              <span>Category</span>
                              <button
                                type="button"
                                className="post-editor-show-translations"
                                aria-expanded={expandedFeeCategoryLanguages.includes(`${postIndex}-${feeIndex}`)}
                                onClick={() => {
                                  const feeKey = `${postIndex}-${feeIndex}`;
                                  setExpandedFeeCategoryLanguages((current) =>
                                    current.includes(feeKey)
                                      ? current.filter((key) => key !== feeKey)
                                      : [...current, feeKey]
                                  );
                                }}
                              >
                                {expandedFeeCategoryLanguages.includes(`${postIndex}-${feeIndex}`) ? "− Hide other languages" : "+ Show other languages"}
                              </button>
                            </div>
                            <div className="post-editor-grid post-editor-single-column">
                              {([form.default_language as ContentLanguage, ...(expandedFeeCategoryLanguages.includes(`${postIndex}-${feeIndex}`)
                                ? (["en", "mr", "hi"] as ContentLanguage[]).filter((language) => language !== form.default_language)
                                : [])] as ContentLanguage[]).map((lang) => (
                                <Input
                                  key={lang}
                                  label={`Category (${lang.toUpperCase()})`}
                                  value={String(fee[`category_name_${lang}`] ?? "")}
                                  onChange={(event) => updateJobPostFee(postIndex, feeIndex, `category_name_${lang}`, event.target.value)}
                                  fullWidth
                                  size="sm"
                                />
                              ))}
                            </div>
                          </div>

                          <div className="post-editor-fee-translation">
                            <div className="post-editor-translation-heading">
                              <span>Fee Note</span>
                              <button
                                type="button"
                                className="post-editor-show-translations"
                                aria-expanded={expandedFeeNoteLanguages.includes(`${postIndex}-${feeIndex}`)}
                                onClick={() => {
                                  const feeKey = `${postIndex}-${feeIndex}`;
                                  setExpandedFeeNoteLanguages((current) =>
                                    current.includes(feeKey)
                                      ? current.filter((key) => key !== feeKey)
                                      : [...current, feeKey]
                                  );
                                }}
                              >
                                {expandedFeeNoteLanguages.includes(`${postIndex}-${feeIndex}`) ? "− Hide other languages" : "+ Show other languages"}
                              </button>
                            </div>
                            <div className="post-editor-grid post-editor-single-column">
                              {([form.default_language as ContentLanguage, ...(expandedFeeNoteLanguages.includes(`${postIndex}-${feeIndex}`)
                                ? (["en", "mr", "hi"] as ContentLanguage[]).filter((language) => language !== form.default_language)
                                : [])] as ContentLanguage[]).map((lang) => (
                                <Textarea
                                  key={lang}
                                  label={`Fee Note (${lang.toUpperCase()})`}
                                  rows={2}
                                  value={String(fee[`fee_note_${lang}`] ?? "")}
                                  onChange={(event) => updateJobPostFee(postIndex, feeIndex, `fee_note_${lang}`, event.target.value)}
                                  fullWidth
                                  size="sm"
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="post-editor-card-actions">
                          <button
                            type="button"
                            className="post-editor-remove"
                            onClick={() => removeJobPostFee(postIndex, feeIndex)}
                          >
                            Remove fee category
                          </button>
                        </div>
                      </details>
                    ))}

                    </section>


                    {details.education_mode === "per_post" ? (
                      <section className="post-editor-post-detail-section post-editor-education-section">
                      <div className="post-editor-subsection-heading">
                        <div><h4>Educational Qualification</h4><small>Post-specific eligibility conditions</small></div>
                        <button className="post-editor-add-button" type="button" onClick={() => addJobPostEducation(postIndex)}>
                          <span aria-hidden="true">＋</span> Add education condition
                        </button>
                      </div>
  
                      {(post.educations || []).map((education, educationIndex) => (
                        <details className="post-editor-repeat-card post-editor-nested-card post-editor-collapsible" key={educationIndex}>
                          <summary className="post-editor-card-summary">
                            <span><strong>Education condition {educationIndex + 1}</strong><small>{education.qualification_en || "Add qualification details"}</small></span>
                          </summary>
                          <div className="post-editor-translation-heading">
                            <span>Qualification</span>
                            <button
                              type="button"
                              className="post-editor-show-translations"
                              aria-expanded={expandedEducationLanguages.includes(`${postIndex}-${educationIndex}`)}
                              onClick={() => {
                                const educationKey = `${postIndex}-${educationIndex}`;
                                setExpandedEducationLanguages((current) =>
                                  current.includes(educationKey)
                                    ? current.filter((key) => key !== educationKey)
                                    : [...current, educationKey]
                                );
                              }}
                            >
                              {expandedEducationLanguages.includes(`${postIndex}-${educationIndex}`) ? "− Hide other languages" : "+ Show other languages"}
                            </button>
                          </div>
                          <div className="post-editor-grid post-editor-single-column">
                            {([form.default_language as ContentLanguage, ...(expandedEducationLanguages.includes(`${postIndex}-${educationIndex}`)
                              ? (["en", "mr", "hi"] as ContentLanguage[]).filter((language) => language !== form.default_language)
                              : [])] as ContentLanguage[]).map((lang) => (
                              <Textarea
                                key={lang}
                                label={`Qualification (${lang.toUpperCase()})`}
                                rows={3}
                                value={String(education[`qualification_${lang}`] ?? "")}
                                onChange={(event) => updateJobPostEducation(postIndex, educationIndex, `qualification_${lang}`, event.target.value)}
                                fullWidth
                                size="sm"
                              />
                            ))}
                          </div>
                          <div className="post-editor-card-actions">
                            <button className="post-editor-remove" type="button" onClick={() => removeJobPostEducation(postIndex, educationIndex)}>
                              Remove condition
                            </button>
                          </div>
                        </details>
                      ))}
                      </section>
                    ) : null}

                    <div className="post-editor-card-actions post-editor-post-actions">
                      <button
                        type="button"
                        className="post-editor-remove"
                        onClick={() => removeJobPost(postIndex)}
                      >
                        Remove post
                      </button>
                    </div>
                    </div>
                  </details>
                ))}
                </div>
              </>
            )}

            {kind.api === "jobs" ? (
              <section className="post-editor-post-detail-section post-editor-fees-section post-editor-common-application-fee">
                <div className="post-editor-subsection-heading">
                  <div>
                    <h4>Application Fee</h4>
                    <small>Common application fee details for this recruitment</small>
                  </div>
                </div>

                <div className="post-editor-grid post-editor-single-column">
                  <Input
                    label="Application Fee"
                    value={String(details.application_fee ?? "")}
                    onChange={(event) => updateDetail("application_fee", event.target.value)}
                    placeholder="e.g. General: ₹500, SC/ST: ₹250"
                    fullWidth
                    size="sm"
                  />
                </div>

                <div className="post-editor-age-note-section">
                  <div className="post-editor-translation-heading">
                    <span>Application Fee Note</span>
                    <button
                      type="button"
                      className="post-editor-show-translations"
                      aria-expanded={expandedApplicationFeeLanguages}
                      onClick={() => setExpandedApplicationFeeLanguages((current) => !current)}
                    >
                      {expandedApplicationFeeLanguages ? "− Hide other languages" : "+ Show other languages"}
                    </button>
                  </div>
                  <div className="post-editor-grid post-editor-single-column">
                    {([form.default_language as ContentLanguage, ...(expandedApplicationFeeLanguages
                      ? (["en", "mr", "hi"] as ContentLanguage[]).filter((language) => language !== form.default_language)
                      : [])] as ContentLanguage[]).map((lang) => (
                      <Textarea
                        key={lang}
                        label={`Application Fee Note (${lang.toUpperCase()})`}
                        rows={2}
                        value={String(details[`application_fee_note_${lang}`] ?? "")}
                        onChange={(event) => updateDetail(`application_fee_note_${lang}`, event.target.value)}
                        fullWidth
                        size="sm"
                      />
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            <div className="post-editor-grid post-editor-detail-grid">
              {Object.entries(details).map(([key, value]) => {
                if (kind.api === "jobs") {
                  const hiddenJobFields = [
                    "advertisement_no",
                    "application_mode",
                    "applications_open",
                    "post_details",
                    "recruitment_type",
                    "department",
                    "designation",
                    "apply_url",
                    "apply_email",
                    "selection_process",
                    "exam_pattern",
                    "syllabus",
                    "physical_test_details",
                    "interview_details",
                    "official_notification_url",
                    "official_website",
                    "age_mode",
                    "fee_mode",
                    "educational_qualification",
                    "educational_qualification_en",
                    "educational_qualification_mr",
                    "educational_qualification_hi",
                    "age_criteria_type",
                    "age_min",
                    "age_max",
                    "age_as_on_date",
                    "eligible_dob_from",
                    "eligible_dob_to",
                    "age_limit_note_en",
                    "age_limit_note_mr",
                    "age_limit_note_hi",
                    "application_fee",
                    "application_fee_note_en",
                    "application_fee_note_mr",
                    "application_fee_note_hi",
                  ];
                  if (
                    hiddenJobFields.includes(key) ||
                    key === "education_mode" ||
                    key === "posts" ||
                    key === "total_vacancies" ||
                    key === "vacancy_breakdowns"
                  ) {
                    return null;
                  }
                }

                const criteriaType = String(
                  details.age_criteria_type || "age_range",
                );
                if (
                  (key === "age_min" &&
                    ["maximum_only", "dob_range", "text_only"].includes(
                      criteriaType,
                    )) ||
                  (key === "age_max" &&
                    ["minimum_only", "dob_range", "text_only"].includes(
                      criteriaType,
                    )) ||
                  (key === "age_as_on_date" &&
                    ["dob_range", "text_only"].includes(criteriaType)) ||
                  ((key === "eligible_dob_from" || key === "eligible_dob_to") &&
                    criteriaType !== "dob_range")
                ) {
                  return null;
                }

                const label = detailLabel(key);
                const isBoolean = typeof value === "boolean";
                const isArray = Array.isArray(value);
                const isObject =
                  value !== null && typeof value === "object" && !isArray;
                const isNumber =
                  typeof value === "number" ||
                  (value === null &&
                    /count|minutes|marks|seconds|age_min|age_max|vacancies|duration/i.test(
                      key,
                    ));
                const isDate =
                  /date$|_date$/.test(key) ||
                  key === "eligible_dob_from" ||
                  key === "eligible_dob_to";
                const isLongText =
                  /details|description|qualification|eligibility|benefits|documents|instructions|syllabus|pattern|process|credentials|relaxation|beneficiaries|configuration|age_limit_note|application_fee_note/i.test(
                    key,
                  );
                if (isBoolean)
                  return (
                    <Checkbox
                      key={key}
                      label={label}
                      checked={value}
                      onChange={(event) => updateDetail(key, event.target.checked)}
                      size="sm"
                    />
                  );
                if (DETAIL_OPTIONS[key])
                  return (
                    <Select
                      key={key}
                      label={label}
                      value={String(value ?? "")}
                      options={DETAIL_OPTIONS[key].map((option) => ({ value: option, label: detailLabel(option) }))}
                      onChange={(event) => updateDetail(key, event.target.value)}
                      fullWidth
                      size="sm"
                    />
                  );
                if (isArray)
                  return (
                    <Input
                      key={key}
                      label={label}
                      value={value.join(", ")}
                      onChange={(event) => updateDetail(key, event.target.value.split(",").map((item) => item.trim()).filter(Boolean))}
                      placeholder="Comma-separated values"
                      fullWidth
                      size="sm"
                    />
                  );
                if (isObject)
                  return (
                    <Textarea
                      key={key}
                      label={label}
                      rows={5}
                      value={JSON.stringify(value, null, 2)}
                      onChange={(event) => {
                        try {
                          updateDetail(key, JSON.parse(event.target.value));
                        } catch {
                          /* Keep the last valid object while typing. */
                        }
                      }}
                      fullWidth
                      size="sm"
                    />
                  );
                return isLongText ? (
                  <Textarea
                    key={key}
                    label={label}
                    rows={4}
                    value={String(value ?? "")}
                    onChange={(event) => updateDetail(key, event.target.value)}
                    fullWidth
                    size="sm"
                  />
                ) : (
                  <Input
                    key={key}
                    label={label}
                    type={isDate ? "date" : isNumber ? "number" : /url/i.test(key) ? "url" : "text"}
                    value={value === null ? "" : String(value)}
                    onChange={(event) => updateDetail(key, isNumber ? (event.target.value === "" ? null : Number(event.target.value)) : event.target.value)}
                    fullWidth
                    size="sm"
                  />
                );
              })}
            </div>
          </section>
<section className="post-editor-important-dates">
            <div className="post-editor-section-heading">
              <h2>Important Dates</h2>
              <button
                type="button"
                onClick={() =>
                  setImportantDates((items) => [
                    ...items,
                    createEmptyDate(items.length),
                  ])
                }
              >
                ＋ Add date
              </button>
            </div>
            {importantDates.map((item, index) => {
              const updateDate = (changes: Partial<DateInput>) =>
                setImportantDates((rows) =>
                  rows.map((row, rowIndex) =>
                    rowIndex === index ? { ...row, ...changes } : row,
                  ),
                );

              const changeFormat = (date_format: string) =>
                updateDate({
                  date_format,
                  date: "",
                  time: "",
                  start_date: "",
                  end_date: "",
                  month: "",
                  year: "",
                  month_years: [],
                  old_date: "",
                  new_date: "",
                  old_time: "",
                  new_time: "",
                });

              return (
                <details className="post-editor-repeat-card post-editor-collapsible" key={index}>
                  <summary className="post-editor-card-summary">
                    <span><strong>{item.label_en || `Date ${index + 1}`}</strong><small>{detailLabel(item.date_type)} · {DATE_FORMAT_OPTIONS.find((format) => format.value === item.date_format)?.label || "Date"}</small></span>
                  </summary>
                  <div className="post-editor-grid post-editor-date-controls-row">
                    <Input
                      label="Display order"
                      type="number"
                      min={0}
                      step={1}
                      value={String(item.sort_order)}
                      onChange={(event) => updateDate({ sort_order: Number(event.target.value) || 0 })}
                      fullWidth
                      size="sm"
                    />
                    <Select
                      label="Date type"
                      value={item.date_type}
                      options={DATE_TYPE_OPTIONS.map((value) => ({ value, label: detailLabel(value) }))}
                      onChange={(event) => updateDate({ date_type: event.target.value })}
                      fullWidth
                      size="sm"
                    />
                    <Select
                      label="Date format"
                      value={item.date_format}
                      options={DATE_FORMAT_OPTIONS.map((format) => ({ value: format.value, label: format.label }))}
                      onChange={(event) => changeFormat(event.target.value)}
                      fullWidth
                      size="sm"
                    />
                  </div>

                  {item.date_format === "single" ? (
                    <div className="post-editor-grid post-editor-date-value-grid">
                      <Input label="Date" type="date" required value={item.date} onChange={(event) => updateDate({ date: event.target.value })} fullWidth size="sm" />
                      <Input label="Time (Optional)" type="time" value={item.time} onChange={(event) => updateDate({ time: event.target.value })} fullWidth size="sm" />
                    </div>
                  ) : null}

                  {item.date_format === "range" ? (
                    <div className="post-editor-grid post-editor-date-value-grid">
                      <Input label="Start date" type="date" required value={item.start_date} onChange={(event) => updateDate({ start_date: event.target.value })} fullWidth size="sm" />
                      <Input label="End date" type="date" required min={item.start_date || undefined} value={item.end_date} onChange={(event) => updateDate({ end_date: event.target.value })} fullWidth size="sm" />
                    </div>
                  ) : null}

                  {item.date_format === "month_year" ? (
                    <div className="post-editor-month-year-section">
                      <div className="post-editor-field">
                        <span className="post-editor-field-label">Month / Year *</span>
                        {item.month_years.map((entry, pairIndex) => (
                          <div key={pairIndex} className="post-editor-grid post-editor-month-year-row">
                            <Select
                              label="Month"
                              value={entry.month}
                              options={[
                                { value: "", label: "Select month" },
                                ...MONTH_OPTIONS.map((month, monthIndex) => ({ value: String(monthIndex + 1), label: month })),
                              ]}
                              onChange={(event) => {
                                const updated = [...item.month_years];
                                updated[pairIndex] = { ...entry, month: event.target.value };
                                updateDate({ month_years: updated });
                              }}
                              fullWidth
                              size="sm"
                            />
                            <Input
                              label="Year"
                              type="number"
                              required
                              min={1}
                              max={9999}
                              step={1}
                              placeholder="Year"
                              value={entry.year}
                              onChange={(event) => {
                                const updated = [...item.month_years];
                                updated[pairIndex] = { ...entry, year: event.target.value };
                                updateDate({ month_years: updated });
                              }}
                              fullWidth
                              size="sm"
                            />
                            <button
                              type="button"
                              onClick={() => updateDate({ month_years: item.month_years.filter((_, removeIndex) => removeIndex !== pairIndex) })}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="post-editor-add-month-year"
                          onClick={() => updateDate({ month_years: [...item.month_years, { month: "", year: "" }] })}
                        >
                          + Add Month / Year
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {item.date_format === "revised" || item.date_format === "revised_with_time" ? (
                    <div className="post-editor-grid post-editor-date-value-grid">
                      <Input label="Original date" type="date" required value={item.old_date} onChange={(event) => updateDate({ old_date: event.target.value })} fullWidth size="sm" />
                      <Input label="Revised date" type="date" required value={item.new_date} onChange={(event) => updateDate({ new_date: event.target.value })} fullWidth size="sm" />
                      {item.date_format === "revised_with_time" ? (
                        <>
                          <Input label="Original time" type="time" required value={item.old_time} onChange={(event) => updateDate({ old_time: event.target.value })} fullWidth size="sm" />
                          <Input label="Revised time" type="time" required value={item.new_time} onChange={(event) => updateDate({ new_time: event.target.value })} fullWidth size="sm" />
                        </>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="post-editor-date-label-section">
                    <div className="post-editor-translation-heading">
                      <span>Label</span>
                      <button
                        type="button"
                        className="post-editor-show-translations"
                        aria-expanded={expandedImportantDateLanguages.includes(index)}
                        onClick={() => setExpandedImportantDateLanguages((current) =>
                          current.includes(index) ? current.filter((dateIndex) => dateIndex !== index) : [...current, index]
                        )}
                      >
                        {expandedImportantDateLanguages.includes(index) ? "− Hide other languages" : "+ Show other languages"}
                      </button>
                    </div>
                    <div className="post-editor-grid post-editor-single-column">
                      {([activeLanguage, ...(expandedImportantDateLanguages.includes(index)
                        ? (["en", "mr", "hi"] as ContentLanguage[]).filter((language) => language !== activeLanguage)
                        : [])] as ContentLanguage[]).map((lang) => (
                        <Input
                          key={lang}
                          label={`Label (${lang.toUpperCase()})${lang === "en" ? " " : ""}`}
                          required={lang === "en"}
                          maxLength={180}
                          value={String(item[`label_${lang}`] ?? "")}
                          onChange={(event) => updateDate({ [`label_${lang}`]: event.target.value })}
                          fullWidth
                          size="sm"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="post-editor-date-description-section">
                    <div className="post-editor-translation-heading-description">
                      <span>Description</span>
                      <button
                        type="button"
                        className="post-editor-show-translations"
                        aria-expanded={expandedImportantDateDescriptionLanguages.includes(index)}
                        onClick={() => setExpandedImportantDateDescriptionLanguages((current) =>
                          current.includes(index) ? current.filter((dateIndex) => dateIndex !== index) : [...current, index]
                        )}
                      >
                        {expandedImportantDateDescriptionLanguages.includes(index) ? "− Hide other languages" : "+ Show other languages"}
                      </button>
                    </div>
                    <div className="post-editor-grid post-editor-single-column">
                      {([activeLanguage, ...(expandedImportantDateDescriptionLanguages.includes(index)
                        ? (["en", "mr", "hi"] as ContentLanguage[]).filter((language) => language !== activeLanguage)
                        : [])] as ContentLanguage[]).map((lang) => (
                        <Textarea
                          key={lang}
                          label={`Description (${lang.toUpperCase()})`}
                          rows={3}
                          maxLength={500}
                          value={String(item[`description_${lang}`] ?? "")}
                          onChange={(event) => updateDate({ [`description_${lang}`]: event.target.value })}
                          fullWidth
                          size="sm"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="post-editor-card-actions">
                    <button
                      type="button"
                      className="post-editor-remove"
                      onClick={() => setImportantDates((rows) => rows.filter((_, rowIndex) => rowIndex !== index))}
                    >
                      Remove date
                    </button>
                  </div>
                </details>
              );
            })}
          </section>
<section className="post-editor-important-links">
            <div className="post-editor-section-heading">
              <div>
                <h2>Important Links</h2>
                <p className="post-editor-section-description">Group related destinations under one title. Each group can have multiple action buttons.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const groupKey = `links-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
                  setImportantLinks((items) => [...items, {
                    name_en: "", name_mr: "", name_hi: "", group_key: groupKey,
                    action_text_en: "Click Here", action_text_mr: "", action_text_hi: "",
                    url: "", sort_order: items.length, is_active: true,
                  }]);
                }}
              >
                ＋ Add link group
              </button>
            </div>
            {Array.from(new Set(importantLinks.map((item) => item.group_key))).map((groupKey, groupIndex) => {
              const groupItems = importantLinks.filter((item) => item.group_key === groupKey);
              const first = groupItems[0];
              const titleLanguages: ContentLanguage[] = expandedImportantLinkTitleLanguages.includes(groupKey) ? ["en", "mr", "hi"] : [activeLanguage];
              const updateGroupTitle = (changes: Partial<LinkInput>) =>
                setImportantLinks((rows) => rows.map((row) => row.group_key === groupKey ? { ...row, ...changes } : row));
              const updateAction = (actionIndex: number, changes: Partial<LinkInput>) =>
                setImportantLinks((rows) => {
                  let current = 0;
                  return rows.map((row) => {
                    if (row.group_key !== groupKey) return row;
                    if (current++ === actionIndex) return { ...row, ...changes };
                    return row;
                  });
                });
              return (
                <details className="post-editor-repeat-card post-editor-collapsible post-editor-link-group" key={groupKey}>
                  <summary className="post-editor-card-summary">
                    <span>
                      <strong>{first.name_en || `Important Link Group ${groupIndex + 1}`}</strong>
                      <small>{groupItems.length} action {groupItems.length === 1 ? "link" : "links"}</small>
                    </span>
                  </summary>
                  <div className="post-editor-important-link-fields">
                    <div className="post-editor-link-translation">
                      <div className="post-editor-translation-heading">
                        <span>Group Title</span>
                        <button type="button" className="post-editor-show-translations"
                          aria-expanded={expandedImportantLinkTitleLanguages.includes(groupKey)}
                          onClick={() => setExpandedImportantLinkTitleLanguages((current) => current.includes(groupKey) ? current.filter((key) => key !== groupKey) : [...current, groupKey])}>
                          {expandedImportantLinkTitleLanguages.includes(groupKey) ? "− Hide other languages" : "+ Show other languages"}
                        </button>
                      </div>
                      <div className="post-editor-grid post-editor-link-language-grid">
                        {titleLanguages.map((lang) => (
                          <Input key={lang} label={`Group title (${lang.toUpperCase()})`}
                            value={String(first[`name_${lang}`] ?? "")}
                            onChange={(event) => updateGroupTitle({ [`name_${lang}`]: event.target.value })}
                            fullWidth size="sm" />
                        ))}
                      </div>
                    </div>
                    <div className="post-editor-link-actions-editor">
                      <div className="post-editor-link-actions-heading">
                        <strong>Action Links</strong>
                        <button type="button" onClick={() => setImportantLinks((rows) => [...rows, {
                          ...first,
                          action_text_en: "Click Here", action_text_mr: "", action_text_hi: "",
                          url: "", sort_order: rows.length, is_active: true,
                        }])}>＋ Add action</button>
                      </div>
                      {groupItems.map((action, actionIndex) => {
                        const actionKey = `${groupKey}-${actionIndex}`;
                        const actionLanguages: ContentLanguage[] = expandedImportantLinkActionLanguages.includes(actionKey) ? ["en", "mr", "hi"] : [activeLanguage];
                        return (
                          <div className="post-editor-link-action-card" key={actionIndex}>
                            <div className="post-editor-link-action-topline">
                              <span>Action {actionIndex + 1}</span>
                              <button type="button" className="post-editor-remove" onClick={() => setImportantLinks((rows) => {
                                const remaining = rows.filter((row) => !(row.group_key === groupKey && row === action));
                                return remaining;
                              })}>Remove</button>
                            </div>
                            <div className="post-editor-link-translation">
                              <div className="post-editor-translation-heading2">
                                <span>Button Text</span>
                                <button type="button" className="post-editor-show-translations"
                                  aria-expanded={expandedImportantLinkActionLanguages.includes(actionKey)}
                                  onClick={() => setExpandedImportantLinkActionLanguages((current) => current.includes(actionKey) ? current.filter((key) => key !== actionKey) : [...current, actionKey])}>
                                  {expandedImportantLinkActionLanguages.includes(actionKey) ? "− Hide other languages" : "+ Show other languages"}
                                </button>
                              </div>
                              <div className="post-editor-grid post-editor-link-language-grid">
                                {actionLanguages.map((lang) => (
                                  <Input key={lang} label={`Button text (${lang.toUpperCase()})`}
                                    value={String(action[`action_text_${lang}`] ?? "")}
                                    onChange={(event) => updateAction(actionIndex, { [`action_text_${lang}`]: event.target.value })}
                                    placeholder={lang === "en" ? "Apply Online / Download PDF" : ""}
                                    fullWidth size="sm" />
                                ))}
                              </div>
                            </div>
                            <Input type="url" label="Destination URL" value={action.url}
                              onChange={(event) => updateAction(actionIndex, { url: event.target.value })}
                              placeholder="https://" fullWidth size="sm" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="post-editor-card-actions">
                    <button type="button" className="post-editor-remove"
                      onClick={() => setImportantLinks((rows) => rows.filter((row) => row.group_key !== groupKey))}>
                      Remove link group
                    </button>
                  </div>
                </details>
              );
            })}
          </section>
          <section className="post-editor-faqs">
            <div className="post-editor-section-heading"><div><h2>Frequently Asked Questions</h2><p className="post-editor-section-description">Add common questions and answers. Translate each question and answer independently.</p></div>
              <button type="button" onClick={() => setFaqs((items) => [...items, { question_en: "", question_mr: "", question_hi: "", answer_en: "", answer_mr: "", answer_hi: "", sort_order: items.length, is_active: true }])}>＋ Add FAQ</button>
            </div>
            {faqs.map((faq, index) => {
              const questionLanguages: ContentLanguage[] = expandedFaqQuestionLanguages.includes(index) ? ["en", "mr", "hi"] : [activeLanguage];
              const answerLanguages: ContentLanguage[] = expandedFaqAnswerLanguages.includes(index) ? ["en", "mr", "hi"] : [activeLanguage];
              const updateFAQ = (changes: Partial<FAQInput>) => setFaqs((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, ...changes } : item));
              return <details className="post-editor-repeat-card post-editor-collapsible post-editor-faq-card" key={index}>
                <summary className="post-editor-card-summary"><span><strong>{faq.question_en || `Question ${index + 1}`}</strong><small>FAQ {index + 1}</small></span></summary>
                <div className="post-editor-faq-fields">
                  <div className="post-editor-link-translation">
                    <div className="post-editor-translation-heading"><span>Question</span><button type="button" className="post-editor-show-translations" aria-expanded={expandedFaqQuestionLanguages.includes(index)} onClick={() => setExpandedFaqQuestionLanguages((current) => current.includes(index) ? current.filter((value) => value !== index) : [...current, index])}>{expandedFaqQuestionLanguages.includes(index) ? "− Hide other languages" : "+ Show other languages"}</button></div>
                    {questionLanguages.map((lang) => <Input key={lang} label={`Question (${lang.toUpperCase()})`} value={String(faq[`question_${lang}`] ?? "")} onChange={(event) => updateFAQ({ [`question_${lang}`]: event.target.value })} fullWidth size="sm" />)}
                  </div>
                  <div className="post-editor-link-translation">
                    <div className="post-editor-translation-heading"><span>Answer</span><button type="button" className="post-editor-show-translations" aria-expanded={expandedFaqAnswerLanguages.includes(index)} onClick={() => setExpandedFaqAnswerLanguages((current) => current.includes(index) ? current.filter((value) => value !== index) : [...current, index])}>{expandedFaqAnswerLanguages.includes(index) ? "− Hide other languages" : "+ Show other languages"}</button></div>
                    {answerLanguages.map((lang) => <Textarea key={lang} label={`Answer (${lang.toUpperCase()})`} value={String(faq[`answer_${lang}`] ?? "")} onChange={(event) => updateFAQ({ [`answer_${lang}`]: event.target.value })} rows={4} fullWidth />)}
                  </div>
                  <label className="post-editor-check"><input type="checkbox" checked={faq.is_active} onChange={(event) => updateFAQ({ is_active: event.target.checked })} />Show this FAQ on the public post</label>
                </div>
                <div className="post-editor-card-actions"><button type="button" className="post-editor-remove" onClick={() => setFaqs((items) => items.filter((_, itemIndex) => itemIndex !== index))}>Remove FAQ</button></div>
              </details>;
            })}
          </section>
          <section>
            <h2>Post Settings</h2>
            <div className="post-editor-settings-grid">
              {(
                [
                  ["is_active", "Post is active"],
                  ["is_featured", "Feature this post"],
                  ["comments_enabled", "Allow comments"],
                  ["reactions_enabled", "Allow likes and dislikes"],
                ] as const
              ).map(([key, label]) => (
                <label className="post-editor-check" key={key}>
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(event) => update(key, event.target.checked)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </section>
          <section>
            <h2>Search Engine Information</h2>
            <div className="post-editor-grid">
              <label>
                SEO Title
                <input
                  maxLength={240}
                  value={form.meta_title_en}
                  onChange={(event) =>
                    update("meta_title_en", event.target.value)
                  }
                />
              </label>
              <label>
                SEO Description
                <input
                  maxLength={320}
                  value={form.meta_description_en}
                  onChange={(event) =>
                    update("meta_description_en", event.target.value)
                  }
                />
              </label>
            </div>
            <div className="post-editor-tags-field">
              <label htmlFor="post-related-tags">Related Tags</label>
              <div className="post-editor-tags-input" onClick={() => document.getElementById("post-related-tags")?.focus()}>
                {tags.map((tag, index) => (
                  <span className="post-editor-tag-chip" key={tag + "-" + index}>
                    {tag}
                    <button type="button" aria-label={"Remove " + tag} onClick={() => setTags((current) => current.filter((_, tagIndex) => tagIndex !== index))}>×</button>
                  </span>
                ))}
                <input
                  id="post-related-tags"
                  value={tagInput}
                  onChange={(event) => handleTagInputChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") { event.preventDefault(); commitTagInput(); }
                    else if (event.key === "Backspace" && !tagInput && tags.length) setTags((current) => current.slice(0, -1));
                  }}
                  onBlur={commitTagInput}
                  placeholder={tags.length ? "Add another tag..." : "Type a tag and press comma or Enter"}
                  aria-label="Add related tag"
                />
              </div>
              <small>Press comma, Enter or Shift + Enter to add a tag. Each tag appears as a separate clickable chip on the post.</small>
            </div>
          </section>
          <div className="post-editor-actions post-editor-actions-draft">
            <div className="post-editor-action-buttons">
              <button type="button" disabled={saving || autosaveBusy || autosaveState === "saving"} onClick={() => void leaveEditor()}>Cancel</button>
              {!editing && <button type="button" disabled={saving || autosaveBusy || autosaveState === "saving" || !activeCategory || !hasPendingActionChanges} onClick={() => void changePostStatus("draft")}>Save as Draft</button>}
              <button type="submit" disabled={saving || autosaveBusy || autosaveState === "saving" || !activeCategory || (editing ? !hasUnsavedChanges : !hasPendingActionChanges)}>{saving ? "Saving..." : "Save & Exit"}</button>
              <button type="button" className="post-editor-publish-button" disabled={saving || autosaveBusy || autosaveState === "saving" || !activeCategory || (!editing && !postCreated)} onClick={() => void changePostStatus("published")}>Publish</button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
