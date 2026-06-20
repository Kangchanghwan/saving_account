import type { ReactNode } from 'react'
import type { AppInputs } from '../state/inputs'
import { BANKS } from '../data/banks'
import { LEAP_BRACKETS } from '../data/leapBrackets'
import { PRODUCTS } from '../data/products'
import { RateChecklist } from './RateChecklist'
import { manwon } from '../format'

const LEAP_TERM = 60

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
  const monthlyRemaining = Math.max(0, LEAP_TERM - inputs.leapMonthsPaid)
  const balRemaining = Math.min(Math.max(0, inputs.leapMonthsRemaining), LEAP_TERM)
  const balElapsed = LEAP_TERM - balRemaining
  const balAvg = balElapsed > 0 ? Math.round(inputs.leapPaidPrincipal / balElapsed) : 0
  return (
    <section className="controls">
      <div className={`ctrl-cols${switchMode ? '' : ' single'}`}>
        {switchMode && (
          <div className="ctrl-col">
            <div className="ctrl-col-head">도약계좌</div>
            <div className="ctrl-grid">
              <Field label="은행">
                <select value={inputs.leapBankId} onChange={(e) => set({ leapBankId: e.target.value })}>
                  {BANKS.filter((b) => b.leap).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </Field>
              <Field label="소득구간 (기여금)">
                <select value={inputs.leapBracketId} onChange={(e) => set({ leapBracketId: e.target.value })}>
                  {LEAP_BRACKETS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
                </select>
              </Field>
              <div className="ctrl">
                <label>입력 방식</label>
                <div className="seg">
                  <button
                    type="button"
                    className={inputs.leapInputMode === 'monthly' ? 'on' : ''}
                    onClick={() => set({ leapInputMode: 'monthly' })}
                  >월납입 기준</button>
                  <button
                    type="button"
                    className={inputs.leapInputMode === 'balance' ? 'on' : ''}
                    onClick={() => set({ leapInputMode: 'balance' })}
                  >잔액 기준</button>
                </div>
              </div>

              {inputs.leapInputMode === 'monthly' ? (
                <>
                  <Slider label="월 납입액" value={inputs.leapMonthly} max={PRODUCTS.leap.monthlyMax}
                    onChange={(leapMonthly) => set({ leapMonthly })} />
                  <div className="ctrl">
                    <Slider label="기납입 개월" value={inputs.leapMonthsPaid} max={LEAP_TERM} step={1} unit="개월"
                      onChange={(leapMonthsPaid) => set({ leapMonthsPaid })} />
                    <span className="ctrl-hint">남은 {monthlyRemaining}개월 · 만기 {LEAP_TERM}개월</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="ctrl">
                    <label>지금까지 입금된 원금</label>
                    <div className="num-row">
                      <input
                        type="number" min={0} step={1}
                        value={Math.round(inputs.leapPaidPrincipal / 10_000)}
                        aria-label="지금까지 입금된 원금(만원)"
                        onChange={(e) =>
                          set({ leapPaidPrincipal: Math.max(0, Math.floor(Number(e.target.value) || 0)) * 10_000 })
                        }
                      />
                      <span className="num-unit">만원</span>
                    </div>
                  </div>
                  <Slider label="남은 개월" value={balRemaining} max={LEAP_TERM} step={1} unit="개월"
                    onChange={(leapMonthsRemaining) => set({ leapMonthsRemaining })} />
                  <div className="ctrl">
                    <Slider label="향후 월 납입액" value={inputs.leapFutureMonthly} max={PRODUCTS.leap.monthlyMax}
                      onChange={(leapFutureMonthly) => set({ leapFutureMonthly })} />
                    <div className="ctrl-hint-row">
                      <span className="ctrl-hint">경과 {balElapsed}개월 · 추정 평균 {manwon(balAvg)}/월</span>
                      <button type="button" className="link-btn" onClick={() => set({ leapFutureMonthly: balAvg })}>
                        평균 적용
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="chips-block">
              <div className="chips-label">도약계좌 우대금리</div>
              <RateChecklist
                items={leapBank?.leap?.preferential ?? []}
                checked={inputs.leapPrefs}
                onToggle={(id) => set({ leapPrefs: toggle(inputs.leapPrefs, id) })}
              />
            </div>
          </div>
        )}

        <div className="ctrl-col">
          <div className="ctrl-col-head">미래적금</div>
          <div className="ctrl-grid">
            <Field label="은행">
              <select value={inputs.futureBankId} onChange={(e) => set({ futureBankId: e.target.value })}>
                {BANKS.filter((b) => b.future).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </Field>
            <Field label="정부기여금">
              <select
                value={inputs.futureContribType}
                onChange={(e) => set({ futureContribType: e.target.value as AppInputs['futureContribType'] })}
              >
                <option value="general">일반형 — 6%</option>
                <option value="preferential">우대형 — 12% (중소기업)</option>
                <option value="none">미지급 (세제혜택만)</option>
              </select>
            </Field>
            <Slider label="월 납입액" value={inputs.futureMonthly} max={PRODUCTS.future.monthlyMax}
              onChange={(futureMonthly) => set({ futureMonthly })} />
          </div>
          <div className="chips-block">
            <div className="chips-label">미래적금 우대금리</div>
            <RateChecklist
              items={futureChips}
              checked={inputs.futurePrefs}
              onToggle={(id) => set({ futurePrefs: toggle(inputs.futurePrefs, id) })}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
