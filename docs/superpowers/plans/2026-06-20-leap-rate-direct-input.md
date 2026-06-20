# 도약 우대금리 직접입력(override) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 도약계좌 우대금리를 칩 토글 대신 "총 우대 %p" 한 값으로 직접 입력해 만기 금리에 반영할 수 있게 한다(부분 적용 대응).

**Architecture:** 도메인 `appliedRate`에 선택적 `override` 인자를 추가(주어지면 `base + override`를 maxRate로 클램프, 칩 무시). 상태에 `leapRateDirect`/`leapRateOverride` 두 필드를 추가하고 URL encode/decode + 레거시 폴백을 더한다. `selectors`에서 도약 금리 계산을 분기하고, `ScenarioControls` 도약 영역에 체크박스 + %p 입력 UI를 붙인다. 단위는 도메인/상태 모두 decimal(0.008=0.8%p), UI 표시만 percent.

**Tech Stack:** TypeScript, React(단일 컴포넌트), Vitest(jsdom), Vite.

---

## File Structure

- `src/domain/rates.ts` — `appliedRate`에 `override?` 인자 추가 (수정)
- `src/domain/rates.test.ts` — override 동작 테스트 추가 (수정)
- `src/state/inputs.ts` — `AppInputs` 필드 2개 + `DEFAULT_INPUTS` + encode/decode (수정)
- `src/state/inputs.test.ts` — 라운드트립/레거시 폴백 테스트 추가 (수정)
- `src/state/selectors.ts` — 도약 금리 계산 분기 (수정)
- `src/components/RateChecklist.tsx` — `disabled` prop 추가 (수정)
- `src/components/ScenarioControls.tsx` — 직접입력 체크박스 + %p 입력 UI (수정)
- `src/App.css` — 비활성 칩 + 직접입력 행 스타일 (수정)

---

## Task 1: 도메인 — `appliedRate`에 override 인자

**Files:**
- Modify: `src/domain/rates.ts`
- Test: `src/domain/rates.test.ts`

- [ ] **Step 1: 실패하는 테스트 추가**

`src/domain/rates.test.ts`의 `describe('appliedRate', ...)` 블록 안, 기존 `it`들 뒤에 추가:

```ts
  it('override 주어지면 base + override (칩 무시)', () => {
    expect(appliedRate(bp, ['a', 'b'], 0.008)).toBeCloseTo(0.058, 6) // 0.05+0.008
  })
  it('override는 maxRate로 클램프', () => {
    expect(appliedRate(bp, [], 0.05)).toBe(0.08) // 0.05+0.05=0.10 → 0.08
  })
  it('override 0이면 base만(칩 무시)', () => {
    expect(appliedRate(bp, ['a', 'b', 'c'], 0)).toBe(0.05)
  })
  it('override undefined면 기존 칩 합산 동작', () => {
    expect(appliedRate(bp, ['a', 'b'], undefined)).toBeCloseTo(0.065, 6)
  })
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/domain/rates.test.ts`
Expected: 새 테스트 FAIL (override 인자가 무시되어 `0.065`/`0.05`가 나옴)

- [ ] **Step 3: 최소 구현**

`src/domain/rates.ts` 전체를 다음으로 교체:

```ts
import type { BankProduct } from '../data/banks'

export function appliedRate(
  product: BankProduct,
  checkedIds: string[],
  override?: number, // decimal 우대 %p. 주어지면 칩 무시하고 base+override 사용
): number {
  if (override != null) {
    return Math.min(product.baseRate + override, product.maxRate)
  }
  const bonus = product.preferential
    .filter((p) => checkedIds.includes(p.id))
    .reduce((sum, p) => sum + p.rate, 0)
  return Math.min(product.baseRate + bonus, product.maxRate)
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run src/domain/rates.test.ts`
Expected: PASS (전부)

- [ ] **Step 5: 커밋**

```bash
git add src/domain/rates.ts src/domain/rates.test.ts
git commit -m "feat(domain): appliedRate override 인자로 우대금리 직접지정 지원"
```

---

