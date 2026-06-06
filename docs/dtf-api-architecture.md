# DTF API Architecture

## Purpose

Create a plan for a future customer-safe DTF pricing API that can power the Hue Graphics website, catalog, estimators, and quote cart.

No API route has been built. No pricing formulas or pricing results have been changed.

## Current Pricing Flow

DTF pricing currently lives in:

```text
components/products/DTFTransfers.js
```

The component handles:

- SanMar catalog loading from `/data/SanMar_SDL_hue.csv`.
- Style search by `STYLE#` or product title.
- Color selection.
- Standard apparel plus DTF mode.
- DTF transfers-only mode.
- Bring-your-own-apparel mode.
- Front, back, left sleeve, and right sleeve print selections.
- Preset and custom print dimensions.
- Transfer roll layout.
- Optional layout optimization with rotation.
- Apparel quantity entry by fixed size fields.
- Hardcoded oversized garment upcharges.
- Admin-only apparel cost override.
- Customer/admin summary output through `onSummaryChange`.

The current UI sends the calculated DTF summary back to the main quote summary. A future API should reuse the same calculation through a plain engine instead of duplicating the component logic.

## Where DTF Formulas Live

Most DTF formulas are embedded directly in `components/products/DTFTransfers.js`.

Current constants:

```text
DEFAULT_MARGIN_PERCENT = 60
DTF_MATERIAL_COST_PER_LINEAR_INCH = 0.5
DTF_MINIMUM_MATERIAL_CHARGE = 10
DTF_SHIPPING_FLAT = 10
DTF_SLEEVE_RETAIL_ADDON_EACH = 1
FRONT_PRESETS:
  Left Chest = 4" x 4"
  Full Front = 11" x 10"
BACK_PRESETS:
  Full Back = 12.5" x 13"
DEFAULT_SLEEVE_SIZE = 3.5" x 3.5"
SIZE_UPCHARGES:
  2XL = 2.5
  3XL = 3.5
  4XL = 4.5
  5XL = 5
```

There is already a partial reusable helper for DTF garment cost in:

```text
lib/catalog/apparel-catalog.js
```

Specifically:

```js
calculateApparelLineCost(lineItem, catalog, { mode: "dtf" })
```

That helper preserves the current DTF behavior of using one selected base `CASE_PRICE` plus hardcoded size upcharges. It does not yet calculate transfer layout, material cost, retail, sleeve add-ons, shipping, or final totals.

## Garment Cost Calculation Flow

Current standard apparel flow:

1. Load the SanMar CSV.
2. Parse rows with `parseApparelCatalogCsv`.
3. Group rows by `STYLE#` and `PRODUCT_TITLE`.
4. Customer/admin selects a style and color.
5. The selected product is the first row matching the selected style/color.
6. Base apparel cost is auto-filled from selected product `CASE_PRICE`.
7. Total garment quantity is the sum of fixed size fields:
   - `XS`
   - `S`
   - `M`
   - `L`
   - `XL`
   - `2XL`
   - `3XL`
   - `4XL`
   - `5XL`
8. Apparel direct cost is:

```text
totalGarmentQty * baseApparelCostUsed
```

9. Apparel retail subtotal is:

```text
apparelDirectCost / (1 - 0.60)
```

10. Oversize upcharges are added as flat retail upcharges:

```text
2XL qty * 2.5
+ 3XL qty * 3.5
+ 4XL qty * 4.5
+ 5XL qty * 5
```

Important parity note: current DTF does not look up a separate catalog row price for each size. It uses one selected base `CASE_PRICE` across all size quantities and then adds the hardcoded size upcharges.

Bring-your-own-apparel flow:

- Apparel direct cost is `0`.
- Apparel retail subtotal is `0`.
- Size upcharge total is `0`.
- A fixed retail fee of `20` is added.
- Quantity comes from transfer quantity rather than garment size fields.

DTF-only flow:

- Apparel direct cost is `0`.
- Apparel retail subtotal is `0`.
- Quantity comes from DTF transfer quantity.
- Width and height come from transfer-only dimensions.

## Print Sizes And Locations

Current supported print areas:

- Front print:
  - `None`
  - `Left Chest`: `4" x 4"`
  - `Full Front`: `11" x 10"`
  - `Custom Size`
- Back print:
  - `None`
  - `Full Back`: `12.5" x 13"`
  - `Custom Size`
- Left sleeve:
  - default `3.5" x 3.5"`
  - custom size supported
- Right sleeve:
  - default `3.5" x 3.5"`
  - custom size supported
- DTF-only transfer:
  - custom width
  - custom height

