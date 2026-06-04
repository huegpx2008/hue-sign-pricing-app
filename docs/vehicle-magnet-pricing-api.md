# Vehicle Magnet Pricing API

## Endpoint

```text
POST /api/pricing/vehicle-magnet
```

Calculates customer-safe custom vehicle magnet pricing using the shared general sign pricing engine.

## Request Body

```json
{
  "width": 30,
  "height": 18,
  "quantity": 5,
  "style": "contour-cut",
  "rush": true
}
```

`shape` may be used instead of `style`.

## Fields

- `width`: required positive number, inches.
- `height`: required positive number, inches.
- `quantity`: required positive number.
- `style` or `shape`: optional string, one of `rectangle`, `rounded-corners`, or `contour-cut`. Defaults to `rectangle`.
- `rush`: optional boolean.

Boolean compatibility fields:

- `contourCut: true` maps to `style: "contour-cut"` when `style`/`shape` is not supplied.
- `roundedCorners: true` maps to `style: "rounded-corners"` when `style`/`shape` is not supplied.

The endpoint uses the existing custom vehicle magnet formula because the public request includes arbitrary width and height. The current formula prices custom size, quantity, contour cut, and rush. Rounded corners are accepted and summarized, but the current formula does not price rounded corners separately. When rounded corners are selected, the API returns a customer-safe warning instead of inventing new pricing behavior.

## Success Response

```json
{
  "ok": true,
  "product": "vehicle-magnet",
  "price": {
    "retail": 1098.25,
    "each": 219.65
  },
  "currency": "USD",
  "summary": {
    "label": "Custom Cut Vehicle Magnets",
    "width": 30,
    "height": 18,
    "quantity": 5,
    "style": "contour-cut",
    "options": {
      "roundedCorners": false,
      "contourCut": true,
      "rush": true
    }
  },
  "warnings": []
}
```

The response intentionally does not expose supplier costs, margin, profit, shipping breakdowns, material cost, square-inch totals, or internal pricing calculations.

## Validation Error Response

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Vehicle magnet pricing input is invalid.",
    "fields": {
      "style": "Must be rectangle, rounded-corners, or contour-cut"
    }
  }
}
```

## Example Website Call

```js
const response = await fetch("https://quotes.huegraphics.cc/api/pricing/vehicle-magnet", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    width: 30,
    height: 18,
    quantity: 5,
    style: "contour-cut",
    rush: true
  })
});

const quote = await response.json();
console.log(quote.price.retail);
console.log(quote.price.each);
console.log(quote.warnings);
```

## Verification

The vehicle magnet API response shape is verified by:

```text
npm.cmd run test:pricing
```

That command runs the general sign parity fixtures and the public pricing API response-shape checks.
