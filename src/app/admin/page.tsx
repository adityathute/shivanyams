
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";

import "./admin.css";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const isAdmin = user?.roles?.includes("admin") === true;

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/");
    }
  }, [loading, isAdmin, router]);

  if (loading || !isAdmin) return null;

  return (
    <main className="admin-page">
      <section className="admin-dashboard">
        <div className="admin-dashboard-content">
          <span className="admin-eyebrow">CONTENT MANAGEMENT</span>

          <h1>Welcome to Admin Panel</h1>

          <p>
            Manage your website content by creating and publishing
            new posts.
          </p>

          <Link href="/admin/add-post" className="admin-add-post-button">
            <span>+</span>
            Add New Post
          </Link>
        </div>
      </section>

      <footer className="admin-footer">
        ShivanyaMS · Content Administration
      </footer>
    </main>
  );
}
