const madFormatter = new Intl.NumberFormat('fr-MA', {
  style: 'currency',
  currency: 'MAD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const madPrecise = new Intl.NumberFormat('fr-MA', {
  style: 'currency',
  currency: 'MAD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Format Moroccan Dirham for display in cells and summaries. */
export function formatMad(amount: number, precise = false): string {
  if (!Number.isFinite(amount)) return madFormatter.format(0)
  return precise ? madPrecise.format(amount) : madFormatter.format(amount)
}

export function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^\d.,-]/g, '').replace(',', '.')
  const value = Number.parseFloat(cleaned)
  return Number.isFinite(value) ? value : 0
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}
