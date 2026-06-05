# Embroidery API Architecture

## Purpose

This document analyzes the current embroidery pricing implementation and recommends an architecture for a future customer-safe Embroidery pricing API.

No API route has been built. No pricing formulas or pricing results have been changed.

## Current Pricing Flow

Embroidery pricing currently lives in:

```text
components/products/Embroidery.js
```

The component handles:

- SanMar apparel catalog loading.
- Apparel style, color, and size selection.
- Garment cost lookup.
- Stitch-count tiering.
- Thread color add-ons.
- Names and numbers.
- 3mm puff embroidery.
- Digitizing fees.
- Manual garment entry in admin mode.
- Optional target retail override in admin mode.

The component sends its calculated summary to the main quote summary through `onSummaryChange`.

## Where Formulas Live

All embroidery formulas currently live inside the `summary` `useMemo` block in `components/products/Embroidery.js`.

Current formula data:

- `STITCH_MATRIX`
- `PLUS_PER_1K`
- `QTIERS`
- `PLACEMENTS`
- fixed handling direct cost
- fixed digitizing fees
- fixed names/numbers/puff/thread add-ons

The only reusable portion already extracted is catalog line-cost lookup through:

```text
lib/catalog/apparel-catalog.js
```

Specifically:

```js
calculateApparelLineCost(lineItem, catalog, { mode: "embroidery" })
```

## Garment Cost Calculation

Catalog-backed garment cost uses SanMar `CASE_PRICE`.

Current flow:

1. The component loads `/data/SanMar_SDL_hue.csv`.
2. Rows are parsed with `parseApparelCatalogCsv`.
3. Rows are grouped by `STYLE#` and `PRODUCT_TITLE`.
4. The user selects a style and color.
5. Available sizes are derived from selected style rows.
6. Each selected size quantity is matched against selected color and size.
7. If no color-specific row is found for a size, embroidery falls back to the first matching size row for that style.
8. Apparel direct cost is the sum of `CASE_PRICE * quantity`.
9. Apparel retail is calculated as:

```text
apparelRetail = apparelCost / 0.4
```

Manual admin mode bypasses catalog lookup and uses manual quantity and manual garment cost per item.

For the public API, manual garment entry should not be part of the first customer-facing version.

## Stitch Counts

Current stitch count behavior:

- Default stitch count: `5000`.
- Stitch count is rounded up to the next 1,000 stitches.
- Minimum stitch tier: `5000`.
- Matrix tiers exist from `5000` through `15000`.
- Quantities are bucketed by `QTIERS`:
  - `1-5`
  - `6-11`
  - `12-23`
  - `24-35`
  - `36-71`
  - `72-143`
  - `144-287`
  - `288-575`
  - `576-999`
  - `1000+`

For stitch counts above `15000`:

```text
stitchEach = STITCH_MATRIX[15000][quantityTier] + extra1k * PLUS_PER_1K[quantityTier]
```

Where `extra1k` is:

```text
ceil((stitchCount - 15000) / 1000)
```

## Digitizing Fees

Current digitizing state:

```text
Reorder / Digitized File On Hand
New Logo / Needs Digitizing
```

Current formula:

- If digitizing status does not include `Needs`, digitizing fee is `0`.
- If digitizing is needed:
  - `55` when the order has only caps or only flat garments.
  - `110` when the order mixes cap-like items and flat garments.

Cap-like detection currently uses text matching:

```text
cap|hat|beanie
```

It checks product title and placement text.

## Additional Locations

Current UI state uses:

```js
placements = ["Left Chest"]
```

But the visible UI is a single select:

```text
Left Chest
Center Chest
Full Back
Sleeve
Hat Front
Hat Side
Beanie
Custom Placement
```

Current pricing does not calculate separate embroidery charges per additional location. The selected placement is mainly included in the summary and cap/flat digitizing detection.

Architecture recommendation:

- The API request should support `locations` as an array for future website/cart compatibility.
- Phase 1 parity should treat the first location as the current placement input.
- Multi-location pricing should not multiply charges until the existing business rule is clarified and parity fixtures are established.
- If multiple locations are submitted before that rule exists, return a warning that multi-location embroidery requires review.

## Names And Numbers

Current name/title behavior:

- `addNames`: boolean.
- `largeNames`: boolean.
- Standard names add `6` direct per item.
- Large names add `8` direct per item.

Current number behavior:

- `addNumbers`: boolean.
- `largeNumbers`: boolean.
- Standard numbers add `6` direct per item.
- Large numbers use `STITCH_MATRIX[5000][0]`, currently `6`, as direct per item.

