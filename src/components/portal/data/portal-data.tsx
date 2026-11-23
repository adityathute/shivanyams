"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getPortalApiUrl } from "../../../lib/portal-api";
import { authenticatedFetch } from "../../../lib/authenticated-fetch";

export type ItemType =
  | "job"
  | "scheme"
  | "examination"
  | "result"
  | "admit"
  | "exam"
  | "guide"
  | "video"
  | "tool";

export type JobPostEducation = {
  id?: number;
  qualification_en: string;
  qualification_mr: string;
  qualification_hi: string;
  sort_order?: number;
};

export type JobPostFee = {
  id?: number;
  category_name_en: string;
  category_name_mr: string;
  category_name_hi: string;
  fee_amount: string;
  fee_note_en: string;
  fee_note_mr: string;
  fee_note_hi: string;
  sort_order?: number;
};

export type JobPost = {
  id: number;
  post_number: string;
  post_name_en: string;
  post_name_mr: string;
  post_name_hi: string;
  department_en: string;
  department_mr: string;
  department_hi: string;
  vacancies: number | null;
  work_locations?: Array<Record<string, unknown>>;
  exam_mode?: string;
  exam_medium_en?: string;
  exam_medium_mr?: string;
  exam_medium_hi?: string;
  exam_pattern_en?: string;
  exam_pattern_mr?: string;
  exam_pattern_hi?: string;
  syllabus_en?: string;
  syllabus_mr?: string;
  syllabus_hi?: string;
  selection_criteria_en?: string;
  selection_criteria_mr?: string;
  selection_criteria_hi?: string;
  skill_test_details_en?: string;
  skill_test_details_mr?: string;
  skill_test_details_hi?: string;
  interview_details_en?: string;
  interview_details_mr?: string;
  interview_details_hi?: string;
  medical_standards_en?: string;
  medical_standards_mr?: string;
  medical_standards_hi?: string;
  training_details_en?: string;
  training_details_mr?: string;
  training_details_hi?: string;
  posting_preferences_en?: string;
  posting_preferences_mr?: string;
  posting_preferences_hi?: string;
  document_verification_en?: string;
  document_verification_mr?: string;
  document_verification_hi?: string;
  application_guidelines_en?: string;
  application_guidelines_mr?: string;
  application_guidelines_hi?: string;
  reservation_policy_en?: string;
  reservation_policy_mr?: string;
  reservation_policy_hi?: string;
  additional_post_notes_en?: string;
  additional_post_notes_mr?: string;
  additional_post_notes_hi?: string;
  salary_currency?: string;

  salary_min?: string | number | null;
  salary_max?: string | number | null;
  pay_scale?: string;
  grade_pay?: string;
  allowances?: string;
  benefits?: string;
  employment_conditions?: string;
  probation_period?: string;
  contract_duration?: string;
  working_hours?: string;
  service_bond?: string;
  retirement_benefits?: string;
  required_documents?: JobRequiredDocument[];
  exam_pattern_en?: string;
  exam_pattern_mr?: string;
  exam_pattern_hi?: string;
  syllabus_en?: string;
  syllabus_mr?: string;
  syllabus_hi?: string;
  educational_qualification_en: string;
  educational_qualification_mr: string;
  educational_qualification_hi: string;
  age_criteria_type: string;
  age_min: number | null;
  age_max: number | null;
  age_as_on_date: string | null;
  eligible_dob_from: string | null;
  eligible_dob_to: string | null;
  age_limit_note_en: string;
  age_limit_note_mr: string;
  age_limit_note_hi: string;
  sort_order?: number;
  fees: JobPostFee[];
  educations: JobPostEducation[];
};

export type JobRequiredDocument = {
  title_en?: string;
  title_mr?: string;
  title_hi?: string;
  mandatory?: boolean;
  note_en?: string;
  note_mr?: string;
  note_hi?: string;
};

