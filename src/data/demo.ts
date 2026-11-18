import type { BudgetState } from '../types'

/** Prefill sample for Morocco (MAD) — used by online demo (?demo=1). */
export function createDemoBudget(): BudgetState {
  const now = new Date()
  return {
    monthLabel: now.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    incomes: [
      { id: 'inc_salary', name: 'Salary', amount: 12500 },
      { id: 'inc_side', name: 'Freelance / side work', amount: 1800 },
    ],
    expenses: [
      { id: 'exp_rent', name: 'Rent', category: 'Housing', planned: 4500, actual: 4500, day: 1 },
      { id: 'exp_utilities', name: 'Electricity & water', category: 'Housing', planned: 450, actual: 380, day: 8 },
      { id: 'exp_internet', name: 'Internet / phone', category: 'Bills', planned: 250, actual: 250, day: 5 },
      { id: 'exp_groceries', name: 'Groceries', category: 'Food', planned: 2200, actual: 1950, day: 12 },
      { id: 'exp_transport', name: 'Transport / fuel', category: 'Transport', planned: 800, actual: 720, day: 10 },
      { id: 'exp_eating', name: 'Eating out', category: 'Food', planned: 600, actual: 540, day: 15 },
      { id: 'exp_health', name: 'Health / pharmacy', category: 'Health', planned: 300, actual: 150, day: 18 },
      { id: 'exp_fun', name: 'Fun & hobbies', category: 'Lifestyle', planned: 400, actual: 280, day: 20 },
    ],
    goals: [
      {
        id: 'goal_vacation',
        name: 'Vacation fund',
        target: 15000,
        saved: 4200,
        monthlyContribution: 800,
      },
      {
        id: 'goal_emergency',
        name: 'Emergency buffer',
        target: 10000,
        saved: 3500,
        monthlyContribution: 500,
      },
      {
        id: 'goal_laptop',
        name: 'New laptop',
        target: 8000,
        saved: 2100,
        monthlyContribution: 400,
      },
    ],
  }
}

export function createEmptyBudget(): BudgetState {
  const now = new Date()
  return {
    monthLabel: now.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    incomes: [{ id: 'inc_1', name: 'Primary income', amount: 0 }],
    expenses: [
      { id: 'exp_1', name: 'Rent', category: 'Housing', planned: 0, actual: 0, day: 1 },
      { id: 'exp_2', name: 'Groceries', category: 'Food', planned: 0, actual: 0 },
    ],
    goals: [
      {
        id: 'goal_vacation',
        name: 'Vacation fund',
        target: 0,
        saved: 0,
        monthlyContribution: 0,
      },
    ],
  }
}
