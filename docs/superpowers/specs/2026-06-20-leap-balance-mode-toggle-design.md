# 도약 입력 "잔액 기준" 모드 토글 (월납입 기준 ⇄ 잔액 기준)

날짜: 2026-06-20

## 배경 / 문제

현재 도약계좌 입력은 `월 납입액(leapMonthly)` + `기납입 개월(leapMonthsPaid)` 2개로,
누적 원금을 `월납입 × 개월`로 **추정**한다(`b3ee681`에서 단순화). 하지만 실제 사용자는
매달 동일 금액을 넣지 않는다 — 중간 출금·증액·감액이 있어 "지금까지 실제로 쌓인 잔액"과
"앞으로 남은 개월"을 **직접 아는** 경우가 많다. 사용자의 참조 HTML
(`도약계좌_미래적금_신한_최종비교.html`)도 기납입 원금 `1,890만원`을 직접 기입하고
잔여 `32개월`을 입력하는 방식이다.

> 히스토리 주의: 이 "금액/남은개월" 입력은 과거에 한 번 있었다가
> `b3ee681`("도약 월납입 입력 단순화")에서 **의도적으로 제거**됐다. 제거 이유는 기능 자체가
> 아니라 **UX 복잡도** — 도약 한쪽에 컨트롤이 5~6개(월납입 + 개월/금액 토글 + 개월 + 금액 +
> 추가월납입 + 남은개월)가 동시에 노출됐기 때문. 본 설계는 그 복잡도를 **상위 모드 토글**로
> 해결한다: 한 번에 한 모드의 컨트롤 세트(2개 또는 3개)만 보인다.

## 목표

도약 입력에 **상위 세그먼트 토글**을 둔다:

- **월납입 기준** (기존): `월 납입액` + `기납입 개월` — 변경 없음
- **잔액 기준** (신규, 기본값): `지금까지 입금된 원금` + `남은 개월` + `향후 월 납입액`

평가 시점(36개월 호라이즌, 동일-시점 비교)·도메인 수학은 **변경하지 않는다**.

비목표(YAGNI): 출금 시점/횟수 모델링, 과거 구간 내 월별 변동의 정밀 반영. 과거분은
"평균 월납입 = 잔액 ÷ 경과개월" 근사로 충분하다.

## 도메인 (변경 없음)

`SwitchInput`은 이미 4개 필드를 분리 보유하고 `compareSwitch`가 2단계 모델
(`leapTwoPhaseMaturity`)로 평가한다:

- `leapAvgMonthly` — 과거 평균 월납입 (원금 = avg × mPaid)
- `leapMonthsPaid` — 기납입 개월
- `leapFutureMonthly` — 남은 기간 추가 월납입
- `leapMonthsRemaining` — 남은 납입개월 (compare 내부에서 `60 − mPaid` 클램프)

두 모드는 이 4개 값을 **어떻게 산출하느냐**만 다르다. `src/domain/*`는 손대지 않는다.

## 상태 / URL (`src/state/inputs.ts`)

`AppInputs`에 신규 필드 4개 추가(기존 `leapMonthly`/`leapMonthsPaid` 유지):

| 필드 | 타입 | 기본값 | URL 키 | 비고 |
|---|---|---|---|---|
| `leapInputMode` | `'monthly' \| 'balance'` | `'balance'` | `lim` | 상위 토글 |
| `leapPaidPrincipal` | `number`(원) | `9_800_000` | `lpp` | 잔액모드 기납입 원금 |
| `leapMonthsRemaining` | `number` | `46` | `lmr` | 잔액모드 남은 개월 |
| `leapFutureMonthly` | `number`(원) | `700_000` | `lfm` | 잔액모드 향후 월납입 |

- 기본값은 월납입 기준 기본값(`leapMonthly=700,000`, `leapMonthsPaid=14`)과 **수치적으로 등가**:
  `남은 46개월 → 경과 14개월`, `원금 9,800,000 ÷ 14 = 700,000`, `향후 700,000`.
  → 모드를 바꿔도 기본 상태에서 결과가 동일(회귀 테스트 기준점).
- `encodeInputs`/`decodeInputs` 양쪽에 4개 키 추가 (CLAUDE.md 규칙).

### 하위호환 (decode 폴백)

기본 모드가 `balance`이지만, **예전에 공유된 월납입 기준 URL**(`lim` 없음)이 깨지지 않게
디코드 시 추론한다:

```
- query 비어있음            → DEFAULT_INPUTS (balance, 신규 방문자)
- lim 있음                  → 그 값 사용
- lim 없고 lmp 또는 lm 있음  → 'monthly' (레거시 공유 링크 보존)
- 그 외(파라미터 있으나 도약 키 없음) → 'balance'
```

`leapPaidPrincipal`/`leapMonthsRemaining`/`leapFutureMonthly`가 URL에 없으면 각 기본값.

## selector (`src/state/selectors.ts`)

`buildSwitchInput`에서 모드 분기. 둘 다 동일한 `SwitchInput`을 만든다:

```
monthly 모드 (현행 그대로):
  mPaid      = max(0, leapMonthsPaid)
  avgMonthly = leapMonthly
  future     = leapMonthly
  remaining  = max(0, 60 − mPaid)

balance 모드 (신규):
  remaining  = clamp(leapMonthsRemaining, 0, 60)
  mPaid      = 60 − remaining
  avgMonthly = mPaid > 0 ? round(leapPaidPrincipal / mPaid) : 0   // 0 나눗셈 가드
  future     = leapFutureMonthly
```

