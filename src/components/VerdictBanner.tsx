import { manwon } from '../format'

export function VerdictBanner({ profit, horizonMonths }: { profit: number; horizonMonths: number }) {
  const gain = profit >= 0
  const years = Math.round(horizonMonths / 12)
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
