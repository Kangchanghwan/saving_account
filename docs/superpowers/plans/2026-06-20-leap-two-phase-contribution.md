# 도약 2단계 납입 (기납입 금액/개월 + 추가월납입 + 남은개월) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 청년도약 계좌를 "과거 납입분 + 미래 추가납입분" 2단계로 모델링하여, 기납입을 개월/금액으로 입력(중간 출금 반영)하고 추가 월납입액·남은 납입개월을 직접 조정할 수 있게 한다.

**Architecture:** 적립식 단리 이자를 구간 단위로 계산하는 `phaseInterest` 헬퍼와 도약 2단계 만기 `leapTwoPhaseMaturity`를 도메인에 추가한다. `SwitchInput`을 과거 평균월납입(`leapAvgMonthly`)·추가월납입(`leapFutureMonthly`)·남은개월(`leapMonthsRemaining`)로 확장하고, `compareSwitch`의 도약 계산(환급금/유지/만기)을 2단계화한다. UI는 기납입 개월/금액 세그먼트 토글 + 추가월납입·남은개월 슬라이더를 추가한다. 비교 시점(36개월 호라이즌)은 유지한다.

**Tech Stack:** React + TypeScript + Vite, Vitest + @testing-library/react.

**Spec:** `docs/superpowers/specs/2026-06-20-leap-paid-amount-and-remaining-months-design.md`

---

## File Structure

- `src/domain/savings.ts` — `phaseInterest`(신규), `installmentInterest`(phaseInterest로 위임), `leapTwoPhaseMaturity`(신규).
- `src/domain/types.ts` — `SwitchInput` 필드 변경(`leapMonthly`→`leapAvgMonthly`, `leapFutureMonthly`·`leapMonthsRemaining` 추가).
- `src/domain/compare.ts` — 도약 계산 2단계화.
- `src/state/inputs.ts` — `AppInputs` 4필드 추가 + URL encode/decode.
- `src/state/selectors.ts` — avgMonthly 환산 + 남은개월 클램프 + 신규 SwitchInput 매핑.
- `src/components/ScenarioControls.tsx` — 세그먼트 토글 + 추가월납입·남은개월 슬라이더.
- `src/App.css` — `.seg` 토글 스타일.
- 테스트: `savings.test.ts`, `compare.test.ts`, `inputs.test.ts`, `selectors.test.ts`, `App.test.tsx`.

**실행 순서 주의:** Task 3(inputs)은 Task 5(selectors)보다 먼저 와야 한다(selectors가 새 AppInputs 필드를 읽음). Task 4(types+compare)와 Task 5(selectors)는 `SwitchInput` 타입을 공유하므로 둘 사이에는 컴파일이 깨질 수 있다 — Task 5 종료 시 전체 그린이 된다.

---

## Task 1: `phaseInterest` 구간 단리 이자 헬퍼

