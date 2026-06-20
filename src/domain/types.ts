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

/** 갈아타기 비교 입력 */
export interface SwitchInput {
  // 현재 도약계좌
  leapMonthly: number // 월 납입(원). 기준 월저축액으로도 사용
  leapMonthsPaid: number // 기납입 개월수 m
  leapAppliedRate: number // 기본+우대(소수)
  leapBaseRate: number // 기본금리(소수)
  leapBracket: LeapBracket
  // 갈아탈 미래적금
  futureMonthly: number // 월 납입(원, ≤50만)
  futureAppliedRate: number // 기본+우대(소수)
  futureBaseRate: number // 기본금리(소수)
  futureContribType: FutureContribType
  // 옵션
  reinvestRate: number // 회수금·남긴현금 재예치율(소수). 기본 0
}

/** 갈아타기 비교 결과 */
export interface SwitchResult {
  horizonMonths: number // 36
  keepMonths: number // 유지 시 36개월 시점의 도약 누적 개월 = min(m+36, 60)
  keepTotal: number // 유지 시 36개월 시점 총자산
  switchTotal: number // 갈아탈 시 36개월 시점 총자산
  profit: number // switchTotal - keepTotal (양수=이득)
  keep: MaturityResult // 유지측 36개월 시점 평가(분해)
  leapRefund: MaturityResult // 도약 특별해지 환급금(기납입 m개월 기준)
  futureMaturity: MaturityResult // 미래적금 36개월 만기
  retainedCash: number // 갈아탈 시 미납입분 누적현금(+재예치)
  leapFullMaturity: MaturityResult // 도약 60개월 만기(표기용)
}
