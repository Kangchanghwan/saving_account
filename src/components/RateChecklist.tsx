import type { PreferentialRate } from '../data/banks'
import { percent } from '../format'

export function RateChecklist({
  items, checked, onToggle,
}: { items: PreferentialRate[]; checked: string[]; onToggle: (id: string) => void }) {
  return (
    <div className="rate-chips">
      {items.map((it) => (
        <button
          key={it.id}
          className={`chip ${checked.includes(it.id) ? 'on' : ''}`}
          onClick={() => onToggle(it.id)}
          type="button"
        >
          {it.label} +{percent(it.rate)}
        </button>
      ))}
    </div>
  )
}
