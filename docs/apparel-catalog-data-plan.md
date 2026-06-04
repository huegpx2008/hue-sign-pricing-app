# Apparel Catalog Data Plan

## Purpose

Before adding public APIs for screen printing, DTF, DTG, or embroidery, the apparel catalog data needs to be treated as shared pricing infrastructure. The website should be able to browse products, but pricing calculations should come from this pricing app and should use a consistent interpretation of SanMar style, color, size, and cost data.

This document analyzes the current catalog files and recommends a shared data strategy. It does not change pricing formulas, import the large Excel file, or build any new API routes.

## Current Catalog Files

The pricing app currently contains two SanMar CSV files:

| File | Approx size | Rows | Current role |
| --- | ---: | ---: | --- |
| `public/SanMar_SDL_N.csv` | 193.9 MB | 153,526 | Master SanMar catalog file. This has the broad SanMar data export shape and many customer catalog/display fields. |
| `public/data/SanMar_SDL_hue.csv` | 17.8 MB | 153,526 | Reduced CSV used by current apparel pricing UI components. Same row count as the master, but only a small subset of columns. |

The reduced pricing CSV currently has these columns:

```text
PRODUCT_TITLE,STYLE#,AVAILABLE_SIZES,CATEGORY_NAME,COLOR_NAME,SIZE,CASE_PRICE
```

The master SanMar CSV currently has these columns:

```text
UNIQUE_KEY,PRODUCT_TITLE,PRODUCT_DESCRIPTION,STYLE#,AVAILABLE_SIZES,BRAND_LOGO_IMAGE,THUMBNAIL_IMAGE,COLOR_SWATCH_IMAGE,PRODUCT_IMAGE,SPEC_SHEET,PRICE_TEXT,SUGGESTED_PRICE,CATEGORY_NAME,SUBCATEGORY_NAME,COLOR_NAME,COLOR_SQUARE_IMAGE,COLOR_PRODUCT_IMAGE,COLOR_PRODUCT_IMAGE_THUMBNAIL,SIZE,PIECE_WEIGHT,PIECE_PRICE,DOZENS_PRICE,CASE_PRICE,PRICE_GROUP,CASE_SIZE,INVENTORY_KEY,SIZE_INDEX,SANMAR_MAINFRAME_COLOR,MILL,PRODUCT_STATUS,COMPANION_STYLE,MSRP,MAP_PRICING,FRONT_MODEL_IMAGE_URL,BACK_MODEL_IMAGE_URL,FRONT_FLAT_IMAGE_URL,BACK_FLAT_IMAGE_URL,PRODUCT_MEASUREMENTS,PMS_COLOR,GTIN,DECORATION_SPEC_SHEET
```

## Current Pricing Usage

The current apparel pricing components all load:

```text
/data/SanMar_SDL_hue.csv
```

The components that use the file are:

- `components/products/ScreenPrinting.js`
- `components/products/DTFTransfers.js`
- `components/products/Embroidery.js`

### Screen Printing

Current pricing fields used:

- `STYLE#`
- `PRODUCT_TITLE`
- `COLOR_NAME`
- `SIZE`
- `CASE_PRICE`

Current behavior:

- Groups rows by `STYLE#` and `PRODUCT_TITLE`.
- Lets the user search by style or product title.
- Lets the user select a color from matching rows.
- Looks up `CASE_PRICE` for each selected size and color.
- Uses the selected size quantities to calculate garment direct cost.
- Applies the existing screen print garment markup and print matrices.

Notes:

- Sizes are driven by a fixed UI size list: `XS`, `S`, `M`, `L`, `XL`, `2XL`, `3XL`, `4XL`, `5XL`, `6XL`.
- The current simple CSV parsing uses `line.split(",")`, which is fragile if any retained CSV fields contain commas.

### DTG

DTG pricing currently lives in `components/products/ScreenPrinting.js` under `product === "dtgDirectToGarment"`.

Current catalog fields used for selection:

- `STYLE#`
- `PRODUCT_TITLE`
- `COLOR_NAME`
- `SIZE`
- `CASE_PRICE`

Current behavior:

- Restricts the catalog to style `BC3001`.
- Restricts colors to `White` and `Black`.
- Restricts sizes to `S`, `M`, `L`, `XL`, `2XL`, `3XL`.
- Uses selected style/color/size data for line item selection and quantities.

Pricing note:

- The current DTG formula does not price blank garment cost the same way screen printing does. It calculates the current DTG direct-print retail using the existing direct print charge, setup fee allocation, and 2XL/3XL size upcharge behavior. This should be preserved during extraction.

### DTF

Current pricing fields used:

- `STYLE#`
- `PRODUCT_TITLE`
- `COLOR_NAME`
- `CASE_PRICE`
- `CASE_SIZE`, if available

Current behavior:

- Uses a safer custom CSV parser than screen printing and embroidery.
- Lets the user search by style or product title.
- Lets the user select a style and color.
- Uses the first matching selected style/color row as the selected product.
- Auto-fills base apparel cost from `CASE_PRICE`.
- Uses fixed size quantity fields and separate hardcoded size upcharges:
  - `2XL`: `2.5`
  - `3XL`: `3.5`
  - `4XL`: `4.5`
  - `5XL`: `5`
- Supports manual apparel cost override.

Notes:

- The reduced `SanMar_SDL_hue.csv` does not include `CASE_SIZE`, so DTF currently displays `N/A` for case size even though the component tries to read it.
- Current DTF uses one selected base `CASE_PRICE` across the apparel quantity fields plus hardcoded size upcharges. It does not currently look up each size's SanMar row price the same way screen printing and embroidery do.

### Embroidery

Current pricing fields used:

- `STYLE#`
- `PRODUCT_TITLE`
- `COLOR_NAME`
- `SIZE`
- `CASE_PRICE`

Current behavior:

- Groups rows by `STYLE#` and `PRODUCT_TITLE`.
- Lets the user search by style or product title.
- Lets the user select a color.
- Builds available sizes from the selected style rows.
- Looks up `CASE_PRICE` by selected color and size, with a fallback to matching size if color-specific row is not found.
- Calculates apparel direct cost from selected size quantities.
- Supports manual garment entry for admin mode.

Notes:

- Embroidery has the most flexible current size handling because it derives sizes from the selected style rows.
- Cap/hat/beanie detection currently comes from product title and placement text, not from a catalog category flag.

## Missing Fields Compared To A Customer Catalog

The reduced pricing CSV is enough for several existing pricing calculations, but it is not enough to power a full customer-facing apparel catalog.

Fields missing from the reduced file that are useful for a customer catalog:

- Stable SanMar row identifier: `UNIQUE_KEY`.
- Product description: `PRODUCT_DESCRIPTION`.
- Brand or mill: `MILL`.
- Subcategory: `SUBCATEGORY_NAME`.
- Product status: `PRODUCT_STATUS`.
- Thumbnail image: `THUMBNAIL_IMAGE`.
- Product image: `PRODUCT_IMAGE`.
- Color swatch image: `COLOR_SWATCH_IMAGE`.
- Color square image: `COLOR_SQUARE_IMAGE`.
- Color product images: `COLOR_PRODUCT_IMAGE`, `COLOR_PRODUCT_IMAGE_THUMBNAIL`.
- Full CDN model and flat image URLs:
  - `FRONT_MODEL_IMAGE_URL`
  - `BACK_MODEL_IMAGE_URL`
  - `FRONT_FLAT_IMAGE_URL`
  - `BACK_FLAT_IMAGE_URL`
- Spec sheets and measurement references:
  - `SPEC_SHEET`
  - `PRODUCT_MEASUREMENTS`
  - `DECORATION_SPEC_SHEET`
- Inventory-related identifiers:
  - `INVENTORY_KEY`
  - `GTIN`
- Sort/display helpers:
  - `SIZE_INDEX`
  - `PMS_COLOR`
  - `SANMAR_MAINFRAME_COLOR`
- Related products:
  - `COMPANION_STYLE`
- Customer-facing suggested price fields, if the website ever displays MSRP:
  - `SUGGESTED_PRICE`
  - `MSRP`
  - `MAP_PRICING`

