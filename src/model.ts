export type Group = "Needs" | "Wants" | "Savings";
export type Colorway = "clay" | "blush" | "sage" | "lavender" | "sky";
export type DebtFocus = "interest" | "balance";
export type GoalStatus = "Not started" | "In progress" | "Done";

export type Bill = {
  id: string;
  name: string;
  group: Group;
  dueDay: number;
  plan: number;
};

export type Debt = {
  id: string;
  name: string;
  balance: number;
  original: number;
  minimum: number;
  apr: number;
};

export type Fund = {
  id: string;
  name: string;
  balance: number;
};

export type Goal = {
  id: string;
  name: string;
  target: number;
  saved: number;
  due?: string;
  note: string;
};

export type Spend = {
  id: string;
  name: string;
  amount: number;
  group: Group;
  year: number;
  month: number;
  day: number;
  notes: string;
};

export type Archive = {
  id: string;
  label: string;
  year: number;
  savedAt: string;
  income: number;
  out: number;
};

export type State = {
  name: string;
  night: boolean;
  colorway: Colorway;
  cash: number;
  paycheck: number;
  /** Locked paycheck per calendar month (`year-month`). Past months keep their amount when Setup paycheck changes. */
  paycheckByMonth: Record<string, number>;
  currency: string;
  startingBalance: number;
  rollover: boolean;
  debtFocus: DebtFocus;
  bills: Bill[];
  debts: Debt[];
  funds: Fund[];
  goals: Goal[];
  payments: Record<string, number>;
  debtPaid: Record<string, number>;
  spends: Spend[];
  archives: Archive[];
  browseYear: number;
  browseMonth: number;
};

export const TODAY = { year: 2026, month: 9, day: 15 };

export const SAVINGS_LINK: Record<string, { fundId: string; goalId?: string }> = {
  vacation: { fundId: "vacation-fund", goalId: "vacation-goal" },
  emergency: { fundId: "emergency-fund" },
};

export const COLORWAYS: { id: Colorway; label: string; accent: string }[] = [
  { id: "clay", label: "Clay", accent: "#7c3a2b" },
  { id: "blush", label: "Blush", accent: "#c46b7b" },
  { id: "sage", label: "Sage", accent: "#6a8f6b" },
  { id: "lavender", label: "Lavender", accent: "#7a6ea8" },
  { id: "sky", label: "Sky", accent: "#5b87a8" },
];

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function payKey(year: number, month: number, id: string) {
  return `${year}-${month}-${id}`;
}

export function monthKey(year: number, month: number) {
  return `${year}-${month}`;
}

/** Paycheck used for a given month. History wins; otherwise current Setup paycheck. */
export function paycheckFor(state: State, year: number, month: number) {
  const locked = state.paycheckByMonth[monthKey(year, month)];
  return locked == null ? state.paycheck : locked;
}

export function isoDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function readDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const last = new Date(year, month, 0).getDate();
  if (month < 1 || month > 12 || day < 1 || day > last) return null;
  return { year, month, day };
}