export type JobDetails = {
  posts?: JobPost[];
  education_mode?: "common" | "per_post";
  education_is_common_field?: boolean;
  age_mode?: "common" | "per_post";
  fee_mode?: "common" | "per_post";
  advertisement_no: string;
  total_posts: string;
  examination_name: string;
  post_details: string;
  educational_qualification: string;
  location: string;
  age_limit: string;
  age_criteria_type?: string;
  age_min?: number | null;
  age_max?: number | null;
  age_as_on_date?: string | null;
  eligible_dob_from?: string | null;
  eligible_dob_to?: string | null;
  age_limit_note_en: string;
  age_limit_note_mr: string;
  age_limit_note_hi: string;
  application_fee: string;
  application_fee_note_en: string;
  application_fee_note_mr: string;
  application_fee_note_hi: string;
  application_mode: string;
  salary_currency?: string;
  salary_period?: string;
  salary_min?: string | number | null;
  salary_max?: string | number | null;
  pay_scale?: string;
  grade_pay?: string;
  allowances?: string;
  benefits?: string;
  employment_conditions?: string;
  probation_period?: string;
  contract_duration?: string;
  working_hours?: string;
  service_bond?: string;
  retirement_benefits?: string;
  application_instructions_en?: string;
  application_instructions_mr?: string;
  application_instructions_hi?: string;
  required_documents?: JobRequiredDocument[];
  interview_venue: string;
  important_dates: { label: string; date: string }[];
  important_links: {
    label_en: string;
    label_mr: string;
    label_hi: string;
    action_text_en: string;
    action_text_mr: string;
    action_text_hi: string;
    url: string;
  }[];
};

export type Item = {
  id: string;
  title: string;
  title_en?: string;
  title_mr?: string;
  title_hi?: string;
  category: string;
  updated_date?: string;
  created_at?: string;
  updated_at?: string;
  category_en?: string;
  category_mr?: string;
  category_hi?: string;

  summary_en?: string;
  summary_mr?: string;
  summary_hi?: string;
  date: string;
  views_count?: number;
  description: string;
  link: string;
  type: ItemType;
  slug?: string;
  body?: string;
  body_en?: string;
  body_mr?: string;
  body_hi?: string;
  image?: string;
  organization?: string;
  organization_type?: string;
  tags: string[];
  location?: string;
  start_date?: string;
  end_date?: string;
  event_date?: string;
  important_dates?: ImportantDate[];
  important_links?: ApiLink[];
  faqs?: PostFAQ[];
  extra?: Record<string, unknown>;
  job_details?: JobDetails;
};

export type Video = {
  id: string;
  title: string;
  title_en?: string;
  title_mr?: string;
  title_hi?: string;
  url: string;
  thumbnail: string;
  language: string;
  slug?: string;
  views_count?: number;
  date?: string;
  published_at?: string;
};

export type PortalData = {
  items: Item[];
  videos: Video[];
  loading: boolean;
  error: string;
};

type ApiLink = {
  group_key?: string;
  name_en?: string;
  name_mr?: string;
  name_hi?: string;
  action_text_en?: string;
  action_text_mr?: string;
  action_text_hi?: string;
  url: string;
  is_active?: boolean;
};

export type PostFAQ = {
  id?: number; question_en: string; question_mr?: string; question_hi?: string;
  answer_en: string; answer_mr?: string; answer_hi?: string; sort_order?: number; is_active?: boolean;
};

export type ImportantDate = {
  id?: number;
  date_type: string;
  date_format:
    | "single"
    | "range"
    | "month_year"
    | "revised"
    | "revised_with_time"
    | string;
  label_en: string;
  label_mr?: string;
  label_hi?: string;
  date?: string | null;
  time?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  month?: number | null;
  year?: number | null;
  month_years?: {
    month: number;
    year: number;
  }[];
  old_date?: string | null;
  new_date?: string | null;
  old_time?: string | null;
  new_time?: string | null;
  description_en?: string;
  description_mr?: string;
  description_hi?: string;
  sort_order?: number;
};

