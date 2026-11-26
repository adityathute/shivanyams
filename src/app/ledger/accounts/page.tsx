"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
import styles from "../ledger.module.css";

type AccountKind = "cash" | "bank" | "upi";
type LedgerAccount = { id: string; name: string; kind: AccountKind; note: string; openingBalance: number; active: boolean };
type LedgerEntry = { id: string; type: "income" | "expense"; amount: number; accountId: string };
const STORAGE_KEY = "shivanyams-ledger-v1";
const money = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
const defaults: LedgerAccount[] = [
  { id: "main-cash", name: "Main Shop Cash", kind: "cash", note: "Main counter cash drawer", openingBalance: 0, active: true },
  { id: "csp-cash", name: "SBI CSP Cash", kind: "cash", note: "SBI CSP counter cash drawer", openingBalance: 0, active: true },
  { id: "business-current", name: "Business Current Account", kind: "bank", note: "Shivanya business bank account", openingBalance: 0, active: true },
  { id: "personal-one", name: "Personal Account 1", kind: "bank", note: "Business funds held here", openingBalance: 0, active: true },
  { id: "personal-two", name: "Personal Account 2", kind: "bank", note: "Business funds held here", openingBalance: 0, active: true },
  { id: "phonepe-business", name: "PhonePe Business", kind: "upi", note: "Business UPI collections", openingBalance: 0, active: true },
];

export default function LedgerAccountsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAdmin = user?.roles?.includes("admin") === true;
  const [accounts, setAccounts] = useState<LedgerAccount[]>(defaults);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [ready, setReady] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ name: "", kind: "bank" as AccountKind, note: "", openingBalance: "0" });

  useEffect(() => { if (!loading && !isAdmin) router.replace("/"); }, [loading, isAdmin, router]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data.accounts) && data.accounts.length) setAccounts(data.accounts);
        if (data.openingSetup?.balances) setAccounts((current) => current.map((account) => ({ ...account, openingBalance: Number(data.openingSetup.balances[account.id] ?? account.openingBalance) })));
        if (Array.isArray(data.entries)) setEntries(data.entries);
      }
    } catch { /* Keep defaults when local preview data is invalid. */ }
    setReady(true);
  }, []);
  const accountRows = useMemo(() => accounts.map((account) => {
    const movement = entries.filter((entry) => entry.accountId === account.id).reduce((sum, entry) => sum + (entry.type === "income" ? entry.amount : -entry.amount), 0);
    return { ...account, balance: account.openingBalance + movement, transactionCount: entries.filter((entry) => entry.accountId === account.id).length };
  }), [accounts, entries]);
  const totalBalance = accountRows.filter((account) => account.active).reduce((sum, account) => sum + account.balance, 0);
  const saveAccount = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = draft.name.trim();
    if (!name) return;
    const account: LedgerAccount = { id: crypto.randomUUID?.() || String(Date.now()), name, kind: draft.kind, note: draft.note.trim(), openingBalance: Number(draft.openingBalance) || 0, active: true };
    const nextAccounts = [...accounts, account];
    setAccounts(nextAccounts);
    const previous = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...previous, accounts: nextAccounts, entries }));
    setDraft({ name: "", kind: "bank", note: "", openingBalance: "0" });
    setShowForm(false);
  };

  if (loading || !isAdmin || !ready) return <main className={styles.page}><div className={styles.loading}>Loading accounts…</div></main>;
  return <main className={styles.page}>
    <div className={styles.subPageTop}>
      <button className={styles.backButton} onClick={() => router.push("/ledger")}>← Ledger home</button>
      <button className={styles.addAccountButton} onClick={() => setShowForm((value) => !value)}>＋ Add account</button>
    </div>
    <div className={styles.subPageHeading}><div className={styles.eyebrow}>LEDGER · MONEY MANAGEMENT</div><h1>Accounts</h1><p>See where your business money is currently held.</p></div>
    <section className={styles.accountsTotalCard}><div><span>Total account balance</span><strong>{money(totalBalance)}</strong><small>Combined balance across {accountRows.filter((account) => account.active).length} active accounts</small></div><span className={styles.totalBalanceIcon}>₹</span></section>
    <div className={styles.accountsPageHeading}><div><h2>All accounts</h2><p>{accountRows.length} accounts · Cash, bank and UPI</p></div></div>
    <section className={styles.accountsPageGrid}>
      {accountRows.map((account) => <article className={styles.accountPageCard} key={account.id}>
        <div className={styles.accountCardTop}><span className={styles.accountKind}>{account.kind === "cash" ? "CASH" : account.kind === "upi" ? "UPI / WALLET" : "BANK"}</span><span className={account.active ? styles.accountStatus : styles.accountInactive}>{account.active ? "Active" : "Inactive"}</span></div>
        <h3>{account.name}</h3><strong>{money(account.balance)}</strong><p>{account.note || "Business account"}</p><div className={styles.accountPageFoot}><span>{account.transactionCount} transactions</span><span>Opening {money(account.openingBalance)}</span></div>
      </article>)}
    </section>
    {showForm && <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowForm(false); }}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="accountTitle"><div className={styles.modalHeader}><div><span className={styles.eyebrow}>MONEY ACCOUNT</span><h2 id="accountTitle">Add account</h2></div><button className={styles.closeButton} onClick={() => setShowForm(false)} aria-label="Close">×</button></div><form className={styles.entryForm} onSubmit={saveAccount}><label className={styles.noteField}><span>Account name</span><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="e.g. Savings account" required /></label><div className={styles.formGrid}><label><span>Account type</span><select value={draft.kind} onChange={(event) => setDraft({ ...draft, kind: event.target.value as AccountKind })}><option value="cash">Cash</option><option value="bank">Bank</option><option value="upi">UPI / Wallet</option></select></label><label><span>Opening balance</span><input type="number" min="0" step="0.01" value={draft.openingBalance} onChange={(event) => setDraft({ ...draft, openingBalance: event.target.value })} /></label></div><label className={styles.noteField}><span>Note <small>(optional)</small></span><input value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} placeholder="Optional details" /></label><div className={styles.modalActions}><button type="button" className={styles.cancelButton} onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className={styles.saveButton}>Save account</button></div></form></section></div>}
    <p className={styles.localNotice}>Account and transaction data currently syncs only within this browser. Backend database saving is a separate next step.</p>
  </main>;
}
