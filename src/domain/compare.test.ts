import { describe, it, expect } from 'vitest'
import { compareSwitch } from './compare'
import { LEAP_BRACKETS } from '../data/leapBrackets'

const base = {
  leapMonthly: 700_000, leapMonthsPaid: 14, leapAppliedRate: 0.05, leapBaseRate: 0.045,
  leapBracket: LEAP_BRACKETS[0],
  futureMonthly: 500_000, futureAppliedRate: 0.08, futureBaseRate: 0.05, futureContribType: 'general' as const,
  reinvestRate: 0,
}

describe('compareSwitch', () => {
  it('horizon은 36개월', () => {
    expect(compareSwitch(base).horizonMonths).toBe(36)
  })
  it('도약 특별해지 환급금은 기납입 14개월 기준(페널티 0, 기여금 포함)', () => {
    const r = compareSwitch(base)
    expect(r.leapRefund.principal).toBe(700_000 * 14)
    expect(r.leapRefund.contribution).toBe(33_000 * 14) // 2,400만 구간 월70만
    expect(r.leapRefund.total).toBeGreaterThan(r.leapRefund.principal)
  })
  it('남긴 현금 = (도약월납입 - 미래월납입) × 36 (재예치 0)', () => {
    expect(compareSwitch(base).retainedCash).toBe(200_000 * 36)
  })
  it('profit = switchTotal - keepTotal', () => {
    const r = compareSwitch(base)
    expect(r.profit).toBeCloseTo(r.switchTotal - r.keepTotal, 5)
  })
  it('미래 월납입을 0으로 줄이면 switchTotal은 회수금+남긴현금만', () => {
    const r = compareSwitch({ ...base, futureMonthly: 0 })
    expect(r.futureMaturity.total).toBe(0)
  })
})