type ApiJobPostFee = {
  id?: number;
  category_name_en?: string;
  category_name_mr?: string;
  category_name_hi?: string;
  fee_amount?: string | number;
  fee_note_en?: string;
  fee_note_mr?: string;
  fee_note_hi?: string;
  sort_order?: number;
};

type ApiJobPost = {
  id: number;
  post_number?: string;
  post_name_en?: string;
  post_name_mr?: string;
  post_name_hi?: string;
  department_en?: string;
  department_mr?: string;
  department_hi?: string;
  vacancies?: number | null;
  work_locations?: Array<Record<string, unknown>>;
  exam_mode?: string;
  exam_medium_en?: string;
  exam_medium_mr?: string;
  exam_medium_hi?: string;
  exam_pattern_en?: string;
  exam_pattern_mr?: string;
  exam_pattern_hi?: string;
  syllabus_en?: string;
  syllabus_mr?: string;
  syllabus_hi?: string;
  salary_currency?: string;
  salary_period?: string;
  salary_min?: string | number | null;
  salary_max?: string | number | null;
  pay_scale?: string;
  grade_pay?: string;
  educational_qualification_en?: string;
  educational_qualification_mr?: string;
  educational_qualification_hi?: string;
  educations?: {
    id?: number;
    qualification_en?: string;
    qualification_mr?: string;
    qualification_hi?: string;
    sort_order?: number;
  }[];
  age_criteria_type?: string;
  age_min?: number | null;
  age_max?: number | null;
  age_as_on_date?: string | null;
  eligible_dob_from?: string | null;
  eligible_dob_to?: string | null;
  age_limit_note_en?: string;
  age_limit_note_mr?: string;
  age_limit_note_hi?: string;
  sort_order?: number;
  fees?: ApiJobPostFee[];
};

export type ApiPost = {
  id: number | string;
  title_en?: string;
  title_mr?: string;
  title_hi?: string;
  slug: string;
  summary_en?: string;
  summary_mr?: string;
  summary_hi?: string;
  body_en?: string;
  body_mr?: string;
  body_hi?: string;
  category?: {
    name_en?: string;
    name_mr?: string;
    name_hi?: string;
    slug?: string;
  } | null;
  organization_type?: string;
  meta_keywords?: string[];
  location?: string;
  start_date?: string | null;
  end_date?: string | null;
  event_date?: string | null;
  featured_image_url?: string;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  views_count?: number;
  important_links?: ApiLink[];
  important_dates?: ImportantDate[];
  faqs?: PostFAQ[];
  job_details?: {
    advertisement_no?: string;
    education_mode?: "common" | "per_post";
    total_vacancies?: number | null;
    designation?: string;
    post_details?: string;
    educational_qualification?: string;
    age_criteria_type?: string;
    age_min?: number | null;
    age_max?: number | null;
    age_as_on_date?: string | null;
    eligible_dob_from?: string | null;
    eligible_dob_to?: string | null;
    age_limit_note_en?: string;
    age_limit_note_mr?: string;
    age_limit_note_hi?: string;
    application_fee?: string;
    application_fee_note_en?: string;
    application_fee_note_mr?: string;
    application_fee_note_hi?: string;
    application_mode?: string;
    salary_currency?: string;
    salary_period?: string;
    salary_min?: string | number | null;
    salary_max?: string | number | null;
    pay_scale?: string;
    grade_pay?: string;
    allowances?: string;
    benefits?: string;
    employment_conditions?: string;
    probation_period?: string;
    contract_duration?: string;
    working_hours?: string;
    service_bond?: string;
    retirement_benefits?: string;
    application_instructions_en?: string;
    application_instructions_mr?: string;
    application_instructions_hi?: string;
    required_documents?: JobRequiredDocument[];
    apply_url?: string;
    official_notification_url?: string;
    official_website?: string;
    interview_details?: string;
    posts?: ApiJobPost[];
  } | null;
  scheme_details?: {
    application_url?: string;
    official_website?: string;
  } | null;
  examination_details?: { official_website?: string } | null;
  admit_card_details?: {
    download_url?: string;
    login_url?: string;
    official_website?: string;
  } | null;
  result_details?: {
    result_url?: string;
    merit_list_url?: string;
    official_website?: string;
  } | null;
  article_guide_details?: { source_url?: string } | null;
  video_details?: {
    video_url?: string;
    thumbnail_url?: string;
    available_languages?: string[];
  } | null;
  tool_details?: { tool_key?: string } | null;
};

