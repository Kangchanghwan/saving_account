import type { MaturityInput, MaturityResult, FutureContribType, LeapBracket } from './types'

/**
 * 적립식 단리 이자. 1회차는 n개월, n회차는 1개월 예치 → 합계계수 n(n+1)/2.
 * 공식 워크드 예제로 검증됨(spec §11).
 */
export function installmentInterest(monthly: number, annualRate: number, months: number): number {
  const m = Math.max(0, months)
  const p = Math.max(0, monthly)
  return Math.round(p * (annualRate / 12) * (m * (m + 1) / 2))
}

const FUTURE_CONTRIB: Record<FutureContribType, { rate: number; cap: number }> = {
  general: { rate: 0.06, cap: 30_000 },
  preferential: { rate: 0.12, cap: 60_000 },
  none: { rate: 0, cap: 0 },
}

export function futureMonthlyContribution(monthlyDeposit: number, type: FutureContribType): number {
  const { rate, cap } = FUTURE_CONTRIB[type]
  const dep = Math.max(0, monthlyDeposit)
  return Math.round(Math.min(dep * rate, cap))
}

const LEAP_MONTHLY_MAX = 700_000

export function leapMonthlyContribution(monthlyDeposit: number, bracket: LeapBracket): number {
  const dep = Math.max(0, monthlyDeposit)
  const capped = Math.min(dep, LEAP_MONTHLY_MAX)
  const inLimit = Math.min(capped, bracket.matchLimit) * bracket.rateInLimit
  const extra = Math.max(0, capped - bracket.matchLimit) * bracket.extraRate
  return Math.round(inLimit + extra)
}

export function maturityValue(input: MaturityInput): MaturityResult {
  const principal = Math.round(input.monthlyDeposit * input.months)
  const principalInterest = installmentInterest(input.monthlyDeposit, input.appliedRate, input.months)
  const contribution = Math.round(input.monthlyContribution * input.months)
  const contributionInterest = installmentInterest(input.monthlyContribution, input.baseRate, input.months)
  const total = principal + principalInterest + contribution + contributionInterest
  return { principal, principalInterest, contribution, contributionInterest, total }
}
