import { useEffect, useState } from 'react'
import { DEFAULT_INPUTS, decodeInputs, encodeInputs, type AppInputs } from './state/inputs'
import { buildSwitchInput } from './state/selectors'
import { compareSwitch } from './domain/compare'
import { ModeTabs } from './components/ModeTabs'
import { VerdictBanner } from './components/VerdictBanner'
import { CompareTimeline } from './components/CompareTimeline'
import { BreakdownTable } from './components/BreakdownTable'
import { Disclaimer } from './components/Disclaimer'
import './App.css'

export default function App() {
  const [inputs, setInputs] = useState<AppInputs>(() =>
    decodeInputs(window.location.search.replace(/^\?/, '')) || DEFAULT_INPUTS,
  )

  useEffect(() => {
    const qs = encodeInputs(inputs)
    window.history.replaceState(null, '', `?${qs}`)
  }, [inputs])

  const result = compareSwitch(buildSwitchInput(inputs))
  const set = (patch: Partial<AppInputs>) => setInputs((s) => ({ ...s, ...patch }))

  return (
    <main className="app">
      <h1>청년적금 갈아타기 손익계산기</h1>
      <ModeTabs mode={inputs.mode} onChange={(mode) => set({ mode })} />
      <VerdictBanner profit={result.profit} horizonMonths={result.horizonMonths} />
      <CompareTimeline leapMonthsPaid={inputs.leapMonthsPaid} />
      {/* 입력 카드/결과는 후속 Task에서 연결 */}
      <BreakdownTable result={result} />
      <Disclaimer />
    </main>
  )
}
