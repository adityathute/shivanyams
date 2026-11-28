/* File Location: shivanyams/src/app/ledger/page.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 73e6818f3dbf916f0b5ecd3301c6df771fa88a6d
 * Both repositories are read-only references.
 */
// Cleanup Status: Cleanup Pending
// Cleanup Info: UI: ledger dashboard, statistics, quick actions, transaction list and entry dialog; native buttons/inputs/selects. SDK candidates Button, Input, Select, Modal, Card not integrated. Uses shared ledger.module.css; browser-local storage/backend persistence and SDK reuse review pending.

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
import styles from "./ledger.module.css";

type EntryType = "income" | "expense";
type Counter = "main" | "csp" | "shared";
type AccountKind = "cash" | "bank" | "upi";
type LedgerAccount = { id: string; name: string; kind: AccountKind; note: string; openingBalance: number; active: boolean };
type LedgerEntry = { id: string; type: EntryType; counter: Counter; amount: number; category: string; note: string; paymentMode: "cash" | "upi" | "bank" | "other"; accountId: string; date: string; createdAt: number };

const STORAGE_KEY = "shivanyams-ledger-v1";
const today = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const money = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
const categories = { income: ["Service", "Xerox / Printing", "CSP Commission", "Form Filling", "Other"], expense: ["Rent", "Electricity", "Petrol / Travel", "Supplies", "Maintenance", "Other"] };
const counterLabels: Record<Counter, string> = { main: "Main Shop", csp: "SBI CSP", shared: "Shared" };
const defaultAccounts: LedgerAccount[] = [
  { id: "main-cash", name: "Main Shop Cash", kind: "cash", note: "Main counter cash drawer", openingBalance: 0, active: true },
  { id: "csp-cash", name: "SBI CSP Cash", kind: "cash", note: "SBI CSP counter cash drawer", openingBalance: 0, active: true },
  { id: "business-current", name: "Business Current Account", kind: "bank", note: "Shivanya business bank account", openingBalance: 0, active: true },
  { id: "personal-one", name: "Personal Account 1", kind: "bank", note: "Business funds held here", openingBalance: 0, active: true },
  { id: "personal-two", name: "Personal Account 2", kind: "bank", note: "Business funds held here", openingBalance: 0, active: true },
  { id: "phonepe-business", name: "PhonePe Business", kind: "upi", note: "Business UPI collections", openingBalance: 0, active: true },
];

