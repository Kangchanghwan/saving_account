# 입력부 좌우 2단 분리 + 도약 월납입 입력 단순화

날짜: 2026-06-20

## 배경 / 문제

1. **입력부 좌우 섞임** — `ScenarioControls`의 단일 그리드(`.ctrl-grid`)가 도약·미래 입력을 번갈아 배치(은행→은행→소득→기여금→납입→납입…). 결과 박스(`ComparisonBoxes`)는 이미 ①도약 / ②미래로 좌우 분리돼 있는데 입력부만 안 나뉘어 시각적으로 섞여 보임.
2. **도약 월납입 입력이 과도하게 복잡** — 도약 한쪽에만 컨트롤 5~6개: `(과거)월납입액` + `기납입 입력(개월/금액 토글)` + `기납입 개월` + `기납입 금액` + `추가 월납입액` + `남은 납입개월`. "과거 납입 + 미래 추가납입" 2단계 모델 때문. 도약은 만기 60개월 고정이라는 점을 활용하면 단순화 가능.

## 결정 (사용자 승인)

도약 입력은 **Option A**: `월 납입액` + `기납입 개월` 2개만. 남은개월 = `60 − 기납입` 자동.

## 설계

### 1. 입력부 좌우 2단 분리 (도약 좌 / 미래 우)

`ScenarioControls`를 두 컬럼 패널로 재구성. 결과 박스의 도약/미래 좌우 배치와 일치시킴.

```
┌─ 도약계좌 ──────────┐  ┌─ 미래적금 ──────────┐
│ 은행                │  │ 은행                │
│ 소득구간 (기여금)    │  │ 정부기여금          │
│ 월 납입액  [슬라이더] │  │ 월 납입액  [슬라이더] │
│ 기납입 개월 [슬라이더]│  │                     │
│ 도약 우대금리 [칩]   │  │ 미래 우대금리 [칩]   │
└────────────────────┘  └────────────────────┘
```

- 각 컬럼은 헤더(`도약계좌` / `미래적금`) + 해당 제품 입력 + 해당 제품 우대금리 칩으로 구성. 우대금리 칩 블록을 컬럼 안으로 이동.
- `new`(신규) 모드: 도약 컬럼 숨기고 미래 컬럼만 표시 (결과가 단독 박스인 것과 일관).
- 반응형: ≤640px에서 세로 스택.
- 결과 박스(`ComparisonBoxes`)는 변경 없음.

### 2. 도약 입력 단순화 — 도메인은 불변

**핵심 원칙: 도메인 수학(`leapTwoPhaseMaturity`, `compare.ts`)은 손대지 않는다.** 단일 금액을 "과거=미래=같은 금액, 남은개월=60−기납입"으로 2단계 모델에 먹이면 단일납입과 수학적으로 동일(메모리 회귀 항등식). 따라서 도메인 테스트 전부 그대로 통과.

**`state/inputs.ts`**
- 제거 필드: `leapPaidMode`, `leapPaidAmount`, `leapFutureMonthly`, `leapMonthsRemaining`
- 유지 필드: `leapMonthly`, `leapMonthsPaid`
- `encodeInputs`/`decodeInputs`에서 `lpm`/`lpa`/`lfm`/`lmr` 키 제거
- `DEFAULT_INPUTS`에서 제거 필드 삭제

**`state/selectors.ts`** — `buildSwitchInput`:
- `leapAvgMonthly = leapMonthly`
- `leapMonthsPaid = max(0, leapMonthsPaid)`
- `leapMonthsRemaining = max(0, 60 − leapMonthsPaid)`
- `leapFutureMonthly = leapMonthly`
- 기존 `leapPaidMode`/`leapPaidAmount` 분기 제거

**`components/ScenarioControls.tsx`**
- 도약 컬럼 슬라이더: `월 납입액`(leapMonthly), `기납입 개월`(leapMonthsPaid, max 60)
- 제거 위젯: 개월/금액 `.seg` 토글, 기납입 금액 슬라이더, 추가 월납입액 슬라이더, 남은 납입개월 슬라이더
- 남은개월은 슬라이더 없이 `60 − 기납입` 텍스트 안내로만 표시 (예: "남은 46개월 · 만기 60개월")

**`App.tsx`**
- `new` 모드 `calcInputs` 보정에서 제거 필드 참조 정리 (현재 `leapMonthsPaid: 0`만 사용하므로 영향 적음 — 확인 후 유지)

### 3. 하위호환 & 테스트

- 옛 공유 URL의 `lpm/lpa/lfm/lmr` 잔여 파라미터는 무시됨 → 깨지지 않고 기본값 동작.
- 도메인 테스트(`src/domain/*.test.ts`): 변경 없음, 그대로 통과해야 함.
- 상태 레이어에 제거 필드를 참조하는 테스트가 있으면 그 부분만 업데이트.
- 검증: `npm run build`(tsc) 통과 + `npm test` 통과 + 도약 좌 / 미래 우 2단 렌더 확인.

## 비선택 대안

- 도메인에서 2단계 모델 자체 제거 — 잘 테스트된 코드를 깨고 회귀 위험만 커서 비채택. 상태 레이어만 축소하는 것이 안전.
