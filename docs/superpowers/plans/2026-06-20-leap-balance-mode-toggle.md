# 도약 입력 "잔액 기준" 모드 토글 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 도약계좌 입력에 `월납입 기준 ⇄ 잔액 기준` 상위 토글을 추가해, 사용자가 "지금까지 입금된 실제 원금 + 남은 개월 + 향후 월납입"을 직접 입력할 수 있게 한다.

**Architecture:** 도메인 수학(`src/domain/*`)은 전혀 손대지 않는다. `SwitchInput`이 이미 `leapAvgMonthly`/`leapMonthsPaid`/`leapFutureMonthly`/`leapMonthsRemaining`를 분리 보유하므로, 상태 레이어에 4개 필드를 추가하고 셀렉터에서 모드별로 이 4값을 산출(잔액 모드는 `원금 ÷ 경과개월`로 평균 도출)한 뒤 기존 2단계 모델에 그대로 먹인다. UI는 세그먼트 토글로 한 번에 한 모드의 컨트롤만 노출한다.

**Tech Stack:** React + TypeScript, Vite, Vitest(jsdom). 상태는 URL 쿼리에 직렬화.

---

## File Structure

- `src/state/inputs.ts` (수정) — `AppInputs`에 4필드, `DEFAULT_INPUTS`, `encode/decode` + 레거시 폴백
- `src/state/inputs.test.ts` (수정) — 신규 필드 라운드트립 + 폴백 테스트
- `src/state/selectors.ts` (수정) — `buildSwitchInput` 모드 분기
- `src/state/selectors.test.ts` (수정) — 기존 2 테스트에 `leapInputMode:'monthly'` 명시 + 잔액모드 신규 테스트
- `src/components/ScenarioControls.tsx` (수정) — 세그먼트 토글 + 모드별 조건부 컨트롤 + 만원 숫자입력 + 평균 적용 버튼
- `src/App.css` (수정) — `.num-row`/`.num-unit`/`.ctrl-hint-row`/`.link-btn` (`.seg`는 이미 존재, 재사용)
- 도메인(`src/domain/*`) — **변경 없음**
- `src/App.tsx` — **변경 없음**(검증 완료): `new` 모드는 `result.futureMaturity`만 표시하며 도약 입력과 무관. 기존 `calcInputs`의 `leapMonthsPaid: 0`은 신규 모드 표시에 영향 없는 무해 코드라 그대로 둔다.

기본값 설계: 잔액 모드 기본값(`원금 9,800,000 / 남은 46 / 향후 700,000`)은 월납입 기준 기본값(`월 700,000 × 기납입 14`)과 수치적으로 등가 → 모드 전환 시 기본 상태 결과가 동일.

---

### Task 1: 상태 레이어 — 4필드 + encode/decode + 레거시 폴백

**Files:**
- Modify: `src/state/inputs.ts`
- Test: `src/state/inputs.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`src/state/inputs.test.ts`의 기존 `describe` 블록 안에 아래 `it`들을 추가한다(파일 끝 `})` 직전):

```ts
  it('신규 잔액모드 필드 encode→decode 라운드트립', () => {
    const s = {
      ...DEFAULT_INPUTS,
      leapInputMode: 'balance' as const,
      leapPaidPrincipal: 18_900_000,
      leapMonthsRemaining: 32,
      leapFutureMonthly: 300_000,
    }
    const r = decodeInputs(encodeInputs(s))
    expect(r.leapInputMode).toBe('balance')
    expect(r.leapPaidPrincipal).toBe(18_900_000)
    expect(r.leapMonthsRemaining).toBe(32)
    expect(r.leapFutureMonthly).toBe(300_000)
  })
  it('기본 입력 모드는 balance', () => {
    expect(DEFAULT_INPUTS.leapInputMode).toBe('balance')
    expect(decodeInputs('').leapInputMode).toBe('balance')
  })
  it('레거시 공유 URL(lim 없음, lmp 있음)은 monthly로 폴백', () => {
    const r = decodeInputs('lm=700000&lmp=20')
    expect(r.leapInputMode).toBe('monthly')
  })
  it('lim이 명시되면 그 값을 사용', () => {
    expect(decodeInputs('lim=monthly&lmp=20').leapInputMode).toBe('monthly')
    expect(decodeInputs('lim=balance&lpp=18900000').leapInputMode).toBe('balance')
  })
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

