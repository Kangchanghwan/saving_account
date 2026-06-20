# 도약 기납입 금액 입력 + 남은 납입개월 직접 조정

작성일: 2026-06-20

## 배경 / 문제

청년도약계좌 갈아타기 계산기는 현재 `leapMonthsPaid`(기납입 개월) **하나**로 두 가지를 동시에 결정한다.

1. 갈아타기(특별해지) 환급금 원금 = `월납입 × 기납입개월`
2. 유지(KEEP) 시 평가 시점 `keepMonths = min(기납입개월 + 36, 60)` — 즉 남은 납입개월이 `60 − 기납입개월`로 **자동 계산**됨

문제:

- **중간 출금**을 하면 실제 누적 원금이 `월납입 × 개월`보다 작아 환급금이 과대평가된다. 사용자가 실제로 낸 원금을 직접 입력할 방법이 없다.
- **남은 납입개월**이 `60 − 기납입개월`로 고정 추론되어, 만기까지 더 낼 기간을 직접 조정할 수 없다.

## 목표

도약 계좌를 **3개의 독립 입력**으로 표현한다.

1. 기납입 — 입력 방식 토글 `개월 ⇄ 금액`
2. 남은 납입개월 — 별도 슬라이더

비목표(YAGNI): 출금 시점·횟수 모델링, 출금이 이미 받은 기여금에 미치는 정밀 효과. 이자·기여금은 "유효 개월" 기준 추정으로 충분하다.

## 설계

### 1. 기납입 — 개월/금액 토글 (금액 = 유효 개월 환산)

- `개월` 모드: 기존과 동일. 정수 개월 `m`을 직접 입력(슬라이더 0~60, step 1).
- `금액` 모드: 원금 `P`를 입력(슬라이더 0 ~ `월납입 × 60`, "○○○만원" 표기). 내부적으로 **유효개월** `m = P / 월납입`(소수 허용)로 환산해 기존 계산식에 그대로 흘려보낸다.
  - 환급금 원금 = `월납입 × m` = 입력 금액 `P`와 정확히 일치
  - 이자·기여금은 이 유효개월 `m`으로 추정 (`installmentInterest`는 소수 `m`에서도 `m(m+1)/2`로 동작)
- 출금분은 자연스럽게 "덜 낸 개월"로 반영되어 갈아타기·유지 양쪽에 일관 적용된다.

`월납입 = 0`인 경계: 금액 모드에서 `월납입 = 0`이면 `m = 0`으로 처리(0 나눗셈 방지).

### 2. 남은 납입개월 (별도 슬라이더)

- 슬라이더 0~60개월, step 1. 기본값 = `60 − 기납입개월`(현재 동작과 동일).
- **60개월 클램프**: 총 납입 `기납입개월 + 남은개월`은 도약 법정 최대 60개월로 제한.
  - 남은개월 슬라이더의 유효 최대 = `60 − 기납입개월`. 기납입개월이 바뀌면 초과분은 클램프.
- 계산 영향:
  - `keepMonths = 기납입개월 + min(36, 남은개월)` — 현재의 `min(m+36, 60)`을 일반화.
  - 도약 만기 표기액(`leapFullMaturity`) = `기납입개월 + 남은개월` 개월 기준 (기존 고정 60 → 가변).

### 3. 상태 / URL

`AppInputs`에 추가:

| 필드 | 타입 | 기본값 | URL 키 |
|---|---|---|---|
| `leapPaidMode` | `'months' \| 'amount'` | `'months'` | `lpm` |
| `leapPaidAmount` | `number`(원) | `700_000 * 14` | `lpa` |
| `leapMonthsRemaining` | `number` | `46` (= 60 − 14) | `lmr` |

- 기존 `leapMonthsPaid`는 유지(개월 모드의 source of truth).
- `encodeInputs`/`decodeInputs`에 세 키 추가.

### 4. 도메인 / selector

- `SwitchInput`에 `leapMonthsRemaining: number` 추가.
- `selectors.buildSwitchInput`:
  - 유효 기납입개월 `effPaid = leapPaidMode === 'amount' ? (leapMonthly > 0 ? leapPaidAmount / leapMonthly : 0) : leapMonthsPaid`
  - `leapMonthsRemaining`은 `min(leapMonthsRemaining, max(0, 60 − effPaid))`로 클램프해 전달.
  - `leapMonthsPaid: effPaid` 로 전달.
- `compare.ts`:
  - 상수 `LEAP_TERM = 60` 은 클램프 상한으로만 사용.
  - `keepMonths = input.leapMonthsPaid + min(HORIZON, input.leapMonthsRemaining)` (총합은 이미 60 이하로 클램프됨).
  - `leapFullMaturity` months = `min(input.leapMonthsPaid + input.leapMonthsRemaining, LEAP_TERM)`.
  - 나머지(환급금, 미래적금, 남긴현금)는 변경 없음.

### 5. UI (ScenarioControls)

- 기납입 컨트롤: 상단에 `개월 | 금액` 세그먼트 토글. 선택 모드에 따라 슬라이더 단위/최대/표기 전환.
  - 개월: max 60, step 1, "N개월"
  - 금액: max `leapMonthly * 60`, step 10_000, "○○○만원"
- 남은 납입개월: 별도 슬라이더, max = `60 − 기납입개월`(클램프), step 1, "N개월".
- 두 컨트롤 모두 `switchMode`에서만 노출(기존 도약 컨트롤과 동일).

## 테스트

- `savings`/`compare` 단위 테스트: 소수 유효개월에서 환급금 원금 = 입력 금액 일치, `keepMonths`·`leapFullMaturity`가 남은개월 반영 및 60 클램프 동작.
- `inputs` 테스트: 신규 3필드 encode/decode 라운드트립, 기본값.
- 회귀: 개월 모드 + 남은개월=60−m 기본값에서 기존 결과와 동일해야 함.

## 영향 파일

- `src/state/inputs.ts` — 필드 3개, encode/decode
- `src/domain/types.ts` — `SwitchInput.leapMonthsRemaining`
- `src/state/selectors.ts` — 유효개월 환산 + 클램프
- `src/domain/compare.ts` — keepMonths / leapFullMaturity 가변화
- `src/components/ScenarioControls.tsx` — 토글 + 남은개월 슬라이더
- 관련 테스트 파일들
