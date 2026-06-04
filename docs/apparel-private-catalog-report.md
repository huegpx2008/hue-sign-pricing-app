# Apparel Private Catalog Report

## Summary

Created a private server-side apparel catalog copy for cost-bearing SanMar data and updated the shared apparel catalog loader so future server-side pricing APIs can load costs without reading from `public`.

No public apparel API routes were created. No pricing formulas or pricing results were changed.

## What Was Exposed Before

Cost-bearing apparel catalog data was available from public paths:

```text
public/data/SanMar_SDL_hue.csv
public/SanMar_SDL_N.csv
```

The current apparel UI components load:

```text
/data/SanMar_SDL_hue.csv
```

That reduced CSV includes:

```text
PRODUCT_TITLE,STYLE#,AVAILABLE_SIZES,CATEGORY_NAME,COLOR_NAME,SIZE,CASE_PRICE
```

Because `CASE_PRICE` is a cost-bearing field, this should not be the long-term source for public API pricing.

## Private Catalog Path Created

Created a private server-side copy:

```text
data/private/apparel/SanMar_SDL_hue.csv
```

This file is outside `public`, so it is not served as a static browser asset by Next.js.

## Loader Change

Updated `lib/catalog/apparel-catalog.js` so:

- Browser/client loading still defaults to `/data/SanMar_SDL_hue.csv`.
- Server-side loading through `loadApparelCatalog()` now defaults to `data/private/apparel/SanMar_SDL_hue.csv`.

Future API routes should load cost-bearing apparel data like this:

```js
import { loadApparelCatalog } from "@/lib/catalog/apparel-catalog";

const catalog = await loadApparelCatalog();
```

That call should be made from server-side code only, such as Next.js route handlers under `app/api`.

## What Still Remains Public Temporarily

The existing client-side apparel calculators still load:

```text
public/data/SanMar_SDL_hue.csv
```

This keeps the current UI working and preserves existing screen printing, DTF, DTG, and embroidery behavior while the pricing engines are being extracted.

The master file also currently exists at:

```text
public/SanMar_SDL_N.csv
```

That file is large and includes cost-bearing and display catalog fields. It should not remain public long term.

## Tests Updated

Updated `scripts/verify-apparel-catalog-parity.mjs` to verify:

- Existing apparel pricing parity still passes.
- `loadApparelCatalog({ forceReload: true })` can load the private server-side catalog.
- The private server-side catalog row count matches the reduced public catalog row count.

## Verification Results

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

Build command:

```text
npm.cmd run build
```

Result:

```text
Compiled successfully.
```

## Follow-Up Recommendations

- Before public apparel APIs go live, build the API routes to use `loadApparelCatalog()` server-side only.
- Replace public client CSV usage with display-safe catalog data that omits `CASE_PRICE`, `PIECE_PRICE`, `DOZENS_PRICE`, and other cost fields.
- Move or remove `public/SanMar_SDL_N.csv` from the public static tree after confirming the website has its own display-safe catalog source.
- Keep parity fixtures around current `CASE_PRICE` interpretation until screen print, DTG, DTF, and embroidery engines are fully extracted.
- Eventually generate both private pricing data and public display data from the same SanMar source pipeline.
