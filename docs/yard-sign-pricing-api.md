# Yard Sign Pricing API

## Endpoint

```text
POST /api/pricing/yard-sign
```

Calculates customer-safe 18x24 Coroplast yard sign pricing using the shared general sign pricing engine.

## Request Body

```json
{
  "quantity": 50,
  "sides": "double",
  "stakeType": "standard"
}
```

## Fields

- `quantity`: required positive number.
- `sides`: required string, either `single` or `double`.
- `stakeType`: required string, one of `none`, `standard`, or `heavy-duty`.

The endpoint always prices the existing 18x24 yard sign product:

- Width: `24`
- Height: `18`
- Display size: `18 x 24`
- Product engine mapping: `product: "coro"`

## Success Response

```json
{
  "ok": true,
  "product": "yard-sign",
  "price": {
    "retail": 807.5,
    "each": 16.15
  },
  "currency": "USD",
  "summary": {
    "label": "Coroplast Yard Signs",
    "size": "18 x 24",
    "width": 24,
    "height": 18,
    "quantity": 50,
    "sides": "double",
    "stakeType": "standard"
  },
  "warnings": []
}
```

The response intentionally does not expose internal cost, profit, margin, supplier pricing, shipping, or admin breakdown fields.

## Validation Error Response

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Yard sign pricing input is invalid.",
    "fields": {
      "sides": "Must be single or double"
    }
  }
}
```

## Example Website Call

```js
const response = await fetch("https://quotes.huegraphics.cc/api/pricing/yard-sign", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    quantity: 50,
    sides: "double",
    stakeType: "standard"
  })
});

const quote = await response.json();
console.log(quote.price.retail);
console.log(quote.price.each);
```

## Verification

The yard sign API response shape is verified by:

```text
npm.cmd run test:pricing
```

That command runs the general sign parity fixtures, the banner endpoint response-shape check, and the yard sign endpoint response-shape check.
