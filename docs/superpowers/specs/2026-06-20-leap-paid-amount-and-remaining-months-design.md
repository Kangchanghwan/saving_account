# 도약 기납입(금액/개월) + 추가 월납입 + 남은 납입개월

작성일: 2026-06-20

## 배경 / 문제

청년도약계좌 갈아타기 계산기는 현재 도약 계좌를 **단일 월납입액 `leapMonthly` × 기납입개월 `leapMonthsPaid`** 로만 모델링한다. 그래서:

- **중간 출금**을 반영할 수 없다. 실제 누적 원금이 `월납입 × 개월`보다 작아도 입력할 방법이 없어 환급금이 과대평가된다.
- 도약을 계속 유지할 때 **앞으로 낼 월납입액을 과거와 다르게** 둘 수 없다(예: 지금까지 67.5만원 냈지만 앞으로는 형편상 30만원).
- **남은 납입개월**이 `60 − 기납입개월`로 고정 추론되어 직접 조정할 수 없다.

사용자가 첨부한 참조 HTML(`도약계좌_미래적금_신한_최종비교.html`)은 도약을 **2단계**로 모델링한다: 기존 납입분(28개월, 월평균 67.5만원) + 잔여 32개월 추가 납입(별도 조정). 이 모델을 반영한다.

## 목표

도약 계좌를 다음 입력으로 표현한다.

1. **기납입** — 개월 `⇄` 금액 토글 (출금 반영)
2. **추가 월납입액** — 남은 기간 매달 낼 금액 (과거와 다를 수 있음)
3. **남은 납입개월** — 만기까지 더 낼 개월

비교 평가 시점(36개월 호라이즌, 동일 시점 비교)은 **변경하지 않는다**. 참조 HTML은 KEEP=60개월 만기 / SWITCH=각자 만기에서 "수익만" 비교하지만, 현행 앱의 동일-시점 비교가 더 엄밀하므로 유지한다.

비목표(YAGNI): 출금 시점·횟수 모델링, 출금이 이미 받은 기여금에 미치는 정밀 효과. 과거분 이자·기여금은 "평균 월납입" 기준 근사로 충분하다.

## 도메인 모델

### 2단계 적립 (과거분 + 미래분)

도약 KEEP/만기 평가는 두 구간의 합으로 계산한다.

- **과거분**: `평균월납입(avgMonthly)`을 `기납입개월(mPaid)` 동안 납입. 월 1..mPaid.
- **미래분**: `추가월납입(futureMonthly)`을 남은 개월 동안 납입. 월 mPaid+1..T.
- 총 기간 `T = mPaid + 남은개월(R)` (단, **60개월 클램프**).

#### 평균월납입(avgMonthly) 산출

- 개월 모드: `avgMonthly = leapMonthly` (기존 '도약 월 납입액' 슬라이더), 과거 원금 = `leapMonthly × mPaid`.
- 금액 모드: `avgMonthly = mPaid > 0 ? leapPaidAmount / mPaid : 0`, 과거 원금 = `leapPaidAmount`(입력값과 정확히 일치). 출금분이 낮아진 평균으로 반영됨.

`mPaid = 0` 또는 `leapMonthly = 0` 경계는 0으로 처리(0 나눗셈 방지).

### 적립식 단리 이자 — 구간 헬퍼

기존 `installmentInterest(monthly, rate, n) = monthly·(rate/12)·n(n+1)/2` 를 일반화한다.

```
// count개월 연속 납입분의 단리 이자. 각 납입분이 자기 구간 종료 후
// tail개월을 더 적립하는 경우(뒤에 다른 구간이 이어질 때).
phaseInterest(monthly, rate, count, tail)
  = monthly · (rate/12) · ( S(tail+count) − S(tail) ),  단 S(x)=x(x+1)/2
```

- 미래분 이자 = `phaseInterest(futureMonthly, rate, futureCount, 0)` = 기존 `installmentInterest`.
- 과거분 이자 = `phaseInterest(avgMonthly, rate, mPaid, futureCount)` (과거 납입분이 미래 구간만큼 더 적립).
- `tail=0`일 때 기존 공식과 동일 → 단일구간(환급금·미래적금)은 회귀 보존.

### 계산별 적용

`HORIZON = 36`, `LEAP_TERM = 60`(클램프 상한).

- **leapRefund (갈아타기 특별해지 환급금)** — 단일구간, 과거분만.
  - 원금 = `avgMonthly × mPaid` (= 금액모드 입력값)
  - 이자 = `installmentInterest(avgMonthly, leapAppliedRate, mPaid)` *(현행 환급금 금리 적용 방식 유지)*
  - 기여금 = `leapMonthlyContribution(avgMonthly) × mPaid`, 기여금이자 = `installmentInterest(그, leapBaseRate, mPaid)`
- **keep (유지, 36개월 호라이즌 시점)** — 2단계.
  - `futureCountInHorizon = min(R, HORIZON)`, `keepMonths = mPaid + futureCountInHorizon`
  - 원금 = `avgMonthly·mPaid + futureMonthly·futureCountInHorizon`
  - 이자 = `phaseInterest(avgMonthly, rate, mPaid, futureCountInHorizon) + phaseInterest(futureMonthly, rate, futureCountInHorizon, 0)`
  - 기여금 = `leapContrib(avgMonthly)·mPaid + leapContrib(futureMonthly)·futureCountInHorizon`, 기여금이자 동일 2단계(baseRate)
