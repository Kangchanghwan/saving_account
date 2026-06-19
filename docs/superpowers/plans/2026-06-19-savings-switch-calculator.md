# 청년적금 갈아타기 손익계산기 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 청년도약계좌 ↔ 청년미래적금 갈아타기 손익(및 신규 비교)을 한 화면에서 금액으로 보여주는 정적 웹앱을 만든다.

**Architecture:** 계산 로직은 `src/domain/`의 순수 함수로 분리(React 비의존, 공식 워크드 예제로 검증된 골든 테스트 보유). UI는 React 컴포넌트가 도메인 함수를 호출해 실시간 렌더. 입력은 URL 쿼리에 직렬화. 서버 없음.

**Tech Stack:** React 19 + TypeScript + Vite, Vitest(단위 테스트), 정적 배포(Vercel/GitHub Pages).

**근거 문서:** [spec](../specs/2026-06-19-savings-switch-calculator-design.md) · [검증·은행데이터](../research/bank-rate-data.md)

**핵심 검증 규칙(spec §11):**
1. 적립식 단리 이자 = `P × (r/12) × n(n+1)/2`
2. 원금은 적용금리(기본+우대), **정부기여금은 기본금리**로 이자 계산
3. 갈아타기 = 연계 특별중도해지 → 기여금·우대금리·비과세 전부 유지(페널티 0)
4. 비교는 **동일 월저축액 전제**(KEEP 계좌가치 vs SWITCH 계좌가치+남긴현금)

---

## File Structure

```
package.json, tsconfig.json, vite.config.ts, index.html, .gitignore
src/main.tsx                  앱 진입점
src/App.tsx                   모드 분기 + 레이아웃 + 실시간 계산 연결
src/domain/types.ts           공유 타입
src/domain/savings.ts         적립식이자·기여금·만기수령액·특별해지환급금 (순수)
src/domain/compare.ts         KEEP/SWITCH 36개월 비교 (순수)
src/domain/savings.test.ts    골든 테스트
src/domain/compare.test.ts
src/data/leapBrackets.ts      도약 소득구간 매칭표
src/data/banks.ts             은행별 기본/우대금리 (product별)
src/data/products.ts          상품 메타(만기·월한도)
src/state/inputs.ts           입력 상태 타입 + URL 직렬화/역직렬화
src/state/inputs.test.ts
src/components/ModeTabs.tsx
src/components/VerdictBanner.tsx
src/components/CompareTimeline.tsx
src/components/ProductInputCard.tsx
src/components/RateChecklist.tsx
src/components/BreakdownTable.tsx
src/components/CompareChart.tsx
src/components/AssumptionsFold.tsx
src/components/Disclaimer.tsx
src/format.ts                 통화/퍼센트 포맷 유틸
src/App.css
```

---

### Task 0: 프로젝트 스캐폴드

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/App.css`

- [ ] **Step 1: git 저장소 초기화**

Run:
```bash
cd "/Users/kangchanghwan/Documents/personal/savings_account"
git init
git add .gitignore docs
git commit -m "chore: init repo with spec and research docs"
```
Expected: 첫 커밋 생성. (`.gitignore`에 `node_modules/ dist/ .superpowers/` 이미 존재)

- [ ] **Step 2: Vite React-TS 스캐폴드 생성**

Run:
```bash
cd "/Users/kangchanghwan/Documents/personal/savings_account"
npm create vite@latest app-temp -- --template react-ts
```
그런 다음 `app-temp/` 안의 `src/`, `index.html`, `package.json`, `tsconfig*.json`, `vite.config.ts`, `eslint`/`public` 등을 프로젝트 루트로 이동하고 `app-temp/`를 삭제한다:
```bash
cd "/Users/kangchanghwan/Documents/personal/savings_account"
cp -R app-temp/. .
rm -rf app-temp app-temp/.gitignore
```
주의: 위 복사로 덮어써진 루트 `.gitignore`에 `.superpowers/`가 빠졌으면 다시 추가한다.

- [ ] **Step 3: Vitest 설치 및 설정**

Run:
```bash
cd "/Users/kangchanghwan/Documents/personal/savings_account"
npm install -D vitest
```
`package.json`의 `scripts`에 추가:
```json
"test": "vitest run",
"test:watch": "vitest"
```
`vite.config.ts`를 다음으로 교체 (Vitest 4에선 타입 augmentation이 `vitest/config`에 있으므로 그 경로 참조):
```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  test: { environment: 'node' },
})
```

- [ ] **Step 4: 빌드·테스트 동작 확인**

Run:
```bash
npm run build && npm test
```
Expected: 빌드 성공. 테스트는 "no test files found"여도 OK(아직 없음).

- [ ] **Step 5: 커밋**

```bash
git add -A
git commit -m "chore: scaffold vite react-ts + vitest"
```

---

### Task 1: 도메인 타입 + 적립식 단리 이자

**Files:**
- Create: `src/domain/types.ts`, `src/domain/savings.ts`, `src/domain/savings.test.ts`

- [ ] **Step 1: 타입 정의 작성** — `src/domain/types.ts`

```ts
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
```

- [ ] **Step 2: 실패하는 테스트 작성** — `src/domain/savings.test.ts`

```ts
import { describe, it, expect } from 'vitest'
import { installmentInterest } from './savings'

describe('installmentInterest (적립식 단리)', () => {
  it('공식 환산치: 월50만 × 36개월 × 14.4% = 세전이자 3,996,000원', () => {
    expect(installmentInterest(500_000, 0.144, 36)).toBe(3_996_000)
  })
  it('월50만 × 36개월 × 19.4% = 5,383,500원', () => {
    expect(installmentInterest(500_000, 0.194, 36)).toBe(5_383_500)
  })
  it('납입 0개월이면 이자 0', () => {
    expect(installmentInterest(500_000, 0.08, 0)).toBe(0)
  })
})
```

- [ ] **Step 3: 테스트 실패 확인**

Run: `npx vitest run src/domain/savings.test.ts`
Expected: FAIL — `installmentInterest` is not exported / not defined.

- [ ] **Step 4: 최소 구현** — `src/domain/savings.ts`

```ts
import type { MaturityInput, MaturityResult } from './types'

/**
 * 적립식 단리 이자. 1회차는 n개월, n회차는 1개월 예치 → 합계계수 n(n+1)/2.
 * 공식 워크드 예제로 검증됨(spec §11).
 */
export function installmentInterest(monthly: number, annualRate: number, months: number): number {
  return monthly * (annualRate / 12) * (months * (months + 1) / 2)
}
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `npx vitest run src/domain/savings.test.ts`
Expected: PASS (3 passed).

- [ ] **Step 6: 커밋**

```bash
git add src/domain/types.ts src/domain/savings.ts src/domain/savings.test.ts
git commit -m "feat(domain): installment simple interest with golden tests"
```

---

### Task 2: 만기수령액 (maturityValue)

**Files:**
- Modify: `src/domain/savings.ts`, `src/domain/savings.test.ts`

- [ ] **Step 1: 실패 테스트 추가** — `savings.test.ts`에 추가

```ts
import { installmentInterest, maturityValue } from './savings'

describe('maturityValue', () => {
  it('원금은 적용금리, 기여금은 기본금리로 이자 계산', () => {
    const r = maturityValue({
      monthlyDeposit: 500_000, months: 36,
      appliedRate: 0.08, baseRate: 0.05, monthlyContribution: 30_000,
    })
    expect(r.principal).toBe(18_000_000)
    expect(r.principalInterest).toBe(2_220_000) // 50만×(0.08/12)×666
    expect(r.contribution).toBe(1_080_000) // 3만×36
    expect(r.contributionInterest).toBe(83_250) // 3만×(0.05/12)×666
    expect(r.total).toBe(21_383_250)
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/domain/savings.test.ts`
Expected: FAIL — `maturityValue` not defined.

