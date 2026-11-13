"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";

import {
  categoriesApi,
  getCategoryTitle,
  type Category,
} from "../../../components/portal/CategoryGrid";

import type { ItemType } from "../../../components/portal/portal-data";

import "./AddPostPage.css";

type Item = {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  link: string;
  type: ItemType;
};

type Data = {
  items: Item[];
  videos: {
    id: string;
    title: string;
    url: string;
    thumbnail: string;
    language: string;
  }[];
};

const KEY = "shivanyams-portal-data";

const categoryTypeBySlug: Record<string, ItemType> = {
  jobs: "job",
  schemes: "scheme",
  examination: "examination",
  exam: "exam",
  results: "result",
  "admit-cards": "admit",
  "admit-card": "admit",
  guides: "guide",
};

function normalizeSlug(slug: string) {
  return slug.trim().toLowerCase().replace(/[_\s]+/g, "-");
}

const emptyItem = {
  title: "",
  category: "",
  date: new Date().toISOString().slice(0, 10),
  description: "",
  link: "",
  type: "job" as ItemType,
};

export default function AddPostPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const isAdmin = user?.roles?.includes("admin") === true;

  const [item, setItem] = useState(emptyItem);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/");
    }
  }, [loading, isAdmin, router]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const response = await fetch(categoriesApi, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Category request failed: ${response.status}`);
        }

        const payload: Category[] | { results?: Category[] } =
          await response.json();

        const result = Array.isArray(payload)
          ? payload
          : payload.results ?? [];

        setCategories(
          result.filter(
            (category) =>
              category.active &&
              categoryTypeBySlug[normalizeSlug(category.slug)],
          ),
        );
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Category loading failed:", error);
          setNotice("Unable to load categories.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setCategoriesLoading(false);
        }
      }
    }

    loadCategories();

    return () => controller.abort();
  }, []);

  function submitPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const saved = localStorage.getItem(KEY);
    const data: Data = saved
      ? JSON.parse(saved)
      : { items: [], videos: [] };

    const newItem: Item = {
      ...item,
      id: crypto.randomUUID(),
    };

    const nextData = {
      ...data,
      items: [newItem, ...data.items],
    };

    localStorage.setItem(KEY, JSON.stringify(nextData));

    window.dispatchEvent(new Event("shivanyams-content-updated"));

    setNotice("Post successfully saved.");
    setItem(emptyItem);
  }

  if (loading || !isAdmin) return null;

  return (
    <main className="add-post-page">
      <div className="add-post-container">
        <div className="add-post-intro">
          <span>CONTENT MANAGEMENT</span>
          <h1>Add New Post</h1>
          <p>Create a new post for your ShivanyaMS website.</p>
        </div>

        <section className="add-post-card">
          {notice && <div className="add-post-notice">{notice}</div>}

          <form className="add-post-form" onSubmit={submitPost}>
            <h2>Post Information</h2>

            <label>
              Post Title *
              <input
                required
                value={item.title}
                onChange={(event) =>
                  setItem({ ...item, title: event.target.value })
                }
                placeholder="Enter post title"
              />
            </label>

            <div className="add-post-pair">
              <label>
                Category *
                <select
                  required
                  value={item.type}
                  disabled={categoriesLoading || categories.length === 0}
                  onChange={(event) => {
                    const type = event.target.value as ItemType;
                    const selected = categories.find(
                      (category) =>
                        categoryTypeBySlug[normalizeSlug(category.slug)] ===
                        type,
                    );

                    setItem({
                      ...item,
                      type,
                      category: selected
                        ? getCategoryTitle(selected, "mr")
                        : "",
                    });
                  }}
                >
                  {categoriesLoading ? (
                    <option value="">Loading categories...</option>
                  ) : categories.length === 0 ? (
                    <option value="">No categories available</option>
                  ) : (
                    categories.map((category) => {
                      const type =
                        categoryTypeBySlug[normalizeSlug(category.slug)];

                      return (
                        <option key={category.id} value={type}>
                          {getCategoryTitle(category, "mr")}
                        </option>
                      );
                    })
                  )}
                </select>
              </label>

              <label>
                Publication Date
                <input
                  type="date"
                  value={item.date}
                  onChange={(event) =>
                    setItem({ ...item, date: event.target.value })
                  }
                />
              </label>
            </div>

            <label>
              Short Description
              <textarea
                rows={4}
                value={item.description}
                onChange={(event) =>
                  setItem({ ...item, description: event.target.value })
                }
                placeholder="Enter a short description"
              />
            </label>

            <label>
              Official / Information Link
              <input
                type="url"
                value={item.link}
                onChange={(event) =>
                  setItem({ ...item, link: event.target.value })
                }
                placeholder="https://example.gov.in"
              />
            </label>

            <div className="add-post-actions">
              <button type="button" onClick={() => router.push("/admin")}>
                Cancel
              </button>

              <button
                className="primary"
                type="submit"
                disabled={categoriesLoading || categories.length === 0}
              >
                Publish Post
              </button>
            </div>
          </form>
        </section>
      </div>

      <footer className="add-post-footer">
        ShivanyaMS · Content Administration
      </footer>
    </main>
  );
}