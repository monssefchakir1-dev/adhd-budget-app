import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  monthKey,
  payKey,
  paycheckFor,
  SAVINGS_LINK,
  seed,
  snapshot,
  TODAY,
  type Colorway,
  type Debt,
  type DebtFocus,
  type Goal,
  type Group,
  type State,
} from "./model";

const KEY = "adhd-budget-v1";

type Store = {
  state: State;
  setName: (name: string) => void;
  setPaycheck: (amount: number) => void;
  setCash: (amount: number) => void;
  setNight: (night: boolean) => void;
  setColorway: (colorway: Colorway) => void;
  setCurrency: (currency: string) => void;
  setStartingBalance: (amount: number) => void;
  setRollover: (rollover: boolean) => void;
  setDebtFocus: (focus: DebtFocus) => void;
  setBrowse: (year: number, month: number) => void;
  payBill: (id: string, amount: number) => void;
  addSpend: (name: string, amount: number, group: Group, when: { year: number; month: number; day: number }, notes?: string) => void;
  updateBill: (id: string, patch: { name?: string; plan?: number; group?: Group; dueDay?: number }) => void;
  updateSpend: (id: string, patch: { name?: string; amount?: number; group?: Group; year?: number; month?: number; day?: number; notes?: string }) => void;
  updateSaving: (id: string, patch: { name?: string; amount?: number }) => void;
  payDebt: (id: string, amount: number) => void;
  addDebt: (debt: Omit<Debt, "id">) => void;
  updateDebt: (id: string, patch: Partial<Omit<Debt, "id">>) => void;
  removeDebt: (id: string) => void;
  addGoal: (goal: Omit<Goal, "id">) => void;
  updateGoal: (id: string, patch: Partial<Omit<Goal, "id">>) => void;
  removeGoal: (id: string) => void;
  restore: (next: State) => void;
  archiveYear: (label: string) => void;
  reset: () => void;
};