Run: `npx vitest run src/state/inputs.test.ts`
Expected: FAIL — `leapInputMode` 등 속성이 `DEFAULT_INPUTS`/디코드 결과에 없음(타입/런타임 에러).

- [ ] **Step 3: `inputs.ts` 구현**

`src/state/inputs.ts`를 아래로 수정한다.

타입 별칭 추가(파일 상단 `export type Mode` 아래):

```ts
export type LeapInputMode = 'monthly' | 'balance'
```

`AppInputs` 인터페이스의 도약 블록을 다음으로 교체:

```ts
  // 도약
  leapBankId: string
  leapPrefs: string[]
  leapInputMode: LeapInputMode
  leapMonthly: number          // 월납입 기준 모드
  leapMonthsPaid: number       // 월납입 기준 모드
  leapPaidPrincipal: number    // 잔액 기준 모드: 지금까지 입금된 원금(원)
  leapMonthsRemaining: number  // 잔액 기준 모드: 남은 납입개월
  leapFutureMonthly: number    // 잔액 기준 모드: 향후 월 납입액(원)
  leapBracketId: string
```

`DEFAULT_INPUTS`의 도약 줄을 교체:

```ts
  leapBankId: 'shinhan', leapPrefs: [], leapInputMode: 'balance',
  leapMonthly: 700_000, leapMonthsPaid: 14,
  leapPaidPrincipal: 9_800_000, leapMonthsRemaining: 46, leapFutureMonthly: 700_000,
  leapBracketId: 'i2400',
```

`encodeInputs`에 키 4개 추가(`p.set('lmp', ...)` 다음 줄들):

```ts
  p.set('lim', s.leapInputMode)
  p.set('lpp', String(s.leapPaidPrincipal))
  p.set('lmr', String(s.leapMonthsRemaining))
  p.set('lfm', String(s.leapFutureMonthly))
```

`decodeInputs`에서, `const p = new URLSearchParams(query)` 다음에 모드 추론 추가하고 반환 객체에 4필드 추가:

```ts
  const splitPrefs = (v: string | null) => (v ? v.split('.').filter(Boolean) : [])
  const limRaw = p.get('lim')
  const leapInputMode: LeapInputMode =
    limRaw === 'monthly' || limRaw === 'balance'
      ? limRaw
      : p.has('lmp') || p.has('lm')
        ? 'monthly'
        : DEFAULT_INPUTS.leapInputMode
  return {
    mode: (p.get('m') as Mode) || DEFAULT_INPUTS.mode,
    leapBankId: p.get('lb') || DEFAULT_INPUTS.leapBankId,
    leapPrefs: p.has('lp') ? splitPrefs(p.get('lp')) : DEFAULT_INPUTS.leapPrefs,
    leapInputMode,
    leapMonthly: num(p.get('lm'), DEFAULT_INPUTS.leapMonthly),
    leapMonthsPaid: num(p.get('lmp'), DEFAULT_INPUTS.leapMonthsPaid),
    leapPaidPrincipal: num(p.get('lpp'), DEFAULT_INPUTS.leapPaidPrincipal),
    leapMonthsRemaining: num(p.get('lmr'), DEFAULT_INPUTS.leapMonthsRemaining),
    leapFutureMonthly: num(p.get('lfm'), DEFAULT_INPUTS.leapFutureMonthly),
    leapBracketId: p.get('lbr') || DEFAULT_INPUTS.leapBracketId,
    futureBankId: p.get('fb') || DEFAULT_INPUTS.futureBankId,
    futurePrefs: p.has('fp') ? splitPrefs(p.get('fp')) : DEFAULT_INPUTS.futurePrefs,
    futureMonthly: num(p.get('fm'), DEFAULT_INPUTS.futureMonthly),
    futureContribType: (p.get('fc') as FutureContribType) || DEFAULT_INPUTS.futureContribType,
    reinvestRate: num(p.get('ri'), DEFAULT_INPUTS.reinvestRate),
  }
```

