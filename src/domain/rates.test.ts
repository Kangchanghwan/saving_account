import { describe, it, expect } from 'vitest'
import { appliedRate } from './rates'
import type { BankProduct } from '../data/banks'

const bp: BankProduct = {
  baseRate: 0.05, maxRate: 0.08,
  preferential: [
    { id: 'a', label: 'A', rate: 0.005 },
    { id: 'b', label: 'B', rate: 0.01 },
    { id: 'c', label: 'C', rate: 0.03 },
  ],
}

describe('appliedRate', () => {
  it('기본 + 체크된 우대 합', () => {
    expect(appliedRate(bp, ['a', 'b'])).toBeCloseTo(0.065, 6)
  })
  it('maxRate로 클램프', () => {
    expect(appliedRate(bp, ['a', 'b', 'c'])).toBe(0.08) // 0.05+0.045=0.095 → 0.08
  })
  it('체크 없으면 기본금리', () => {
    expect(appliedRate(bp, [])).toBe(0.05)
  })
})