The requested future API also needs left chest and pocket print concepts. Current parity mapping should treat `leftChest` as the existing `front` preset `Left Chest`. Pocket print is not currently priced as a separate first-class location, so the API should either map it to a custom front location when dimensions are supplied or return a review warning if dimensions are missing.

## Gang Sheets And Layout

DTF supports gang-style roll layout internally, but not as a named public gang-sheet product.

Current layout behavior:

1. Build one transfer item per selected location per garment.
2. Use a `22"` roll width.
3. Add production padding, default `0.25"`.
4. Try a no-rotation layout.
5. Try a rotation-enabled layout.
6. If layout optimization is enabled, use the shorter roll length.
7. Material cost is:

```text
max(rollLengthUsed * 0.5, 10)
```

The layout algorithm is a simple row-packing heuristic. It filters out transfer items wider than the roll width. It does not currently return an error for impossible transfers in the UI; they simply do not appear in placements. A future API should validate or warn when requested print dimensions exceed the roll width.

Recommended API language:

- Use `optimizeLayout` for current parity.
- Use `gangSheet` only for a future explicit sheet-product request.
- Return customer-safe layout facts such as total transfers, roll width, estimated linear inches, and warnings, but do not expose material cost or margin math.

## Quantity Tier Logic

DTF currently has no matrix-based quantity tiers like screen printing or embroidery.

Quantity affects price through:

- Total garment count.
- Total transfer count.
- Roll length consumed by transfer layout.
- Per-order minimum material charge.
- Per-order shipping.
- Fixed BYO apparel fee, when enabled.

The only tier-like presentation is `dtfSizePriceBreakdown`, which groups customer display prices into:

- `S-XL`
- `2XL`
- `3XL`
- `4XL`
- `5XL`

This is not a price-break tier table. It is a size/upcharge display derived from the final average price.

## Setup Fees And Handling

Current DTF does not have a named artwork/setup fee comparable to screen printing.

Current handling-like charges:

- `DTF_SHIPPING_FLAT = 10`, pass-through added to final retail and direct cost.
- `byoaRetailFee = 20` for standard DTF with customer-provided apparel.
- `DTF_SLEEVE_RETAIL_ADDON_EACH = 1` per selected sleeve print per garment.

The future API should avoid adding a new setup fee until there is an approved pricing rule. If an `artworkSupplied` field is sent, it should affect warnings/review state only unless the pricing rule is later added.

## Artwork Requirements

The current DTF calculator does not validate artwork files, vector status, transparency, color profile, resolution, gang layout readiness, or print-ready dimensions.

Recommended customer-safe API behavior:

- Accept `artwork.supplied`.
- Accept optional `artwork.status`, such as `printReady`, `needsReview`, or `notSupplied`.
- Include warnings when artwork is not supplied or not marked print-ready.
- Do not change price based on artwork status in phase 1.
- Do not expose internal prepress assumptions as cost line items.

## Color Limitations And Special Pricing Rules

Current DTF pricing has no color-count pricing, garment color pricing, dark garment surcharge, white underbase surcharge, or ink color limitation.

Current special rules:

- Oversized garment upcharges for `2XL` through `5XL`.
- Sleeve retail add-on per sleeve print.
- Flat DTF shipping.
- BYO apparel retail fee.
- Minimum material charge.
- Transfer dimensions wider than the `22"` roll cannot be placed by current layout logic.

The API should include review warnings for unsupported or ambiguous cases rather than inventing pricing:

- Requested print width exceeds roll width.
- Pocket print requested without dimensions.
- Multiple designs per location.
- Artwork not supplied or not marked print-ready.
- Rush production requested, because current DTF has no rush formula.

## Can DTF Be Extracted Into A Reusable Engine?

Yes. DTF can be extracted into a reusable plain JavaScript engine similar to:

- `lib/pricing/general-signs.js`
- `lib/pricing/embroidery.js`
- `lib/pricing/screenprint.js`

Recommended module:

```text
lib/pricing/dtf.js
```

Recommended exports:

```js
calculateDtfPricing(input, catalog)
layoutDtfTransfers(items, options)
normalizeDtfInput(input)
dtfPricingConstants
```

The extraction should be a parity refactor only:

- Move `layoutTransfers` into `lib/pricing/dtf.js`.
- Move current DTF constants into `dtfPricingConstants`.
- Use `calculateApparelLineCost(..., { mode: "dtf" })` for catalog-backed garment cost.
- Preserve standard, DTF-only, and bring-your-own-apparel behavior.
- Preserve current final retail formula:

