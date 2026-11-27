// File Location: shivanyams/src/app/ledger/setup/page.tsx
/*
 * Reference Repositories:
 * shivanya-sdk v1.0.0 (branch sdk-v2)
 * shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: e449bbc50dcf4b464c2ae1f7aa23890e4bc9da1d
 * Both repositories are read-only references.
 */
// Cleanup Status: Cleanup Pending
// Cleanup Info: UI: opening-funds, account-balance, loan, rent and asset forms; native form controls with inline CSSProperties. SDK candidates Input, Select, Card, Button not integrated. Browser-local storage/backend persistence pending; fixed stale saved indicator when editing balances/assets.

"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
import styles from "../ledger.module.css";

const STORAGE_KEY = "shivanyams-ledger-v1";
const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
type Asset = { id: string; name: string; purchaseCost: string; currentValue: string; note: string };
type Setup = {
  setupDate: string; brotherCapital: string; ownerCapital: string; loanSanctioned: string; loanReceived: string; repaymentTotal: string; installments: string; installmentsPaid: string;
  rent: string; deposit: string; agreementMonths: string; agreementStart: string; extraPlanned: string; balances: Record<string, string>; assets: Asset[];
};
const initial: Setup = {
  setupDate: new Date().toISOString().slice(0, 10), brotherCapital: "", ownerCapital: "", loanSanctioned: "", loanReceived: "", repaymentTotal: "", installments: "", installmentsPaid: "",
  rent: "", deposit: "", agreementMonths: "", agreementStart: "", extraPlanned: "",
  balances: { "main-cash": "", "csp-cash": "", "business-current": "", "personal-one": "", "personal-two": "", "phonepe-business": "" }, assets: [],
};
const accounts = [
  ["main-cash", "Main Shop Cash"], ["csp-cash", "SBI CSP Cash"], ["business-current", "Business Current Account"],
  ["personal-one", "Personal Account 1"], ["personal-two", "Personal Account 2"], ["phonepe-business", "PhonePe Business"],
];
const totalFunds = (s: Setup) => Number(s.brotherCapital || 0) + Number(s.ownerCapital || 0) + Number(s.loanReceived || 0);
const inputStyle: CSSProperties = { width: "100%", minHeight: 42, border: "1px solid var(--shivanya-color-border, #e1e6ed)", borderRadius: 10, padding: "0 11px", background: "var(--shivanya-color-background, #fff)", color: "var(--shivanya-color-text-primary, #202938)" };
const labelStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6, fontSize: 12, fontWeight: 650, color: "var(--shivanya-color-text-secondary, #667085)" };
const cardStyle: React.CSSProperties = { border: "1px solid var(--shivanya-color-border, #e5e9ef)", borderRadius: 15, padding: 16, background: "var(--shivanya-color-surface, #fff)", marginBottom: 12 };

