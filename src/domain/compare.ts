import type { SwitchInput, SwitchResult } from './types'
import { futureMonthlyContribution, installmentInterest, leapTwoPhaseMaturity, maturityValue } from './savings'

const HORIZON = 36
const LEAP_TERM = 60

export function compareSwitch(input: SwitchInput): SwitchResult {
  const mPaid = Math.max(0, input.leapMonthsPaid)
  const maxFuture = Math.max(0, LEAP_TERM - mPaid)
  const rRemaining = Math.min(Math.max(0, input.leapMonthsRemaining), maxFuture)

  // 도약 특별해지 환급금: 과거 납입분만(기납입 mPaid개월)
  const leapRefund = leapTwoPhaseMaturity({
    avgMonthly: input.leapAvgMonthly, pastMonths: mPaid, futureMonthly: 0, futureMonths: 0,
    appliedRate: input.leapAppliedRate, baseRate: input.leapBaseRate, bracket: input.leapBracket,
  })

  // 미래적금 36개월 만기
  const futureMaturity = maturityValue({
    monthlyDeposit: input.futureMonthly, months: HORIZON,
    appliedRate: input.futureAppliedRate, baseRate: input.futureBaseRate,
    monthlyContribution: futureMonthlyContribution(input.futureMonthly, input.futureContribType),
  })

  // 남긴 현금: 매달 (도약 추가월납입 − 미래월납입) 적립 + 재예치
  const retainedMonthly = Math.max(0, input.leapFutureMonthly - input.futureMonthly)
  const retainedCash = retainedMonthly * HORIZON + installmentInterest(retainedMonthly, input.reinvestRate, HORIZON)

  // 회수금 V0를 36개월 단리 재예치(일시금)
  const v0Reinvested = leapRefund.total * (1 + (input.reinvestRate * HORIZON) / 12)

  const switchTotal = v0Reinvested + futureMaturity.total + retainedCash

  // KEEP: 36개월 호라이즌 시점 도약 평가(과거분 + 미래분, 만기 60 초과 안 함)
  const futureInHorizon = Math.min(rRemaining, HORIZON)
  const keepMonths = mPaid + futureInHorizon
  const keepEval = leapTwoPhaseMaturity({
    avgMonthly: input.leapAvgMonthly, pastMonths: mPaid,
    futureMonthly: input.leapFutureMonthly, futureMonths: futureInHorizon,
    appliedRate: input.leapAppliedRate, baseRate: input.leapBaseRate, bracket: input.leapBracket,
  })
  const keepTotal = keepEval.total

  // 도약 만기 평가(표기용): 기납입 + 남은개월 (≤60)
  const leapFullMaturity = leapTwoPhaseMaturity({
    avgMonthly: input.leapAvgMonthly, pastMonths: mPaid,
    futureMonthly: input.leapFutureMonthly, futureMonths: rRemaining,
    appliedRate: input.leapAppliedRate, baseRate: input.leapBaseRate, bracket: input.leapBracket,
  })

  return {
    horizonMonths: HORIZON, keepMonths, keepTotal, switchTotal, profit: switchTotal - keepTotal,
    keep: keepEval, leapRefund, futureMaturity, retainedCash, leapFullMaturity,
  }
}
