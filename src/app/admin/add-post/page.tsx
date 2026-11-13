"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";

import {
  API_URL,
  getCategoryTitle,
  type Category,
  type Language,
} from "../../../components/portal/CategoryGrid";

import "./AddPostPage.css";

type JobDate = { label: string; date: string };
type JobLink = { label: string; url: string };

type JobForm = {
  title: string;
  slug: string;
  advertisement_no: string;
  total_posts: string;
  examination_name: string;
  post_details: string;
  educational_qualification: string;
  location: string;
  age_limit: string;
  application_fee: string;
  application_mode: string;
  interview_venue: string;
  description: string;
  apply_url: string;
  deadline: string;
  important_dates: JobDate[];
  important_links: JobLink[];
};

const emptyJob: JobForm = {
  title: "",
  slug: "",
  advertisement_no: "",
  total_posts: "",
  examination_name: "",
  post_details: "",
  educational_qualification: "",
  location: "",
  age_limit: "",
  application_fee: "",
  application_mode: "",
  interview_venue: "",
  description: "",
  apply_url: "",
  deadline: "",
  important_dates: [],
  important_links: [],
};

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

function getAccessToken() {
  const storageKeys = Object.keys(window.localStorage);

  for (const key of storageKeys) {
    if (!/token/i.test(key)) continue;

    const raw = window.localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      const token =
        parsed?.access_token ||
        parsed?.accessToken ||
        parsed?.token ||
        parsed?.state?.accessToken ||
        parsed?.state?.access_token;
      if (typeof token === "string" && token) return token;
    } catch {
      if (raw.split(".").length === 3) return raw;
    }
  }

  return "";
}

