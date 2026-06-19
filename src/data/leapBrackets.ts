import type { LeapBracket } from '../domain/types'

/** 도약계좌 소득구간별 2단 매칭표 (research/bank-rate-data.md 검증값) */
export const LEAP_BRACKETS: LeapBracket[] = [
  { id: 'i2400', label: '총급여 2,400만원 이하', matchLimit: 400_000, rateInLimit: 0.06, extraRate: 0.03, monthlyCap: 33_000 },
  { id: 'i3600', label: '총급여 3,600만원 이하', matchLimit: 500_000, rateInLimit: 0.046, extraRate: 0.03, monthlyCap: 29_000 },
  { id: 'i4800', label: '총급여 4,800만원 이하', matchLimit: 600_000, rateInLimit: 0.037, extraRate: 0.03, monthlyCap: 25_200 },
  { id: 'i6000', label: '총급여 6,000만원 이하', matchLimit: 700_000, rateInLimit: 0.03, extraRate: 0, monthlyCap: 21_000 },
  { id: 'none', label: '총급여 6,000만원 초과(미지급)', matchLimit: 0, rateInLimit: 0, extraRate: 0, monthlyCap: 0 },
]
