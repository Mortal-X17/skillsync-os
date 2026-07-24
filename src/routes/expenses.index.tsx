import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Plus, TrendingDown, TrendingUp, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, Chip } from "@/components/ui/primitives";
import { EmptyState } from "@/components/common/EmptyState";
import { BottomSheet } from "@/components/edit/Sheet";
import { TextField } from "@/components/edit/Fields";
import { ActionButton, IconButton } from "@/components/edit/Buttons";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import type { Transaction } from "@/lib/schema";

export const Route = createFileRoute("/expenses/")({
  head: () => ({
    meta: [
      { title: "Expenses — SkillSync" },
      { name: "description", content: "Log daily credits and debits with a monthly summary." },
      { property: "og:title", content: "Expenses — SkillSync" },
      { property: "og:description", content: "Track money in and out, month by month." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ExpensesPage,
});

function fmtMoney(n: number) {
  const abs = Math.abs(n).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `₹${abs}`;
}

function monthKey(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function ExpensesPage() {
  const hydrated = useHydrated();
  const enabled = useAppStore((s) => s.preferences.modules.expenses);
  const transactions = useAppStore((s) => s.expenses.transactions);
  const addTransaction = useAppStore((s) => s.addTransaction);
  const deleteTransaction = useAppStore((s) => s.deleteTransaction);

  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"credit" | "debit">("debit");

  const groups = useMemo(() => {
    const byMonth = new Map<string, Transaction[]>();
    for (const t of transactions) {
      const k = monthKey(t.at);
      const arr = byMonth.get(k) ?? [];
      arr.push(t);
      byMonth.set(k, arr);
    }
    return Array.from(byMonth.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([key, list]) => {
        list.sort((a, b) => b.at - a.at);
        let credit = 0;
        let debit = 0;
        for (const t of list) {
          if (t.type === "credit") credit += t.amount;
          else debit += t.amount;
        }
        return {
          key,
          label: monthLabel(key),
          list,
          credit,
          debit,
          balance: credit - debit,
        };
      });
  }, [transactions]);

  const submit = () => {
    const value = Number(amount);
    if (!title.trim() || !value || value <= 0) {
      toast.error("Add a title and a positive amount");
      return;
    }
    addTransaction({ title: title.trim(), amount: value, type });
    setTitle("");
    setAmount("");
    setType("debit");
    setAddOpen(false);
  };

  if (hydrated && !enabled) {
    return <Navigate to="/profile/modules" />;
  }

  return (
    <AppShell>
      <header className="mb-4 flex items-center gap-3 px-5 pt-1">
        <Link
          to="/profile"
          className="glass flex h-10 w-10 items-center justify-center rounded-full active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft className="h-[17px] w-[17px] text-muted-foreground" strokeWidth={1.75} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Money
          </div>
          <h1 className="truncate text-[22px] font-semibold leading-tight tracking-[-0.02em]">
            Expenses.
          </h1>
        </div>
        <IconButton
          variant="primary"
          size="lg"
          aria-label="New transaction"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="h-[17px] w-[17px]" strokeWidth={2} />
        </IconButton>
      </header>

      <div className="space-y-6 px-5 pb-24">
        {hydrated && groups.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No transactions yet"
            hint="Log a credit or debit to start tracking."
            action={
              <ActionButton onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4" /> Add transaction
              </ActionButton>
            }
          />
        ) : null}

        {groups.map((g) => (
          <section key={g.key} className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[13px] font-semibold tracking-tight">{g.label}</h2>
              <Chip tone={g.balance >= 0 ? "success" : "danger"}>
                {g.balance >= 0 ? "+" : "−"}
                {fmtMoney(g.balance)}
              </Chip>
            </div>
            <Card className="p-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground">
                    Credit
                  </div>
                  <div className="mt-1 text-[15px] font-semibold text-emerald-300">
                    {fmtMoney(g.credit)}
                  </div>
                </div>
                <div>
                  <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground">
                    Debit
                  </div>
                  <div className="mt-1 text-[15px] font-semibold text-[#fca5a5]">
                    {fmtMoney(g.debit)}
                  </div>
                </div>
                <div>
                  <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground">
                    Balance
                  </div>
                  <div
                    className={`mt-1 text-[15px] font-semibold ${g.balance >= 0 ? "text-emerald-300" : "text-[#fca5a5]"}`}
                  >
                    {fmtMoney(g.balance)}
                  </div>
                </div>
              </div>
            </Card>
            <div className="space-y-1.5">
              {g.list.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] px-3 py-3"
                >
                  <span
                    className={
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl " +
                      (t.type === "credit"
                        ? "bg-emerald-400/15 text-emerald-300"
                        : "bg-[#ef4444]/15 text-[#fca5a5]")
                    }
                  >
                    {t.type === "credit" ? (
                      <TrendingUp className="h-4 w-4" strokeWidth={1.75} />
                    ) : (
                      <TrendingDown className="h-4 w-4" strokeWidth={1.75} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-medium">
                      {t.title}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {new Date(t.at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                  <div
                    className={`shrink-0 text-[14px] font-semibold ${t.type === "credit" ? "text-emerald-300" : "text-[#fca5a5]"}`}
                  >
                    {t.type === "credit" ? "+" : "−"}
                    {fmtMoney(t.amount)}
                  </div>
                  <IconButton
                    size="sm"
                    variant="danger"
                    aria-label="Delete"
                    onClick={() => deleteTransaction(t.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </IconButton>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <BottomSheet open={addOpen} onClose={() => setAddOpen(false)} title="New transaction">
        <div className="space-y-3">
          <div className="flex gap-2">
            {(["debit", "credit"] as const).map((tp) => (
              <button
                key={tp}
                onClick={() => setType(tp)}
                className={
                  "flex-1 rounded-xl border py-2.5 text-[13px] font-medium capitalize transition-colors " +
                  (type === tp
                    ? tp === "credit"
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                      : "border-[#ef4444]/30 bg-[#ef4444]/10 text-[#fca5a5]"
                    : "border-white/[0.06] bg-white/[0.02] text-muted-foreground")
                }
              >
                {tp}
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] text-muted-foreground">Title</label>
            <TextField
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Groceries"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] text-muted-foreground">Amount</label>
            <TextField
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
          </div>
          <ActionButton className="w-full" onClick={submit}>
            Save
          </ActionButton>
        </div>
      </BottomSheet>
    </AppShell>
  );
}