Fields missing from the reduced file that are useful for pricing/admin:

- `CASE_SIZE`
- `PIECE_PRICE`
- `DOZENS_PRICE`
- `PRICE_GROUP`
- `PIECE_WEIGHT`
- `PRICE_TEXT`
- `PRODUCT_STATUS`
- `INVENTORY_KEY`

The current pricing logic uses `CASE_PRICE`, not `PIECE_PRICE` or `DOZENS_PRICE`. Any migration must preserve that interpretation unless pricing formulas are intentionally changed later.

## Should The Pricing App Use The Same Split Catalog Files As The Website?

Yes, but with an important boundary: both apps should use the same normalized catalog schema and generation pipeline, not duplicate hand-maintained CSV variants.

The pricing app and website have different needs:

- The website needs public display data for browsing, filtering, images, product names, colors, sizes, categories, and product status.
- The pricing app needs cost-bearing data for pricing calculations, especially `CASE_PRICE` by style/color/size.

Because cost data should not be exposed to customer browsers, the long-term structure should split catalog data by purpose:

- Public display catalog: safe for website/browser use.
- Private pricing catalog: server-side only, used by this pricing app and pricing APIs.

The website can still use split catalog files for fast browsing, but those public files should not include wholesale cost fields like `CASE_PRICE`, `PIECE_PRICE`, or `DOZENS_PRICE`. When the customer needs a quote, the website should send style/color/size quantities to the pricing API, and the pricing app should resolve costs server-side.

## Minimum Fields Required For Pricing

For pricing APIs, the minimum row-level fields should be:

| Field | Required? | Purpose |
| --- | --- | --- |
| `brand` | Recommended | Useful for display, quote summary, filtering, and product matching. Can map from SanMar `MILL` when available. |
| `style` | Required | Stable customer/API product selector. Maps from `STYLE#`. |
| `productName` | Required | Human-readable quote summary. Maps from `PRODUCT_TITLE`. |
| `color` | Required for catalog apparel | Needed to select the correct SanMar row and customer-selected garment. Maps from `COLOR_NAME`. |
| `size` | Required for size-priced apparel | Needed to calculate size-level garment cost. Maps from `SIZE`. |
| `unitCost` | Required for pricing | Current formulas use SanMar `CASE_PRICE` as blank cost. |
| `sizeUpcharge` | Optional derived pricing helper | Useful for APIs if upcharges are separate from row-level unit cost. For current screen print and embroidery, size pricing comes from row `CASE_PRICE`; for current DTF, separate hardcoded size upcharges exist. |
| `category` | Recommended | Useful for routing caps, tees, polos, fleece, bags, and decoration restrictions. Maps from `CATEGORY_NAME`. |
| `imageUrl` | Optional for pricing, useful for summaries | Can help customer-safe quote responses or internal quote review. Should map from CDN image fields when available. |

Minimum internal pricing record:

```json
{
  "style": "BC3001",
  "productName": "Bella+Canvas Unisex Jersey Tee",
  "brand": "BELLA+CANVAS",
  "category": "T-Shirts",
  "color": "Black",
  "size": "L",
  "unitCost": 4.35,
  "source": {
    "vendor": "SanMar",
    "priceField": "CASE_PRICE"
  }
}
```

## Optional Fields Useful For Display

These fields are not required to calculate current apparel pricing, but they are useful for a customer catalog and quote UI:

- `description`
- `subcategory`
- `availableSizes`
- `status`
- `thumbnailUrl`
- `frontModelImageUrl`
- `backModelImageUrl`
- `frontFlatImageUrl`
- `backFlatImageUrl`
- `colorSwatchUrl`
- `colorProductImageUrl`
- `specSheetUrl`
- `decorationSpecSheetUrl`
- `measurementsUrl`
- `companionStyles`
- `pmsColor`
- `gtin`
- `pieceWeight`
- `caseSize`
- `inventoryKey`
- `sortOrder` or `sizeIndex`

Useful but sensitive fields:

- `unitCost`
- `casePrice`
- `piecePrice`
- `dozensPrice`
- `priceGroup`

