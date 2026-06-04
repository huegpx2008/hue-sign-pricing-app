# Vinyl Pricing API

## Endpoint

```text
POST /api/pricing/vinyl
```

Calculates customer-safe vinyl pricing using the shared general sign pricing engine.

## Request Body

```json
{
  "width": 14,
  "height": 10,
  "quantity": 35,
  "material": "premium-vehicle",
  "laminate": "matte",
  "contourCut": true,
  "rush": true,
  "gangLayout": true
}
```

`type` may be used instead of `material`.

## Fields

- `width`: required positive number, inches.
- `height`: required positive number, inches.
- `quantity`: required positive number.
- `material` or `type`: required string.
- `laminate`: optional string, one of `none`, `gloss`, or `matte`. Defaults to `gloss`.
- `contourCut`: optional boolean.
- `rush`: optional boolean.
- `gangLayout`: optional boolean.
- `optimizeLayout`: optional boolean alias for `gangLayout`.

## Material Values

- `standard` or `standard-vinyl`
- `reflective` or `reflective-vinyl`
- `low-tack-wall` or `low-tack-wall-vinyl`
- `premium-vehicle` or `premium-vehicle-vinyl`

Current engine mapping:

- `standard`: GF 203OAPAE Standard Vinyl
- `reflective`: Oralite 5600 Reflective Film
- `low-tack-wall`: Low Tac Wall Vinyl
- `premium-vehicle`: 3M Controltac Premium Vehicle Vinyl

The current vinyl pricing formula prices material/type, dimensions, quantity, contour cut, rush, and gang layout. `laminate` is accepted for request compatibility and included in the summary, but the current formula does not price laminate separately. When `laminate` is sent, the API returns a customer-safe warning instead of inventing new pricing behavior.

## Success Response

```json
{
  "ok": true,
  "product": "vinyl",
  "price": {
    "retail": 2218.8099999999995,
    "each": 63.39457142857142
  },
  "currency": "USD",
  "summary": {
    "label": "Printed Vinyl",
    "width": 14,
    "height": 10,
    "quantity": 35,
    "material": "premium-vehicle",
    "materialName": "3M Controltac Premium Vehicle Vinyl",
    "laminate": "matte",
    "laminateName": "Matte Laminate",
    "options": {
      "contourCut": true,
      "rush": true,
      "gangLayout": true
    }
  },
  "warnings": [
    "Laminate is accepted for request compatibility but is not priced separately by the current vinyl formula."
  ]
}
```

The response intentionally does not expose supplier costs, margin, profit, shipping breakdowns, roll usage, billable square footage, layout details, or internal pricing calculations.

## Validation Error Response

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Vinyl pricing input is invalid.",
    "fields": {
      "material": "Must be standard, reflective, low-tack-wall, or premium-vehicle"
    }
  }
}
```

## Example Website Call

```js
const response = await fetch("https://quotes.huegraphics.cc/api/pricing/vinyl", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    width: 14,
    height: 10,
    quantity: 35,
    material: "premium-vehicle",
    laminate: "matte",
    contourCut: true,
    rush: true,
    gangLayout: true
  })
});

const quote = await response.json();
console.log(quote.price.retail);
console.log(quote.price.each);
console.log(quote.warnings);
```

## Verification

The vinyl API response shape is verified by:

```text
npm.cmd run test:pricing
```

That command runs the general sign parity fixtures and the public pricing API response-shape checks.
