# 도약 우대금리 직접입력(override) 설계

## 배경 / 문제

도약계좌(예: 신한)의 우대금리는 은행 정책에 따라 **부분 적용**되는 경우가 많다.
실제 앱에서 우대금리를 조회하면 다음처럼 나온다.

| 항목 | 우대율 | 현황 |
|---|---|---|
| 기본금리 | 4.5% | 적용 중 |
| 소득+ 우대 | 최고 0.5% | 2/5회 → 단계적 (현재 약 0.2%) |
| 급여이체 | 0.3% | 7/30개월 → 잔여 32개월 내 충족 가능 |
| 신한카드 결제 | 0.3% | 27/30 → 3개월 후 확정 |
| 첫 거래 | 0.4% | 미충족 (불가) |

현재 앱은 우대 항목을 칩 단위 **on/off 토글**로만 다루고, `appliedRate()`가 체크된
항목의 `rate`를 단순 합산한다. "0.5% 중 0.2%만"처럼 부분 적용을 표현할 수 없다.

**어느 항목이 부분 적용되는지는 은행 정책**이라 앱이 항목별로 모델링해 둘 수 없다.
따라서 항목별 부분 입력(은행 앱과 1:1 모델링)은 채택하지 않고, 사용자가 은행 앱에서
본 **총 우대 합계**를 한 칸에 직접 입력해 칩 합산을 덮어쓰는 방식을 택한다.

## 범위

- **도약계좌만** 대상. 미래적금은 현행 칩 토글 유지(신규 계좌라 조건 충족 예측 성격).
- `switch` 모드 전용. `new` 모드는 도약 입력을 0으로 두므로 컨트롤을 노출하지 않는다.

## 사용자 시나리오

사용자가 은행 앱에서 만기 예상 우대 합계(예: 0.8%p)를 확인하고, 그 값을 직접 입력해
도약 만기 금리를 `4.5% + 0.8% = 5.3%`로 반영한다.

## UI 설계 (`ScenarioControls`)

도약 우대 칩 영역에 체크박스 **"우대금리 직접 입력"** 추가.

- **OFF (기본값, 현행 동작)**: 칩 on/off 토글 → 합산.
- **ON**:
  - 칩들은 회색 비활성(참고용으로 표시하되 클릭 불가).
  - 숫자 입력 **"총 우대 [ 0.8 ] %p"** 노출.
  - 체크를 **켜는 순간** 현재 체크된 칩 합계를 초기값으로 시드한다
    (예: 신한카드+급여 체크 시 0.6 → 사용자가 은행 앱 보고 수정).
  - 입력은 `[0, maxRate − baseRate]` 범위로 클램프(도약 = 0 ~ 1.5%p).
    최근 "도약 원금 상한 캡"과 동일한 슬라이더 패리티 패턴.
- UI는 percent(0.8) 단위로 표시·입력하고, 상태에는 decimal(0.008)로 저장한다.

## 도메인 설계 (`src/domain/rates.ts`)

`appliedRate`에 선택 인자 `override` 추가.

```ts
export function appliedRate(
  product: BankProduct,
  checkedIds: string[],
  override?: number, // decimal 우대 %p. 주어지면 칩 무시
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

- `override`가 `undefined`/미지정이면 현행 동작 그대로(하위호환).
- `override`가 음수/과대값이어도 최종 결과는 `[baseRate, maxRate]`로 안전.
- 순수 함수 유지, 테스트로 스펙 고정.

## 상태 설계 (`src/state/inputs.ts`)

`AppInputs`에 필드 2개 추가.

```ts
leapRateDirect: boolean   // 도약 우대 직접입력 사용 여부
leapRateOverride: number  // decimal 우대 %p (예: 0.008)
```

- `DEFAULT_INPUTS`: `leapRateDirect: false`, `leapRateOverride: 0`.
- encode: 짧은 키 `lrd`(`String(boolean)` → `'true'`/`'false'`), `lro`(`String(decimal)`).
- decode:
  - `lrd` 키가 있으면 `p.get('lrd') === 'true'`, 없으면 `false`(레거시 폴백 — 기존 칩 동작 보존).
  - `lro`는 `num()`으로 파싱, 없으면 `0`.

**encode/decode 양쪽에 반드시 추가** (URL 영속성 규약).

## 연결 설계 (`src/state/selectors.ts`)

`buildSwitchInput`에서 도약 적용금리 계산 분기:

```ts
const leapRate = s.leapRateDirect
  ? appliedRate(leapProduct, s.leapPrefs, s.leapRateOverride)
  : appliedRate(leapProduct, s.leapPrefs)
```

`leapPrefs`는 그대로 넘겨도 override 경로에선 무시되므로 동작에 영향 없음.

## 테스트

- `src/domain/savings.test.ts`(또는 신규 `rates.test.ts`):
  - override 미지정 → 현행 칩 합산 동작과 동일.
  - override 지정 → `baseRate + override`(칩 무시), `maxRate` 클램프 확인.
  - override가 헤드룸 초과 → `maxRate`로 클램프.
- `inputs` encode/decode:
  - `leapRateDirect`/`leapRateOverride` 라운드트립.
  - 레거시 쿼리(`lrd`/`lro` 없음) → `leapRateDirect=false`, override `0`.

## 비목표 (YAGNI)

- 항목별 부분 입력/슬라이더(은행 앱 1:1 모델링) — 채택 안 함.
- 미래적금 직접입력 — 이번 범위 아님.
- "최종 금리 %" 입력 방식 — "총 우대 %p"로 확정.
