# Pricing API Architecture Plan

## Purpose

Hue Graphics wants this repo to become the single source of truth for pricing.

Long-term target:

```text
Customer Website
  -> Pricing API in this repo
    -> Pricing Engine in this repo
```

The website should send product/order inputs to this app and receive calculated pricing. The website should not duplicate or own pricing formulas.

This document is an analysis and implementation plan only. It does not modify pricing calculations, change pricing results, or build API endpoints.

## Current Architecture

This is a Next.js 14 app with App Router routes under `app/`, client UI components under `components/`, pricing data under `data/`, helper functions under `utils/`, and one architectural-letter pricing helper under `lib/`.

Current pricing flow:

```text
app/page.js
  owns product state, option state, staff/admin mode state
  -> hooks/usePricingCalculator.js
       calculates most sign, vinyl, banner, paper, and rigid substrate pricing
  -> components/PricingSummary.js
       displays current price and quote details

components/ProductOptions.js
  renders product-specific options
  -> components/products/ScreenPrinting.js
       calculates screen printing and DTG pricing in the component
  -> components/products/DTFTransfers.js
       calculates DTF pricing in the component
  -> components/products/Embroidery.js
       calculates embroidery pricing in the component

app/architectural-letters/page.js
  calculates architectural-letter quote totals in the page
  -> app/api/admin/architectural-letters/pricing/route.js
       admin-only debug lookup for spreadsheet pricing match
  -> lib/architectural-letters/pricingData.js
       reusable architectural-letter table matching

app/display-tradeshow-products/page.js
  calculates display/tradeshow tier price in the page
  -> data/displayProductsCatalog.js
       product catalog and tier pricing data
```

## Answers To Requested Questions

### 1. Where are pricing calculations currently located?

Primary locations:

- `hooks/usePricingCalculator.js`
  - Main general calculator for vinyl, reflective vinyl, footprints vinyl, poster paper, business cards, handheld paper, carbonless forms, door hangers, banners, mesh banners, ACM, aluminum, acrylic, foamcore, PVC, polystyrene, vehicle magnets, coroplast yard signs, and custom-cut coro signs.
- `utils/pricingHelpers.js`
  - Reusable helper math for currency formatting, numeric parsing, tier lookup, sheet cost lookup, shipping by size, ACM shipping by size, 48x96 sheet layout counts, roll layout counts, and vinyl billable square footage.
- `data/productConfig.js`
  - Pricing tables and product option data for many sign products, including banner rates, ACM rates, aluminum rates, vinyl rates, coro tier prices, coro sheet costs, foamcore sheet pricing, PVC sheet pricing, and polystyrene sheet pricing.
- `components/products/ScreenPrinting.js`
  - Screen printing and DTG pricing, including SanMar CSV apparel costs, screen print quantity/color matrices, garment markup, setup fee, and DTG direct-print charges.
- `components/products/DTFTransfers.js`
  - DTF pricing, including SanMar CSV apparel costs, transfer layout optimization, roll-length material cost, apparel margin, size upcharges, sleeve add-ons, BYO apparel fee, and shipping.
- `components/products/Embroidery.js`
  - Embroidery pricing, including SanMar CSV apparel costs, stitch matrix, stitch count tiers, thread color extras, names/numbers, puff embroidery, digitizing fees, handling, target retail override, and manual item mode.
- `app/architectural-letters/page.js`
  - Architectural-letter quote totals: billable characters, sets, freight, adjustments, manual unit price, manual final retail, and estimated retail.
- `lib/architectural-letters/pricingData.js`
  - Reusable architectural-letter spreadsheet matching and debug data for loaded pricing tables.
- `app/api/admin/architectural-letters/pricing/route.js`
  - Existing API route, but it only returns admin/customer-in-store debug match data. It is not a public pricing endpoint.
- `app/display-tradeshow-products/page.js`
  - Display/tradeshow tier selection and retail total calculation.
- `data/displayProductsCatalog.js`
  - Display/tradeshow product tier pricing data.

### 2. Are pricing calculations reusable or mixed into UI components?

They are partially reusable but mostly mixed into UI-oriented code.

Reusable today:

- `utils/pricingHelpers.js` is reusable and mostly pure.
- `data/productConfig.js` is reusable as pricing/config data.
- `lib/architectural-letters/pricingData.js` is reusable for table matching.

