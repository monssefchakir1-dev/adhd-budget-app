import { daysInMonth } from '../lib/calc'
import { formatMad } from '../lib/money'
import type { BudgetState } from '../types'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type CalendarPanelProps = {
  state: BudgetState
}

export function CalendarPanel({ state }: CalendarPanelProps) {
  const days = daysInMonth(state.year, state.month)
  const first = new Date(state.year, state.month - 1, 1)
  // JS: 0=Sun … convert to Mon-start index
  const startOffset = (first.getDay() + 6) % 7

  const byDay = new Map<number, { name: string; amount: number }[]>()
  for (const exp of state.expenses) {
    if (!exp.day) continue
    const list = byDay.get(exp.day) || []
    list.push({ name: exp.name, amount: exp.actual || exp.planned || 0 })
    byDay.set(exp.day, list)
  }

  const cells: Array<number | null> = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <section className="panel">
      <h2>Month at a glance</h2>
      <p className="panel-lead">
        Expenses with a day number appear here — a quiet calendar overview for {state.monthLabel}.
      </p>

      <div className="calendar-grid">
        {WEEKDAYS.map((d) => (
          <div className="cal-head" key={d}>
            {d}
          </div>
        ))}
        {cells.map((day, idx) => {
          if (day === null) return <div className="cal-day empty" key={`e-${idx}`} />
          const items = byDay.get(day) || []
          return (
            <div className="cal-day" key={day}>
              <span className="day-num">{day}</span>
              {items.slice(0, 3).map((item) => (
                <span className="cal-chip" key={`${day}-${item.name}`} title={formatMad(item.amount)}>
                  {item.name}
                </span>
              ))}
              {items.length > 3 && <span className="cal-chip">+{items.length - 3} more</span>}
            </div>
          )
        })}
      </div>
    </section>
  )
}