These should be available only to the pricing engine or admin tools, not bundled into public website catalog files.

## Recommended Shared Catalog Structure

Use a normalized structure with three layers:

### 1. Product

One record per style.

```json
{
  "vendor": "SanMar",
  "style": "BC3001",
  "brand": "BELLA+CANVAS",
  "productName": "Unisex Jersey Short Sleeve Tee",
  "description": "Customer-safe product description",
  "category": "T-Shirts",
  "subcategory": "Fashion Tees",
  "availableSizes": ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
  "status": "Regular",
  "images": {
    "thumbnailUrl": "https://...",
    "frontModelUrl": "https://...",
    "backModelUrl": "https://...",
    "frontFlatUrl": "https://...",
    "backFlatUrl": "https://..."
  },
  "documents": {
    "specSheetUrl": "https://...",
    "decorationSpecSheetUrl": "https://..."
  },
  "companionStyles": ["BC3001Y"]
}
```

### 2. Variant

One record per style and color.

```json
{
  "vendor": "SanMar",
  "style": "BC3001",
  "color": "Black",
  "sanMarColor": "Black",
  "pmsColor": "",
  "images": {
    "swatchUrl": "https://...",
    "productImageUrl": "https://...",
    "thumbnailUrl": "https://..."
  }
}
```

### 3. Variant Size Pricing

One private/server-side record per style, color, and size.

```json
{
  "vendor": "SanMar",
  "style": "BC3001",
  "color": "Black",
  "size": "L",
  "unitCost": 4.35,
  "casePrice": 4.35,
  "piecePrice": 5.72,
  "dozensPrice": 4.89,
  "caseSize": 72,
  "pieceWeight": 0.31,
  "priceGroup": "NR",
  "inventoryKey": "12345",
  "sizeIndex": 4,
  "status": "Regular"
}
```

This structure lets:

- The website use product and variant data for browsing without exposing costs.
- The pricing app use private variant-size pricing data for calculations.
- APIs accept stable inputs like style, color, and size quantities.
- Screen print, DTF, DTG, and embroidery share one catalog lookup utility.

## Recommended File Layout

Short term, keep the existing files unchanged and add a shared loader later:

```text
lib/catalog/apparel-catalog.js
```

The loader should:

- Parse CSV correctly, including quoted commas.
- Normalize SanMar headers to internal field names.
- Build indexes by style, style/color, and style/color/size.
- Preserve current `CASE_PRICE` interpretation.
- Be usable from API routes and parity tests.

Recommended generated file structure:

```text
data/catalog/apparel/products.json
data/catalog/apparel/variants.json
data/catalog/apparel/pricing-private.json
public/catalog/apparel/products-part-001.json
public/catalog/apparel/products-part-002.json
public/catalog/apparel/variants-part-001.json
```

Important:

- Cost-bearing files should not live under `public` long term.
- Public website files should be display-only.
- Pricing APIs should resolve costs from server-side files or a private data source.

## Where Catalog Files Should Live

### Short Term

Keep the pricing data in the pricing app, because the pricing app is becoming the source of truth for calculations.

Recommended:

- Keep `public/data/SanMar_SDL_hue.csv` temporarily for parity while extracting engines.
- Do not change formulas or price interpretation.
- Do not import or process the large Excel file yet.
- Avoid putting new cost-bearing catalog files in `public`.

### Near Term

Use the same generated catalog schema in both repos:

- Website repo: public display catalog splits only.
- Pricing app repo: private pricing catalog plus any display fields needed for quote summaries.

This can be done by generating both outputs from the same SanMar source export. The source can initially be manually refreshed and committed in split/generated form.

### Long Term

Move the catalog to an external shared source:

- Private storage bucket.
- Database.
- Vendor catalog ingestion job.
- Shared package or internal data pipeline.

Recommended final ownership:

- Pricing app owns pricing interpretation and cost access.
- Website owns browsing experience.
- Shared ingestion pipeline owns SanMar normalization.
- Public APIs expose quote-safe results only.

## API Input Implications

