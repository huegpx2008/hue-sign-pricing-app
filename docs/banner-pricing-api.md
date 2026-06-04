# Banner Pricing API

## Endpoint

```text
POST /api/pricing/banner
```

Calculates customer-safe banner pricing using the shared general sign pricing engine.

## Request Body

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

## Fields

- `width`: required positive number, inches.
- `height`: required positive number, inches.
- `quantity`: required positive number.
- `material`: required banner material key.
- `polePocket`: optional boolean.
- `rope`: optional boolean.
- `windSlits`: optional boolean.
- `rush`: optional boolean.

Current material keys:

- `13-single`
- `13-double`
- `15-single`
- `18-single`
- `18-double`

## Success Response

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

The response intentionally does not expose internal cost, profit, margin, supplier rate, shipping, or admin breakdown fields.

## Validation Error Response

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Banner pricing input is invalid.",
    "fields": {
      "quantity": "Required"
    }
  }
}
```

## Verification

The banner API response shape is verified by:

```text
npm.cmd run test:pricing
```

That command runs the general sign parity fixtures and the banner endpoint response-shape check.
