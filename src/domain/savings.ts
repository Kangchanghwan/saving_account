import type { MaturityInput, MaturityResult, FutureContribType, LeapBracket } from './types'

/**
 * 적립식 단리 이자 구간 계산.
 * count개월 연속 납입분의 이자. 각 납입분이 자기 구간 종료 후 tail개월을 더 적립.
 * 합계계수 = S(tail+count) − S(tail), S(x)=x(x+1)/2.
 */
export function phaseInterest(monthly: number, annualRate: number, count: number, tail: number): number {
  const c = Math.max(0, count)
  const t = Math.max(0, tail)
  const p = Math.max(0, monthly)
  const S = (x: number) => (x * (x + 1)) / 2
  return Math.round(p * (annualRate / 12) * (S(t + c) - S(t)))
}

/** 적립식 단리 이자. 1회차는 n개월…n회차는 1개월 → 합계계수 n(n+1)/2. (phaseInterest tail=0) */
export function installmentInterest(monthly: number, annualRate: number, months: number): number {
  return phaseInterest(monthly, annualRate, months, 0)
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