- [ ] **Step 3: 구현 추가** — `savings.ts`에 추가

```ts
export function maturityValue(input: MaturityInput): MaturityResult {
  const principal = input.monthlyDeposit * input.months
  const principalInterest = installmentInterest(input.monthlyDeposit, input.appliedRate, input.months)
  const contribution = input.monthlyContribution * input.months
  const contributionInterest = installmentInterest(input.monthlyContribution, input.baseRate, input.months)
  const total = principal + principalInterest + contribution + contributionInterest
  return { principal, principalInterest, contribution, contributionInterest, total }
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run src/domain/savings.test.ts`
Expected: PASS.

- [ ] **Step 5: 커밋**

```bash
git add src/domain/savings.ts src/domain/savings.test.ts
git commit -m "feat(domain): maturityValue (principal@applied, contribution@base)"
```

---

### Task 3: 미래적금 정부기여금 (futureMonthlyContribution)

**Files:**
- Modify: `src/domain/savings.ts`, `src/domain/savings.test.ts`

- [ ] **Step 1: 실패 테스트 추가**

```ts
import { futureMonthlyContribution } from './savings'

describe('futureMonthlyContribution', () => {
  it('일반형 6%, 월한도 3만', () => {
    expect(futureMonthlyContribution(500_000, 'general')).toBe(30_000) // min(3만,3만)
    expect(futureMonthlyContribution(300_000, 'general')).toBe(18_000) // 30만×6%
  })
  it('우대형 12%, 월한도 6만', () => {
    expect(futureMonthlyContribution(500_000, 'preferential')).toBe(60_000)
  })
  it('미지급형 0', () => {
    expect(futureMonthlyContribution(500_000, 'none')).toBe(0)
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/domain/savings.test.ts`
Expected: FAIL — not defined.

- [ ] **Step 3: 구현 추가**

```ts
import type { FutureContribType } from './types'

const FUTURE_CONTRIB: Record<FutureContribType, { rate: number; cap: number }> = {
  general: { rate: 0.06, cap: 30_000 },
  preferential: { rate: 0.12, cap: 60_000 },
  none: { rate: 0, cap: 0 },
}

export function futureMonthlyContribution(monthlyDeposit: number, type: FutureContribType): number {
  const { rate, cap } = FUTURE_CONTRIB[type]
  return Math.min(monthlyDeposit * rate, cap)
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/domain/savings.test.ts`
Expected: PASS.

- [ ] **Step 5: 커밋**

```bash
git add src/domain/savings.ts src/domain/savings.test.ts
git commit -m "feat(domain): future product monthly government contribution"
```

---

### Task 4: 도약계좌 정부기여금 + 소득구간 데이터

**Files:**
- Create: `src/data/leapBrackets.ts`
- Modify: `src/domain/savings.ts`, `src/domain/savings.test.ts`

- [ ] **Step 1: 소득구간 데이터 작성** — `src/data/leapBrackets.ts`

```ts
import type { LeapBracket } from '../domain/types'

/** 도약계좌 소득구간별 2단 매칭표 (research/bank-rate-data.md 검증값) */
export const LEAP_BRACKETS: LeapBracket[] = [
  { id: 'i2400', label: '총급여 2,400만원 이하', matchLimit: 400_000, rateInLimit: 0.06, extraRate: 0.03, monthlyCap: 33_000 },
  { id: 'i3600', label: '총급여 3,600만원 이하', matchLimit: 500_000, rateInLimit: 0.046, extraRate: 0.03, monthlyCap: 29_000 },
  { id: 'i4800', label: '총급여 4,800만원 이하', matchLimit: 600_000, rateInLimit: 0.037, extraRate: 0.03, monthlyCap: 25_200 },
  { id: 'i6000', label: '총급여 6,000만원 이하', matchLimit: 700_000, rateInLimit: 0.03, extraRate: 0, monthlyCap: 21_000 },
  { id: 'none', label: '총급여 6,000만원 초과(미지급)', matchLimit: 0, rateInLimit: 0, extraRate: 0, monthlyCap: 0 },
]
```

- [ ] **Step 2: 실패 테스트 추가** — `savings.test.ts`

```ts
import { leapMonthlyContribution } from './savings'
import { LEAP_BRACKETS } from '../data/leapBrackets'

describe('leapMonthlyContribution (2단 매칭)', () => {
  const b2400 = LEAP_BRACKETS[0]
  it('공식 예제: 소득2,400만↓ 월70만 → 40만×6% + 30만×3% = 33,000', () => {
    expect(leapMonthlyContribution(700_000, b2400)).toBe(33_000)
  })
  it('각 구간 월70만 납입 시 monthlyCap과 일치', () => {
    for (const b of LEAP_BRACKETS) {
      expect(leapMonthlyContribution(700_000, b)).toBe(b.monthlyCap)
    }
  })
  it('한도 미만 납입은 납입액 기준으로만 매칭', () => {
    expect(leapMonthlyContribution(300_000, b2400)).toBe(18_000) // 30만×6%
  })
})
```

- [ ] **Step 3: 실패 확인**

Run: `npx vitest run src/domain/savings.test.ts`
Expected: FAIL — not defined.

- [ ] **Step 4: 구현 추가** — `savings.ts`

```ts
import type { LeapBracket } from './types'

const LEAP_MONTHLY_MAX = 700_000

export function leapMonthlyContribution(monthlyDeposit: number, bracket: LeapBracket): number {
  const capped = Math.min(monthlyDeposit, LEAP_MONTHLY_MAX)
  const inLimit = Math.min(capped, bracket.matchLimit) * bracket.rateInLimit
  const extra = Math.max(0, capped - bracket.matchLimit) * bracket.extraRate
  return inLimit + extra
}
```

- [ ] **Step 5: 통과 확인**

Run: `npx vitest run src/domain/savings.test.ts`
Expected: PASS.

- [ ] **Step 6: 커밋**

```bash
git add src/data/leapBrackets.ts src/domain/savings.ts src/domain/savings.test.ts
git commit -m "feat(domain): leap account two-tier contribution matching"
```

---

### Task 5: 공식 만기총액 골든 테스트 (통합)

**Files:**
- Modify: `src/domain/savings.test.ts`

- [ ] **Step 1: 골든 통합 테스트 추가**

```ts
describe('공식 만기총액 재현 (정책브리핑 8% 가정)', () => {
  const common = { monthlyDeposit: 500_000, months: 36, appliedRate: 0.08, baseRate: 0.05 }
  it('일반형 → 2,138만원(반올림)', () => {
    const r = maturityValue({ ...common, monthlyContribution: futureMonthlyContribution(500_000, 'general') })
    expect(Math.round(r.total / 10_000)).toBe(2_138)
  })
  it('우대형 → 2,255만원(반올림)', () => {
    const r = maturityValue({ ...common, monthlyContribution: futureMonthlyContribution(500_000, 'preferential') })
    expect(Math.round(r.total / 10_000)).toBe(2_255)
  })
  it('도약 소득2,300만·월70만·60개월 기여금 합 = 198만', () => {
    const monthly = leapMonthlyContribution(700_000, LEAP_BRACKETS[0])
    expect(monthly * 60).toBe(1_980_000)
  })
})
```