const BudgetContext = createContext<Store | null>(null);

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    const saved = JSON.parse(raw) as Partial<State>;
    const base = seed();
    const next: State = { ...base, ...saved };
    next.spends = (saved.spends ?? []).map((spend) => ({
      ...spend,
      day: spend.day || TODAY.day,
      group: spend.group ?? "Wants",
      notes: spend.notes ?? "",
    }));
    const oldDebtIds = new Set(["visa", "car", "student"]);
    const savedDebts = saved.debts ?? base.debts;
    next.debts = savedDebts.some((debt) => oldDebtIds.has(debt.id))
      ? base.debts
      : savedDebts.map((debt, index) => {
          const fallback = base.debts[index] ?? base.debts[0];
          return {
            ...fallback,
            ...debt,
            original: debt.original || debt.balance || fallback.original,
            apr: debt.apr ?? fallback.apr,
          };
        });
    next.goals = (saved.goals ?? base.goals)
      .map((goal) => ({
        ...goal,
        note: goal.note ?? "",
        name: goal.id === "visa-goal" || goal.name.includes("Visa") ? "Pay off the credit card" : goal.name,
        id: goal.id === "visa-goal" ? "credit-goal" : goal.id,
      }))
      .map((goal) => (goal.id === "credit-goal" ? { ...goal, target: goal.target === 12000 ? 6200 : goal.target } : goal))
      .filter((goal) => goal.id !== "emergency-goal");
    next.archives = saved.archives ?? [];
    next.colorway = saved.colorway ?? "clay";
    next.currency = saved.currency ?? "USD";
    next.startingBalance = saved.startingBalance ?? 0;
    next.rollover = saved.rollover ?? false;
    next.debtFocus = saved.debtFocus ?? "interest";
    next.paycheckByMonth = saved.paycheckByMonth ?? {};
    return next;
  } catch {
    return seed();
  }
}

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const store: Store = {
    state,
    setName: (name) => setState((current) => ({ ...current, name })),
    setPaycheck: (paycheck) =>
      setState((current) => {
        if (paycheck === current.paycheck) return current;
        const history = { ...current.paycheckByMonth };
        for (let year = TODAY.year - 2; year <= TODAY.year; year += 1) {
          const lastMonth = year === TODAY.year ? TODAY.month - 1 : 12;
          for (let month = 1; month <= lastMonth; month += 1) {
            const key = monthKey(year, month);
            if (history[key] == null) history[key] = current.paycheck;
          }
        }
        history[monthKey(TODAY.year, TODAY.month)] = paycheck;
        for (let month = TODAY.month + 1; month <= 12; month += 1) {
          delete history[monthKey(TODAY.year, month)];
        }
        for (let year = TODAY.year + 1; year <= TODAY.year + 2; year += 1) {
          for (let month = 1; month <= 12; month += 1) {
            delete history[monthKey(year, month)];
          }
        }
        return { ...current, paycheck, paycheckByMonth: history };
      }),
    setCash: (cash) => setState((current) => ({ ...current, cash })),
    setNight: (night) => setState((current) => ({ ...current, night })),
    setColorway: (colorway) => setState((current) => ({ ...current, colorway })),
    setCurrency: (currency) => setState((current) => ({ ...current, currency })),
    setStartingBalance: (startingBalance) => setState((current) => ({ ...current, startingBalance })),
    setRollover: (rollover) => setState((current) => ({ ...current, rollover })),
    setDebtFocus: (debtFocus) => setState((current) => ({ ...current, debtFocus })),
    setBrowse: (browseYear, browseMonth) => setState((current) => ({ ...current, browseYear, browseMonth })),
    payBill: (id, amount) =>
      setState((current) => {
        const bill = current.bills.find((item) => item.id === id);
        if (!bill) return current;
        const key = payKey(TODAY.year, TODAY.month, id);
        const paid = current.payments[key] ?? 0;
        const next = Math.min(bill.plan, paid + amount);
        const added = next - paid;
        if (added <= 0) return current;
        const link = bill.group === "Savings" ? SAVINGS_LINK[id] : undefined;
        return {
          ...current,
          payments: { ...current.payments, [key]: next },
          funds: link
            ? current.funds.map((fund) =>
                fund.id === link.fundId ? { ...fund, balance: fund.balance + added } : fund,
              )
            : current.funds,
          goals: link?.goalId
            ? current.goals.map((goal) =>
                goal.id === link.goalId ? { ...goal, saved: goal.saved + added } : goal,
              )
            : current.goals,
        };
      }),
    addSpend: (name, amount, group, when, notes = "") =>
      setState((current) => ({
        ...current,
        spends: [
          ...current.spends,
          { id: crypto.randomUUID(), name, amount, group, year: when.year, month: when.month, day: when.day, notes },
        ],
      })),
    updateBill: (id, patch) =>
      setState((current) => {
        const previous = current.bills.find((bill) => bill.id === id);
        const bills = current.bills.map((bill) => {
          if (bill.id !== id) return bill;
          const dueDay = patch.dueDay == null ? bill.dueDay : Math.min(31, Math.max(1, Math.round(patch.dueDay)));
          const plan = patch.plan == null || Number.isNaN(patch.plan) ? bill.plan : Math.max(0, patch.plan);
          const name = patch.name == null ? bill.name : patch.name;
          return { ...bill, ...patch, name, plan, dueDay };
        });
        const next = bills.find((bill) => bill.id === id);
        const link = SAVINGS_LINK[id];
        const staysSavings = next?.group === "Savings" || previous?.group === "Savings";
        if (!link || !next || !staysSavings || patch.name == null) return { ...current, bills };
        return {
          ...current,
          bills,
          funds: current.funds.map((fund) => (fund.id === link.fundId ? { ...fund, name: next.name } : fund)),
          goals: current.goals.map((goal) => (goal.id === link.goalId ? { ...goal, name: next.name } : goal)),
        };
      }),
    updateSpend: (id, patch) =>
      setState((current) => ({
        ...current,
        spends: current.spends.map((spend) => {
          if (spend.id !== id) return spend;
          const next = { ...spend, ...patch };
          if (patch.amount != null && !Number.isNaN(patch.amount)) next.amount = Math.max(0, patch.amount);
          const last = new Date(next.year, next.month, 0).getDate();
          next.day = Math.min(last, Math.max(1, Math.round(next.day)));
          return next;
        }),
      })),
    updateSaving: (id, patch) =>
      setState((current) => {
        const link = SAVINGS_LINK[id];
        const name = patch.name;
        const amount = patch.amount == null || Number.isNaN(patch.amount) ? undefined : Math.max(0, patch.amount);
        return {
          ...current,
          bills: current.bills.map((bill) => (bill.id === id ? { ...bill, name: name ?? bill.name } : bill)),
          funds: current.funds.map((fund) =>
            link && fund.id === link.fundId ? { ...fund, name: name ?? fund.name, balance: amount ?? fund.balance } : fund,
          ),
          goals: current.goals.map((goal) =>
            link?.goalId && goal.id === link.goalId ? { ...goal, name: name ?? goal.name, saved: amount ?? goal.saved } : goal,
          ),
        };
      }),
    payDebt: (id, amount) =>
      setState((current) => ({
        ...current,
        debts: current.debts.map((debt) =>
          debt.id === id ? { ...debt, balance: Math.max(0, debt.balance - amount) } : debt,
        ),
        debtPaid: {
          ...current.debtPaid,
          [payKey(TODAY.year, TODAY.month, id)]: (current.debtPaid[payKey(TODAY.year, TODAY.month, id)] ?? 0) + amount,
        },
      })),
    addDebt: (debt) =>
      setState((current) => ({
        ...current,
        debts: [...current.debts, { ...debt, id: crypto.randomUUID(), original: debt.original || debt.balance }],
      })),
    updateDebt: (id, patch) =>
      setState((current) => ({
        ...current,
        debts: current.debts.map((debt) => (debt.id === id ? { ...debt, ...patch } : debt)),
      })),
    removeDebt: (id) => setState((current) => ({ ...current, debts: current.debts.filter((debt) => debt.id !== id) })),
    addGoal: (goal) =>
      setState((current) => ({
        ...current,
        goals: [...current.goals, { ...goal, id: crypto.randomUUID(), note: goal.note ?? "" }],
      })),
    updateGoal: (id, patch) =>
      setState((current) => ({
        ...current,
        goals: current.goals.map((goal) => (goal.id === id ? { ...goal, ...patch } : goal)),
      })),
    removeGoal: (id) => setState((current) => ({ ...current, goals: current.goals.filter((goal) => goal.id !== id) })),
    restore: (next) => setState({ ...seed(), ...next }),
    archiveYear: (label) =>
      setState((current) => {
        const year = current.browseYear;
        const months = Array.from({ length: 12 }, (_, index) => snapshot(current, year, index + 1));
        const income =
          Array.from({ length: 12 }, (_, index) => paycheckFor(current, year, index + 1)).reduce((sum, value) => sum + value, 0) +
          current.startingBalance;
        const out = months.reduce((sum, month) => sum + month.paidSoFar, 0);
        return {
          ...current,
          archives: [
            ...current.archives,
            { id: crypto.randomUUID(), label: label.trim() || String(year), year, savedAt: new Date().toISOString(), income, out },
          ],
          payments: {},
          debtPaid: {},
          spends: [],
          browseYear: year + 1,
          browseMonth: 1,
        };
      }),
    reset: () => setState(seed()),
  };

  return <BudgetContext.Provider value={store}>{children}</BudgetContext.Provider>;
}

export function useBudget() {
  const store = useContext(BudgetContext);
  if (!store) throw new Error("Budget store missing");
  return store;
}
