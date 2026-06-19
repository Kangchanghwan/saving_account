/** 원 단위 → "1,234만원" / "1,234,567원" */
export function won(n: number): string {
  return `${Math.round(n).toLocaleString('ko-KR')}원`
}
export function manwon(n: number): string {
  return `${Math.round(n / 10_000).toLocaleString('ko-KR')}만원`
}
/** 0.065 → "6.5%" */
export function percent(r: number): string {
  return `${(r * 100).toFixed(1)}%`
}