- [ ] **Step 2: 통과 확인**

Run: `npx vitest run src/domain/savings.test.ts`
Expected: PASS — 공식 숫자 재현.

- [ ] **Step 3: 커밋**

```bash
git add src/domain/savings.test.ts
git commit -m "test(domain): reproduce official maturity figures (golden)"
```

---

### Task 6: KEEP/SWITCH 비교 (compare.ts)

**Files:**
- Create: `src/domain/compare.ts`, `src/domain/compare.test.ts`
- Modify: `src/domain/types.ts`

- [ ] **Step 1: 비교 입출력 타입 추가** — `src/domain/types.ts`에 추가

```ts
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
  keepTotal: number // 유지 시 36개월 시점 총자산
  switchTotal: number // 갈아탈 시 36개월 시점 총자산
  profit: number // switchTotal - keepTotal (양수=이득)
  leapRefund: MaturityResult // 도약 특별해지 환급금(기납입 m개월 기준)
  futureMaturity: MaturityResult // 미래적금 36개월 만기
  retainedCash: number // 갈아탈 시 미납입분 누적현금(+재예치)
  leapFullMaturity: MaturityResult // 도약 60개월 만기(표기용)
}
```

- [ ] **Step 2: 실패 테스트 작성** — `src/domain/compare.test.ts`

```ts
import { describe, it, expect } from 'vitest'
import { compareSwitch } from './compare'
import { LEAP_BRACKETS } from '../data/leapBrackets'

const base = {
  leapMonthly: 700_000, leapMonthsPaid: 14, leapAppliedRate: 0.05, leapBaseRate: 0.045,
  leapBracket: LEAP_BRACKETS[0],
  futureMonthly: 500_000, futureAppliedRate: 0.08, futureBaseRate: 0.05, futureContribType: 'general' as const,
  reinvestRate: 0,
}

describe('compareSwitch', () => {
  it('horizon은 36개월', () => {
    expect(compareSwitch(base).horizonMonths).toBe(36)
  })
  it('도약 특별해지 환급금은 기납입 14개월 기준(페널티 0, 기여금 포함)', () => {
    const r = compareSwitch(base)
    expect(r.leapRefund.principal).toBe(700_000 * 14)
    expect(r.leapRefund.contribution).toBe(33_000 * 14) // 2,400만 구간 월70만
    expect(r.leapRefund.total).toBeGreaterThan(r.leapRefund.principal)
  })
  it('남긴 현금 = (도약월납입 - 미래월납입) × 36 (재예치 0)', () => {
    expect(compareSwitch(base).retainedCash).toBe(200_000 * 36)
  })
  it('profit = switchTotal - keepTotal', () => {
    const r = compareSwitch(base)
    expect(r.profit).toBeCloseTo(r.switchTotal - r.keepTotal, 5)
  })
  it('미래 월납입을 0으로 줄이면 switchTotal은 회수금+남긴현금만', () => {
    const r = compareSwitch({ ...base, futureMonthly: 0 })
    expect(r.futureMaturity.total).toBe(0)
  })
})
```

- [ ] **Step 3: 실패 확인**

Run: `npx vitest run src/domain/compare.test.ts`
Expected: FAIL — `compareSwitch` not defined.

- [ ] **Step 4: 구현** — `src/domain/compare.ts`

```ts
import type { SwitchInput, SwitchResult } from './types'
import { installmentInterest, leapMonthlyContribution, maturityValue } from './savings'

const HORIZON = 36
const LEAP_TERM = 60

export function compareSwitch(input: SwitchInput): SwitchResult {
  const leapMonthlyContrib = leapMonthlyContribution(input.leapMonthly, input.leapBracket)

  // 도약 특별해지 환급금: 기납입 m개월, 만기해지에 준함(기본+우대, 기여금 포함, 비과세)
  const leapRefund = maturityValue({
    monthlyDeposit: input.leapMonthly, months: input.leapMonthsPaid,
    appliedRate: input.leapAppliedRate, baseRate: input.leapBaseRate,
    monthlyContribution: leapMonthlyContrib,
  })

  // 미래적금 36개월 만기
  const futureMaturity = maturityValue({
    monthlyDeposit: input.futureMonthly, months: HORIZON,
    appliedRate: input.futureAppliedRate, baseRate: input.futureBaseRate,
    monthlyContribution: futureContribFromInput(input),
  })

  // 남긴 현금: 매달 (도약월납입 - 미래월납입) 적립 + 재예치
  const retainedMonthly = Math.max(0, input.leapMonthly - input.futureMonthly)
  const retainedCash = retainedMonthly * HORIZON + installmentInterest(retainedMonthly, input.reinvestRate, HORIZON)

  // 회수금 V0를 36개월 단리 재예치(일시금)
  const v0Reinvested = leapRefund.total * (1 + input.reinvestRate * HORIZON / 12)

  const switchTotal = v0Reinvested + futureMaturity.total + retainedCash

  // KEEP: 36개월 시점 도약 평가액(만기 60개월 초과 안 함)
  const keepMonths = Math.min(input.leapMonthsPaid + HORIZON, LEAP_TERM)
  const keepEval = maturityValue({
    monthlyDeposit: input.leapMonthly, months: keepMonths,
    appliedRate: input.leapAppliedRate, baseRate: input.leapBaseRate,
    monthlyContribution: leapMonthlyContrib,
  })
  const keepTotal = keepEval.total

  // 도약 60개월 만기(표기용)
  const leapFullMaturity = maturityValue({
    monthlyDeposit: input.leapMonthly, months: LEAP_TERM,
    appliedRate: input.leapAppliedRate, baseRate: input.leapBaseRate,
    monthlyContribution: leapMonthlyContrib,
  })

  return {
    horizonMonths: HORIZON, keepTotal, switchTotal, profit: switchTotal - keepTotal,
    leapRefund, futureMaturity, retainedCash, leapFullMaturity,
  }
}

// 순환참조 방지를 위해 별도 헬퍼 (savings의 futureMonthlyContribution 사용)
import { futureMonthlyContribution } from './savings'
function futureContribFromInput(input: SwitchInput): number {
  return futureMonthlyContribution(input.futureMonthly, input.futureContribType)
}
```

- [ ] **Step 5: 통과 확인**

Run: `npx vitest run src/domain/compare.test.ts`
Expected: PASS.

- [ ] **Step 6: 전체 도메인 테스트 확인 + 커밋**

```bash
npx vitest run src/domain
git add src/domain/compare.ts src/domain/compare.test.ts src/domain/types.ts
git commit -m "feat(domain): KEEP/SWITCH comparison with equal-out-of-pocket model"
```

---

### Task 7: 상품 메타 + 은행 데이터

**Files:**
- Create: `src/data/products.ts`, `src/data/banks.ts`

- [ ] **Step 1: 상품 메타 작성** — `src/data/products.ts`

```ts
export interface ProductMeta {
  id: 'leap' | 'future'
  name: string
  termMonths: number
  monthlyMax: number // 월 납입 한도(원)
}

export const PRODUCTS: Record<'leap' | 'future', ProductMeta> = {
  leap: { id: 'leap', name: '청년도약계좌', termMonths: 60, monthlyMax: 700_000 },
  future: { id: 'future', name: '청년미래적금', termMonths: 36, monthlyMax: 500_000 },
}
```

- [ ] **Step 2: 은행 데이터 스키마 + 시드 작성** — `src/data/banks.ts`

