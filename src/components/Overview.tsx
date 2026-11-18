import {
  budgetHealth,
  remaining,
  totalActual,
  totalGoalContributions,
  totalIncome,
  totalPlanned,
} from '../lib/calc'
import { formatMad } from '../lib/money'
import type { BudgetState } from '../types'

type OverviewProps = {
  state: BudgetState
}

export function Overview({ state }: OverviewProps) {
  const income = totalIncome(state)
  const planned = totalPlanned(state)
  const actual = totalActual(state)
  const goals = totalGoalContributions(state)
  const left = remaining(state)
  const health = budgetHealth(state)

  const byCategory = state.expenses.reduce<Record<string, number>>((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + (exp.actual || 0)
    return acc
  }, {})

  const categories = Object.entries(byCategory).sort((a, b) => b[1] - a[1])
  const maxCat = Math.max(...categories.map(([, v]) => v), 1)

  return (
    <section className="panel">
      <h2>{state.monthLabel}</h2>
      <p className="panel-lead">
        One glance at what came in, what went out, and what you are setting aside — including your
        Vacation fund.
      </p>

      <div className="stats">
        <div className="stat">
          <span className="label">Income</span>
          <div className="value">{formatMad(income)}</div>
        </div>
        <div className="stat">
          <span className="label">Spent (actual)</span>
          <div className="value">{formatMad(actual)}</div>
          <div className="hint">Planned {formatMad(planned)}</div>
        </div>
        <div className="stat">
          <span className="label">To savings</span>
          <div className="value">{formatMad(goals)}</div>
        </div>
        <div className="stat">
          <span className="label">Left this month</span>
          <div className={`value tone-${health.tone}`}>{formatMad(left)}</div>
          <div className={`hint tone-${health.tone}`}>{health.label}</div>
        </div>
      </div>

      <div className="overview-split">
        <div>
          <div className="section-head">
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)' }}>Spending by category</h3>
          </div>
          <div className="bar-list">
            {categories.length === 0 && <p className="panel-lead">No expenses yet.</p>}
            {categories.map(([name, amount]) => (
              <div className="bar-row" key={name}>
                <span>{name}</span>
                <div className="bar-track">
                  <span style={{ width: `${(amount / maxCat) * 100}%` }} />
                </div>
                <span className="amount">{formatMad(amount)}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="section-head">
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)' }}>Savings goals</h3>
          </div>
          <div className="bar-list">
            {state.goals.map((goal) => {
              const pct = goal.target > 0 ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 0
              return (
                <div className="bar-row" key={goal.id}>
                  <span>{goal.name}</span>
                  <div className="bar-track">
                    <span style={{ width: `${pct}%` }} />
                  </div>
                  <span className="amount">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
