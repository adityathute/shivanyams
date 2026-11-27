// File: src/app/admin/edit-post/[kind]/[slug]/page.tsx
// Cleanup Status: Clean
// Cleanup Info: Route authorization and editor parameter forwarding reviewed; no redundant code found.
// UI Components: 1 JSX component (PostEditor, app-local)
// SDK UI Components used: 0 direct
// Custom UI Components: 1 (PostEditor reference)
// CSS Selectors: 0 in this file
// Cleanup: Existing editor reuse and route authorization retained; no duplicate editor UI.

"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
import PostEditor from "../../../../../components/admin/PostEditor";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams<{ kind: string; slug: string }>();
  const { user, loading } = useAuth();
  const isAdmin = user?.roles?.includes("admin") === true;

  useEffect(() => {
    if (!loading && !isAdmin) router.replace("/");
  }, [loading, isAdmin, router]);

  if (loading || !isAdmin) return null;
  return <PostEditor initialKind={params.kind} editSlug={params.slug} />;
}