각 은행은 product별 `baseRate`, `maxRate`, 우대금리 항목 배열을 가진다. 금리는 소수(0.045)로 저장. 아래는 검증된 [research/bank-rate-data.md](../../research/bank-rate-data.md) 기반 시드다. **신한·국민·농협 3곳을 완전히 채우고**, 나머지(하나·우리·기업·수협·iM·부산·광주·전북·경남·카카오·우체국)는 같은 스키마로 research 표를 옮겨 채운다(데이터 전사 — 로직 아님).

```ts
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
    id: 'shinhan', name: '신한은행',
    leap: {
      baseRate: 0.045, maxRate: 0.06,
      preferential: [
        { id: 'salary', label: '급여이체 30개월↑', rate: 0.003 },
        { id: 'card', label: '신한카드 30개월↑', rate: 0.003 },
        { id: 'firstdeal', label: '직전1년 예적금 미보유', rate: 0.004 },
      ],
    },
    future: {
      baseRate: 0.05, maxRate: 0.08,
      preferential: [
        { id: 'income', label: '소득+우대(총급여 3,600만↓)', rate: 0.005 },
        { id: 'consult', label: '청년재무상담 이수', rate: 0.002 },
        { id: 'salary', label: '소득이체 18개월↑', rate: 0.003 },
        { id: 'card', label: '신한카드 18개월↑', rate: 0.002 },
        { id: 'securities', label: '증권거래 3개월↑', rate: 0.005 },
        { id: 'firstdeal', label: '첫거래·연계가입', rate: 0.003 },
        { id: 'linkbonus', label: '연계가입 특별우대', rate: 0.01, defaultChecked: true },
      ],
    },
  },
  {
    id: 'kb', name: 'KB국민은행',
    leap: {
      baseRate: 0.045, maxRate: 0.06,
      preferential: [
        { id: 'salary', label: '급여입금 36회↑', rate: 0.006 },
        { id: 'auto', label: '자동이체 36회↑', rate: 0.003 },
        { id: 'firstdeal', label: '청약·희망적금 만기', rate: 0.001 },
      ],
    },
    future: {
      baseRate: 0.05, maxRate: 0.08,
      preferential: [
        { id: 'salary', label: '급여이체', rate: 0.01 },
        { id: 'withdraw', label: '출금실적', rate: 0.008 },
        { id: 'thanks', label: '거래감사(도약 가입이력 등)', rate: 0.005, defaultChecked: true },
        { id: 'income', label: '소득플러스(총급여 3,600만↓)', rate: 0.005 },
        { id: 'consult', label: '청년재무상담 이수', rate: 0.002 },
      ],
    },
  },
  {
    id: 'nh', name: 'NH농협은행',
    leap: {
      baseRate: 0.045, maxRate: 0.06,
      preferential: [
        { id: 'salary', label: '급여 36개월', rate: 0.005 },
        { id: 'card', label: 'NH카드', rate: 0.002 },
        { id: 'firstdeal', label: '예적금無·희망적금만기', rate: 0.001 },
        { id: 'mktg', label: '마케팅동의', rate: 0.002 },
      ],
    },
    future: {
      baseRate: 0.05, maxRate: 0.08,
      preferential: [
        { id: 'salary', label: '급여/가맹점 18개월↑', rate: 0.01 },
        { id: 'card', label: 'NH카드 월20만↑', rate: 0.007 },
        { id: 'link', label: '예적금無·연계가입', rate: 0.003, defaultChecked: true },
        { id: 'mydata', label: '마이데이터 18개월↑', rate: 0.003 },
        { id: 'consult', label: '재무상담', rate: 0.002 },
        { id: 'income', label: '소득+우대', rate: 0.005 },
      ],
    },
  },
  // TODO(data): 하나·우리·기업·수협·iM·부산·광주·전북·경남·카카오·우체국을
  //             research/bank-rate-data.md 표에서 같은 스키마로 전사.
]
```

- [ ] **Step 3: 타입체크 통과 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 4: 커밋**

```bash
git add src/data/products.ts src/data/banks.ts
git commit -m "feat(data): product meta + bank rate seed (shinhan/kb/nh)"
```

---

### Task 8: 적용금리 계산 유틸 + 포맷

**Files:**
- Create: `src/format.ts`, `src/domain/rates.ts`, `src/domain/rates.test.ts`

- [ ] **Step 1: 실패 테스트** — `src/domain/rates.test.ts`

```ts
import { describe, it, expect } from 'vitest'
import { appliedRate } from './rates'
import type { BankProduct } from '../data/banks'

const bp: BankProduct = {
  baseRate: 0.05, maxRate: 0.08,
  preferential: [
    { id: 'a', label: 'A', rate: 0.005 },
    { id: 'b', label: 'B', rate: 0.01 },
    { id: 'c', label: 'C', rate: 0.03 },
  ],
}

describe('appliedRate', () => {
  it('기본 + 체크된 우대 합', () => {
    expect(appliedRate(bp, ['a', 'b'])).toBeCloseTo(0.065, 6)
  })
  it('maxRate로 클램프', () => {
    expect(appliedRate(bp, ['a', 'b', 'c'])).toBe(0.08) // 0.05+0.045=0.095 → 0.08
  })
  it('체크 없으면 기본금리', () => {
    expect(appliedRate(bp, [])).toBe(0.05)
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/domain/rates.test.ts`
Expected: FAIL.

- [ ] **Step 3: 구현** — `src/domain/rates.ts`

```ts
import type { BankProduct } from '../data/banks'

export function appliedRate(product: BankProduct, checkedIds: string[]): number {
  const bonus = product.preferential
    .filter((p) => checkedIds.includes(p.id))
    .reduce((sum, p) => sum + p.rate, 0)
  return Math.min(product.baseRate + bonus, product.maxRate)
}
```

- [ ] **Step 4: 포맷 유틸** — `src/format.ts`

```ts
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
```

- [ ] **Step 5: 통과 확인 + 커밋**

```bash
npx vitest run src/domain/rates.test.ts
git add src/format.ts src/domain/rates.ts src/domain/rates.test.ts
git commit -m "feat(domain): appliedRate with clamp + currency/percent formatters"
```

---

### Task 9: 입력 상태 + URL 직렬화

**Files:**
- Create: `src/state/inputs.ts`, `src/state/inputs.test.ts`

- [ ] **Step 1: 실패 테스트** — `src/state/inputs.test.ts`

```ts
import { describe, it, expect } from 'vitest'
import { DEFAULT_INPUTS, encodeInputs, decodeInputs } from './inputs'

describe('inputs URL 직렬화', () => {
  it('encode→decode 라운드트립', () => {
    const s = { ...DEFAULT_INPUTS, leapMonthly: 700_000, leapMonthsPaid: 20 }
    const round = decodeInputs(encodeInputs(s))
    expect(round.leapMonthly).toBe(700_000)
    expect(round.leapMonthsPaid).toBe(20)
  })
  it('빈 쿼리는 기본값', () => {
    expect(decodeInputs('')).toEqual(DEFAULT_INPUTS)
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/state/inputs.test.ts`
Expected: FAIL.

- [ ] **Step 3: 구현** — `src/state/inputs.ts`