Mixed into UI today:

- `hooks/usePricingCalculator.js` is easier to reuse than a component, but it is still a React hook. API routes cannot call it directly because hooks belong to React render/runtime rules.
- `ScreenPrinting.js`, `DTFTransfers.js`, and `Embroidery.js` contain significant pricing logic inside client components and `useMemo` blocks.
- `app/page.js` owns defaults and request-shaping state that the future API will need as explicit input defaults.
- `app/display-tradeshow-products/page.js` contains tier selection in a page component.
- `app/architectural-letters/page.js` contains final quote-total math in the page even though table lookup is partly extracted.

Conclusion: the app has useful helper pieces, but the actual pricing engine should be extracted into plain JavaScript functions before exposing customer-facing pricing endpoints.

### 3. What products currently have pricing logic?

Currently active/calculated products include:

- Coroplast yard signs (`coro`)
- Custom cut coro signs (`coroSigns`)
- Vinyl banners (`banner`)
- Mesh banners (`meshBanner`)
- ACM / Maxmetal (`acm`)
- Aluminum (`aluminum`)
- Acrylic (`acrylic`)
- Printed vinyl (`vinyl`)
- Reflective vinyl (`reflective`)
- Footprints vinyl (`footprints`)
- Poster paper (`poster`)
- Foamcore (`foamcore`)
- PVC (`pvc`)
- Polystyrene .03 (`polystyrene`)
- Vehicle magnets (`vehicleMagnets`)
- Business cards (`businessCards`)
- Handheld 16pt paper (`handheld16ptPaper`)
- Carbonless forms (`carbonless`)
- Door hangers (`doorHangers`)
- Screen printing (`screenPrinting`)
- DTG direct to garment (`dtgDirectToGarment`)
- DTF transfers (`dtfTransfers`)
- Embroidery (`embroidery`)
- Architectural letters, admin/customer-in-store only at present (`architecturalLetters`)
- Display/tradeshow products, admin-only catalog at present (`displayTradeshowProducts`)

Products listed but not currently priced or marked coming soon include:

- Backlit
- BootPrints vinyl
- Wall vinyl
- Window perforated vinyl
- Static cling
- Decals/stickers
- Notepads
- Envelopes

### 4. What needs to be refactored to expose pricing through API endpoints?

Recommended refactor:

1. Create plain pricing engine modules under `lib/pricing/`.
   - Example: `lib/pricing/general-signs.js`, `lib/pricing/apparel.js`, `lib/pricing/dtf.js`, `lib/pricing/embroidery.js`, `lib/pricing/display-tradeshow.js`.
   - These modules should export pure functions such as `calculateBannerPricing(input)` and `calculateScreenPrintPricing(input)`.
   - They should not import React, use hooks, access browser APIs, use component state, read localStorage, or render UI.

2. Move calculation logic out of React hook/component bodies without changing formulas.
   - `usePricingCalculator.js` should become a UI wrapper around `calculateGeneralPricing(input)`.
   - `ScreenPrinting.js` should call `calculateScreenPrintingPricing(input, catalogRows)`.
   - `DTFTransfers.js` should call `calculateDtfPricing(input, catalogRows)`.
   - `Embroidery.js` should call `calculateEmbroideryPricing(input, catalogRows)`.
   - `app/display-tradeshow-products/page.js` should call `calculateDisplayTradeshowPricing(input)`.
   - `app/architectural-letters/page.js` should use a pure final-total function after the existing table debug/match function.

3. Normalize inputs and defaults.
   - Today defaults live in `app/page.js` and product components.
   - API endpoints need explicit schemas and server-side defaults so website callers do not need to know internal React state shape.

4. Add parity tests before changing call paths.
   - Snapshot known input/output examples from the current app.
   - Extract formulas.
   - Confirm extracted engine functions return identical totals, each prices, costs, margins, sheet counts, shipping, and notable breakdown fields.

5. Add route handlers after the engine is extracted.
   - Use `app/api/pricing/[product]/route.js` or individual route directories.
   - Route handlers should validate JSON, call engine functions, and return a stable response envelope.

6. Keep UI behavior as a client of the same engine.
   - The current app can keep local instant calculations by importing the engine directly.
   - The customer website should call the API.
   - Later, the internal app can optionally call the same API too, but direct engine imports are fine inside this repo.

