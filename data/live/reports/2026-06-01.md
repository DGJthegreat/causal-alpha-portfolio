# Paper Trade Report — 2026-06-01

## Portfolio NAV (paper, started 2026-05-30)

| Account | NAV | Weight |
|---------|-----|--------|
| **TOTAL** | **98.11** | — |
| Options sub-account | 100.00 | 20% |
| Sector rotation sub-account | 96.21 | 50% |
| Straddle sub-account | 100.00 | 5% |
| Idle (liquid fund @7.5%) | 100.03 | 25% |

---

## Options Signal (ADX>33 + 7-signal score≥5, T+1 exit)

**ADX_14:** 32.3 ✗ (choppy — no trade)
**Score:** Bull 1/7, Bear 6/7
**Signal:** PUT
**VIX:** 16.26
**Nifty:** 23560

### 7-Signal Breakdown
  ✗ rsi5_bull
  ✗ spx_prior_week_bull
  ✓ above_ema200
  ✗ crude_bull5
  ✗ nifty_prior_week_bull
  ✗ pcr_fear
  ✗ us10y_falling

### Current Position
No open position

### Next 5 Entry Windows (Mondays)
  2026-06-08: OPEN ✓
  2026-06-15: BLOCKED (2026-06-17)
  2026-06-22: OPEN ✓
  2026-06-29: OPEN ✓
  2026-07-06: OPEN ✓

---

## Sector Rotation (120d momentum top-1, 2x leverage)

**Active sector:** CNXENERGY (since 2026-05-30)
**VIX gate:** FAIL
**Passing sectors:** 

### Sector Rankings (120d return)
```
  cnxenergy    | 120d= +14.5% | today=-0.65% | gate=✗ ← ACTIVE
  cnxpharma    | 120d=  +9.7% | today=+0.09% | gate=✗
  nsebank      | 120d=  -6.0% | today=-0.37% | gate=✗
  cnxfmcg      | 120d=  -9.0% | today=-1.13% | gate=✗
  cnxit        | 120d= -21.3% | today=+3.57% | gate=✗
```

---

## Straddle Gates

**Verdict:** GO
**VIX:** 16.3
**Failed gates:** none
**All gates:** vix_ok=✓, fii_ok=✓, atr_ok=✓, rate_ok=✓, calendar_ok=✓

---

## Today's Events

- OPTIONS SKIP (Monday): ADX=32.3<33.0
- SECTOR CNXENERGY: day_ret=-0.65%, 1x (VIX FAIL→1x) nav=-0.65%
- STRADDLE ENTRY: spot=23560, VIX=16.3, est.premium=946pts (4.01%), expiry=2026-06-25, DTE=24

---

## Recent Trades

  [2026-06-01] STRADDLE ENTRY : spot=0, score=?/?, adx=0.0

---
*Generated: 2026-06-01 11:30:54 | Run: `python3 live/auto_paper_trader.py`*