```ts
import type { FutureContribType } from '../domain/types'

export type Mode = 'switch' | 'new'

export interface AppInputs {
  mode: Mode
  // 도약
  leapBankId: string
  leapPrefs: string[]
  leapMonthly: number
  leapMonthsPaid: number
  leapBracketId: string
  // 미래
  futureBankId: string
  futurePrefs: string[]
  futureMonthly: number
  futureContribType: FutureContribType
  // 옵션
  reinvestRate: number
}

export const DEFAULT_INPUTS: AppInputs = {
  mode: 'switch',
  leapBankId: 'shinhan', leapPrefs: [], leapMonthly: 700_000, leapMonthsPaid: 14, leapBracketId: 'i2400',
  futureBankId: 'shinhan', futurePrefs: [], futureMonthly: 500_000, futureContribType: 'general',
  reinvestRate: 0,
}

export function encodeInputs(s: AppInputs): string {
  const p = new URLSearchParams()
  p.set('m', s.mode)
  p.set('lb', s.leapBankId)
  p.set('lp', s.leapPrefs.join('.'))
  p.set('lm', String(s.leapMonthly))
  p.set('lmp', String(s.leapMonthsPaid))
  p.set('lbr', s.leapBracketId)
  p.set('fb', s.futureBankId)
  p.set('fp', s.futurePrefs.join('.'))
  p.set('fm', String(s.futureMonthly))
  p.set('fc', s.futureContribType)
  p.set('ri', String(s.reinvestRate))
  return p.toString()
}

export function decodeInputs(query: string): AppInputs {
  if (!query) return DEFAULT_INPUTS
  const p = new URLSearchParams(query)
  const splitPrefs = (v: string | null) => (v ? v.split('.').filter(Boolean) : [])
  return {
    mode: (p.get('m') as Mode) || DEFAULT_INPUTS.mode,
    leapBankId: p.get('lb') || DEFAULT_INPUTS.leapBankId,
    leapPrefs: p.has('lp') ? splitPrefs(p.get('lp')) : DEFAULT_INPUTS.leapPrefs,
    leapMonthly: Number(p.get('lm') ?? DEFAULT_INPUTS.leapMonthly),
    leapMonthsPaid: Number(p.get('lmp') ?? DEFAULT_INPUTS.leapMonthsPaid),
    leapBracketId: p.get('lbr') || DEFAULT_INPUTS.leapBracketId,
    futureBankId: p.get('fb') || DEFAULT_INPUTS.futureBankId,
    futurePrefs: p.has('fp') ? splitPrefs(p.get('fp')) : DEFAULT_INPUTS.futurePrefs,
    futureMonthly: Number(p.get('fm') ?? DEFAULT_INPUTS.futureMonthly),
    futureContribType: (p.get('fc') as FutureContribType) || DEFAULT_INPUTS.futureContribType,
    reinvestRate: Number(p.get('ri') ?? DEFAULT_INPUTS.reinvestRate),
  }
}
```

- [ ] **Step 4: 통과 확인 + 커밋**

```bash
npx vitest run src/state/inputs.test.ts
git add src/state/inputs.ts src/state/inputs.test.ts
git commit -m "feat(state): app inputs + URL serialization"
```

---

### Task 10: 선택 → 비교결과 연결 (selectors)

**Files:**
- Create: `src/state/selectors.ts`, `src/state/selectors.test.ts`

- [ ] **Step 1: 실패 테스트** — `src/state/selectors.test.ts`

```ts
import { describe, it, expect } from 'vitest'
import { buildSwitchInput } from './selectors'
import { DEFAULT_INPUTS } from './inputs'

describe('buildSwitchInput', () => {
  it('기본 입력으로 SwitchInput을 구성한다', () => {
    const si = buildSwitchInput(DEFAULT_INPUTS)
    expect(si.leapMonthly).toBe(700_000)
    expect(si.futureMonthly).toBe(500_000)
    expect(si.leapBracket.id).toBe('i2400')
    expect(si.leapAppliedRate).toBeGreaterThanOrEqual(0.045)
    expect(si.futureAppliedRate).toBeGreaterThanOrEqual(0.05)
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/state/selectors.test.ts`
Expected: FAIL.

- [ ] **Step 3: 구현** — `src/state/selectors.ts`

```ts
import type { AppInputs } from './inputs'
import type { SwitchInput } from '../domain/types'
import { BANKS } from '../data/banks'
import { LEAP_BRACKETS } from '../data/leapBrackets'
import { appliedRate } from '../domain/rates'

function bank(id: string) {
  return BANKS.find((b) => b.id === id) ?? BANKS[0]
}

export function buildSwitchInput(s: AppInputs): SwitchInput {
  const leapBank = bank(s.leapBankId)
  const futureBank = bank(s.futureBankId)
  const leapProduct = leapBank.leap ?? { baseRate: 0.045, maxRate: 0.06, preferential: [] }
  const futureProduct = futureBank.future ?? { baseRate: 0.05, maxRate: 0.08, preferential: [] }
  const bracket = LEAP_BRACKETS.find((b) => b.id === s.leapBracketId) ?? LEAP_BRACKETS[0]

  return {
    leapMonthly: s.leapMonthly,
    leapMonthsPaid: s.leapMonthsPaid,
    leapAppliedRate: appliedRate(leapProduct, s.leapPrefs),
    leapBaseRate: leapProduct.baseRate,
    leapBracket: bracket,
    futureMonthly: s.futureMonthly,
    futureAppliedRate: appliedRate(futureProduct, s.futurePrefs),
    futureBaseRate: futureProduct.baseRate,
    futureContribType: s.futureContribType,
    reinvestRate: s.reinvestRate,
  }
}
```

- [ ] **Step 4: 통과 확인 + 커밋**

```bash
npx vitest run src/state/selectors.test.ts
git add src/state/selectors.ts src/state/selectors.test.ts
git commit -m "feat(state): build SwitchInput from app inputs + banks"
```

---

### Task 11: 앱 셸 + 모드 탭 + URL 동기화

**Files:**
- Modify: `src/App.tsx`, `src/main.tsx`, `src/App.css`
- Create: `src/components/ModeTabs.tsx`

- [ ] **Step 1: ModeTabs 컴포넌트** — `src/components/ModeTabs.tsx`

```tsx
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
```

- [ ] **Step 2: App 상태 + URL 동기화** — `src/App.tsx` 전체 교체

```tsx
import { useEffect, useState } from 'react'
import { DEFAULT_INPUTS, decodeInputs, encodeInputs, type AppInputs } from './state/inputs'
import { buildSwitchInput } from './state/selectors'
import { compareSwitch } from './domain/compare'
import { ModeTabs } from './components/ModeTabs'
import { VerdictBanner } from './components/VerdictBanner'
import { CompareTimeline } from './components/CompareTimeline'
import { BreakdownTable } from './components/BreakdownTable'
import { Disclaimer } from './components/Disclaimer'
import './App.css'

export default function App() {
  const [inputs, setInputs] = useState<AppInputs>(() =>
    decodeInputs(window.location.search.replace(/^\?/, '')) || DEFAULT_INPUTS,
  )

  useEffect(() => {
    const qs = encodeInputs(inputs)
    window.history.replaceState(null, '', `?${qs}`)
  }, [inputs])

  const result = compareSwitch(buildSwitchInput(inputs))
  const set = (patch: Partial<AppInputs>) => setInputs((s) => ({ ...s, ...patch }))

  return (
    <main className="app">
      <h1>청년적금 갈아타기 손익계산기</h1>
      <ModeTabs mode={inputs.mode} onChange={(mode) => set({ mode })} />
      <VerdictBanner profit={result.profit} horizonMonths={result.horizonMonths} />
      <CompareTimeline leapMonthsPaid={inputs.leapMonthsPaid} />
      {/* 입력 카드/결과는 후속 Task에서 연결 */}
      <BreakdownTable result={result} />
      <Disclaimer />
    </main>
  )
}
```

