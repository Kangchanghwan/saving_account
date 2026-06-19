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
})
