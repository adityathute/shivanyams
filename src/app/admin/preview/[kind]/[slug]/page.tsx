// File: src/app/admin/preview/[kind]/[slug]/page.tsx
// Cleanup Status: Cleanup Pending
// Cleanup Info: Route and abort handling reviewed; API payload casts and preview category mapping need a wider type-contract review.
// UI Components: 1 shared component (PortalPostDetail) plus native main/div/button/span elements
// SDK UI Components available for review: Button
// SDK UI Components currently used: 0 direct; preview banner uses native button
// Custom UI Components: 1 shared app component reference (PortalPostDetail)
// CSS Selectors: 0 defined; 3 existing class hooks referenced (portal-post-detail, portal-post-loading, admin-version-preview-banner)
// Cleanup: API payload casts and category mapping pending type-contract review; SDK button reuse can be assessed during UI refactor.

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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

type VersionPreview = {
  id: number;
  version_number: number;
  payload?: Partial<ApiPost>;
};

export default function AdminPostPreviewPage() {
  const params = useParams<{ kind: string; slug: string }>();
  const searchParams = useSearchParams();
  const versionId = searchParams.get("version");
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
    setPreviewItem(null);

    async function loadPreview() {
      try {
        const response = await adminFetch(
          `${API_URL}/admin/content/${apiKind}/${encodeURIComponent(params.slug)}/`,
          { cache: "no-store", signal: controller.signal },
        );
        const basePost = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(basePost.detail || "Unable to load this post preview.");
        }

        let post = basePost as ApiPost;
        if (versionId) {
          const postId = (basePost as { id?: number }).id;
          if (!postId) throw new Error("Unable to identify this post's version history.");

          const versionsResponse = await adminFetch(
            `${API_URL}/admin/content/${postId}/versions/`,
            { cache: "no-store", signal: controller.signal },
          );
          const versions = await versionsResponse.json().catch(() => []);
          if (!versionsResponse.ok || !Array.isArray(versions)) {
            throw new Error("Unable to load version history for this post.");
          }

          const selectedVersion = (versions as VersionPreview[]).find(
            (version) => String(version.id) === versionId,
          );
          if (!selectedVersion?.payload) {
            throw new Error("The selected version preview is unavailable.");
          }

          post = {
            ...post,
            ...selectedVersion.payload,
            id: post.id,
            slug: post.slug,
          } as ApiPost;
        }

        if (!controller.signal.aborted) {
          setPreviewItem(mapPost(post, itemType));
        }
      } catch (cause) {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : "Unable to load this post preview.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadPreview();
    return () => controller.abort();
  }, [authLoading, isAdmin, params.kind, params.slug, router, versionId]);

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
    <>
      {versionId && (
        <div className="admin-version-preview-banner">
          <span>Previewing saved version</span>
          <button type="button" onClick={() => router.back()}>Back to editor</button>
        </div>
      )}
      <PortalPostDetail
        category={params.kind as CategorySlug}
        previewItem={previewItem}
      />
    </>
  );
}
