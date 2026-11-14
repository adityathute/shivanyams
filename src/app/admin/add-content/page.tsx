"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
import { API_URL } from "../../../components/portal/category/CategoryGrid";
import { getAccessToken, slugify } from "../admin-utils";

import "../add-post/AddPostPage.css";

type ContentKind = "scheme" | "update" | "result" | "admit_card" | "guide" | "video";
type ContentForm = {
  kind: ContentKind; title: string; slug: string; summary: string; body: string;
  organization: string; location: string; start_date: string; end_date: string;
  event_date: string; source_url: string; image_url: string; extra: string;
};

const initialForm: ContentForm = {
  kind: "scheme", title: "", slug: "", summary: "", body: "", organization: "",
  location: "", start_date: "", end_date: "", event_date: "", source_url: "",
  image_url: "", extra: "{}",
};

const contentKinds: { value: ContentKind; label: string }[] = [
  { value: "scheme", label: "Government Schemes" },
  { value: "update", label: "Examination" },
  { value: "result", label: "Results" },
  { value: "admit_card", label: "Admit Cards" },
  { value: "guide", label: "Articles & Guides" },
  { value: "video", label: "Videos" },
];

export default function AddContentPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAdmin = user?.roles?.includes("admin") === true;
  const [form, setForm] = useState<ContentForm>(initialForm);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) router.replace("/");
  }, [loading, isAdmin, router]);

  function update<K extends keyof ContentForm>(key: K, value: ContentForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submitContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    const token = getAccessToken();
    if (!token) {
      setNotice("Your login token was not found. Please sign in again.");
      return;
    }

    let extra: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(form.extra || "{}");
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Extra data must be a JSON object.");
      }
      extra = parsed as Record<string, unknown>;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Enter valid JSON for extra data.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(API_URL + "/admin/content/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({
          kind: form.kind, title: form.title, slug: form.slug || slugify(form.title),
          summary: form.summary, body: form.body, organization: form.organization,
          location: form.location, start_date: form.start_date || null,
          end_date: form.end_date || null, event_date: form.event_date || null,
          source_url: form.source_url, image_url: form.image_url, extra,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Unable to publish content.");
      router.push("/admin");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to publish content.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !isAdmin) return null;

  return (
    <main className="add-post-page">
      <div className="add-post-container">
        <div className="add-post-intro">
          <span>CONTENT MANAGEMENT</span>
          <h1>Add New Content</h1>
          <p>Create and publish schemes, examinations, results, admit cards, guides and videos.</p>
        </div>
        <section className="add-post-card">
          {notice && <div className="add-post-notice">{notice}</div>}
          <form className="add-post-form" onSubmit={submitContent}>
            <h2>Content Information</h2>
            <label>
              Content Category *
              <select required value={form.kind} onChange={(event) => update("kind", event.target.value as ContentKind)}>
                {contentKinds.map((kind) => <option key={kind.value} value={kind.value}>{kind.label}</option>)}
              </select>
            </label>
            <label>Title *<input required value={form.title} onChange={(event) => update("title", event.target.value)} /></label>
            <label>Slug<input value={form.slug} onChange={(event) => update("slug", event.target.value)} placeholder="Generated from title when empty" /></label>
            <label>Short Description<textarea rows={3} value={form.summary} onChange={(event) => update("summary", event.target.value)} /></label>
            <label>Full Content<textarea rows={9} value={form.body} onChange={(event) => update("body", event.target.value)} /></label>
            <div className="add-post-pair">
              <label>Organization<input value={form.organization} onChange={(event) => update("organization", event.target.value)} /></label>
              <label>Location<input value={form.location} onChange={(event) => update("location", event.target.value)} /></label>
            </div>
            <div className="add-post-pair">
              <label>Start Date<input type="date" value={form.start_date} onChange={(event) => update("start_date", event.target.value)} /></label>
              <label>End Date<input type="date" value={form.end_date} onChange={(event) => update("end_date", event.target.value)} /></label>
            </div>
            <label>Event Date<input type="date" value={form.event_date} onChange={(event) => update("event_date", event.target.value)} /></label>
            <label>Official / Video URL<input type="url" value={form.source_url} onChange={(event) => update("source_url", event.target.value)} /></label>
            <label>Image / Thumbnail URL<input type="url" value={form.image_url} onChange={(event) => update("image_url", event.target.value)} /></label>
            <label>Extra Data (JSON)<textarea rows={4} value={form.extra} onChange={(event) => update("extra", event.target.value)} /></label>
            <div className="add-post-actions">
              <button type="button" onClick={() => router.push("/admin")}>Cancel</button>
              <button className="primary" type="submit" disabled={saving}>{saving ? "Publishing..." : "Publish Content"}</button>
            </div>
          </form>
        </section>
      </div>
      <footer className="add-post-footer">ShivanyaMS · Content Administration</footer>
    </main>
  );
}
