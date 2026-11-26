"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
import styles from "./shop-hisab.module.css";

export default function ShopHisabPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAdmin = user?.roles?.includes("admin") === true;

  useEffect(() => {
    if (!loading && !isAdmin) router.replace("/");
  }, [loading, isAdmin, router]);

  if (loading || !isAdmin) {
    return (
      <main className={styles.page}>
        <div className={styles.loading}>Loading Shop Hisab…</div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>SHIVANYA MULTISERVICES</p>
          <h1>Shop Hisab</h1>
          <p className={styles.subtitle}>
            A simple place to track shop income and expenses across both counters.
          </p>
        </div>
        <span className={styles.status}>Setup</span>
      </header>

      <section className={styles.summary} aria-label="Financial summary">
        <article className={styles.card}>
          <span>Income</span>
          <strong>—</strong>
          <small>Recorded transactions</small>
        </article>
        <article className={styles.card}>
          <span>Expenses</span>
          <strong>—</strong>
          <small>Recorded transactions</small>
        </article>
        <article className={styles.card}>
          <span>Net</span>
          <strong>—</strong>
          <small>Income minus expenses</small>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelIcon}>₹</div>
        <div>
          <h2>Your shop ledger starts here</h2>
          <p>
            The next step is connecting transaction entry and storage, with support
            for the Main Shop, SBI CSP, and expenses shared by both counters.
          </p>
        </div>
      </section>
    </main>
  );
}