### 5. Recommended API Architecture

Use a small public pricing API with product-specific endpoints and a shared response envelope.

Recommended shape:

```text
app/api/pricing/
  route.js                         optional capability/index endpoint
  [product]/route.js               generic dynamic product route
  screenprint/route.js             optional explicit alias
  dtf/route.js                     optional explicit alias
  embroidery/route.js              optional explicit alias
  banner/route.js                  optional explicit alias
  coroplast/route.js               optional explicit alias
  acm/route.js                     optional explicit alias

lib/pricing/
  index.js                         product dispatcher
  schemas.js                       validation/default normalization
  response.js                      common response envelope helpers
  general-signs.js                 existing usePricingCalculator logic as pure functions
  apparel-catalog.js               SanMar CSV parsing/loading utilities
  screenprint.js
  dtf.js
  embroidery.js
  architectural-letters.js
  display-tradeshow.js
```

Use `POST` for pricing calculations because inputs can be complex and should not be encoded into query strings.

Recommended public response envelope:

```json
{
  "ok": true,
  "product": "banner",
  "version": "2026-06-04",
  "input": {},
  "price": {
    "retail": 120,
    "each": 12,
    "currency": "USD"
  },
  "cost": {
    "direct": 45,
    "material": 35,
    "shipping": 10
  },
  "profit": 75,
  "marginPercent": 62.5,
  "breakdown": {},
  "warnings": []
}
```

