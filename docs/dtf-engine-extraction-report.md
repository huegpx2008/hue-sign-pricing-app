# DTF Engine Extraction Report

## Summary

Phase 1 extracted DTF pricing from `components/products/DTFTransfers.js` into a reusable pure pricing engine:

```text
lib/pricing/dtf.js
```

No API routes were built. No sign, screen print, or embroidery APIs were modified. DTF pricing formulas were preserved for parity.

## Extracted Engine

The new engine exports:

```js
calculateDtfPricing(input, catalog)
layoutDtfTransfers(items, rollWidth, padding, allowRotate)
normalizeDtfInput(input)
dtfPricingConstants
```

The extracted constants preserve the previous component values:

- 60% default margin.
- 22 inch DTF roll width.
- $0.50 material cost per linear inch.
- $10 minimum material charge.
- $10 flat shipping.
- $1 per sleeve print retail add-on.
- $20 customer-provided apparel fee.
- Existing front, back, and sleeve print presets.
- Existing oversized garment upcharges.

## Preserved Behavior

The engine preserves:

- Standard catalog apparel mode.
- DTF-only mode.
- Customer-provided apparel mode.
- Existing transfer roll layout row-packing logic.
- Rotation optimization behavior.
- Existing 22 inch roll width.
- Existing DTF material cost and minimum charge.
- Existing sleeve add-ons.
- Existing flat shipping.
- Existing oversized garment upcharges.
- Existing apparel catalog lookup behavior through `calculateApparelLineCost(..., { mode: "dtf" })`.
- Existing final retail formula.

## Component Update

`components/products/DTFTransfers.js` now delegates DTF calculation to `calculateDtfPricing`.

The component still owns:

- UI state.
- Catalog search UI.
- Selected product display.
- Admin/customer summary rendering.
- Quote copy text.

The component no longer owns:

- DTF transfer layout math.
- DTF material math.
- Apparel retail math.
- Sleeve add-on math.
- Size price breakdown math.
- Final retail math.

## Parity Coverage

Added fixtures:

```text
tests/fixtures/dtf-engine-parity.json
```

Added verifier:

```text
scripts/verify-dtf-engine-parity.mjs
```

Covered cases:

- Standard apparel.
- Full front.
- Full back.
- Left chest.
- Sleeves.
- Both sleeves.
- Custom print sizes.
- Oversized garments.
- BYO apparel.
- DTF-only mode.
- Optimized layout.
- Non-optimized layout.
- Width greater than roll width.

The verifier compares the extracted engine against a frozen legacy copy of the prior component formulas.

## Test Integration

`npm run test:pricing` now includes:

```text
node scripts/verify-dtf-engine-parity.mjs
```

## API Status

No DTF API route was created in this phase.

Recommended next phase:

1. Add `app/api/pricing/dtf/route.js`.
2. Load the private server-side apparel catalog.
3. Validate a customer-safe request schema.
4. Return a customer-safe response envelope.
5. Add DTF API shape tests.