```text
finalRetail =
  apparelRetailSubtotal
  + dtfRetailSubtotal
  + sizeUpchargeTotal
  + sleeveRetailAddOnTotal
  + DTF_SHIPPING_FLAT
  + byoaRetailFee
```

The React component can then call `calculateDtfPricing` for internal estimates, while the future API route can call the same engine with server-side catalog loading.

## Recommended API Request Structure

Endpoint:

```text
POST /api/pricing/dtf
```

Recommended phase 1 request:

```json
{
  "mode": "standard",
  "apparel": {
    "source": "catalog",
    "style": "2000",
    "color": "Black",
    "sizes": {
      "S": 12,
      "M": 12,
      "L": 12,
      "XL": 12,
      "2XL": 6
    }
  },
  "printLocations": [
    {
      "placement": "front",
      "preset": "fullFront",
      "enabled": true
    },
    {
      "placement": "back",
      "preset": "fullBack",
      "enabled": true
    },
    {
      "placement": "leftSleeve",
      "enabled": false
    },
    {
      "placement": "rightSleeve",
      "enabled": false
    }
  ],
  "artwork": {
    "supplied": true,
    "status": "printReady"
  },
  "production": {
    "rush": false
  },
  "layout": {
    "optimize": true
  }
}
```

Recommended aliases for website ergonomics:

```json
{
  "frontPrint": {
    "enabled": true,
    "preset": "leftChest"
  },
  "backPrint": {
    "enabled": true,
    "preset": "fullBack"
  },
  "sleevePrint": {
    "enabled": true,
    "sides": ["left"],
    "size": {
      "width": 3.5,
      "height": 3.5
    }
  },
  "leftChest": {
    "enabled": true
  },
  "pocketPrint": {
    "enabled": false,
    "size": {
      "width": 4,
      "height": 4
    }
  }
}
```

Recommended transfer-only request:

```json
{
  "mode": "dtfOnly",
  "transfer": {
    "width": 11,
    "height": 10,
    "quantity": 25
  },
  "artwork": {
    "supplied": true,
    "status": "printReady"
  },
  "production": {
    "rush": false
  },
  "layout": {
    "optimize": true
  }
}
```

Recommended customer-provided apparel request:

```json
{
  "mode": "standard",
  "apparel": {
    "source": "customerProvided",
    "quantity": 24
  },
  "printLocations": [
    {
      "placement": "front",
      "preset": "fullFront",
      "enabled": true
    }
  ],
  "artwork": {
    "supplied": false,
    "status": "notSupplied"
  },
  "production": {
    "rush": false
  }
}
```

Canonical normalized location fields:

- `placement`: `front`, `back`, `leftSleeve`, `rightSleeve`, `leftChest`, `pocket`, or `custom`.
- `preset`: `leftChest`, `fullFront`, `fullBack`, or `custom`.
- `size.width`: custom width in inches.
- `size.height`: custom height in inches.
- `enabled`: boolean.

Validation recommendations:

- `mode` is required: `standard` or `dtfOnly`.
- Catalog apparel requires `style`, `color`, and at least one positive size quantity.
- Customer-provided apparel requires positive `quantity`.
- DTF-only requires positive `transfer.width`, `transfer.height`, and `transfer.quantity`.
- At least one print location is required for standard mode.
- Width and height must be positive when a custom size is used.
- Width should not exceed `22"` without a warning or validation error.
- `rush` is accepted but warning-only in phase 1.

## Recommended Customer-Safe Response Structure

The response should match the pattern used by current customer-safe pricing APIs.

```json
{
  "ok": true,
  "product": "dtf",
  "price": {
    "retail": 865.25,
    "each": 16.02314814814815
  },
  "currency": "USD",
  "summary": {
    "label": "DTF Transfers",
    "mode": "standard",
    "totalQuantity": 54,
    "apparel": {
      "source": "catalog",
      "style": "2000",
      "productName": "Gildan - Ultra Cotton 100% US Cotton T-Shirt.  2000",
      "color": "Black",
      "sizes": {
        "S": 12,
        "M": 12,
        "L": 12,
        "XL": 12,
        "2XL": 6
      }
    },
    "locations": [
      {
        "placement": "front",
        "label": "Full Front",
        "size": {
          "width": 11,
          "height": 10
        }
      },
      {
        "placement": "back",
        "label": "Full Back",
        "size": {
          "width": 12.5,
          "height": 13
        }
      }
    ],
    "layout": {
      "optimize": true,
      "rollWidth": 22,
      "estimatedLinearInches": 128.5,
      "totalTransfers": 108,
      "rotationUsed": true
    },
    "sizePriceBreakdown": [
      {
        "label": "S-XL",
        "quantity": 48,
        "priceEach": 16.02
      },
      {
        "label": "2XL",
        "quantity": 6,
        "priceEach": 18.52
      }
    ],
    "options": {
      "artworkSupplied": true,
      "rush": false
    }
  },
  "warnings": []
}
```

