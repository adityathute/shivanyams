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
