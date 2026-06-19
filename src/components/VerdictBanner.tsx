import { manwon } from '../format'

export function VerdictBanner({ profit, horizonMonths, mode }: { profit: number; horizonMonths: number; mode: 'switch' | 'new' }) {
  const gain = profit >= 0
  const years = Math.round(horizonMonths / 12)
  if (mode === 'new') {
    return (
      <section className={`verdict ${gain ? 'gain' : 'loss'}`}>
        <p className="verdict-sub">같은 금액을 {years}년간 저축한다면</p>
        <p className="verdict-num">
          {gain ? '미래적금' : '도약계좌'}이 ＋{manwon(Math.abs(profit))} 유리 {gain ? '▲' : '▼'}
        </p>
        <p className="verdict-sub">미래적금 {years}년 만기 vs 도약계좌 동기간 평가 · 동일 월저축</p>
      </section>
    )
  }
  return (
    <section className={`verdict ${gain ? 'gain' : 'loss'}`}>
      <p className="verdict-sub">도약계좌 해지하고 미래적금으로 갈아타면</p>
      <p className="verdict-num">
        {gain ? '＋' : '－'}{manwon(Math.abs(profit))} {gain ? '이득 ▲' : '손해 ▼'}
      </p>
      <p className="verdict-sub">{years}년 뒤(미래적금 만기) 기준 · 동일 월저축 가정</p>
    </section>
  )
}
