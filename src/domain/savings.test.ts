import { describe, it, expect } from 'vitest'
import { installmentInterest, maturityValue } from './savings'

describe('installmentInterest (적립식 단리)', () => {
  it('공식 환산치: 월50만 × 36개월 × 14.4% = 세전이자 3,996,000원', () => {
    expect(installmentInterest(500_000, 0.144, 36)).toBe(3_996_000)
  })
  it('월50만 × 36개월 × 19.4% = 5,383,500원', () => {
    expect(installmentInterest(500_000, 0.194, 36)).toBe(5_383_500)
  })
  it('납입 0개월이면 이자 0', () => {
    expect(installmentInterest(500_000, 0.08, 0)).toBe(0)
  })
})

describe('maturityValue', () => {
  it('원금은 적용금리, 기여금은 기본금리로 이자 계산', () => {
    const r = maturityValue({
      monthlyDeposit: 500_000, months: 36,
      appliedRate: 0.08, baseRate: 0.05, monthlyContribution: 30_000,
    })
    expect(r.principal).toBe(18_000_000)
    expect(r.principalInterest).toBe(2_220_000) // 50만×(0.08/12)×666
    expect(r.contribution).toBe(1_080_000) // 3만×36
    expect(r.contributionInterest).toBe(83_250) // 3만×(0.05/12)×666
    expect(r.total).toBe(21_383_250)
  })
})
