import { manwon } from '../format'

export function CompareChart({ keep, sw }: { keep: number; sw: number }) {
  const max = Math.max(keep, sw, 1)
  const h = (v: number) => `${(v / max) * 100}%`
  return (
    <div className="chart">
      <div className="chart-col">
        <div className="bar keep" style={{ height: h(keep) }} />
        <span>유지<br />{manwon(keep)}</span>
      </div>
      <div className="chart-col">
        <div className="bar switch" style={{ height: h(sw) }} />
        <span>갈아타기<br />{manwon(sw)}</span>
      </div>
    </div>
  )
}
