"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Checkbox, Input, Select, Textarea } from "shivanya-ui";
import { API_URL, type Category } from "../portal/category/CategoryGrid";
import { adminFetch, slugify } from "../../app/admin/admin-utils";
import "./PostEditor.css";

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
type ContentMetadata = {
  tags: { id: number; name_en: string; slug: string }[];
  taxonomy_terms: { id: number; name: string; slug: string; type: string; type_name: string }[];
  official_sources: { id: number; name: string; domain: string; website_url: string; source_type: string }[];
};
type SourceEvidenceInput = {
  source: number;
  source_url: string;
  title: string;
  evidence_type: string;
  is_primary: boolean;
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
  is_exempt: boolean;
  exemption_note_en: string;
  exemption_note_mr: string;
  exemption_note_hi: string;
  payment_mode: "online" | "offline" | "both" | "not_required";
  payment_instructions_en: string;
  payment_instructions_mr: string;
  payment_instructions_hi: string;
  sort_order: number;
};

type JobPostEducationInput = {
  qualification_en: string;
  qualification_mr: string;
  qualification_hi: string;
  sort_order: number;
};

type JobPostApplicationLinkInput = {
  link_type: "apply" | "registration" | "fee_payment" | "instructions" | "other";
  label_en: string;
  label_mr: string;
  label_hi: string;
  url: string;
  instructions_en: string;
  instructions_mr: string;
  instructions_hi: string;
  sort_order: number;
};

type JobPostRequiredDocumentInput = { title_en: string; title_mr: string; title_hi: string; mandatory: boolean; note_en: string; note_mr: string; note_hi: string; sort_order: number; };

type JobPostWorkLocationInput = { location_type: string; name_en: string; name_mr: string; name_hi: string; city: string; district: string; state: string; country: string; office: string; vacancies: string; note_en: string; note_mr: string; note_hi: string; sort_order: number; };

type JobPostSelectionStageInput = {
  stage_type: "written_exam" | "skill_test" | "physical_test" | "interview" | "document_verification" | "medical_exam" | "trade_test" | "other";
  title_en: string;
  title_mr: string;
  title_hi: string;
  details_en: string;
  details_mr: string;
  details_hi: string;
  mandatory: boolean;
  duration_minutes: number | null;
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
  reservation_rules: Array<Record<string, unknown>>;
  important_dates: Array<Record<string, unknown>>;
  application_links: Array<Record<string, unknown>>;
  selection_stages: JobPostSelectionStageInput[];
  work_locations: JobPostWorkLocationInput[];
  required_documents: JobPostRequiredDocumentInput[];
  physical_standards_en: string;
  physical_standards_mr: string;
  physical_standards_hi: string;
  exam_pattern_en: string;
  exam_pattern_mr: string;
  exam_pattern_hi: string;
  syllabus_en: string;
  syllabus_mr: string;
  syllabus_hi: string;
  salary_currency: string;
  salary_period: string;
  salary_min: string;
  salary_max: string;
  pay_scale: string;
  grade_pay: string;
  allowances: string;
  benefits: string;
  employment_conditions: string;
  probation_period: string;
  contract_duration: string;
  working_hours: string;
  service_bond: string;
  retirement_benefits: string;
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
  age_relaxations: Array<Record<string, unknown>>;
  education_requirements: Array<Record<string, unknown>>;
  subject_requirements: Array<Record<string, unknown>>;
  experience_requirements: Array<Record<string, unknown>>;
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
  is_exempt: false,
  exemption_note_en: "",
  exemption_note_mr: "",
  exemption_note_hi: "",
  payment_mode: "online",
  payment_instructions_en: "",
  payment_instructions_mr: "",
  payment_instructions_hi: "",
  sort_order: 0,
});

const createEmptyJobPostApplicationLink = (sort_order: number): JobPostApplicationLinkInput => ({
  link_type: "apply",
  label_en: "",
  label_mr: "",
  label_hi: "",
  url: "",
  instructions_en: "",
  instructions_mr: "",
  instructions_hi: "",
  sort_order,
});

const createEmptyJobPostRequiredDocument = (sort_order: number): JobPostRequiredDocumentInput => ({ title_en: "", title_mr: "", title_hi: "", mandatory: true, note_en: "", note_mr: "", note_hi: "", sort_order });

const createEmptyJobPostWorkLocation = (sort_order: number): JobPostWorkLocationInput => ({ location_type: "district", name_en: "", name_mr: "", name_hi: "", city: "", district: "", state: "", country: "India", office: "", vacancies: "", note_en: "", note_mr: "", note_hi: "", sort_order });