- [ ] **Step 3: 임시 스텁으로 빌드 통과**

`VerdictBanner`, `CompareTimeline`, `BreakdownTable`, `Disclaimer`는 다음 Task에서 만든다. 빌드를 위해 각 파일에 최소 스텁을 먼저 생성:
```tsx
// src/components/VerdictBanner.tsx
export function VerdictBanner(_: { profit: number; horizonMonths: number }) { return null }
// src/components/CompareTimeline.tsx
export function CompareTimeline(_: { leapMonthsPaid: number }) { return null }
// src/components/BreakdownTable.tsx
import type { SwitchResult } from '../domain/types'
export function BreakdownTable(_: { result: SwitchResult }) { return null }
// src/components/Disclaimer.tsx
export function Disclaimer() { return null }
```

- [ ] **Step 4: 빌드 확인**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 5: 커밋**

```bash
git add src/App.tsx src/components/ModeTabs.tsx src/components/VerdictBanner.tsx src/components/CompareTimeline.tsx src/components/BreakdownTable.tsx src/components/Disclaimer.tsx
git commit -m "feat(ui): app shell, mode tabs, URL sync, component stubs"
```

---

### Task 12: 결론 배너 (VerdictBanner)

**Files:**
- Modify: `src/components/VerdictBanner.tsx`, `src/App.css`

- [ ] **Step 1: 구현** — `src/components/VerdictBanner.tsx`

```tsx
import { manwon } from '../format'

export function VerdictBanner({ profit, horizonMonths }: { profit: number; horizonMonths: number }) {
  const gain = profit >= 0
  const years = Math.round(horizonMonths / 12)
  return (
    <section className={`verdict ${gain ? 'gain' : 'loss'}`}>
      <p className="verdict-sub">도약계좌 해지하고 미래적금으로 갈아타면</p>
      <p className="verdict-num">
        {gain ? '＋' : '－'}{manwon(Math.abs(profit))} {gain ? '이득 ▲' : '손해 ▼'}
      </p>
      <p className="verdict-sub">{years}년 뒤(미래적금 만기) 기준 · 동일 월저축 가정</p>
    </section>
  )
}
```

- [ ] **Step 2: 스타일 추가** — `src/App.css`에 추가

```css
.verdict { border-radius: 14px; padding: 20px; text-align: center; margin: 16px 0; }
.verdict.gain { background: #e8f5ee; border: 1px solid #2e8b57; }
.verdict.loss { background: #fdecec; border: 1px solid #c0392b; }
.verdict-num { font-size: 28px; font-weight: 800; margin: 6px 0; }
.verdict.gain .verdict-num { color: #2e8b57; }
.verdict.loss .verdict-num { color: #c0392b; }
.verdict-sub { color: #555; font-size: 13px; margin: 0; }
```

- [ ] **Step 3: 빌드 확인 + 커밋**

```bash
npm run build
git add src/components/VerdictBanner.tsx src/App.css
git commit -m "feat(ui): verdict banner"
```

---

### Task 13: 비교 타임라인 (두 줄 비교)

**Files:**
- Modify: `src/components/CompareTimeline.tsx`, `src/App.css`

- [ ] **Step 1: 구현** — 확정된 ②안(두 줄 비교: 유지 5년 / 갈아타기 3년 + 비교점)

```tsx
export function CompareTimeline({ leapMonthsPaid }: { leapMonthsPaid: number }) {
  const leapTotal = 60
  const futureFromNow = 36
  const leapRemain = leapTotal - leapMonthsPaid // 유지 시 남은 개월
  const maxSpan = Math.max(leapRemain, futureFromNow)
  const pct = (m: number) => `${(m / maxSpan) * 100}%`
  return (
    <section className="timeline" aria-label="비교 타임라인">
      <div className="tl-row">
        <span className="tl-tag">유지하면</span>
        <div className="tl-bar keep" style={{ width: pct(leapRemain) }}>도약 → {leapTotal}개월 만기</div>
      </div>
      <div className="tl-row">
        <span className="tl-tag">갈아타면</span>
        <div className="tl-bar switch" style={{ width: pct(futureFromNow) }}>미래적금 → {futureFromNow}개월 만기</div>
      </div>
      <div className="tl-cmp" style={{ left: `calc(74px + ${pct(futureFromNow)})` }}>↑ 3년 뒤 비교</div>
    </section>
  )
}
```

- [ ] **Step 2: 스타일 추가** — `src/App.css`

```css
.timeline { position: relative; margin: 8px 0 28px; }
.tl-row { display: flex; align-items: center; gap: 10px; margin: 8px 0; }
.tl-tag { width: 64px; text-align: right; font-size: 12px; font-weight: 700; color: #444; }
.tl-bar { height: 26px; border-radius: 6px; color: #fff; font-size: 12px; display: flex; align-items: center; padding: 0 10px; white-space: nowrap; min-width: 90px; }
.tl-bar.keep { background: #8a98b8; }
.tl-bar.switch { background: #2e8b57; }
.tl-cmp { position: absolute; bottom: -18px; transform: translateX(-50%); font-size: 11px; font-weight: 700; color: #2e8b57; }
```

- [ ] **Step 3: 빌드 확인 + 커밋**

```bash
npm run build
git add src/components/CompareTimeline.tsx src/App.css
git commit -m "feat(ui): two-row compare timeline"
```

---

### Task 14: 입력 카드 + 우대금리 체크리스트

**Files:**
- Create: `src/components/ProductInputCard.tsx`, `src/components/RateChecklist.tsx`
- Modify: `src/App.tsx`, `src/App.css`

- [ ] **Step 1: 우대금리 체크리스트** — `src/components/RateChecklist.tsx`

```tsx
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
```

- [ ] **Step 2: 입력 카드 (월 납입액은 슬라이더, 실시간 값 표시)** — `src/components/ProductInputCard.tsx`

월 납입액은 `type="range"` 슬라이더로 받고, 옆 `<output>`에 현재 금액을 실시간 표시한다. 슬라이더를 움직이면 App 상태가 갱신되어 결론 배너·차트·분해표가 즉시 재계산된다(별도 처리 불필요 — React 반응형).

```tsx
import type { Bank } from '../data/banks'
import type { ReactNode } from 'react'
import { manwon } from '../format'

export function ProductInputCard({
  title, banks, bankId, onBankChange, monthly, monthlyMax, onMonthlyChange, children,
}: {
  title: string
  banks: Bank[]
  bankId: string
  onBankChange: (id: string) => void
  monthly: number
  monthlyMax: number
  onMonthlyChange: (won: number) => void
  children?: ReactNode
}) {
  return (
    <div className="input-card">
      <h3>{title}</h3>
      <label className="fld">
        <span>가입 은행</span>
        <select value={bankId} onChange={(e) => onBankChange(e.target.value)}>
          {banks.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </label>
      <div className="fld fld-slider">
        <div className="slider-head">
          <span>월 납입액</span>
          <output className="slider-val">{manwon(monthly)}</output>
        </div>
        <input
          type="range" min={0} max={monthlyMax} step={10_000}
          value={monthly}
          aria-label="월 납입액"
          onChange={(e) => onMonthlyChange(Number(e.target.value))}
        />
        <div className="slider-scale"><span>0</span><span>{manwon(monthlyMax)}</span></div>
      </div>
      {children}
    </div>
  )
}
```

