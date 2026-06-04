# ACM Pricing API

## Endpoint

```text
POST /api/pricing/acm
```

Calculates customer-safe ACM / Maxmetal pricing using the shared general sign pricing engine.

## Request Body

```json
{
  "width": 32,
  "height": 48,
  "quantity": 4,
  "thickness": "6mm",
  "sides": "double",
  "contourCut": true,
  "glossLaminate": true,
  "rush": true
}
```

## Fields

- `width`: required positive number, inches.
- `height`: required positive number, inches.
- `quantity`: required positive number.
- `thickness`: required string, either `3mm` or `6mm`.
- `sides`: required string, either `single` or `double`.
- `contourCut`: optional boolean.
- `glossLaminate`: optional boolean.
- `rush`: optional boolean.

The current ACM pricing formula prices thickness, sides, dimensions, quantity, and contour cut. `glossLaminate` and `rush` are accepted for request compatibility, but the existing ACM formula does not add ACM-specific charges for them. When either is selected, the API returns a customer-safe warning instead of inventing new pricing behavior.

## Success Response

```json
{
  "ok": true,
  "product": "acm",
  "price": {
    "retail": 1607.01,
    "each": 401.7525
  },
  "currency": "USD",
  "summary": {
    "label": "ACM / Maxmetal",
    "width": 32,
    "height": 48,
    "quantity": 4,
    "thickness": "6mm",
    "sides": "double",
    "options": {
      "contourCut": true,
      "glossLaminate": true,
      "rush": true
    }
  },
  "warnings": [
    "Gloss laminate is accepted for request compatibility but is not priced by the current ACM formula.",
    "Rush is accepted for request compatibility but is not priced by the current ACM formula."
  ]
}
```

The response intentionally does not expose supplier costs, margin, profit, shipping breakdowns, sheet calculations, or internal pricing details.

## Validation Error Response

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "ACM pricing input is invalid.",
    "fields": {
      "thickness": "Must be 3mm or 6mm"
    }
  }
}
```

## Example Website Call

```js
const response = await fetch("https://quotes.huegraphics.cc/api/pricing/acm", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    width: 32,
    height: 48,
    quantity: 4,
    thickness: "6mm",
    sides: "double",
    contourCut: true,
    glossLaminate: true,
    rush: true
  })
});

const quote = await response.json();
console.log(quote.price.retail);
console.log(quote.price.each);
console.log(quote.warnings);
```

## Verification

The ACM API response shape is verified by:

```text
npm.cmd run test:pricing
```

That command runs the general sign parity fixtures and the public pricing API response-shape checks.
