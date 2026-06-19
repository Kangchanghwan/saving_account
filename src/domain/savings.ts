import type { MaturityInput, MaturityResult, FutureContribType } from './types'

/**
 * 적립식 단리 이자. 1회차는 n개월, n회차는 1개월 예치 → 합계계수 n(n+1)/2.
 * 공식 워크드 예제로 검증됨(spec §11).
 */
export function installmentInterest(monthly: number, annualRate: number, months: number): number {
  return Math.round(monthly * (annualRate / 12) * (months * (months + 1) / 2))
}

const FUTURE_CONTRIB: Record<FutureContribType, { rate: number; cap: number }> = {
  general: { rate: 0.06, cap: 30_000 },
  preferential: { rate: 0.12, cap: 60_000 },
  none: { rate: 0, cap: 0 },
}

export function futureMonthlyContribution(monthlyDeposit: number, type: FutureContribType): number {
  const { rate, cap } = FUTURE_CONTRIB[type]
  return Math.min(monthlyDeposit * rate, cap)
}

export function maturityValue(input: MaturityInput): MaturityResult {
  const principal = input.monthlyDeposit * input.months
  const principalInterest = installmentInterest(input.monthlyDeposit, input.appliedRate, input.months)
  const contribution = input.monthlyContribution * input.months
  const contributionInterest = installmentInterest(input.monthlyContribution, input.baseRate, input.months)
  const total = principal + principalInterest + contribution + contributionInterest
  return { principal, principalInterest, contribution, contributionInterest, total }
}