Future apparel pricing APIs should not require the website to send unit costs. They should accept product selection and quantities, then let the pricing engine resolve costs.

Recommended apparel line item input shape:

```json
{
  "style": "BC3001",
  "color": "Black",
  "sizes": {
    "S": 12,
    "M": 24,
    "L": 24,
    "XL": 12,
    "2XL": 6
  }
}
```

Optional display-safe fields can be sent for validation or UX, but should not be trusted for pricing:

```json
{
  "productName": "Unisex Jersey Short Sleeve Tee",
  "brand": "BELLA+CANVAS"
}
```

The pricing app should treat these as advisory only and use its own catalog lookup for the canonical product name and cost.

## Refactor Recommendation Before Screen Print API

Before building `POST /api/pricing/screenprint`, add an apparel catalog module that can be tested independently:

```text
lib/catalog/apparel-catalog.js
```

Recommended functions:

- `parseApparelCatalogCsv(csvText)`
- `normalizeSanMarRow(row)`
- `loadApparelCatalog()`
- `findStyle(style)`
- `findVariant(style, color)`
- `findVariantSize(style, color, size)`
- `getAvailableColors(style)`
- `getAvailableSizes(style, color)`
- `calculateApparelLineCost(lineItem, catalog)`

Parity requirements:

- Screen printing must continue using `CASE_PRICE` exactly as it does today.
- DTG must preserve its current direct-print behavior.
- DTF must preserve its current selected-product `CASE_PRICE` plus hardcoded size-upcharge behavior.
- Embroidery must preserve its color/size lookup and fallback behavior.

## Answers To The Required Questions

1. Apparel catalog files currently exist at `public/SanMar_SDL_N.csv` and `public/data/SanMar_SDL_hue.csv`.

2. Current pricing uses `STYLE#`, `PRODUCT_TITLE`, `COLOR_NAME`, `SIZE`, and `CASE_PRICE`. DTF also tries to read `CASE_SIZE`, but the reduced CSV does not include it.

3. Missing customer catalog fields include description, brand/mill, images, swatches, category depth, product status, spec sheets, measurements, companion styles, GTIN, PMS color, inventory keys, and CDN image URLs.

4. The pricing app should use the same normalized catalog generation pipeline as the website, but not the same public cost-bearing files. The website should get display-safe split files; the pricing app should get private pricing data.

5. Minimum pricing fields are brand, style/SKU, product name, color, size, case price/unit cost, size upcharge when separate from unit cost, category, and optionally image URL for summaries.

6. Optional but useful display fields include descriptions, subcategories, product status, thumbnails, model images, flat images, color swatches, spec sheets, measurements, companion styles, PMS color, GTIN, inventory key, case size, piece weight, and size index.

7. Recommended shared structure is product, variant, and private variant-size pricing records generated from the same SanMar source.

8. Catalog data should live in both repos only as generated artifacts with different safety levels in the near term. The pricing app should own cost-bearing pricing data. The website should own display-only public catalog data. Long term, both should consume an external shared source or ingestion pipeline.

## Recommended Implementation Phases

### Phase A: Freeze Current Behavior

- Add fixtures around current screen print, DTG, DTF, and embroidery catalog lookup behavior.
- Capture the current `CASE_PRICE` interpretation.
- Capture DTF's current size-upcharge behavior separately from SanMar row pricing.

### Phase B: Add Shared Apparel Catalog Loader

- Add a robust CSV parser/loader outside UI components.
- Normalize master and reduced CSV columns into one internal shape.
- Keep existing components pointed at equivalent data.

### Phase C: Move Cost Data Server-Side

- Generate private pricing catalog files outside `public`.
- Keep public display catalog files cost-free.
- Update future APIs to load private pricing records server-side.

### Phase D: Build Apparel Pricing APIs

- Build screen print first.
- Then extract and expose DTG, DTF, and embroidery.
- Keep every API customer-safe and avoid returning cost, margin, profit, or internal calculations.

### Phase E: Externalize Catalog Source

- Move SanMar source data and generated artifacts to a shared private source.
- Add a repeatable refresh process.
- Version catalog snapshots so quote parity can be audited.
