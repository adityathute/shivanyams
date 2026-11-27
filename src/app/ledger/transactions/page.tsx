/* File Location: shivanyams/src/app/ledger/transactions/page.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 73e6818f3dbf916f0b5ecd3301c6df771fa88a6d
 * Both repositories are read-only references.
 */
// Cleanup Status: Cleanup Pending
// Cleanup Info: UI: transaction totals, date/counter/type filters and entry list; native buttons/inputs/selects. SDK candidates Button, Input, Select, Card not integrated. Uses shared ledger.module.css; browser-local data and backend persistence pending.

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
import styles from "../ledger.module.css";

type Entry = { id: string; type: "income" | "expense"; counter: "main" | "csp" | "shared"; amount: number; category: string; note: string; accountId: string; date: string; createdAt: number };
type Account = { id: string; name: string };
const STORAGE_KEY = "shivanyams-ledger-v1";
const today = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const money = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
const counterNames = { main: "Main Shop", csp: "SBI CSP", shared: "Shared" };

export default function LedgerTransactionsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAdmin = user?.roles?.includes("admin") === true;
  const [entries, setEntries] = useState<Entry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [ready, setReady] = useState(false);
  const [date, setDate] = useState(today());
  const [counter, setCounter] = useState("all");
  const [type, setType] = useState("all");
  useEffect(() => { if (!loading && !isAdmin) router.replace("/"); }, [loading, isAdmin, router]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { const data = JSON.parse(raw); if (Array.isArray(data.entries)) setEntries(data.entries); if (Array.isArray(data.accounts)) setAccounts(data.accounts); }
    } catch { /* Keep an empty transaction view if preview data is invalid. */ }
    setReady(true);
  }, []);
  const filtered = useMemo(() => [...entries].filter((entry) => !date || entry.date === date).filter((entry) => counter === "all" || entry.counter === counter).filter((entry) => type === "all" || entry.type === type).sort((a, b) => b.createdAt - a.createdAt), [entries, date, counter, type]);
  const income = filtered.filter((entry) => entry.type === "income").reduce((sum, entry) => sum + entry.amount, 0);
  const expenses = filtered.filter((entry) => entry.type === "expense").reduce((sum, entry) => sum + entry.amount, 0);
  if (loading || !isAdmin || !ready) return <main className={styles.page}><div className={styles.loading}>Loading transactions…</div></main>;
  return <main className={styles.page}>
    <div className={styles.subPageTop}><button className={styles.backButton} onClick={() => router.push("/ledger")}>← Ledger home</button><span className={styles.eyebrow}>LEDGER · ACTIVITY</span></div>
    <div className={styles.subPageHeading}><div className={styles.eyebrow}>MONEY IN AND OUT</div><h1>Transactions</h1><p>Review and filter every recorded entry.</p></div>
    <section className={styles.transactionTotals}><article><span>Income</span><strong className={styles.incomeValue}>{money(income)}</strong></article><article><span>Expenses</span><strong className={styles.expenseValue}>{money(expenses)}</strong></article><article><span>Net</span><strong>{money(income - expenses)}</strong></article></section>
    <section className={styles.workspace}>
      <div className={styles.transactionFilters}>
        <label><span>Date</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        <label><span>Counter</span><select value={counter} onChange={(event) => setCounter(event.target.value)}><option value="all">All counters</option><option value="main">Main Shop</option><option value="csp">SBI CSP</option><option value="shared">Shared</option></select></label>
        <label><span>Type</span><select value={type} onChange={(event) => setType(event.target.value)}><option value="all">All types</option><option value="income">Income</option><option value="expense">Expenses</option></select></label>
        <button className={styles.clearFiltersButton} onClick={() => { setDate(""); setCounter("all"); setType("all"); }}>Clear filters</button>
      </div>
      <div className={styles.listHeader}><div><h2>All entries</h2><p>{filtered.length} {filtered.length === 1 ? "transaction" : "transactions"} found</p></div></div>
      {filtered.length === 0 ? <div className={styles.emptyState}><div className={styles.emptyIcon}>₹</div><h3>No transactions found</h3><p>Try changing the date or filters, or add a new entry from the Ledger home page.</p><button className={styles.primaryButton} onClick={() => router.push("/ledger")}>Back to Ledger</button></div> : <div className={styles.entryList}>{filtered.map((entry) => <article className={styles.entry} key={entry.id}><div className={styles.entryIcon + " " + (entry.type === "income" ? styles.entryIncome : styles.entryExpense)}>{entry.type === "income" ? "↙" : "↗"}</div><div className={styles.entryDetails}><strong>{entry.category}</strong><span>{entry.note || counterNames[entry.counter]} · {accounts.find((account) => account.id === entry.accountId)?.name || "Account"}</span><small>{counterNames[entry.counter]} · {entry.date}</small></div><strong className={styles.entryAmount + " " + (entry.type === "income" ? styles.incomeValue : styles.expenseValue)}>{entry.type === "income" ? "+" : "−"}{money(entry.amount)}</strong></article>)}</div>}
    </section>
    <p className={styles.localNotice}>This view reads the Ledger preview data saved in this browser. Backend database syncing is a separate next step.</p>
  </main>;
}
