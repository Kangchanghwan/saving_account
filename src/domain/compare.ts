import type { SwitchInput, SwitchResult } from './types'
import { futureMonthlyContribution, installmentInterest, leapMonthlyContribution, maturityValue } from './savings'

const HORIZON = 36
const LEAP_TERM = 60

export function compareSwitch(input: SwitchInput): SwitchResult {
  const leapMonthlyContrib = leapMonthlyContribution(input.leapMonthly, input.leapBracket)

  // 도약 특별해지 환급금: 기납입 m개월, 만기해지에 준함(기본+우대, 기여금 포함, 비과세)
  const leapRefund = maturityValue({
    monthlyDeposit: input.leapMonthly, months: input.leapMonthsPaid,
    appliedRate: input.leapAppliedRate, baseRate: input.leapBaseRate,
    monthlyContribution: leapMonthlyContrib,
  })

  // 미래적금 36개월 만기
  const futureMaturity = maturityValue({
    monthlyDeposit: input.futureMonthly, months: HORIZON,
    appliedRate: input.futureAppliedRate, baseRate: input.futureBaseRate,
    monthlyContribution: futureMonthlyContribution(input.futureMonthly, input.futureContribType),
  })

  // 남긴 현금: 매달 (도약월납입 - 미래월납입) 적립 + 재예치
  const retainedMonthly = Math.max(0, input.leapMonthly - input.futureMonthly)
  const retainedCash = retainedMonthly * HORIZON + installmentInterest(retainedMonthly, input.reinvestRate, HORIZON)

  // 회수금 V0를 36개월 단리 재예치(일시금)
  const v0Reinvested = leapRefund.total * (1 + input.reinvestRate * HORIZON / 12)

  const switchTotal = v0Reinvested + futureMaturity.total + retainedCash

  // KEEP: 36개월 시점 도약 평가액(만기 60개월 초과 안 함)
  const keepMonths = Math.min(input.leapMonthsPaid + HORIZON, LEAP_TERM)
  const keepEval = maturityValue({
    monthlyDeposit: input.leapMonthly, months: keepMonths,
    appliedRate: input.leapAppliedRate, baseRate: input.leapBaseRate,
    monthlyContribution: leapMonthlyContrib,
  })
  const keepTotal = keepEval.total

  // 도약 60개월 만기(표기용)
  const leapFullMaturity = maturityValue({
    monthlyDeposit: input.leapMonthly, months: LEAP_TERM,
    appliedRate: input.leapAppliedRate, baseRate: input.leapBaseRate,
    monthlyContribution: leapMonthlyContrib,
  })

  return {
    horizonMonths: HORIZON, keepTotal, switchTotal, profit: switchTotal - keepTotal,
    leapRefund, futureMaturity, retainedCash, leapFullMaturity,
  }
}