## Task 2: 상태 — AppInputs 필드 + encode/decode

**Files:**
- Modify: `src/state/inputs.ts`
- Test: `src/state/inputs.test.ts`

- [ ] **Step 1: 실패하는 테스트 추가**

`src/state/inputs.test.ts`의 `describe('inputs URL 직렬화', ...)` 블록 안 끝에 추가:

```ts
  it('우대 직접입력 필드 encode→decode 라운드트립', () => {
    const s = { ...DEFAULT_INPUTS, leapRateDirect: true, leapRateOverride: 0.008 }
    const r = decodeInputs(encodeInputs(s))
    expect(r.leapRateDirect).toBe(true)
    expect(r.leapRateOverride).toBeCloseTo(0.008, 6)
  })
  it('레거시 URL(lrd/lro 없음)은 직접입력 off + override 0', () => {
    const r = decodeInputs('lm=700000&lmp=20')
    expect(r.leapRateDirect).toBe(false)
    expect(r.leapRateOverride).toBe(0)
  })
  it('기본값은 직접입력 off', () => {
    expect(DEFAULT_INPUTS.leapRateDirect).toBe(false)
    expect(DEFAULT_INPUTS.leapRateOverride).toBe(0)
  })
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/state/inputs.test.ts`
Expected: FAIL (타입 에러 또는 `leapRateDirect`가 `undefined`)

- [ ] **Step 3: `AppInputs` 인터페이스에 필드 추가**

`src/state/inputs.ts`에서 `leapBracketId: string` 줄 **앞**에 추가:

```ts
  leapRateDirect: boolean      // 도약 우대금리 직접입력 사용 여부
  leapRateOverride: number     // 직접입력 시 총 우대 %p (decimal, 예 0.008)
```

- [ ] **Step 4: `DEFAULT_INPUTS`에 기본값 추가**

`src/state/inputs.ts`의 `DEFAULT_INPUTS`에서 `leapBracketId: 'i2400',` 줄 **앞**에 추가:

```ts
  leapRateDirect: false, leapRateOverride: 0,
```

- [ ] **Step 5: encode에 키 추가**

`src/state/inputs.ts`의 `encodeInputs`에서 `p.set('lbr', s.leapBracketId)` 줄 **앞**에 추가:

```ts
  p.set('lrd', String(s.leapRateDirect))
  p.set('lro', String(s.leapRateOverride))
```

- [ ] **Step 6: decode에 키 추가**

`src/state/inputs.ts`의 `decodeInputs` return 객체에서 `leapBracketId: ...` 줄 **앞**에 추가:

```ts
    leapRateDirect: p.get('lrd') === 'true',
    leapRateOverride: num(p.get('lro'), DEFAULT_INPUTS.leapRateOverride),
```

- [ ] **Step 7: 테스트 통과 확인**

Run: `npx vitest run src/state/inputs.test.ts`
Expected: PASS (전부)

- [ ] **Step 8: 커밋**

```bash
git add src/state/inputs.ts src/state/inputs.test.ts
git commit -m "feat(state): leapRateDirect/leapRateOverride 입력 필드 + URL 직렬화"
```

---

## Task 3: 연결 — selectors에서 도약 금리 분기

**Files:**
- Modify: `src/state/selectors.ts`
- Test: `src/state/selectors.test.ts`

- [ ] **Step 1: 실패하는 테스트 추가**

`src/state/selectors.test.ts` 끝(마지막 `})` 직전, 가장 바깥 `describe` 안)에 추가. 파일 상단에 `DEFAULT_INPUTS` import가 이미 있다고 가정하고 없으면 `import { DEFAULT_INPUTS } from './inputs'` 추가:

```ts
  it('leapRateDirect면 도약금리는 base+override (칩 무시)', () => {
    const s = {
      ...DEFAULT_INPUTS,
      leapBankId: 'shinhan',          // base 0.045
      leapPrefs: ['salary', 'card'],  // 칩 합 0.6%p — 무시돼야 함
      leapRateDirect: true,
      leapRateOverride: 0.008,
    }
    expect(buildSwitchInput(s).leapAppliedRate).toBeCloseTo(0.053, 6)
  })
  it('leapRateDirect false면 기존 칩 합산', () => {
    const s = {
      ...DEFAULT_INPUTS,
      leapBankId: 'shinhan',
      leapPrefs: ['salary', 'card'],  // 0.003 + 0.003
      leapRateDirect: false,
    }
    expect(buildSwitchInput(s).leapAppliedRate).toBeCloseTo(0.051, 6)
  })
```

> 참고: 파일 상단 import에 `buildSwitchInput`이 이미 있는지 확인. 없으면 `import { buildSwitchInput } from './selectors'` 추가.

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/state/selectors.test.ts`
Expected: 첫 새 테스트 FAIL (override 무시되어 `0.051`이 나옴)

- [ ] **Step 3: selectors 분기 구현**

`src/state/selectors.ts`의 return 객체에서 다음 줄을:

```ts
    leapAppliedRate: appliedRate(leapProduct, s.leapPrefs),
```

다음으로 교체:

```ts
    leapAppliedRate: s.leapRateDirect
      ? appliedRate(leapProduct, s.leapPrefs, s.leapRateOverride)
      : appliedRate(leapProduct, s.leapPrefs),
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run src/state/selectors.test.ts`
Expected: PASS (전부)

- [ ] **Step 5: 커밋**

```bash
git add src/state/selectors.ts src/state/selectors.test.ts
git commit -m "feat(state): buildSwitchInput에서 도약 우대 직접입력 반영"
```

---

## Task 4: UI — RateChecklist에 disabled prop

**Files:**
- Modify: `src/components/RateChecklist.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: RateChecklist에 disabled 지원 추가**

`src/components/RateChecklist.tsx` 전체를 다음으로 교체:

```tsx
import type { PreferentialRate } from '../data/banks'
import { percent } from '../format'

export function RateChecklist({
  items, checked, onToggle, disabled = false,
}: {
  items: PreferentialRate[]
  checked: string[]
  onToggle: (id: string) => void
  disabled?: boolean
}) {
  return (
    <div className="rate-chips">
      {items.map((it) => (
        <button
          key={it.id}
          className={`chip ${checked.includes(it.id) ? 'on' : ''}`}
          onClick={() => onToggle(it.id)}
          disabled={disabled}
          type="button"
        >
          {it.label} +{percent(it.rate)}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: 비활성 칩 + 직접입력 행 CSS 추가**

`src/App.css`의 `.chip.on { ... }` 줄(50번째 근처) **바로 뒤**에 추가:

```css
.chip:disabled { opacity: .4; cursor: not-allowed; }
.direct-rate-row { display: flex; align-items: center; gap: 6px; margin: 8px 0; font-size: 12px; color: var(--text-2); }
.direct-rate-row input[type="checkbox"] { accent-color: #6699ff; }
.direct-rate-input { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.direct-rate-input input { width: 80px; padding: 6px 8px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg); color: var(--text); font-size: 13px; }
```

- [ ] **Step 3: 빌드 타입 확인**

Run: `npx tsc -b`
Expected: 에러 없음

- [ ] **Step 4: 커밋**

```bash
git add src/components/RateChecklist.tsx src/App.css
git commit -m "feat(ui): RateChecklist disabled 상태 + 직접입력 행 스타일"
```

---

## Task 5: UI — 도약 직접입력 체크박스 + %p 입력

**Files:**
- Modify: `src/components/ScenarioControls.tsx`

- [ ] **Step 1: appliedRate import 추가**

`src/components/ScenarioControls.tsx` 상단 import 블록에서 `import { manwon } from '../format'` 줄 **뒤**에 추가:

```tsx
import { appliedRate } from '../domain/rates'
```

- [ ] **Step 2: 직접입력 파생값 계산 추가**

`src/components/ScenarioControls.tsx`의 `const balAvg = ...` 줄 **뒤**에 추가:

```tsx
  const leapProduct = leapBank?.leap
  const leapHeadroom = leapProduct ? leapProduct.maxRate - leapProduct.baseRate : 0
  const overridePct = Math.round(inputs.leapRateOverride * 1000) / 10
  // 직접입력을 켜는 순간 현재 칩 합계(우대 보너스)를 초기값으로 시드
  const chipBonus = leapProduct
    ? Math.max(0, appliedRate(leapProduct, inputs.leapPrefs) - leapProduct.baseRate)
    : 0
```

- [ ] **Step 3: 도약 우대 영역(chips-block) 교체**

`src/components/ScenarioControls.tsx`의 도약 영역 `<div className="chips-block">`(라벨이 `도약계좌 우대금리`인 블록) 전체를 다음으로 교체:

```tsx
            <div className="chips-block">
              <div className="chips-label">도약계좌 우대금리</div>
              <label className="direct-rate-row">
                <input
                  type="checkbox"
                  checked={inputs.leapRateDirect}
                  onChange={(e) =>
                    set(
                      e.target.checked
                        ? { leapRateDirect: true, leapRateOverride: chipBonus }
                        : { leapRateDirect: false },
                    )
                  }
                />
                우대금리 직접 입력
              </label>
              {inputs.leapRateDirect && (
                <div className="direct-rate-input">
                  <span>총 우대</span>
                  <input
                    type="number" min={0} max={Math.round(leapHeadroom * 1000) / 10} step={0.1}
                    value={overridePct}
                    aria-label="총 우대 %p"
                    onChange={(e) => {
                      const pct = Math.max(0, Number(e.target.value) || 0)
                      const dec = Math.min(pct / 100, leapHeadroom)
                      set({ leapRateOverride: dec })
                    }}
                  />
                  <span className="num-unit">%p</span>
                </div>
              )}
              <RateChecklist
                items={leapProduct?.preferential ?? []}
                checked={inputs.leapPrefs}
                onToggle={(id) => set({ leapPrefs: toggle(inputs.leapPrefs, id) })}
                disabled={inputs.leapRateDirect}
              />
            </div>
```

> 주의: 이 블록 안에서 칩 items 소스를 `leapBank?.leap?.preferential` 대신 Step 2에서 만든 `leapProduct?.preferential`로 쓴다(동일 값, 변수 재사용).

- [ ] **Step 4: 빌드/린트 확인**

Run: `npx tsc -b && npm run lint`
Expected: 에러 없음

- [ ] **Step 5: 전체 테스트 확인**

Run: `npm test`
Expected: PASS (전부)

- [ ] **Step 6: 커밋**

```bash
git add src/components/ScenarioControls.tsx
git commit -m "feat(ui): 도약 우대금리 직접입력 체크박스 + 총 우대 %p 입력"
```

---

## Task 6: 수동 검증 (dev 서버)

**Files:** 없음 (검증만)

- [ ] **Step 1: dev 서버 기동 후 브라우저 확인**

- `switch` 모드에서 도약계좌 영역에 "우대금리 직접 입력" 체크박스가 보인다.
- 체크 시: 칩들이 회색 비활성, "총 우대 [N] %p" 입력 등장, 초기값이 직전 칩 합계와 일치.
- 값을 0.8로 바꾸면 결과(도약 만기/비교)가 base 4.5% + 0.8% = 5.3% 기준으로 갱신.
- 헤드룸 초과값(예 3) 입력 시 maxRate(6%)로 클램프되어 결과가 더 안 오른다.
- 체크 해제 시 칩 동작 복귀.
- URL에 `lrd=true&lro=0.008`가 반영되고, 그 URL 새로고침 시 상태 복원.
- `new` 모드에선 도약 영역(및 직접입력)이 보이지 않는다.

- [ ] **Step 2: 검증 후 정리**

문제 없으면 완료. 문제가 있으면 해당 Task로 돌아가 수정.

---

## 비목표 (YAGNI)
- 항목별 부분 입력/슬라이더(은행 앱 1:1 모델링) — 미채택.
- 미래적금 직접입력 — 범위 외.
- "최종 금리 %" 입력 방식 — "총 우대 %p"로 확정.
