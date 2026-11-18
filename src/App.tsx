import { useMemo, useState } from "react";
import {
  COLORWAYS,
  MONTHS,
  MONTHS_SHORT,
  SAVINGS_LINK,
  TODAY,
  averageApr,
  clearBy,
  comingUp,
  daysFromToday,
  goalStatus,
  isoDate,
  money,
  payKey,
  paycheckFor,
  readDate,
  setDisplayCurrency,
  snapshot,
  transactionLog,
  yearReview,
  type Group,
} from "./model";
import { useBudget } from "./store";

const TABS = ["Setup", "Home", "Today", "Calendar", "Goals", "Savings", "Debt", "Envelopes", "Yearly review", "Transaction log", "Settings"] as const;
type Tab = (typeof TABS)[number];

export function App() {
  const budget = useBudget();
  const { state } = budget;
  setDisplayCurrency(state.currency);
  const [tab, setTab] = useState<Tab>("Today");
  const [open, setOpen] = useState(false);
  const today = snapshot(state, TODAY.year, TODAY.month);
  const date = new Date(TODAY.year, TODAY.month - 1, TODAY.day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={`${state.night ? "night app" : "app"} color-${state.colorway}`}>
      <nav className="side" aria-label="Planner">
        <div className={`grade ${today.score}`} aria-label={today.score}>{today.score}</div>
        <p className="score-label">Your score this month</p>
        <button className="track" type="button" onClick={() => setOpen(true)}>+ Track spending</button>
        {TABS.map((item) => (
          <button key={item} type="button" className={item === tab ? "current" : ""} onClick={() => setTab(item)}>
            {item}
          </button>
        ))}
      </nav>
      <main className="page">
        {tab === "Today" && <Today date={date} />}
        {tab === "Setup" && <Setup />}
        {tab === "Home" && <Home />}
        {tab === "Calendar" && <Calendar />}
        {tab === "Goals" && <Goals />}
        {tab === "Savings" && <Savings />}
        {tab === "Debt" && <Debt />}
        {tab === "Envelopes" && <Envelopes />}
        {tab === "Yearly review" && <YearlyReview />}
        {tab === "Transaction log" && <TransactionLog />}
        {tab === "Settings" && <Settings />}
      </main>
      {open && <Track onClose={() => setOpen(false)} />}
    </div>
  );
}