export default function LedgerOpeningSetupPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [data, setData] = useState<Setup>(initial);
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const isAdmin = user?.roles?.includes("admin") === true;
  useEffect(() => { if (!loading && !isAdmin) router.replace("/"); }, [loading, isAdmin, router]);
  useEffect(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) { const stored = JSON.parse(raw); if (stored.openingSetup) setData({ ...initial, ...stored.openingSetup, balances: { ...initial.balances, ...stored.openingSetup.balances }, assets: stored.openingSetup.assets || [] }); } } catch { /* use starter values */ }
    setReady(true);
  }, []);
  const set = (key: keyof Setup, value: string) => { setData(current => ({ ...current, [key]: value })); setSaved(false); };
  const funds = totalFunds(data);
  const balanceSum = Object.values(data.balances).reduce((sum, value) => sum + Number(value || 0), 0);
  const addAsset = () => { setData(current => ({ ...current, assets: [...current.assets, { id: crypto.randomUUID(), name: "", purchaseCost: "", currentValue: "", note: "" }] })); setSaved(false); };
  const updateAsset = (id: string, key: keyof Asset, value: string) => { setData(current => ({ ...current, assets: current.assets.map(asset => asset.id === id ? { ...asset, [key]: value } : asset) })); setSaved(false); };
  const save = () => {
    if ((funds > 0 || balanceSum > 0) && Math.abs(balanceSum - funds) > 0.005) { setError(`Account balance allocation must total ${money(funds)}. Currently allocated: ${money(balanceSum)}.`); return; }
    const previous = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...previous, openingSetup: data }));
    setError(""); setSaved(true);
  };
  if (loading || !isAdmin || !ready) return <main className={styles.page}><div className={styles.loading}>Loading opening setup…</div></main>;
  return <main className={styles.page}>
    <div className={styles.subPageTop}><button className={styles.backButton} onClick={() => router.push("/ledger")}>← Ledger</button><span className={styles.eyebrow}>ONE-TIME SETUP</span></div>
    <div className={styles.subPageHeading}><div className={styles.eyebrow}>LEDGER · STARTING POSITION</div><h1>Opening setup</h1><p>Enter what you have arranged so far. You can edit this later.</p></div>
    <section style={cardStyle}>
      <h2 style={{ margin: "0 0 5px", fontSize: 17 }}>Starting funds</h2><p style={{ margin: "0 0 15px", fontSize: 12, color: "var(--shivanya-color-text-secondary, #7b8491)" }}>Enter your actual figures here. Nothing is pre-filled; you control every amount.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 }}>
        <label style={labelStyle}>Brother's contribution<input style={inputStyle} type="number" min="0" value={data.brotherCapital} onChange={e => set("brotherCapital", e.target.value)} /></label>
        <label style={labelStyle}>Your contribution<input style={inputStyle} type="number" min="0" value={data.ownerCapital} onChange={e => set("ownerCapital", e.target.value)} /></label>
        <label style={labelStyle}>Loan received<input style={inputStyle} type="number" min="0" value={data.loanReceived} onChange={e => set("loanReceived", e.target.value)} /></label>
        <label style={labelStyle}>Additional money planned<input style={inputStyle} type="number" min="0" value={data.extraPlanned} onChange={e => set("extraPlanned", e.target.value)} /></label>
      </div>
      <div style={{ marginTop: 14, borderRadius: 12, background: "var(--shivanya-color-background, #f5f7fa)", padding: 13, display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}><span>Currently arranged</span><strong>{money(funds)}</strong><span>Including planned funds: <b>{money(funds + Number(data.extraPlanned || 0))}</b></span></div>
    </section>
    <section style={cardStyle}>
      <h2 style={{ margin: "0 0 5px", fontSize: 17 }}>Where the money is now</h2><p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--shivanya-color-text-secondary, #7b8491)" }}>Enter actual balances. Enter the actual money currently held in each account. Personal accounts can include business money.</p>
      <div style={{ display: "grid", gap: 10 }}>{accounts.map(([id, name]) => <label key={id} style={labelStyle}>{name}<input style={inputStyle} type="number" min="0" placeholder="0" value={data.balances[id] || ""} onChange={e => { setData(current => ({ ...current, balances: { ...current.balances, [id]: e.target.value } })); setSaved(false); }} /></label>)}</div>
      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>Allocated total</span><strong>{money(balanceSum)} / {money(funds)}</strong></div>
    </section>
    <section style={cardStyle}>
      <h2 style={{ margin: "0 0 12px", fontSize: 17 }}>Loan details</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 }}>
        <label style={labelStyle}>Sanctioned amount<input style={inputStyle} type="number" value={data.loanSanctioned} onChange={e => set("loanSanctioned", e.target.value)} /></label>
        <label style={labelStyle}>Net received<input style={inputStyle} type="number" value={data.loanReceived} onChange={e => set("loanReceived", e.target.value)} /></label>
        <label style={labelStyle}>Total repayment agreed<input style={inputStyle} type="number" value={data.repaymentTotal} onChange={e => set("repaymentTotal", e.target.value)} /></label>
        <label style={labelStyle}>Installments (months)<input style={inputStyle} type="number" min="1" value={data.installments} onChange={e => set("installments", e.target.value)} /></label>
        <label style={labelStyle}>Installments already paid<input style={inputStyle} type="number" min="0" value={data.installmentsPaid} onChange={e => set("installmentsPaid", e.target.value)} /></label>
      </div>
      <p style={{ margin: "12px 0 0", fontSize: 12, color: "var(--shivanya-color-text-secondary, #7b8491)" }}>Estimated EMI: {money(Number(data.repaymentTotal || 0) / Math.max(1, Number(data.installments || 1)))} · Difference between sanctioned and received is left for clarification, not auto-classified.</p>
    </section>
    <section style={cardStyle}>
      <h2 style={{ margin: "0 0 12px", fontSize: 17 }}>Shop rent & agreement</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 }}>
        <label style={labelStyle}>Monthly rent<input style={inputStyle} type="number" value={data.rent} onChange={e => set("rent", e.target.value)} /></label>
        <label style={labelStyle}>Refundable deposit<input style={inputStyle} type="number" value={data.deposit} onChange={e => set("deposit", e.target.value)} /></label>
        <label style={labelStyle}>Agreement duration (months)<input style={inputStyle} type="number" min="1" value={data.agreementMonths} onChange={e => set("agreementMonths", e.target.value)} /></label>
        <label style={labelStyle}>Agreement start date<input style={inputStyle} type="date" value={data.agreementStart} onChange={e => set("agreementStart", e.target.value)} /></label>
      </div>
      <p style={{ margin: "12px 0 0", fontSize: 12, color: "var(--shivanya-color-text-secondary, #7b8491)" }}>Add the agreement dates and terms when you are ready. Each renewal should be kept as a separate record.</p>
    </section>
    <section style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 10 }}><h2 style={{ margin: 0, fontSize: 17 }}>Existing equipment</h2><button className={styles.addAccountButton} onClick={addAsset}>＋ Add asset</button></div>
      <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--shivanya-color-text-secondary, #7b8491)" }}>Record printers, computers and furniture you already own. These are assets, not new expenses.</p>
      {data.assets.map(asset => <div key={asset.id} style={{ border: "1px solid var(--shivanya-color-border, #e5e9ef)", borderRadius: 12, padding: 12, marginBottom: 10, display: "grid", gap: 9 }}>
        <label style={labelStyle}>Asset name<input style={inputStyle} value={asset.name} placeholder="e.g. Laser printer" onChange={e => updateAsset(asset.id, "name", e.target.value)} /></label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><label style={labelStyle}>Original purchase cost<input style={inputStyle} type="number" value={asset.purchaseCost} onChange={e => updateAsset(asset.id, "purchaseCost", e.target.value)} /></label><label style={labelStyle}>Current estimated value<input style={inputStyle} type="number" value={asset.currentValue} onChange={e => updateAsset(asset.id, "currentValue", e.target.value)} /></label></div>
        <label style={labelStyle}>Note<input style={inputStyle} value={asset.note} onChange={e => updateAsset(asset.id, "note", e.target.value)} placeholder="Year, condition, counter" /></label>
        <button type="button" className={styles.clearFiltersButton} onClick={() => { setData(current => ({ ...current, assets: current.assets.filter(item => item.id !== asset.id) })); setSaved(false); }}>Remove asset</button>
      </div>)}
      {!data.assets.length && <p style={{ color: "var(--shivanya-color-text-secondary, #7b8491)", fontSize: 12 }}>No equipment added yet.</p>}
    </section>
    <section style={cardStyle}>
      <h2 style={{ margin: "0 0 10px", fontSize: 17 }}>Review</h2>
      <div style={{ display: "grid", gap: 8, fontSize: 13 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Arranged funds</span><strong>{money(funds)}</strong></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Planned extra</span><strong>{money(Number(data.extraPlanned || 0))}</strong></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Loan repayment total</span><strong>{money(Number(data.repaymentTotal || 0))}</strong></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Rent / month</span><strong>{money(Number(data.rent || 0))}</strong></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Deposit (asset)</span><strong>{money(Number(data.deposit || 0))}</strong></div>
      </div>
    </section>
    {error && <p className={styles.formError}>{error}</p>}
    {saved && <p style={{ color: "#16834a", fontWeight: 700, fontSize: 13 }}>Opening setup saved in this browser.</p>}
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}><button className={styles.cancelButton} onClick={() => router.push("/ledger")}>Cancel</button><button className={styles.saveButton} onClick={save}>Save opening setup</button></div>
    <p className={styles.localNotice}>Saved locally in this browser preview. It does not create ledger transactions or alter existing account balances yet; backend persistence will be implemented separately.</p>
  </main>;
}