(기존 `splitPrefs` 선언이 이미 있으면 중복 선언하지 말고 그대로 둔다.)

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run src/state/inputs.test.ts`
Expected: PASS (신규 4개 + 기존 4개 모두). 기존 "옛 공유 URL 무시" 테스트는 mode를 검사하지 않으므로 영향 없음. 단, 그 테스트가 쓰는 `lfm`/`lmr`은 이제 실제 키가 됐다(무시되지 않음) — 테스트가 `leapMonthly`/`leapMonthsPaid`만 단언하므로 여전히 통과하나, 혼동을 줄이려면 테스트명을 "제거된 파라미터(lpm/lpa)는 무시" 정도로 다듬어도 좋다(선택).

- [ ] **Step 5: 커밋**

```bash
git add src/state/inputs.ts src/state/inputs.test.ts
git commit -m "feat(state): add leap balance-mode input fields + legacy decode fallback"
```

---

### Task 2: 셀렉터 — 모드 분기

**Files:**
- Modify: `src/state/selectors.ts`
- Test: `src/state/selectors.test.ts`

- [ ] **Step 1: 기존 테스트를 monthly 명시로 고치고 잔액모드 테스트 추가**

`src/state/selectors.test.ts`에서 기존 2개 테스트(월납입 기준 동작 가정)를 `leapInputMode: 'monthly'`로 고정하고, 잔액모드 테스트를 추가한다. 파일 전체를 다음으로 교체:

```ts
import { describe, it, expect } from 'vitest'
import { buildSwitchInput } from './selectors'
import { DEFAULT_INPUTS } from './inputs'

describe('buildSwitchInput', () => {
  it('기본 입력(잔액모드)으로 SwitchInput을 구성한다', () => {
    const si = buildSwitchInput(DEFAULT_INPUTS)
    expect(si.leapAvgMonthly).toBe(700_000) // 9,800,000 / 14
    expect(si.leapFutureMonthly).toBe(700_000)
    expect(si.leapMonthsRemaining).toBe(46)
    expect(si.leapMonthsPaid).toBe(14)
    expect(si.futureMonthly).toBe(500_000)
    expect(si.leapBracket.id).toBe('i2400')
    expect(si.leapAppliedRate).toBeGreaterThanOrEqual(0.045)
    expect(si.futureAppliedRate).toBeGreaterThanOrEqual(0.05)
  })
  it('월납입 모드: 추가 월납입은 월 납입액과 동일 매핑', () => {
    const si = buildSwitchInput({ ...DEFAULT_INPUTS, leapInputMode: 'monthly', leapMonthly: 500_000 })
    expect(si.leapAvgMonthly).toBe(500_000)
    expect(si.leapFutureMonthly).toBe(500_000)
  })
  it('월납입 모드: 남은개월은 60 − 기납입개월로 자동 계산', () => {
    const si = buildSwitchInput({ ...DEFAULT_INPUTS, leapInputMode: 'monthly', leapMonthsPaid: 50 })
    expect(si.leapMonthsRemaining).toBe(10)
  })
  it('잔액 모드: 원금/남은개월로 평균월납입 산출', () => {
    const si = buildSwitchInput({
      ...DEFAULT_INPUTS, leapInputMode: 'balance',
      leapPaidPrincipal: 18_900_000, leapMonthsRemaining: 32, leapFutureMonthly: 300_000,
    })
    expect(si.leapMonthsPaid).toBe(28) // 60 - 32
    expect(si.leapAvgMonthly).toBe(675_000) // round(18,900,000 / 28)
    expect(si.leapFutureMonthly).toBe(300_000)
    expect(si.leapMonthsRemaining).toBe(32)
  })
  it('잔액 모드: 남은 60개월(경과 0)이면 평균 0 (0 나눗셈 가드)', () => {
    const si = buildSwitchInput({
      ...DEFAULT_INPUTS, leapInputMode: 'balance', leapMonthsRemaining: 60, leapPaidPrincipal: 5_000_000,
    })
    expect(si.leapMonthsPaid).toBe(0)
    expect(si.leapAvgMonthly).toBe(0)
  })
})
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

Run: `npx vitest run src/state/selectors.test.ts`
Expected: FAIL — 잔액모드 분기가 없어 기본값 테스트의 `leapAvgMonthly`가 700_000이 아닐 수 있고, 잔액모드 테스트가 통과하지 못함.

