"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { API_URL, type Category } from "../portal/category/CategoryGrid";
import { getAccessToken, slugify } from "../../app/admin/admin-utils";
import "./PostEditor.css";

type ContentKind = { slug: string; label: string; api: string; detailKey: string };
type LinkInput = { name_en: string; name_mr: string; name_hi: string; url: string; sort_order: number; is_active: boolean };
type DateInput = { date_type: string; label_en: string; label_mr: string; label_hi: string; date: string; description_en: string; description_mr: string; description_hi: string; sort_order: number };

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
  { slug: "schemes", label: "Schemes", api: "schemes", detailKey: "scheme_details" },
  { slug: "examination", label: "Examination", api: "examination", detailKey: "examination_details" },
  { slug: "admit-cards", label: "Admit Cards", api: "admit-card", detailKey: "admit_card_details" },
  { slug: "results", label: "Results", api: "results", detailKey: "result_details" },
  { slug: "articles-guides", label: "Articles & Guides", api: "articles", detailKey: "article_guide_details" },
  { slug: "videos", label: "Videos", api: "videos", detailKey: "video_details" },
  { slug: "tools", label: "Tools", api: "tools", detailKey: "tool_details" },
];

const DETAIL_OPTIONS: Record<string, string[]> = {
  recruitment_type: ["regular", "contract", "apprenticeship", "temporary", "deputation", "other"],
  application_mode: ["online", "offline", "both", "not_applicable", "not_required"],
  scheme_type: ["central", "state", "district", "education", "farmer", "employment", "health", "financial", "other"],
  exam_type: ["recruitment", "entrance", "departmental", "competitive", "other"],
  exam_mode: ["online", "offline", "both", "other"],
  result_type: ["written", "final", "merit_list", "cut_off", "answer_key", "scorecard", "other"],
  article_type: ["article", "how_to", "career", "preparation", "information", "other"],
  provider: ["youtube", "vimeo", "self_hosted", "other"],
  tool_type: ["calculator", "checker", "converter", "generator", "other"],
};