- [ ] **Step 3: App에 입력 카드 연결** — `src/App.tsx`의 `{/* 입력 카드... */}` 자리에 삽입

```tsx
import { ProductInputCard } from './components/ProductInputCard'
import { RateChecklist } from './components/RateChecklist'
import { BANKS } from './data/banks'
import { LEAP_BRACKETS } from './data/leapBrackets'
import { PRODUCTS } from './data/products'
```
그리고 JSX(타임라인 아래)에 추가:
```tsx
<div className="input-grid">
  <ProductInputCard
    title="① 현재 보유: 청년도약계좌"
    banks={BANKS}
    bankId={inputs.leapBankId}
    onBankChange={(leapBankId) => set({ leapBankId })}
    monthly={inputs.leapMonthly}
    monthlyMax={PRODUCTS.leap.monthlyMax}
    onMonthlyChange={(leapMonthly) => set({ leapMonthly })}
  >
    <label className="fld"><span>기납입 개월</span>
      <input type="number" min={0} max={60} value={inputs.leapMonthsPaid}
        onChange={(e) => set({ leapMonthsPaid: Number(e.target.value) })} />
    </label>
    <label className="fld"><span>소득구간(기여금)</span>
      <select value={inputs.leapBracketId} onChange={(e) => set({ leapBracketId: e.target.value })}>
        {LEAP_BRACKETS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
      </select>
    </label>
    <RateChecklist
      items={BANKS.find((b) => b.id === inputs.leapBankId)?.leap?.preferential ?? []}
      checked={inputs.leapPrefs}
      onToggle={(id) => set({ leapPrefs: toggle(inputs.leapPrefs, id) })}
    />
  </ProductInputCard>

  <ProductInputCard
    title="② 갈아탈: 청년미래적금"
    banks={BANKS}
    bankId={inputs.futureBankId}
    onBankChange={(futureBankId) => set({ futureBankId })}
    monthly={inputs.futureMonthly}
    monthlyMax={PRODUCTS.future.monthlyMax}
    onMonthlyChange={(futureMonthly) => set({ futureMonthly })}
  >
    <label className="fld"><span>기여금 유형</span>
      <select value={inputs.futureContribType} onChange={(e) => set({ futureContribType: e.target.value as AppInputs['futureContribType'] })}>
        <option value="general">일반형(6%)</option>
        <option value="preferential">우대형(12%)</option>
        <option value="none">미지급(세제혜택만)</option>
      </select>
    </label>
    <RateChecklist
      items={BANKS.find((b) => b.id === inputs.futureBankId)?.future?.preferential ?? []}
      checked={inputs.futurePrefs}
      onToggle={(id) => set({ futurePrefs: toggle(inputs.futurePrefs, id) })}
    />
  </ProductInputCard>
</div>
```
그리고 App 파일 상단(컴포넌트 밖)에 헬퍼 추가:
```tsx
function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
}
```

- [ ] **Step 4: 미래 우대금리 기본체크 초기화** — `src/state/inputs.ts`의 `DEFAULT_INPUTS` 위에 헬퍼를 만들고, App 최초 로드시 빈 prefs면 `defaultChecked` 항목을 채운다. App `useState` 초기화 직후 `useEffect`로:

```tsx
// App.tsx, 첫 useEffect 위에 추가
useEffect(() => {
  // 갈아타기 모드 진입 시 연계우대 등 defaultChecked 자동 체크(최초 1회, 비어있을 때만)
  if (inputs.futurePrefs.length === 0) {
    const def = BANKS.find((b) => b.id === inputs.futureBankId)?.future?.preferential.filter((p) => p.defaultChecked).map((p) => p.id) ?? []
    if (def.length) set({ futurePrefs: def })
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])
```

- [ ] **Step 5: 스타일 추가** — `src/App.css`

```css
.input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 16px 0; }
.input-card { border: 1px solid #e2e2e2; border-radius: 10px; padding: 14px; }
.input-card h3 { font-size: 14px; margin: 0 0 10px; }
.fld { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin: 8px 0; font-size: 13px; }
.fld input, .fld select { padding: 5px 8px; border: 1px solid #ccc; border-radius: 6px; }
.fld-slider { display: block; }
.slider-head { display: flex; justify-content: space-between; align-items: baseline; }
.slider-val { font-size: 16px; font-weight: 800; color: #2e8b57; font-variant-numeric: tabular-nums; }
.fld-slider input[type="range"] { width: 100%; margin: 6px 0 2px; accent-color: #2e8b57; padding: 0; border: none; }
.slider-scale { display: flex; justify-content: space-between; font-size: 10px; color: #999; }
.rate-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.chip { font-size: 11px; padding: 3px 9px; border-radius: 999px; border: 1px solid #ccc; background: #fff; cursor: pointer; }
.chip.on { background: #dbe7fb; border-color: #5a8cdc; }
@media (max-width: 640px) { .input-grid { grid-template-columns: 1fr; } }
```

- [ ] **Step 6: 빌드 확인 + 커밋**

```bash
npm run build
git add src/components/ProductInputCard.tsx src/components/RateChecklist.tsx src/App.tsx src/App.css src/state/inputs.ts
git commit -m "feat(ui): product input cards + preferential rate chips"
```

---

### Task 15: 손익 분해표 + 막대 차트

**Files:**
- Modify: `src/components/BreakdownTable.tsx`
- Create: `src/components/CompareChart.tsx`
- Modify: `src/App.tsx`, `src/App.css`

- [ ] **Step 1: 분해표 구현** — `src/components/BreakdownTable.tsx`

```tsx
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
```

- [ ] **Step 2: 막대 차트** — `src/components/CompareChart.tsx`

```tsx
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
```

- [ ] **Step 3: App에 결과 영역 연결** — `<BreakdownTable result={result} />`를 다음으로 교체

```tsx
import { CompareChart } from './components/CompareChart'
// ...
<section className="results">
  <CompareChart keep={result.keepTotal} sw={result.switchTotal} />
  <BreakdownTable result={result} />
</section>
```

- [ ] **Step 4: 스타일 추가** — `src/App.css`

```css
.results { margin: 16px 0; }
.chart { display: flex; gap: 24px; align-items: flex-end; height: 140px; padding: 0 20px; }
.chart-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; }
.chart .bar { width: 70%; border-radius: 6px 6px 0 0; }
.chart .bar.keep { background: #8a98b8; }
.chart .bar.switch { background: #2e8b57; }
.chart-col span { font-size: 11px; text-align: center; margin-top: 6px; }
.breakdown { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
.breakdown td { padding: 6px 0; border-bottom: 1px solid #eee; }
.breakdown td:last-child { text-align: right; font-variant-numeric: tabular-nums; }
.breakdown .sub td { color: #777; font-size: 12px; }
.breakdown .total td { border-top: 2px solid #333; font-size: 15px; }
.breakdown .muted td { color: #999; font-size: 12px; }
```

- [ ] **Step 5: 빌드 확인 + 커밋**

```bash
npm run build
git add src/components/BreakdownTable.tsx src/components/CompareChart.tsx src/App.tsx src/App.css
git commit -m "feat(ui): breakdown table + compare bar chart"
```

---

### Task 16: 가정 펼치기 + 면책 + 입력 검증

**Files:**
- Create: `src/components/AssumptionsFold.tsx`
- Modify: `src/components/Disclaimer.tsx`, `src/App.tsx`

- [ ] **Step 1: 가정 펼치기** — `src/components/AssumptionsFold.tsx`

```tsx
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
```

- [ ] **Step 2: 면책 문구** — `src/components/Disclaimer.tsx`

