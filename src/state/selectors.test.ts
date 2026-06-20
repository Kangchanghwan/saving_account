import { describe, it, expect } from 'vitest'
import { buildSwitchInput } from './selectors'
import { DEFAULT_INPUTS } from './inputs'

describe('buildSwitchInput', () => {
  it('기본 입력으로 SwitchInput을 구성한다', () => {
    const si = buildSwitchInput(DEFAULT_INPUTS)
    expect(si.leapAvgMonthly).toBe(700_000)
    expect(si.leapFutureMonthly).toBe(700_000)
    expect(si.leapMonthsRemaining).toBe(46)
    expect(si.futureMonthly).toBe(500_000)
    expect(si.leapBracket.id).toBe('i2400')
    expect(si.leapAppliedRate).toBeGreaterThanOrEqual(0.045)
    expect(si.futureAppliedRate).toBeGreaterThanOrEqual(0.05)
  })
  it('금액 모드: avgMonthly = 기납입금액 / 기납입개월 (출금 반영)', () => {
    const si = buildSwitchInput({ ...DEFAULT_INPUTS, leapPaidMode: 'amount', leapPaidAmount: 7_000_000, leapMonthsPaid: 14 })
    expect(si.leapAvgMonthly).toBe(500_000) // 700만 / 14
  })
  it('기납입 0개월 금액모드는 avgMonthly 0 (0 나눗셈 방지)', () => {
    const si = buildSwitchInput({ ...DEFAULT_INPUTS, leapPaidMode: 'amount', leapPaidAmount: 5_000_000, leapMonthsPaid: 0 })
    expect(si.leapAvgMonthly).toBe(0)
  })
  it('남은개월은 60 − 기납입개월로 클램프', () => {
    const si = buildSwitchInput({ ...DEFAULT_INPUTS, leapMonthsPaid: 50, leapMonthsRemaining: 46 })
    expect(si.leapMonthsRemaining).toBe(10) // min(46, 60-50)
  })
})
