"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
import { API_URL, type Category } from "../portal/category/CategoryGrid";
import { slugify } from "../../app/admin/admin-utils";
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
type LinkInput = {
  name_en: string;
  name_mr: string;
  name_hi: string;
  url: string;
  sort_order: number;
  is_active: boolean;
};

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
};

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
  important_links?: LinkInput[];
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
      educational_qualification: "",
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
  const { getAccessToken } = useAuth();
  const editing = Boolean(editSlug);
  const [categories, setCategories] = useState<Category[]>([]);
  const [kind, setKind] = useState(
    KINDS.find((item) => item.api === initialKind) ?? KINDS[0],
  );
  const [form, setForm] = useState<FormState>(EMPTY);
  const [details, setDetails] = useState<Record<string, unknown>>(
    detailTemplate(initialKind),
  );
  const [importantLinks, setImportantLinks] = useState<LinkInput[]>([]);
  const [importantDates, setImportantDates] = useState<DateInput[]>([]);

  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const [organizationType, setOrganizationType] = useState("");

  const activeCategory = useMemo(
    () => categories.find((item) => item.slug === kind.slug),
    [categories, kind],
  );

  const [organizationTypes, setOrganizationTypes] = useState<
    OrganizationType[]
  >([]);

  useEffect(() => {
    const controller = new AbortController();

    const loadOrganizationTypes = async () => {
      try {
        const token = await getAccessToken();

        const response = await fetch(`${API_URL}/admin/organization-types/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
  }, [getAccessToken]);

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
        const response = await fetch(
          `${API_URL}/admin/content/${kind.api}/${editSlug}/`,
          {
            signal: controller.signal,
            headers: { Authorization: `Bearer ${await getAccessToken()}` },
          },
        );
        const payload = await response.json();
        if (!response.ok)
          throw new Error(
            payload.detail || `Unable to load post (${response.status}).`,
          );
        const record = payload as PostRecord;
        setOrganizationType(record.organization_type || "");
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
          meta_keywords: (record.meta_keywords || []).join(", "),
        });
        setImportantLinks(record.important_links || []);
        setImportantDates(
          (record.important_dates || []).map((item) =>
            normalizeDateInput(item),
          ),
        );
        const data = record[
          detailKeyFor(kind.api) as keyof PostRecord
        ] as Record<string, unknown> | null;

        const template: Record<string, unknown> = {
          ...detailTemplate(kind.api),
          ...(data || {}),
        };

        if (kind.api === "jobs") {
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

  function changeKind(api: string) {
    const next = KINDS.find((item) => item.api === api);
    if (!next || editing) return;
    setKind(next);
    const template = detailTemplate(next.api);
    setDetails(template);
  }

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
    };
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    const token = await getAccessToken();
    if (!token) {
      setNotice("Your login token was not found. Please sign in again.");
      return;
    }
    if (!activeCategory) {
      setNotice("The selected category is not active in the backend.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        organization_type: organizationType,
        slug: form.slug || slugify(form.title_en),
        meta_keywords: form.meta_keywords
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        [kind.detailKey]:
          kind.api === "jobs"
            ? {
                ...details,
                age_as_on_date: normalizeApiDate(details.age_as_on_date),
                eligible_dob_from: normalizeApiDate(details.eligible_dob_from),
                eligible_dob_to: normalizeApiDate(details.eligible_dob_to),
                posts: ((details.posts as JobPostInput[]) || []).map(
                  normalizeJobPost,
                ),
              }
            : details,

        important_links: importantLinks.filter(
          (item) => item.name_en.trim() && item.url.trim(),
        ),
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
      };
      const url = editing
        ? `${API_URL}/admin/content/${kind.api}/${editSlug}/`
        : `${API_URL}/admin/content/${kind.api}/`;
      const response = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message =
          result.detail ||
          Object.entries(result)
            .map(
              ([key, value]) =>
                `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`,
            )
            .join(" · ");
        throw new Error(message || `Save failed (${response.status}).`);
      }
      router.push("/admin");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Unable to save post.",
      );
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
          <button type="button" onClick={() => router.push("/admin")}>
            ← Back to dashboard
          </button>
        </header>
        {notice && <div className="post-editor-notice">{notice}</div>}
        <form className="post-editor-form" onSubmit={submit}>
          <section>
            <h2>Post Information</h2>
            <div className="post-editor-grid">
              <label>
                Category
                <select
                  value={kind.api}
                  disabled={editing}
                  onChange={(event) => changeKind(event.target.value)}
                >
                  {KINDS.filter((item) =>
                    categories.some((category) => category.slug === item.slug),
                  ).map((item) => (
                    <option key={item.api} value={item.api}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Government Organization Type
                <select
                  value={organizationType}
                  onChange={(event) => setOrganizationType(event.target.value)}
                >
                  <option value="">Select organization type (Optional)</option>

                  {organizationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="post-editor-grid">
              <label>
                Title (English) *
                <input
                  required
                  maxLength={240}
                  value={form.title_en}
                  onChange={(event) => update("title_en", event.target.value)}
                />
              </label>
              <label>
                URL Slug
                <input
                  value={form.slug}
                  onChange={(event) => update("slug", event.target.value)}
                  placeholder="Generated from English title"
                />
              </label>
              <label>
                Title (Marathi)
                <input
                  value={form.title_mr}
                  onChange={(event) => update("title_mr", event.target.value)}
                />
              </label>
              <label>
                Title (Hindi)
                <input
                  value={form.title_hi}
                  onChange={(event) => update("title_hi", event.target.value)}
                />
              </label>
            </div>
            <label>
              Short Description (English)
              <textarea
                rows={3}
                value={form.summary_en}
                onChange={(event) => update("summary_en", event.target.value)}
              />
            </label>
            <div className="post-editor-grid">
              <label>
                Short Description (Marathi)
                <textarea
                  rows={3}
                  value={form.summary_mr}
                  onChange={(event) => update("summary_mr", event.target.value)}
                />
              </label>
              <label>
                Short Description (Hindi)
                <textarea
                  rows={3}
                  value={form.summary_hi}
                  onChange={(event) => update("summary_hi", event.target.value)}
                />
              </label>
            </div>
            <label>
              Full Content (English)
              <textarea
                rows={8}
                value={form.body_en}
                onChange={(event) => update("body_en", event.target.value)}
              />
            </label>
            <div className="post-editor-grid">
              <label>
                Full Content (Marathi)
                <textarea
                  rows={6}
                  value={form.body_mr}
                  onChange={(event) => update("body_mr", event.target.value)}
                />
              </label>
              <label>
                Full Content (Hindi)
                <textarea
                  rows={6}
                  value={form.body_hi}
                  onChange={(event) => update("body_hi", event.target.value)}
                />
              </label>
            </div>
            <div className="post-editor-grid">
              <label>
                Location
                <input
                  value={form.location}
                  onChange={(event) => update("location", event.target.value)}
                />
              </label>
              <label>
                State
                <input
                  value={form.state}
                  onChange={(event) => update("state", event.target.value)}
                />
              </label>
              <label>
                Country
                <input
                  value={form.country}
                  onChange={(event) => update("country", event.target.value)}
                />
              </label>
              <label>
                Featured Image URL
                <input
                  type="url"
                  value={form.featured_image_url}
                  onChange={(event) =>
                    update("featured_image_url", event.target.value)
                  }
                />
              </label>
              <label>
                Default Language
                <select
                  value={form.default_language}
                  onChange={(event) =>
                    update("default_language", event.target.value)
                  }
                >
                  <option value="en">English</option>
                  <option value="mr">Marathi</option>
                  <option value="hi">Hindi</option>
                </select>
              </label>
            </div>
          </section>
          <section>
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
                <div className="post-editor-repeat-card" key={index}>
                  <div className="post-editor-grid">
                    <label>
                      Date type
                      <select
                        value={item.date_type}
                        onChange={(event) =>
                          updateDate({ date_type: event.target.value })
                        }
                      >
                        {DATE_TYPE_OPTIONS.map((value) => (
                          <option key={value} value={value}>
                            {detailLabel(value)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Date format
                      <select
                        value={item.date_format}
                        onChange={(event) => changeFormat(event.target.value)}
                      >
                        {DATE_FORMAT_OPTIONS.map((format) => (
                          <option key={format.value} value={format.value}>
                            {format.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    {(["en", "mr", "hi"] as const).map((lang) => (
                      <label key={lang}>
                        Label ({lang.toUpperCase()}) *
                        <input
                          required={lang === "en"}
                          maxLength={180}
                          value={item[`label_${lang}`]}
                          onChange={(event) =>
                            updateDate({
                              [`label_${lang}`]: event.target.value,
                            })
                          }
                        />
                      </label>
                    ))}
                  </div>

                  {item.date_format === "single" ? (
                    <div className="post-editor-grid">
                      <label>
                        Date *
                        <input
                          type="date"
                          required
                          value={item.date}
                          onChange={(event) =>
                            updateDate({ date: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        Time (Optional)
                        <input
                          type="time"
                          value={item.time}
                          onChange={(event) =>
                            updateDate({ time: event.target.value })
                          }
                        />
                      </label>
                    </div>
                  ) : null}

                  {item.date_format === "range" ? (
                    <div className="post-editor-grid">
                      <label>
                        Start date *
                        <input
                          type="date"
                          required
                          value={item.start_date}
                          onChange={(event) =>
                            updateDate({ start_date: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        End date *
                        <input
                          type="date"
                          required
                          min={item.start_date || undefined}
                          value={item.end_date}
                          onChange={(event) =>
                            updateDate({ end_date: event.target.value })
                          }
                        />
                      </label>
                    </div>
                  ) : null}

                  {item.date_format === "month_year" ? (
                    <div className="post-editor-grid">
                      <div className="post-editor-field">
                        <label>Month / Year *</label>

                        {item.month_years.map((entry, index) => (
                          <div
                            key={index}
                            className="post-editor-grid"
                            style={{ marginBottom: 8 }}
                          >
                            <select
                              required
                              value={entry.month}
                              onChange={(event) => {
                                const updated = [...item.month_years];
                                updated[index] = {
                                  ...entry,
                                  month: event.target.value,
                                };
                                updateDate({ month_years: updated });
                              }}
                            >
                              <option value="">Select month</option>
                              {MONTH_OPTIONS.map((month, monthIndex) => (
                                <option key={month} value={monthIndex + 1}>
                                  {month}
                                </option>
                              ))}
                            </select>

                            <input
                              type="number"
                              required
                              min={1}
                              max={9999}
                              step={1}
                              placeholder="Year"
                              value={entry.year}
                              onChange={(event) => {
                                const updated = [...item.month_years];
                                updated[index] = {
                                  ...entry,
                                  year: event.target.value,
                                };
                                updateDate({ month_years: updated });
                              }}
                            />

                            <button
                              type="button"
                              onClick={() =>
                                updateDate({
                                  month_years: item.month_years.filter(
                                    (_, pairIndex) => pairIndex !== index,
                                  ),
                                })
                              }
                            >
                              Remove
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() =>
                            updateDate({
                              month_years: [
                                ...item.month_years,
                                { month: "", year: "" },
                              ],
                            })
                          }
                        >
                          + Add Month / Year
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {item.date_format === "revised" ||
                  item.date_format === "revised_with_time" ? (
                    <div className="post-editor-grid">
                      <label>
                        Original date *
                        <input
                          type="date"
                          required
                          value={item.old_date}
                          onChange={(event) =>
                            updateDate({ old_date: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        Revised date *
                        <input
                          type="date"
                          required
                          value={item.new_date}
                          onChange={(event) =>
                            updateDate({ new_date: event.target.value })
                          }
                        />
                      </label>
                      {item.date_format === "revised_with_time" ? (
                        <>
                          <label>
                            Original time *
                            <input
                              type="time"
                              required
                              value={item.old_time}
                              onChange={(event) =>
                                updateDate({ old_time: event.target.value })
                              }
                            />
                          </label>
                          <label>
                            Revised time *
                            <input
                              type="time"
                              required
                              value={item.new_time}
                              onChange={(event) =>
                                updateDate({ new_time: event.target.value })
                              }
                            />
                          </label>
                        </>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="post-editor-grid">
                    {(["en", "mr", "hi"] as const).map((lang) => (
                      <label key={lang}>
                        Description ({lang.toUpperCase()})
                        <textarea
                          rows={2}
                          maxLength={500}
                          value={item[`description_${lang}`]}
                          onChange={(event) =>
                            updateDate({
                              [`description_${lang}`]: event.target.value,
                            })
                          }
                        />
                      </label>
                    ))}
                    <label>
                      Display order
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={item.sort_order}
                        onChange={(event) =>
                          updateDate({
                            sort_order: Number(event.target.value) || 0,
                          })
                        }
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    className="post-editor-remove"
                    onClick={() =>
                      setImportantDates((rows) =>
                        rows.filter((_, rowIndex) => rowIndex !== index),
                      )
                    }
                  >
                    Remove date
                  </button>
                </div>
              );
            })}
          </section>
          <section>
            <div className="post-editor-section-heading">
              <h2>Important Links</h2>
              <button
                type="button"
                onClick={() =>
                  setImportantLinks((items) => [
                    ...items,
                    {
                      name_en: "",
                      name_mr: "",
                      name_hi: "",
                      url: "",
                      sort_order: items.length,
                      is_active: true,
                    },
                  ])
                }
              >
                ＋ Add link
              </button>
            </div>
            {importantLinks.map((item, index) => (
              <div className="post-editor-repeat-card" key={index}>
                <div className="post-editor-grid">
                  {(["en", "mr", "hi"] as const).map((lang) => (
                    <label key={lang}>
                      Link title ({lang.toUpperCase()})
                      <input
                        value={item[`name_${lang}`]}
                        onChange={(event) =>
                          setImportantLinks((rows) =>
                            rows.map((row, i) =>
                              i === index
                                ? {
                                    ...row,
                                    [`name_${lang}`]: event.target.value,
                                  }
                                : row,
                            ),
                          )
                        }
                      />
                    </label>
                  ))}
                  <label>
                    URL
                    <input
                      type="url"
                      value={item.url}
                      onChange={(event) =>
                        setImportantLinks((rows) =>
                          rows.map((row, i) =>
                            i === index
                              ? { ...row, url: event.target.value }
                              : row,
                          ),
                        )
                      }
                    />
                  </label>
                </div>
                <button
                  type="button"
                  className="post-editor-remove"
                  onClick={() =>
                    setImportantLinks((rows) =>
                      rows.filter((_, i) => i !== index),
                    )
                  }
                >
                  Remove link
                </button>
              </div>
            ))}
          </section>
          <section>
            <h2>{kind.label} Details</h2>
            <p className="post-editor-help">
              Complete the fields for this content category. Optional fields can
              remain empty.
            </p>

            {kind.api === "jobs" && (
              <div className="post-editor-job-posts">
                <div className="post-editor-section-heading">
                  <h3>Individual Recruitment Posts</h3>
                  <button type="button" onClick={addJobPost}>
                    + Add Post
                  </button>
                </div>

                {(details.posts as JobPostInput[]).map((post, postIndex) => (
                  <div className="post-editor-repeat-card" key={postIndex}>
                    <h3>Post {postIndex + 1}</h3>

                    <div className="post-editor-grid">
                      <label>
                        Post Number *
                        <input
                          required
                          value={post.post_number}
                          onChange={(event) =>
                            updateJobPost(
                              postIndex,
                              "post_number",
                              event.target.value,
                            )
                          }
                        />
                      </label>

                      {(["en", "mr", "hi"] as const).map((lang) => (
                        <label key={lang}>
                          Post Name ({lang.toUpperCase()}) *
                          <input
                            required={lang === "en"}
                            value={post[`post_name_${lang}`]}
                            onChange={(event) =>
                              updateJobPost(
                                postIndex,
                                `post_name_${lang}`,
                                event.target.value,
                              )
                            }
                          />
                        </label>
                      ))}

                      {(["en", "mr", "hi"] as const).map((lang) => (
                        <label key={lang}>
                          Department ({lang.toUpperCase()})
                          <input
                            value={post[`department_${lang}`]}
                            onChange={(event) =>
                              updateJobPost(
                                postIndex,
                                `department_${lang}`,
                                event.target.value,
                              )
                            }
                          />
                        </label>
                      ))}

                      <label>
                        Vacancies
                        <input
                          type="number"
                          min={0}
                          value={post.vacancies ?? ""}
                          onChange={(event) =>
                            updateJobPost(
                              postIndex,
                              "vacancies",
                              event.target.value === ""
                                ? null
                                : Number(event.target.value),
                            )
                          }
                        />
                      </label>
                    </div>

                    <h4>Educational Qualification</h4>
                    <div className="post-editor-grid">
                      {(["en", "mr", "hi"] as const).map((lang) => (
                        <label key={lang}>
                          Qualification ({lang.toUpperCase()})
                          <textarea
                            rows={3}
                            value={post[`educational_qualification_${lang}`]}
                            onChange={(event) =>
                              updateJobPost(
                                postIndex,
                                `educational_qualification_${lang}`,
                                event.target.value,
                              )
                            }
                          />
                        </label>
                      ))}
                    </div>

                    <h4>Age Criteria</h4>
                    <div className="post-editor-grid">
                      <label>
                        Age Criteria
                        <select
                          value={post.age_criteria_type}
                          onChange={(event) =>
                            updateJobPost(
                              postIndex,
                              "age_criteria_type",
                              event.target.value,
                            )
                          }
                        >
                          <option value="">
                            Use common recruitment criteria
                          </option>
                          {DETAIL_OPTIONS.age_criteria_type.map((option) => (
                            <option key={option} value={option}>
                              {detailLabel(option)}
                            </option>
                          ))}
                        </select>
                      </label>

                      {post.age_criteria_type === "age_range" ||
                      post.age_criteria_type === "minimum_only" ? (
                        <label>
                          Minimum Age
                          <input
                            type="number"
                            min={0}
                            value={post.age_min ?? ""}
                            onChange={(event) =>
                              updateJobPost(
                                postIndex,
                                "age_min",
                                event.target.value === ""
                                  ? null
                                  : Number(event.target.value),
                              )
                            }
                          />
                        </label>
                      ) : null}

                      {post.age_criteria_type === "age_range" ||
                      post.age_criteria_type === "maximum_only" ? (
                        <label>
                          Maximum Age
                          <input
                            type="number"
                            min={0}
                            value={post.age_max ?? ""}
                            onChange={(event) =>
                              updateJobPost(
                                postIndex,
                                "age_max",
                                event.target.value === ""
                                  ? null
                                  : Number(event.target.value),
                              )
                            }
                          />
                        </label>
                      ) : null}

                      {post.age_criteria_type &&
                      !["dob_range", "text_only"].includes(
                        post.age_criteria_type,
                      ) ? (
                        <label>
                          Age As On Date
                          <input
                            type="date"
                            value={post.age_as_on_date}
                            onChange={(event) =>
                              updateJobPost(
                                postIndex,
                                "age_as_on_date",
                                event.target.value,
                              )
                            }
                          />
                        </label>
                      ) : null}

                      {post.age_criteria_type === "dob_range" ? (
                        <>
                          <label>
                            Eligible Date of Birth From
                            <input
                              type="date"
                              value={post.eligible_dob_from}
                              onChange={(event) =>
                                updateJobPost(
                                  postIndex,
                                  "eligible_dob_from",
                                  event.target.value,
                                )
                              }
                            />
                          </label>

                          <label>
                            Eligible Date of Birth To
                            <input
                              type="date"
                              value={post.eligible_dob_to}
                              onChange={(event) =>
                                updateJobPost(
                                  postIndex,
                                  "eligible_dob_to",
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                        </>
                      ) : null}

                      {(["en", "mr", "hi"] as const).map((lang) => (
                        <label key={lang}>
                          Age Limit Note ({lang.toUpperCase()})
                          <textarea
                            rows={2}
                            value={post[`age_limit_note_${lang}`]}
                            onChange={(event) =>
                              updateJobPost(
                                postIndex,
                                `age_limit_note_${lang}`,
                                event.target.value,
                              )
                            }
                          />
                        </label>
                      ))}
                    </div>

                    <h4>Application Fees</h4>

                    <button
                      type="button"
                      onClick={() => addJobPostFee(postIndex)}
                    >
                      + Add Fee Category
                    </button>

                    {post.fees.map((fee, feeIndex) => (
                      <div className="post-editor-repeat-card" key={feeIndex}>
                        <h5>Fee Category {feeIndex + 1}</h5>

                        <div className="post-editor-grid">
                          {(["en", "mr", "hi"] as const).map((lang) => (
                            <label key={lang}>
                              Category ({lang.toUpperCase()})
                              <input
                                value={fee[`category_name_${lang}`]}
                                onChange={(event) =>
                                  updateJobPostFee(
                                    postIndex,
                                    feeIndex,
                                    `category_name_${lang}`,
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                          ))}

                          <label>
                            Fee Amount
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={fee.fee_amount}
                              onChange={(event) =>
                                updateJobPostFee(
                                  postIndex,
                                  feeIndex,
                                  "fee_amount",
                                  event.target.value,
                                )
                              }
                            />
                          </label>

                          {(["en", "mr", "hi"] as const).map((lang) => (
                            <label key={lang}>
                              Fee Note ({lang.toUpperCase()})
                              <textarea
                                rows={2}
                                value={fee[`fee_note_${lang}`]}
                                onChange={(event) =>
                                  updateJobPostFee(
                                    postIndex,
                                    feeIndex,
                                    `fee_note_${lang}`,
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                          ))}
                        </div>

                        <button
                          type="button"
                          className="post-editor-remove"
                          onClick={() => removeJobPostFee(postIndex, feeIndex)}
                        >
                          Remove Fee Category
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="post-editor-remove"
                      onClick={() => removeJobPost(postIndex)}
                    >
                      Remove Post
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="post-editor-grid post-editor-detail-grid">
              {Object.entries(details).map(([key, value]) => {
                if (key === "posts" && kind.api === "jobs") {
                  return null;
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
                    <label className="post-editor-check" key={key}>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(event) =>
                          updateDetail(key, event.target.checked)
                        }
                      />
                      {label}
                    </label>
                  );
                if (DETAIL_OPTIONS[key])
                  return (
                    <label key={key}>
                      {label}
                      <select
                        value={String(value ?? "")}
                        onChange={(event) =>
                          updateDetail(key, event.target.value)
                        }
                      >
                        {DETAIL_OPTIONS[key].map((option) => (
                          <option key={option} value={option}>
                            {detailLabel(option)}
                          </option>
                        ))}
                      </select>
                    </label>
                  );
                if (isArray)
                  return (
                    <label key={key}>
                      {label}{" "}
                      <input
                        value={value.join(", ")}
                        onChange={(event) =>
                          updateDetail(
                            key,
                            event.target.value
                              .split(",")
                              .map((item) => item.trim())
                              .filter(Boolean),
                          )
                        }
                        placeholder="Comma-separated values"
                      />
                    </label>
                  );
                if (isObject)
                  return (
                    <label className="post-editor-detail-wide" key={key}>
                      {label}{" "}
                      <textarea
                        rows={5}
                        value={JSON.stringify(value, null, 2)}
                        onChange={(event) => {
                          try {
                            updateDetail(key, JSON.parse(event.target.value));
                          } catch {
                            /* Keep the last valid object while typing. */
                          }
                        }}
                      />
                    </label>
                  );
                return (
                  <label key={key}>
                    {label}
                    {isLongText ? (
                      <textarea
                        rows={4}
                        value={String(value ?? "")}
                        onChange={(event) =>
                          updateDetail(key, event.target.value)
                        }
                      />
                    ) : (
                      <input
                        type={
                          isDate
                            ? "date"
                            : isNumber
                              ? "number"
                              : /url/i.test(key)
                                ? "url"
                                : "text"
                        }
                        value={value === null ? "" : String(value)}
                        onChange={(event) =>
                          updateDetail(
                            key,
                            isNumber
                              ? event.target.value === ""
                                ? null
                                : Number(event.target.value)
                              : event.target.value,
                          )
                        }
                      />
                    )}
                  </label>
                );
              })}
            </div>
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
            <label>
              Related Tags (comma separated)
              <input
                value={form.meta_keywords}
                onChange={(event) =>
                  update("meta_keywords", event.target.value)
                }
                placeholder="e.g. Police Bharti, Maharashtra, Graduate"
              />
              <small>
                Enter tags separated by commas. These appear as clickable gray
                tags on the post.
              </small>
            </label>
          </section>
          <div className="post-editor-actions">
            <button type="button" onClick={() => router.push("/admin")}>
              Cancel
            </button>
            <button type="submit" disabled={saving || !activeCategory}>
              {saving ? "Saving..." : editing ? "Save Changes" : "Create Draft"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
