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
