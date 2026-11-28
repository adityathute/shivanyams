import type { ApiPost, Item, ItemType } from "../components/portal/data/portal-data";

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

function createPostSearchIndex(value: unknown): string {
  const searchableValues: string[] = [];
  const visit = (entry: unknown, depth = 0) => {
    if (entry == null || depth > 8) return;
    if (typeof entry === "string" || typeof entry === "number") {
      searchableValues.push(String(entry));
      return;
    }
    if (Array.isArray(entry)) {
      entry.forEach((child) => visit(child, depth + 1));
      return;
    }
    if (typeof entry === "object") {
      Object.entries(entry as Record<string, unknown>).forEach(([key, child]) => {
        searchableValues.push(key.replace(/_/g, " "));
        visit(child, depth + 1);
      });
    }
  };

  visit(value);
  return searchableValues.join(" ");
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
    search_index: createPostSearchIndex(post),
    related_posts: post.related_posts || [],

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
    comments_enabled: post.comments_enabled !== false,

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
    state: post.state || "",
    country: post.country || "India",
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
    required_documents: (post.required_documents || []).filter((row) => row.is_active !== false),
    photo_requirements: (post.photo_requirements || []).filter((row) => row.is_active !== false),
    signature_requirements: (post.signature_requirements || []).filter((row) => row.is_active !== false),

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
