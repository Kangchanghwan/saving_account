import { describe, it, expect } from 'vitest'
import { installmentInterest } from './savings'

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