Names and numbers are included in:

```text
embroideryEachDirect
```

Then retail is calculated by dividing direct embroidery cost by `0.4`.

## Puff Embroidery

3mm puff embroidery is currently supported.

Current behavior:

- `puff3mm`: boolean.
- Adds `1.5` direct per item when enabled.

## Thread Colors

Default thread colors:

```text
2
```

Current formula:

```text
threadExtraEach = max(threadColors - 2, 0) * 3
```

This is a direct per-item add-on and is included in `embroideryEachDirect`.

## Full Current Formula Summary

Current direct embroidery per item:

```text
embroideryEachDirect =
  stitchEach
  + threadExtraEach
  + namesEach
  + numbersEach
  + puffEach
```

Current embroidery retail per item:

```text
embroideryRetailEach = embroideryEachDirect / 0.4
```

Current apparel retail:

```text
apparelRetail = apparelCost / 0.4
```

Current handling:

```text
handlingDirect = 2
handlingRetail = handlingDirect / 0.4
```

Current calculated retail:

```text
calculatedRetail =
  apparelRetail
  + embroideryRetailEach * totalGarments
  + handlingRetail
  + digitizingFees
```

Admin target retail override:

```text
retail = targetRetailPricePerItem > 0
  ? targetRetailPricePerItem * totalGarments
  : calculatedRetail
```

The public API should not include target retail override in the first version.

## Can It Be Extracted Into A Reusable Engine?

Yes. Embroidery can be extracted into a reusable engine similar to:

- `lib/pricing/general-signs.js`
- `lib/pricing/screenprint.js`

Recommended new file:

```text
lib/pricing/embroidery.js
```

Recommended engine function:

```js
calculateEmbroideryPricing(input, catalog)
```

The engine should:

- Accept normalized API/component input.
- Use `calculateApparelLineCost(..., { mode: "embroidery" })`.
- Preserve the current color/size fallback behavior.
- Preserve stitch tiering, thread add-ons, names/numbers, puff, handling, and digitizing formulas.
- Return internal calculation details to the admin UI or test layer.
- Let API routes map that internal result to customer-safe output.

## Recommended API Request Shape

Endpoint:

```text
POST /api/pricing/embroidery
```

Recommended request:

```json
{
  "lineItems": [
    {
      "style": "K540",
      "color": "Black",
      "sizes": {
        "S": 6,
        "M": 12,
        "L": 12,
        "XL": 6,
        "2XL": 2
      }
    }
  ],
  "locations": [
    {
      "placement": "Left Chest",
      "stitchCount": 8000,
      "threadColors": 3,
      "puff3mm": false
    }
  ],
  "digitizingRequired": true,
  "names": {
    "enabled": false,
    "large": false
  },
  "numbers": {
    "enabled": false,
    "large": false
  }
}
```

Recommended normalized engine input for Phase 1 parity:

```json
{
  "lineItems": [
    {
      "style": "K540",
      "color": "Black",
      "sizes": {
        "S": 6,
        "M": 12,
        "L": 12,
        "XL": 6,
        "2XL": 2
      }
    }
  ],
  "placements": ["Left Chest"],
  "stitchCount": 8000,
  "threadColors": 3,
  "digitizingStatus": "New Logo / Needs Digitizing",
  "addNames": false,
  "largeNames": false,
  "addNumbers": false,
  "largeNumbers": false,
  "puff3mm": false
}
```

Notes:

- The API shape uses `locations` for website compatibility.
- The engine can initially map the first location to current `placements[0]`, `stitchCount`, `threadColors`, and `puff3mm`.
- Multi-location requests should be accepted only with a review warning until additional-location pricing is defined.

## Recommended Customer-Safe Response Shape

```json
{
  "ok": true,
  "product": "embroidery",
  "price": {
    "retail": 1234.56,
    "each": 32.49
  },
  "currency": "USD",
  "summary": {
    "label": "Embroidery",
    "totalQuantity": 38,
    "lineItems": [
      {
        "style": "K540",
        "productName": "Port Authority Silk Touch Polo",
        "color": "Black",
        "quantity": 38,
        "sizes": {
          "S": 6,
          "M": 12,
          "L": 12,
          "XL": 6,
          "2XL": 2
        }
      }
    ],
    "locations": [
      {
        "placement": "Left Chest",
        "stitchCount": 8000,
        "threadColors": 3,
        "puff3mm": false
      }
    ],
    "options": {
      "digitizingRequired": true,
      "names": false,
      "numbers": false
    }
  },
  "warnings": []
}
```

