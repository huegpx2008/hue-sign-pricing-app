# Apparel Catalog Loader Report

## Summary

Implemented a shared apparel catalog layer for future screen print, DTG, DTF, and embroidery pricing APIs. The existing customer-facing UI remains unchanged, no apparel API routes were added, and the existing pricing formulas were not modified.

## Files Created

- `lib/catalog/apparel-catalog.js`
- `scripts/verify-apparel-catalog-parity.mjs`
- `docs/apparel-catalog-loader-report.md`

## Files Modified

- `components/products/ScreenPrinting.js`
- `components/products/DTFTransfers.js`
- `components/products/Embroidery.js`
- `package.json`

## Current Catalog Structure

The current pricing UI still loads:

```text
public/data/SanMar_SDL_hue.csv
```

Current reduced catalog columns:

```text
PRODUCT_TITLE,STYLE#,AVAILABLE_SIZES,CATEGORY_NAME,COLOR_NAME,SIZE,CASE_PRICE
```

The shared loader also supports additional SanMar master fields when present, including:

- `MILL`
- `CASE_SIZE`
- `PIECE_PRICE`
- `DOZENS_PRICE`
- `PIECE_WEIGHT`
- `PRICE_GROUP`
- `INVENTORY_KEY`
- `SIZE_INDEX`
- `PRODUCT_STATUS`
- product image and model image fields

The loader preserves the current pricing interpretation that `CASE_PRICE` is the blank garment cost used by the existing pricing behavior.

## Reusable Functions Created

Created in `lib/catalog/apparel-catalog.js`:

- `parseApparelCatalogCsv(csvText)`
- `normalizeSanMarRow(row)`
- `loadApparelCatalog(options)`
- `findStyle(style, catalog)`
- `findVariant(style, color, catalog)`
- `findVariantSize(style, color, size, catalog)`
- `getAvailableColors(style, catalog)`
- `getAvailableSizes(style, color, catalog)`
- `calculateApparelLineCost(lineItem, catalog, options)`

Additional helper exports:

- `createApparelCatalog(rows)`
- `setLoadedApparelCatalog(catalog)`
- `sortApparelSizes(sizes)`
- `apparelCatalogConstants`

## Component Refactor

### Screen Printing

Updated `components/products/ScreenPrinting.js` to use:

- `parseApparelCatalogCsv`
- `calculateApparelLineCost` with `mode: "screen"`

Preserved behavior:

- Fixed screen print size list.
- Style and color selection behavior.
- Per-size `CASE_PRICE` lookup.
- Garment direct cost calculation.
- Garment markup, print matrix, setup fee, and summary formulas.

### DTG

DTG continues to run through `components/products/ScreenPrinting.js`.

Preserved behavior:

- Style restricted to `BC3001`.
- Colors restricted to `White` and `Black`.
- Sizes restricted to `S` through `3XL`.
- Existing direct-print formula and size upcharge behavior.

### DTF

Updated `components/products/DTFTransfers.js` to use:

- `parseApparelCatalogCsv`

Preserved behavior:

- Style/color search behavior.
- Selected product uses the first matching style/color row.
- Base apparel cost auto-fills from `CASE_PRICE`.
- Manual apparel cost override behavior.
- Existing hardcoded size upcharges:
  - `2XL`: `2.5`
  - `3XL`: `3.5`
  - `4XL`: `4.5`
  - `5XL`: `5`
- DTF transfer layout, material cost, margin, shipping, BYO apparel, and sleeve add-on formulas.

### Embroidery

Updated `components/products/Embroidery.js` to use:

- `parseApparelCatalogCsv`
- `sortApparelSizes`
- `calculateApparelLineCost` with `mode: "embroidery"`

Preserved behavior:

- Available sizes derived from selected style rows.
- Color and size `CASE_PRICE` lookup.
- Existing fallback to matching size when a color-specific row is not found.
- Manual garment mode.
- Stitch matrix, thread colors, names, numbers, puff, handling, digitizing, target retail, and admin summary formulas.

## Parity Test Results

Added `scripts/verify-apparel-catalog-parity.mjs` to `npm run test:pricing`.

The parity test verifies:

- New parser preserves reduced catalog row count.
- Screen printing apparel line costs match legacy inline behavior.
- DTG catalog restriction and `CASE_PRICE` lookup match legacy behavior.
- DTF selected `CASE_PRICE`, garment direct cost, and hardcoded size-upcharge behavior match legacy behavior.
- Embroidery garment cost and fallback behavior match legacy inline behavior.
- Shared lookup functions return expected style, variant, and size data.

Command run:

```text
npm.cmd run test:pricing
```

Result:

```text
General sign pricing parity passed for 20 cases.
Apparel catalog parity passed for screen printing, DTG, DTF, and embroidery.
Banner pricing API response shape passed.
Yard sign pricing API response shape passed.
ACM pricing API response shape passed.
Vinyl pricing API response shape passed.
Custom-cut Coroplast pricing API response shape passed.
Vehicle magnet pricing API response shape passed.
```

Build command run:

```text
npm.cmd run build
```

Result:

```text
Compiled successfully.
```

## Issues Discovered

- The reduced pricing CSV is still located under `public`, which means it is browser-accessible. It contains `CASE_PRICE`, so future API work should move cost-bearing apparel catalog data to a server-side location before exposing public apparel pricing endpoints.
- `public/data/SanMar_SDL_hue.csv` does not include `CASE_SIZE`, even though DTF displays case size when available. Current behavior remains `N/A`.
- Screen printing and embroidery previously used very simple CSV parsing. The shared parser is safer for quoted commas while preserving current parity on the reduced CSV.
- The master catalog file `public/SanMar_SDL_N.csv` remains unprocessed. No large Excel import or catalog regeneration was performed.

## API Readiness

The pricing app now has a single shared apparel catalog lookup layer that future apparel pricing APIs can use. Before building `POST /api/pricing/screenprint`, the next safest step is to extract the screen print pricing formula into a reusable apparel pricing engine using this catalog layer, then add parity fixtures around the full quote output.
