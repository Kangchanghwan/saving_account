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

  const mPaid = Math.max(0, s.leapMonthsPaid)
  const avgMonthly = s.leapPaidMode === 'amount'
    ? (mPaid > 0 ? s.leapPaidAmount / mPaid : 0)
    : s.leapMonthly
  const remaining = Math.min(Math.max(0, s.leapMonthsRemaining), Math.max(0, LEAP_TERM - mPaid))

  return {
    leapAvgMonthly: avgMonthly,
    leapMonthsPaid: mPaid,
    leapFutureMonthly: s.leapFutureMonthly,
    leapMonthsRemaining: remaining,
    leapAppliedRate: appliedRate(leapProduct, s.leapPrefs),
    leapBaseRate: leapProduct.baseRate,
    leapBracket: bracket,
    futureMonthly: s.futureMonthly,
    futureAppliedRate: appliedRate(futureProduct, s.futurePrefs),
    futureBaseRate: futureProduct.baseRate,
    futureContribType: s.futureContribType,
    reinvestRate: s.reinvestRate,
  }
}