function Today({ date }: { date: string }) {
  const { state } = useBudget();
  const figures = snapshot(state, TODAY.year, TODAY.month);
  const rows = comingUp(state);
  return (
    <>
      <div>
        <h1>Hi, {state.name}</h1>
        <p className="lede">A calm look at your money.</p>
        <p className="fine">{date}</p>
      </div>
      <div className="pair">
        <article className="card">
          <p className="meta">Assets</p>
          <p className="money">{money(figures.assets)}</p>
          <p className="fine">Money you have</p>
        </article>
        <article className="card">
          <p className="meta">Liabilities</p>
          <p className="money">{money(figures.liabilities)}</p>
          <p className="fine">Money you owe</p>
        </article>
      </div>
      <div className="trio">
        <article className="card safe">
          <p className="meta">Safe to spend</p>
          <p className="money">{money(figures.safe)}</p>
          <p className="fine">Left to use</p>
        </article>
        <article className="card">
          <p className="meta">Due this month</p>
          <p className="money">{money(figures.dueThisMonth)}</p>
          <p className="fine">This month's payment</p>
        </article>
        <article className="card">
          <p className="meta">Left to save</p>
          <p className="money">{money(figures.leftToSave)}</p>
          <p className="fine">Still open this month</p>
        </article>
      </div>
      <div className="head"><h2>Coming up</h2></div>
      {rows.length === 0 && <p className="lede">Nothing coming up.</p>}
      <div>
        {rows.map((row) => (
          <div className="row" key={row.id}>
            <span className="subline">{MONTHS_SHORT[row.month - 1]} {row.dueDay}</span>
            <span>
              <span className="who">{row.name}</span>
              <p className="subline">Plan {money(row.plan)} · Paid {money(row.paid)} · Left {money(row.left)}</p>
            </span>
            <span className={row.soon ? "soon" : "later"}>{row.soon ? "Due soon" : "Later"}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function Setup() {
  const { state, setName, setPaycheck, setCash, setCurrency, setStartingBalance, setRollover } = useBudget();
  return (
    <>
      <div><h1>Setup</h1><p className="lede">Let's set up your money.</p></div>
      <div className="fields">
        <label>Your name<input value={state.name} onChange={(event) => setName(event.target.value)} /></label>
        <label>Paycheck<input value={state.paycheck} onChange={(event) => setPaycheck(Number(event.target.value) || 0)} /></label>
        <label>Cash in hand<input value={state.cash} onChange={(event) => setCash(Number(event.target.value) || 0)} /></label>
        <label>Your currency
          <select value={state.currency} onChange={(event) => setCurrency(event.target.value)}>
            <option value="USD">US Dollar — USD</option>
            <option value="EUR">Euro — EUR</option>
            <option value="GBP">British Pound — GBP</option>
            <option value="CAD">Canadian Dollar — CAD</option>
          </select>
        </label>
        <label>Starting balance<input value={state.startingBalance} onChange={(event) => setStartingBalance(Number(event.target.value) || 0)} /></label>
      </div>
      <p className="fine">Cash in hand is money you already hold. It is not a bill. Starting balance is added once, to the first month only. Changing paycheck updates this month forward, and Yearly review updates on its own. Past months keep the old amount.</p>
      <article className="card">
        <div className="item-head">
          <div>
            <p className="who">Roll over leftover money</p>
            <p className="subline">When a month ends with money unspent, carry it into the next month.</p>
          </div>
          <button className={state.rollover ? "pill on" : "pill"} type="button" onClick={() => setRollover(!state.rollover)}>
            {state.rollover ? "On" : "Off"}
          </button>
        </div>
      </article>
    </>
  );
}

function Home() {
  const { state, setBrowse } = useBudget();
  const figures = snapshot(state, state.browseYear, state.browseMonth);
  const groups: Group[] = ["Needs", "Wants", "Savings"];
  return (
    <>
      <div className="year">
        <button className="pill" type="button" onClick={() => setBrowse(state.browseYear - 1, state.browseMonth)}>Prev</button>
        <h1>{state.browseYear}</h1>
        <button className="pill" type="button" onClick={() => setBrowse(state.browseYear + 1, state.browseMonth)}>Next</button>
      </div>
      <div className="months">
        {MONTHS_SHORT.map((label, index) => (
          <button key={label} type="button" className={index + 1 === state.browseMonth ? "pill on" : "pill"} onClick={() => setBrowse(state.browseYear, index + 1)}>
            {label}
          </button>
        ))}
      </div>
      <h2>{MONTHS[state.browseMonth - 1]} {state.browseYear}</h2>
      <div className="trio">
        <article className="card"><p className="meta">Paycheck</p><p className="money">{money(paycheckFor(state, state.browseYear, state.browseMonth))}</p></article>
        <article className="card"><p className="meta">Paid so far</p><p className="money">{money(figures.paidSoFar)}</p></article>
        <article className="card safe"><p className="meta">Safe to spend</p><p className="money">{money(figures.safe)}</p></article>
      </div>
      {groups.map((group) => {
        const bills = state.bills.filter((bill) => bill.group === group);
        const plan = bills.reduce((sum, bill) => sum + bill.plan, 0);
        const paid = bills.reduce((sum, bill) => sum + Math.min(bill.plan, state.payments[payKey(state.browseYear, state.browseMonth, bill.id)] ?? 0), 0);
        const width = plan > 0 ? Math.min(100, (paid / plan) * 100) : 0;
        return (
          <article className="card" key={group}>
            <p className="who">{group}</p>
            <p className="subline">Plan {money(plan)} · Paid {money(paid)} · Left {money(Math.max(0, plan - paid))}</p>
            <div className="bar compare" aria-hidden="true">
              <span className="planned" style={{ width: "100%" }} />
              <span className="actual" style={{ width: `${width}%` }} />
            </div>
          </article>
        );
      })}
      <ShareDonuts
        items={groups.map((group) => {
          const plan = state.bills.filter((bill) => bill.group === group).reduce((sum, bill) => sum + bill.plan, 0);
          return { group, plan };
        })}
      />
    </>
  );
}

function ShareDonuts({ items }: { items: { group: Group; plan: number }[] }) {
  const total = items.reduce((sum, item) => sum + item.plan, 0) || 1;
  const warm: Record<Group, string> = { Needs: "#b85c3a", Wants: "#e0a85c", Savings: "#c47a5a" };
  let start = 0;
  const stops = items.map((item) => {
    const angle = (item.plan / total) * 360;
    const from = start;
    const to = start + angle;
    start = to;
    return `${warm[item.group]} ${from}deg ${to}deg`;
  });
  return (
    <article className="card donut-card">
      <p className="who">Where the plan goes</p>
      <p className="subline">Needs, Wants, and Savings in one look.</p>
      <p className="money donut-total">{money(total)}</p>
      <p className="fine donut-total-label">Plan this month</p>
      <div className="donut-stage">
        <div
          className="donut large"
          style={{ background: `conic-gradient(${stops.join(", ")})` }}
          aria-label="Needs, Wants, and Savings share"
        >
          <div className="donut-hole" />
        </div>
        <div className="donut-legend">
          {items.map((item) => {
            const percent = Math.round((item.plan / total) * 100);
            return (
              <div className="legend-row" key={item.group}>
                <span className="legend-dot" style={{ background: warm[item.group] }} />
                <span className="who">{item.group}</span>
                <span className="subline">{percent}% · {money(item.plan)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function Calendar() {
  const { state, setBrowse, updateBill, updateSpend } = useBudget();
  const days = new Date(state.browseYear, state.browseMonth, 0).getDate();
  const spends = state.spends.filter((spend) => spend.year === state.browseYear && spend.month === state.browseMonth && spend.day <= days);
  const marked = new Set([...state.bills.map((bill) => bill.dueDay), ...spends.map((spend) => spend.day)]);
  return (
    <>
      <div className="head">
        <h1>{MONTHS[state.browseMonth - 1]} {state.browseYear}</h1>
        <div>
          <button className="pill" type="button" onClick={() => setBrowse(state.browseMonth === 1 ? state.browseYear - 1 : state.browseYear, state.browseMonth === 1 ? 12 : state.browseMonth - 1)}>Prev</button>
          <button className="pill" type="button" onClick={() => setBrowse(state.browseMonth === 12 ? state.browseYear + 1 : state.browseYear, state.browseMonth === 12 ? 1 : state.browseMonth + 1)}>Next</button>
        </div>
      </div>
      <p className="lede">Repeats every month. The plan stays. Paid goes back to $0.00. Change a date below if it is wrong.</p>
      <div className="cal">
        {Array.from({ length: days }, (_, index) => {
          const day = index + 1;
          return <div key={day} className={marked.has(day) ? "day on" : "day"}>{day}</div>;
        })}
      </div>
      {state.bills.filter((bill) => bill.dueDay <= days).map((bill) => (
        <article className="card" key={bill.id}>
          <p className="who">{MONTHS_SHORT[state.browseMonth - 1]} {bill.dueDay} · {bill.name}</p>
          <p className="subline">Plan {money(bill.plan)} · {bill.group}</p>
          <div className="fix">
            <GroupPick value={bill.group} onChange={(group) => updateBill(bill.id, { group })} />
            <label>Due day
              <input type="number" min={1} max={31} value={bill.dueDay} onChange={(event) => updateBill(bill.id, { dueDay: Number(event.target.value) })} />
            </label>
          </div>
        </article>
      ))}
      {spends.map((spend) => (
        <article className="card" key={spend.id}>
          <p className="who">{MONTHS_SHORT[spend.month - 1]} {spend.day} · {spend.name}</p>
          <p className="subline">{money(spend.amount)} · {spend.group}</p>
          <div className="fix">
            <GroupPick value={spend.group} onChange={(group) => updateSpend(spend.id, { group })} />
            <label>Date
              <input type="date" value={isoDate(spend.year, spend.month, spend.day)} onChange={(event) => {
                const when = readDate(event.target.value);
                if (when) updateSpend(spend.id, when);
              }} />
            </label>
          </div>
        </article>
      ))}
    </>
  );
}

function Goals() {
  const { state, addGoal, updateGoal, removeGoal } = useBudget();
  const [editId, setEditId] = useState<string | null>(null);
  const counts = {
    "Not started": state.goals.filter((goal) => goalStatus(goal) === "Not started").length,
    "In progress": state.goals.filter((goal) => goalStatus(goal) === "In progress").length,
    Done: state.goals.filter((goal) => goalStatus(goal) === "Done").length,
  };
  return (
    <>
      <div className="head">
        <div><h1>Goals</h1><p className="lede">A goal is a number still to reach.</p></div>
        <button className="solid" type="button" onClick={() => addGoal({ name: "New goal", target: 1000, saved: 0, note: "" })}>+ New goal</button>
      </div>
      <div className="trio">
        <article className="card"><p className="meta">Not started</p><p className="money">{counts["Not started"]}</p></article>
        <article className="card"><p className="meta">In progress</p><p className="money">{counts["In progress"]}</p></article>
        <article className="card safe"><p className="meta">Done</p><p className="money">{counts.Done}</p></article>
      </div>
      {state.goals.map((goal) => {
        const left = Math.max(0, goal.target - goal.saved);
        const width = Math.min(100, goal.target > 0 ? (goal.saved / goal.target) * 100 : 0);
        const status = goalStatus(goal);
        return (
          <article className="card" key={goal.id}>
            <div className="item-head">
              <div>
                <p className="who">{goal.name}</p>
                <p className={`status ${status === "Done" ? "done" : status === "In progress" ? "progress" : "wait"}`}>{status}</p>
              </div>
              <div className="row-actions">
                <button className="ghost" type="button" onClick={() => setEditId(editId === goal.id ? null : goal.id)}>Edit</button>
                <button className="ghost" type="button" onClick={() => removeGoal(goal.id)}>Delete</button>
              </div>
            </div>
            <p className="money">{money(left)}</p>
            <p className="fine">Left to go · Goal {money(goal.target)} · Saved {money(goal.saved)}{goal.due ? ` · by ${goal.due}` : ""}</p>
            {goal.note && <p className="subline">{goal.note}</p>}
            <div className="bar" aria-hidden="true"><span style={{ width: `${width}%` }} /></div>
            {editId === goal.id && (
              <div className="fix">
                <label>Name<input value={goal.name} onChange={(event) => updateGoal(goal.id, { name: event.target.value })} /></label>
                <label>Target<input inputMode="decimal" value={goal.target} onChange={(event) => updateGoal(goal.id, { target: Number(event.target.value) || 0 })} /></label>
                <label>Saved<input inputMode="decimal" value={goal.saved} onChange={(event) => updateGoal(goal.id, { saved: Number(event.target.value) || 0 })} /></label>
                <label>Due date<input type="date" value={goal.due ?? ""} onChange={(event) => updateGoal(goal.id, { due: event.target.value || undefined })} /></label>
                <label>Notes<textarea value={goal.note} onChange={(event) => updateGoal(goal.id, { note: event.target.value })} /></label>
                <div className="actions"><button className="add" type="button" onClick={() => setEditId(null)}>Done</button></div>
              </div>
            )}
          </article>
        );
      })}
    </>
  );
}

function Savings() {
  const { state, updateSaving } = useBudget();
  const figures = snapshot(state, TODAY.year, TODAY.month);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  return (
    <>
      <div><h1>Savings</h1><p className="lede">Money already set aside. Vacation stays in sync with Goals.</p></div>
      <div className="trio">
        <article className="card"><p className="meta">Balance</p><p className="money">{money(figures.assets)}</p><p className="fine">Assets</p></article>
        <article className="card"><p className="meta">Set this month</p><p className="money">{money(figures.savingsPaid)}</p></article>
        <article className="card safe"><p className="meta">Left to save</p><p className="money">{money(figures.leftToSave)}</p><p className="fine">Still open</p></article>
      </div>
      {state.bills.filter((bill) => bill.group === "Savings").map((bill) => {
        const fund = state.funds.find((item) => item.id === SAVINGS_LINK[bill.id]?.fundId);
        const amount = fund?.balance ?? 0;
        return (
          <article className="card" key={bill.id}>
            <div className="item-head">
              <div>
                <p className="who">{bill.name}</p>
                <p className="money">{money(amount)}</p>
                <p className="fine">This month {money(bill.plan)}</p>
              </div>
              <MoreMenu
                label={bill.name}
                open={menuId === bill.id}
                onToggle={() => setMenuId(menuId === bill.id ? null : bill.id)}
                onClose={() => setMenuId(null)}
                onEdit={() => { setMenuId(null); setEditId(bill.id); }}
              />
            </div>
            {editId === bill.id && (
              <div className="fix">
                <label>Name<input value={bill.name} onChange={(event) => updateSaving(bill.id, { name: event.target.value })} /></label>
                <label>Amount<input inputMode="decimal" value={amount} onChange={(event) => updateSaving(bill.id, { amount: Number(event.target.value) })} /></label>
                <div className="actions"><button className="add" type="button" onClick={() => setEditId(null)}>Done</button></div>
              </div>
            )}
          </article>
        );
      })}
    </>
  );
}

function Debt() {
  const { state, payDebt, setDebtFocus, addDebt, updateDebt, removeDebt } = useBudget();
  const figures = snapshot(state, TODAY.year, TODAY.month);
  const [editId, setEditId] = useState<string | null>(null);
  const ordered = [...state.debts].sort((a, b) =>
    state.debtFocus === "interest" ? b.apr - a.apr : a.balance - b.balance,
  );
  const focusId = ordered[0]?.id;
  return (
    <>
      <div className="head">
        <div><h1>Paying it down</h1><p className="lede">Every balance, and roughly when it'll be gone.</p></div>
        <button className="solid" type="button" onClick={() => addDebt({ name: "New debt", balance: 1000, original: 1000, minimum: 50, apr: 10 })}>+ New debt</button>
      </div>
      <div className="trio">
        <article className="card"><p className="meta">Total still owed</p><p className="money">{money(figures.liabilities)}</p></article>
        <article className="card"><p className="meta">Minimums due monthly</p><p className="money">{money(figures.dueThisMonth)}</p></article>
        <article className="card safe"><p className="meta">Average interest rate</p><p className="money">{averageApr(state.debts).toFixed(1)}%</p></article>
      </div>
      <article className="card">
        <p className="who">Focus order</p>
        <p className="subline">Which debt to throw extra money at first</p>
        <div className="choices">
          <button type="button" className={state.debtFocus === "interest" ? "on" : ""} onClick={() => setDebtFocus("interest")}>Highest interest first</button>
          <button type="button" className={state.debtFocus === "balance" ? "on" : ""} onClick={() => setDebtFocus("balance")}>Smallest balance first</button>
        </div>
      </article>
      {ordered.map((debt) => {
        const paid = state.debtPaid[payKey(TODAY.year, TODAY.month, debt.id)] ?? 0;
        const left = Math.max(0, debt.minimum - paid);
        const progress = debt.original > 0 ? Math.min(100, ((debt.original - debt.balance) / debt.original) * 100) : 0;
        return (
          <article className="card" key={debt.id}>
            <div className="item-head">
              <div>
                <p className="who">{debt.name}</p>
                {debt.id === focusId && <p className="status progress">Focus first</p>}
              </div>
              <div className="row-actions">
                <button className="ghost" type="button" onClick={() => setEditId(editId === debt.id ? null : debt.id)}>Edit</button>
                <button className="ghost" type="button" onClick={() => removeDebt(debt.id)}>Delete</button>
              </div>
            </div>
            <p className="subline">{money(debt.balance)} owed · {debt.apr}% APR · {money(debt.minimum)}/mo</p>
            <div className="bar" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
            <p className="fine">{Math.round(progress)}% paid off · {clearBy(debt)}</p>
            {left > 0 && <button className="solid" type="button" onClick={() => payDebt(debt.id, left)}>Pay {money(left)}</button>}
            {editId === debt.id && (
              <div className="fix">
                <label>Name<input value={debt.name} onChange={(event) => updateDebt(debt.id, { name: event.target.value })} /></label>
                <label>Balance<input inputMode="decimal" value={debt.balance} onChange={(event) => updateDebt(debt.id, { balance: Number(event.target.value) || 0 })} /></label>
                <label>Minimum<input inputMode="decimal" value={debt.minimum} onChange={(event) => updateDebt(debt.id, { minimum: Number(event.target.value) || 0 })} /></label>
                <label>APR %<input inputMode="decimal" value={debt.apr} onChange={(event) => updateDebt(debt.id, { apr: Number(event.target.value) || 0 })} /></label>
                <div className="actions"><button className="add" type="button" onClick={() => setEditId(null)}>Done</button></div>
              </div>
            )}
          </article>
        );
      })}
    </>
  );
}

function Envelopes() {
  const { state, updateBill, updateSpend } = useBudget();
  const groups: Group[] = ["Needs", "Wants"];
  const [menuId, setMenuId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const openEdit = (id: string) => {
    setMenuId(null);
    setEditId(id);
  };
  return (
    <>
      <div><h1>Envelopes</h1><p className="lede">Needs show up in Coming up. Use the menu to change a name, an amount, or a date.</p></div>
      {groups.map((group) => (
        <section key={group}>
          <h2>{group}</h2>
          {state.bills.filter((bill) => bill.group === group).map((bill) => {
            const paid = state.payments[payKey(TODAY.year, TODAY.month, bill.id)] ?? 0;
            const left = Math.max(0, bill.plan - paid);
            return (
              <article className="card" key={bill.id}>
                <div className="item-head">
                  <div>
                    <p className="who">{bill.name}</p>
                    <p className="subline">Plan {money(bill.plan)} · Paid {money(paid)} · Left {money(left)}</p>
                  </div>
                  <MoreMenu
                    label={bill.name}
                    open={menuId === bill.id}
                    onToggle={() => setMenuId(menuId === bill.id ? null : bill.id)}
                    onClose={() => setMenuId(null)}
                    onEdit={() => openEdit(bill.id)}
                  />
                </div>
                {editId === bill.id && (
                  <div className="fix">
                    <label>Name<input value={bill.name} onChange={(event) => updateBill(bill.id, { name: event.target.value })} /></label>
                    <label>Amount<input inputMode="decimal" value={bill.plan} onChange={(event) => updateBill(bill.id, { plan: Number(event.target.value) })} /></label>
                    <label>Date
                      <input type="date" value={isoDate(TODAY.year, TODAY.month, bill.dueDay)} onChange={(event) => {
                        const when = readDate(event.target.value);
                        if (when) updateBill(bill.id, { dueDay: when.day });
                      }} />
                    </label>
                    <GroupPick groups={groups} value={bill.group} onChange={(next) => updateBill(bill.id, { group: next })} />
                    <div className="actions"><button className="add" type="button" onClick={() => setEditId(null)}>Done</button></div>
                  </div>
                )}
              </article>
            );
          })}
          {state.spends.filter((spend) => spend.group === group).map((spend) => (
            <article className="card" key={spend.id}>
              <div className="item-head">
                <div>
                  <p className="who">{spend.name}</p>
                  <p className="subline">{money(spend.amount)} · {MONTHS_SHORT[spend.month - 1]} {spend.day}</p>
                </div>
                <MoreMenu
                  label={spend.name}
                  open={menuId === spend.id}
                  onToggle={() => setMenuId(menuId === spend.id ? null : spend.id)}
                  onClose={() => setMenuId(null)}
                  onEdit={() => openEdit(spend.id)}
                />
              </div>
              {editId === spend.id && (
                <div className="fix">
                  <label>Name<input value={spend.name} onChange={(event) => updateSpend(spend.id, { name: event.target.value })} /></label>
                  <label>Amount<input inputMode="decimal" value={spend.amount} onChange={(event) => updateSpend(spend.id, { amount: Number(event.target.value) })} /></label>
                  <label>Date
                    <input type="date" value={isoDate(spend.year, spend.month, spend.day)} onChange={(event) => {
                      const when = readDate(event.target.value);
                      if (when) updateSpend(spend.id, when);
                    }} />
                  </label>
                  <GroupPick groups={groups} value={spend.group} onChange={(next) => updateSpend(spend.id, { group: next })} />
                  <div className="actions"><button className="add" type="button" onClick={() => setEditId(null)}>Done</button></div>
                </div>
              )}
            </article>
          ))}
        </section>
      ))}
    </>
  );
}

function MoreMenu({ label, open, onToggle, onClose, onEdit }: { label: string; open: boolean; onToggle: () => void; onClose: () => void; onEdit: () => void }) {
  return (
    <div className="more-wrap">
      <button className="more" type="button" aria-label={`Edit ${label}`} aria-expanded={open} onClick={onToggle}>
        <span /><span /><span />
      </button>
      {open && (
        <>
          <button className="menu-shade" type="button" aria-label="Close" onClick={onClose} />
          <div className="menu">
            <button type="button" onClick={onEdit}>Edit</button>
          </div>
        </>
      )}
    </div>
  );
}

function GroupPick({ value, onChange, groups = ["Needs", "Wants", "Savings"] }: { value: Group; onChange: (group: Group) => void; groups?: Group[] }) {
  return (
    <div className={groups.length === 3 ? "choices three" : "choices"} aria-label="Group">
      {groups.map((group) => (
        <button key={group} type="button" className={value === group ? "on" : ""} onClick={() => onChange(group)}>{group}</button>
      ))}
    </div>
  );
}

function Settings() {
  const { state, setName, setNight, setColorway, restore, archiveYear, reset } = useBudget();
  const [archiveLabel, setArchiveLabel] = useState(String(state.browseYear));
  return (
    <>
      <div><h1>Settings</h1><p className="lede">Your numbers stay on this device. Nothing connects to your bank.</p></div>
      <label>Your name<input value={state.name} onChange={(event) => setName(event.target.value)} /></label>
      <article className="card">
        <p className="who">Colorway</p>
        <p className="subline">Pick a palette. Clay keeps our warm look.</p>
        <div className="swatches">
          {COLORWAYS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={state.colorway === item.id ? "swatch on" : "swatch"}
              style={{ background: item.accent }}
              onClick={() => setColorway(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </article>
      <button className="pill" type="button" onClick={() => setNight(!state.night)}>{state.night ? "Night mode on" : "Night mode off"}</button>
      <article className="card">
        <p className="who">Your data</p>
        <p className="subline">Everything stays on this device. Nothing here ever connects to a bank.</p>
        <div className="stack">
          <button className="pill" type="button" onClick={() => {
            const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "budget-backup.json";
            link.click();
            URL.revokeObjectURL(url);
          }}>Download a backup</button>
          <label className="pill file">Restore from a backup
            <input type="file" accept="application/json,.json" onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              try {
                const text = await file.text();
                restore(JSON.parse(text));
              } catch {
                // ignore bad files
              }
              event.target.value = "";
            }} />
          </label>
          <button className="pill" type="button" onClick={reset}>Erase everything and start over</button>
        </div>
      </article>
      <article className="card">
        <p className="who">Yearly archive</p>
        <p className="subline">Save this year's picture, then start fresh.</p>
        <label>Label this archive<input value={archiveLabel} onChange={(event) => setArchiveLabel(event.target.value)} /></label>
        <button className="solid" type="button" onClick={() => {
          archiveYear(archiveLabel);
          setArchiveLabel(String(state.browseYear + 1));
        }}>Archive & start fresh</button>
        {state.archives.length === 0 ? (
          <p className="fine empty-box">No archived years yet.</p>
        ) : (
          state.archives.map((item) => (
            <p className="subline" key={item.id}>{item.label} · In {money(item.income)} · Out {money(item.out)}</p>
          ))
        )}
      </article>
    </>
  );
}

function YearlyReview() {
  const { state, setBrowse } = useBudget();
  const rows = yearReview(state, state.browseYear);
  const income = rows.reduce((sum, row) => sum + row.income, 0);
  const out = rows.reduce((sum, row) => sum + row.out, 0);
  const max = Math.max(...rows.map((row) => Math.max(row.income, row.out)), 1);
  return (
    <>
      <div className="head">
        <div><h1>Yearly review</h1><p className="lede">Income, spending, and the net for {state.browseYear}.</p></div>
        <div>
          <button className="pill" type="button" onClick={() => setBrowse(state.browseYear - 1, state.browseMonth)}>Prev</button>
          <button className="pill" type="button" onClick={() => setBrowse(state.browseYear + 1, state.browseMonth)}>Next</button>
        </div>
      </div>
      <div className="trio">
        <article className="card tone-in"><p className="meta">Total income</p><p className="money">{money(income)}</p></article>
        <article className="card tone-out"><p className="meta">Total money out</p><p className="money">{money(out)}</p></article>
        <article className="card safe"><p className="meta">Net for the year</p><p className="money">{money(income - out)}</p></article>
      </div>
      <article className="card">
        <p className="who">Month by month</p>
        <div className="year-bars">
          {rows.map((row) => (
            <div className="year-col" key={row.month}>
              <div className="year-pair">
                <span className="in" style={{ height: `${(row.income / max) * 100}%` }} />
                <span className="out" style={{ height: `${(row.out / max) * 100}%` }} />
              </div>
              <p>{MONTHS_SHORT[row.month - 1]}</p>
            </div>
          ))}
        </div>
        <p className="fine">Green is income. Clay is money out.</p>
      </article>
      {rows.map((row) => (
        <article className="card" key={row.month}>
          <p className="who">{MONTHS[row.month - 1]}</p>
          <p className="subline">In {money(row.income)} · Out {money(row.out)} · Net {money(row.net)}</p>
        </article>
      ))}
    </>
  );
}

function TransactionLog() {
  const { state, setBrowse } = useBudget();
  const rows = transactionLog(state, state.browseYear, state.browseMonth);
  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  const average = rows.length ? total / rows.length : 0;
  return (
    <>
      <div><h1>Transaction log</h1><p className="lede">Every dollar you've tracked this month, in one place.</p></div>
      <div className="months">
        {MONTHS_SHORT.map((label, index) => (
          <button key={label} type="button" className={index + 1 === state.browseMonth ? "pill on" : "pill"} onClick={() => setBrowse(state.browseYear, index + 1)}>
            {label}
          </button>
        ))}
      </div>
      <div className="trio">
        <article className="card"><p className="meta">Transactions in {MONTHS[state.browseMonth - 1]}</p><p className="money">{rows.length}</p></article>
        <article className="card"><p className="meta">Total tracked</p><p className="money">{money(total)}</p></article>
        <article className="card safe"><p className="meta">Average per transaction</p><p className="money">{money(average)}</p></article>
      </div>
      {rows.length === 0 && <p className="lede">Nothing tracked this month yet.</p>}
      {rows.map((row) => (
        <article className="card" key={row.id}>
          <div className="item-head">
            <div>
              <p className="fine">{MONTHS_SHORT[row.month - 1]} {row.day}</p>
              <p className="who">{row.name}</p>
              <p className="status progress">{row.group}</p>
              {row.notes && <p className="subline">{row.notes}</p>}
            </div>
            <p className="money">{money(row.amount)}</p>
          </div>
        </article>
      ))}
    </>
  );
}

function Track({ onClose }: { onClose: () => void }) {
  const { state, payBill, addSpend, updateBill } = useBudget();
  const bills = comingUp(state).filter((item) => item.kind === "bill");
  const [mode, setMode] = useState<"bill" | "new">("bill");
  const [billId, setBillId] = useState(bills[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [group, setGroup] = useState<Group>("Wants");
  const [date, setDate] = useState(isoDate(TODAY.year, TODAY.month, bills[0]?.dueDay ?? TODAY.day));
  const value = Number(amount) || 0;
  const when = readDate(date);
  const preview = useMemo(() => {
    const base = snapshot(state, TODAY.year, TODAY.month).safe;
    if (mode === "bill") {
      const bill = bills.find((item) => item.id === billId);
      const applied = bill ? Math.min(bill.left, value) : 0;
      return base + applied;
    }
    if (when && (when.year !== TODAY.year || when.month !== TODAY.month)) return base;
    return base - value;
  }, [billId, bills, mode, state, value, when]);
  const distance = when ? daysFromToday(when.year, when.month, when.day) : null;
  const sameMonth = when != null && when.year === TODAY.year && when.month === TODAY.month;
  const dateNote = distance == null
    ? "Pick a date."
    : distance >= 0 && distance <= 3
      ? "Due soon. It will show in Coming up and on the calendar."
      : distance > 3 && sameMonth
        ? "Later this month. It will show in Coming up and on the calendar."
        : distance > 3
          ? "It will show on the calendar."
          : "That date has passed. It will show on the calendar.";

  return (
    <div className="shade" role="presentation" onClick={onClose}>
      <div className="window" role="dialog" aria-label="Track spending" onClick={(event) => event.stopPropagation()}>
        <h2>Track spending</h2>
        <article className="card safe"><p className="meta">Safe to spend</p><p className="money">{money(preview)}</p></article>
        <div className="choices">
          <button type="button" className={mode === "bill" ? "on" : ""} onClick={() => {
            setMode("bill");
            const bill = state.bills.find((item) => item.id === billId);
            if (bill) setDate(isoDate(TODAY.year, TODAY.month, bill.dueDay));
          }}>Pay a bill</button>
          <button type="button" className={mode === "new" ? "on" : ""} onClick={() => {
            setMode("new");
            setDate(isoDate(TODAY.year, TODAY.month, TODAY.day));
          }}>New spend</button>
        </div>
        {mode === "bill" ? (
          <label>Bill
            <select value={billId} onChange={(event) => {
              const next = event.target.value;
              setBillId(next);
              const bill = state.bills.find((item) => item.id === next);
              if (bill) setDate(isoDate(TODAY.year, TODAY.month, bill.dueDay));
            }}>
              {bills.map((bill) => <option key={bill.id} value={bill.id}>{bill.name} · Left {money(bill.left)}</option>)}
            </select>
          </label>
        ) : (
          <>
            <label>Name<input value={name} placeholder="Coffee" onChange={(event) => setName(event.target.value)} /></label>
            <GroupPick groups={["Needs", "Wants"]} value={group} onChange={setGroup} />
          </>
        )}
        <label>Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        <p className="fine">{dateNote}</p>
        <label>Amount<input inputMode="decimal" placeholder="0.00" value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
        <label>Notes (optional)<textarea value={notes} placeholder="Anything worth remembering." onChange={(event) => setNotes(event.target.value)} /></label>
        <div className="actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button className="add" type="button" onClick={() => {
            if (value <= 0 || !when) return;
            if (mode === "bill") {
              payBill(billId, value);
              updateBill(billId, { dueDay: when.day });
            } else if (name.trim()) addSpend(name.trim(), value, group, when, notes.trim());
            else return;
            onClose();
          }}>Add</button>
        </div>
      </div>
    </div>
  );
}
