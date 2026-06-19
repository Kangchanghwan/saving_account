import type { SwitchResult } from '../domain/types'
import { manwon } from '../format'

export function BreakdownTable({ result }: { result: SwitchResult }) {
  const r = result
  return (
    <table className="breakdown">
      <tbody>
        <tr><td>유지 시 총자산(3년 뒤)</td><td>{manwon(r.keepTotal)}</td></tr>
        <tr><td>갈아탈 시 총자산(3년 뒤)</td><td>{manwon(r.switchTotal)}</td></tr>
        <tr className="sub"><td>　└ 도약 해지환급금(페널티 0)</td><td>{manwon(r.leapRefund.total)}</td></tr>
        <tr className="sub"><td>　└ 미래적금 만기수령</td><td>{manwon(r.futureMaturity.total)}</td></tr>
        <tr className="sub"><td>　└ 미납입분 보유현금</td><td>{manwon(r.retainedCash)}</td></tr>
        <tr className="total"><td><b>갈아타기 손익</b></td><td><b>{r.profit >= 0 ? '＋' : '－'}{manwon(Math.abs(r.profit))}</b></td></tr>
        <tr className="muted"><td>참고: 도약 5년 만기수령</td><td>{manwon(r.leapFullMaturity.total)}</td></tr>
      </tbody>
    </table>
  )
}
