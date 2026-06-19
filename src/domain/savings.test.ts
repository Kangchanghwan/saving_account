import { describe, it, expect } from 'vitest'
import { installmentInterest, maturityValue, futureMonthlyContribution, leapMonthlyContribution } from './savings'
import { LEAP_BRACKETS } from '../data/leapBrackets'

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

describe('futureMonthlyContribution', () => {
  it('일반형 6%, 월한도 3만', () => {
    expect(futureMonthlyContribution(500_000, 'general')).toBe(30_000) // min(3만,3만)
    expect(futureMonthlyContribution(300_000, 'general')).toBe(18_000) // 30만×6%
  })
  it('우대형 12%, 월한도 6만', () => {
    expect(futureMonthlyContribution(500_000, 'preferential')).toBe(60_000)
  })
  it('미지급형 0', () => {
    expect(futureMonthlyContribution(500_000, 'none')).toBe(0)
  })
})

describe('leapMonthlyContribution (2단 매칭)', () => {
  const b2400 = LEAP_BRACKETS[0]
  it('공식 예제: 소득2,400만↓ 월70만 → 40만×6% + 30만×3% = 33,000', () => {
    expect(leapMonthlyContribution(700_000, b2400)).toBe(33_000)
  })
  it('각 구간 월70만 납입 시 monthlyCap과 일치', () => {
    for (const b of LEAP_BRACKETS) {
      expect(leapMonthlyContribution(700_000, b)).toBe(b.monthlyCap)
    }
  })
  it('한도 미만 납입은 납입액 기준으로만 매칭', () => {
    expect(leapMonthlyContribution(300_000, b2400)).toBe(18_000) // 30만×6%
  })
})

describe('공식 만기총액 재현 (정책브리핑 8% 가정)', () => {
  const common = { monthlyDeposit: 500_000, months: 36, appliedRate: 0.08, baseRate: 0.05 }
  it('일반형 → 2,138만원(반올림)', () => {
    const r = maturityValue({ ...common, monthlyContribution: futureMonthlyContribution(500_000, 'general') })
    expect(Math.round(r.total / 10_000)).toBe(2_138)
  })
  it('우대형 → 2,255만원(반올림)', () => {
    const r = maturityValue({ ...common, monthlyContribution: futureMonthlyContribution(500_000, 'preferential') })
    expect(Math.round(r.total / 10_000)).toBe(2_255)
  })
  it('도약 소득2,300만·월70만·60개월 기여금 합 = 198만', () => {
    const monthly = leapMonthlyContribution(700_000, LEAP_BRACKETS[0])
    expect(monthly * 60).toBe(1_980_000)
  })
})
