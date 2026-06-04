# Custom-Cut Coroplast Pricing API

## Endpoint

```text
POST /api/pricing/custom-cut-coroplast
```

Calculates customer-safe custom-cut Coroplast pricing using the shared general sign pricing engine.

## Request Body

```json
{
  "width": 20,
  "height": 30,
  "quantity": 18,
  "thickness": "10mm",
  "sides": "double",
  "contourCut": true,
  "glossLaminate": true,
  "grommets": true,
  "stakeType": "heavy-duty",
  "rush": true,
  "fluteDirection": "best"
}
```

## Fields

- `width`: required positive number, inches.
- `height`: required positive number, inches.
- `quantity`: required positive number.
- `thickness`: required string, either `4mm` or `10mm`.
- `sides`: required string, either `single` or `double`.
- `contourCut`: optional boolean.
- `glossLaminate`: optional boolean.
- `grommets`: optional boolean.
- `stakeType`: optional string, one of `none`, `standard`, or `heavy-duty`. Defaults to `none`.
- `rush`: optional boolean.
- `fluteDirection`: optional string, one of `vertical`, `horizontal`, or `best`. Defaults to `best`.

The current custom-cut Coroplast formula prices dimensions, quantity, sides, contour cut, gloss finish, grommets, stake type, rush, and flute/layout behavior. `10mm` thickness is accepted for request compatibility, but the current formula does not price 10mm separately from the existing Coroplast calculation. When `10mm` is selected, the API returns a customer-safe warning instead of inventing new pricing behavior.

## Success Response

```json
{
  "ok": true,
  "product": "custom-cut-coroplast",
  "price": {
    "retail": 1324.4499999999998,
    "each": 73.58055555555555
  },
  "currency": "USD",
  "summary": {
    "label": "Custom Cut Coro Signs",
    "width": 20,
    "height": 30,
    "quantity": 18,
    "thickness": "10mm",
    "sides": "double",
    "fluteDirection": "best",
    "options": {
      "contourCut": true,
      "glossLaminate": true,
      "grommets": true,
      "stakeType": "heavy-duty",
      "rush": true
    }
  },
  "warnings": [
    "10mm thickness is accepted for request compatibility but is not priced separately by the current custom-cut Coroplast formula.",
    "Gloss laminate uses the existing Coroplast gloss finish pricing behavior."
  ]
}
```

The response intentionally does not expose supplier costs, margin, profit, shipping breakdowns, sheet layout, sheet counts, or internal pricing calculations.

## Validation Error Response

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Custom-cut Coroplast pricing input is invalid.",
    "fields": {
      "thickness": "Must be 4mm or 10mm"
    }
  }
}
```

## Example Website Call

```js
const response = await fetch("https://quotes.huegraphics.cc/api/pricing/custom-cut-coroplast", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    width: 20,
    height: 30,
    quantity: 18,
    thickness: "10mm",
    sides: "double",
    contourCut: true,
    glossLaminate: true,
    grommets: true,
    stakeType: "heavy-duty",
    rush: true,
    fluteDirection: "best"
  })
});

const quote = await response.json();
console.log(quote.price.retail);
console.log(quote.price.each);
console.log(quote.warnings);
```

## Verification

The custom-cut Coroplast API response shape is verified by:

```text
npm.cmd run test:pricing
```

That command runs the general sign parity fixtures and the public pricing API response-shape checks.
