import { useEffect, useState } from 'react'
import { DEFAULT_INPUTS, decodeInputs, encodeInputs, type AppInputs } from './state/inputs'
import { buildSwitchInput } from './state/selectors'
import { compareSwitch } from './domain/compare'
import { ModeTabs } from './components/ModeTabs'
import { VerdictBanner } from './components/VerdictBanner'
import { CompareTimeline } from './components/CompareTimeline'
import { BreakdownTable } from './components/BreakdownTable'
import { CompareChart } from './components/CompareChart'
import { Disclaimer } from './components/Disclaimer'
import { AssumptionsFold } from './components/AssumptionsFold'
import { ProductInputCard } from './components/ProductInputCard'
import { RateChecklist } from './components/RateChecklist'
import { BANKS } from './data/banks'
import { LEAP_BRACKETS } from './data/leapBrackets'
import { PRODUCTS } from './data/products'
import './App.css'

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
}

export default function App() {
  const [inputs, setInputs] = useState<AppInputs>(() =>
    decodeInputs(window.location.search.replace(/^\?/, '')) || DEFAULT_INPUTS,
  )

  useEffect(() => {
    if (inputs.futurePrefs.length === 0) {
      const def = BANKS.find((b) => b.id === inputs.futureBankId)?.future?.preferential.filter((p) => p.defaultChecked).map((p) => p.id) ?? []
      if (def.length) set({ futurePrefs: def })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const qs = encodeInputs(inputs)
    window.history.replaceState(null, '', `?${qs}`)
  }, [inputs])

  const calcInputs = inputs.mode === 'new' ? { ...inputs, leapMonthsPaid: 0 } : inputs
  const result = compareSwitch(buildSwitchInput(calcInputs))
  const set = (patch: Partial<AppInputs>) => setInputs((s) => ({ ...s, ...patch }))

  const warnings: string[] = []
  if (inputs.leapMonthly > PRODUCTS.leap.monthlyMax) warnings.push('도약계좌 월 납입 한도(70만원)를 초과했습니다.')
  if (inputs.futureMonthly > PRODUCTS.future.monthlyMax) warnings.push('미래적금 월 납입 한도(50만원)를 초과했습니다.')
  if (inputs.leapMonthsPaid < 0 || inputs.leapMonthsPaid > 60) warnings.push('기납입 개월은 0~60 사이여야 합니다.')

  return (
    <main className="app">
      <h1>청년적금 갈아타기 손익계산기</h1>
      <ModeTabs mode={inputs.mode} onChange={(mode) => set({ mode })} />
      <VerdictBanner profit={result.profit} horizonMonths={result.horizonMonths} mode={inputs.mode} />
      <CompareTimeline leapMonthsPaid={inputs.leapMonthsPaid} />
      <div className="input-grid">
        <ProductInputCard
          title={inputs.mode === 'switch' ? '① 현재 보유: 청년도약계좌' : '① 청년도약계좌'}
          banks={BANKS}
          bankId={inputs.leapBankId}
          onBankChange={(leapBankId) => set({ leapBankId })}
          monthly={inputs.leapMonthly}
          monthlyMax={PRODUCTS.leap.monthlyMax}
          onMonthlyChange={(leapMonthly) => set({ leapMonthly })}
        >
          {inputs.mode === 'switch' && (
            <label className="fld"><span>기납입 개월</span>
              <input type="number" min={0} max={60} value={inputs.leapMonthsPaid}
                onChange={(e) => set({ leapMonthsPaid: Number(e.target.value) })} />
            </label>
          )}
          <label className="fld"><span>소득구간(기여금)</span>
            <select value={inputs.leapBracketId} onChange={(e) => set({ leapBracketId: e.target.value })}>
              {LEAP_BRACKETS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
            </select>
          </label>
          <RateChecklist
            items={BANKS.find((b) => b.id === inputs.leapBankId)?.leap?.preferential ?? []}
            checked={inputs.leapPrefs}
            onToggle={(id) => set({ leapPrefs: toggle(inputs.leapPrefs, id) })}
          />
        </ProductInputCard>

        <ProductInputCard
          title={inputs.mode === 'switch' ? '② 갈아탈: 청년미래적금' : '② 청년미래적금'}
          banks={BANKS}
          bankId={inputs.futureBankId}
          onBankChange={(futureBankId) => set({ futureBankId })}
          monthly={inputs.futureMonthly}
          monthlyMax={PRODUCTS.future.monthlyMax}
          onMonthlyChange={(futureMonthly) => set({ futureMonthly })}
        >
          <label className="fld"><span>기여금 유형</span>
            <select value={inputs.futureContribType} onChange={(e) => set({ futureContribType: e.target.value as AppInputs['futureContribType'] })}>
              <option value="general">일반형(6%)</option>
              <option value="preferential">우대형(12%)</option>
              <option value="none">미지급(세제혜택만)</option>
            </select>
          </label>
          <RateChecklist
            items={BANKS.find((b) => b.id === inputs.futureBankId)?.future?.preferential ?? []}
            checked={inputs.futurePrefs}
            onToggle={(id) => set({ futurePrefs: toggle(inputs.futurePrefs, id) })}
          />
        </ProductInputCard>
      </div>
      {warnings.length > 0 && (
        <ul className="warnings">{warnings.map((w) => <li key={w}>{w}</li>)}</ul>
      )}
      <section className="results">
        <CompareChart keep={result.keepTotal} sw={result.switchTotal} />
        <BreakdownTable result={result} />
      </section>
      <AssumptionsFold />
      <Disclaimer />
    </main>
  )
}