Recommended error envelope:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Quantity must be greater than zero.",
    "fields": {
      "quantity": "Must be greater than zero"
    }
  }
}
```

Operational recommendations:

- Add a pricing version string to every response.
- Include normalized input in responses so website/debugging can see what defaults were applied.
- Keep internal cost/profit fields available only to authenticated/admin callers. Banner, yard-sign, and ACM currently expose a bounded `internalCost` object only when the server verifies `HUE_PRICING_INTERNAL_API_SECRET`; public responses remain unchanged.
- Return customer-safe totals by default.
- Keep formulas in engine modules, not route handlers.
- Keep route handlers thin: parse, validate, call engine, return JSON.

### 6. Which routes should exist?

Initial public routes should map to high-value website products:

- `POST /api/pricing/screenprint`
- `POST /api/pricing/dtf`
- `POST /api/pricing/embroidery`
- `POST /api/pricing/banner`
- `POST /api/pricing/coroplast`
- `POST /api/pricing/acm`
- `POST /api/pricing/vinyl`

Recommended near-term additional routes because the current app already has pricing logic:

- `POST /api/pricing/mesh-banner`
- `POST /api/pricing/reflective-vinyl`
- `POST /api/pricing/footprints-vinyl`
- `POST /api/pricing/poster`
- `POST /api/pricing/aluminum`
- `POST /api/pricing/acrylic`
- `POST /api/pricing/foamcore`
- `POST /api/pricing/pvc`
- `POST /api/pricing/polystyrene`
- `POST /api/pricing/vehicle-magnet`
- `POST /api/pricing/business-card`
- `POST /api/pricing/handheld-paper`
- `POST /api/pricing/carbonless`
- `POST /api/pricing/door-hanger`
- `POST /api/pricing/dtg`

Admin/internal routes:

- `POST /api/pricing/architectural-letters`
- `POST /api/pricing/display-tradeshow`
- Keep or replace `POST /api/admin/architectural-letters/pricing` as an admin debug endpoint.

Optional discovery/config routes:

- `GET /api/pricing`
  - Lists supported products, product ids, required fields, option values, and pricing version.
- `GET /api/pricing/products`
  - Public product catalog/options for website form building.
- `GET /api/pricing/products/:product`
  - Product-specific option schema, presets, and allowed values.

### 7. What data should the website send to each endpoint?

Shared fields for most endpoints:

```json
{
  "quantity": 10,
  "fees": {
    "designFee": 0,
    "setupFee": 0,
    "delivery": 0
  },
  "pricingContext": {
    "channel": "website",
    "customerMode": "customer-online"
  }
}
```

Admin-only/internal fields:

```json
{
  "marginPercent": 60,
  "multiplier": 1,
  "includeInternal": false
}
```

Product inputs:

#### Screen Printing

```json
{
  "lineItems": [
    {
      "style": "2000",
      "color": "Black",
      "sizeQuantities": {
        "S": 12,
        "M": 12,
        "L": 12,
        "XL": 12,
        "2XL": 2
      }
    }
  ],
  "locations": [
    { "name": "Front", "colors": 1 },
    { "name": "Back", "colors": 1 }
  ],
  "setupFeeEnabled": true
}
```

#### DTG

```json
{
  "lineItems": [
    {
      "style": "BC3001",
      "color": "Black",
      "sizeQuantities": {
        "S": 10,
        "M": 10,
        "L": 10
      }
    }
  ],
  "doubleSided": false
}
```

#### DTF

```json
{
  "mode": "standard",
  "bringYourOwnApparel": false,
  "style": "2000",
  "color": "Black",
  "sizeQuantities": {
    "S": 12,
    "M": 12,
    "L": 12,
    "XL": 12,
    "2XL": 2
  },
  "printLocations": {
    "front": { "preset": "Left Chest" },
    "back": { "preset": "Full Back" },
    "leftSleeve": null,
    "rightSleeve": null
  },
  "layout": {
    "padding": 0.25,
    "optimize": true
  },
  "manualApparelCost": null
}
```

For DTF-only:

```json
{
  "mode": "dtfOnly",
  "transfer": {
    "width": 11,
    "height": 10,
    "quantity": 25
  },
  "layout": {
    "padding": 0.25,
    "optimize": true
  }
}
```

#### Embroidery

```json
{
  "lineItems": [
    {
      "style": "K540",
      "color": "Black",
      "sizeQuantities": {
        "S": 5,
        "M": 5,
        "L": 5
      }
    }
  ],
  "placements": ["Left Chest"],
  "stitchCount": 5000,
  "threadColors": 2,
  "addNames": false,
  "largeNames": false,
  "addNumbers": false,
  "largeNumbers": false,
  "puff3mm": false,
  "digitizingStatus": "Reorder / Digitized File On Hand",
  "targetRetailPricePerItem": null
}
```

#### Banner

```json
{
  "width": 36,
  "height": 24,
  "quantity": 1,
  "material": "13-single",
  "polePocket": false,
  "rope": false,
  "windSlits": false,
  "rush": false
}
```

#### Coroplast

```json
{
  "productType": "yard-sign",
  "width": 24,
  "height": 18,
  "quantity": 25,
  "sides": "single",
  "flute": "vertical",
  "stakes": true,
  "heavyStakes": false,
  "grommets": false,
  "gloss": false,
  "contour": false,
  "rush": false
}
```

For custom-cut coro, use `productType: "custom-cut"` and allow `flute: "best"`.

#### ACM

```json
{
  "width": 24,
  "height": 18,
  "quantity": 1,
  "type": "3-single",
  "contour": false,
  "roundedCorners": false
}
```

#### Vinyl

```json
{
  "width": 24,
  "height": 18,
  "quantity": 10,
  "type": "gf-standard",
  "laminate": "Gloss Laminate",
  "contour": false,
  "rush": false,
  "gang": false,
  "contourPadding": 0.5,
  "gangWastePercent": 15
}
```

#### Additional Existing Products

- Mesh banner: width, height, quantity, polePocket, grommets, welding, rope, webbing, rush.
- Reflective vinyl: width, height, quantity, contour, rush, gang/layout options.
- Footprints vinyl: width, height, quantity, contour, rush, gang/layout options.
- Poster: width, height, quantity, rush.
- Aluminum: width, height, quantity, type, contour, roundedCorners.
- Acrylic: width, height, quantity, contour, roundedCorners, standOffs, standOffQty, standOffColor.
- Foamcore: width, height, quantity, doubleSided, contour, gloss, rush, customCut.
- PVC: width, height, quantity, type, contour, rush, customCut.
- Polystyrene: width, height, quantity, doubleSided, contour, gloss, rush, customCut.
- Vehicle magnet: mode, preset or custom width/height, quantity, contour, roundedCorners, rush.
- Business card: quantity, sides, coating, orientation, rush.
- Handheld paper: quantity, sizeKey or explicit size/perSheet, sides, coating, orientation, rush.
- Carbonless: formType, size, quantity, printType, printSides, numbering, wraparound, bookedSets, rush.
- Door hanger: size, quantity, type, ink, backPrinting, perforation, shrinkWrap.
- Display/tradeshow: productId, sizeId, sidedOption, hardwareOption, quantity.
- Architectural letters: text, quantity, sets, productType, material, finish, thickness, mounting, lighting, letterHeight, returnDepth, freight fields, adjustment, manual price overrides.

### 8. What data should each endpoint return?

Each endpoint should return the common envelope plus product-specific breakdown details.

Common public return:

```json
{
  "ok": true,
  "product": "coroplast",
  "price": {
    "retail": 250,
    "each": 10,
    "currency": "USD"
  },
  "summary": {
    "label": "Coroplast Yard Signs",
    "quantity": 25,
    "size": "24 x 18"
  },
  "breakdown": {
    "totalSqFt": 75,
    "basePrice": 240,
    "options": []
  },
  "warnings": []
}
```

Common admin/internal additions:

```json
{
  "cost": {
    "direct": 110,
    "material": 90,
    "shipping": 20
  },
  "profit": 140,
  "marginPercent": 56,
  "internalBreakdown": {
    "sheetsUsed": 3.13,
    "sheetsRounded": 4,
    "piecesPerSheet": 8,
    "sheetLayout": "2 across x 4 down"
  }
}
```

Product-specific return examples:

- Screen printing: total garments, line item subtotals, print lines, quantity tier used, setup fee, average price per shirt, size price breakdown.
- DTF: total garment/transfer quantity, selected product, print locations, roll width, roll length used, transfer count, material cost, size upcharges, sleeve add-ons, BYO apparel fee, layout optimization details.
- Embroidery: total garments, stitch tier used, embroidery retail each, digitizing fees, thread/name/number/puff add-ons, target retail delta when used.
- Banner: total square feet, material, perimeter feet, option charges, rush status.
- Coroplast: type/sides, sheet count, sheet layout, stake/grommet/gloss/contour/rush effects.
- ACM: sheet count/layout, material cost, shipping, contour and rounded corner flags.
- Vinyl: billing mode, actual/effective/billable square feet, gang layout, roll width, material name.
- Display/tradeshow: tier used, retail each, retail total, call-for-pricing flag.
- Architectural letters: matched unit price, billable characters, subtotal, freight, adjustments, estimated retail, warnings/match status.

### 9. Which parts of the pricing engine can remain unchanged?

Can remain mostly unchanged:

- The formulas and constants themselves.
- `data/productConfig.js` values.
- `data/displayProductsCatalog.js` values.
- `data/architecturalLettersPricingTables.json`.
- `utils/pricingHelpers.js`, although it may be moved or re-exported under `lib/pricing` later.
- `lib/architectural-letters/pricingData.js` table matching, though final quote total logic should be extracted from the page.
- Current UI components can remain visually unchanged after the engine extraction if they call the new pure functions.
- Current `PricingSummary.js` display logic can remain mostly unchanged initially, but it should consume normalized engine output over time.

Should change location, not behavior:

- The calculation body of `usePricingCalculator.js`.
- Pricing `useMemo` blocks in `ScreenPrinting.js`, `DTFTransfers.js`, and `Embroidery.js`.
- Tier calculation in `app/display-tradeshow-products/page.js`.
- Architectural-letter final quote calculation in `app/architectural-letters/page.js`.
- SanMar CSV parsing/loading should become a reusable server/client utility so API routes and components use identical catalog interpretation.

## Recommended Architecture

Target architecture:

```text
Customer Website
  -> POST /api/pricing/:product
    -> validates and normalizes request
      -> lib/pricing product engine
        -> data/productConfig.js, SanMar CSV, architectural tables, display catalog
      <- normalized pricing result
  <- customer-safe JSON response

