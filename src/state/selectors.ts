import type { AppInputs } from './inputs'
import type { SwitchInput } from '../domain/types'
import { BANKS } from '../data/banks'
import { LEAP_BRACKETS } from '../data/leapBrackets'
import { appliedRate } from '../domain/rates'

const LEAP_TERM = 60

function bank(id: string) {
  return BANKS.find((b) => b.id === id) ?? BANKS[0]
}

export function buildSwitchInput(s: AppInputs): SwitchInput {
  const leapBank = bank(s.leapBankId)
  const futureBank = bank(s.futureBankId)
  const leapProduct = leapBank.leap ?? { baseRate: 0.045, maxRate: 0.06, preferential: [] }
  const futureProduct = futureBank.future ?? { baseRate: 0.05, maxRate: 0.08, preferential: [] }
  const bracket = LEAP_BRACKETS.find((b) => b.id === s.leapBracketId) ?? LEAP_BRACKETS[0]

  let mPaid: number
  let avgMonthly: number
  let future: number
  let remaining: number
  if (s.leapInputMode === 'balance') {
    remaining = Math.min(Math.max(0, s.leapMonthsRemaining), LEAP_TERM)
    mPaid = LEAP_TERM - remaining
    avgMonthly = mPaid > 0 ? Math.round(s.leapPaidPrincipal / mPaid) : 0
    future = s.leapFutureMonthly
  } else {
    mPaid = Math.max(0, s.leapMonthsPaid)
    avgMonthly = s.leapMonthly
    future = s.leapMonthly
    remaining = Math.max(0, LEAP_TERM - mPaid)
  }

  return {
    leapAvgMonthly: avgMonthly,
    leapMonthsPaid: mPaid,
    leapFutureMonthly: future,
    leapMonthsRemaining: remaining,
    leapAppliedRate: s.leapRateDirect
      ? appliedRate(leapProduct, s.leapPrefs, s.leapRateOverride)
      : appliedRate(leapProduct, s.leapPrefs),
    leapBaseRate: leapProduct.baseRate,
    leapBracket: bracket,
    futureMonthly: s.futureMonthly,
    futureAppliedRate: appliedRate(futureProduct, s.futurePrefs),
    futureBaseRate: futureProduct.baseRate,
    futureContribType: s.futureContribType,
    reinvestRate: s.reinvestRate,
  }
}
