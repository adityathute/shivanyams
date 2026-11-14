"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { API_URL, type Category } from "../portal/category/CategoryGrid";
import { getAccessToken, slugify } from "../../app/admin/admin-utils";
import "./PostEditor.css";

type ContentKind = { slug: string; label: string; api: string; detailKey: string };
type PostRecord = {
  id: number;
  slug: string;
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
  start_date?: string | null;
  end_date?: string | null;
  event_date?: string | null;
  default_language?: string;
  meta_title_en?: string;
  meta_description_en?: string;
  meta_keywords?: string[];
  category?: Category;
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
  { slug: "schemes", label: "Schemes", api: "schemes", detailKey: "scheme_details" },
  { slug: "examination", label: "Examination", api: "examination", detailKey: "examination_details" },
  { slug: "admit-cards", label: "Admit Cards", api: "admit-card", detailKey: "admit_card_details" },
  { slug: "results", label: "Results", api: "results", detailKey: "result_details" },
  { slug: "articles-guides", label: "Articles & Guides", api: "articles", detailKey: "article_guide_details" },
  { slug: "videos", label: "Videos", api: "videos", detailKey: "video_details" },
  { slug: "tools", label: "Tools", api: "tools", detailKey: "tool_details" },
];

const EMPTY = {
  title_en: "", title_mr: "", title_hi: "", slug: "",
  summary_en: "", summary_mr: "", summary_hi: "",
  body_en: "", body_mr: "", body_hi: "",
  location: "", state: "", country: "India", featured_image_url: "",
  start_date: "", end_date: "", event_date: "", default_language: "en",
  meta_title_en: "", meta_description_en: "", meta_keywords: "",
};

type FormState = typeof EMPTY;

function detailKeyFor(api: string) {
  return KINDS.find((item) => item.api === api)?.detailKey ?? "job_details";
}

function detailTemplate(api: string): Record<string, unknown> {
  if (api === "jobs") return {
    advertisement_no: "", recruitment_type: "regular", total_vacancies: null,
    department: "", designation: "", post_details: "", educational_qualification: "",
    age_min: null, age_max: null, age_limit_note: "", age_relaxation: "",
    application_fee: "", fee_payment_mode: "", pay_scale: "", pay_level: "",
    application_mode: "online", apply_url: "", apply_email: "", applications_open: true,
    selection_process: "", exam_pattern: "", syllabus: "", physical_test_details: "",
    interview_details: "", official_notification_url: "", official_website: "",
  };
  if (api === "schemes") return {
    scheme_type: "other", beneficiaries: "", eligibility: "", benefits: "",
    required_documents: "", application_mode: "online", application_url: "",
    official_website: "", helpline_number: "",
  };
  if (api === "examination") return {
    exam_type: "recruitment", exam_mode: "other", exam_name: "",
    conducting_authority: "", exam_duration_minutes: null, total_marks: null,
    passing_marks: "", negative_marking: "", exam_pattern: "", syllabus: "",
    instructions: "", official_website: "",
  };
  if (api === "admit-card") return {
    issuing_authority: "", exam_name: "", release_date: null, examination_date: null,
    download_url: "", login_url: "", official_website: "", required_credentials: "",
    download_instructions: "", important_instructions: "",
  };
  if (api === "results") return {
    result_type: "other", examination_name: "", result_date: null, result_url: "",
    merit_list_url: "", cut_off_url: "", scorecard_url: "", official_website: "",
    instructions: "",
  };
  if (api === "articles") return {
    article_type: "article", reading_time_minutes: null, source_name: "", source_url: "",
  };
  if (api === "videos") return {
    provider: "youtube", video_url: "", embed_url: "", thumbnail_url: "",
    duration_seconds: null, available_languages: ["en"],
  };
  return {
    tool_key: "", tool_type: "other", instructions_en: "",
    instructions_mr: "", instructions_hi: "", configuration: {},
    is_interactive: true,
  };
}

