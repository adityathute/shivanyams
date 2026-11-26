"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
import styles from "./ledger.module.css";

type EntryType = "income" | "expense";
type Counter = "main" | "csp" | "shared";
type PaymentMode = "cash" | "upi" | "bank" | "other";
type AccountKind = "cash" | "bank" | "upi";
type LedgerAccount = { id: string; name: string; kind: AccountKind; note: string; openingBalance: number; active: boolean };

type LedgerEntry = {
  id: string;
  type: EntryType;
  counter: Counter;
  amount: number;
  category: string;
  note: string;
  paymentMode: PaymentMode;
  accountId: string;
  date: string;
  createdAt: number;
};

const today = () => {
  const date = new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const categories = {
  income: ["Service", "Xerox / Printing", "CSP Commission", "Form Filling", "Other"],
  expense: ["Rent", "Electricity", "Petrol / Travel", "Supplies", "Maintenance", "Other"],
};

const counterLabels: Record<Counter, string> = {
  main: "Main Shop",
  csp: "SBI CSP",
  shared: "Shared",
};

const defaultAccounts: LedgerAccount[] = [
  { id: "main-cash", name: "Main Shop Cash", kind: "cash", note: "Main counter cash drawer", openingBalance: 0, active: true },
  { id: "csp-cash", name: "SBI CSP Cash", kind: "cash", note: "SBI CSP counter cash drawer", openingBalance: 0, active: true },
  { id: "business-current", name: "Business Current Account", kind: "bank", note: "Shivanya business bank account", openingBalance: 0, active: true },
  { id: "personal-one", name: "Personal Account 1", kind: "bank", note: "Business funds may be held here", openingBalance: 0, active: true },
  { id: "personal-two", name: "Personal Account 2", kind: "bank", note: "Business funds may be held here", openingBalance: 0, active: true },
  { id: "phonepe-business", name: "PhonePe Business", kind: "upi", note: "Business UPI collections", openingBalance: 0, active: true },
];

const paymentLabels: Record<PaymentMode, string> = {
  cash: "Cash",
  upi: "UPI",
  bank: "Bank",
  other: "Other",
};

export default function LedgerPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAdmin = user?.roles?.includes("admin") === true;

  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [accounts, setAccounts] = useState<LedgerAccount[]>(defaultAccounts);
  const [showAccounts, setShowAccounts] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [accountDraft, setAccountDraft] = useState({ name: "", kind: "bank" as AccountKind, note: "", openingBalance: "0" });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState(today());
  const [counterFilter, setCounterFilter] = useState<"all" | Counter>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | EntryType>("all");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    type: "income" as EntryType,
    counter: "main" as Counter,
    amount: "",
    category: "Service",
    note: "",
    paymentMode: "cash" as PaymentMode,
    accountId: "main-cash",
    date: today(),
  });

  useEffect(() => {
    if (!loading && !isAdmin) router.replace("/");
  }, [loading, isAdmin, router]);

  const filteredEntries = useMemo(
    () =>
      entries
        .filter((entry) => !filterDate || entry.date === filterDate)
        .filter((entry) => counterFilter === "all" || entry.counter === counterFilter)
        .filter((entry) => typeFilter === "all" || entry.type === typeFilter)
        .sort((a, b) => b.createdAt - a.createdAt),
    [entries, filterDate, counterFilter, typeFilter],
  );

  const totals = useMemo(() => {
    const matching = entries.filter((entry) => !filterDate || entry.date === filterDate);
    const income = matching
      .filter((entry) => entry.type === "income" && (counterFilter === "all" || entry.counter === counterFilter))
      .reduce((sum, entry) => sum + entry.amount, 0);
    const expenses = matching
      .filter((entry) => entry.type === "expense" && (counterFilter === "all" || entry.counter === counterFilter))
      .reduce((sum, entry) => sum + entry.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [entries, filterDate, counterFilter]);

  const openNewEntry = (type: EntryType = "income") => {
    setEditingId(null);
    setForm({
      type,
      counter: "main",
      amount: "",
      category: categories[type][0],
      note: "",
      paymentMode: "cash",
      accountId: "main-cash",
      date: filterDate || today(),
    });
    setFormError("");
    setShowForm(true);
  };

  const editEntry = (entry: LedgerEntry) => {
    setEditingId(entry.id);
    setForm({
      type: entry.type,
      counter: entry.counter,
      amount: String(entry.amount),
      category: entry.category,
      note: entry.note,
      paymentMode: entry.paymentMode,
      accountId: entry.accountId,
      date: entry.date,
    });
    setFormError("");
    setShowForm(true);
  };

  const changeType = (type: EntryType) => {
    setForm((current) => ({
      ...current,
      type,
      category: categories[type][0],
      counter: type === "income" && current.counter === "shared" ? "main" : current.counter,
    }));
  };

  const saveEntry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError("Please enter an amount greater than zero.");
      return;
    }
    if (!form.date) {
      setFormError("Please select a date.");
      return;
    }

    const entry: LedgerEntry = {
      id: editingId ?? (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now())),
      type: form.type,
      counter: form.type === "income" && form.counter === "shared" ? "main" : form.counter,
      amount,
      category: form.category,
      note: form.note.trim(),
      paymentMode: form.paymentMode,
      accountId: form.accountId,
      date: form.date,
      createdAt: Date.now(),
    };

    setEntries((current) =>
      editingId
        ? current.map((item) => (item.id === editingId ? entry : item))
        : [entry, ...current],
    );
    setFilterDate(form.date);
    setShowForm(false);
    setEditingId(null);
  };

  const accountBalances = useMemo(() => accounts.map((account) => {
    const movement = entries.filter((entry) => entry.accountId === account.id).reduce((sum, entry) => sum + (entry.type === "income" ? entry.amount : -entry.amount), 0);
    return { ...account, balance: account.openingBalance + movement };
  }), [accounts, entries]);

  const saveAccount = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = accountDraft.name.trim();
    if (!name) return;
    const account: LedgerAccount = { id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()), name, kind: accountDraft.kind, note: accountDraft.note.trim(), openingBalance: Number(accountDraft.openingBalance) || 0, active: true };
    setAccounts((current) => [...current, account]);
    setAccountDraft({ name: "", kind: "bank", note: "", openingBalance: "0" });
    setShowAccountForm(false);
  };

  const deleteEntry = (id: string) => {
    if (window.confirm("Delete this transaction?")) {
      setEntries((current) => current.filter((entry) => entry.id !== id));
    }
  };

  if (loading || !isAdmin) {
    return (
      <main className={styles.page}>
        <div className={styles.loading}>Loading Ledger…</div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.topbar}>
        <div className={styles.heading}>
          <div className={styles.eyebrow}>SHIVANYA MULTISERVICES</div>
          <h1>Ledger</h1>
          <p>Daily business entries, made simple.</p>
        </div>
        <button className={styles.primaryButton} onClick={() => openNewEntry()}>
          <span aria-hidden="true">＋</span> Add entry
        </button>
      </div>

      <div className={styles.pageActions}>
        <button className={styles.manageAccountsButton} onClick={() => setShowAccounts((value) => !value)}>▣ {showAccounts ? "Hide accounts" : "Manage accounts"} <span>{accounts.length}</span></button>
      </div>

      {showAccounts && (
        <section className={styles.accountsPanel}>
          <div className={styles.accountsHeading}><div><h2>Money accounts</h2><p>Track where business money is kept, including money held in personal accounts.</p></div><button className={styles.addAccountButton} onClick={() => setShowAccountForm((value) => !value)}>＋ Add account</button></div>
          <div className={styles.accountsGrid}>
            {accountBalances.map((account) => (
              <article className={styles.accountCard} key={account.id}>
                <div className={styles.accountCardTop}><span className={styles.accountKind}>{account.kind === "cash" ? "CASH" : account.kind === "upi" ? "UPI" : "BANK"}</span><span className={styles.accountStatus}>Active</span></div>
                <strong>{account.name}</strong><b>{money(account.balance)}</b><small>{account.note || "Business account"}</small>
              </article>
            ))}
          </div>
          {showAccountForm && <form className={styles.accountForm} onSubmit={saveAccount}><label>Account name<input value={accountDraft.name} onChange={(event) => setAccountDraft({ ...accountDraft, name: event.target.value })} placeholder="e.g. Savings account" required /></label><label>Account type<select value={accountDraft.kind} onChange={(event) => setAccountDraft({ ...accountDraft, kind: event.target.value as AccountKind })}><option value="cash">Cash</option><option value="bank">Bank</option><option value="upi">UPI / Wallet</option></select></label><label>Opening balance<input type="number" min="0" step="0.01" inputMode="decimal" value={accountDraft.openingBalance} onChange={(event) => setAccountDraft({ ...accountDraft, openingBalance: event.target.value })} placeholder="0" /></label><label>Note<input value={accountDraft.note} onChange={(event) => setAccountDraft({ ...accountDraft, note: event.target.value })} placeholder="Optional details" /></label><button type="submit" className={styles.saveButton}>Save account</button></form>}
        </section>
      )}

      <div className={styles.pageActions}>
        <button className={styles.manageAccountsButton} onClick={() => setShowAccounts((value) => !value)}>▣ {showAccounts ? "Hide accounts" : "Manage accounts"} <span>{accounts.length}</span></button>
      </div>

      {showAccounts && (
        <section className={styles.accountsPanel}>
          <div className={styles.accountsHeading}><div><h2>Money accounts</h2><p>Track where business money is kept, including money held in personal accounts.</p></div><button className={styles.addAccountButton} onClick={() => setShowAccountForm((value) => !value)}>＋ Add account</button></div>
          <div className={styles.accountsGrid}>
            {accountBalances.map((account) => (
              <article className={styles.accountCard} key={account.id}>
                <div className={styles.accountCardTop}><span className={styles.accountKind}>{account.kind === "cash" ? "CASH" : account.kind === "upi" ? "UPI" : "BANK"}</span><span className={styles.accountStatus}>Active</span></div>
                <strong>{account.name}</strong><b>{money(account.balance)}</b><small>{account.note || "Business account"}</small>
              </article>
            ))}
          </div>
          {showAccountForm && <form className={styles.accountForm} onSubmit={saveAccount}><label>Account name<input value={accountDraft.name} onChange={(event) => setAccountDraft({ ...accountDraft, name: event.target.value })} placeholder="e.g. Savings account" required /></label><label>Account type<select value={accountDraft.kind} onChange={(event) => setAccountDraft({ ...accountDraft, kind: event.target.value as AccountKind })}><option value="cash">Cash</option><option value="bank">Bank</option><option value="upi">UPI / Wallet</option></select></label><label>Note<input value={accountDraft.note} onChange={(event) => setAccountDraft({ ...accountDraft, note: event.target.value })} placeholder="Optional details" /></label><button type="submit" className={styles.saveButton}>Save account</button></form>}
        </section>
      )}

      <div className={styles.counterStrip} aria-label="Choose counter">
        <button className={counterFilter === "all" ? styles.counterActive : styles.counterButton} onClick={() => setCounterFilter("all")}>
          <span className={styles.counterDot} /> All counters
        </button>
        <button className={counterFilter === "main" ? styles.counterActive : styles.counterButton} onClick={() => setCounterFilter("main")}>
          <span className={styles.counterDot} /> Main Shop
        </button>
        <button className={counterFilter === "csp" ? styles.counterActive : styles.counterButton} onClick={() => setCounterFilter("csp")}>
          <span className={styles.counterDot} /> SBI CSP
        </button>
        <button className={counterFilter === "shared" ? styles.counterActive : styles.counterButton} onClick={() => setCounterFilter("shared")}>
          <span className={styles.counterDot} /> Shared
        </button>
      </div>

      <section className={styles.summary} aria-label="Daily totals">
        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Income</span>
          <strong className={styles.incomeValue}>{money(totals.income)}</strong>
          <span className={styles.summaryHint}>Money received</span>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Expenses</span>
          <strong className={styles.expenseValue}>{money(totals.expenses)}</strong>
          <span className={styles.summaryHint}>Money spent</span>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Net for the day</span>
          <strong>{money(totals.balance)}</strong>
          <span className={styles.summaryHint}>Income minus expenses</span>
        </article>
      </section>

      <section className={styles.workspace}>
        <div className={styles.listHeader}>
          <div>
            <h2>Transactions</h2>
            <p>{filteredEntries.length} {filteredEntries.length === 1 ? "entry" : "entries"} shown</p>
          </div>
          <div className={styles.filters}>
            <label className={styles.dateFilter}>
              <span>Date</span>
              <input type="date" value={filterDate} onChange={(event) => setFilterDate(event.target.value)} aria-label="Filter transactions by date" />
            </label>
            <label className={styles.typeFilter}>
              <span className={styles.visuallyHidden}>Transaction type</span>
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)}>
                <option value="all">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expenses</option>
              </select>
            </label>
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>₹</div>
            <h3>No entries for this day</h3>
            <p>Add income or an expense whenever a transaction happens. You can enter multiple transactions throughout the day.</p>
            <div className={styles.emptyActions}>
              <button className={styles.incomeButton} onClick={() => openNewEntry("income")}>＋ Add income</button>
              <button className={styles.expenseButton} onClick={() => openNewEntry("expense")}>＋ Add expense</button>
            </div>
          </div>
        ) : (
          <div className={styles.entryList}>
            {filteredEntries.map((entry) => (
              <article className={styles.entry} key={entry.id}>
                <div className={styles.entryIcon + " " + (entry.type === "income" ? styles.entryIncome : styles.entryExpense)}>
                  {entry.type === "income" ? "↙" : "↗"}
                </div>
                <div className={styles.entryDetails}>
                  <strong>{entry.category}</strong>
                  <span>{entry.note || counterLabels[entry.counter]} · {paymentLabels[entry.paymentMode]} · {accounts.find((account) => account.id === entry.accountId)?.name || "Account"} · {accounts.find((account) => account.id === entry.accountId)?.name || "Account"}</span>
                  <small>{counterLabels[entry.counter]} · {entry.date}</small>
                </div>
                <strong className={styles.entryAmount + " " + (entry.type === "income" ? styles.incomeValue : styles.expenseValue)}>
                  {entry.type === "income" ? "+" : "−"}{money(entry.amount)}
                </strong>
                <div className={styles.entryActions}>
                  <button aria-label="Edit transaction" onClick={() => editEntry(entry)}>Edit</button>
                  <button aria-label="Delete transaction" onClick={() => deleteEntry(entry.id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {showForm && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowForm(false);
        }}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="entryTitle">
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.eyebrow}>LEDGER ENTRY</span>
                <h2 id="entryTitle">{editingId ? "Edit transaction" : "Add transaction"}</h2>
              </div>
              <button className={styles.closeButton} onClick={() => setShowForm(false)} aria-label="Close">×</button>
            </div>
            <form onSubmit={saveEntry} className={styles.entryForm}>
              <div className={styles.typeSwitch}>
                <button type="button" className={form.type === "income" ? styles.typeIncomeActive : ""} onClick={() => changeType("income")}>Income</button>
                <button type="button" className={form.type === "expense" ? styles.typeExpenseActive : ""} onClick={() => changeType("expense")}>Expense</button>
              </div>

              <label className={styles.amountField}>
                <span>Amount</span>
                <div><span>₹</span><input autoFocus type="number" min="1" step="0.01" inputMode="decimal" placeholder="0" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} required /></div>
              </label>

              <div className={styles.formGrid}>
                <label>
                  <span>Counter</span>
                  <select value={form.counter} onChange={(event) => setForm({ ...form, counter: event.target.value as Counter })}>
                    <option value="main">Main Shop</option>
                    <option value="csp">SBI CSP</option>
                    {form.type === "expense" && <option value="shared">Shared by both</option>}
                  </select>
                </label>
                <label>
                  <span>Category</span>
                  <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                    {categories[form.type].map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </label>
                <label>
                  <span>Date</span>
                  <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
                </label>
                <label>
                  <span>Payment method</span>
                  <select value={form.paymentMode} onChange={(event) => setForm({ ...form, paymentMode: event.target.value as PaymentMode })}>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="bank">Bank</option>
                    <option value="other">Other</option>
                  </select>
                </label>
              </div>

              <label className={styles.accountSelectField}><span>Money account</span><select value={form.accountId} onChange={(event) => setForm({ ...form, accountId: event.target.value })}>{accounts.filter((account) => account.active).map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select><small>Choose where the money was received or paid from. Personal accounts can also hold business money.</small></label>

              <label className={styles.noteField}>
                <span>Note <small>(optional)</small></span>
                <input value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="What was this transaction for?" maxLength={120} />
              </label>

              {formError && <p className={styles.formError}>{formError}</p>}
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelButton} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className={styles.saveButton}>{editingId ? "Save changes" : "Save entry"}</button>
              </div>
              <p className={styles.localNotice}>Frontend preview: accounts and entries are temporary and will clear when this page reloads. Database saving will be connected in the backend phase.</p>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
