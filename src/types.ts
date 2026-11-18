export type IncomeItem = {
  id: string
  name: string
  amount: number
}

export type ExpenseItem = {
  id: string
  name: string
  category: string
  planned: number
  actual: number
  day?: number
}

export type SavingsGoal = {
  id: string
  name: string
  target: number
  saved: number
  monthlyContribution: number
}

export type BudgetState = {
  monthLabel: string
  year: number
  month: number
  incomes: IncomeItem[]
  expenses: ExpenseItem[]
  goals: SavingsGoal[]
}

export type ViewId = 'overview' | 'income' | 'expenses' | 'goals' | 'calendar'