- **leapFullMaturity (도약 만기 표기액)** — 2단계, 전체 기간.
  - `futureCountFull = min(R, LEAP_TERM − mPaid)`, 총 = `mPaid + futureCountFull`(≤60)
  - 위와 동일 공식에 `futureCountFull` 사용
- **futureMaturity / retainedCash / v0 재예치** — 변경 없음.

> 주의: `retainedCash`(남긴 현금)는 현재 `leapMonthly − futureMonthly`로 계산된다. 2단계 도입 후에도 "갈아탔다면 도약에 안 넣었을 월 여유분"은 과거 기준 월납입 = `avgMonthly`로 본다 → `max(0, avgMonthly − futureMonthly)`. (개월 모드에선 avgMonthly=leapMonthly로 기존과 동일.)

## 상태 / URL (`src/state/inputs.ts`)

`AppInputs` 추가/변경:

| 필드 | 타입 | 기본값 | URL 키 |
|---|---|---|---|
| `leapPaidMode` | `'months' \| 'amount'` | `'months'` | `lpm` |
| `leapPaidAmount` | `number`(원) | `9_800_000` (= 700,000×14) | `lpa` |
| `leapFutureMonthly` | `number`(원) | `700_000` | `lfm` |
| `leapMonthsRemaining` | `number` | `46` (= 60 − 14) | `lmr` |

- 기존 `leapMonthly`(도약 월 납입액), `leapMonthsPaid` 유지.
- `encodeInputs`/`decodeInputs`에 네 키 추가.

## selector (`src/state/selectors.ts`)

`buildSwitchInput`에서 파생:

- `mPaid = leapMonthsPaid`
- `avgMonthly = leapPaidMode === 'amount' ? (mPaid > 0 ? leapPaidAmount / mPaid : 0) : leapMonthly`
- `R = clamp(leapMonthsRemaining, 0, max(0, LEAP_TERM − mPaid))`
- `SwitchInput`로 전달: `leapAvgMonthly = avgMonthly`, `leapFutureMonthly`, `leapMonthsRemaining = R`, `leapMonthsPaid = mPaid`.

## 타입 (`src/domain/types.ts`)

`SwitchInput`:
- `leapMonthly` → **`leapAvgMonthly`** 로 의미 명확화(과거 평균 월납입). *(또는 `leapMonthly` 유지하되 주석으로 의미 변경)*
- `leapFutureMonthly: number` 추가
- `leapMonthsRemaining: number` 추가

`SwitchResult`의 `keepMonths` 의미 갱신(주석): `mPaid + min(36, R)`.

## UI (`src/components/ScenarioControls.tsx`)

switchMode 도약 컨트롤 영역:

1. **기납입** — `개월 | 금액` 세그먼트 토글
   - 개월: 슬라이더 0~60, step 1, "N개월"
   - 금액: 슬라이더 0 ~ `leapMonthly×60`, step 10,000, "○○○만원"
   - (개월 모드에서도 `leapMonthsPaid` 슬라이더 노출 — 금액 모드에선 개월 슬라이더 + 금액 슬라이더 동시 노출하여 avgMonthly 산출)
2. **추가 월납입액** — 슬라이더 0~700,000, step 10,000, "○○○만원" (`leapFutureMonthly`)
3. **남은 납입개월** — 슬라이더 0 ~ `60 − mPaid`(클램프), step 1, "N개월" (`leapMonthsRemaining`)

기존 '도약 월 납입액'(`leapMonthly`) 슬라이더는 "도약 (과거) 월 납입액"으로 라벨 명확화. 세그먼트 토글은 작은 버튼 2개(.seg) 스타일 신규 추가.

## 테스트

- `savings`: `phaseInterest` 단위 — `tail=0`이 기존 `installmentInterest`와 일치, 2구간 합이 명시값과 일치(워크드 예제).
- `compare`:
  - 회귀: 개월 모드 + `futureMonthly=leapMonthly` + `R = 60−mPaid` 에서 **기존 결과와 동일**.
  - 금액 모드: `leapPaidAmount` 입력 시 환급금 원금 = 입력값.
  - 추가월납입 ≠ 과거: keep 원금/이자가 2단계 반영.
  - 남은개월 + mPaid > 60 → 60 클램프.
- `inputs`: 신규 4필드 encode/decode 라운드트립, 기본값.

## 영향 파일

- `src/state/inputs.ts` — 필드 4개, encode/decode
- `src/domain/types.ts` — `SwitchInput` 필드(평균/추가/남은)
- `src/domain/savings.ts` — `phaseInterest` 헬퍼(2단계 이자)
- `src/state/selectors.ts` — avgMonthly 환산 + R 클램프
- `src/domain/compare.ts` — leap 계산 2단계화(keep / fullMaturity / refund / retainedCash)
- `src/components/ScenarioControls.tsx` — 토글 + 추가월납입 + 남은개월 슬라이더
- 관련 테스트 파일들 (`savings.test.ts`, `compare.test.ts`, `inputs.test.ts`)
