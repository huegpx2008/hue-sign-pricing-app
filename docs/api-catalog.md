# Pricing API Catalog

This catalog summarizes the currently available public pricing API endpoints in this app.

All endpoints:

- Use `POST`.
- Accept JSON request bodies.
- Return customer-safe pricing only.
- Use `USD` as the currency.
- Do not expose costs, margins, profit, supplier pricing, shipping breakdowns, or internal calculations.

Production base URL:

```text
https://quotes.huegraphics.cc
```

Local development base URL:

```text
http://localhost:3000
```

Common request headers:

```http
Content-Type: application/json
```

## Banner

Endpoint URL:

```text
POST https://quotes.huegraphics.cc/api/pricing/banner
```

Supported inputs:

- `width`: required positive number, inches.
- `height`: required positive number, inches.
- `quantity`: required positive number.
- `material`: required string, one of `13-single`, `13-double`, `15-single`, `18-single`, or `18-double`.
- `polePocket`: optional boolean.
- `rope`: optional boolean.
- `windSlits`: optional boolean.
- `rush`: optional boolean.

Example request:

```json
{
  "width": 72,
  "height": 36,
  "quantity": 2,
  "material": "18-double",
  "polePocket": true,
  "rope": true,
  "windSlits": true,
  "rush": true
}
```

Example response:

```json
{
  "ok": true,
  "product": "banner",
  "price": {
    "retail": 1548,
    "each": 774
  },
  "currency": "USD",
  "summary": {
    "label": "Banner",
    "width": 72,
    "height": 36,
    "quantity": 2,
    "material": "18-double",
    "materialName": "18oz Double-Sided",
    "options": {
      "polePocket": true,
      "rope": true,
      "windSlits": true,
      "rush": true
    }
  },
  "warnings": []
}
```

## Yard Sign

Endpoint URL:

```text
POST https://quotes.huegraphics.cc/api/pricing/yard-sign
```

Supported inputs:

- `quantity`: required positive number.
- `sides`: required string, either `single` or `double`.
- `stakeType`: required string, one of `none`, `standard`, or `heavy-duty`.

This endpoint always prices the existing 18 x 24 Coroplast yard sign product.

Example request:

```json
{
  "quantity": 50,
  "sides": "double",
  "stakeType": "standard"
}
```

Example response:

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

## ACM

Endpoint URL:

```text
POST https://quotes.huegraphics.cc/api/pricing/acm
```

Supported inputs:

- `width`: required positive number, inches.
- `height`: required positive number, inches.
- `quantity`: required positive number.
- `thickness`: required string, either `3mm` or `6mm`.
- `sides`: required string, either `single` or `double`.
- `contourCut`: optional boolean.
- `glossLaminate`: optional boolean.
- `rush`: optional boolean.

The current ACM formula prices thickness, sides, dimensions, quantity, and contour cut. `glossLaminate` and `rush` are accepted for request compatibility, but are not priced by the current ACM formula.

Example request:

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

Example response:

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

## Vinyl

Endpoint URL:

```text
POST https://quotes.huegraphics.cc/api/pricing/vinyl
```

Supported inputs:

- `width`: required positive number, inches.
- `height`: required positive number, inches.
- `quantity`: required positive number.
- `material` or `type`: required string.
- `laminate`: optional string, one of `none`, `gloss`, or `matte`. Defaults to `gloss`.
- `contourCut`: optional boolean.
- `rush`: optional boolean.
- `gangLayout`: optional boolean.
- `optimizeLayout`: optional boolean alias for `gangLayout`.

Supported material values:

- `standard` or `standard-vinyl`.
- `reflective` or `reflective-vinyl`.
- `low-tack-wall` or `low-tack-wall-vinyl`.
- `premium-vehicle` or `premium-vehicle-vinyl`.

The current vinyl formula prices material, dimensions, quantity, contour cut, rush, and gang layout. `laminate` is accepted and included in the summary, but is not priced separately by the current vinyl formula.

Example request:

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

Example response:

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

## Custom-Cut Coroplast

Endpoint URL:

```text
POST https://quotes.huegraphics.cc/api/pricing/custom-cut-coroplast
```

Supported inputs:

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

The current custom-cut Coroplast formula prices dimensions, quantity, sides, contour cut, gloss finish, grommets, stake type, rush, and flute/layout behavior. `10mm` thickness is accepted, but is not priced separately by the current custom-cut Coroplast formula.

Example request:

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

Example response:

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

## Vehicle Magnet

Endpoint URL:

```text
POST https://quotes.huegraphics.cc/api/pricing/vehicle-magnet
```

Supported inputs:

- `width`: required positive number, inches.
- `height`: required positive number, inches.
- `quantity`: required positive number.
- `style` or `shape`: optional string, one of `rectangle`, `rounded-corners`, or `contour-cut`. Defaults to `rectangle`.
- `contourCut`: optional boolean. Maps to `style: "contour-cut"` when `style` or `shape` is not supplied.
- `roundedCorners`: optional boolean. Maps to `style: "rounded-corners"` when `style` or `shape` is not supplied.
- `rush`: optional boolean.

The current vehicle magnet formula prices custom size, quantity, contour cut, and rush. Rounded corners are accepted and summarized, but are not priced separately by the current vehicle magnet formula.

Example request:

```json
{
  "width": 30,
  "height": 18,
  "quantity": 5,
  "style": "contour-cut",
  "rush": true
}
```

Example response:

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

## Error Shape

Validation errors return `ok: false` with a stable error envelope:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Pricing input is invalid.",
    "fields": {
      "quantity": "Required"
    }
  }
}
```

The exact `message` and `fields` values vary by endpoint and invalid input.

## Website Usage Pattern

Any customer-facing website can call these endpoints with `fetch`:

```js
const response = await fetch("https://quotes.huegraphics.cc/api/pricing/banner", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    width: 72,
    height: 36,
    quantity: 2,
    material: "18-double",
    polePocket: true,
    rope: true,
    windSlits: true,
    rush: true
  })
});

const quote = await response.json();

if (quote.ok) {
  console.log(quote.price.retail);
  console.log(quote.price.each);
}
```

## Verification

The pricing parity fixtures and public API response-shape checks are run with:

```text
npm.cmd run test:pricing
```
