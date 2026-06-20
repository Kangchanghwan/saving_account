import { manwon } from '../format'

export function DiffBanner({
  profit, switchTotal, keepTotal,
}: { profit: number; switchTotal: number; keepTotal: number }) {
  const gain = profit >= 0
  const label = gain ? '갈아타기가 더 유리합니다' : '도약계좌 유지가 더 유리합니다'
  return (
    <div className={`diff ${gain ? 'gain' : 'loss'}`}>
      <div className="diff-label">{label}</div>
      <div className="diff-num">{gain ? '+' : '−'}{manwon(Math.abs(profit))}</div>
      <div className="diff-sub">갈아탈 시 {manwon(switchTotal)} vs 유지 {manwon(keepTotal)} · 3년 뒤 총자산</div>
    </div>
  )
}
