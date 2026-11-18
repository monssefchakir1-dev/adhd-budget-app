import { goalProgress } from '../lib/calc'
import { formatMad, parseAmount, uid } from '../lib/money'
import type { BudgetState, SavingsGoal } from '../types'

type GoalsPanelProps = {
  state: BudgetState
  onChange: (next: BudgetState) => void
  readOnly?: boolean
}

export function GoalsPanel({ state, onChange, readOnly }: GoalsPanelProps) {
  const update = (id: string, patch: Partial<SavingsGoal>) => {
    onChange({
      ...state,
      goals: state.goals.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    })
  }

  const add = () => {
    onChange({
      ...state,
      goals: [
        ...state.goals,
        {
          id: uid('goal'),
          name: 'New goal',
          target: 0,
          saved: 0,
          monthlyContribution: 0,
        },
      ],
    })
  }

  const remove = (id: string) => {
    onChange({
      ...state,
      goals: state.goals.filter((item) => item.id !== id),
    })
  }

  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <h2>Savings goals</h2>
          <p className="panel-lead" style={{ marginBottom: 0 }}>
            Keep a clear Vacation fund front and center. Contributions reduce what is left in the
            monthly overview.
          </p>
        </div>
        {!readOnly && (
          <button type="button" className="btn btn-primary btn-small" onClick={add}>
            Add goal
          </button>
        )}
      </div>

      <div className="goals-grid">
        {state.goals.map((goal) => {
          const pct = goalProgress(goal.saved, goal.target)
          const featured = /vacation/i.test(goal.name)
          return (
            <article className={`goal${featured ? ' featured' : ''}`} key={goal.id}>
              <h3>{goal.name || 'Goal'}</h3>
              <div className="goal-fields">
                <label className="field-label">
                  Name
                  <input
                    className="cell"
                    value={goal.name}
                    disabled={readOnly}
                    onChange={(e) => update(goal.id, { name: e.target.value })}
                  />
                </label>
                <label className="field-label">
                  Target (MAD)
                  <input
                    className="cell num"
                    inputMode="decimal"
                    value={goal.target || ''}
                    disabled={readOnly}
                    onChange={(e) => update(goal.id, { target: parseAmount(e.target.value) })}
                  />
                </label>
                <label className="field-label">
                  Saved so far (MAD)
                  <input
                    className="cell num"
                    inputMode="decimal"
                    value={goal.saved || ''}
                    disabled={readOnly}
                    onChange={(e) => update(goal.id, { saved: parseAmount(e.target.value) })}
                  />
                </label>
                <label className="field-label">
                  This month (MAD)
                  <input
                    className="cell num"
                    inputMode="decimal"
                    value={goal.monthlyContribution || ''}
                    disabled={readOnly}
                    onChange={(e) =>
                      update(goal.id, { monthlyContribution: parseAmount(e.target.value) })
                    }
                  />
                </label>
              </div>
              <div className="progress" aria-hidden>
                <span style={{ width: `${pct}%` }} />
              </div>
              <div className="progress-meta">
                <span>
                  {formatMad(goal.saved)} of {formatMad(goal.target)}
                </span>
                <span>{pct}%</span>
              </div>
              {!readOnly && !featured && (
                <button
                  type="button"
                  className="icon-btn"
                  style={{ marginTop: '0.75rem' }}
                  onClick={() => remove(goal.id)}
                >
                  Remove goal
                </button>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
