# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Korean-language single-page calculator (`청년적금 갈아타기 손익계산기`) that compares whether a user should keep their existing **청년도약계좌** (Youth Leap Account, 60-month term) or switch ("갈아타기") to a new **청년미래적금** (Youth Future Savings, 36-month term). It computes a side-by-side profit/loss over a 36-month horizon. No backend — all state lives in the URL query string. Deployed to Vercel (Vite framework preset, `dist` output).

## Commands

```bash
npm run dev          # Vite dev server
npm run build        # tsc -b && vite build
npm run lint         # eslint
npm test             # vitest run (one-shot)
npm run test:watch   # vitest watch
npx vitest run src/domain/savings.test.ts   # single test file
npx vitest run -t "name of test"            # single test by name
```

Vitest uses `jsdom` + globals (configured in `vite.config.ts`); no separate test setup file.

## Architecture

Strict one-way dependency flow — keep it this way:

```
data/  →  domain/  →  state/  →  components/ → App.tsx
```

- **`src/domain/`** — pure financial math, zero React/DOM. This is the heart of the app and the most heavily tested layer.
  - `savings.ts` — installment simple-interest formulas. `phaseInterest(monthly, rate, count, tail)` is the primitive: `count` months of deposits, each accruing for an extra `tail` months after its own phase ends, using the triangular-sum coefficient `S(x)=x(x+1)/2`. `leapTwoPhaseMaturity` models the Leap account as **two contribution phases** (past avg-monthly deposits + future monthly deposits) — see the memory note on this two-phase model. Government contributions (`정부기여금`) are computed per-product: `leapMonthlyContribution` (two-tier income-bracket matching) and `futureMonthlyContribution` (flat rate with a cap). All amounts assumed tax-free.
  - `compare.ts` — `compareSwitch()` is the top-level domain entry point. Horizon is fixed at 36 months, Leap term at 60. Computes KEEP total (Leap evaluated at the 36-mo horizon), SWITCH total (Leap special-cancellation refund reinvested + Future maturity + retained cash from the monthly deposit difference), and `profit = switchTotal − keepTotal`.
  - `rates.ts` — `appliedRate()` sums checked preferential bonuses onto the base rate, clamped to `maxRate`.
  - `types.ts` — all domain interfaces (`MaturityInput/Result`, `SwitchInput/Result`, `LeapBracket`, `FutureContribType`). Has detailed Korean field-doc comments; read these before touching the math.

- **`src/data/`** — static product data (plain consts, no logic). `banks.ts` (per-bank base/max rates + preferential-rate lists; some flagged `defaultChecked` for the link-bonus auto-check), `leapBrackets.ts` (income-bracket matching table — values verified against `docs/research/bank-rate-data.md`), `products.ts` (term/monthly-cap metadata).

- **`src/state/`** — bridges UI inputs to domain inputs.
  - `inputs.ts` — `AppInputs` shape, `DEFAULT_INPUTS`, and `encodeInputs`/`decodeInputs` for URL-query persistence. **Every new input field must be added to both encode and decode** (short 2-3 char keys, e.g. `leapMonthly`→`lm`). `decodeInputs` also carries a **legacy fallback**: when the `lim` (leapInputMode) key is absent, old links are inferred as `'monthly'` if they carry `lm`/`lmp`, else fall back to the default — preserve this when changing input modes so shared URLs don't break.
  - `selectors.ts` — `buildSwitchInput()` translates `AppInputs` into the domain `SwitchInput` (resolves bank/bracket lookups, computes the Leap inputs, clamps remaining months to `[0, 60]`). It branches on `leapInputMode`: in **`balance`** mode (the default) the user enters paid principal + remaining months + future monthly, and `leapAvgMonthly` is derived as `paidPrincipal / monthsPaid` where `monthsPaid = 60 − remaining`; in **`monthly`** mode they enter a single monthly figure + months paid, used for both past and future contributions.

- **`src/App.tsx`** — single stateful component. Holds `AppInputs` in `useState` (initialized from `window.location.search`), syncs it back to the URL via `history.replaceState` on every change. Two modes: `switch` (갈아타기 comparison) and `new` (신규 — zeroes out Leap inputs since new Leap signups are closed, and strips link-bonus preferentials). Recomputes `compareSwitch` on every render — cheap, no memoization needed.

- **`src/components/`** — presentational. `ScenarioControls` (all the input widgets), `DiffBanner`/`ComparisonBoxes` (result display), `ModeTabs`, `RateChecklist`, `Disclaimer`. `format.ts` holds Korean number formatters (e.g. `manwon`).

## Conventions

- Domain code is pure and unit-tested; **add/adjust tests in the matching `*.test.ts` when changing any formula**. The math is subtle (interest accrual tails, two-phase Leap, bracket matching) — tests are the spec.
- Money is integer won throughout; round at calculation boundaries (`Math.round`), not in display.
- Comments and UI copy are in Korean; match the existing style.
- Planning/spec docs for features live in `docs/superpowers/{plans,specs}/` — check there for the rationale behind the Leap two-phase model and the paid-amount/remaining-months inputs before reworking them.
