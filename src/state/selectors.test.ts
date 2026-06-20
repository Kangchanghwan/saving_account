import { describe, it, expect } from 'vitest'
import { buildSwitchInput } from './selectors'
import { DEFAULT_INPUTS } from './inputs'

describe('buildSwitchInput', () => {
  it('기본 입력(잔액모드)으로 SwitchInput을 구성한다', () => {
    const si = buildSwitchInput(DEFAULT_INPUTS)
    expect(si.leapAvgMonthly).toBe(700_000) // 9,800,000 / 14
    expect(si.leapFutureMonthly).toBe(700_000)
    expect(si.leapMonthsRemaining).toBe(46)
    expect(si.leapMonthsPaid).toBe(14)
    expect(si.futureMonthly).toBe(500_000)
    expect(si.leapBracket.id).toBe('i2400')
    expect(si.leapAppliedRate).toBeGreaterThanOrEqual(0.045)
    expect(si.futureAppliedRate).toBeGreaterThanOrEqual(0.05)
  })
  it('월납입 모드: 추가 월납입은 월 납입액과 동일 매핑', () => {
    const si = buildSwitchInput({ ...DEFAULT_INPUTS, leapInputMode: 'monthly', leapMonthly: 500_000 })
    expect(si.leapAvgMonthly).toBe(500_000)
    expect(si.leapFutureMonthly).toBe(500_000)
  })
  it('월납입 모드: 남은개월은 60 − 기납입개월로 자동 계산', () => {
    const si = buildSwitchInput({ ...DEFAULT_INPUTS, leapInputMode: 'monthly', leapMonthsPaid: 50 })
    expect(si.leapMonthsRemaining).toBe(10)
  })
  it('잔액 모드: 원금/남은개월로 평균월납입 산출', () => {
    const si = buildSwitchInput({
      ...DEFAULT_INPUTS, leapInputMode: 'balance',
      leapPaidPrincipal: 18_900_000, leapMonthsRemaining: 32, leapFutureMonthly: 300_000,
    })
    expect(si.leapMonthsPaid).toBe(28) // 60 - 32
    expect(si.leapAvgMonthly).toBe(675_000) // round(18,900,000 / 28)
    expect(si.leapFutureMonthly).toBe(300_000)
    expect(si.leapMonthsRemaining).toBe(32)
  })
  it('잔액 모드: 남은 60개월(경과 0)이면 평균 0 (0 나눗셈 가드)', () => {
    const si = buildSwitchInput({
      ...DEFAULT_INPUTS, leapInputMode: 'balance', leapMonthsRemaining: 60, leapPaidPrincipal: 5_000_000,
    })
    expect(si.leapMonthsPaid).toBe(0)
    expect(si.leapAvgMonthly).toBe(0)
  })
  it('leapRateDirect면 도약금리는 base+override (칩 무시)', () => {
    const s = {
      ...DEFAULT_INPUTS,
      leapBankId: 'shinhan',          // base 0.045
      leapPrefs: ['salary', 'card'],  // 칩 합 0.6%p — 무시돼야 함
      leapRateDirect: true,
      leapRateOverride: 0.008,
    }
    expect(buildSwitchInput(s).leapAppliedRate).toBeCloseTo(0.053, 6)
  })
  it('leapRateDirect false면 기존 칩 합산', () => {
    const s = {
      ...DEFAULT_INPUTS,
      leapBankId: 'shinhan',
      leapPrefs: ['salary', 'card'],  // 0.003 + 0.003
      leapRateDirect: false,
    }
    expect(buildSwitchInput(s).leapAppliedRate).toBeCloseTo(0.051, 6)
  })
})
