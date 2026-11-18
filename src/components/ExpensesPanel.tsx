import { totalActual, totalPlanned } from '../lib/calc'
import { formatMad, parseAmount, uid } from '../lib/money'
import type { BudgetState, ExpenseItem } from '../types'

const CATEGORIES = ['Housing', 'Food', 'Transport', 'Bills', 'Health', 'Lifestyle', 'Other']

type ExpensesPanelProps = {
  state: BudgetState
  onChange: (next: BudgetState) => void
  readOnly?: boolean
}

export function ExpensesPanel({ state, onChange, readOnly }: ExpensesPanelProps) {
  const update = (id: string, patch: Partial<ExpenseItem>) => {
    onChange({
      ...state,
      expenses: state.expenses.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    })
  }

  const add = () => {
    onChange({
      ...state,
      expenses: [
        ...state.expenses,
        { id: uid('exp'), name: 'New expense', category: 'Other', planned: 0, actual: 0 },
      ],
    })
  }

  const remove = (id: string) => {
    onChange({
      ...state,
      expenses: state.expenses.filter((item) => item.id !== id),
    })
  }

  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <h2>Expenses</h2>
          <p className="panel-lead" style={{ marginBottom: 0 }}>
            Plan what you expect, then log what you actually spent. Diffs stay visible without
            clutter.
          </p>
        </div>
        {!readOnly && (
          <button type="button" className="btn btn-primary btn-small" onClick={add}>
            Add expense
          </button>
        )}
      </div>

      <div className="stats" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <div className="stat">
          <span className="label">Planned</span>
          <div className="value">{formatMad(totalPlanned(state))}</div>
        </div>
        <div className="stat">
          <span className="label">Actual</span>
          <div className="value">{formatMad(totalActual(state))}</div>
        </div>
        <div className="stat">
          <span className="label">Difference</span>
          <div className="value">{formatMad(totalPlanned(state) - totalActual(state))}</div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th className="num">Day</th>
              <th className="num">Planned</th>
              <th className="num">Actual</th>
              {!readOnly && <th aria-label="Actions" />}
            </tr>
          </thead>
          <tbody>
            {state.expenses.map((item) => (
              <tr key={item.id}>
                <td>
                  <input
                    className="cell"
                    value={item.name}
                    disabled={readOnly}
                    onChange={(e) => update(item.id, { name: e.target.value })}
                  />
                </td>
                <td>
                  <select
                    className="cell"
                    value={item.category}
                    disabled={readOnly}
                    onChange={(e) => update(item.id, { category: e.target.value })}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="num">
                  <input
                    className="cell num"
                    inputMode="numeric"
                    value={item.day ?? ''}
                    disabled={readOnly}
                    onChange={(e) => {
                      const day = Number.parseInt(e.target.value, 10)
                      update(item.id, {
                        day: Number.isFinite(day) ? Math.min(31, Math.max(1, day)) : undefined,
                      })
                    }}
                  />
                </td>
                <td className="num">
                  <input
                    className="cell num"
                    inputMode="decimal"
                    value={item.planned || ''}
                    disabled={readOnly}
                    onChange={(e) => update(item.id, { planned: parseAmount(e.target.value) })}
                  />
                </td>
                <td className="num">
                  <input
                    className="cell num"
                    inputMode="decimal"
                    value={item.actual || ''}
                    disabled={readOnly}
                    onChange={(e) => update(item.id, { actual: parseAmount(e.target.value) })}
                  />
                </td>
                {!readOnly && (
                  <td>
                    <button type="button" className="icon-btn" onClick={() => remove(item.id)} aria-label="Remove">
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
