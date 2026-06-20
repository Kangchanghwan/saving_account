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
  it('추가 월납입(leapFutureMonthly)은 월 납입액과 동일하게 매핑', () => {
    const si = buildSwitchInput({ ...DEFAULT_INPUTS, leapMonthly: 500_000 })
    expect(si.leapAvgMonthly).toBe(500_000)
    expect(si.leapFutureMonthly).toBe(500_000)
  })
  it('남은개월은 60 − 기납입개월로 자동 계산', () => {
    const si = buildSwitchInput({ ...DEFAULT_INPUTS, leapMonthsPaid: 50 })
    expect(si.leapMonthsRemaining).toBe(10) // 60 - 50
  })
})
