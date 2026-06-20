import type { ReactNode } from 'react'
import type { AppInputs } from '../state/inputs'
import { BANKS } from '../data/banks'
import { LEAP_BRACKETS } from '../data/leapBrackets'
import { PRODUCTS } from '../data/products'
import { RateChecklist } from './RateChecklist'
import { manwon } from '../format'

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="ctrl">
      <label>{label}</label>
      {children}
    </div>
  )
}

function Slider({
  label, value, max, min = 0, step = 10_000, unit = '만원', onChange,
}: {
  label: string; value: number; max: number; min?: number; step?: number; unit?: '만원' | '개월'
  onChange: (v: number) => void
}) {
  const display = unit === '만원' ? manwon(value) : `${value}개월`
  return (
    <div className="ctrl">
      <div className="ctrl-head">
        <label>{label}</label>
        <span className="ctrl-val">{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value} aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

export function ScenarioControls({
  inputs, set,
}: { inputs: AppInputs; set: (p: Partial<AppInputs>) => void }) {
  const switchMode = inputs.mode === 'switch'
  const leapBank = BANKS.find((b) => b.id === inputs.leapBankId)
  const futureBank = BANKS.find((b) => b.id === inputs.futureBankId)
  // 신규(미래적금 단독) 모드에선 도약 연계가입 우대(defaultChecked)는 해당 없음 → 칩에서 제외
  const futureChips = (futureBank?.future?.preferential ?? []).filter((p) => switchMode || !p.defaultChecked)
  return (
    <section className="controls">
      <div className="ctrl-grid">
        {switchMode && (
          <Field label="도약계좌 은행">
            <select value={inputs.leapBankId} onChange={(e) => set({ leapBankId: e.target.value })}>
              {BANKS.filter((b) => b.leap).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
        )}
        <Field label="미래적금 은행">
          <select value={inputs.futureBankId} onChange={(e) => set({ futureBankId: e.target.value })}>
            {BANKS.filter((b) => b.future).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </Field>
        {switchMode && (
          <Field label="도약 소득구간 (기여금)">
            <select value={inputs.leapBracketId} onChange={(e) => set({ leapBracketId: e.target.value })}>
              {LEAP_BRACKETS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
            </select>
          </Field>
        )}
        <Field label="미래 정부기여금">
          <select
            value={inputs.futureContribType}
            onChange={(e) => set({ futureContribType: e.target.value as AppInputs['futureContribType'] })}
          >
            <option value="general">일반형 — 6%</option>
            <option value="preferential">우대형 — 12% (중소기업)</option>
            <option value="none">미지급 (세제혜택만)</option>
          </select>
        </Field>
        {switchMode && (
          <Slider label="도약 (과거) 월 납입액" value={inputs.leapMonthly} max={PRODUCTS.leap.monthlyMax}
            onChange={(leapMonthly) => set({ leapMonthly })} />
        )}
        <Slider label="미래 월 납입액" value={inputs.futureMonthly} max={PRODUCTS.future.monthlyMax}
          onChange={(futureMonthly) => set({ futureMonthly })} />
        {switchMode && (
          <Field label="도약 기납입 입력">
            <div className="seg">
              <button className={inputs.leapPaidMode === 'months' ? 'on' : ''} onClick={() => set({ leapPaidMode: 'months' })}>개월</button>
              <button className={inputs.leapPaidMode === 'amount' ? 'on' : ''} onClick={() => set({ leapPaidMode: 'amount' })}>금액</button>
            </div>
          </Field>
        )}
        {switchMode && (
          <Slider label="도약 기납입 개월" value={inputs.leapMonthsPaid} max={60} step={1} unit="개월"
            onChange={(leapMonthsPaid) => set({ leapMonthsPaid, leapMonthsRemaining: Math.min(inputs.leapMonthsRemaining, Math.max(0, 60 - leapMonthsPaid)) })} />
        )}
        {switchMode && inputs.leapPaidMode === 'amount' && (
          <Slider label="도약 기납입 금액" value={inputs.leapPaidAmount} max={inputs.leapMonthly * 60} step={10_000}
            onChange={(leapPaidAmount) => set({ leapPaidAmount })} />
        )}
        {switchMode && (
          <Slider label="도약 추가 월납입액" value={inputs.leapFutureMonthly} max={PRODUCTS.leap.monthlyMax} step={10_000}
            onChange={(leapFutureMonthly) => set({ leapFutureMonthly })} />
        )}
        {switchMode && (
          <Slider label="도약 남은 납입개월" value={inputs.leapMonthsRemaining} max={Math.max(0, 60 - inputs.leapMonthsPaid)} step={1} unit="개월"
            onChange={(leapMonthsRemaining) => set({ leapMonthsRemaining })} />
        )}
      </div>

      {switchMode && (
        <div className="chips-block">
          <div className="chips-label">도약계좌 우대금리</div>
          <RateChecklist
            items={leapBank?.leap?.preferential ?? []}
            checked={inputs.leapPrefs}
            onToggle={(id) => set({ leapPrefs: toggle(inputs.leapPrefs, id) })}
          />
        </div>
      )}
      <div className="chips-block">
        <div className="chips-label">미래적금 우대금리</div>
        <RateChecklist
          items={futureChips}
          checked={inputs.futurePrefs}
          onToggle={(id) => set({ futurePrefs: toggle(inputs.futurePrefs, id) })}
        />
      </div>
    </section>
  )
}
