"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
import PostEditor from "../../../components/admin/PostEditor";

export default function AddPostPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const canManageContent = user?.roles?.some((role) => ["admin", "editor", "content_editor", "reviewer", "content_reviewer"].includes(role)) === true;

  useEffect(() => {
    if (!loading && !canManageContent) router.replace("/");
  }, [loading, canManageContent, router]);

  if (loading || !canManageContent) return null;
  return <PostEditor />;
}