Customer-safe response must not expose:

- SanMar `CASE_PRICE`.
- Supplier cost.
- Material cost.
- Direct cost.
- Margin.
- Profit.
- Internal markup percentages.
- Admin apparel cost overrides.
- Internal layout placements unless explicitly needed for an estimator preview.

Optional estimator response extension:

```json
{
  "preview": {
    "roll": {
      "width": 22,
      "length": 128.5,
      "placements": []
    }
  }
}
```

Only include placements if a website layout preview needs them. Do not expose costs in preview data.

## Risks

- DTF pricing currently lives in a client component, so extracting it must be done carefully to avoid formula drift.
- DTF uses one base `CASE_PRICE` for all selected sizes, unlike screen printing and embroidery. This must be preserved for parity even if it looks less granular.
- The existing layout algorithm silently drops transfers wider than the roll width. An API should add explicit validation or warnings.
- Rush production is requested for the future API shape, but current DTF has no rush pricing rule.
- Artwork supplied/not supplied has no current price effect.
- Pocket print is requested for the future API shape, but it has no current dedicated formula.
- Gang-sheet support exists as roll layout optimization, not as a customer-facing gang-sheet product.
- The public catalog and private catalog paths differ. API pricing should use the private server catalog.
- Admin-only manual apparel cost override should not be exposed to public API callers.

## Parity Testing Plan

Before building the route:

1. Create `lib/pricing/dtf.js` with no behavior changes.
2. Add fixture cases that mirror current component states:
   - Standard catalog apparel with left chest only.
   - Standard catalog apparel with full front and full back.
   - Standard catalog apparel with one sleeve.
   - Standard catalog apparel with both sleeves.
   - Standard catalog apparel with custom front/back sizes.
   - Oversize quantities using `2XL`, `3XL`, `4XL`, and `5XL`.
   - BYO apparel.
   - DTF transfers only.
   - Optimization enabled and disabled.
   - Transfer wider than roll width.
3. Compare extracted engine outputs against current component math:
   - final retail
   - each price
   - total quantity
   - transfer count
   - roll length used
   - rotation used
   - size upcharge total
   - sleeve retail add-on total
   - shipping
4. Add a route-shape test similar to existing API shape scripts.
5. Confirm customer-safe response omits internal fields.
6. Run:

```text
npm run build
```

After the API route is built later, add `npm.cmd run test:pricing` coverage if the pricing test script is extended to include DTF.

## Catalog Integration Recommendations

- Use the shared apparel catalog loader from `lib/catalog/apparel-catalog.js`.
- API routes should load the private server-side catalog path, not the public CSV.
- Website catalog browse pages should use non-cost product data only.
- Website pricing requests should send style, color, and size quantities, not garment cost.
- Keep DTF catalog pricing behavior aligned with current DTF:
  - one selected base `CASE_PRICE`
  - hardcoded oversized size upcharges
- Consider a future separate public catalog endpoint that exposes:
  - style
  - product name
  - available colors
  - available sizes
  - product images
  - no supplier costs

## Website Integration Recommendations

- Build the website estimator and quote cart around the future `POST /api/pricing/dtf` response envelope.
- Store normalized DTF line item data in the cart:
  - apparel style
  - color
  - sizes
  - print locations
  - print sizes
  - artwork status
  - rush request
  - quoted price
- Reprice cart items before checkout or quote submission.
- Display warnings prominently but customer-safe:
  - artwork review needed
  - rush requires confirmation
  - custom/pocket placement requires review
  - transfer size exceeds production limits
- Do not reproduce formulas on the website.
- Do not send or store supplier cost in the website.
- Treat API prices as estimates until artwork and production details are reviewed.

## Implementation Plan

Recommended sequence:

1. Extract `layoutTransfers` and DTF constants to `lib/pricing/dtf.js`.
2. Implement `calculateDtfPricing(input, catalog)` with current formulas only.
3. Update `components/products/DTFTransfers.js` to call the engine.
4. Add DTF parity fixtures and verification script.
5. Build `app/api/pricing/dtf/route.js`.
6. Add API shape tests.
7. Document the final built API in `docs/dtf-pricing-api.md`.

This requested analysis stops at step 0: architecture and implementation planning.
