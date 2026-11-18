import { totalIncome } from '../lib/calc'
import { formatMad, parseAmount, uid } from '../lib/money'
import type { BudgetState, IncomeItem } from '../types'

type IncomePanelProps = {
  state: BudgetState
  onChange: (next: BudgetState) => void
  readOnly?: boolean
}

export function IncomePanel({ state, onChange, readOnly }: IncomePanelProps) {
  const update = (id: string, patch: Partial<IncomeItem>) => {
    onChange({
      ...state,
      incomes: state.incomes.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    })
  }

  const add = () => {
    onChange({
      ...state,
      incomes: [...state.incomes, { id: uid('inc'), name: 'New income', amount: 0 }],
    })
  }

  const remove = (id: string) => {
    onChange({
      ...state,
      incomes: state.incomes.filter((item) => item.id !== id),
    })
  }

  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <h2>Monthly income</h2>
          <p className="panel-lead" style={{ marginBottom: 0 }}>
            Update amounts anytime — the overview recalculates immediately. Figures in Moroccan
            Dirham (MAD).
          </p>
        </div>
        {!readOnly && (
          <button type="button" className="btn btn-primary btn-small" onClick={add}>
            Add income
          </button>
        )}
      </div>

      <div className="stats" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
        <div className="stat">
          <span className="label">Total income</span>
          <div className="value">{formatMad(totalIncome(state))}</div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Source</th>
              <th className="num">Amount (MAD)</th>
              {!readOnly && <th aria-label="Actions" />}
            </tr>
          </thead>
          <tbody>
            {state.incomes.map((item) => (
              <tr key={item.id}>
                <td>
                  <input
                    className="cell"
                    value={item.name}
                    disabled={readOnly}
                    onChange={(e) => update(item.id, { name: e.target.value })}
                  />
                </td>
                <td className="num">
                  <input
                    className="cell num"
                    inputMode="decimal"
                    value={item.amount || ''}
                    disabled={readOnly}
                    onChange={(e) => update(item.id, { amount: parseAmount(e.target.value) })}
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