const EMPTY = {
  title_en: "", title_mr: "", title_hi: "", slug: "",
  summary_en: "", summary_mr: "", summary_hi: "",
  body_en: "", body_mr: "", body_hi: "",
  location: "", state: "", country: "India", featured_image_url: "",
  start_date: "", end_date: "", event_date: "", default_language: "en",
  meta_title_en: "", meta_description_en: "", meta_keywords: "",
  comments_enabled: true, reactions_enabled: true, is_featured: false, is_active: true,
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
  const [importantLinks, setImportantLinks] = useState<LinkInput[]>([]);
  const [importantDates, setImportantDates] = useState<DateInput[]>([]);

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
        setImportantLinks(record.important_links || []);
        setImportantDates((record.important_dates || []).map((item) => ({ ...item, date: item.date || "" })));
        const data = record[detailKeyFor(kind.api) as keyof PostRecord] as Record<string, unknown> | null;
        const template = data || detailTemplate(kind.api);
        setDetails(template);

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

  }

  function updateDetail(key: string, value: unknown) {
    setDetails((current) => ({ ...current, [key]: value }));
  }

  function detailLabel(key: string) {
    return key.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
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
        [kind.detailKey]: details,
        important_links: importantLinks.filter((item) => item.name_en.trim() && item.url.trim()),
        important_dates: importantDates.filter((item) => item.label_en.trim()).map((item) => ({ ...item, date: item.date || null })),
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
            <div className="post-editor-section-heading"><h2>Important Dates</h2><button type="button" onClick={() => setImportantDates((items) => [...items, { date_type: "other", label_en: "", label_mr: "", label_hi: "", date: "", description_en: "", description_mr: "", description_hi: "", sort_order: items.length }])}>＋ Add date</button></div>
            {importantDates.map((item, index) => <div className="post-editor-repeat-card" key={index}>
              <div className="post-editor-grid">
                <label>Date type<select value={item.date_type} onChange={(event) => setImportantDates((rows) => rows.map((row, i) => i === index ? { ...row, date_type: event.target.value } : row))}>{["application_start","application_end","fee_last_date","correction_window","exam_date","admit_card","answer_key","result","interview","other"].map((value) => <option key={value} value={value}>{detailLabel(value)}</option>)}</select></label>
                <label>Date<input type="date" value={item.date} onChange={(event) => setImportantDates((rows) => rows.map((row, i) => i === index ? { ...row, date: event.target.value } : row))} /></label>
                {(["en","mr","hi"] as const).map((lang) => <label key={lang}>Label ({lang.toUpperCase()})<input value={item[`label_${lang}`]} onChange={(event) => setImportantDates((rows) => rows.map((row, i) => i === index ? { ...row, [`label_${lang}`]: event.target.value } : row))} /></label>)}
              </div>
              <button type="button" className="post-editor-remove" onClick={() => setImportantDates((rows) => rows.filter((_, i) => i !== index))}>Remove date</button>
            </div>)}
          </section>
          <section>
            <div className="post-editor-section-heading"><h2>Important Links</h2><button type="button" onClick={() => setImportantLinks((items) => [...items, { name_en: "", name_mr: "", name_hi: "", url: "", sort_order: items.length, is_active: true }])}>＋ Add link</button></div>
            {importantLinks.map((item, index) => <div className="post-editor-repeat-card" key={index}>
              <div className="post-editor-grid">
                {(["en","mr","hi"] as const).map((lang) => <label key={lang}>Link title ({lang.toUpperCase()})<input value={item[`name_${lang}`]} onChange={(event) => setImportantLinks((rows) => rows.map((row, i) => i === index ? { ...row, [`name_${lang}`]: event.target.value } : row))} /></label>)}
                <label>URL<input type="url" value={item.url} onChange={(event) => setImportantLinks((rows) => rows.map((row, i) => i === index ? { ...row, url: event.target.value } : row))} /></label>
              </div>
              <button type="button" className="post-editor-remove" onClick={() => setImportantLinks((rows) => rows.filter((_, i) => i !== index))}>Remove link</button>
            </div>)}
          </section>
          <section>
            <h2>{kind.label} Details</h2>
            <p className="post-editor-help">Complete the fields for this content category. Optional fields can remain empty.</p>
            <div className="post-editor-grid post-editor-detail-grid">
              {Object.entries(details).map(([key, value]) => {
                const label = detailLabel(key);
                const isBoolean = typeof value === "boolean";
                const isArray = Array.isArray(value);
                const isObject = value !== null && typeof value === "object" && !isArray;
                const isNumber = typeof value === "number" || value === null && /count|minutes|marks|seconds|age_min|age_max|vacancies|duration/i.test(key);
                const isDate = /date$|_date$/.test(key);
                const isLongText = /details|description|qualification|eligibility|benefits|documents|instructions|syllabus|pattern|process|credentials|relaxation|beneficiaries|configuration/i.test(key);
                if (isBoolean) return <label className="post-editor-check" key={key}><input type="checkbox" checked={value} onChange={(event) => updateDetail(key, event.target.checked)} />{label}</label>;
                if (DETAIL_OPTIONS[key]) return <label key={key}>{label}<select value={String(value ?? "")} onChange={(event) => updateDetail(key, event.target.value)}>{DETAIL_OPTIONS[key].map((option) => <option key={option} value={option}>{detailLabel(option)}</option>)}</select></label>;
                if (isArray) return <label key={key}>{label} <input value={value.join(", ")} onChange={(event) => updateDetail(key, event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} placeholder="Comma-separated values" /></label>;
                if (isObject) return <label className="post-editor-detail-wide" key={key}>{label} <textarea rows={5} value={JSON.stringify(value, null, 2)} onChange={(event) => { try { updateDetail(key, JSON.parse(event.target.value)); } catch { /* Keep the last valid object while typing. */ } }} /></label>;
                return <label key={key}>{label}
                  {isLongText
                    ? <textarea rows={4} value={String(value ?? "")} onChange={(event) => updateDetail(key, event.target.value)} />
                    : <input
                        type={isDate ? "date" : isNumber ? "number" : /url/i.test(key) ? "url" : "text"}
                        value={value === null ? "" : String(value)}
                        onChange={(event) => updateDetail(key, isNumber ? event.target.value === "" ? null : Number(event.target.value) : event.target.value)}
                      />}
                </label>;
              })}
            </div>
          </section>
          <section>
            <h2>Post Settings</h2>
            <div className="post-editor-settings-grid">
              {([
                ["is_active", "Post is active"],
                ["is_featured", "Feature this post"],
                ["comments_enabled", "Allow comments"],
                ["reactions_enabled", "Allow likes and dislikes"],
              ] as const).map(([key, label]) => <label className="post-editor-check" key={key}><input type="checkbox" checked={form[key]} onChange={(event) => update(key, event.target.checked)} />{label}</label>)}
            </div>
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