Internal Pricing App UI
  -> lib/pricing product engine directly
  -> PricingSummary / quote UI
```

Pricing engine boundaries:

- Engine functions accept plain JSON-like input.
- Engine functions return plain JSON-like output.
- Engine functions do not know about React, localStorage, DOM, clipboard, prompts, routing, or visual previews.
- API route handlers do not contain formulas.
- UI components do not contain formulas after refactor.

## Refactor Plan

### Phase 0: Baseline and Inventory

- Create fixtures for representative current products and expected outputs.
- Include customer-facing totals and admin breakdowns.
- Capture edge cases: rush, contour, large quantities, sheet rounding, gang vinyl, DTF-only, BYO apparel, embroidery digitizing, screen print minimum, architectural-letter no-match.

### Phase 1: Extract General Sign Engine

- Add `lib/pricing/general-signs.js`.
- Move the calculation body from `usePricingCalculator.js` into a pure function.
- Keep all formula code identical.
- Update `usePricingCalculator.js` to call the pure function inside `useMemo`.
- Add parity tests around existing known calculations.

Candidate function:

```js
calculateGeneralPricing(input)
```

This phase covers: vinyl, reflective, footprints, poster, business cards, handheld paper, carbonless, door hangers, banner, mesh banner, ACM, aluminum, acrylic, foamcore, PVC, polystyrene, vehicle magnets, coro, and custom-cut coro signs.

### Phase 2: Extract Apparel Catalog Utilities

- Add `lib/pricing/apparel-catalog.js`.
- Centralize SanMar CSV parsing and style/color/size lookup.
- Preserve current browser CSV behavior where needed, but also make server-side loading possible for API routes.
- Avoid changing price interpretation of `CASE_PRICE`.

### Phase 3: Extract Screen Print, DTG, DTF, and Embroidery Engines

- Add:
  - `lib/pricing/screenprint.js`
  - `lib/pricing/dtg.js`
  - `lib/pricing/dtf.js`
  - `lib/pricing/embroidery.js`
- Move formulas from product components into pure functions.
- Components keep UI state and call the extracted functions.
- Add parity fixtures for apparel-heavy calculations.

### Phase 4: Extract Specialty Catalog Engines

- Add `lib/pricing/display-tradeshow.js`.
- Add `lib/pricing/architectural-letters.js` or extend the existing `lib/architectural-letters/pricingData.js` with a pure final quote function.
- Keep the existing admin architectural debug endpoint until a replacement endpoint is stable.

### Phase 5: Add API Routes

- Add product-specific `POST /api/pricing/...` routes.
- Add validation and stable response envelopes.
- Add customer-safe/admin response filtering.
- Add `GET /api/pricing/products` for website option schema when needed.

### Phase 6: Website Integration

- Update the customer website to call pricing endpoints.
- Remove or prevent pricing formulas from existing in website code.
- Keep website forms responsible only for collecting inputs and displaying API responses.

### Phase 7: Governance and Versioning

- Add a pricing version to all responses.
- Document supported products and schemas.
- Add regression tests for every product formula before any future pricing change.
- Consider a changelog for pricing changes.

## Estimated Implementation Phases

Suggested implementation order:

1. Documentation and baseline fixtures: 0.5-1 day.
2. General sign engine extraction: 1-2 days.
3. General sign parity tests: 0.5-1 day.
4. Apparel catalog utility extraction: 0.5-1 day.
5. Screen print/DTG extraction: 1 day.
6. DTF extraction: 1-1.5 days.
7. Embroidery extraction: 1 day.
8. Display/tradeshow and architectural-letter extraction: 1-1.5 days.
9. API route implementation and response envelopes: 1-2 days.
10. Website-facing schema docs and integration examples: 0.5-1 day.

Total estimate: roughly 8-13 development days, depending on how much test coverage and schema validation is added in the first pass.

## Key Risks

- Pricing formulas are currently spread across UI state and `useMemo` blocks, so moving them requires parity tests before behavior changes.
- SanMar CSV parsing exists in multiple components with slightly different parsing approaches. Centralizing it must preserve current product matching and `CASE_PRICE` interpretation.
- Admin-only fields such as cost, profit, margin, manual overrides, and debug details need access control before public API exposure.
- Architectural letters are not fully public/customer-ready today; current page copy says customer quoting is locked while validation is in progress.
- Display/tradeshow products include `NEEDS REVIEW` and `CALL` pricing states; endpoints should preserve those states rather than forcing numeric prices.

## Recommended Next Step

Start with Phase 0 and Phase 1:

- Build parity fixtures for `calculateGeneralPricing`.
- Extract the current `usePricingCalculator.js` logic into a pure engine function.
- Keep the current UI using that function locally.
- Only after parity is proven, add `/api/pricing/banner`, `/api/pricing/coroplast`, `/api/pricing/acm`, and `/api/pricing/vinyl` as the first API endpoints.