- [ ] **Step 3: `selectors.ts` 모드 분기 구현**

`src/state/selectors.ts`의 `buildSwitchInput` 본문에서 `const mPaid = Math.max(0, s.leapMonthsPaid)` 줄을 제거하고, `return {` 직전에 다음 분기를 넣는다:

```ts
  let mPaid: number
  let avgMonthly: number
  let future: number
  let remaining: number
  if (s.leapInputMode === 'balance') {
    remaining = Math.min(Math.max(0, s.leapMonthsRemaining), LEAP_TERM)
    mPaid = LEAP_TERM - remaining
    avgMonthly = mPaid > 0 ? Math.round(s.leapPaidPrincipal / mPaid) : 0
    future = s.leapFutureMonthly
  } else {
    mPaid = Math.max(0, s.leapMonthsPaid)
    avgMonthly = s.leapMonthly
    future = s.leapMonthly
    remaining = Math.max(0, LEAP_TERM - mPaid)
  }
```

그리고 `return` 객체의 도약 4필드를 파생값으로 교체:

```ts
    leapAvgMonthly: avgMonthly,
    leapMonthsPaid: mPaid,
    leapFutureMonthly: future,
    leapMonthsRemaining: remaining,
```

(나머지 `leapAppliedRate`/`leapBaseRate`/`leapBracket`/미래적금/`reinvestRate` 필드는 그대로 둔다.)

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run src/state/selectors.test.ts`
Expected: PASS (5개 모두).

- [ ] **Step 5: 도메인 회귀 확인 + 커밋**

Run: `npx vitest run`
Expected: 전체 PASS (도메인 테스트 포함, 변경 없음).

```bash
git add src/state/selectors.ts src/state/selectors.test.ts
git commit -m "feat(state): branch buildSwitchInput on leap input mode (balance vs monthly)"
```

---

### Task 3: UI — 세그먼트 토글 + 모드별 컨트롤

**Files:**
- Modify: `src/components/ScenarioControls.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: CSS 추가**

`src/App.css`에 다음 규칙을 추가한다(파일 끝). `.seg`는 이미 존재하므로 추가하지 않는다.

```css
.num-row { display: flex; align-items: center; gap: 6px; }
.num-row input { flex: 1; padding: 6px 8px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg); color: var(--text); font-size: 13px; }
.num-unit { font-size: 12px; color: var(--text-2); }
.ctrl-hint-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.link-btn { background: none; border: none; padding: 0; font-size: 11px; color: var(--accent); cursor: pointer; text-decoration: underline; }
```

- [ ] **Step 2: `ScenarioControls.tsx` — 파생값 계산 추가**

`src/components/ScenarioControls.tsx`에서, 기존 줄
`const remaining = Math.max(0, LEAP_TERM - inputs.leapMonthsPaid)`
을 다음으로 교체:

```ts
  const monthlyRemaining = Math.max(0, LEAP_TERM - inputs.leapMonthsPaid)
  const balRemaining = Math.min(Math.max(0, inputs.leapMonthsRemaining), LEAP_TERM)
  const balElapsed = LEAP_TERM - balRemaining
  const balAvg = balElapsed > 0 ? Math.round(inputs.leapPaidPrincipal / balElapsed) : 0
```

- [ ] **Step 3: 도약 컬럼 입력부 교체**

도약 `<div className="ctrl-grid">` 안에서, `소득구간 (기여금)` Field 다음부터 `월 납입액` Slider + `기납입 개월` ctrl 블록(현재 두 위젯)을 다음으로 **교체**한다:

