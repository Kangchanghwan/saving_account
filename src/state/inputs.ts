import type { FutureContribType } from '../domain/types'

export type Mode = 'switch' | 'new'

export interface AppInputs {
  mode: Mode
  // 도약
  leapBankId: string
  leapPrefs: string[]
  leapMonthly: number
  leapMonthsPaid: number
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
  leapBankId: 'shinhan', leapPrefs: [], leapMonthly: 700_000, leapMonthsPaid: 14, leapBracketId: 'i2400',
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
  p.set('lbr', s.leapBracketId)
  p.set('fb', s.futureBankId)
  p.set('fp', s.futurePrefs.join('.'))
  p.set('fm', String(s.futureMonthly))
  p.set('fc', s.futureContribType)
  p.set('ri', String(s.reinvestRate))
  return p.toString()
}

export function decodeInputs(query: string): AppInputs {
  if (!query) return DEFAULT_INPUTS
  const p = new URLSearchParams(query)
  const splitPrefs = (v: string | null) => (v ? v.split('.').filter(Boolean) : [])
  return {
    mode: (p.get('m') as Mode) || DEFAULT_INPUTS.mode,
    leapBankId: p.get('lb') || DEFAULT_INPUTS.leapBankId,
    leapPrefs: p.has('lp') ? splitPrefs(p.get('lp')) : DEFAULT_INPUTS.leapPrefs,
    leapMonthly: Number(p.get('lm') ?? DEFAULT_INPUTS.leapMonthly),
    leapMonthsPaid: Number(p.get('lmp') ?? DEFAULT_INPUTS.leapMonthsPaid),
    leapBracketId: p.get('lbr') || DEFAULT_INPUTS.leapBracketId,
    futureBankId: p.get('fb') || DEFAULT_INPUTS.futureBankId,
    futurePrefs: p.has('fp') ? splitPrefs(p.get('fp')) : DEFAULT_INPUTS.futurePrefs,
    futureMonthly: Number(p.get('fm') ?? DEFAULT_INPUTS.futureMonthly),
    futureContribType: (p.get('fc') as FutureContribType) || DEFAULT_INPUTS.futureContribType,
    reinvestRate: Number(p.get('ri') ?? DEFAULT_INPUTS.reinvestRate),
  }
}
