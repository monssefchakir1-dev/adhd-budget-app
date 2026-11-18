import { useEffect, useState } from 'react'
import { CalendarPanel } from './components/CalendarPanel'
import { ExpensesPanel } from './components/ExpensesPanel'
import { GoalsPanel } from './components/GoalsPanel'
import { IncomePanel } from './components/IncomePanel'
import { Landing } from './components/Landing'
import { Overview } from './components/Overview'
import { clearBudget, exportBudgetJson, isDemoMode, loadBudget, saveBudget } from './lib/storage'
import type { BudgetState, ViewId } from './types'

const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'income', label: 'Income' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'goals', label: 'Goals' },
  { id: 'calendar', label: 'Calendar' },
]

function App() {
  const demo = isDemoMode()
  const [entered, setEntered] = useState(demo || window.location.hash === '#app')
  const [view, setView] = useState<ViewId>('overview')
  const [state, setState] = useState<BudgetState>(() => loadBudget())

  useEffect(() => {
    saveBudget(state)
  }, [state])

  const openDemo = () => {
    const url = new URL(window.location.href)
    url.searchParams.set('demo', '1')
    url.hash = 'app'
    window.location.href = url.toString()
  }

  const openPlanner = () => {
    setEntered(true)
    window.location.hash = 'app'
  }

  const resetLocal = () => {
    if (!window.confirm('Clear saved local data and start fresh?')) return
    clearBudget()
    window.location.href = window.location.pathname
  }

  if (!entered) {
    return (
      <div className="app-root">
        <Landing onOpenPlanner={openPlanner} onOpenDemo={openDemo} />
      </div>
    )
  }

  return (
    <div className="app-root">
      <div className="shell">
        <header className="topbar">
          <div className="brand-mark">
            <span className="dot" aria-hidden />
            Sakina
          </div>
          <div className="topbar-meta">
            {demo ? (
              <span className="badge demo">Online demo · Morocco sample</span>
            ) : (
              <span className="badge">Local data · MAD</span>
            )}
            <button
              type="button"
              className="btn btn-ghost btn-small"
              onClick={() => exportBudgetJson(state)}
            >
              Export JSON
            </button>
            {!demo && (
              <button type="button" className="btn btn-danger btn-small" onClick={resetLocal}>
                Reset
              </button>
            )}
          </div>
        </header>

        <nav className="nav-tabs" aria-label="Planner sections">
          {VIEWS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={view === item.id ? 'active' : ''}
              onClick={() => setView(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {view === 'overview' && <Overview state={state} />}
        {view === 'income' && <IncomePanel state={state} onChange={setState} />}
        {view === 'expenses' && <ExpensesPanel state={state} onChange={setState} />}
        {view === 'goals' && <GoalsPanel state={state} onChange={setState} />}
        {view === 'calendar' && <CalendarPanel state={state} />}

        <p className="footer-note">
          {demo
            ? 'Demo mode does not save changes. Open without ?demo=1 to keep data in this browser, or use the offline HTML build for a file that never needs the internet.'
            : 'Your numbers stay in this browser (localStorage). No accounts, no bank sync. Offline buyers: open the single-file HTML from the product download.'}
        </p>
      </div>
    </div>
  )
}

export default App