```tsx
              <div className="ctrl">
                <label>입력 방식</label>
                <div className="seg">
                  <button
                    type="button"
                    className={inputs.leapInputMode === 'monthly' ? 'on' : ''}
                    onClick={() => set({ leapInputMode: 'monthly' })}
                  >월납입 기준</button>
                  <button
                    type="button"
                    className={inputs.leapInputMode === 'balance' ? 'on' : ''}
                    onClick={() => set({ leapInputMode: 'balance' })}
                  >잔액 기준</button>
                </div>
              </div>

              {inputs.leapInputMode === 'monthly' ? (
                <>
                  <Slider label="월 납입액" value={inputs.leapMonthly} max={PRODUCTS.leap.monthlyMax}
                    onChange={(leapMonthly) => set({ leapMonthly })} />
                  <div className="ctrl">
                    <Slider label="기납입 개월" value={inputs.leapMonthsPaid} max={LEAP_TERM} step={1} unit="개월"
                      onChange={(leapMonthsPaid) => set({ leapMonthsPaid })} />
                    <span className="ctrl-hint">남은 {monthlyRemaining}개월 · 만기 {LEAP_TERM}개월</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="ctrl">
                    <label>지금까지 입금된 원금</label>
                    <div className="num-row">
                      <input
                        type="number" min={0} step={1}
                        value={Math.round(inputs.leapPaidPrincipal / 10_000)}
                        aria-label="지금까지 입금된 원금(만원)"
                        onChange={(e) =>
                          set({ leapPaidPrincipal: Math.max(0, Math.floor(Number(e.target.value) || 0)) * 10_000 })
                        }
                      />
                      <span className="num-unit">만원</span>
                    </div>
                  </div>
                  <Slider label="남은 개월" value={balRemaining} max={LEAP_TERM} step={1} unit="개월"
                    onChange={(leapMonthsRemaining) => set({ leapMonthsRemaining })} />
                  <div className="ctrl">
                    <Slider label="향후 월 납입액" value={inputs.leapFutureMonthly} max={PRODUCTS.leap.monthlyMax}
                      onChange={(leapFutureMonthly) => set({ leapFutureMonthly })} />
                    <div className="ctrl-hint-row">
                      <span className="ctrl-hint">경과 {balElapsed}개월 · 추정 평균 {manwon(balAvg)}/월</span>
                      <button type="button" className="link-btn" onClick={() => set({ leapFutureMonthly: balAvg })}>
                        평균 적용
                      </button>
                    </div>
                  </div>
                </>
              )}
```

(`manwon`은 이미 import되어 있다. `Slider`/`Field`/`PRODUCTS`/`LEAP_TERM`도 기존 import.)

- [ ] **Step 4: 타입체크 + 빌드 확인**

Run: `npm run build`
Expected: PASS (tsc -b 통과, vite build 성공). 미사용 변수/타입 에러 없음.

- [ ] **Step 5: 커밋**

```bash
git add src/components/ScenarioControls.tsx src/App.css
git commit -m "feat(ui): leap input-mode segment toggle with balance-based inputs"
```

---

### Task 4: 전체 검증 + 브라우저 확인

**Files:** 없음(검증만)

- [ ] **Step 1: 전체 테스트 + 빌드**

Run: `npm test && npm run build`
Expected: 전체 PASS.

- [ ] **Step 2: dev 서버에서 토글 동작 육안 확인**

`npm run dev` 후(또는 preview 도구) 확인:
- 도약 컬럼에 `[월납입 기준 | 잔액 기준]` 토글, 기본 선택 = 잔액 기준
- 잔액 기준: 원금(만원 숫자입력)/남은 개월/향후 월납입 + "경과 N개월 · 추정 평균 …/월" + `평균 적용` 버튼
- 원금 1,890 + 남은 32 입력 → 힌트 "경과 28개월 · 추정 평균 67만원/월"(round(18,900,000/28)=675,000 → "68만원"으로 표기됨에 유의: manwon은 round(/10000)이므로 67.5→68)
- `평균 적용` 클릭 시 향후 월납입 슬라이더가 추정평균으로 점프
- `월납입 기준`으로 전환 시 기존 월납입/기납입개월 컨트롤로 교체
- URL 쿼리에 `lim/lpp/lmr/lfm` 반영, 새로고침 후 값 유지

- [ ] **Step 3: 최종 커밋(필요 시)**

검증 중 수정이 있었으면 커밋. 없으면 스킵.

---

## 검증

- `npm test` — inputs/selectors 신규 테스트 + 도메인 회귀 전부 PASS
- `npm run build` — tsc + vite 통과
- 두 모드 기본값 등가성: 기본(잔액) `SwitchInput` = avg 700,000 / future 700,000 / mPaid 14 / remaining 46, monthly 모드 기본과 동일
- 레거시 `lim` 없는 공유 URL → monthly 폴백으로 기존 동작 보존