**Files:**
- Modify: `src/domain/savings.ts:7-11`
- Test: `src/domain/savings.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`src/domain/savings.test.ts` 상단 import에 `phaseInterest`를 추가하고(`import { installmentInterest, maturityValue, futureMonthlyContribution, leapMonthlyContribution, phaseInterest } from './savings'`), 파일 끝에 다음 describe를 추가한다:

```ts
describe('phaseInterest (구간 단리 이자)', () => {
  it('tail=0이면 installmentInterest와 동일', () => {
    expect(phaseInterest(500_000, 0.144, 36, 0)).toBe(installmentInterest(500_000, 0.144, 36))
    expect(phaseInterest(700_000, 0.05, 14, 0)).toBe(installmentInterest(700_000, 0.05, 14))
  })
  it('명시 예제: 월10만 × 0.12 × (S(5)-S(3)=9) = 9,000', () => {
    expect(phaseInterest(100_000, 0.12, 2, 3)).toBe(9_000)
  })
  it('구간 분해 합 = 단일구간 (과거 14 + 미래 36 = 50개월)', () => {
    const split = phaseInterest(700_000, 0.05, 14, 36) + phaseInterest(700_000, 0.05, 36, 0)
    expect(split).toBe(installmentInterest(700_000, 0.05, 50))
    expect(split).toBe(3_718_750)
  })
  it('음수 입력은 0', () => {
    expect(phaseInterest(-100, 0.05, 5, 3)).toBe(0)
    expect(phaseInterest(100_000, 0.05, -5, 3)).toBe(0)
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/domain/savings.test.ts`
Expected: FAIL — `phaseInterest is not a function` / import 에러.

- [ ] **Step 3: 최소 구현**

`src/domain/savings.ts`에서 기존 `installmentInterest`(7-11행)를 다음으로 교체한다:

```ts
/**
 * 적립식 단리 이자 구간 계산.
 * count개월 연속 납입분의 이자. 각 납입분이 자기 구간 종료 후 tail개월을 더 적립.
 * 합계계수 = S(tail+count) − S(tail), S(x)=x(x+1)/2.
 */
export function phaseInterest(monthly: number, annualRate: number, count: number, tail: number): number {
  const c = Math.max(0, count)
  const t = Math.max(0, tail)
  const p = Math.max(0, monthly)
  const S = (x: number) => (x * (x + 1)) / 2
  return Math.round(p * (annualRate / 12) * (S(t + c) - S(t)))
}

/** 적립식 단리 이자. 1회차는 n개월…n회차는 1개월 → 합계계수 n(n+1)/2. (phaseInterest tail=0) */
export function installmentInterest(monthly: number, annualRate: number, months: number): number {
  return phaseInterest(monthly, annualRate, months, 0)
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run src/domain/savings.test.ts`
Expected: PASS (기존 installmentInterest 테스트 포함 전부).

- [ ] **Step 5: 커밋**

```bash
git add src/domain/savings.ts src/domain/savings.test.ts
git commit -m "feat(domain): phaseInterest 구간 단리 이자 헬퍼 (installmentInterest 위임)"
```

---

## Task 2: `leapTwoPhaseMaturity` 도약 2단계 만기

**Files:**
- Modify: `src/domain/savings.ts` (파일 끝에 함수 추가)
- Test: `src/domain/savings.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

import에 `leapTwoPhaseMaturity` 추가. `savings.test.ts` 끝에 추가:

```ts
describe('leapTwoPhaseMaturity (도약 2단계 만기)', () => {
  const b2400 = LEAP_BRACKETS[0]
  it('미래분 0이면 단일구간 환급금과 동일 (월70만·14개월)', () => {
    const r = leapTwoPhaseMaturity({
      avgMonthly: 700_000, pastMonths: 14, futureMonthly: 0, futureMonths: 0,
      appliedRate: 0.05, baseRate: 0.045, bracket: b2400,
    })
    expect(r.principal).toBe(9_800_000) // 70만×14
    expect(r.principalInterest).toBe(306_250) // installmentInterest(70만,0.05,14)
    expect(r.contribution).toBe(462_000) // 33,000×14
    expect(r.contributionInterest).toBe(12_994) // 33,000×(0.045/12)×105
    expect(r.total).toBe(10_581_244)
  })
  it('2단계: 과거 월60만 28개월 + 미래 월30만 32개월', () => {
    const r = leapTwoPhaseMaturity({
      avgMonthly: 600_000, pastMonths: 28, futureMonthly: 300_000, futureMonths: 32,
      appliedRate: 0.05, baseRate: 0.045, bracket: b2400,
    })
    expect(r.principal).toBe(26_400_000) // 60만×28 + 30만×32
    // 기여금: leapContrib(60만)=30,000 ×28 + leapContrib(30만)=18,000 ×32
    expect(r.contribution).toBe(1_416_000)
    expect(r.total).toBeGreaterThan(r.principal)
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/domain/savings.test.ts`
Expected: FAIL — `leapTwoPhaseMaturity is not a function`.

- [ ] **Step 3: 최소 구현**

`src/domain/savings.ts` 끝에 추가(타입 import에 `MaturityResult`, `LeapBracket`는 이미 존재):

```ts
/** 도약 2단계 적립 만기수령액: 과거분(avgMonthly·pastMonths) + 미래분(futureMonthly·futureMonths). */
export function leapTwoPhaseMaturity(p: {
  avgMonthly: number; pastMonths: number;
  futureMonthly: number; futureMonths: number;
  appliedRate: number; baseRate: number; bracket: LeapBracket;
}): MaturityResult {
  const principal = Math.round(p.avgMonthly * p.pastMonths + p.futureMonthly * p.futureMonths)
  const principalInterest =
    phaseInterest(p.avgMonthly, p.appliedRate, p.pastMonths, p.futureMonths) +
    phaseInterest(p.futureMonthly, p.appliedRate, p.futureMonths, 0)
  const pastContribM = leapMonthlyContribution(p.avgMonthly, p.bracket)
  const futureContribM = leapMonthlyContribution(p.futureMonthly, p.bracket)
  const contribution = Math.round(pastContribM * p.pastMonths + futureContribM * p.futureMonths)
  const contributionInterest =
    phaseInterest(pastContribM, p.baseRate, p.pastMonths, p.futureMonths) +
    phaseInterest(futureContribM, p.baseRate, p.futureMonths, 0)
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
git commit -m "feat(domain): leapTwoPhaseMaturity 도약 2단계(과거+미래) 만기 계산"
```

---

## Task 3: `AppInputs` 신규 4필드 + URL 직렬화

**Files:**
- Modify: `src/state/inputs.ts`
- Test: `src/state/inputs.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`src/state/inputs.test.ts`의 라운드트립 테스트를 확장하고 신규 케이스를 추가한다. 기존 `describe` 안에 다음 it을 추가:

```ts
  it('신규 도약 필드 encode→decode 라운드트립', () => {
    const s = { ...DEFAULT_INPUTS, leapPaidMode: 'amount' as const, leapPaidAmount: 15_000_000, leapFutureMonthly: 300_000, leapMonthsRemaining: 20 }
    const round = decodeInputs(encodeInputs(s))
    expect(round.leapPaidMode).toBe('amount')
    expect(round.leapPaidAmount).toBe(15_000_000)
    expect(round.leapFutureMonthly).toBe(300_000)
    expect(round.leapMonthsRemaining).toBe(20)
  })
  it('잘못된 신규 숫자 파라미터는 기본값 폴백', () => {
    const r = decodeInputs('lpa=abc&lfm=&lmr=xyz')
    expect(r.leapPaidAmount).toBe(DEFAULT_INPUTS.leapPaidAmount)
    expect(r.leapFutureMonthly).toBe(DEFAULT_INPUTS.leapFutureMonthly)
    expect(r.leapMonthsRemaining).toBe(DEFAULT_INPUTS.leapMonthsRemaining)
  })
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/state/inputs.test.ts`
Expected: FAIL — `leapPaidMode` 등 타입/값 없음.

- [ ] **Step 3: 구현 — 인터페이스/기본값**

`src/state/inputs.ts`의 `AppInputs` 인터페이스 `// 도약` 블록(8-12행)에 필드를 추가한다:

```ts
  // 도약
  leapBankId: string
  leapPrefs: string[]
  leapMonthly: number
  leapMonthsPaid: number
  leapBracketId: string
  leapPaidMode: 'months' | 'amount'
  leapPaidAmount: number
  leapFutureMonthly: number
  leapMonthsRemaining: number
```

`DEFAULT_INPUTS`의 도약 라인을 다음으로 교체한다:

```ts
  leapBankId: 'shinhan', leapPrefs: [], leapMonthly: 700_000, leapMonthsPaid: 14, leapBracketId: 'i2400',
  leapPaidMode: 'months', leapPaidAmount: 9_800_000, leapFutureMonthly: 700_000, leapMonthsRemaining: 46,
```

- [ ] **Step 4: 구현 — encode/decode**

`encodeInputs`의 `p.set('lbr', s.leapBracketId)` 다음 줄에 추가:

```ts
  p.set('lpm', s.leapPaidMode)
  p.set('lpa', String(s.leapPaidAmount))
  p.set('lfm', String(s.leapFutureMonthly))
  p.set('lmr', String(s.leapMonthsRemaining))
```

`decodeInputs`의 return 객체에서 `leapBracketId` 다음에 추가:

```ts
    leapBracketId: p.get('lbr') || DEFAULT_INPUTS.leapBracketId,
    leapPaidMode: (p.get('lpm') as AppInputs['leapPaidMode']) || DEFAULT_INPUTS.leapPaidMode,
    leapPaidAmount: num(p.get('lpa'), DEFAULT_INPUTS.leapPaidAmount),
    leapFutureMonthly: num(p.get('lfm'), DEFAULT_INPUTS.leapFutureMonthly),
    leapMonthsRemaining: num(p.get('lmr'), DEFAULT_INPUTS.leapMonthsRemaining),
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `npx vitest run src/state/inputs.test.ts`
Expected: PASS (기존 `빈 쿼리는 기본값` 포함 — `decodeInputs('')`가 신규 기본값까지 동일하므로 통과).

- [ ] **Step 6: 커밋**

```bash
git add src/state/inputs.ts src/state/inputs.test.ts
git commit -m "feat(state): AppInputs에 도약 기납입모드/금액/추가월납입/남은개월 + URL 직렬화"
```

---

## Task 4: `SwitchInput` 타입 확장 + `compareSwitch` 2단계화

**Files:**
- Modify: `src/domain/types.ts:33-47` (SwitchInput), `:50-61`(SwitchResult 주석)
- Modify: `src/domain/compare.ts` (전체 재작성)
- Test: `src/domain/compare.test.ts`

> 이 Task 종료 시점에는 `selectors.ts`가 아직 구 형태를 만들어 컴파일이 깨진 상태일 수 있다. Task 5에서 그린이 된다. 단위 테스트(`compare.test.ts`)는 SwitchInput 리터럴을 직접 만들므로 이 Task 안에서 통과시킨다.

- [ ] **Step 1: 테스트 base 갱신 + 신규 케이스 작성**

`src/domain/compare.test.ts`의 `base` 객체(5-10행)를 다음으로 교체한다:

```ts
const base = {
  leapAvgMonthly: 700_000, leapMonthsPaid: 14, leapFutureMonthly: 700_000, leapMonthsRemaining: 46,
  leapAppliedRate: 0.05, leapBaseRate: 0.045, leapBracket: LEAP_BRACKETS[0],
  futureMonthly: 500_000, futureAppliedRate: 0.08, futureBaseRate: 0.05, futureContribType: 'general' as const,
  reinvestRate: 0,
}
```

`미래월납입 > 도약월납입이면 남긴현금은 0` 테스트(45-48행)에서 override를 `leapMonthly` → `leapFutureMonthly`로 바꾼다:

```ts
  it('미래월납입 > 도약 추가월납입이면 남긴현금은 0(음수 아님)', () => {
    const r = compareSwitch({ ...base, leapFutureMonthly: 400_000, futureMonthly: 500_000 })
    expect(r.retainedCash).toBe(0)
  })
```

`describe('compareSwitch', …)` 끝에 신규 케이스를 추가한다:

```ts
  it('남은개월을 줄이면 유지측 만기 평가가 작아진다', () => {
    const full = compareSwitch(base) // 남은 46 → keep 호라이즌 36개월
    const short = compareSwitch({ ...base, leapMonthsRemaining: 6 }) // 미래 6개월만
    expect(short.keepMonths).toBe(20) // 14 + min(6,36)
    expect(short.keepTotal).toBeLessThan(full.keepTotal)
  })
  it('추가월납입을 과거보다 낮추면 유지측 원금이 줄어든다', () => {
    const same = compareSwitch(base) // 추가 70만
    const lower = compareSwitch({ ...base, leapFutureMonthly: 300_000 })
    expect(lower.keep.principal).toBeLessThan(same.keep.principal)
  })
  it('기납입+남은개월 합이 60을 넘으면 만기는 60개월에서 멈춘다', () => {
    const a = compareSwitch({ ...base, leapMonthsPaid: 40, leapMonthsRemaining: 30 }) // 70 → 60
    const b = compareSwitch({ ...base, leapMonthsPaid: 40, leapMonthsRemaining: 20 }) // 60
    expect(a.leapFullMaturity.total).toBe(b.leapFullMaturity.total)
  })
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/domain/compare.test.ts`
Expected: FAIL — `leapAvgMonthly` 등 타입 불일치 / 구 compare가 신규 필드 무시.

- [ ] **Step 3: `SwitchInput` 타입 변경**

`src/domain/types.ts`의 `SwitchInput`에서 도약 블록(34-39행)을 다음으로 교체한다:

```ts
  // 현재 도약계좌
  leapAvgMonthly: number // 과거 평균 월납입(원). 기납입 원금 = avg × 기납입개월
  leapMonthsPaid: number // 기납입 개월수 m
  leapFutureMonthly: number // 남은 기간 추가 월납입(원)
  leapMonthsRemaining: number // 만기까지 남은 납입개월 R (총 m+R ≤ 60)
  leapAppliedRate: number // 기본+우대(소수)
  leapBaseRate: number // 기본금리(소수)
  leapBracket: LeapBracket
```

`SwitchResult`의 `keepMonths` 주석(52행)을 갱신한다:

```ts
  keepMonths: number // 유지 시 36개월 호라이즌의 도약 누적 개월 = m + min(36, R)
```

- [ ] **Step 4: `compareSwitch` 재작성**

`src/domain/compare.ts` 전체를 다음으로 교체한다:

```ts
import type { SwitchInput, SwitchResult } from './types'
import { futureMonthlyContribution, installmentInterest, leapTwoPhaseMaturity, maturityValue } from './savings'

const HORIZON = 36
const LEAP_TERM = 60

export function compareSwitch(input: SwitchInput): SwitchResult {
  const mPaid = Math.max(0, input.leapMonthsPaid)
  const maxFuture = Math.max(0, LEAP_TERM - mPaid)
  const rRemaining = Math.min(Math.max(0, input.leapMonthsRemaining), maxFuture)

  // 도약 특별해지 환급금: 과거 납입분만(기납입 mPaid개월)
  const leapRefund = leapTwoPhaseMaturity({
    avgMonthly: input.leapAvgMonthly, pastMonths: mPaid, futureMonthly: 0, futureMonths: 0,
    appliedRate: input.leapAppliedRate, baseRate: input.leapBaseRate, bracket: input.leapBracket,
  })

  // 미래적금 36개월 만기
  const futureMaturity = maturityValue({
    monthlyDeposit: input.futureMonthly, months: HORIZON,
    appliedRate: input.futureAppliedRate, baseRate: input.futureBaseRate,
    monthlyContribution: futureMonthlyContribution(input.futureMonthly, input.futureContribType),
  })

  // 남긴 현금: 매달 (도약 추가월납입 − 미래월납입) 적립 + 재예치
  const retainedMonthly = Math.max(0, input.leapFutureMonthly - input.futureMonthly)
  const retainedCash = retainedMonthly * HORIZON + installmentInterest(retainedMonthly, input.reinvestRate, HORIZON)

  // 회수금 V0를 36개월 단리 재예치(일시금)
  const v0Reinvested = leapRefund.total * (1 + (input.reinvestRate * HORIZON) / 12)

  const switchTotal = v0Reinvested + futureMaturity.total + retainedCash

  // KEEP: 36개월 호라이즌 시점 도약 평가(과거분 + 미래분, 만기 60 초과 안 함)
  const futureInHorizon = Math.min(rRemaining, HORIZON)
  const keepMonths = mPaid + futureInHorizon
  const keepEval = leapTwoPhaseMaturity({
    avgMonthly: input.leapAvgMonthly, pastMonths: mPaid,
    futureMonthly: input.leapFutureMonthly, futureMonths: futureInHorizon,
    appliedRate: input.leapAppliedRate, baseRate: input.leapBaseRate, bracket: input.leapBracket,
  })
  const keepTotal = keepEval.total

  // 도약 만기 평가(표기용): 기납입 + 남은개월 (≤60)
  const leapFullMaturity = leapTwoPhaseMaturity({
    avgMonthly: input.leapAvgMonthly, pastMonths: mPaid,
    futureMonthly: input.leapFutureMonthly, futureMonths: rRemaining,
    appliedRate: input.leapAppliedRate, baseRate: input.leapBaseRate, bracket: input.leapBracket,
  })

  return {
    horizonMonths: HORIZON, keepMonths, keepTotal, switchTotal, profit: switchTotal - keepTotal,
    keep: keepEval, leapRefund, futureMaturity, retainedCash, leapFullMaturity,
  }
}
```

- [ ] **Step 5: compare 테스트 통과 확인**

Run: `npx vitest run src/domain/compare.test.ts`
Expected: PASS (기존 회귀 케이스 — keepMonths=50, m=30→60, 남긴현금 200k×36, 환급금 원금 등 — 포함 전부).

- [ ] **Step 6: 커밋**

```bash
git add src/domain/types.ts src/domain/compare.ts src/domain/compare.test.ts
git commit -m "feat(domain): SwitchInput 2단계화(avg/future/remaining) + compareSwitch 도약 2구간 계산"
```

---

## Task 5: selector — avgMonthly 환산 + 남은개월 클램프

**Files:**
- Modify: `src/state/selectors.ts`
- Test: `src/state/selectors.test.ts`

- [ ] **Step 1: 테스트 갱신 + 신규 케이스**

`src/state/selectors.test.ts`의 `si.leapMonthly` 단언(8행)을 교체하고 신규 케이스를 추가한다:

```ts
  it('기본 입력으로 SwitchInput을 구성한다', () => {
    const si = buildSwitchInput(DEFAULT_INPUTS)
    expect(si.leapAvgMonthly).toBe(700_000)
    expect(si.leapFutureMonthly).toBe(700_000)
    expect(si.leapMonthsRemaining).toBe(46)
    expect(si.futureMonthly).toBe(500_000)
    expect(si.leapBracket.id).toBe('i2400')
    expect(si.leapAppliedRate).toBeGreaterThanOrEqual(0.045)
    expect(si.futureAppliedRate).toBeGreaterThanOrEqual(0.05)
  })
  it('금액 모드: avgMonthly = 기납입금액 / 기납입개월 (출금 반영)', () => {
    const si = buildSwitchInput({ ...DEFAULT_INPUTS, leapPaidMode: 'amount', leapPaidAmount: 7_000_000, leapMonthsPaid: 14 })
    expect(si.leapAvgMonthly).toBe(500_000) // 700만 / 14
  })
  it('기납입 0개월 금액모드는 avgMonthly 0 (0 나눗셈 방지)', () => {
    const si = buildSwitchInput({ ...DEFAULT_INPUTS, leapPaidMode: 'amount', leapPaidAmount: 5_000_000, leapMonthsPaid: 0 })
    expect(si.leapAvgMonthly).toBe(0)
  })
  it('남은개월은 60 − 기납입개월로 클램프', () => {
    const si = buildSwitchInput({ ...DEFAULT_INPUTS, leapMonthsPaid: 50, leapMonthsRemaining: 46 })
    expect(si.leapMonthsRemaining).toBe(10) // min(46, 60-50)
  })
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/state/selectors.test.ts`
Expected: FAIL — `si.leapAvgMonthly` 등 없음.

- [ ] **Step 3: `buildSwitchInput` 재작성**

`src/state/selectors.ts` 전체를 다음으로 교체한다:

```ts
import type { AppInputs } from './inputs'
import type { SwitchInput } from '../domain/types'
import { BANKS } from '../data/banks'
import { LEAP_BRACKETS } from '../data/leapBrackets'
import { appliedRate } from '../domain/rates'

const LEAP_TERM = 60

function bank(id: string) {
  return BANKS.find((b) => b.id === id) ?? BANKS[0]
}

export function buildSwitchInput(s: AppInputs): SwitchInput {
  const leapBank = bank(s.leapBankId)
  const futureBank = bank(s.futureBankId)
  const leapProduct = leapBank.leap ?? { baseRate: 0.045, maxRate: 0.06, preferential: [] }
  const futureProduct = futureBank.future ?? { baseRate: 0.05, maxRate: 0.08, preferential: [] }
  const bracket = LEAP_BRACKETS.find((b) => b.id === s.leapBracketId) ?? LEAP_BRACKETS[0]

  const mPaid = Math.max(0, s.leapMonthsPaid)
  const avgMonthly = s.leapPaidMode === 'amount'
    ? (mPaid > 0 ? s.leapPaidAmount / mPaid : 0)
    : s.leapMonthly
  const remaining = Math.min(Math.max(0, s.leapMonthsRemaining), Math.max(0, LEAP_TERM - mPaid))

  return {
    leapAvgMonthly: avgMonthly,
    leapMonthsPaid: mPaid,
    leapFutureMonthly: s.leapFutureMonthly,
    leapMonthsRemaining: remaining,
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

- [ ] **Step 4: 전체 테스트 통과 확인 (컴파일 그린 복구)**

Run: `npx vitest run`
Expected: PASS — 전체 스위트(도메인/상태/App) 그린.

- [ ] **Step 5: 커밋**

```bash
git add src/state/selectors.ts src/state/selectors.test.ts
git commit -m "feat(state): selector avgMonthly 환산(금액모드) + 남은개월 60 클램프"
```

---

## Task 6: UI — 기납입 개월/금액 토글 + 추가월납입·남은개월 슬라이더

**Files:**
- Modify: `src/components/ScenarioControls.tsx`
- Modify: `src/App.css` (`.seg` 추가)
- Test: `src/App.test.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

`src/App.test.tsx`의 `describe('App 스모크', …)`에 추가:

```ts
  it('기납입 금액 모드로 전환하면 금액 슬라이더가 보인다', () => {
    render(<App />)
    expect(screen.queryByLabelText('도약 기납입 금액')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '금액' }))
    expect(screen.getByLabelText('도약 기납입 금액')).toBeTruthy()
  })
  it('추가 월납입액·남은 납입개월 슬라이더가 보인다', () => {
    render(<App />)
    expect(screen.getByLabelText('도약 추가 월납입액')).toBeTruthy()
    expect(screen.getByLabelText('도약 남은 납입개월')).toBeTruthy()
  })
```

(`Slider`는 `aria-label={label}`을 input에 부여하므로 `getByLabelText(label)`로 슬라이더를 찾을 수 있다.)

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL — 해당 라벨/버튼 없음.

- [ ] **Step 3: `.seg` CSS 추가**

`src/App.css`의 `.mode-tabs` 블록(5-8행) 바로 아래에 추가한다:

```css
.seg { display: inline-flex; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; width: fit-content; }
.seg button { padding: 5px 12px; border: none; background: var(--bg); color: var(--text-2); font-size: 12px; cursor: pointer; }
.seg button + button { border-left: 1px solid var(--border); }
.seg button.on { background: var(--bg-2); color: var(--text); font-weight: 600; }
```

- [ ] **Step 4: ScenarioControls — 도약 기납입 컨트롤 교체**

`src/components/ScenarioControls.tsx`에서 기존 "도약 기납입 개월" Slider 블록(89-92행)을 다음으로 교체한다:

```tsx
        {switchMode && (
          <Field label="도약 기납입 입력">
            <div className="seg">
              <button className={inputs.leapPaidMode === 'months' ? 'on' : ''} onClick={() => set({ leapPaidMode: 'months' })}>개월</button>
              <button className={inputs.leapPaidMode === 'amount' ? 'on' : ''} onClick={() => set({ leapPaidMode: 'amount' })}>금액</button>
            </div>
          </Field>
        )}
        {switchMode && (
          <Slider label="도약 기납입 개월" value={inputs.leapMonthsPaid} max={60} step={1} unit="개월"
            onChange={(leapMonthsPaid) => set({ leapMonthsPaid, leapMonthsRemaining: Math.min(inputs.leapMonthsRemaining, Math.max(0, 60 - leapMonthsPaid)) })} />
        )}
        {switchMode && inputs.leapPaidMode === 'amount' && (
          <Slider label="도약 기납입 금액" value={inputs.leapPaidAmount} max={inputs.leapMonthly * 60} step={10_000}
            onChange={(leapPaidAmount) => set({ leapPaidAmount })} />
        )}
        {switchMode && (
          <Slider label="도약 추가 월납입액" value={inputs.leapFutureMonthly} max={PRODUCTS.leap.monthlyMax} step={10_000}
            onChange={(leapFutureMonthly) => set({ leapFutureMonthly })} />
        )}
        {switchMode && (
          <Slider label="도약 남은 납입개월" value={inputs.leapMonthsRemaining} max={Math.max(0, 60 - inputs.leapMonthsPaid)} step={1} unit="개월"
            onChange={(leapMonthsRemaining) => set({ leapMonthsRemaining })} />
        )}
```

기존 "도약 월 납입액" Slider(83-86행)의 라벨을 의미 명확화한다:

```tsx
        {switchMode && (
          <Slider label="도약 (과거) 월 납입액" value={inputs.leapMonthly} max={PRODUCTS.leap.monthlyMax}
            onChange={(leapMonthly) => set({ leapMonthly })} />
        )}
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `npx vitest run src/App.test.tsx`
Expected: PASS.

- [ ] **Step 6: 커밋**

```bash
git add src/components/ScenarioControls.tsx src/App.css src/App.test.tsx
git commit -m "feat(ui): 도약 기납입 개월/금액 토글 + 추가월납입·남은개월 슬라이더"
```

---

## Task 7: 전체 검증 (테스트 + 타입체크 + 빌드 + 린트)

**Files:** 없음 (검증 전용)

- [ ] **Step 1: 전체 테스트**

Run: `npx vitest run`
Expected: 전체 PASS.

- [ ] **Step 2: 타입체크 + 프로덕션 빌드**

Run: `npm run build`
Expected: `tsc -b` 타입 에러 없음 + vite 빌드 성공.

- [ ] **Step 3: 린트**

Run: `npm run lint`
Expected: 에러 없음. (경고가 있으면 신규 변경 관련만 정리.)

- [ ] **Step 4: 수동 확인 (선택)**

Run: `npm run dev` 후 갈아타기 모드에서 (1) 기납입 금액 토글 시 금액 슬라이더 노출, (2) 기납입 개월 조정 시 남은개월 최대치가 60−기납입으로 줄어듦, (3) 추가월납입/남은개월 조정이 유지측 박스 수치에 반영되는지 확인.

- [ ] **Step 5: 검증 결과 보고**

테스트/빌드/린트 출력 결과를 사용자에게 보고한다. (별도 커밋 없음.)

---

## Self-Review 결과

- **스펙 커버리지:** 기납입 개월/금액 토글(Task 6) · 금액=avgMonthly 환산(Task 5) · 추가월납입 2단계(Task 2·4·6) · 남은개월 직접조정+60클램프(Task 4·5·6) · URL 직렬화(Task 3) · 회귀 보존(Task 4 base/케이스) 모두 매핑됨. 비교 시점 36개월 유지(Task 4).
- **명명 일관성:** `leapAvgMonthly`/`leapFutureMonthly`/`leapMonthsRemaining`/`leapPaidMode`/`leapPaidAmount`가 types→compare→selectors→inputs→UI 전반에서 동일. `phaseInterest`/`leapTwoPhaseMaturity` 시그니처가 Task 2 정의와 Task 4 호출에서 일치.
- **회귀:** 개월 모드 + `leapFutureMonthly=leapMonthly` + `leapMonthsRemaining=60−m` 기본값에서 환급금/유지/만기/남긴현금이 기존과 수식상 동일(이자는 phaseInterest 구간분해 항등식으로 보존). 단, `retainedCash` 기준이 `leapMonthly`→`leapFutureMonthly`로 바뀌나 기본값이 동일해 회귀값 유지(스펙의 avgMonthly 주석 대비 의도적 개선: 갈아타기 시 미래 기준 기회비용 반영).
- **플레이스홀더:** 없음. 모든 코드 스텝에 실제 코드/명령/기대값 포함.