Customer-safe response must not expose:

- garment direct cost
- SanMar `CASE_PRICE`
- embroidery direct cost
- profit
- margin
- internal matrix tiers
- supplier costs
- admin target retail data

## Validation Recommendations

The API should validate:

- `lineItems` is a non-empty array.
- Each line item has `style`, `color`, and at least one positive size quantity.
- Style/color/size combinations exist in the private apparel catalog.
- `locations` is a non-empty array.
- `stitchCount` is a positive number.
- `threadColors` is a positive integer.
- Names/numbers/puff inputs are booleans.
- Multiple locations return a review warning unless/until pricing rules are defined.

## Risks

- Current pricing logic is embedded in a dense client `useMemo`; extraction must be cautious.
- Additional embroidery locations are not truly priced today.
- Cap/flat detection is text-based and may misclassify products.
- Manual garment mode and target retail override are admin features and should not be included in the first public API.
- Digitizing fee behavior depends on cap/flat detection, which currently uses product title and placement strings.
- Existing response summaries include internal cost and margin fields in admin UI; public API mapping must filter them.
- The customer website may want per-location embroidery pricing before the current app has a confirmed formula for it.

## Parity Testing Plan

Before building the public API:

1. Create fixtures from current `Embroidery.js` for representative cases.
2. Include catalog-backed garment items:
   - polo style such as `K540`
   - cap style such as `NE501` or `C112`
   - bag style such as `BG99`
3. Include quantity tier cases:
   - under 5 pieces
   - 5 pieces
   - 12 pieces
   - 36 pieces
   - 144+ pieces
4. Include stitch counts:
   - 5000
   - 8000
   - 15000
   - over 15000
5. Include thread color cases:
   - 1 or 2 colors
   - 3+ colors
6. Include add-ons:
   - names
   - large names
   - numbers
   - large numbers
   - 3mm puff
7. Include digitizing:
   - reorder/no fee
   - new logo flat-only
   - new logo cap-only
   - new logo mixed cap and flat
8. Assert parity for:
   - retail
   - each
   - total garments
   - stitch tier used
   - digitizing fee
   - public response shape

## Catalog Integration Recommendations

Future API should load catalog data server-side only:

```js
const catalog = await loadApparelCatalog();
```

This should use:

```text
data/private/apparel/SanMar_SDL_hue.csv
```

The API should not trust customer-submitted garment costs. The website should send only:

- style
- color
- size quantities
- decoration options

The pricing app should resolve:

- product name
- size availability
- garment cost
- cap/flat hints where possible

Follow-up catalog improvement:

- Add display-safe category metadata for better cap/flat detection.
- Prefer catalog category/subcategory over product-title regex when available.
- Keep private cost-bearing data out of public browser catalog files.

## Website Integration Recommendations

The website should:

- Use display-safe apparel catalog data for browsing.
- Send selected style/color/size quantities to the pricing API.
- Show API-returned customer-safe retail and each pricing.
- Display warnings when returned.
- Treat embroidery estimates as review-needed when:
  - multiple locations are requested
  - mixed caps/flats are present
  - high stitch counts are used
  - custom placements are selected

The website should not:

- Store embroidery formulas.
- Send garment costs.
- Calculate digitizing fees client-side.
- Calculate thread, puff, name, number, or stitch matrix charges client-side.

## Recommended Implementation Phases

### Phase 1: Extract Engine

- Create `lib/pricing/embroidery.js`.
- Move current constants and formula logic into `calculateEmbroideryPricing`.
- Keep `Embroidery.js` behavior unchanged by calling the engine.
- Add parity fixtures.

### Phase 2: Server Catalog Validation

- Add API/server validation for style, color, and size.
- Preserve catalog fallback behavior for embroidery size pricing.

### Phase 3: Public API Route

- Create `POST /api/pricing/embroidery`.
- Return customer-safe output only.
- Add response-shape tests.

### Phase 4: Website Integration

- Connect website quote flow to the API.
- Keep formulas out of the website.
- Use API warnings for review messaging.

## Conclusion

Embroidery is ready for extraction into a reusable pricing engine, but the extraction should happen before building the public API. The largest product decision is additional-location pricing: the current UI captures a placement but does not price multiple locations independently. Phase 1 should preserve the current single-placement pricing behavior and return review warnings for multi-location inputs until a confirmed formula exists.
