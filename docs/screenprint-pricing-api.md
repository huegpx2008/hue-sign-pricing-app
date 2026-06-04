# Screen Print Pricing API

## Endpoint

```text
POST /api/pricing/screenprint
```

Calculates a customer-safe screen printing estimate using the existing screen printing pricing logic and the private server-side apparel catalog.

Production URL:

```text
https://quotes.huegraphics.cc/api/pricing/screenprint
```

## Request Body

```json
{
  "lineItems": [
    {
      "style": "2000",
      "color": "Black",
      "sizes": {
        "S": 12,
        "M": 12,
        "L": 12,
        "XL": 12,
        "2XL": 6
      }
    }
  ],
  "locations": [
    { "name": "Front", "colors": 1 },
    { "name": "Back", "colors": 2 }
  ],
  "sameDesign": true,
  "darkGarments": true,
  "whiteUnderbase": true,
  "setupFeeEnabled": true
}
```

## Input Schema

### `lineItems`

Required array of garment selections.

Each item:

- `style`: required SanMar style/SKU.
- `color`: required garment color.
- `sizes`: required object of size quantities.

Supported size keys:

- `XS`
- `S`
- `M`
- `L`
- `XL`
- `2XL`
- `3XL`
- `4XL`
- `5XL`
- `6XL`

Quantities must be non-negative numbers, and at least one size quantity must be greater than zero.

### `locations`

Optional array of print locations. Defaults to one front, one-color print when omitted.

Each location:

- `name`: required location name.
- `colors`: required integer from `1` to `4`.

The first location uses the existing first-side screen print matrix. Additional locations use the existing additional-side matrix.

### Options

- `sameDesign`: optional boolean. Defaults to `true`. When true, multiple garment line items are combined for screen print quantity tier eligibility.
- `darkGarments`: optional boolean. Adds a customer-safe review warning.
- `whiteUnderbase`: optional boolean. Adds a customer-safe review warning.
- `setupFeeEnabled`: optional boolean. Defaults to `true`. Preserves the existing screen print setup fee behavior.

## Success Response

```json
{
  "ok": true,
  "product": "screenprint",
  "price": {
    "retail": 689.203,
    "each": 12.763018518518518
  },
  "currency": "USD",
  "summary": {
    "label": "Screen Printing",
    "totalQuantity": 54,
    "sameDesign": true,
    "setupFeeEnabled": true,
    "lineItems": [
      {
        "style": "2000",
        "productName": "Gildan - Ultra Cotton 100% US Cotton T-Shirt.  2000",
        "color": "Black",
        "quantity": 54,
        "sizes": {
          "S": 12,
          "M": 12,
          "L": 12,
          "XL": 12,
          "2XL": 6
        }
      }
    ],
    "locations": [
      {
        "name": "Front",
        "colors": 1
      },
      {
        "name": "Back",
        "colors": 2
      }
    ],
    "options": {
      "darkGarments": true,
      "whiteUnderbase": true
    }
  },
  "warnings": [
    "Dark garments or white underbase requests may affect final setup and require review."
  ]
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

- garment cost
- supplier cost
- `CASE_PRICE`
- margin
- profit
- markup
- print matrix internals
- setup/admin breakdowns

## Validation Error Response

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Screen print pricing input is invalid.",
    "fields": {
      "lineItems.0.style": "Unknown style"
    }
  }
}
```

## Warnings

Warnings may include:

- Screen printing usually starts at 24 pieces.
- Mixed garment colors are present; artwork and ink setup may require review.
- Dark garments or white underbase requests may affect final setup and require review.
- Separate designs are priced as separate screen print groups.

## Limitations And Assumptions

- The endpoint uses the existing screen printing formulas only.
- Garment blank cost is resolved server-side from private SanMar `CASE_PRICE` data.
- The website should not send garment cost or supplier pricing.
- `darkGarments` and `whiteUnderbase` currently produce review warnings only; they do not add new pricing formulas.
- When `sameDesign` is `true`, line item quantities are combined for quantity-tier eligibility.
- When `sameDesign` is `false`, line items are priced as separate screen print groups using the same existing matrices.
- Final production review may still be needed for artwork, ink color, underbase, garment compatibility, and mixed garment colors.

## Verification

The screen print API response shape and pricing parity are verified by:

```text
npm.cmd run test:pricing
```