export const STORAGE_KEY = "shivanyams-portal-data";

const emptyData: PortalData = {
  items: [],
  videos: [],
  loading: true,
  error: "",
};

function getDate(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

function getPostTitle(post: ApiPost) {
  return post.title_en || post.title_mr || post.title_hi || "";
}

function getPostSummary(post: ApiPost) {
  return post.summary_en || post.summary_mr || post.summary_hi || "";
}

function getPostBody(post: ApiPost) {
  return post.body_en || post.body_mr || post.body_hi || "";
}

function getPostLink(post: ApiPost) {
  return (
    post.job_details?.apply_url ||
    post.job_details?.official_notification_url ||
    post.scheme_details?.application_url ||
    post.admit_card_details?.download_url ||
    post.admit_card_details?.login_url ||
    post.result_details?.result_url ||
    post.result_details?.merit_list_url ||
    post.video_details?.video_url ||
    post.examination_details?.official_website ||
    post.scheme_details?.official_website ||
    post.admit_card_details?.official_website ||
    post.result_details?.official_website ||
    post.job_details?.official_website ||
    post.article_guide_details?.source_url ||
    post.important_links?.find((link) => link.is_active !== false)?.url ||
    ""
  );
}

function normalizeComparable(value: unknown) {
  return value == null ? "" : String(value).trim().toLocaleLowerCase();
}

function sameForEveryPost<T>(posts: T[], getValue: (post: T) => unknown) {
  if (posts.length <= 1) return true;
  const first = JSON.stringify(getValue(posts[0]));
  return posts.slice(1).every((post) => JSON.stringify(getValue(post)) === first);
}

export function mapPost(post: ApiPost, type: ItemType): Item {
  const job = post.job_details;
  const jobPosts = job?.posts || [];
  const educationIsCommon = sameForEveryPost(jobPosts, (entry) => {
    const conditions = (entry.educations || [])
      .map((education) => [
        normalizeComparable(education.qualification_en),
        normalizeComparable(education.qualification_mr),
        normalizeComparable(education.qualification_hi),
      ])
      .sort((a, b) => String(a[0]).localeCompare(String(b[0])));
    return conditions.length
      ? conditions
      : [[
          normalizeComparable(entry.educational_qualification_en),
          normalizeComparable(entry.educational_qualification_mr),
          normalizeComparable(entry.educational_qualification_hi),
        ]];
  });
  const ageIsCommon = sameForEveryPost(jobPosts, (entry) => [
    normalizeComparable(entry.age_criteria_type),
    entry.age_min ?? null,
    entry.age_max ?? null,
    getDate(entry.age_as_on_date),
    getDate(entry.eligible_dob_from),
    getDate(entry.eligible_dob_to),
    normalizeComparable(entry.age_limit_note_en),
    normalizeComparable(entry.age_limit_note_mr),
    normalizeComparable(entry.age_limit_note_hi),
  ]);
  const feesAreCommon = sameForEveryPost(jobPosts, (entry) =>
    (entry.fees || [])
      .map((fee) => [
        normalizeComparable(fee.category_name_en),
        normalizeComparable(fee.category_name_mr),
        normalizeComparable(fee.category_name_hi),
        fee.fee_amount == null ? "" : String(fee.fee_amount),
        normalizeComparable(fee.fee_note_en),
        normalizeComparable(fee.fee_note_mr),
        normalizeComparable(fee.fee_note_hi),
      ])
      .sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
  );

  return {
    id: String(post.id),
    slug: post.slug,

    // Preserve all database translations
    title_en: post.title_en || "",
    title_mr: post.title_mr || "",
    title_hi: post.title_hi || "",

    title: getPostTitle(post),

    // Default category for existing components
    category:
      post.category?.name_en ||
      post.category?.name_mr ||
      post.category?.name_hi ||
      "",
    updated_date: getDate(post.updated_at),
    created_at: post.created_at || "",
    updated_at: post.updated_at || "",
    // Preserve all category translations
    category_en: post.category?.name_en || "",
    category_mr: post.category?.name_mr || "",
    category_hi: post.category?.name_hi || "",

    summary_en: post.summary_en || "",
    summary_mr: post.summary_mr || "",
    summary_hi: post.summary_hi || "",

    date: getDate(post.published_at || post.event_date || post.start_date),
    views_count: Number(post.views_count) || 0,

    description: getPostSummary(post),
    link: getPostLink(post),
    type,
    body: getPostBody(post),
    body_en: post.body_en || "",
    body_mr: post.body_mr || "",
    body_hi: post.body_hi || "",

    image: post.featured_image_url || post.video_details?.thumbnail_url || "",

    organization_type: post.organization_type || "",
    organization: post.organization_type || "",
    tags: Array.isArray(post.meta_keywords)
      ? post.meta_keywords.filter(
          (tag) => typeof tag === "string" && tag.trim(),
        )
      : [],

    location: post.location || "",
    start_date: getDate(post.start_date),
    end_date: getDate(post.end_date),
    event_date: getDate(post.event_date),
    important_dates: (post.important_dates || []).map((entry) => ({
      ...entry,
      date: entry.date || null,
      time: entry.time || null,
      start_date: entry.start_date || null,
      end_date: entry.end_date || null,
      old_date: entry.old_date || null,
      new_date: entry.new_date || null,
      old_time: entry.old_time || null,
      new_time: entry.new_time || null,
    })),
    important_links: (post.important_links || []).filter((link) => link.is_active !== false && Boolean(link.url)),
    faqs: (post.faqs || []).filter((faq) => faq.is_active !== false && Boolean(faq.question_en?.trim() && faq.answer_en?.trim())),

    job_details: job
      ? {
          advertisement_no: job.advertisement_no || "",
          total_posts:
            job.total_vacancies == null ? "" : String(job.total_vacancies),
          examination_name: "",
          post_details: job.post_details || job.designation || "",
          education_mode:
            job.education_mode === "common" || educationIsCommon
              ? "common"
              : "per_post",
          education_is_common_field: job.education_mode === "common",
          age_mode: ageIsCommon ? "common" : "per_post",
          fee_mode: feesAreCommon ? "common" : "per_post",
          educational_qualification:
            job.education_mode === "common"
              ? job.educational_qualification || ""
              : job.posts?.[0]?.educations?.[0]?.qualification_en ||
                job.posts?.[0]?.educational_qualification_en ||
                job.educational_qualification || "",
          location: post.location || "",
          age_limit: [job.posts?.[0]?.age_min, job.posts?.[0]?.age_max]
            .filter((value) => value != null)
            .join(" - "),
          age_criteria_type:
            job.posts?.[0]?.age_criteria_type || job.age_criteria_type || "age_range",
          age_min: job.posts?.[0]?.age_min ?? job.age_min ?? null,
          age_max: job.posts?.[0]?.age_max ?? job.age_max ?? null,
          age_as_on_date:
            getDate(job.posts?.[0]?.age_as_on_date) || job.age_as_on_date || null,
          eligible_dob_from:
            getDate(job.posts?.[0]?.eligible_dob_from) || job.eligible_dob_from || null,
          eligible_dob_to:
            getDate(job.posts?.[0]?.eligible_dob_to) || job.eligible_dob_to || null,
          age_limit_note_en:
            job.posts?.[0]?.age_limit_note_en || job.age_limit_note_en || "",
          age_limit_note_mr:
            job.posts?.[0]?.age_limit_note_mr || job.age_limit_note_mr || "",
          age_limit_note_hi:
            job.posts?.[0]?.age_limit_note_hi || job.age_limit_note_hi || "",
          application_fee:
            (job.posts?.[0]?.fees || [])
              .map((fee) => {
                const category = fee.category_name_en || "";
                const amount = fee.fee_amount == null ? "" : `₹${fee.fee_amount}`;
                const note = fee.fee_note_en || "";
                return [category, amount, note].filter(Boolean).join(": ");
              })
              .join(" | ") || job.application_fee || "",
          application_fee_note_en:
            (job.posts?.[0]?.fees || []).map((fee) => fee.fee_note_en).filter(Boolean).join(" | ") ||
            job.application_fee_note_en || "",
          application_fee_note_mr:
            (job.posts?.[0]?.fees || []).map((fee) => fee.fee_note_mr).filter(Boolean).join(" | ") ||
            job.application_fee_note_mr || "",
          application_fee_note_hi:
            (job.posts?.[0]?.fees || []).map((fee) => fee.fee_note_hi).filter(Boolean).join(" | ") ||
            job.application_fee_note_hi || "",
          application_mode: job.application_mode || "",
          salary_currency: job.salary_currency || "INR",
          salary_period: job.salary_period || "monthly",
          salary_min: job.salary_min ?? null,
          salary_max: job.salary_max ?? null,
          pay_scale: job.pay_scale || "",
          grade_pay: job.grade_pay || "",
          allowances: job.allowances || "",
          benefits: job.benefits || "",
          employment_conditions: job.employment_conditions || "",
          probation_period: job.probation_period || "",
          contract_duration: job.contract_duration || "",
          working_hours: job.working_hours || "",
          service_bond: job.service_bond || "",
          retirement_benefits: job.retirement_benefits || "",
          application_instructions_en: job.application_instructions_en || "",
          application_instructions_mr: job.application_instructions_mr || "",
          application_instructions_hi: job.application_instructions_hi || "",
          required_documents: Array.isArray(job.required_documents) ? job.required_documents : [],
          interview_venue: job.interview_details || "",
          important_dates: [],
          important_links: (post.important_links || []).map((link) => ({
            label_en: link.name_en || "",
            label_mr: link.name_mr || "",
            label_hi: link.name_hi || "",
            action_text_en: link.action_text_en || "Click Here",
            action_text_mr: link.action_text_mr || "",
            action_text_hi: link.action_text_hi || "",
            url: link.url,
          })),
          posts: (job.posts || []).map((post) => ({
            id: post.id,
            post_number: post.post_number || "",
            post_name_en: post.post_name_en || "",
            post_name_mr: post.post_name_mr || "",
            post_name_hi: post.post_name_hi || "",
            department_en: post.department_en || "",
            department_mr: post.department_mr || "",
            department_hi: post.department_hi || "",
            vacancies: post.vacancies ?? null,
            work_locations: Array.isArray(post.work_locations) ? post.work_locations : [],
            exam_mode: post.exam_mode || "",
            exam_medium_en: post.exam_medium_en || "",
            exam_medium_mr: post.exam_medium_mr || "",
            exam_medium_hi: post.exam_medium_hi || "",
            exam_pattern_en: post.exam_pattern_en || "",
            exam_pattern_mr: post.exam_pattern_mr || "",
            exam_pattern_hi: post.exam_pattern_hi || "",
            syllabus_en: post.syllabus_en || "",
            syllabus_mr: post.syllabus_mr || "",
            syllabus_hi: post.syllabus_hi || "",
            selection_criteria_en: post.selection_criteria_en || "",
            selection_criteria_mr: post.selection_criteria_mr || "",
            selection_criteria_hi: post.selection_criteria_hi || "",
            skill_test_details_en: post.skill_test_details_en || "",
            skill_test_details_mr: post.skill_test_details_mr || "",
            skill_test_details_hi: post.skill_test_details_hi || "",
            interview_details_en: post.interview_details_en || "",
            interview_details_mr: post.interview_details_mr || "",
            interview_details_hi: post.interview_details_hi || "",
            medical_standards_en: post.medical_standards_en || "",
            medical_standards_mr: post.medical_standards_mr || "",
            medical_standards_hi: post.medical_standards_hi || "",
            training_details_en: post.training_details_en || "",
            training_details_mr: post.training_details_mr || "",
            training_details_hi: post.training_details_hi || "",
            posting_preferences_en: post.posting_preferences_en || "",
            posting_preferences_mr: post.posting_preferences_mr || "",
            posting_preferences_hi: post.posting_preferences_hi || "",
            document_verification_en: post.document_verification_en || "",
            document_verification_mr: post.document_verification_mr || "",
            document_verification_hi: post.document_verification_hi || "",
            application_guidelines_en: post.application_guidelines_en || "",
            application_guidelines_mr: post.application_guidelines_mr || "",
            application_guidelines_hi: post.application_guidelines_hi || "",
            reservation_policy_en: post.reservation_policy_en || "",
            reservation_policy_mr: post.reservation_policy_mr || "",
            reservation_policy_hi: post.reservation_policy_hi || "",
            additional_post_notes_en: post.additional_post_notes_en || "",
            additional_post_notes_mr: post.additional_post_notes_mr || "",
            additional_post_notes_hi: post.additional_post_notes_hi || "",
            salary_currency: post.salary_currency || "INR",
            salary_period: post.salary_period || "monthly",
            salary_min: post.salary_min ?? null,
            salary_max: post.salary_max ?? null,
            pay_scale: post.pay_scale || "",
            grade_pay: post.grade_pay || "",
            educational_qualification_en:
              post.educational_qualification_en || "",
            educational_qualification_mr:
              post.educational_qualification_mr || "",
            educational_qualification_hi:
              post.educational_qualification_hi || "",
            educations: (post.educations || []).map((education) => ({
              id: education.id,
              qualification_en: education.qualification_en || "",
              qualification_mr: education.qualification_mr || "",
              qualification_hi: education.qualification_hi || "",
              sort_order: education.sort_order ?? 0,
            })),
            age_criteria_type: post.age_criteria_type || "",
            age_min: post.age_min ?? null,
            age_max: post.age_max ?? null,
            age_as_on_date: getDate(post.age_as_on_date) || "",
            eligible_dob_from: getDate(post.eligible_dob_from) || "",
            eligible_dob_to: getDate(post.eligible_dob_to) || "",
            age_limit_note_en: post.age_limit_note_en || "",
            age_limit_note_mr: post.age_limit_note_mr || "",
            age_limit_note_hi: post.age_limit_note_hi || "",
            sort_order: post.sort_order ?? 0,
            fees: (post.fees || []).map((fee) => ({
              id: fee.id,
              category_name_en: fee.category_name_en || "",
              category_name_mr: fee.category_name_mr || "",
              category_name_hi: fee.category_name_hi || "",
              fee_amount: String(fee.fee_amount ?? ""),
              fee_note_en: fee.fee_note_en || "",
              fee_note_mr: fee.fee_note_mr || "",
              fee_note_hi: fee.fee_note_hi || "",
              sort_order: fee.sort_order ?? 0,
            })),
          })),
        }
      : undefined,
  };
}

type PaginatedResponse<T> = {
  results?: T[];
  next?: string | null;
};

async function fetchList<T>(url: string, signal: AbortSignal): Promise<T[]> {
  const results: T[] = [];
  const visited = new Set<string>();
  const apiOrigin = new URL(url).origin;
  let nextUrl: string | null = url;

  while (nextUrl) {
    if (visited.has(nextUrl)) {
      throw new Error("Pagination returned a repeated URL.");
    }
    visited.add(nextUrl);

    const response: Response = await authenticatedFetch(nextUrl, { signal });
    if (!response.ok) {
      throw new Error(`Request failed (${response.status}): ${nextUrl}`);
    }

    const payload: T[] | PaginatedResponse<T> = (await response.json()) as
      | T[]
      | PaginatedResponse<T>;

    if (Array.isArray(payload)) {
      results.push(...payload);
      break;
    }

    results.push(...(payload.results ?? []));
    if (!payload.next) {
      nextUrl = null;
      continue;
    }

    const resolvedNext: URL = new URL(payload.next, url);
    if (resolvedNext.origin !== apiOrigin) {
      throw new Error("Pagination returned a URL outside the portal API.");
    }
    nextUrl = resolvedNext.toString();
  }

  return results;
}

async function loadPortalData(signal: AbortSignal): Promise<PortalData> {
  const contentKinds: { endpoint: string; type: ItemType }[] = [
    { endpoint: "jobs", type: "job" },
    { endpoint: "schemes", type: "scheme" },
    { endpoint: "examination", type: "examination" },
    { endpoint: "admit-card", type: "admit" },
    { endpoint: "results", type: "result" },
    { endpoint: "articles", type: "guide" },
    { endpoint: "videos", type: "video" },
    { endpoint: "tools", type: "tool" },
  ];

  const responses = await Promise.allSettled(
    contentKinds.map(({ endpoint }) =>
      fetchList<ApiPost>(getPortalApiUrl(`content/${endpoint}/`), signal),
    ),
  );

  if (responses.every((response) => response.status === "rejected")) {
    const firstError = responses.find(
      (response): response is PromiseRejectedResult =>
        response.status === "rejected",
    );
    throw firstError?.reason || new Error("Unable to load portal content.");
  }

  const items: Item[] = [];
  const videos: Video[] = [];
  const errors: string[] = [];

  responses.forEach((response, index) => {
    const { type } = contentKinds[index];

    if (response.status === "rejected") {
      if (!signal.aborted) {
        errors.push(
          `${contentKinds[index].endpoint}: ${String(response.reason)}`,
        );
      }
      return;
    }

    response.value.forEach((post) => {
      const item = mapPost(post, type);

      if (type === "video") {
        videos.push({
          id: item.id,
          slug: item.slug,
          title: item.title,
          title_en: item.title_en || "",
          title_mr: item.title_mr || "",
          title_hi: item.title_hi || "",
          url: post.video_details?.video_url || item.link,
          thumbnail: post.video_details?.thumbnail_url || item.image || "",
          language: post.video_details?.available_languages?.join(", ") || "",
          views_count: item.views_count,
          date: item.date,
          published_at: post.published_at || "",
        });
      }

      items.push(item);
    });
  });

  return {
    items: items.sort((a, b) => b.date.localeCompare(a.date)),
    videos,
    loading: false,
    error: errors.join("\n"),
  };
}

type PortalDataContextValue = {
  data: PortalData;
  refresh: () => Promise<void>;
};

const PortalDataContext = createContext<PortalDataContextValue | null>(null);

export function PortalDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PortalData>(emptyData);

  useEffect(() => {
    const controller = new AbortController();

    loadPortalData(controller.signal)
      .then(setData)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setData({
            items: [],
            videos: [],
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Unable to load portal content.",
          });
        }
      });

    return () => controller.abort();
  }, []);

  async function refresh() {
    const controller = new AbortController();
    setData((current) => ({ ...current, loading: true, error: "" }));

    try {
      setData(await loadPortalData(controller.signal));
    } catch (error) {
      setData((current) => ({
        ...current,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load portal content.",
      }));
    }
  }

  return (
    <PortalDataContext.Provider value={{ data, refresh }}>
      {children}
    </PortalDataContext.Provider>
  );
}

export function usePortalData() {
  const context = useContext(PortalDataContext);
  if (!context) {
    throw new Error("usePortalData must be used inside PortalDataProvider");
  }
  return context;
}
