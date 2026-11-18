import type { BudgetState } from '../types'

export function totalIncome(state: BudgetState): number {
  return state.incomes.reduce((sum, item) => sum + (item.amount || 0), 0)
}

export function totalPlanned(state: BudgetState): number {
  return state.expenses.reduce((sum, item) => sum + (item.planned || 0), 0)
}

export function totalActual(state: BudgetState): number {
  return state.expenses.reduce((sum, item) => sum + (item.actual || 0), 0)
}

export function totalGoalContributions(state: BudgetState): number {
  return state.goals.reduce((sum, g) => sum + (g.monthlyContribution || 0), 0)
}

export function remaining(state: BudgetState): number {
  return totalIncome(state) - totalActual(state) - totalGoalContributions(state)
}

export function budgetHealth(state: BudgetState): {
  label: string
  tone: 'good' | 'warn' | 'tight'
} {
  const left = remaining(state)
  const income = totalIncome(state)
  if (income <= 0) return { label: 'Add income to begin', tone: 'warn' }
  const ratio = left / income
  if (ratio >= 0.1) return { label: 'Breathing room', tone: 'good' }
  if (ratio >= 0) return { label: 'Tight but ok', tone: 'warn' }
  return { label: 'Overspending', tone: 'tight' }
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function goalProgress(saved: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(100, Math.round((saved / target) * 100))
}
