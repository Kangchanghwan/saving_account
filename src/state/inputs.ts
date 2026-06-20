import type { FutureContribType } from '../domain/types'

export type Mode = 'switch' | 'new'
export type LeapInputMode = 'monthly' | 'balance'

export interface AppInputs {
  mode: Mode
  // 도약
  leapBankId: string
  leapPrefs: string[]
  leapInputMode: LeapInputMode
  leapMonthly: number          // 월납입 기준 모드
  leapMonthsPaid: number       // 월납입 기준 모드
  leapPaidPrincipal: number    // 잔액 기준 모드: 지금까지 입금된 원금(원)
  leapMonthsRemaining: number  // 잔액 기준 모드: 남은 납입개월
  leapFutureMonthly: number    // 잔액 기준 모드: 향후 월 납입액(원)
  leapBracketId: string
  // 미래
  futureBankId: string
  futurePrefs: string[]
  futureMonthly: number
  futureContribType: FutureContribType
  // 옵션
  reinvestRate: number
}

export const DEFAULT_INPUTS: AppInputs = {
  mode: 'switch',
  leapBankId: 'shinhan', leapPrefs: [], leapInputMode: 'balance',
  leapMonthly: 700_000, leapMonthsPaid: 14,
  leapPaidPrincipal: 9_800_000, leapMonthsRemaining: 46, leapFutureMonthly: 700_000,
  leapBracketId: 'i2400',
  futureBankId: 'shinhan', futurePrefs: [], futureMonthly: 500_000, futureContribType: 'general',
  reinvestRate: 0,
}

export function encodeInputs(s: AppInputs): string {
  const p = new URLSearchParams()
  p.set('m', s.mode)
  p.set('lb', s.leapBankId)
  p.set('lp', s.leapPrefs.join('.'))
  p.set('lm', String(s.leapMonthly))
  p.set('lmp', String(s.leapMonthsPaid))
  p.set('lim', s.leapInputMode)
  p.set('lpp', String(s.leapPaidPrincipal))
  p.set('lmr', String(s.leapMonthsRemaining))
  p.set('lfm', String(s.leapFutureMonthly))
  p.set('lbr', s.leapBracketId)
  p.set('fb', s.futureBankId)
  p.set('fp', s.futurePrefs.join('.'))
  p.set('fm', String(s.futureMonthly))
  p.set('fc', s.futureContribType)
  p.set('ri', String(s.reinvestRate))
  return p.toString()
}

function num(v: string | null, fallback: number): number {
  if (v == null || v === '') return fallback
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

export function decodeInputs(query: string): AppInputs {
  if (!query) return DEFAULT_INPUTS
  const p = new URLSearchParams(query)
  const splitPrefs = (v: string | null) => (v ? v.split('.').filter(Boolean) : [])
  const limRaw = p.get('lim')
  const leapInputMode: LeapInputMode =
    limRaw === 'monthly' || limRaw === 'balance'
      ? limRaw
      : p.has('lmp') || p.has('lm')
        ? 'monthly'
        : DEFAULT_INPUTS.leapInputMode
  return {
    mode: (p.get('m') as Mode) || DEFAULT_INPUTS.mode,
    leapBankId: p.get('lb') || DEFAULT_INPUTS.leapBankId,
    leapPrefs: p.has('lp') ? splitPrefs(p.get('lp')) : DEFAULT_INPUTS.leapPrefs,
    leapInputMode,
    leapMonthly: num(p.get('lm'), DEFAULT_INPUTS.leapMonthly),
    leapMonthsPaid: num(p.get('lmp'), DEFAULT_INPUTS.leapMonthsPaid),
    leapPaidPrincipal: num(p.get('lpp'), DEFAULT_INPUTS.leapPaidPrincipal),
    leapMonthsRemaining: num(p.get('lmr'), DEFAULT_INPUTS.leapMonthsRemaining),
    leapFutureMonthly: num(p.get('lfm'), DEFAULT_INPUTS.leapFutureMonthly),
    leapBracketId: p.get('lbr') || DEFAULT_INPUTS.leapBracketId,
    futureBankId: p.get('fb') || DEFAULT_INPUTS.futureBankId,
    futurePrefs: p.has('fp') ? splitPrefs(p.get('fp')) : DEFAULT_INPUTS.futurePrefs,
    futureMonthly: num(p.get('fm'), DEFAULT_INPUTS.futureMonthly),
    futureContribType: (p.get('fc') as FutureContribType) || DEFAULT_INPUTS.futureContribType,
    reinvestRate: num(p.get('ri'), DEFAULT_INPUTS.reinvestRate),
  }
}
