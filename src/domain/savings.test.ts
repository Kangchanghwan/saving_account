import { describe, it, expect } from 'vitest'
import { installmentInterest, maturityValue, futureMonthlyContribution, leapMonthlyContribution, phaseInterest, leapTwoPhaseMaturity } from './savings'
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

describe('엣지 케이스 (none 구간·음수 입력)', () => {
  it('도약 none 구간이면 기여금 0', () => {
    const none = LEAP_BRACKETS.find(b => b.id === 'none')!
    expect(leapMonthlyContribution(700_000, none)).toBe(0)
  })
  it('음수 개월·음수 납입은 0 (이자/기여금 모두)', () => {
    expect(installmentInterest(500_000, 0.08, -5)).toBe(0)
    expect(leapMonthlyContribution(-100_000, LEAP_BRACKETS[0])).toBe(0)
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

describe('phaseInterest (구간 단리 이자)', () => {
  it('tail=0이면 installmentInterest와 동일', () => {
    expect(phaseInterest(500_000, 0.144, 36, 0)).toBe(installmentInterest(500_000, 0.144, 36))
    expect(phaseInterest(700_000, 0.05, 14, 0)).toBe(installmentInterest(700_000, 0.05, 14))
  })
  it('명시 예제: 월10만 × 0.12 × (S(5)-S(3)=9) = 9,000', () => {
    expect(phaseInterest(100_000, 0.12, 2, 3)).toBe(9_000)
  })
  it('구간 분해 합 = 단일구간 (과거 14 + 미래 36 = 50개월)', () => {
    const split = phaseInterest(700_000, 0.05, 14, 36) + phaseInterest(700_000, 0.05, 36, 0)
    expect(split).toBe(installmentInterest(700_000, 0.05, 50))
    expect(split).toBe(3_718_750)
  })
  it('음수 입력은 0', () => {
    expect(phaseInterest(-100, 0.05, 5, 3)).toBe(0)
    expect(phaseInterest(100_000, 0.05, -5, 3)).toBe(0)
  })
})

describe('leapTwoPhaseMaturity (도약 2단계 만기)', () => {
  const b2400 = LEAP_BRACKETS[0]
  it('미래분 0이면 단일구간 환급금과 동일 (월70만·14개월)', () => {
    const r = leapTwoPhaseMaturity({
      avgMonthly: 700_000, pastMonths: 14, futureMonthly: 0, futureMonths: 0,
      appliedRate: 0.05, baseRate: 0.045, bracket: b2400,
    })
    expect(r.principal).toBe(9_800_000) // 70만×14
    expect(r.principalInterest).toBe(306_250) // installmentInterest(70만,0.05,14)
    expect(r.contribution).toBe(462_000) // 33,000×14
    expect(r.contributionInterest).toBe(12_994) // 33,000×(0.045/12)×105
    expect(r.total).toBe(10_581_244)
  })
  it('2단계: 과거 월60만 28개월 + 미래 월30만 32개월', () => {
    const r = leapTwoPhaseMaturity({
      avgMonthly: 600_000, pastMonths: 28, futureMonthly: 300_000, futureMonths: 32,
      appliedRate: 0.05, baseRate: 0.045, bracket: b2400,
    })
    expect(r.principal).toBe(26_400_000) // 60만×28 + 30만×32
    // 기여금: leapContrib(60만)=30,000 ×28 + leapContrib(30만)=18,000 ×32
    expect(r.contribution).toBe(1_416_000)
    expect(r.principalInterest).toBe(3_915_000) // phaseInterest(60만,0.05,28,32)=3,255,000 + phaseInterest(30만,0.05,32,0)=660,000
    expect(r.contributionInterest).toBe(182_115) // phaseInterest(30000,0.045,28,32)=146,475 + phaseInterest(18000,0.045,32,0)=35,640
    expect(r.total).toBe(31_913_115)
  })
})
