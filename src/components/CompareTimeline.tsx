export function CompareTimeline({ leapMonthsPaid }: { leapMonthsPaid: number }) {
  const leapTotal = 60
  const futureFromNow = 36
  const leapRemain = leapTotal - leapMonthsPaid // 유지 시 남은 개월
  const maxSpan = Math.max(Math.max(1, leapRemain), futureFromNow)
  const pct = (m: number) => `${(m / maxSpan) * 100}%`
  return (
    <section className="timeline" aria-label="비교 타임라인">
      <div className="tl-row">
        <span className="tl-tag">유지하면</span>
        <div className="tl-bar keep" style={{ width: pct(Math.max(1, leapRemain)) }}>도약 → {leapTotal}개월 만기</div>
      </div>
      <div className="tl-row">
        <span className="tl-tag">갈아타면</span>
        <div className="tl-bar switch" style={{ width: pct(futureFromNow) }}>미래적금 → {futureFromNow}개월 만기</div>
      </div>
      <div className="tl-cmp" style={{ left: `calc(74px + ${pct(futureFromNow)})` }}>↑ 3년 뒤 비교</div>
    </section>
  )
}