→ `SwitchInput`: `leapAvgMonthly=avgMonthly`, `leapMonthsPaid=mPaid`,
`leapFutureMonthly=future`, `leapMonthsRemaining=remaining`. 나머지(금리·구간·미래적금) 동일.

## UI (`src/components/ScenarioControls.tsx`)

도약 컬럼(`switchMode`일 때만 표시) 구조:

```
┌─ 도약계좌 ────────────────────────┐
│ 은행            소득구간(기여금)    │   ← 공통 (두 모드 모두)
│ [ 월납입 기준 | 잔액 기준 ]  세그먼트│   ← 신규 상위 토글
│ ── monthly 모드 ──                │
│   월 납입액      [슬라이더]        │
│   기납입 개월    [슬라이더]        │
│   "남은 46개월 · 만기 60개월"      │
│ ── balance 모드 ──                │
│   지금까지 입금된 원금 [숫자입력 만원]│
│   남은 개월      [슬라이더 0~60]   │
│   향후 월 납입액 [슬라이더] [평균적용]│
│   "경과 14개월 · 추정 평균 70만원/월"│
│ 도약 우대금리 [칩]                 │   ← 공통
└──────────────────────────────────┘
```

- **세그먼트 토글**: 버튼 2개(`.seg` 신규 스타일, `b3ee681`에서 제거됐던 패턴 재도입).
  선택 모드만 활성화 스타일.
- **모드별 컨트롤은 조건부 렌더** — 한 번에 한 세트만 보여 복잡도를 낮춘다(과거 제거 사유 해소).
- **지금까지 입금된 원금**: 슬라이더가 아닌 **숫자 입력**(만원 단위). 1,890 같은 값에는
  슬라이더가 너무 거칠다. 입력 1,890 → 상태 18,900,000. `format`의 만원 변환 활용.
- **남은 개월**: 슬라이더 0~60, step 1. 경과개월 = `60 − 값` 힌트 표시.
- **향후 월 납입액**: 슬라이더 0~`PRODUCTS.leap.monthlyMax`, step 10,000.
  - 사용자 선택안 "기본값 = 추정 평균"은 다음으로 구현(자동 dirty-tracking 없이 단순화):
    - 잔액모드의 향후 월납입 **초기 기본값**은 추정 평균(`9,800,000/14 = 700,000`).
    - 원금·남은개월을 바꿔 추정 평균이 달라지면, 힌트에 현재 추정 평균을 보여주고
      **`평균 적용` 버튼**으로 `leapFutureMonthly = round(leapPaidPrincipal / mPaid)`로 재동기화.
    - 즉 추정 평균은 "제안"이고, 향후 월납입은 항상 명시적 저장값. 예측 가능하고 URL 공유에 안전.
- `new`(신규) 모드: 도약 컬럼은 기존대로 숨김. 토글도 안 보임.

## App.tsx

- 신규 모드에서 도약 입력을 0으로 보정하는 기존 로직 점검: `leapInputMode`와 무관하게
  도약 컬럼이 숨겨지므로 영향 적음. 보정이 `leapMonthsPaid: 0` 등을 쓰면 잔액모드 신규필드도
  무해한 기본값으로 두면 됨(도약 결과 미표시).

## 테스트

- `inputs.test.ts`:
  - 신규 4필드 encode/decode 라운드트립, 기본값.
  - decode 폴백: `lim` 없고 `lmp` 있는 레거시 쿼리 → `monthly`. 빈 쿼리 → `balance`.
- `selectors`(있으면, 없으면 신규 `selectors.test.ts`):
  - balance 모드: 원금 18,900,000 + 남은 32 → mPaid 28, avg = round(18,900,000/28)=675,000.
  - balance 모드 mPaid=0(남은 60) → avg 0 (0 나눗셈 가드).
  - **등가 회귀**: 두 모드 기본값이 동일 `SwitchInput`을 생성(avg=future=700,000, mPaid=14,
    remaining=46).
- 도메인 테스트: **변경 없음**, 그대로 통과.

## 영향 파일

- `src/state/inputs.ts` — 필드 4개 + encode/decode + 폴백
- `src/state/selectors.ts` — 모드 분기 (avg 산출, 클램프)
- `src/components/ScenarioControls.tsx` — 세그먼트 토글 + 모드별 조건부 컨트롤 + 숫자입력 + 평균적용
- `src/components/ScenarioControls.tsx` 또는 CSS — `.seg` 토글 스타일 재도입
- 관련 테스트 (`inputs.test.ts`, `selectors.test.ts`)
- `src/domain/*` — **변경 없음**

## 비선택 대안

- **두 방식 중 하나만(잔액 기준으로 완전 교체)**: 기존 월납입 사용자/공유 URL 단절. 토글이 더 안전.
- **자동 dirty-tracking으로 향후 월납입 실시간 동기화**: 상태 복잡도↑, URL 공유 시 모호.
  명시적 `평균 적용` 버튼이 단순하고 예측 가능.
- **도메인 2단계 모델 제거/변경**: 잘 테스트된 코드를 깰 이유 없음. 상태/UI만 확장.
