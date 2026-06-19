/** 미래적금 정부기여금 유형 */
export type FutureContribType = 'general' | 'preferential' | 'none' // 일반6% / 우대12% / 미지급

/** 도약계좌 소득구간(2단 매칭) */
export interface LeapBracket {
  id: string
  label: string
  matchLimit: number // 한도내 매칭 적용 월납입 상한(원). 예 400000
  rateInLimit: number // 한도내 매칭률. 예 0.06
  extraRate: number // 한도~70만 구간 매칭률. 예 0.03
  monthlyCap: number // 월 최대 기여금(검증용)
}

/** 적립식 만기수령액 계산 입력 */
export interface MaturityInput {
  monthlyDeposit: number // 월 납입 P (원)
  months: number // 납입 개월수 n
  appliedRate: number // 원금 적용금리(기본+우대), 소수. 예 0.08
  baseRate: number // 기본금리(기여금 이자에 적용), 소수. 예 0.05
  monthlyContribution: number // 월 정부기여금(원)
}

/** 만기수령액 분해 (모두 비과세 가정) */
export interface MaturityResult {
  principal: number // 원금 합
  principalInterest: number // 원금 이자
  contribution: number // 정부기여금 합
  contributionInterest: number // 기여금 이자
  total: number // 총 수령액
}
