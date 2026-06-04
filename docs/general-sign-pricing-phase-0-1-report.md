# General Sign Pricing Phase 0/1 Report

## Scope

Implemented Phase 0 and Phase 1 for the general sign calculator only.

Included products:

- Banners
- Mesh banners
- ACM
- Aluminum
- Acrylic
- Vinyl
- Reflective vinyl
- Footprints vinyl
- Poster
- Coroplast
- Custom-cut coroplast
- Vehicle magnets
- Foamcore
- PVC
- Polystyrene
- Business cards
- Handheld paper
- Carbonless forms
- Door hangers

Not modified:

- Screen printing
- DTF
- Embroidery
- Architectural letters
- Display/tradeshow products
- Public API routes

## Files Modified

- `hooks/usePricingCalculator.js`
  - Replaced the embedded pricing calculation body with a thin React `useMemo` wrapper around the new general sign pricing engine.
  - Preserved the previous memo dependency list for parity.
- `package.json`
  - Added `"type": "module"` so Node can import the extracted ESM engine during parity verification.
  - Added `test:pricing` script.
- `package-lock.json`
  - Created by `npm.cmd install` because dependencies were not installed locally and `next build` could not run without them.

## Files Added

- `lib/pricing/general-signs.js`
  - New pure pricing engine module for the existing general sign calculator.
- `scripts/verify-general-signs-parity.mjs`
  - Fixture-based parity verification script.
  - Supports `--update` for intentional baseline fixture refresh.
- `tests/fixtures/general-sign-pricing-parity.json`
  - Baseline parity fixture containing 20 representative general sign pricing cases.
- `docs/general-sign-pricing-phase-0-1-report.md`
  - This implementation report.

## Engine Functions Created

- `calculateGeneralSignPricing(input)`
  - Location: `lib/pricing/general-signs.js`
  - Accepts the same input shape previously destructured by `usePricingCalculator`.
  - Returns the same calculation object previously returned by the hook's `useMemo` body.

## Parity Fixtures

Fixture coverage includes 20 representative cases:

- Banner with options/rush/design fee
- Mesh banner with options/rush/delivery
- ACM with contour and rounded corners
- Aluminum with contour and rounded corners
- Acrylic with contour, rounded corners, and stand-offs
- Ganged contour vinyl
- Reflective vinyl
- Footprints vinyl
- Poster rush
- Coroplast yard signs
- Custom-cut coroplast
- Standard vehicle magnets
- Custom vehicle magnets
- Foamcore
- PVC
- Polystyrene
- Business cards
- Handheld paper
- Carbonless forms
- Door hangers

The fixture stores JSON-safe expected outputs from the preserved legacy calculation body. The verifier normalizes current engine output the same way before comparison so `undefined` fields do not create false-positive differences.

## Pricing Differences Found

No pricing differences were found.

Verified by:

```text
npm.cmd run test:pricing
```

Result:

```text
General sign pricing parity passed for 20 cases.
```

## Build Verification

Verified by:

```text
npm.cmd run build
```

Result:

```text
Compiled successfully
Generated static pages successfully
```

## Notes

- No public API routes were implemented.
- No pricing formulas were intentionally changed.
- No screen printing, DTF, embroidery, architectural-letter, or display/tradeshow pricing code was modified.
- `npm.cmd install` reported advisories for the existing dependency set, including the installed `next@14.2.3`; dependency upgrades were not performed because this task is focused on pricing parity and extraction.
