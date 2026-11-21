"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
import { API_URL } from "../../../../../components/portal/category/CategoryGrid";
import {
  mapPost,
  type ApiPost,
  type Item,
  type ItemType,
} from "../../../../../components/portal/data/portal-data";
import {
  PortalPostDetail,
  type CategorySlug,
} from "../../../../../components/portal/post/PortalPostDetail";
import { adminFetch } from "../../../admin-utils";

const API_KINDS: Record<string, string> = {
  jobs: "jobs",
  schemes: "schemes",
  examination: "examination",
  "admit-cards": "admit-card",
  results: "results",
  guides: "articles",
  videos: "videos",
  tools: "tools",
};

const ITEM_TYPES: Record<string, ItemType> = {
  jobs: "job",
  schemes: "scheme",
  examination: "examination",
  "admit-cards": "admit",
  results: "result",
  guides: "guide",
  videos: "video",
  tools: "tool",
};

export default function AdminPostPreviewPage() {
  const params = useParams<{ kind: string; slug: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.roles?.includes("admin") === true;
  const [previewItem, setPreviewItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      router.replace("/");
      return;
    }

    const apiKind = API_KINDS[params.kind];
    const itemType = ITEM_TYPES[params.kind];
    if (!apiKind || !itemType || !params.slug) {
      setError("This preview link is not valid.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError("");

    adminFetch(
      `${API_URL}/admin/content/${apiKind}/${encodeURIComponent(params.slug)}/`,
      { cache: "no-store", signal: controller.signal },
    )
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.detail || "Unable to load this post preview.");
        }
        return payload as ApiPost;
      })
      .then((payload) => {
        if (!controller.signal.aborted) {
          setPreviewItem(mapPost(payload, itemType));
        }
      })
      .catch((cause) => {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : "Unable to load this post preview.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [authLoading, isAdmin, params.kind, params.slug, router]);

  if (authLoading || !isAdmin) return null;

  if (loading) {
    return <main className="portal-post-detail"><div className="portal-post-loading">Loading preview...</div></main>;
  }

  if (error || !previewItem) {
    return (
      <main className="portal-post-detail">
        <div className="portal-post-detail-inner">
          <div className="portal-post-loading">{error || "This post preview is unavailable."}</div>
        </div>
      </main>
    );
  }

  return (
    <PortalPostDetail
      category={params.kind as CategorySlug}
      previewItem={previewItem}
    />
  );
}
