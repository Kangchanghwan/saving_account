import type { BankProduct } from '../data/banks'

export function appliedRate(product: BankProduct, checkedIds: string[]): number {
  const bonus = product.preferential
    .filter((p) => checkedIds.includes(p.id))
    .reduce((sum, p) => sum + p.rate, 0)
  return Math.min(product.baseRate + bonus, product.maxRate)
}
