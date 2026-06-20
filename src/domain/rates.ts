import type { BankProduct } from '../data/banks'

export function appliedRate(
  product: BankProduct,
  checkedIds: string[],
  override?: number, // decimal 우대 %p. 주어지면 칩 무시하고 base+override 사용
): number {
  if (override != null) {
    return Math.min(product.baseRate + override, product.maxRate)
  }
  const bonus = product.preferential
    .filter((p) => checkedIds.includes(p.id))
    .reduce((sum, p) => sum + p.rate, 0)
  return Math.min(product.baseRate + bonus, product.maxRate)
}
