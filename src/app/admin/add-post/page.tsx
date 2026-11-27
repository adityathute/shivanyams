// File Location: shivanyams/src/app/admin/add-post/page.tsx
/*
 * Reference Repositories:
 * shivanya-sdk v1.0.0 (branch sdk-v2)
 * shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: e449bbc50dcf4b464c2ae1f7aa23890e4bc9da1d
 * Both repositories are read-only references.
 */
// Cleanup Status: Clean
// Cleanup Info: Admin guard and route rendering reviewed; no safe simplification needed.
// UI Components: 1 JSX component (PostEditor, app-local)
// SDK UI Components used: 0 direct
// Custom UI Components: 1 (PostEditor reference)
// CSS Selectors: 0 in this file
// Cleanup: Admin guard and route rendering retained; SDK UI inventory checked, no route-level control UI to replace.

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
import PostEditor from "../../../components/admin/PostEditor";

export default function AddPostPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAdmin = user?.roles?.includes("admin") === true;

  useEffect(() => {
    if (!loading && !isAdmin) router.replace("/");
  }, [loading, isAdmin, router]);

  if (loading || !isAdmin) return null;
  return <PostEditor />;
}
