import { describe, it, expect } from 'vitest'
import { DEFAULT_INPUTS, encodeInputs, decodeInputs } from './inputs'

describe('inputs URL 직렬화', () => {
  it('encode→decode 라운드트립', () => {
    const s = { ...DEFAULT_INPUTS, leapMonthly: 700_000, leapMonthsPaid: 20 }
    const round = decodeInputs(encodeInputs(s))
    expect(round.leapMonthly).toBe(700_000)
    expect(round.leapMonthsPaid).toBe(20)
  })
  it('빈 쿼리는 기본값', () => {
    expect(decodeInputs('')).toEqual(DEFAULT_INPUTS)
  })
  it('잘못된 숫자 파라미터는 기본값으로 폴백(NaN 방지)', () => {
    const r = decodeInputs('lm=abc&lmp=&fm=xyz&ri=zzz')
    expect(r.leapMonthly).toBe(DEFAULT_INPUTS.leapMonthly)
    expect(r.leapMonthsPaid).toBe(DEFAULT_INPUTS.leapMonthsPaid)
    expect(r.futureMonthly).toBe(DEFAULT_INPUTS.futureMonthly)
    expect(r.reinvestRate).toBe(DEFAULT_INPUTS.reinvestRate)
    expect(Number.isNaN(r.leapMonthly)).toBe(false)
  })
  it('옛 공유 URL의 제거된 파라미터(lpm/lpa/lfm/lmr)는 무시되고 깨지지 않음', () => {
    const r = decodeInputs('lm=700000&lmp=20&lpm=amount&lpa=15000000&lfm=300000&lmr=20')
    expect(r.leapMonthly).toBe(700_000)
    expect(r.leapMonthsPaid).toBe(20)
  })
  it('신규 잔액모드 필드 encode→decode 라운드트립', () => {
    const s = {
      ...DEFAULT_INPUTS,
      leapInputMode: 'balance' as const,
      leapPaidPrincipal: 18_900_000,
      leapMonthsRemaining: 32,
      leapFutureMonthly: 300_000,
    }
    const r = decodeInputs(encodeInputs(s))
    expect(r.leapInputMode).toBe('balance')
    expect(r.leapPaidPrincipal).toBe(18_900_000)
    expect(r.leapMonthsRemaining).toBe(32)
    expect(r.leapFutureMonthly).toBe(300_000)
  })
  it('기본 입력 모드는 balance', () => {
    expect(DEFAULT_INPUTS.leapInputMode).toBe('balance')
    expect(decodeInputs('').leapInputMode).toBe('balance')
  })
  it('레거시 공유 URL(lim 없음, lmp 있음)은 monthly로 폴백', () => {
    const r = decodeInputs('lm=700000&lmp=20')
    expect(r.leapInputMode).toBe('monthly')
  })
  it('lim이 명시되면 그 값을 사용', () => {
    expect(decodeInputs('lim=monthly&lmp=20').leapInputMode).toBe('monthly')
    expect(decodeInputs('lim=balance&lpp=18900000').leapInputMode).toBe('balance')
  })
  it('우대 직접입력 필드 encode→decode 라운드트립', () => {
    const s = { ...DEFAULT_INPUTS, leapRateDirect: true, leapRateOverride: 0.008 }
    const r = decodeInputs(encodeInputs(s))
    expect(r.leapRateDirect).toBe(true)
    expect(r.leapRateOverride).toBeCloseTo(0.008, 6)
  })
  it('레거시 URL(lrd/lro 없음)은 직접입력 off + override 0', () => {
    const r = decodeInputs('lm=700000&lmp=20')
    expect(r.leapRateDirect).toBe(false)
    expect(r.leapRateOverride).toBe(0)
  })
  it('기본값은 직접입력 off', () => {
    expect(DEFAULT_INPUTS.leapRateDirect).toBe(false)
    expect(DEFAULT_INPUTS.leapRateOverride).toBe(0)
  })
})
