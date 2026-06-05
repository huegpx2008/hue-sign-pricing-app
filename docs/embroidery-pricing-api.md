# Embroidery Pricing API

## Endpoint

`POST /api/pricing/embroidery`

Production URL:

`https://quotes.huegraphics.cc/api/pricing/embroidery`

The route uses the shared apparel catalog loader and loads the cost-bearing SanMar catalog from the private server-side catalog path. It does not expose catalog costs, margins, supplier pricing, profit, or internal calculation details.

## Request

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

## Input Fields

- `lineItems`: required array of garment line items.
- `lineItems[].style`: required SanMar style/SKU.
- `lineItems[].color`: required catalog color name.
- `lineItems[].sizes`: required object of size quantities. At least one size quantity must be greater than zero.
- `locations`: required array of embroidery locations. The current API uses the first location for pricing parity with the existing calculator.
- `locations[].placement`: required placement name.
- `locations[].stitchCount`: required positive number.
- `locations[].threadColors`: required positive number.
- `locations[].puff3mm`: optional boolean.
- `digitizingRequired`: optional boolean.
- `names.enabled`: optional boolean.
- `names.large`: optional boolean.
- `numbers.enabled`: optional boolean.
- `numbers.large`: optional boolean.

## Response

```json
{
  "ok": true,
  "product": "embroidery",
  "price": {
    "retail": 1545.1,
    "each": 40.66052631578947
  },
  "currency": "USD",
  "summary": {
    "label": "Embroidery",
    "totalQuantity": 38,
    "lineItems": [
      {
        "style": "K540",
        "productName": "Port Authority Silk Touch Performance Polo. K540",
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
    "location": {
      "placement": "Left Chest",
      "stitchCount": 8000,
      "threadColors": 3,
      "puff3mm": false
    },
    "options": {
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
  },
  "warnings": [
    "Digitizing was included for this estimate and final artwork may require review."
  ]
}
```

Prices are calculated with the existing embroidery engine. The public response intentionally omits internal costs, margins, supplier costs, CASE_PRICE, profit, and calculation breakdowns.

## Validation Errors

Invalid requests return JSON with `ok: false` and a validation error object.

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Embroidery pricing input is invalid.",
    "fields": {
      "lineItems.0.style": "Unknown style"
    }
  }
}
```

## Limitations

- Multi-location embroidery is accepted, but only the first location is used for current pricing parity.
- If multiple locations are submitted, the response includes a review warning.
- Public API requests cannot use the admin target retail override.
- Final artwork, garment suitability, and puff embroidery may still require human review.
