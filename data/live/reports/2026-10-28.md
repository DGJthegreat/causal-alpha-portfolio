# Paper Trade Report — 2026-10-28

## Portfolio NAV (paper, started 2026-05-30)

| Account | NAV | Weight |
|---------|-----|--------|
| **TOTAL** | **96.05** | — |
| Options sub-account | 93.53 | 20% |
| Sector rotation sub-account | 96.62 | 50% |
| Straddle sub-account | 104.55 | 5% |
| AI Herd picks (equal-wt 30d) | 95.24 | 25% |

---

## Options Signal (ADX>33 + 7-signal score≥5, T+1 exit)

**ADX_14:** 36.4 ✓ (trending)
**Score:** Bull 1/7, Bear 6/7
**Signal:** PUT
**VIX:** 16.25
**Nifty:** 22699

### 7-Signal Breakdown
  ✗ rsi5_bull
  ✗ spx_prior_week_bull
  ✗ above_ema200
  ✗ crude_bull5
  ✗ nifty_prior_week_bull
  ✗ pcr_fear
  ✓ us10y_falling

### Current Position
No open position

### Next 5 Entry Windows (Mondays)
  2026-11-02: OPEN ✓
  2026-11-09: OPEN ✓
  2026-11-16: OPEN ✓
  2026-11-23: OPEN ✓
  2026-11-30: BLOCKED (2026-12-04)

---

## Sector Rotation (120d momentum top-1, 1x leverage)

**Active sector:** CNXPHARMA (since 2026-08-21)
**ADX gate:** PASS (avg_adx=29.739, threshold=0.40)
**Passing sectors:** cnxpharma

### Sector Rankings (120d return)
```
  cnxpharma    | 120d= +17.2% | today=+1.04% | gate=✓ ← ACTIVE
  cnxenergy    | 120d= +14.6% | today=-0.89% | gate=✗
  cnxit        | 120d=  -4.9% | today=-1.98% | gate=✗
  nsebank      | 120d=  -6.4% | today=+0.54% | gate=✗
  cnxfmcg      | 120d=  -7.2% | today=-0.56% | gate=✗
```

---

## Straddle Gates

**Verdict:** NO-GO
**VIX:** 16.2 | **VRP:** 8.0 | **Nifty 60d:** -6.6%
**Failed gates:** vix_ok
**All gates (7):** vix_ok=✗, fii_ok=✓, vrp_ok=✓, ivix_slope_ok=✓, atr_ok=✓, rate_ok=✓, mom_bleed_ok=✓, calendar_ok=✓

---

## Today's Events

- SECTOR CNXPHARMA: day_ret=+1.04%, 1x (ADX OK) nav=+1.04%
- STRADDLE NO-GO: gates failed: vix_ok
- Herd: 13/13 active priced | mtm=+1.67% | base=93.68 | nav=95.2426

---

## Recent Trades

  [2026-10-27] OPTIONS EXIT PUT: P&L=-22.0% on premium | NAV contrib=-2.64%
  [2026-10-26] OPTIONS ENTRY PUT: spot=22753, score=2/5, adx=41.3
  [2026-09-29] OPTIONS EXIT PUT: P&L=-19.9% on premium | NAV contrib=-0.60%
  [2026-09-28] OPTIONS ENTRY PUT: spot=22780, score=0/7, adx=52.4
  [2026-09-24] STRADDLE EXIT : P&L=+0.0% on premium | NAV contrib=+0.00%
  [2026-09-22] OPTIONS EXIT PUT: P&L=-20.5% on premium | NAV contrib=-0.61%
  [2026-09-21] OPTIONS ENTRY PUT: spot=23414, score=1/6, adx=59.6
  [2026-09-08] OPTIONS EXIT PUT: P&L=-18.3% on premium | NAV contrib=-2.20%
  [2026-09-07] OPTIONS ENTRY PUT: spot=23779, score=1/6, adx=53.0
  [2026-09-01] OPTIONS EXIT PUT: P&L=-19.2% on premium | NAV contrib=-0.58%

---
*Generated: 2026-10-28 16:15:20 | Run: `python3 live/auto_paper_trader.py`*