export default function AddPostPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const language: Language = "mr";

  const isAdmin = user?.roles?.includes("admin") === true;

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryId, setCategoryId] = useState("");
  const [job, setJob] = useState<JobForm>(emptyJob);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const jobsCategory = useMemo(
    () => categories.find((category) => category.slug === "jobs"),
    [categories],
  );

  useEffect(() => {
    if (!loading && !isAdmin) router.replace("/");
  }, [loading, isAdmin, router]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const response = await fetch(`${API_URL}/categories/`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unable to load categories.");

        const payload = await response.json();
        const list: Category[] = Array.isArray(payload)
          ? payload
          : payload.results ?? [];

        setCategories(list.filter((category) => category.active));
      } catch (error) {
        if (!controller.signal.aborted) {
          setNotice(error instanceof Error ? error.message : "Unable to load categories.");
        }
      } finally {
        if (!controller.signal.aborted) setCategoriesLoading(false);
      }
    }

    loadCategories();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (jobsCategory) setCategoryId(String(jobsCategory.id));
  }, [jobsCategory]);

  function update<K extends keyof JobForm>(key: K, value: JobForm[K]) {
    setJob((current) => ({ ...current, [key]: value }));
  }

  function addDate() {
    update("important_dates", [...job.important_dates, { label: "", date: "" }]);
  }

  function addLink() {
    update("important_links", [...job.important_links, { label: "", url: "" }]);
  }

  async function submitPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    const token = getAccessToken();
    if (!token) {
      setNotice("Your login token was not found. Please sign in again.");
      return;
    }

    if (!categoryId) {
      setNotice("The Jobs category is not available in the backend.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/admin/jobs/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...job,
          slug: job.slug || slugify(job.title),
          category: Number(categoryId),
          total_posts: job.total_posts ? Number(job.total_posts) : null,
          employment_type: "full_time",
          country: "India",
          remote: false,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.detail || "Unable to publish the job.");
      }

      setNotice("Job saved successfully.");
      setJob(emptyJob);
      router.push("/admin");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to publish the job.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !isAdmin) return null;

  const text = (category: Category) =>
    getCategoryTitle(category, language as Language);

  return (
    <main className="add-post-page">
      <div className="add-post-container">
        <div className="add-post-intro">
          <span>CONTENT MANAGEMENT</span>
          <h1>Add New Post</h1>
          <p>Create a government job advertisement using backend-managed categories.</p>
        </div>

        <section className="add-post-card">
          {notice && <div className="add-post-notice">{notice}</div>}

          <form className="add-post-form" onSubmit={submitPost}>
            <h2>Post Information</h2>

            <label>
              Category *
              <select
                required
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                disabled={categoriesLoading}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {text(category)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Post Title *
              <input required value={job.title} onChange={(event) => update("title", event.target.value)} />
            </label>

            <label>
              Advertisement No.
              <input value={job.advertisement_no} onChange={(event) => update("advertisement_no", event.target.value)} />
            </label>

            <label>
              Total Posts
              <input type="number" min="0" value={job.total_posts} onChange={(event) => update("total_posts", event.target.value)} />
            </label>

            <label>
              Name of the Examination
              <input value={job.examination_name} onChange={(event) => update("examination_name", event.target.value)} />
            </label>

            <label>
              Name of the Post & Details
              <textarea rows={4} value={job.post_details} onChange={(event) => update("post_details", event.target.value)} />
            </label>

            <label>
              Educational Qualification
              <textarea rows={4} value={job.educational_qualification} onChange={(event) => update("educational_qualification", event.target.value)} />
            </label>

            <label>
              Job Location
              <input value={job.location} onChange={(event) => update("location", event.target.value)} />
            </label>

            <label>
              Age Limit
              <input value={job.age_limit} onChange={(event) => update("age_limit", event.target.value)} />
            </label>

            <label>
              Fee
              <input value={job.application_fee} onChange={(event) => update("application_fee", event.target.value)} />
            </label>

            <label>
              Application Mode
              <input value={job.application_mode} onChange={(event) => update("application_mode", event.target.value)} />
            </label>

            <label>
              Venue of Interview
              <textarea rows={3} value={job.interview_venue} onChange={(event) => update("interview_venue", event.target.value)} />
            </label>

            <div className="add-post-dynamic-heading">
              <h3>Important Dates</h3>
              <button type="button" onClick={addDate}>Add Date</button>
            </div>

            {job.important_dates.map((entry, index) => (
              <div className="add-post-pair" key={index}>
                <label>
                  Date Label
                  <input value={entry.label} onChange={(event) => update("important_dates", job.important_dates.map((item, i) => i === index ? { ...item, label: event.target.value } : item))} />
                </label>
                <label>
                  Date
                  <input type="date" value={entry.date} onChange={(event) => update("important_dates", job.important_dates.map((item, i) => i === index ? { ...item, date: event.target.value } : item))} />
                </label>
              </div>
            ))}

            <div className="add-post-dynamic-heading">
              <h3>Important Links</h3>
              <button type="button" onClick={addLink}>Add Link</button>
            </div>

            {job.important_links.map((entry, index) => (
              <div className="add-post-pair" key={index}>
                <label>
                  Link Label
                  <input value={entry.label} onChange={(event) => update("important_links", job.important_links.map((item, i) => i === index ? { ...item, label: event.target.value } : item))} />
                </label>
                <label>
                  URL
                  <input type="url" value={entry.url} onChange={(event) => update("important_links", job.important_links.map((item, i) => i === index ? { ...item, url: event.target.value } : item))} />
                </label>
              </div>
            ))}

            <label>
              Short Description *
              <textarea required rows={4} value={job.description} onChange={(event) => update("description", event.target.value)} />
            </label>

            <label>
              Application / Official Link
              <input type="url" value={job.apply_url} onChange={(event) => update("apply_url", event.target.value)} />
            </label>

            <label>
              Application Last Date
              <input type="date" value={job.deadline} onChange={(event) => update("deadline", event.target.value)} />
            </label>

            <div className="add-post-actions">
              <button type="button" onClick={() => router.push("/admin")}>Cancel</button>
              <button className="primary" type="submit" disabled={saving || categoriesLoading || !categories.length}>
                {saving ? "Publishing..." : "Publish Post"}
              </button>
            </div>
          </form>
        </section>
      </div>

      <footer className="add-post-footer">ShivanyaMS · Content Administration</footer>
    </main>
  );
}
