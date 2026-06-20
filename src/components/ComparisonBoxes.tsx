import type { SwitchResult } from '../domain/types'
import { manwon } from '../format'

function Row({ label, value, muted, strong }: {
  label: string; value: string; muted?: boolean; strong?: boolean
}) {
  return (
    <div className={`brow${muted ? ' muted' : ''}${strong ? ' strong' : ''}`}>
      <span>{label}</span><span>{value}</span>
    </div>
  )
}

function yieldPct(total: number, principal: number): string {
  if (principal <= 0) return '—'
  return `수익률 ${(((total - principal) / principal) * 100).toFixed(1)}%`
}

export function ComparisonBoxes({ r, mode }: { r: SwitchResult; mode: 'switch' | 'new' }) {
  const keepTitle = mode === 'new' ? '① 청년도약계좌' : '① 도약계좌 유지'
  const switchTitle = mode === 'new' ? '② 청년미래적금' : '② 미래적금 갈아타기'

  // 갈아타기측 원금합(=내 돈) — 재예치율 0이면 retainedCash는 전액 원금
  const switchPrincipal = r.leapRefund.principal + r.futureMaturity.principal + r.retainedCash
  const showRefund = r.leapRefund.total > 0
  const showRetained = r.retainedCash > 0

  return (
    <div className="boxes">
      <div className="box">
        <div className="box-title">{keepTitle}</div>
        <Row label={`원금 (${r.keepMonths}개월 납입)`} value={manwon(r.keep.principal)} />
        <Row label="이자 (비과세)" value={manwon(r.keep.principalInterest)} muted />
        <Row label="정부기여금" value={manwon(r.keep.contribution)} muted />
        <Row label="기여금 이자" value={manwon(r.keep.contributionInterest)} muted />
        <Row label="최종 수령" value={manwon(r.keep.total)} strong />
        <div className="box-foot">{yieldPct(r.keep.total, r.keep.principal)}</div>
      </div>

      <div className="box">
        <div className="box-title">{switchTitle}</div>
        {showRefund && (
          <>
            <Row label="도약 해지환급금 (페널티 0)" value={manwon(r.leapRefund.total)} />
            <Row label="　원금 / 이자(기본+우대)" value={`${manwon(r.leapRefund.principal)} / ${manwon(r.leapRefund.principalInterest)}`} muted />
            <Row label="　정부기여금 / 기여금이자" value={`${manwon(r.leapRefund.contribution)} / ${manwon(r.leapRefund.contributionInterest)}`} muted />
          </>
        )}
        <Row label="미래적금 만기 (36개월)" value={manwon(r.futureMaturity.total)} />
        <Row label="　원금 / 이자(비과세)" value={`${manwon(r.futureMaturity.principal)} / ${manwon(r.futureMaturity.principalInterest)}`} muted />
        <Row label="　정부기여금 / 기여금이자" value={`${manwon(r.futureMaturity.contribution)} / ${manwon(r.futureMaturity.contributionInterest)}`} muted />
        {showRetained && <Row label="미납입분 보유현금" value={manwon(r.retainedCash)} />}
        <Row label="최종 수령 합계" value={manwon(r.switchTotal)} strong />
        <div className="box-foot">{yieldPct(r.switchTotal, switchPrincipal)}</div>
      </div>
    </div>
  )
}
