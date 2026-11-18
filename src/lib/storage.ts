import { createDemoBudget, createEmptyBudget } from '../data/demo'
import type { BudgetState } from '../types'

const STORAGE_KEY = 'sakina-budget-v1'

export function isDemoMode(): boolean {
  const params = new URLSearchParams(window.location.search)
  return params.get('demo') === '1' || params.get('demo') === 'true'
}

export function loadBudget(): BudgetState {
  if (isDemoMode()) {
    return createDemoBudget()
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createEmptyBudget()
    const parsed = JSON.parse(raw) as BudgetState
    if (!parsed || !Array.isArray(parsed.incomes)) return createEmptyBudget()
    return parsed
  } catch {
    return createEmptyBudget()
  }
}

export function saveBudget(state: BudgetState): void {
  if (isDemoMode()) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Private browsing / file quota — fail silently
  }
}

export function clearBudget(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function exportBudgetJson(state: BudgetState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sakina-budget-${state.year}-${String(state.month).padStart(2, '0')}.json`
  a.click()
  URL.revokeObjectURL(url)
}
