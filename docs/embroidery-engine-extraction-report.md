# Embroidery Engine Extraction Report

## Summary

Implemented Phase 1 of the Embroidery API architecture by extracting the current embroidery pricing logic into a reusable engine.

No Embroidery API route was created. No pricing formulas or pricing results were intentionally changed.

## Files Created

- `lib/pricing/embroidery.js`
- `scripts/verify-embroidery-engine-parity.mjs`
- `docs/embroidery-engine-extraction-report.md`

## Files Modified

- `components/products/Embroidery.js`
- `package.json`

## Engine Functions Created

Created:

```js
calculateEmbroideryPricing(input, catalog)
```

The engine preserves the current embroidery behavior:

- SanMar `CASE_PRICE` garment lookup through `calculateApparelLineCost(..., { mode: "embroidery" })`.
- Embroidery stitch matrix.
- Quantity tiers.
- Stitch counts above 15,000.
- Thread color add-ons.
- Names and large names.
- Numbers and large numbers.
- 3mm puff.
- Digitizing fees.
- Handling allowance.
- Cap/flat detection.
- Admin target retail behavior.
- Manual garment mode.

Exported constants:

- `STITCH_MATRIX`
- `PLUS_PER_1K`
- `QTIERS`
- `PLACEMENTS`
- `embroideryPricingConstants`

## Component Refactor

`components/products/Embroidery.js` now calls:

```js
calculateEmbroideryPricing(input, { stylesByKey: styles })
```

The UI controls, selected catalog behavior, admin mode behavior, and summary output shape remain unchanged.

## Parity Results

Added `scripts/verify-embroidery-engine-parity.mjs`.

Covered parity cases:

- Basic left chest embroidery.
- 5,000 stitches.
- 8,000 stitches.
- 15,000+ stitches.
- Thread color add-ons.
- Names and numbers.
- 3mm puff.
- Digitizing required.
- Cap-like item.
- Flat garment item.
- Mixed cap and flat digitizing behavior.

Command run:

```text
npm.cmd run test:pricing
```

Result:

```text
General sign pricing parity passed for 20 cases.
Apparel catalog parity passed for screen printing, DTG, DTF, and embroidery.
Embroidery pricing engine parity passed for 6 cases.
Screen print pricing API response shape passed.
Banner pricing API response shape passed.
Yard sign pricing API response shape passed.
ACM pricing API response shape passed.
Vinyl pricing API response shape passed.
Custom-cut Coroplast pricing API response shape passed.
Vehicle magnet pricing API response shape passed.
```

Build command:

```text
npm.cmd run build
```

Result:

```text
Compiled successfully.
```

## Issues Discovered

- Current embroidery pricing still treats `placements` as summary/review context rather than independently priced additional locations.
- Cap/flat detection remains text-based using product title plus placement text.
- Manual garment mode and target retail override are preserved in the engine for admin parity, but should not be exposed in a public customer API.
- The future API should map the full engine result to customer-safe fields only.

## Next Step

The next phase should create `POST /api/pricing/embroidery` using this engine and the private apparel catalog loader. The API should return customer-safe pricing only and should not expose garment cost, embroidery direct cost, margin, profit, or SanMar `CASE_PRICE`.
