import { useEffect, useState } from 'react'
import { decodeInputs, encodeInputs, type AppInputs } from './state/inputs'
import { buildSwitchInput } from './state/selectors'
import { compareSwitch } from './domain/compare'
import { BANKS } from './data/banks'
import { PRODUCTS } from './data/products'
import { ModeTabs } from './components/ModeTabs'
import { DiffBanner } from './components/DiffBanner'
import { ScenarioControls } from './components/ScenarioControls'
import { ComparisonBoxes } from './components/ComparisonBoxes'
import { Disclaimer } from './components/Disclaimer'
import './App.css'

export default function App() {
  const [inputs, setInputs] = useState<AppInputs>(() =>
    decodeInputs(window.location.search.replace(/^\?/, '')),
  )
  const set = (patch: Partial<AppInputs>) => setInputs((s) => ({ ...s, ...patch }))

  // 갈아타기 진입 시 연계우대 등 defaultChecked 자동 체크(최초 1회, 비어있을 때만)
  useEffect(() => {
    if (inputs.futurePrefs.length === 0) {
      const def = BANKS.find((b) => b.id === inputs.futureBankId)?.future?.preferential
        .filter((p) => p.defaultChecked).map((p) => p.id) ?? []
      if (def.length) set({ futurePrefs: def })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    window.history.replaceState(null, '', `?${encodeInputs(inputs)}`)
  }, [inputs])

  const calcInputs = inputs.mode === 'new' ? { ...inputs, leapMonthsPaid: 0 } : inputs
  const result = compareSwitch(buildSwitchInput(calcInputs))

  const warnings: string[] = []
  if (inputs.leapMonthly > PRODUCTS.leap.monthlyMax) warnings.push('도약계좌 월 납입 한도(70만원)를 초과했습니다.')
  if (inputs.futureMonthly > PRODUCTS.future.monthlyMax) warnings.push('미래적금 월 납입 한도(50만원)를 초과했습니다.')

  return (
    <main className="app">
      <h1>청년적금 갈아타기 손익계산기</h1>
      <ModeTabs mode={inputs.mode} onChange={(mode) => set({ mode })} />
      <DiffBanner profit={result.profit} switchTotal={result.switchTotal} keepTotal={result.keepTotal} mode={inputs.mode} />
      <ScenarioControls inputs={inputs} set={set} />
      {warnings.length > 0 && <ul className="warnings">{warnings.map((w) => <li key={w}>{w}</li>)}</ul>}
      <ComparisonBoxes r={result} mode={inputs.mode} />
      <Disclaimer />
    </main>
  )
}
