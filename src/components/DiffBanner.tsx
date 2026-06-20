import { manwon } from '../format'

export function DiffBanner({
  profit, switchTotal, keepTotal, mode,
}: { profit: number; switchTotal: number; keepTotal: number; mode: 'switch' | 'new' }) {
  const gain = profit >= 0
  const label =
    mode === 'new'
      ? gain ? '미래적금이 더 유리합니다' : '도약계좌가 더 유리합니다'
      : gain ? '갈아타기가 더 유리합니다' : '도약계좌 유지가 더 유리합니다'
  const sub =
    mode === 'new'
      ? `미래적금 ${manwon(switchTotal)} vs 도약계좌 ${manwon(keepTotal)} · 3년 뒤 총자산`
      : `갈아탈 시 ${manwon(switchTotal)} vs 유지 ${manwon(keepTotal)} · 3년 뒤 총자산`
  return (
    <div className={`diff ${gain ? 'gain' : 'loss'}`}>
      <div className="diff-label">{label}</div>
      <div className="diff-num">{gain ? '+' : '−'}{manwon(Math.abs(profit))}</div>
      <div className="diff-sub">{sub}</div>
    </div>
  )
}