const createEmptyJobPostSelectionStage = (sort_order: number): JobPostSelectionStageInput => ({
  stage_type: "written_exam",
  title_en: "",
  title_mr: "",
  title_hi: "",
  details_en: "",
  details_mr: "",
  details_hi: "",
  mandatory: true,
  duration_minutes: null,
  sort_order,
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
  reservation_rules: [],
  important_dates: [],
  application_links: [],
  selection_stages: [],
  work_locations: [],
  required_documents: [],
  physical_standards_en: "",
  physical_standards_mr: "",
  physical_standards_hi: "",
  exam_pattern_en: "",
  exam_pattern_mr: "",
  exam_pattern_hi: "",
  syllabus_en: "",
  syllabus_mr: "",
  syllabus_hi: "",
  salary_currency: "INR",
  salary_period: "monthly",
  salary_min: "",
  salary_max: "",
  pay_scale: "",
  grade_pay: "",
  allowances: "",
  benefits: "",
  employment_conditions: "",
  probation_period: "",
  contract_duration: "",
  working_hours: "",
  service_bond: "",
  retirement_benefits: "",
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
  age_relaxations: [],
  education_requirements: [],
  subject_requirements: [],
  experience_requirements: [],
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
  category?: Category;
  tags?: { id: number; name: string; slug: string }[];
  taxonomy_terms?: { id: number; name: string; slug: string; taxonomy_type: string; relation_type: string }[];
  official_sources?: { id: number; source: number; source_url: string; title: string; evidence_type: string; is_primary: boolean }[];
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
      salary_currency: "INR",
      salary_period: "monthly",
      salary_min: null,
      salary_max: null,
      pay_scale: "",
      grade_pay: "",
      allowances: "",
      benefits: "",
      employment_conditions: "",
      probation_period: "",
      contract_duration: "",
      working_hours: "",
      service_bond: "",
      retirement_benefits: "",
      application_instructions_en: "",
      application_instructions_mr: "",
      application_instructions_hi: "",
      required_documents: [],
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

function getVideoEmbedPreview(provider: unknown, rawUrl: unknown): string {
  try {
    const url = new URL(String(rawUrl || ''));
    if (url.protocol !== 'https:') return '';
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (provider === 'youtube' && ['youtube.com', 'm.youtube.com', 'youtu.be'].includes(host)) {
      const pathMatch = url.pathname.match(/\/(?:embed|shorts)\/([A-Za-z0-9_-]{6,})/) || url.pathname.match(/^\/([A-Za-z0-9_-]{6,})$/);
      const queryMatch = url.searchParams.get('v')?.match(/^([A-Za-z0-9_-]{6,})$/);
      const id = pathMatch?.[1] || queryMatch?.[1];
      return id ? 'https://www.youtube-nocookie.com/embed/' + id : '';
    }
    if (provider === 'vimeo' && ['vimeo.com', 'player.vimeo.com'].includes(host)) {
      const match = url.pathname.match(/(?:video\/)?([0-9]{6,})/);
      return match ? 'https://player.vimeo.com/video/' + match[1] : '';
    }
  } catch {
    return '';
  }
  return '';
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
  const [contentMetadata, setContentMetadata] = useState<ContentMetadata>({ tags: [], taxonomy_terms: [], official_sources: [] });
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [selectedTaxonomyTermIds, setSelectedTaxonomyTermIds] = useState<number[]>([]);
  const [sourceEvidence, setSourceEvidence] = useState<SourceEvidenceInput[]>([]);
  const [sourceDraftId, setSourceDraftId] = useState("");
  const [sourceDraftUrl, setSourceDraftUrl] = useState("");
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
  const postIdRef = useRef<number | null>(null);
  const currentSlugRef = useRef(editSlug || "");
  const lastSavedSnapshotRef = useRef("");
  const autosaveInitializedRef = useRef(false);
  const saveInFlightRef = useRef(false);
  const pendingSaveRef = useRef(false);
  const [notice, setNotice] = useState("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

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
    () => categories.find((item) => item.slug === kind.slug),
    [categories, kind],
  );

  const [organizationTypes, setOrganizationTypes] = useState<
    OrganizationType[]
  >([]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadContentMetadata() {
      try {
        const response = await adminFetch(`${API_URL}/admin/content-metadata/`, { signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load content metadata.");
        const data = await response.json();
        if (!controller.signal.aborted) setContentMetadata({
          tags: Array.isArray(data.tags) ? data.tags : [],
          taxonomy_terms: Array.isArray(data.taxonomy_terms) ? data.taxonomy_terms : [],
          official_sources: Array.isArray(data.official_sources) ? data.official_sources : [],
        });
      } catch (error) {
        if (!controller.signal.aborted) console.error("Content metadata error:", error);
      }
    }
    void loadContentMetadata();
    return () => controller.abort();
  }, []);

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
        const record = payload as PostRecord;
        postIdRef.current = record.id;
        currentSlugRef.current = record.slug;
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
        });
        setTags(Array.isArray(record.meta_keywords) ? record.meta_keywords.filter(Boolean) : []);
        setSelectedTagIds(Array.isArray(record.tags) ? record.tags.map((item) => item.id) : []);
        setSelectedTaxonomyTermIds(Array.isArray(record.taxonomy_terms) ? record.taxonomy_terms.map((item) => item.id) : []);
        setSourceEvidence(Array.isArray(record.official_sources) ? record.official_sources.map((item) => ({
          source: item.source,
          source_url: item.source_url,
          title: item.title || "",
          evidence_type: item.evidence_type || "general",
          is_primary: Boolean(item.is_primary),
        })) : []);
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
            salary_currency: String(post.salary_currency ?? "INR"),
            salary_period: String(post.salary_period ?? "monthly"),
            salary_min: post.salary_min == null ? "" : String(post.salary_min),
            salary_max: post.salary_max == null ? "" : String(post.salary_max),
            pay_scale: String(post.pay_scale ?? ""),
            grade_pay: String(post.grade_pay ?? ""),
            physical_standards_en: String(post.physical_standards_en ?? ""),
            physical_standards_mr: String(post.physical_standards_mr ?? ""),
            physical_standards_hi: String(post.physical_standards_hi ?? ""),
            exam_pattern_en: String(post.exam_pattern_en ?? ""),
            exam_pattern_mr: String(post.exam_pattern_mr ?? ""),
            exam_pattern_hi: String(post.exam_pattern_hi ?? ""),
            syllabus_en: String(post.syllabus_en ?? ""),
            syllabus_mr: String(post.syllabus_mr ?? ""),
            syllabus_hi: String(post.syllabus_hi ?? ""),
            required_documents: Array.isArray(post.required_documents) ? (post.required_documents as Record<string, unknown>[]).map((document, documentIndex) => ({ ...createEmptyJobPostRequiredDocument(documentIndex), ...document, title_en: String(document.title_en ?? ""), title_mr: String(document.title_mr ?? ""), title_hi: String(document.title_hi ?? ""), mandatory: document.mandatory !== false, note_en: String(document.note_en ?? ""), note_mr: String(document.note_mr ?? ""), note_hi: String(document.note_hi ?? ""), sort_order: documentIndex })) : [],
            work_locations: Array.isArray(post.work_locations) ? (post.work_locations as Record<string, unknown>[]).map((location, locationIndex) => ({ ...createEmptyJobPostWorkLocation(locationIndex), ...location, location_type: String(location.location_type ?? "other"), name_en: String(location.name_en ?? ""), name_mr: String(location.name_mr ?? ""), name_hi: String(location.name_hi ?? ""), city: String(location.city ?? ""), district: String(location.district ?? ""), state: String(location.state ?? ""), country: String(location.country ?? ""), office: String(location.office ?? ""), vacancies: location.vacancies == null ? "" : String(location.vacancies), note_en: String(location.note_en ?? ""), note_mr: String(location.note_mr ?? ""), note_hi: String(location.note_hi ?? ""), sort_order: locationIndex })) : [],
            selection_stages: Array.isArray(post.selection_stages)
              ? (post.selection_stages as Record<string, unknown>[]).map((stage, stageIndex) => ({
                  ...createEmptyJobPostSelectionStage(stageIndex),
                  ...stage,
                  stage_type: (stage.stage_type as JobPostSelectionStageInput["stage_type"]) || "other",
                  title_en: String(stage.title_en ?? ""),
                  title_mr: String(stage.title_mr ?? ""),
                  title_hi: String(stage.title_hi ?? ""),
                  details_en: String(stage.details_en ?? ""),
                  details_mr: String(stage.details_mr ?? ""),
                  details_hi: String(stage.details_hi ?? ""),
                  mandatory: stage.mandatory !== false,
                  duration_minutes: stage.duration_minutes == null || stage.duration_minutes === "" ? null : Number(stage.duration_minutes),
                  sort_order: stageIndex,
                }))
              : [],
            application_links: Array.isArray(post.application_links)
              ? (post.application_links as Record<string, unknown>[]).map((link, linkIndex) => ({
                  ...createEmptyJobPostApplicationLink(linkIndex),
                  ...link,
                  link_type: (link.link_type as JobPostApplicationLinkInput["link_type"]) || "other",
                  label_en: String(link.label_en ?? ""),
                  label_mr: String(link.label_mr ?? ""),
                  label_hi: String(link.label_hi ?? ""),
                  url: String(link.url ?? ""),
                  instructions_en: String(link.instructions_en ?? ""),
                  instructions_mr: String(link.instructions_mr ?? ""),
                  instructions_hi: String(link.instructions_hi ?? ""),
                }))
              : [],
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
      salary_currency: post.salary_currency.trim() || "INR",
      salary_period: post.salary_period.trim() || "monthly",
      salary_min: post.salary_min.trim() === "" ? null : Number(post.salary_min),
      salary_max: post.salary_max.trim() === "" ? null : Number(post.salary_max),
      pay_scale: post.pay_scale.trim(),
      grade_pay: post.grade_pay.trim(),
      work_locations: (post.work_locations || []).filter((location) => [location.name_en, location.name_mr, location.name_hi, location.city, location.district, location.state, location.country, location.office].some((value) => String(value ?? "").trim())).map((location, index) => ({ ...location, name_en: location.name_en.trim(), name_mr: location.name_mr.trim(), name_hi: location.name_hi.trim(), city: location.city.trim(), district: location.district.trim(), state: location.state.trim(), country: location.country.trim(), office: location.office.trim(), vacancies: location.vacancies.trim() === "" ? null : Number(location.vacancies), note_en: location.note_en.trim(), note_mr: location.note_mr.trim(), note_hi: location.note_hi.trim(), sort_order: index })),
      selection_stages: (post.selection_stages || [])
        .filter((stage) => stage.title_en.trim() || stage.title_mr.trim() || stage.title_hi.trim())
        .map((stage, index) => ({
          ...stage,
          title_en: stage.title_en.trim(),
          title_mr: stage.title_mr.trim(),
          title_hi: stage.title_hi.trim(),
          details_en: stage.details_en.trim(),
          details_mr: stage.details_mr.trim(),
          details_hi: stage.details_hi.trim(),
          duration_minutes: stage.duration_minutes == null ? null : Number(stage.duration_minutes),
          sort_order: index,
        })),
      application_links: (post.application_links || [])
        .filter((link) => String(link.label_en ?? "").trim() || String(link.label_mr ?? "").trim() || String(link.label_hi ?? "").trim() || String(link.url ?? "").trim())
        .map((link, index) => ({
          ...link,
          label_en: String(link.label_en ?? "").trim(),
          label_mr: String(link.label_mr ?? "").trim(),
          label_hi: String(link.label_hi ?? "").trim(),
          url: String(link.url ?? "").trim(),
          instructions_en: String(link.instructions_en ?? ""),
          instructions_mr: String(link.instructions_mr ?? ""),
          instructions_hi: String(link.instructions_hi ?? ""),
          sort_order: index,
        })),
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
        tag_ids: selectedTagIds,
        taxonomy_term_ids: selectedTaxonomyTermIds,
        official_sources: sourceEvidence.filter((item) => item.source && item.source_url.trim()),

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
                posts: ((details.posts as JobPostInput[]) || []).map(
                  normalizeJobPost,
                ),
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
      }), [form, organizationType, tags, selectedTagIds, selectedTaxonomyTermIds, sourceEvidence, kind.detailKey, kind.api, details, importantLinks, faqs, importantDates]);

  const currentTitle = String(form.title_en || "").trim();
  const hasUnsavedChanges = !loading && (editing || Boolean(currentTitle)) && JSON.stringify(payload) !== lastSavedSnapshotRef.current;

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
    const creating = !postIdRef.current && !editing;
    const slug = String(payload.slug || form.slug || slugify(form.title_en));
    const url = creating
      ? `${API_URL}/admin/content/${kind.api}/`
      : `${API_URL}/admin/content/${kind.api}/${currentSlugRef.current || editSlug}/`;
    const response = await adminFetch(url, {
      method: creating ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, slug }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = result.detail || Object.entries(result)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`)
        .join(" · ");
      throw new Error(message || `Save failed (${response.status}).`);
    }
    if (typeof result.id === "number") postIdRef.current = result.id;
    if (typeof result.slug === "string") currentSlugRef.current = result.slug;
    if (typeof result.status === "string") setPostStatus(result.status);
    lastSavedSnapshotRef.current = JSON.stringify(payload);
    setAutosaveState("saved");
    return result as Record<string, unknown>;
  }

  useEffect(() => {
    if (loading || saving || !activeCategory) return;
    if (editing && !autosaveInitializedRef.current) {
      autosaveInitializedRef.current = true;
      lastSavedSnapshotRef.current = JSON.stringify(payload);
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
        console.error("Post autosave failed:", error);
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
      await persistPost();
      const postId = postIdRef.current;
      if (!postId) throw new Error("The post has not been saved yet.");
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
            <div className="post-editor-save-status" aria-live="polite">
              <span className={`post-editor-save-dot ${autosaveBusy ? "saving" : autosaveState}`} />
              {autosaveBusy || autosaveState === "saving" ? "Saving changes..." : autosaveState === "saved" ? "All changes saved" : autosaveState === "error" ? "Autosave failed — edit to retry" : autosaveState === "unsaved" ? "Unsaved changes" : editing ? `Status: ${postStatus.replaceAll("_", " ")}` : form.title_en.trim() ? "Draft will be saved automatically" : "Add an English title to start autosaving"}
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
                options={KINDS.filter((item) => categories.some((category) => category.slug === item.slug)).map((item) => ({
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
                      <strong>{((details.posts as JobPostInput[]) || []).reduce((total, post) => total + Number(post.vacancies || 0), 0).toLocaleString("en-IN")}</strong>
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

                    <section className="post-editor-post-detail-section post-editor-eligibility-requirements">
                      <div className="post-editor-subsection-heading">
                        <div><h4>Education, subject & experience requirements</h4><small>Enter only the conditions published in the official recruitment notice. Existing qualification text and education entries remain supported.</small></div>
                      </div>
                      {([
                        ["education_requirements", "Education requirements", '[{"title_en":"Bachelor degree","title_mr":"पदवी","title_hi":"स्नातक डिग्री","details_en":"Recognized university","minimum_percentage":50,"mandatory":true}]'],
                        ["subject_requirements", "Subject / specialization requirements", '[{"title_en":"Relevant subject","title_mr":"संबंधित विषय","title_hi":"संबंधित विषय","details_en":"Degree in the specified discipline","mandatory":true}]'],
                        ["experience_requirements", "Experience requirements", '[{"title_en":"Relevant work experience","title_mr":"संबंधित कामाचा अनुभव","title_hi":"संबंधित कार्य अनुभव","details_en":"Experience in the relevant field","minimum_years":2,"mandatory":true}]'],
                      ] as const).map(([field, label, example]) => (
                        <Textarea
                          key={field}
                          label={`${label} (JSON)`}
                          rows={5}
                          value={JSON.stringify(post[field] ?? [], null, 2)}
                          onChange={(event) => {
                            try {
                              const parsed = JSON.parse(event.target.value);
                              if (Array.isArray(parsed)) updateJobPost(postIndex, field, parsed);
                            } catch {
                              // Keep the last valid list while the user edits JSON.
                            }
                          }}
                          placeholder={example}
                          fullWidth
                          size="sm"
                        />
                      ))}
                    </section>

                    <section className="post-editor-post-detail-section post-editor-post-compensation">
                      <div className="post-editor-subsection-heading"><div><h4>Post-specific salary and pay scale</h4><small>Enter compensation when it differs by advertised post. Leave blank when all posts share the notification-level salary.</small></div></div>
                      <div className="post-editor-fee-fields">
                        <Input label="Currency code" value={post.salary_currency} onChange={(event) => updateJobPost(postIndex, "salary_currency", event.target.value.toUpperCase())} placeholder="INR" fullWidth size="sm" />
                        <label className="post-editor-field-label">Pay period</label><select className="post-editor-select" value={post.salary_period} onChange={(event) => updateJobPost(postIndex, "salary_period", event.target.value)}><option value="monthly">Monthly</option><option value="annual">Annual</option><option value="hourly">Hourly</option><option value="daily">Daily</option><option value="one_time">One-time</option></select>
                        <Input type="number" label="Minimum salary" min={0} step="0.01" value={post.salary_min} onChange={(event) => updateJobPost(postIndex, "salary_min", event.target.value)} fullWidth size="sm" />
                        <Input type="number" label="Maximum salary" min={0} step="0.01" value={post.salary_max} onChange={(event) => updateJobPost(postIndex, "salary_max", event.target.value)} fullWidth size="sm" />
                        <Input label="Pay scale" value={post.pay_scale} onChange={(event) => updateJobPost(postIndex, "pay_scale", event.target.value)} fullWidth size="sm" />
                        <Input label="Grade pay" value={post.grade_pay} onChange={(event) => updateJobPost(postIndex, "grade_pay", event.target.value)} fullWidth size="sm" />
                        <Textarea label="Allowances" value={post.allowances} onChange={(event) => updateJobPost(postIndex, "allowances", event.target.value)} rows={2} />
                        <Textarea label="Benefits" value={post.benefits} onChange={(event) => updateJobPost(postIndex, "benefits", event.target.value)} rows={2} />
                        <Textarea label="Employment conditions" value={post.employment_conditions} onChange={(event) => updateJobPost(postIndex, "employment_conditions", event.target.value)} rows={2} />
                        <Input label="Probation period" value={post.probation_period} onChange={(event) => updateJobPost(postIndex, "probation_period", event.target.value)} fullWidth size="sm" />
                        <Input label="Contract duration" value={post.contract_duration} onChange={(event) => updateJobPost(postIndex, "contract_duration", event.target.value)} fullWidth size="sm" />
                        <Input label="Working hours" value={post.working_hours} onChange={(event) => updateJobPost(postIndex, "working_hours", event.target.value)} fullWidth size="sm" />
                        <Textarea label="Service bond" value={post.service_bond} onChange={(event) => updateJobPost(postIndex, "service_bond", event.target.value)} rows={2} />
                        <Textarea label="Retirement benefits" value={post.retirement_benefits} onChange={(event) => updateJobPost(postIndex, "retirement_benefits", event.target.value)} rows={2} />
                      </div>
                    </section>

                    <section className="post-editor-post-detail-section post-editor-post-physical-standards">
                      <div className="post-editor-subsection-heading"><div><h4>Post-specific physical standards</h4><small>Enter official height, chest, weight, endurance, vision or other physical eligibility requirements. Keep language-specific details aligned with the notification.</small></div></div>
                      <div className="post-editor-fee-fields">
                        <Textarea label="Physical standards (English)" rows={3} value={post.physical_standards_en} onChange={(event) => updateJobPost(postIndex, "physical_standards_en", event.target.value)} fullWidth />
                        <Textarea label="Physical standards (Marathi)" rows={3} value={post.physical_standards_mr} onChange={(event) => updateJobPost(postIndex, "physical_standards_mr", event.target.value)} fullWidth />
                        <Textarea label="Physical standards (Hindi)" rows={3} value={post.physical_standards_hi} onChange={(event) => updateJobPost(postIndex, "physical_standards_hi", event.target.value)} fullWidth />
                      </div>
                    </section>

                    <section className="post-editor-post-detail-section post-editor-post-exam-pattern">
                      <div className="post-editor-subsection-heading"><div><h4>Post-specific exam pattern</h4><small>Describe the stages, paper structure, marks, duration and negative marking applicable to this advertised post.</small></div></div>
                      <div className="post-editor-fee-fields">
                        <Textarea label="Exam pattern (English)" rows={3} value={post.exam_pattern_en} onChange={(event) => updateJobPost(postIndex, "exam_pattern_en", event.target.value)} fullWidth />
                        <Textarea label="Exam pattern (Marathi)" rows={3} value={post.exam_pattern_mr} onChange={(event) => updateJobPost(postIndex, "exam_pattern_mr", event.target.value)} fullWidth />
                        <Textarea label="Exam pattern (Hindi)" rows={3} value={post.exam_pattern_hi} onChange={(event) => updateJobPost(postIndex, "exam_pattern_hi", event.target.value)} fullWidth />
                      </div>
                    </section>

                    <section className="post-editor-post-detail-section post-editor-post-syllabus">
                      <div className="post-editor-subsection-heading"><div><h4>Post-specific syllabus</h4><small>Enter the official subject-wise syllabus and topics for this post. Keep each translation aligned with the recruitment notification.</small></div></div>
                      <div className="post-editor-fee-fields">
                        <Textarea label="Syllabus (English)" rows={5} value={post.syllabus_en} onChange={(event) => updateJobPost(postIndex, "syllabus_en", event.target.value)} fullWidth />
                        <Textarea label="Syllabus (Marathi)" rows={5} value={post.syllabus_mr} onChange={(event) => updateJobPost(postIndex, "syllabus_mr", event.target.value)} fullWidth />
                        <Textarea label="Syllabus (Hindi)" rows={5} value={post.syllabus_hi} onChange={(event) => updateJobPost(postIndex, "syllabus_hi", event.target.value)} fullWidth />
                      </div>
                    </section>

                    <section className="post-editor-post-detail-section post-editor-post-required-documents">
                      <div className="post-editor-subsection-heading">
                        <div><h4>Post-specific required documents</h4><small>List documents required for this post; mark each as mandatory or optional.</small></div>
                        <button className="post-editor-add-button" type="button" onClick={() => updateJobPost(postIndex, "required_documents", [...post.required_documents, createEmptyJobPostRequiredDocument(post.required_documents.length)])}><span aria-hidden="true">＋</span> Add document</button>
                      </div>
                      {post.required_documents.map((document, documentIndex) => (
                        <div className="post-editor-repeat-card post-editor-nested-card" key={documentIndex}>
                          <div className="post-editor-fee-fields">
                            {(["title_en", "title_mr", "title_hi", "note_en", "note_mr", "note_hi"] as const).map((field) => <Input key={field} label={({title_en:"Document name (English)",title_mr:"Document name (Marathi)",title_hi:"Document name (Hindi)",note_en:"Notes (English)",note_mr:"Notes (Marathi)",note_hi:"Notes (Hindi)"} as Record<string,string>)[field]} value={document[field]} onChange={(event) => updateJobPost(postIndex, "required_documents", post.required_documents.map((item, index) => index === documentIndex ? { ...item, [field]: event.target.value } : item))} fullWidth size="sm" />)}
                            <label className="post-editor-field-label"><input type="checkbox" checked={document.mandatory} onChange={(event) => updateJobPost(postIndex, "required_documents", post.required_documents.map((item, index) => index === documentIndex ? { ...item, mandatory: event.target.checked } : item))} /> Mandatory document</label>
                            <button className="post-editor-remove-button" type="button" onClick={() => updateJobPost(postIndex, "required_documents", post.required_documents.filter((_, index) => index !== documentIndex))}>Remove document</button>
                          </div>
                        </div>
                      ))}
                    </section>

                    <section className="post-editor-post-detail-section post-editor-post-work-locations">
                      <div className="post-editor-subsection-heading">
                        <div><h4>Post-specific work locations</h4><small>List district, city, office or remote posting allocations for this advertised post.</small></div>
                        <button className="post-editor-add-button" type="button" onClick={() => updateJobPost(postIndex, "work_locations", [...post.work_locations, createEmptyJobPostWorkLocation(post.work_locations.length)])}><span aria-hidden="true">＋</span> Add work location</button>
                      </div>
                      {post.work_locations.map((location, locationIndex) => (
                        <details className="post-editor-repeat-card post-editor-nested-card post-editor-collapsible" key={locationIndex} open>
                          <summary className="post-editor-card-summary"><span><strong>{location.name_en || location.city || location.district || location.state || `Location ${locationIndex + 1}`}</strong><small>{location.location_type.replaceAll("_", " ")}</small></span></summary>
                          <div className="post-editor-fee-fields">
                            <label className="post-editor-field-label">Location type</label>
                            <select className="post-editor-select" value={location.location_type} onChange={(event) => updateJobPost(postIndex, "work_locations", post.work_locations.map((item, index) => index === locationIndex ? { ...item, location_type: event.target.value } : item))}><option value="state">State</option><option value="district">District</option><option value="city">City</option><option value="office">Office</option><option value="remote">Remote</option><option value="multiple">Multiple locations</option><option value="other">Other</option></select>
                            {(["name_en","name_mr","name_hi","city","district","state","country","office","vacancies","note_en","note_mr","note_hi"] as const).map((field) => <Input key={field} label={({name_en:"Location name (English)",name_mr:"Location name (Marathi)",name_hi:"Location name (Hindi)",city:"City",district:"District",state:"State",country:"Country",office:"Office / establishment",vacancies:"Vacancies at this location",note_en:"Notes (English)",note_mr:"Notes (Marathi)",note_hi:"Notes (Hindi)"} as Record<string,string>)[field]} type={field === "vacancies" ? "number" : "text"} min={field === "vacancies" ? 0 : undefined} value={location[field]} onChange={(event) => updateJobPost(postIndex, "work_locations", post.work_locations.map((item, index) => index === locationIndex ? { ...item, [field]: event.target.value } : item))} fullWidth size="sm" />)}
                            <button className="post-editor-remove-button" type="button" onClick={() => updateJobPost(postIndex, "work_locations", post.work_locations.filter((_, index) => index !== locationIndex))}>Remove location</button>
                          </div>
                        </details>
                      ))}
                    </section>

                    <section className="post-editor-post-detail-section post-editor-post-selection-stages">
                      <div className="post-editor-subsection-heading">
                        <div><h4>Post-specific selection process</h4><small>Enter the stages in the official order for this post. Keep empty if the recruitment uses one common selection process.</small></div>
                        <button className="post-editor-add-button" type="button" onClick={() => updateJobPost(postIndex, "selection_stages", [...(post.selection_stages || []), createEmptyJobPostSelectionStage((post.selection_stages || []).length)])}>
                          <span aria-hidden="true">＋</span> Add selection stage
                        </button>
                      </div>
                      {(post.selection_stages || []).map((stage, stageIndex) => (
                        <details className="post-editor-repeat-card post-editor-nested-card post-editor-collapsible" key={stageIndex} open>
                          <summary className="post-editor-card-summary">
                            <span><strong>{stage.title_en || `Selection stage ${stageIndex + 1}`}</strong><small>{stage.stage_type.replaceAll("_", " ")}{stage.mandatory ? " · Mandatory" : " · Optional"}</small></span>
                          </summary>
                          <div className="post-editor-fee-fields">
                            <label className="post-editor-field-label">Stage type</label>
                            <select className="post-editor-select" value={stage.stage_type} onChange={(event) => updateJobPost(postIndex, "selection_stages", post.selection_stages.map((item, index) => index === stageIndex ? { ...item, stage_type: event.target.value as JobPostSelectionStageInput["stage_type"] } : item))}>
                              <option value="written_exam">Written examination</option>
                              <option value="skill_test">Skill / typing test</option>
                              <option value="physical_test">Physical test</option>
                              <option value="interview">Interview</option>
                              <option value="document_verification">Document verification</option>
                              <option value="medical_exam">Medical examination</option>
                              <option value="trade_test">Trade test</option>
                              <option value="other">Other</option>
                            </select>
                            <Input label="Stage title (English)" value={stage.title_en} onChange={(event) => updateJobPost(postIndex, "selection_stages", post.selection_stages.map((item, index) => index === stageIndex ? { ...item, title_en: event.target.value } : item))} fullWidth size="sm" />
                            <Input label="Stage title (Marathi)" value={stage.title_mr} onChange={(event) => updateJobPost(postIndex, "selection_stages", post.selection_stages.map((item, index) => index === stageIndex ? { ...item, title_mr: event.target.value } : item))} fullWidth size="sm" />
                            <Input label="Stage title (Hindi)" value={stage.title_hi} onChange={(event) => updateJobPost(postIndex, "selection_stages", post.selection_stages.map((item, index) => index === stageIndex ? { ...item, title_hi: event.target.value } : item))} fullWidth size="sm" />
                            <Textarea label="Details (English)" rows={2} value={stage.details_en} onChange={(event) => updateJobPost(postIndex, "selection_stages", post.selection_stages.map((item, index) => index === stageIndex ? { ...item, details_en: event.target.value } : item))} fullWidth />
                            <Textarea label="Details (Marathi)" rows={2} value={stage.details_mr} onChange={(event) => updateJobPost(postIndex, "selection_stages", post.selection_stages.map((item, index) => index === stageIndex ? { ...item, details_mr: event.target.value } : item))} fullWidth />
                            <Textarea label="Details (Hindi)" rows={2} value={stage.details_hi} onChange={(event) => updateJobPost(postIndex, "selection_stages", post.selection_stages.map((item, index) => index === stageIndex ? { ...item, details_hi: event.target.value } : item))} fullWidth />
                            <Input type="number" label="Duration (minutes, optional)" min={1} max={10080} value={stage.duration_minutes ?? ""} onChange={(event) => updateJobPost(postIndex, "selection_stages", post.selection_stages.map((item, index) => index === stageIndex ? { ...item, duration_minutes: event.target.value === "" ? null : Number(event.target.value) } : item))} fullWidth size="sm" />
                            <label className="post-editor-checkbox-row"><input type="checkbox" checked={stage.mandatory} onChange={(event) => updateJobPost(postIndex, "selection_stages", post.selection_stages.map((item, index) => index === stageIndex ? { ...item, mandatory: event.target.checked } : item))} /><span>Mandatory stage</span></label>
                          </div>
                          <div className="post-editor-card-actions">
                            <button type="button" className="post-editor-remove" onClick={() => updateJobPost(postIndex, "selection_stages", post.selection_stages.filter((_, index) => index !== stageIndex).map((item, index) => ({ ...item, sort_order: index })))}>Remove stage</button>
                          </div>
                        </details>
                      ))}
                    </section>

                    <section className="post-editor-post-detail-section post-editor-post-application-links">
                      <div className="post-editor-subsection-heading">
                        <div><h4>Post-specific application links</h4><small>Add official application, registration, fee-payment or instruction links that apply only to this advertised post. Leave empty when all posts share the notification-level link.</small></div>
                        <button className="post-editor-add-button" type="button" onClick={() => updateJobPost(postIndex, "application_links", [...(post.application_links || []), createEmptyJobPostApplicationLink((post.application_links || []).length)])}>
                          <span aria-hidden="true">＋</span> Add application link
                        </button>
                      </div>
                      {(post.application_links || []).map((applicationLink, linkIndex) => (
                        <details className="post-editor-repeat-card post-editor-nested-card post-editor-collapsible" key={linkIndex} open>
                          <summary className="post-editor-card-summary">
                            <span><strong>{applicationLink.label_en || `Application link ${linkIndex + 1}`}</strong><small>{applicationLink.link_type.replaceAll("_", " ")}</small></span>
                          </summary>
                          <div className="post-editor-fee-fields">
                            <label className="post-editor-field-label">Link type</label>
                            <select className="post-editor-select" value={applicationLink.link_type} onChange={(event) => updateJobPost(postIndex, "application_links", post.application_links.map((item, index) => index === linkIndex ? { ...item, link_type: event.target.value as JobPostApplicationLinkInput["link_type"] } : item))}>
                              <option value="apply">Apply</option>
                              <option value="registration">Registration</option>
                              <option value="fee_payment">Fee payment</option>
                              <option value="instructions">Instructions</option>
                              <option value="other">Other</option>
                            </select>
                            <Input label="Label (English)" value={applicationLink.label_en} onChange={(event) => updateJobPost(postIndex, "application_links", post.application_links.map((item, index) => index === linkIndex ? { ...item, label_en: event.target.value } : item))} fullWidth size="sm" />
                            <Input label="Label (Marathi)" value={applicationLink.label_mr} onChange={(event) => updateJobPost(postIndex, "application_links", post.application_links.map((item, index) => index === linkIndex ? { ...item, label_mr: event.target.value } : item))} fullWidth size="sm" />
                            <Input label="Label (Hindi)" value={applicationLink.label_hi} onChange={(event) => updateJobPost(postIndex, "application_links", post.application_links.map((item, index) => index === linkIndex ? { ...item, label_hi: event.target.value } : item))} fullWidth size="sm" />
                            <Input type="url" label="Official destination URL" placeholder="https://..." value={applicationLink.url} onChange={(event) => updateJobPost(postIndex, "application_links", post.application_links.map((item, index) => index === linkIndex ? { ...item, url: event.target.value } : item))} fullWidth size="sm" />
                            <Textarea label="Instructions (English)" rows={2} value={applicationLink.instructions_en} onChange={(event) => updateJobPost(postIndex, "application_links", post.application_links.map((item, index) => index === linkIndex ? { ...item, instructions_en: event.target.value } : item))} fullWidth />
                            <Textarea label="Instructions (Marathi)" rows={2} value={applicationLink.instructions_mr} onChange={(event) => updateJobPost(postIndex, "application_links", post.application_links.map((item, index) => index === linkIndex ? { ...item, instructions_mr: event.target.value } : item))} fullWidth />
                            <Textarea label="Instructions (Hindi)" rows={2} value={applicationLink.instructions_hi} onChange={(event) => updateJobPost(postIndex, "application_links", post.application_links.map((item, index) => index === linkIndex ? { ...item, instructions_hi: event.target.value } : item))} fullWidth />
                          </div>
                          <div className="post-editor-card-actions">
                            <button type="button" className="post-editor-remove" onClick={() => updateJobPost(postIndex, "application_links", post.application_links.filter((_, index) => index !== linkIndex).map((item, index) => ({ ...item, sort_order: index })))}>Remove application link</button>
                          </div>
                        </details>
                      ))}
                    </section>

                    <section className="post-editor-post-detail-section post-editor-post-dates">
                      <div className="post-editor-subsection-heading">
                        <div><h4>Post-specific important dates</h4>
                        rows={7}
                        value={JSON.stringify(post.important_dates ?? [], null, 2)}
                        onChange={(event) => {
                          try {
                            const parsed = JSON.parse(event.target.value);
                            if (Array.isArray(parsed)) updateJobPost(postIndex, "important_dates", parsed);
                          } catch {
                            // Keep the last valid list while the user edits JSON.
                          }
                        }}
                        placeholder={'[{"date_type":"application_end","date_format":"single","label_en":"Last date to apply","label_mr":"अर्ज करण्याची शेवटची तारीख","label_hi":"आवेदन की अंतिम तिथि","date":"2026-12-15","description_en":"For this post only"}]'}
                        fullWidth
                        size="sm"
                      />
                    </section>

                    <section className="post-editor-post-detail-section post-editor-age-relaxations">
                      <div className="post-editor-subsection-heading">
                        <div><h4>Category-wise age relaxation</h4><small>Enter only the relaxation rules stated in the official notification. Keep this list empty when no category-specific relaxation is announced.</small></div>
                      </div>
                      <Textarea
                        label="Age relaxation rules (JSON)"
                        rows={7}
                        value={JSON.stringify(post.age_relaxations ?? [], null, 2)}
                        onChange={(event) => {
                          try {
                            const parsed = JSON.parse(event.target.value);
                            if (Array.isArray(parsed)) updateJobPost(postIndex, "age_relaxations", parsed);
                          } catch {
                            // Preserve the last valid value while the JSON is being edited.
                          }
                        }}
                        placeholder={'[{"category_en":"SC","category_mr":"अनुसूचित जाती","category_hi":"अनुसूचित जाति","relaxation_years":5,"maximum_age":40,"note_en":"As per notification"}]'}
                        fullWidth
                        size="sm"
                      />
                    </section>

                    <section className="post-editor-post-detail-section post-editor-reservation-section">
                      <div className="post-editor-subsection-heading">
                        <div><h4>Vacancy distribution & reservation</h4><small>Enter only the official vacancy allocation. Use vertical for SC/ST/OBC/EWS and horizontal for PwBD, ex-servicemen, women or other horizontal reservations. Do not add horizontal counts to vertical totals.</small></div>
                      </div>
                      <Textarea
                        label="Reservation rules (JSON)"
                        rows={9}
                        value={JSON.stringify(post.reservation_rules ?? [], null, 2)}
                        onChange={(event) => {
                          try {
                            const parsed = JSON.parse(event.target.value);
                            if (Array.isArray(parsed)) updateJobPost(postIndex, "reservation_rules", parsed);
                          } catch {
                            // Preserve the last valid value while the JSON is being edited.
                          }
                        }}
                        placeholder={'[{"reservation_type":"vertical","category_code":"SC","category_en":"Scheduled Caste","category_mr":"अनुसूचित जाती","category_hi":"अनुसूचित जाति","vacancies":12,"percentage":15,"note_en":"As per notification"},{"reservation_type":"horizontal","category_code":"PwBD","category_en":"Persons with Benchmark Disabilities","vacancies":2,"applies_to":"Across vertical categories"}]'}
                        fullWidth
                        size="sm"
                      />
                    </section>

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
                            <Input type="number" label="Fee Amount" min={0} step="0.01" value={fee.fee_amount} disabled={fee.is_exempt} onChange={(event) => updateJobPostFee(postIndex, feeIndex, "fee_amount", event.target.value)} fullWidth size="sm" />
                          <label className="post-editor-checkbox-row">
                            <input type="checkbox" checked={fee.is_exempt} onChange={(event) => { const exempt = event.target.checked; updateJobPostFee(postIndex, feeIndex, "is_exempt", exempt); updateJobPostFee(postIndex, feeIndex, "fee_amount", exempt ? "" : fee.fee_amount); updateJobPostFee(postIndex, feeIndex, "payment_mode", exempt ? "not_required" : "online"); }} />
                            <span>Application fee exempt for this category</span>
                          </label>
                          <label className="post-editor-field-label">Payment mode</label>
                          <select className="post-editor-select" value={fee.payment_mode} onChange={(event) => updateJobPostFee(postIndex, feeIndex, "payment_mode", event.target.value as JobPostFeeInput["payment_mode"])}>
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                            <option value="both">Online and Offline</option>
                            <option value="not_required">No Payment Required</option>
                          </select>

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
                            <strong>Exemption reason / conditions</strong>
                            {(["en", "mr", "hi"] as const).map((lang) => (
                              <Textarea key={lang} label={`Exemption note (${lang.toUpperCase()})`} rows={2} value={fee[`exemption_note_${lang}`]} onChange={(event) => updateJobPostFee(postIndex, feeIndex, `exemption_note_${lang}`, event.target.value)} fullWidth size="sm" />
                            ))}
                          </div>
                          <div className="post-editor-fee-translation">
                            <strong>Payment instructions</strong>
                            {(["en", "mr", "hi"] as const).map((lang) => (
                              <Textarea key={lang} label={`Payment instructions (${lang.toUpperCase()})`} rows={2} value={fee[`payment_instructions_${lang}`]} onChange={(event) => updateJobPostFee(postIndex, feeIndex, `payment_instructions_${lang}`, event.target.value)} fullWidth size="sm" />
                            ))}
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
                if (kind.api === "videos" && key === "embed_url") return null;
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
                    /count|minutes|marks|seconds|age_min|age_max|vacancies|duration|salary_min|salary_max/i.test(
                      key,
                    ));
                const isDate =
                  /date$|_date$/.test(key) ||
                  key === "eligible_dob_from" ||
                  key === "eligible_dob_to";
                const isLongText =
                  /details|description|qualification|eligibility|benefits|documents|instructions|syllabus|pattern|process|credentials|relaxation|beneficiaries|configuration|age_limit_note|application_fee_note|allowances|employment_conditions|service_bond|retirement_benefits/i.test(
                    key,
                  );
                if (kind.api === 'videos' && key === 'video_url') {
                  const previewUrl = getVideoEmbedPreview(details.provider, value);
                  return (
                    <div className="post-editor-video-source-field" key={key}>
                      <Input label={label} type="url" value={String(value ?? '')} onChange={(event) => updateDetail(key, event.target.value)} fullWidth size="sm" />
                      {previewUrl ? (
                        <div className="post-editor-video-preview">
                          <iframe src={previewUrl} title="Video preview" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                        </div>
                      ) : <small>Enter a valid HTTPS YouTube or Vimeo link to preview the embed.</small>}
                    </div>
                  );
                }
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
                if (kind.api === "jobs" && key === "required_documents") {
                  return (
                    <Textarea
                      key={key}
                      label="Required Documents Checklist (JSON)"
                      rows={8}
                      value={JSON.stringify(value ?? [], null, 2)}
                      onChange={(event) => {
                        try {
                          const parsed = JSON.parse(event.target.value);
                          if (Array.isArray(parsed)) updateDetail(key, parsed);
                        } catch {
                          // Keep the last valid checklist while JSON is being edited.
                        }
                      }}
                      placeholder={'[{"title_en":"Aadhaar card","title_mr":"आधार कार्ड","title_hi":"आधार कार्ड","mandatory":true}]'}
                      fullWidth
                      size="sm"
                    />
                  );
                }
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
            <div className="post-editor-tags-field">
              <label htmlFor="post-canonical-tags">Canonical tags</label>
              <select
                id="post-canonical-tags"
                multiple
                value={selectedTagIds.map(String)}
                onChange={(event) => setSelectedTagIds(Array.from(event.target.selectedOptions, (option) => Number(option.value)))}
              >
                {contentMetadata.tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>{tag.name_en}</option>
                ))}
              </select>
              <small>Choose normalized tags managed in the portal taxonomy workspace. Existing free-text SEO keywords remain supported separately.</small>
            </div>
            <div className="post-editor-tags-field">
              <label htmlFor="post-taxonomy-terms">Taxonomy classification</label>
              <select
                id="post-taxonomy-terms"
                multiple
                value={selectedTaxonomyTermIds.map(String)}
                onChange={(event) => setSelectedTaxonomyTermIds(Array.from(event.target.selectedOptions, (option) => Number(option.value)))}
              >
                {contentMetadata.taxonomy_terms.map((term) => (
                  <option key={term.id} value={term.id}>{term.type_name} · {term.name}</option>
                ))}
              </select>
              <small>Select all relevant departments, qualifications, locations or other configured classifications.</small>
            </div>
            <div className="post-editor-tags-field">
              <label htmlFor="post-official-source">Verified official source</label>
              <select id="post-official-source" value={sourceDraftId} onChange={(event) => setSourceDraftId(event.target.value)}>
                <option value="">Select an official publisher</option>
                {contentMetadata.official_sources.map((source) => (
                  <option key={source.id} value={source.id}>{source.name} · {source.domain}</option>
                ))}
              </select>
              <input
                value={sourceDraftUrl}
                onChange={(event) => setSourceDraftUrl(event.target.value)}
                placeholder="Official notification or evidence URL (https://...)"
                aria-label="Official evidence URL"
              />
              <button
                type="button"
                disabled={!sourceDraftId || !sourceDraftUrl.trim() || sourceEvidence.some((item) => item.source === Number(sourceDraftId) && item.source_url === sourceDraftUrl.trim())}
                onClick={() => {
                  setSourceEvidence((current) => [...current, {
                    source: Number(sourceDraftId),
                    source_url: sourceDraftUrl.trim(),
                    title: "",
                    evidence_type: "general",
                    is_primary: current.length === 0,
                  }]);
                  setSourceDraftId("");
                  setSourceDraftUrl("");
                }}
              >Add source</button>
              {sourceEvidence.map((item, index) => {
                const source = contentMetadata.official_sources.find((entry) => entry.id === item.source);
                return (
                  <div className="post-editor-tag-chip" key={item.source + "-" + item.source_url}>
                    <span>{source?.name || "Official source"} · {item.source_url}</span>
                    <button type="button" aria-label="Remove official source" onClick={() => setSourceEvidence((current) => current.filter((_, itemIndex) => itemIndex !== index))}>×</button>
                  </div>
                );
              })}
              <small>Only publishers verified by an administrator are available here. Evidence links are checked against the publisher domain by the API.</small>
            </div>
          </section>
          <div className="post-editor-actions post-editor-actions-draft">
            <div className="post-editor-action-buttons">
              <button type="button" disabled={saving || autosaveBusy || autosaveState === "saving"} onClick={() => void leaveEditor()}>Cancel</button>
              <button type="button" disabled={saving || autosaveBusy || autosaveState === "saving" || !activeCategory} onClick={() => void changePostStatus("draft")}>Save as Draft</button>
              <button type="submit" disabled={saving || autosaveBusy || autosaveState === "saving" || !activeCategory}>{saving ? "Saving..." : "Save & Exit"}</button>
              <button type="button" className="post-editor-publish-button" disabled={saving || autosaveBusy || autosaveState === "saving" || !activeCategory} onClick={() => void changePostStatus("published")}>Publish</button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