export default function LedgerPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAdmin = user?.roles?.includes("admin") === true;
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [accounts, setAccounts] = useState<LedgerAccount[]>(defaultAccounts);
  const [ready, setReady] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ type: "income" as EntryType, counter: "main" as Counter, amount: "", category: "Service", note: "", paymentMode: "cash" as "cash" | "upi" | "bank" | "other", accountId: "main-cash", date: today() });

  useEffect(() => { if (!loading && !isAdmin) router.replace("/"); }, [loading, isAdmin, router]);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.entries)) setEntries(parsed.entries);
        if (Array.isArray(parsed.accounts) && parsed.accounts.length) setAccounts(parsed.accounts);
        if (parsed.openingSetup?.balances) setAccounts((current) => current.map((account) => ({ ...account, openingBalance: Number(parsed.openingSetup.balances[account.id] ?? account.openingBalance) })));
      }
    } catch { /* Ignore invalid local preview data. */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) { const previous = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...previous, entries, accounts })); }
  }, [ready, entries, accounts]);

  const todayEntries = useMemo(() => entries.filter((entry) => entry.date === today()), [entries]);
  const todayIncome = todayEntries.filter((entry) => entry.type === "income").reduce((sum, entry) => sum + entry.amount, 0);
  const todayExpenses = todayEntries.filter((entry) => entry.type === "expense").reduce((sum, entry) => sum + entry.amount, 0);
  const totalAccountBalance = useMemo(() => accounts.reduce((total, account) => {
    const movement = entries.filter((entry) => entry.accountId === account.id).reduce((sum, entry) => sum + (entry.type === "income" ? entry.amount : -entry.amount), 0);
    return total + account.openingBalance + movement;
  }, 0), [accounts, entries]);
  const recentEntries = useMemo(() => [...entries].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5), [entries]);
  const allIncome = useMemo(() => entries.filter((entry) => entry.type === "income").reduce((sum, entry) => sum + entry.amount, 0), [entries]);
  const allExpenses = useMemo(() => entries.filter((entry) => entry.type === "expense").reduce((sum, entry) => sum + entry.amount, 0), [entries]);
  const counterStats = useMemo(() => (["main", "csp", "shared"] as Counter[]).map((key) => {
    const rows = entries.filter((entry) => entry.counter === key);
    return { key, count: rows.length, income: rows.filter((entry) => entry.type === "income").reduce((sum, entry) => sum + entry.amount, 0), expenses: rows.filter((entry) => entry.type === "expense").reduce((sum, entry) => sum + entry.amount, 0) };
  }), [entries]);
  const categoryStats = useMemo(() => {
    const totals = new Map<string, number>();
    entries.filter((entry) => entry.type === "expense").forEach((entry) => totals.set(entry.category, (totals.get(entry.category) || 0) + entry.amount));
    return [...totals.entries()].sort((a, b) => b[1] - a[1]);
  }, [entries]);

  const openNewEntry = (type: EntryType = "income") => {
    setEditingId(null);
    setForm({ type, counter: "main", amount: "", category: categories[type][0], note: "", paymentMode: "cash", accountId: "main-cash", date: today() });
    setFormError("");
    setShowForm(true);
  };
  const editEntry = (entry: LedgerEntry) => {
    setEditingId(entry.id);
    setForm({ type: entry.type, counter: entry.counter, amount: String(entry.amount), category: entry.category, note: entry.note, paymentMode: entry.paymentMode, accountId: entry.accountId, date: entry.date });
    setFormError("");
    setShowForm(true);
  };
  const saveEntry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) { setFormError("Please enter an amount greater than zero."); return; }
    if (!form.date) { setFormError("Please select a date."); return; }
    const entry: LedgerEntry = { id: editingId ?? (crypto.randomUUID?.() || String(Date.now())), type: form.type, counter: form.type === "income" && form.counter === "shared" ? "main" : form.counter, amount, category: form.category, note: form.note.trim(), paymentMode: form.paymentMode, accountId: form.accountId, date: form.date, createdAt: Date.now() };
    setEntries((current) => editingId ? current.map((item) => item.id === editingId ? entry : item) : [entry, ...current]);
    setShowForm(false);
    setEditingId(null);
  };
  const changeType = (type: EntryType) => setForm((current) => ({ ...current, type, category: categories[type][0], counter: type === "income" && current.counter === "shared" ? "main" : current.counter }));
  const deleteEntry = (id: string) => { if (window.confirm("Delete this transaction?")) setEntries((current) => current.filter((entry) => entry.id !== id)); };

  if (loading || !isAdmin || !ready) return <main className={styles.page}><div className={styles.loading}>Loading Ledger…</div></main>;

  return (
    <main className={styles.page}>
      <div className={styles.topbar}>
        <div className={styles.heading}><div className={styles.eyebrow}>SHIVANYA MULTISERVICES</div><h1>Ledger</h1><p>Your business money, at a glance.</p></div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><button className={styles.backButton} onClick={() => router.push("/ledger/setup")}>Opening setup</button><button className={styles.backButton} aria-expanded={showStatistics} onClick={() => setShowStatistics((value) => !value)}>{showStatistics ? "Hide statistics" : "Statistics"}</button><button className={styles.primaryButton} onClick={() => openNewEntry()}><span aria-hidden="true">＋</span> Add entry</button></div>
      </div>

      <section className={styles.dashboardCards} aria-label="Ledger overview">
        <button className={styles.dashboardCard + " " + styles.balanceDashboardCard} onClick={() => router.push("/ledger/accounts")}>
          <span className={styles.dashboardCardTop}><span className={styles.dashboardIcon}>₹</span><span className={styles.dashboardArrow}>↗</span></span>
          <span className={styles.dashboardLabel}>Total account balance</span>
          <strong>{money(totalAccountBalance)}</strong>
          <small>Across {accounts.filter((account) => account.active).length} active accounts · View accounts</small>
        </button>
        <button className={styles.dashboardCard} onClick={() => router.push("/ledger/transactions")}>
          <span className={styles.dashboardCardTop}><span className={styles.dashboardIcon}>⇄</span><span className={styles.dashboardArrow}>↗</span></span>
          <span className={styles.dashboardLabel}>Today&apos;s transactions</span>
          <strong>{todayEntries.length}</strong>
          <small>{money(todayIncome)} received · {money(todayExpenses)} spent</small>
        </button>
        <article className={styles.dashboardCard + " " + styles.netDashboardCard}>
          <span className={styles.dashboardCardTop}><span className={styles.dashboardIcon}>⌁</span><span className={styles.dashboardPill}>Today</span></span>
          <span className={styles.dashboardLabel}>Today&apos;s net</span>
          <strong>{money(todayIncome - todayExpenses)}</strong>
          <small>Income minus expenses</small>
        </article>
      </section>

      {showStatistics && <section className={styles.workspace} aria-label="Ledger statistics">
        <div className={styles.listHeader}><div><h2>All statistics</h2><p>Calculated from every transaction recorded in this browser.</p></div></div>
        <section className={styles.transactionTotals}>
          <article><span>Total income</span><strong className={styles.incomeValue}>{money(allIncome)}</strong></article>
          <article><span>Total expenses</span><strong className={styles.expenseValue}>{money(allExpenses)}</strong></article>
          <article><span>Overall net</span><strong>{money(allIncome - allExpenses)}</strong></article>
        </section>
        <div className={styles.accountsPageHeading}><div><h2>Transaction summary</h2><p>{entries.length} total entries · {entries.filter((entry) => entry.type === "income").length} income · {entries.filter((entry) => entry.type === "expense").length} expenses</p></div></div>
        <div className={styles.accountsPageGrid}>{counterStats.map((item) => <article className={styles.accountPageCard} key={item.key}><span className={styles.accountKind}>{counterLabels[item.key]}</span><h3>{item.count} transactions</h3><strong>{money(item.income - item.expenses)}</strong><p>Income {money(item.income)} · Expenses {money(item.expenses)}</p></article>)}</div>
        <div className={styles.accountsPageHeading} style={{ marginTop: 18 }}><div><h2>Account balances</h2><p>Current balance by money account</p></div></div>
        <div className={styles.accountsPageGrid}>{accounts.filter((account) => account.active).map((account) => { const movement = entries.filter((entry) => entry.accountId === account.id).reduce((sum, entry) => sum + (entry.type === "income" ? entry.amount : -entry.amount), 0); return <article className={styles.accountPageCard} key={account.id}><h3>{account.name}</h3><strong>{money(account.openingBalance + movement)}</strong><p>{entries.filter((entry) => entry.accountId === account.id).length} transactions</p></article>; })}</div>
        <div className={styles.accountsPageHeading} style={{ marginTop: 18 }}><div><h2>Expense categories</h2><p>Highest spending categories across all recorded entries</p></div></div>
        {categoryStats.length ? <div className={styles.entryList}>{categoryStats.map(([name, amount]) => <article className={styles.entry} key={name}><div className={styles.entryDetails}><strong>{name}</strong></div><strong className={styles.entryAmount + " " + styles.expenseValue}>{money(amount)}</strong></article>)}</div> : <p className={styles.localNotice}>No expense statistics yet. Add an expense to see category totals.</p>}
      </section>}
      <section className={styles.quickActions}>
        <div><h2>Quick entry</h2><p>Record money as it comes in or goes out.</p></div>
        <div className={styles.quickActionButtons}><button className={styles.incomeButton} onClick={() => openNewEntry("income")}>＋ Income</button><button className={styles.expenseButton} onClick={() => openNewEntry("expense")}>− Expense</button></div>
      </section>

      <section className={styles.workspace}>
        <div className={styles.listHeader}>
          <div><h2>Recent transactions</h2><p>Latest 5 entries</p></div>
          <button className={styles.viewAllButton} onClick={() => router.push("/ledger/transactions")}>View all <span>→</span></button>
        </div>
        {recentEntries.length === 0 ? <div className={styles.emptyState}><div className={styles.emptyIcon}>₹</div><h3>No transactions yet</h3><p>Add income or expenses whenever they happen. Your recent activity will appear here.</p><div className={styles.emptyActions}><button className={styles.incomeButton} onClick={() => openNewEntry("income")}>＋ Add income</button><button className={styles.expenseButton} onClick={() => openNewEntry("expense")}>＋ Add expense</button></div></div> : <div className={styles.entryList}>{recentEntries.map((entry) => <article className={styles.entry} key={entry.id}><div className={styles.entryIcon + " " + (entry.type === "income" ? styles.entryIncome : styles.entryExpense)}>{entry.type === "income" ? "↙" : "↗"}</div><div className={styles.entryDetails}><strong>{entry.category}</strong><span>{entry.note || counterLabels[entry.counter]} · {accounts.find((account) => account.id === entry.accountId)?.name || "Account"}</span><small>{counterLabels[entry.counter]} · {entry.date}</small></div><strong className={styles.entryAmount + " " + (entry.type === "income" ? styles.incomeValue : styles.expenseValue)}>{entry.type === "income" ? "+" : "−"}{money(entry.amount)}</strong><div className={styles.entryActions}><button onClick={() => editEntry(entry)}>Edit</button><button onClick={() => deleteEntry(entry.id)}>Delete</button></div></article>)}</div>}
      </section>

      {showForm && <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowForm(false); }}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="entryTitle"><div className={styles.modalHeader}><div><span className={styles.eyebrow}>LEDGER ENTRY</span><h2 id="entryTitle">{editingId ? "Edit transaction" : "Add transaction"}</h2></div><button className={styles.closeButton} onClick={() => setShowForm(false)} aria-label="Close">×</button></div><form onSubmit={saveEntry} className={styles.entryForm}><div className={styles.typeSwitch}><button type="button" className={form.type === "income" ? styles.typeIncomeActive : ""} onClick={() => changeType("income")}>Income</button><button type="button" className={form.type === "expense" ? styles.typeExpenseActive : ""} onClick={() => changeType("expense")}>Expense</button></div><label className={styles.amountField}><span>Amount</span><div><span>₹</span><input autoFocus type="number" min="1" step="0.01" inputMode="decimal" placeholder="0" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} required /></div></label><div className={styles.formGrid}><label><span>Counter</span><select value={form.counter} onChange={(event) => setForm({ ...form, counter: event.target.value as Counter })}><option value="main">Main Shop</option><option value="csp">SBI CSP</option>{form.type === "expense" && <option value="shared">Shared by both</option>}</select></label><label><span>Category</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories[form.type].map((category) => <option key={category}>{category}</option>)}</select></label><label><span>Date</span><input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required /></label><label><span>Payment method</span><select value={form.paymentMode} onChange={(event) => setForm({ ...form, paymentMode: event.target.value as typeof form.paymentMode })}><option value="cash">Cash</option><option value="upi">UPI</option><option value="bank">Bank</option><option value="other">Other</option></select></label></div><label className={styles.accountSelectField}><span>Money account</span><select value={form.accountId} onChange={(event) => setForm({ ...form, accountId: event.target.value })}>{accounts.filter((account) => account.active).map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select><small>Choose where the money was received or paid from.</small></label><label className={styles.noteField}><span>Note <small>(optional)</small></span><input value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="What was this transaction for?" maxLength={120} /></label>{formError && <p className={styles.formError}>{formError}</p>}<div className={styles.modalActions}><button type="button" className={styles.cancelButton} onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className={styles.saveButton}>{editingId ? "Save changes" : "Save entry"}</button></div><p className={styles.localNotice}>Preview data is saved in this browser only. Backend database syncing will be connected separately.</p></form></section></div>}
    </main>
  );
}
