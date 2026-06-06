# DTF Pricing API

## Endpoint

```text
POST /api/pricing/dtf
```

Calculates a customer-safe DTF estimate using the extracted DTF pricing engine and the private server-side apparel catalog.

Production URL:

```text
https://quotes.huegraphics.cc/api/pricing/dtf
```

## Request

### Standard Catalog Apparel

```json
{
  "mode": "standard",
  "apparel": {
    "source": "catalog",
    "style": "BC3001",
    "color": "Black",
    "sizes": {
      "S": 12,
      "M": 12,
      "L": 12,
      "XL": 12
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
    }
  ],
  "layout": {
    "optimize": true
  },
  "artwork": {
    "supplied": true,
    "status": "printReady"
  },
  "production": {
    "rush": false
  }
}
```

### DTF Only

```json
{
  "mode": "dtfOnly",
  "transfer": {
    "width": 11,
    "height": 10,
    "quantity": 25
  },
  "layout": {
    "optimize": true
  },
  "artwork": {
    "supplied": true,
    "status": "printReady"
  }
}
```

### Customer-Provided Apparel

```json
{
  "mode": "standard",
  "apparel": {
    "source": "customerProvided",
    "quantity": 30
  },
  "printLocations": [
    {
      "placement": "front",
      "preset": "fullFront",
      "enabled": true
    },
    {
      "placement": "leftSleeve",
      "enabled": true
    }
  ],
  "artwork": {
    "supplied": false,
    "status": "notSupplied"
  },
  "production": {
    "rush": true
  }
}
```

## Input Fields

- `mode`: required mode. Supported values are `standard` and `dtfOnly`.
- `apparel.source`: for standard mode, `catalog` or `customerProvided`. Defaults to `catalog`.
- `apparel.style`: required for catalog apparel.
- `apparel.color`: required for catalog apparel.
- `apparel.sizes`: required for catalog apparel. At least one size quantity must be greater than zero.
- `apparel.quantity`: required for customer-provided apparel.
- `transfer.width`: required positive number for DTF-only mode.
- `transfer.height`: required positive number for DTF-only mode.
- `transfer.quantity`: required positive number for DTF-only mode.
- `printLocations`: required non-empty array for standard mode.
- `layout.optimize`: optional boolean. Defaults to `true`.
- `artwork.supplied`: optional boolean.
- `artwork.status`: optional string. `printReady` avoids artwork warnings.
- `production.rush`: optional boolean. Rush is warning-only because current DTF has no rush formula.

Supported catalog size keys:

```text
XS, S, M, L, XL, 2XL, 3XL, 4XL, 5XL
```

Supported `printLocations[].placement` values:

```text
front, back, leftSleeve, rightSleeve, leftChest, pocket, custom
```

Supported `printLocations[].preset` values:

```text
leftChest, fullFront, fullBack, custom
```

Custom, pocket, and custom-sized locations require:

```json
{
  "size": {
    "width": 4,
    "height": 4
  }
}
```

Sleeve locations may omit size and will use the existing default sleeve size.

## Response

```json
{
  "ok": true,
  "product": "dtf",
  "price": {
    "retail": 1966,
    "each": 40.958333333333336
  },
  "currency": "USD",
  "summary": {
    "label": "DTF Transfers",
    "mode": "standard",
    "totalQuantity": 48,
    "locations": [
      {
        "placement": "front",
        "label": "Front",
        "size": {
          "width": 11,
          "height": 10
        }
      },
      {
        "placement": "back",
        "label": "Back",
        "size": {
          "width": 12.5,
          "height": 13
        }
      }
    ],
    "layout": {
      "optimize": true,
      "rollWidth": 22,
      "estimatedLinearInches": 1104,
      "totalTransfers": 96,
      "placedTransfers": 96,
      "rotationUsed": true
    },
    "options": {
      "artworkSupplied": true,
      "artworkStatus": "printReady",
      "rush": false
    },
    "apparel": {
      "source": "catalog",
      "style": "BC3001",
      "productName": "BELLA+CANVAS  Unisex Jersey Short Sleeve Tee. BC3001",
      "color": "Black",
      "sizes": {
        "S": 12,
        "M": 12,
        "L": 12,
        "XL": 12
      }
    },
    "sizePriceBreakdown": [
      {
        "label": "S-XL",
        "quantity": 48,
        "priceEach": 40.958333333333336
      }
    ]
  },
  "warnings": []
}
```

## Customer-Safe Fields

The response intentionally includes only:

- `ok`
- `product`
- `price.retail`
- `price.each`
- `currency`
- `summary`
- `warnings`

The response does not expose:

- SanMar `CASE_PRICE`
- supplier cost
- material cost
- direct cost
- profit
- margin
- markup
- admin overrides

## Validation Errors

Invalid requests return `ok: false` with a validation error and no server-side 500.

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "DTF pricing input is invalid.",
    "fields": {
      "apparel.style": "Unknown style"
    }
  }
}
```

Invalid JSON returns:

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_JSON",
    "message": "Request body must be valid JSON."
  }
}
```

## Warnings

Warnings may include:

- Artwork may require review before production.
- Rush production requires confirmation and is not priced separately in this estimate.
- One or more transfer sizes exceed the current DTF roll width and require review.
- Pocket print placement requires artwork and placement review.

## Pricing Behavior

The API uses existing DTF formulas only through:

```text
lib/pricing/dtf.js
```

It preserves:

- Standard catalog apparel mode.
- DTF-only mode.
- Customer-provided apparel mode.
- DTF layout optimization.
- 22 inch roll width.
- Sleeve add-ons.
- Oversized garment upcharges.
- Flat shipping.
- Current retail calculations.

The route loads apparel data with the shared apparel catalog loader from the private server-side catalog path.

## Verification

The DTF API response shape and customer-safe response are verified by:

```text
node scripts/verify-dtf-api-shape.mjs
```

The full pricing suite includes DTF API verification:

```text
npm run test:pricing
```
