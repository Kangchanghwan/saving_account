import type { Mode } from '../state/inputs'

export function ModeTabs({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="mode-tabs" role="tablist">
      <button role="tab" aria-selected={mode === 'switch'} className={mode === 'switch' ? 'on' : ''} onClick={() => onChange('switch')}>
        🔄 갈아타기 손익
      </button>
      <button role="tab" aria-selected={mode === 'new'} className={mode === 'new' ? 'on' : ''} onClick={() => onChange('new')}>
        🆕 신규 가입 비교
      </button>
    </div>
  )
}
