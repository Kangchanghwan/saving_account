export function AssumptionsFold() {
  return (
    <details className="assumptions">
      <summary>▾ 계산 근거·가정 펼치기</summary>
      <ul>
        <li>적립식 단리: 이자 = 월납입 × (연이율/12) × n(n+1)/2</li>
        <li>원금은 적용금리(기본+우대), 정부기여금은 기본금리로 이자 계산</li>
        <li>갈아타기 = 연계 특별중도해지 → 기여금·우대금리·비과세 전부 유지(페널티 0)</li>
        <li>비교는 동일 월저축 전제: 갈아탈 시 미납입분은 현금 보유(재예치율 기본 0%)</li>
        <li>비교 시점 = 미래적금 만기(지금+36개월). 도약은 그 시점 평가액</li>
      </ul>
    </details>
  )
}