export default function PostEditor({ initialKind = "jobs", editSlug }: {
  initialKind?: string;
  editSlug?: string;
}) {
  const router = useRouter();
  const editing = Boolean(editSlug);
  const [categories, setCategories] = useState<Category[]>([]);
  const [kind, setKind] = useState(KINDS.find((item) => item.api === initialKind) ?? KINDS[0]);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [details, setDetails] = useState<Record<string, unknown>>(detailTemplate(initialKind));
  const [detailsText, setDetailsText] = useState(JSON.stringify(detailTemplate(initialKind), null, 2));
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const activeCategory = useMemo(() => categories.find((item) =>
    item.slug === kind.slug
  ), [categories, kind]);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(`${API_URL}/categories/`, { signal: controller.signal });
        if (!response.ok) throw new Error(`Category request failed (${response.status}).`);
        const payload = await response.json();
        const list: Category[] = Array.isArray(payload) ? payload : payload.results ?? [];
        setCategories(list.filter((item) => item.is_active ?? item.active ?? false));
      } catch (error) {
        if (!controller.signal.aborted) setNotice(error instanceof Error ? error.message : "Unable to load categories.");
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!editSlug) {
      const template = detailTemplate(kind.api);
      setDetails(template);
      setDetailsText(JSON.stringify(template, null, 2));
      return;
    }
    const controller = new AbortController();
    async function loadPost() {
      try {
        const response = await fetch(`${API_URL}/admin/content/${kind.api}/${editSlug}/`, {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.detail || `Unable to load post (${response.status}).`);
        const record = payload as PostRecord;
        setForm({
          ...EMPTY,
          title_en: record.title_en || "", title_mr: record.title_mr || "",
          title_hi: record.title_hi || "", slug: record.slug || "",
          summary_en: record.summary_en || "", summary_mr: record.summary_mr || "",
          summary_hi: record.summary_hi || "", body_en: record.body_en || "",
          body_mr: record.body_mr || "", body_hi: record.body_hi || "",
          location: record.location || "", state: record.state || "",
          country: record.country || "India", featured_image_url: record.featured_image_url || "",
          start_date: record.start_date || "", end_date: record.end_date || "",
          event_date: record.event_date || "", default_language: record.default_language || "en",
          meta_title_en: record.meta_title_en || "",
          meta_description_en: record.meta_description_en || "",
          meta_keywords: (record.meta_keywords || []).join(", "),
        });
        const data = record[detailKeyFor(kind.api) as keyof PostRecord] as Record<string, unknown> | null;
        const template = data || detailTemplate(kind.api);
        setDetails(template);
        setDetailsText(JSON.stringify(template, null, 2));
      } catch (error) {
        if (!controller.signal.aborted) setNotice(error instanceof Error ? error.message : "Unable to load post.");
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
    setDetailsText(JSON.stringify(template, null, 2));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    let parsedDetails: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(detailsText);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Category details must be a JSON object.");
      }
      parsedDetails = parsed as Record<string, unknown>;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Enter valid category details JSON.");
      return;
    }

    const token = getAccessToken();
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
        slug: form.slug || slugify(form.title_en),
        meta_keywords: form.meta_keywords.split(",").map((item) => item.trim()).filter(Boolean),
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        event_date: form.event_date || null,
        [kind.detailKey]: parsedDetails,
      };
      const url = editing
        ? `${API_URL}/admin/content/${kind.api}/${editSlug}/`
        : `${API_URL}/admin/content/${kind.api}/`;
      const response = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = result.detail || Object.entries(result).map(([key, value]) =>
          `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`
        ).join(" · ");
        throw new Error(message || `Save failed (${response.status}).`);
      }
      router.push("/admin");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to save post.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="post-editor-page"><div className="post-editor-loading">Loading post...</div></main>;

  return (
    <main className="post-editor-page">
      <div className="post-editor-shell">
        <header className="post-editor-header">
          <div><span>CONTENT MANAGEMENT</span><h1>{editing ? "Edit Post" : "Add New Post"}</h1><p>Manage multilingual content and category-specific information.</p></div>
          <button type="button" onClick={() => router.push("/admin")}>← Back to dashboard</button>
        </header>
        {notice && <div className="post-editor-notice">{notice}</div>}
        <form className="post-editor-form" onSubmit={submit}>
          <section>
            <h2>Post Information</h2>
            <label>Category
              <select value={kind.api} disabled={editing} onChange={(event) => changeKind(event.target.value)}>
                {KINDS.filter((item) => categories.some((category) => category.slug === item.slug)).map((item) =>
                  <option key={item.api} value={item.api}>{item.label}</option>
                )}
              </select>
            </label>
            <div className="post-editor-grid">
              <label>Title (English) *<input required maxLength={240} value={form.title_en} onChange={(event) => update("title_en", event.target.value)} /></label>
              <label>URL Slug<input value={form.slug} onChange={(event) => update("slug", event.target.value)} placeholder="Generated from English title" /></label>
              <label>Title (Marathi)<input value={form.title_mr} onChange={(event) => update("title_mr", event.target.value)} /></label>
              <label>Title (Hindi)<input value={form.title_hi} onChange={(event) => update("title_hi", event.target.value)} /></label>
            </div>
            <label>Short Description (English)<textarea rows={3} value={form.summary_en} onChange={(event) => update("summary_en", event.target.value)} /></label>
            <div className="post-editor-grid">
              <label>Short Description (Marathi)<textarea rows={3} value={form.summary_mr} onChange={(event) => update("summary_mr", event.target.value)} /></label>
              <label>Short Description (Hindi)<textarea rows={3} value={form.summary_hi} onChange={(event) => update("summary_hi", event.target.value)} /></label>
            </div>
            <label>Full Content (English)<textarea rows={8} value={form.body_en} onChange={(event) => update("body_en", event.target.value)} /></label>
            <div className="post-editor-grid">
              <label>Full Content (Marathi)<textarea rows={6} value={form.body_mr} onChange={(event) => update("body_mr", event.target.value)} /></label>
              <label>Full Content (Hindi)<textarea rows={6} value={form.body_hi} onChange={(event) => update("body_hi", event.target.value)} /></label>
            </div>
            <div className="post-editor-grid">
              <label>Location<input value={form.location} onChange={(event) => update("location", event.target.value)} /></label>
              <label>State<input value={form.state} onChange={(event) => update("state", event.target.value)} /></label>
              <label>Country<input value={form.country} onChange={(event) => update("country", event.target.value)} /></label>
              <label>Featured Image URL<input type="url" value={form.featured_image_url} onChange={(event) => update("featured_image_url", event.target.value)} /></label>
              <label>Start Date<input type="date" value={form.start_date} onChange={(event) => update("start_date", event.target.value)} /></label>
              <label>End Date<input type="date" value={form.end_date} onChange={(event) => update("end_date", event.target.value)} /></label>
              <label>Event Date<input type="date" value={form.event_date} onChange={(event) => update("event_date", event.target.value)} /></label>
              <label>Default Language<select value={form.default_language} onChange={(event) => update("default_language", event.target.value)}><option value="en">English</option><option value="mr">Marathi</option><option value="hi">Hindi</option></select></label>
            </div>
          </section>
          <section>
            <h2>{kind.label} Details</h2>
            <p className="post-editor-help">Category-specific fields follow the Portal API model. Keep the JSON object valid and retain required fields in the template.</p>
            <textarea className="post-editor-json" rows={18} spellCheck={false} value={detailsText} onChange={(event) => setDetailsText(event.target.value)} />
          </section>
          <section>
            <h2>Search Engine Information</h2>
            <div className="post-editor-grid">
              <label>SEO Title<input maxLength={240} value={form.meta_title_en} onChange={(event) => update("meta_title_en", event.target.value)} /></label>
              <label>SEO Description<input maxLength={320} value={form.meta_description_en} onChange={(event) => update("meta_description_en", event.target.value)} /></label>
            </div>
            <label>SEO Keywords (comma separated)<input value={form.meta_keywords} onChange={(event) => update("meta_keywords", event.target.value)} /></label>
          </section>
          <div className="post-editor-actions">
            <button type="button" onClick={() => router.push("/admin")}>Cancel</button>
            <button type="submit" disabled={saving || !activeCategory}>{saving ? "Saving..." : editing ? "Save Changes" : "Create Draft"}</button>
          </div>
        </form>
      </div>
    </main>
  );
}