export function daysFromToday(year: number, month: number, day: number) {
  const start = new Date(TODAY.year, TODAY.month - 1, TODAY.day);
  const end = new Date(year, month - 1, day);
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

let displayCurrency = "USD";

export function setDisplayCurrency(currency: string) {
  displayCurrency = currency || "USD";
}

export function money(value: number, currency = displayCurrency) {
  const abs = Math.abs(value);
  let formatted: string;
  try {
    formatted = abs.toLocaleString("en-US", { style: "currency", currency });
  } catch {
    formatted = abs.toLocaleString("en-US", { style: "currency", currency: "USD" });
  }
  return value < 0 ? `(${formatted})` : formatted;
}

export function goalStatus(goal: Goal): GoalStatus {
  if (goal.saved <= 0) return "Not started";
  if (goal.saved >= goal.target) return "Done";
  return "In progress";
}

export function clearBy(debt: Debt) {
  if (debt.minimum <= 0 || debt.balance <= 0) return "Paid off";
  const months = Math.ceil(debt.balance / debt.minimum);
  const date = new Date(TODAY.year, TODAY.month - 1 + months, 1);
  return `Clear by ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

export function averageApr(debts: Debt[]) {
  if (debts.length === 0) return 0;
  const total = debts.reduce((sum, debt) => sum + debt.balance, 0);
  if (total <= 0) return debts.reduce((sum, debt) => sum + debt.apr, 0) / debts.length;
  return debts.reduce((sum, debt) => sum + debt.apr * debt.balance, 0) / total;
}

export function seed(): State {
  return {
    name: "Olivia",
    night: false,
    colorway: "clay",
    cash: 240,
    paycheck: 4000,
    paycheckByMonth: {},
    currency: "USD",
    startingBalance: 0,
    rollover: false,
    debtFocus: "interest",
    bills: [
      { id: "rent", name: "Rent", group: "Needs", dueDay: 1, plan: 1400 },
      { id: "electric", name: "Electric", group: "Needs", dueDay: 18, plan: 128 },
      { id: "internet", name: "Internet", group: "Needs", dueDay: 22, plan: 40 },
      { id: "dining", name: "Dining", group: "Wants", dueDay: 20, plan: 120 },
      { id: "vacation", name: "Vacation", group: "Savings", dueDay: 16, plan: 200 },
      { id: "emergency", name: "Emergency fund", group: "Savings", dueDay: 16, plan: 300 },
    ],
    debts: [
      { id: "credit", name: "Credit card", balance: 6200, original: 8500, minimum: 155, apr: 22.9 },
      { id: "auto", name: "Auto loan", balance: 18900, original: 27500, minimum: 385, apr: 6.9 },
      { id: "mortgage", name: "Home mortgage", balance: 248000, original: 320000, minimum: 1685, apr: 6.5 },
    ],
    funds: [
      { id: "emergency-fund", name: "Emergency fund", balance: 8600 },
      { id: "vacation-fund", name: "Vacation", balance: 400 },
    ],
    goals: [
      {
        id: "vacation-goal",
        name: "Vacation",
        target: 2000,
        saved: 400,
        due: "2027-06-01",
        note: "Flights can wait. Keep putting money aside.",
      },
      {
        id: "credit-goal",
        name: "Pay off the credit card",
        target: 6200,
        saved: 2300,
        due: "2026-12-31",
        note: "Adding a little extra on top of the minimum.",
      },
    ],
    payments: {
      [payKey(2026, 9, "rent")]: 1400,
      [payKey(2026, 9, "electric")]: 50,
      [payKey(2026, 9, "dining")]: 80,
      [payKey(2026, 9, "vacation")]: 50,
      [payKey(2026, 9, "emergency")]: 300,
    },
    debtPaid: {},
    spends: [],
    archives: [],
    browseYear: 2026,
    browseMonth: 9,
  };
}

export type Snapshot = {
  needsLeft: number;
  savingsPlan: number;
  savingsPaid: number;
  leftToSave: number;
  extra: number;
  safe: number;
  paidSoFar: number;
  dueThisMonth: number;
  assets: number;
  liabilities: number;
  score: "A" | "B" | "C";
};

function monthIncome(state: State, year: number, month: number, withRollover: boolean) {
  let income = paycheckFor(state, year, month);
  if (month === 1) income += state.startingBalance;
  if (withRollover && state.rollover) {
    const prevYear = month === 1 ? year - 1 : year;
    const prevMonth = month === 1 ? 12 : month - 1;
    const previous = snapshotCore(state, prevYear, prevMonth, false);
    income += Math.max(0, previous.safe);
  }
  return income;
}

function snapshotCore(state: State, year: number, month: number, withRollover: boolean): Snapshot {
  const paid = (id: string) => state.payments[payKey(year, month, id)] ?? 0;
  const needsLeft = state.bills
    .filter((bill) => bill.group === "Needs")
    .reduce((sum, bill) => sum + Math.max(0, bill.plan - paid(bill.id)), 0);
  const savings = state.bills.filter((bill) => bill.group === "Savings");
  const savingsPlan = savings.reduce((sum, bill) => sum + bill.plan, 0);
  const savingsPaid = savings.reduce((sum, bill) => sum + Math.min(bill.plan, paid(bill.id)), 0);
  const leftToSave = Math.max(0, savingsPlan - savingsPaid);
  const extra = state.spends
    .filter((spend) => spend.year === year && spend.month === month)
    .reduce((sum, spend) => sum + spend.amount, 0);
  const income = monthIncome(state, year, month, withRollover);
  const safe = income - needsLeft - savingsPlan - extra;
  const needsWantsPaid = state.bills
    .filter((bill) => bill.group !== "Savings")
    .reduce((sum, bill) => sum + Math.min(bill.plan, paid(bill.id)), 0);
  const paidSoFar = needsWantsPaid + extra;
  const dueThisMonth = state.debts.reduce(
    (sum, debt) => sum + Math.max(0, debt.minimum - (state.debtPaid[payKey(year, month, debt.id)] ?? 0)),
    0,
  );
  const assets = state.funds.reduce((sum, fund) => sum + fund.balance, 0);
  const liabilities = state.debts.reduce((sum, debt) => sum + debt.balance, 0);
  let score: Snapshot["score"] = "B";
  if (safe <= 0 || paidSoFar > income) score = "C";
  else if (savingsPaid > 0 && paidSoFar <= income * 0.8) score = "A";
  return { needsLeft, savingsPlan, savingsPaid, leftToSave, extra, safe, paidSoFar, dueThisMonth, assets, liabilities, score };
}

export function snapshot(state: State, year: number, month: number): Snapshot {
  return snapshotCore(state, year, month, true);
}

export type Upcoming = {
  id: string;
  name: string;
  year: number;
  month: number;
  dueDay: number;
  plan: number;
  paid: number;
  left: number;
  soon: boolean;
  kind: "bill" | "spend";
};

export function comingUp(state: State): Upcoming[] {
  const { year, month, day } = TODAY;
  const bills = state.bills
    .filter((bill) => bill.group === "Needs" || bill.group === "Wants")
    .map((bill) => {
      const paid = state.payments[payKey(year, month, bill.id)] ?? 0;
      const left = Math.max(0, bill.plan - paid);
      const distance = bill.dueDay - day;
      return {
        id: bill.id,
        name: bill.name,
        year,
        month,
        dueDay: bill.dueDay,
        plan: bill.plan,
        paid,
        left,
        soon: distance <= 3,
        kind: "bill" as const,
      };
    })
    .filter((bill) => bill.left > 0);
  const spends = state.spends
    .filter((spend) => spend.group === "Needs" || spend.group === "Wants")
    .filter((spend) => {
      const distance = daysFromToday(spend.year, spend.month, spend.day);
      const thisMonth = spend.year === year && spend.month === month;
      return distance >= 0 && (thisMonth || distance <= 3);
    })
    .map((spend) => {
      const distance = daysFromToday(spend.year, spend.month, spend.day);
      return {
        id: spend.id,
        name: spend.name,
        year: spend.year,
        month: spend.month,
        dueDay: spend.day,
        plan: spend.amount,
        paid: 0,
        left: spend.amount,
        soon: distance <= 3,
        kind: "spend" as const,
      };
    });
  return [...bills, ...spends].sort(
    (a, b) => daysFromToday(a.year, a.month, a.dueDay) - daysFromToday(b.year, b.month, b.dueDay) || a.name.localeCompare(b.name),
  );
}

export type LogRow = {
  id: string;
  year: number;
  month: number;
  day: number;
  name: string;
  group: Group | string;
  amount: number;
  notes: string;
};

export function transactionLog(state: State, year: number, month: number): LogRow[] {
  const spends: LogRow[] = state.spends
    .filter((spend) => spend.year === year && spend.month === month)
    .map((spend) => ({
      id: spend.id,
      year: spend.year,
      month: spend.month,
      day: spend.day,
      name: spend.name,
      group: spend.group,
      amount: spend.amount,
      notes: spend.notes,
    }));
  const bills: LogRow[] = [];
  for (const bill of state.bills) {
    const paid = state.payments[payKey(year, month, bill.id)] ?? 0;
    if (paid <= 0) continue;
    bills.push({
      id: `pay-${bill.id}`,
      year,
      month,
      day: bill.dueDay,
      name: bill.name,
      group: bill.group,
      amount: paid,
      notes: "",
    });
  }
  return [...spends, ...bills].sort((a, b) => a.day - b.day || a.name.localeCompare(b.name));
}

export function yearReview(state: State, year: number) {
  return MONTHS.map((_, index) => {
    const month = index + 1;
    const figures = snapshot(state, year, month);
    const income = monthIncome(state, year, month, true);
    const spent = figures.paidSoFar;
    return { month, income, out: spent, net: income - spent };
  });
}
