import type { Bank } from '../data/banks'
import type { ReactNode } from 'react'
import { manwon } from '../format'

export function ProductInputCard({
  title, banks, bankId, onBankChange, monthly, monthlyMax, onMonthlyChange, children,
}: {
  title: string
  banks: Bank[]
  bankId: string
  onBankChange: (id: string) => void
  monthly: number
  monthlyMax: number
  onMonthlyChange: (won: number) => void
  children?: ReactNode
}) {
  return (
    <div className="input-card">
      <h3>{title}</h3>
      <label className="fld">
        <span>가입 은행</span>
        <select value={bankId} onChange={(e) => onBankChange(e.target.value)}>
          {banks.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </label>
      <div className="fld fld-slider">
        <div className="slider-head">
          <span>월 납입액</span>
          <output className="slider-val">{manwon(monthly)}</output>
        </div>
        <input
          type="range" min={0} max={monthlyMax} step={10_000}
          value={monthly}
          aria-label="월 납입액"
          onChange={(e) => onMonthlyChange(Number(e.target.value))}
        />
        <div className="slider-scale"><span>0</span><span>{manwon(monthlyMax)}</span></div>
      </div>
      {children}
    </div>
  )
}