```tsx
export function Disclaimer() {
  return (
    <footer className="disclaimer">
      <p>※ 기본금리·정부기여금은 2026.6 공시 기준 내장값입니다. 실제 적용금리·우대조건은 가입 은행에서 확인하세요.</p>
      <p>※ 갈아타기(청년도약계좌 특별중도해지)는 최초 가입기간에 한해 허용됩니다. 반드시 청년미래적금 신청·대상통보 후 도약계좌를 해지하세요(먼저 해지 시 갈아타기 불가).</p>
      <p>※ 본 계산은 참고용 추정치이며 실제 수령액과 다를 수 있습니다.</p>
    </footer>
  )
}
```

- [ ] **Step 3: 입력 검증 경고** — `src/App.tsx`에 추가 (결과 영역 위)

```tsx
const warnings: string[] = []
if (inputs.leapMonthly > PRODUCTS.leap.monthlyMax) warnings.push('도약계좌 월 납입 한도(70만원)를 초과했습니다.')
if (inputs.futureMonthly > PRODUCTS.future.monthlyMax) warnings.push('미래적금 월 납입 한도(50만원)를 초과했습니다.')
if (inputs.leapMonthsPaid < 0 || inputs.leapMonthsPaid > 60) warnings.push('기납입 개월은 0~60 사이여야 합니다.')
```
그리고 JSX(결과 위):
```tsx
{warnings.length > 0 && (
  <ul className="warnings">{warnings.map((w) => <li key={w}>{w}</li>)}</ul>
)}
```
그리고 JSX 하단에 `<AssumptionsFold />`를 결과와 면책 사이에 추가하고 import.

- [ ] **Step 4: 스타일 추가** — `src/App.css`

```css
.warnings { background: #fff6e5; border: 1px solid #e0a93b; border-radius: 8px; padding: 8px 14px; font-size: 12px; color: #8a5a00; }
.assumptions { margin: 14px 0; font-size: 12px; color: #555; }
.assumptions summary { cursor: pointer; }
.disclaimer { margin-top: 20px; font-size: 11px; color: #888; line-height: 1.5; }
.app { max-width: 860px; margin: 0 auto; padding: 24px 16px; }
.app h1 { font-size: 20px; }
.mode-tabs { display: flex; gap: 8px; margin: 12px 0; }
.mode-tabs button { flex: 1; padding: 8px; border-radius: 8px; border: 1px solid #ddd; background: #f4f4f4; cursor: pointer; }
.mode-tabs button.on { background: #dbe7fb; border-color: #5a8cdc; font-weight: 700; }
```

- [ ] **Step 5: 빌드 확인 + 커밋**

```bash
npm run build
git add src/components/AssumptionsFold.tsx src/components/Disclaimer.tsx src/App.tsx src/App.css
git commit -m "feat(ui): assumptions fold, disclaimer, input validation"
```

---

### Task 17: 신규 비교 모드 + 스모크 테스트

**Files:**
- Modify: `src/App.tsx`
- Create: `src/App.test.tsx`

- [ ] **Step 1: 신규 모드 분기** — `src/App.tsx`

`mode === 'new'`이면 ① 카드 제목을 "청년도약계좌", ② 카드를 "청년미래적금"으로 쓰고, 결론 배너 문구를 "신규 가입 시 3년(미래)·5년(도약) 만기수령 비교"로 바꾼다. VerdictBanner에 `mode` prop을 추가해 문구 분기:
```tsx
// VerdictBanner.tsx 시그니처 확장
export function VerdictBanner({ profit, horizonMonths, mode }:
  { profit: number; horizonMonths: number; mode: 'switch' | 'new' }) { /* mode로 sub 문구 분기 */ }
```
App에서 `<VerdictBanner ... mode={inputs.mode} />`로 전달. 신규 모드에서는 기납입 개월 입력을 숨긴다(`{inputs.mode === 'switch' && <기납입 필드>}`).

- [ ] **Step 2: 컴포넌트 테스트 환경 추가**

Run:
```bash
npm install -D @testing-library/react @testing-library/dom jsdom
```
`vite.config.ts`의 `test`를 수정:
```ts
test: { environment: 'jsdom', globals: true },
```

- [ ] **Step 3: 스모크 테스트** — `src/App.test.tsx`

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

describe('App 스모크', () => {
  it('제목과 결론 배너가 보인다', () => {
    render(<App />)
    expect(screen.getByText('청년적금 갈아타기 손익계산기')).toBeTruthy()
    expect(screen.getByText(/이득|손해/)).toBeTruthy()
  })
  it('모드 탭 전환이 동작한다', () => {
    render(<App />)
    fireEvent.click(screen.getByText('🆕 신규 가입 비교'))
    expect(screen.getByRole('tab', { selected: true }).textContent).toContain('신규')
  })
})
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm test`
Expected: 모든 테스트 PASS(도메인 + 상태 + 스모크).

- [ ] **Step 5: 커밋**

```bash
git add -A
git commit -m "feat(ui): new-product compare mode + smoke tests"
```

---

### Task 18: 배포 설정

**Files:**
- Create: `vercel.json` 또는 `.github/workflows/deploy.yml`

- [ ] **Step 1: 정적 빌드 확인**

Run: `npm run build && npm run preview`
Expected: `dist/` 생성, 로컬 프리뷰에서 계산기 정상 동작.

- [ ] **Step 2: 배포 설정 (택1)**

**Vercel:** 루트에 `vercel.json`
```json
{ "buildCommand": "npm run build", "outputDirectory": "dist" }
```
**GitHub Pages:** `.github/workflows/deploy.yml`
```yaml
name: deploy
on: { push: { branches: [main] } }
permissions: { contents: read, pages: write, id-token: write }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci && npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages }
    steps:
      - uses: actions/deploy-pages@v4
```
(GitHub Pages 사용 시 `vite.config.ts`의 `base`를 `'/<repo-name>/'`로 변경.)

- [ ] **Step 3: 커밋**

```bash
git add -A
git commit -m "chore: deploy config"
```

---

## Self-Review (작성자 점검 결과)

**Spec 커버리지:** §2 도메인규칙 → Task 1~6 / §2.4 은행·우대 → Task 7,8 / §2.3 소득구간·유형 직접선택 → Task 14 / §3 비교모델(동일 월저축) → Task 6 / §4 UX(모드탭·배너·타임라인·입력·결과·면책) → Task 11~16 / §5 아키텍처 분리 → 전체 / §6 URL 직렬화 → Task 9 / §7 검증·엣지 → Task 16 / §8 테스트·골든 → Task 1~6,17 / §10 배포 → Task 18. **§11 골든 케이스는 Task 1·2·5에 회귀 테스트로 고정.** 누락 없음.

**범위 밖(spec §9)** 항목(부분충족 우대, 일시납입/부분인출, 단순해지, 변동금리 정밀)은 의도적으로 미포함.

**타입 일관성:** `MaturityInput/MaturityResult/SwitchInput/SwitchResult`(types.ts), `installmentInterest/maturityValue/futureMonthlyContribution/leapMonthlyContribution`(savings.ts), `compareSwitch`(compare.ts), `appliedRate`(rates.ts), `AppInputs/encodeInputs/decodeInputs`(inputs.ts), `buildSwitchInput`(selectors.ts) — Task 간 시그니처 일치 확인.

**미해결(의도적):** 출처 간 날짜 불일치 → 코드에 날짜 하드코딩 없이 면책 문구로 처리(Task 16).
