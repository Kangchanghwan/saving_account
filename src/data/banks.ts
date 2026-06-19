export interface PreferentialRate {
  id: string
  label: string
  rate: number // %p, 소수. 예 0.005
  defaultChecked?: boolean // 갈아타기 모드에서 기본 체크(예: 연계우대)
}
export interface BankProduct {
  baseRate: number
  maxRate: number // 우대 포함 최고(클램프용)
  preferential: PreferentialRate[]
}
export interface Bank {
  id: string
  name: string
  leap?: BankProduct
  future?: BankProduct
}

export const BANKS: Bank[] = [
  {
    id: 'kb',
    name: 'KB국민은행',
    leap: {
      baseRate: 0.045,
      maxRate: 0.06,
      preferential: [
        { id: 'salary', label: '급여입금 36회', rate: 0.006 },
        { id: 'auto', label: '자동이체 36회', rate: 0.003 },
        { id: 'housing', label: '청약·희망적금만기', rate: 0.001 },
      ],
    },
    future: {
      baseRate: 0.05,
      maxRate: 0.08,
      preferential: [
        { id: 'salary', label: '급여', rate: 0.01 },
        { id: 'withdraw', label: '출금실적', rate: 0.008 },
        { id: 'link', label: '거래감사(도약 가입이력)', rate: 0.005, defaultChecked: true },
        { id: 'income', label: '소득플러스', rate: 0.005 },
        { id: 'consult', label: '재무상담', rate: 0.002 },
      ],
    },
  },
  {
    id: 'shinhan',
    name: '신한은행',
    leap: {
      baseRate: 0.045,
      maxRate: 0.06,
      preferential: [
        { id: 'salary', label: '급여이체 30개월', rate: 0.003 },
        { id: 'card', label: '신한카드 30개월', rate: 0.003 },
        { id: 'noaccnt', label: '직전1년 예적금無', rate: 0.004 },
      ],
    },
    future: {
      baseRate: 0.05,
      maxRate: 0.08,
      preferential: [
        { id: 'income', label: '소득+', rate: 0.005 },
        { id: 'consult', label: '재무상담', rate: 0.002 },
        { id: 'salary', label: '소득이체', rate: 0.003 },
        { id: 'card', label: '신한카드', rate: 0.002 },
        { id: 'stock', label: '증권거래', rate: 0.005 },
        { id: 'first', label: '첫거래·연계', rate: 0.003 },
        { id: 'link', label: '연계가입 특별우대', rate: 0.01, defaultChecked: true },
      ],
    },
  },
  {
    id: 'hana',
    name: '하나은행',
    leap: {
      baseRate: 0.045,
      maxRate: 0.06,
      preferential: [
        { id: 'salary', label: '급여/가맹점 36회', rate: 0.006 },
        { id: 'card', label: '하나카드 36회', rate: 0.002 },
        { id: 'noaccnt', label: '직전1년 예적금無', rate: 0.001 },
        { id: 'mkt', label: '마케팅동의', rate: 0.001 },
      ],
    },
    future: {
      baseRate: 0.05,
      maxRate: 0.08,
      preferential: [
        { id: 'salary', label: '급여/가맹점', rate: 0.012 },
        { id: 'card', label: '카드', rate: 0.006 },
        { id: 'noaccnt', label: '목돈마련(예적금無)', rate: 0.005 },
        { id: 'income', label: '소득플러스', rate: 0.005 },
        { id: 'consult', label: '재무상담', rate: 0.002 },
      ],
    },
  },
  {
    id: 'woori',
    name: '우리은행',
    leap: {
      baseRate: 0.045,
      maxRate: 0.06,
      preferential: [
        { id: 'salary', label: '급여', rate: 0.01 },
        { id: 'card', label: '카드', rate: 0.005 },
        { id: 'noaccnt', label: '직전1년 예적금無', rate: 0.005 },
      ],
    },
    future: {
      baseRate: 0.05,
      maxRate: 0.08,
      preferential: [
        { id: 'salary', label: '소득입금', rate: 0.015 },
        { id: 'link', label: '예적금無·연계', rate: 0.005, defaultChecked: true },
        { id: 'card', label: '카드·공과금', rate: 0.005 },
        { id: 'special', label: '특별', rate: 0.005 },
        { id: 'consult', label: '재무상담', rate: 0.002 },
        { id: 'launch', label: '출시기념', rate: 0.003 },
      ],
    },
  },
  {
    id: 'nh',
    name: 'NH농협은행',
    leap: {
      baseRate: 0.045,
      maxRate: 0.06,
      preferential: [
        { id: 'salary12', label: '급여 12개월', rate: 0.001 },
        { id: 'salary36', label: '급여 36개월', rate: 0.003 },
        { id: 'salary50', label: '급여 50개월', rate: 0.005 },
        { id: 'card', label: 'NH카드', rate: 0.002 },
        { id: 'noaccnt', label: '예적금無·희망적금만기', rate: 0.001 },
        { id: 'mkt', label: '마케팅동의', rate: 0.002 },
      ],
    },
    future: {
      baseRate: 0.05,
      maxRate: 0.08,
      preferential: [
        { id: 'salary', label: '급여/가맹점 18개월', rate: 0.01 },
        { id: 'card', label: 'NH카드', rate: 0.007 },
        { id: 'link', label: '예적금無·연계가입', rate: 0.003, defaultChecked: true },
        { id: 'mydata', label: '마이데이터', rate: 0.003 },
        { id: 'consult', label: '재무상담', rate: 0.002 },
        { id: 'income', label: '소득+', rate: 0.005 },
      ],
    },
  },
  {
    id: 'ibk',
    name: 'IBK기업은행',
    leap: {
      baseRate: 0.045,
      maxRate: 0.06,
      preferential: [
        { id: 'salary', label: '급여 36회', rate: 0.005 },
        { id: 'first', label: '최초신규', rate: 0.003 },
        { id: 'utility', label: '지로공과금', rate: 0.002 },
        { id: 'card', label: '카드', rate: 0.002 },
        { id: 'mkt', label: '마케팅', rate: 0.001 },
      ],
    },
    future: {
      baseRate: 0.05,
      maxRate: 0.08,
      preferential: [
        { id: 'income', label: '소득', rate: 0.005 },
        { id: 'consult', label: '재무상담', rate: 0.002 },
        { id: 'salary', label: '급여', rate: 0.01 },
        { id: 'card', label: '카드', rate: 0.005 },
        { id: 'housing', label: '주택청약', rate: 0.005 },
        { id: 'sme', label: '중소기업재직', rate: 0.003 },
        { id: 'link', label: '도약연계·최초', rate: 0.005, defaultChecked: true },
      ],
    },
  },
  {
    id: 'suhyup',
    name: 'Sh수협은행',
    future: {
      baseRate: 0.05,
      maxRate: 0.07,
      preferential: [
        { id: 'income', label: '소득+', rate: 0.005 },
        { id: 'consult', label: '재무상담', rate: 0.002 },
        { id: 'mkt', label: '마케팅', rate: 0.002 },
        { id: 'salary', label: '급여', rate: 0.005 },
        { id: 'card', label: '카드', rate: 0.006 },
      ],
    },
  },
  {
    id: 'im',
    name: 'iM뱅크',
    future: {
      baseRate: 0.05,
      maxRate: 0.07,
      preferential: [
        { id: 'first', label: '최초거래', rate: 0.003 },
        { id: 'mkt', label: '마케팅', rate: 0.001 },
        { id: 'auto', label: '자동이체', rate: 0.003 },
        { id: 'salary', label: '급여', rate: 0.003 },
        { id: 'card', label: '카드', rate: 0.003 },
        { id: 'income', label: '소득+', rate: 0.005 },
        { id: 'consult', label: '재무상담', rate: 0.002 },
      ],
    },
  },
  {
    id: 'busan',
    name: 'BNK부산은행',
    future: {
      baseRate: 0.05,
      maxRate: 0.07,
      preferential: [
        { id: 'salary', label: '급여', rate: 0.005 },
        { id: 'card', label: '카드', rate: 0.005 },
        { id: 'housing', label: '주택청약', rate: 0.003 },
        { id: 'income', label: '소득', rate: 0.005 },
        { id: 'consult', label: '재무상담', rate: 0.002 },
      ],
    },
  },
  {
    id: 'gwangju',
    name: '광주은행',
    future: {
      baseRate: 0.05,
      maxRate: 0.07,
      preferential: [
        { id: 'income', label: '연소득', rate: 0.005 },
        { id: 'consult', label: '재무상담', rate: 0.002 },
        { id: 'link', label: '첫거래·연계', rate: 0.005, defaultChecked: true },
        { id: 'salary', label: '급여', rate: 0.003 },
        { id: 'auto', label: '자동이체', rate: 0.002 },
        { id: 'deposit', label: '정기예금', rate: 0.003 },
      ],
    },
  },
  {
    id: 'jeonbuk',
    name: '전북은행',
    future: {
      baseRate: 0.05,
      maxRate: 0.07,
      preferential: [
        { id: 'income', label: '소득+', rate: 0.005 },
        { id: 'consult', label: '재무상담', rate: 0.002 },
        { id: 'salary', label: '급여·가맹점', rate: 0.005 },
        { id: 'card', label: 'JB카드', rate: 0.003 },
        { id: 'auto', label: '자동이체', rate: 0.003 },
        { id: 'mkt', label: '마케팅', rate: 0.002 },
      ],
    },
  },
  {
    id: 'gyeongnam',
    name: 'BNK경남은행',
    future: {
      baseRate: 0.05,
      maxRate: 0.07,
      preferential: [
        { id: 'income', label: '소득', rate: 0.005 },
        { id: 'consult', label: '재무상담', rate: 0.002 },
        { id: 'youth', label: '청년미래응원(전고객)', rate: 0.003 },
        { id: 'mkt', label: '마케팅', rate: 0.001 },
        { id: 'salary', label: '급여', rate: 0.007 },
        { id: 'card', label: '카드', rate: 0.002 },
        { id: 'first', label: '신규', rate: 0.002 },
      ],
    },
  },
  {
    id: 'kakao',
    name: '카카오뱅크',
    future: {
      baseRate: 0.05,
      maxRate: 0.07,
      preferential: [
        { id: 'income', label: '소득', rate: 0.005 },
        { id: 'consult', label: '재무상담', rate: 0.002 },
        { id: 'first', label: '최초신규', rate: 0.007 },
        { id: 'card', label: '카드', rate: 0.006 },
      ],
    },
  },
  {
    id: 'post',
    name: '우체국',
    future: {
      baseRate: 0.05,
      maxRate: 0.08,
      preferential: [
        { id: 'event', label: '이벤트(7.27~8.7가입)', rate: 0.01 },
        { id: 'salary', label: '첫거래·급여', rate: 0.005 },
        { id: 'card', label: '체크카드', rate: 0.004 },
        { id: 'auto', label: '자동이체', rate: 0.004 },
        { id: 'income', label: '소득+', rate: 0.005 },
        { id: 'consult', label: '재무상담', rate: 0.002 },
      ],
    },
  },
]
