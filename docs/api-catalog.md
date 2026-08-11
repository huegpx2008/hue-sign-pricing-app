# Pricing API Catalog

This catalog summarizes the currently available public pricing API endpoints in this app.

All endpoints:

- Use `POST`.
- Accept JSON request bodies.
- Return customer-safe pricing only.
- Use `USD` as the currency.
- Do not expose costs, margins, profit, supplier pricing, shipping breakdowns, or internal calculations.

The banner, yard-sign, and ACM routes have one server-only extension for Hue HQ.
When `Authorization: Bearer <HUE_PRICING_INTERNAL_API_SECRET>` matches the
configured 32+ character secret, the response also contains `internalCost` with
`cost`, `materialCost`, `shipping`, and `otherDirectCost`. Missing, invalid, or
unconfigured authorization returns the unchanged public response and no internal
fields. This secret must never use a `NEXT_PUBLIC_` prefix.

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

## Mesh Banner

Endpoint URL:

```text
POST https://quotes.huegraphics.cc/api/pricing/mesh-banner
```

Supported inputs:

- `width`: required positive number, inches.
- `height`: required positive number, inches.
- `quantity`: required positive number.
- `polePocket`: optional boolean.
- `rope`: optional boolean.
- `webbing`: optional boolean.
- `grommets`: optional boolean.
- `welding`: optional boolean.
- `rush`: optional boolean.

The current mesh banner formula prices dimensions, quantity, pole pocket, rope, webbing, and rush. `grommets` and `welding` are accepted for request compatibility, but are not priced separately.

Example request:

```json
{
  "width": 120,
  "height": 60,
  "quantity": 3,
  "polePocket": true,
  "rope": true,
  "webbing": true,
  "grommets": true,
  "welding": true,
  "rush": true
}
```

Example response:

```json
{
  "ok": true,
  "product": "mesh-banner",
  "price": {
    "retail": 3240,
    "each": 1080
  },
  "currency": "USD",
  "summary": {
    "label": "Mesh Banner",
    "width": 120,
    "height": 60,
    "quantity": 3,
    "options": {
      "polePocket": true,
      "rope": true,
      "webbing": true,
      "grommets": true,
      "welding": true,
      "rush": true
    }
  },
  "warnings": [
    "Grommets are accepted for request compatibility but are not priced separately by the current mesh banner formula.",
    "Welding is accepted for request compatibility but is not priced separately by the current mesh banner formula."
  ]
}
```

## Poster

Endpoint URL:

```text
POST https://quotes.huegraphics.cc/api/pricing/poster
```

Supported inputs:

- `width`: required positive number, inches.
- `height`: required positive number, inches.
- `quantity`: required positive number.
- `rush`: optional boolean.

Example request:

```json
{
  "width": 48,
  "height": 96,
  "quantity": 3,
  "rush": true
}
```

Example response:

```json
{
  "ok": true,
  "product": "poster",
  "price": {
    "retail": 970,
    "each": 323.3333333333333
  },
  "currency": "USD",
  "summary": {
    "label": "Poster Paper",
    "width": 48,
    "height": 96,
    "quantity": 3,
    "options": {
      "rush": true
    }
  },
  "warnings": []
}
```

## Acrylic

Endpoint URL:

```text
POST https://quotes.huegraphics.cc/api/pricing/acrylic
```

Supported inputs:

- `width`: required positive number, inches.
- `height`: required positive number, inches.
- `quantity`: required positive number.
- `contourCut`: optional boolean.
- `roundedCorners`: optional boolean.
- `standOffs` or `standoffs`: optional boolean.
- `standOffQty`: optional non-negative number. Defaults to `4`.
- `standOffColor`: optional string, either `silver` or `black`. Defaults to `silver`.
- `rush`: optional boolean.

The current acrylic formula prices dimensions, quantity, contour cut, rounded corners, and stand-offs. `rush` is accepted for request compatibility, but is not priced by the current acrylic formula.

Example request:

```json
{
  "width": 24,
  "height": 36,
  "quantity": 2,
  "contourCut": true,
  "roundedCorners": true,
  "standOffs": true,
  "standOffQty": 8,
  "standOffColor": "black",
  "rush": true
}
```

Example response:

```json
{
  "ok": true,
  "product": "acrylic",
  "price": {
    "retail": 560.05,
    "each": 280.025
  },
  "currency": "USD",
  "summary": {
    "label": "Acrylic",
    "width": 24,
    "height": 36,
    "quantity": 2,
    "options": {
      "contourCut": true,
      "roundedCorners": true,
      "standOffs": true,
      "standOffQty": 8,
      "standOffColor": "black",
      "standOffColorName": "Black",
      "rush": true
    }
  },
  "warnings": [
    "Rush is accepted for request compatibility but is not priced by the current acrylic formula."
  ]
}
```

## Foamcore

Endpoint URL:

```text
POST https://quotes.huegraphics.cc/api/pricing/foamcore
```

Supported inputs:

- `width`: required positive number, inches.
- `height`: required positive number, inches.
- `quantity`: required positive number.
- `sides`: required string, either `single` or `double`.
- `contourCut`: optional boolean.
- `glossLaminate`: optional boolean.
- `rush`: optional boolean.
- `customCut`: optional boolean.

The current foamcore formula prices dimensions, quantity, sides, contour cut, gloss finish, and rush. `customCut` is accepted for request compatibility, but is not priced separately.

Example request:

```json
{
  "width": 24,
  "height": 36,
  "quantity": 9,
  "sides": "double",
  "contourCut": true,
  "glossLaminate": true,
  "rush": true,
  "customCut": true
}
```

Example response:

```json
{
  "ok": true,
  "product": "foamcore",
  "price": {
    "retail": 1509.0249999999999,
    "each": 167.66944444444442
  },
  "currency": "USD",
  "summary": {
    "label": "Foamcore",
    "width": 24,
    "height": 36,
    "quantity": 9,
    "sides": "double",
    "options": {
      "contourCut": true,
      "glossLaminate": true,
      "rush": true,
      "customCut": true
    }
  },
  "warnings": [
    "Custom cut is accepted for request compatibility but is not priced separately by the current foamcore formula."
  ]
}
```

## PVC

Endpoint URL:

```text
POST https://quotes.huegraphics.cc/api/pricing/pvc
```

Supported inputs:

- `width`: required positive number, inches.
- `height`: required positive number, inches.
- `quantity`: required positive number.
- `type` or `material`: optional exact PVC type, one of `3-single`, `3-double`, `6-single`, or `6-double`.
- `thickness`: required when `type` is omitted, either `3mm` or `6mm`.
- `sides`: required when `type` is omitted, either `single` or `double`.
- `contourCut`: optional boolean.
- `rush`: optional boolean.
- `customCut`: optional boolean.

The current PVC formula prices dimensions, quantity, PVC type, contour cut, and rush. `customCut` is accepted for request compatibility, but is not priced separately.

Example request:

```json
{
  "width": 18,
  "height": 24,
  "quantity": 16,
  "thickness": "6mm",
  "sides": "double",
  "contourCut": true,
  "rush": true,
  "customCut": true
}
```

Example response:

```json
{
  "ok": true,
  "product": "pvc",
  "price": {
    "retail": 1406.1,
    "each": 87.88125
  },
  "currency": "USD",
  "summary": {
    "label": "PVC",
    "width": 18,
    "height": 24,
    "quantity": 16,
    "thickness": "6mm",
    "sides": "double",
    "type": "6-double",
    "typeName": "6mm Double-Sided",
    "options": {
      "contourCut": true,
      "rush": true,
      "customCut": true
    }
  },
  "warnings": [
    "Custom cut is accepted for request compatibility but is not priced separately by the current PVC formula."
  ]
}
```

## Polystyrene

Endpoint URL:

```text
POST https://quotes.huegraphics.cc/api/pricing/polystyrene
```

Supported inputs:

- `width`: required positive number, inches.
- `height`: required positive number, inches.
- `quantity`: required positive number.
- `sides`: required string, either `single` or `double`.
- `contourCut`: optional boolean.
- `glossLaminate`: optional boolean.
- `rush`: optional boolean.
- `customCut`: optional boolean.

The current polystyrene formula prices dimensions, quantity, sides, contour cut, gloss finish, and rush. `customCut` is accepted for request compatibility, but is not priced separately.

Example request:

```json
{
  "width": 18,
  "height": 24,
  "quantity": 16,
  "sides": "double",
  "contourCut": true,
  "glossLaminate": true,
  "rush": true,
  "customCut": true
}
```

Example response:

```json
{
  "ok": true,
  "product": "polystyrene",
  "price": {
    "retail": 1199.1,
    "each": 74.94375
  },
  "currency": "USD",
  "summary": {
    "label": "Polystyrene .03",
    "width": 18,
    "height": 24,
    "quantity": 16,
    "sides": "double",
    "options": {
      "contourCut": true,
      "glossLaminate": true,
      "rush": true,
      "customCut": true
    }
  },
  "warnings": [
    "Custom cut is accepted for request compatibility but is not priced separately by the current polystyrene formula."
  ]
}
```

## Aluminum

Endpoint URL:

```text
POST https://quotes.huegraphics.cc/api/pricing/aluminum
```

Supported inputs:

- `width`: required positive number, inches.
- `height`: required positive number, inches.
- `quantity`: required positive number.
- `type` or `material`: optional exact aluminum type, one of `040-single`, `040-double`, `080-single`, or `080-double`.
- `thickness`: required when `type` is omitted, either `040` or `080`.
- `sides`: required when `type` is omitted, either `single` or `double`.
- `contourCut`: optional boolean.
- `roundedCorners`: optional boolean.
- `rush`: optional boolean.

The current aluminum formula prices dimensions, quantity, aluminum type, contour cut, and rounded corners. `rush` is accepted for request compatibility, but is not priced by the current aluminum formula.

Example request:

```json
{
  "width": 24,
  "height": 36,
  "quantity": 12,
  "thickness": "080",
  "sides": "double",
  "contourCut": true,
  "roundedCorners": true,
  "rush": true
}
```

Example response:

```json
{
  "ok": true,
  "product": "aluminum",
  "price": {
    "retail": 3308.8799999999997,
    "each": 275.73999999999995
  },
  "currency": "USD",
  "summary": {
    "label": "Aluminum",
    "width": 24,
    "height": 36,
    "quantity": 12,
    "thickness": ".080",
    "sides": "double",
    "type": "080-double",
    "typeName": ".080 Double-Sided",
    "options": {
      "contourCut": true,
      "roundedCorners": true,
      "rush": true
    }
  },
  "warnings": [
    "Rush is accepted for request compatibility but is not priced by the current aluminum formula."
  ]
}
```

## Business Card

Endpoint URL:

```text
POST https://quotes.huegraphics.cc/api/pricing/business-card
```

Supported inputs:

- `quantity`: required number, one of `250`, `500`, or `1000`.
- `sides`: required string, either `single` or `double`.
- `coating`: required string, either `Gloss Laminate` or `No Coating`.
- `orientation`: required string, either `Landscape` or `Portrait`.
- `rush`: optional boolean.

The current business card formula prices quantity, sides, and rush. `coating` and `orientation` are accepted for request compatibility, but are not priced separately.

Example request:

```json
{
  "quantity": 1000,
  "sides": "double",
  "coating": "Gloss Laminate",
  "orientation": "Landscape",
  "rush": true
}
```

Example response:

```json
{
  "ok": true,
  "product": "business-card",
  "price": {
    "retail": 139.98,
    "each": 0.13998
  },
  "currency": "USD",
  "summary": {
    "label": "Business Cards",
    "quantity": 1000,
    "sides": "double",
    "coating": "Gloss Laminate",
    "orientation": "Landscape",
    "options": {
      "rush": true
    }
  },
  "warnings": [
    "Coating is accepted for request compatibility but is not priced separately by the current business card formula.",
    "Orientation is accepted for request compatibility but is not priced by the current business card formula."
  ]
}
```

## Handheld Paper

Endpoint URL:

```text
POST https://quotes.huegraphics.cc/api/pricing/handheld-paper
```

Supported inputs:

- `quantity`: required positive number.
- `size`: required string. Accepts the existing size keys, such as `3.5x2.5`, `5x3`, `6x4`, `7x5`, `9x4`, `9x6`, `11x8.5`, `14x11`, `16x12`, `17x11`, `12x18`, `20x16`, or `18x28`.
- `sides`: required string, either `single` or `double`.
- `coating`: required string, either `Gloss Laminate` or `No Coating`.
- `orientation`: required string, either `Landscape` or `Portrait`.
- `rush`: optional boolean.

The current handheld 16pt paper formula prices quantity, selected size, and rush. `sides`, `coating`, and `orientation` are accepted for request compatibility, but are not priced separately.

Example request:

```json
{
  "quantity": 275,
  "size": "9x6",
  "sides": "double",
  "coating": "No Coating",
  "orientation": "Portrait",
  "rush": true
}
```

Example response:

```json
{
  "ok": true,
  "product": "handheld-paper",
  "price": {
    "retail": 688.6874285714287,
    "each": 2.5043179220779224
  },
  "currency": "USD",
  "summary": {
    "label": "Handheld 16pt Paper",
    "quantity": 275,
    "size": "9x6",
    "sizeLabel": "9\"x6\"",
    "sides": "double",
    "coating": "No Coating",
    "orientation": "Portrait",
    "options": {
      "rush": true
    }
  },
  "warnings": [
    "Sides are accepted for request compatibility but are not priced separately by the current handheld paper formula.",
    "Coating is accepted for request compatibility but is not priced separately by the current handheld paper formula.",
    "Orientation is accepted for request compatibility but is not priced by the current handheld paper formula."
  ]
}
```

## Carbonless

Endpoint URL:

```text
POST https://quotes.huegraphics.cc/api/pricing/carbonless
```

Supported inputs:

- `formType`: required string, one of `2 Part`, `3 Part`, or `4 Part`.
- `size`: required string, one of `8.5" x 11"`, `5.5" x 8.5"`, or `8.5" x 14"`.
- `quantity`: required number, one of `100`, `250`, `500`, `1000`, `2000`, `2500`, `5000`, `7500`, or `10000`.
- `printType`: required string, either `Black Ink` or `Full Color`.
- `printSides`: required string, either `Front Only` or `Front and Back`.
- `numbering`: optional boolean.
- `wraparound`: optional boolean.
- `bookedSets`: optional boolean.
- `rush`: optional boolean.

Example request:

```json
{
  "formType": "3 Part",
  "size": "8.5\" x 14\"",
  "quantity": 2500,
  "printType": "Full Color",
  "printSides": "Front and Back",
  "numbering": true,
  "wraparound": true,
  "bookedSets": true,
  "rush": true
}
```

Example response:

```json
{
  "ok": true,
  "product": "carbonless",
  "price": {
    "retail": 5934.6,
    "each": 2.37384
  },
  "currency": "USD",
  "summary": {
    "label": "Carbonless Forms",
    "quantity": 2500,
    "formType": "3 Part",
    "size": "8.5\" x 14\"",
    "printType": "Full Color",
    "printSides": "Front and Back",
    "options": {
      "numbering": true,
      "wraparound": true,
      "bookedSets": true,
      "rush": true
    }
  },
  "warnings": []
}
```

## Door Hanger

Endpoint URL:

```text
POST https://quotes.huegraphics.cc/api/pricing/door-hanger
```

Supported inputs:

- `size`: required string, one of `3.5 x 8.5`, `4 x 11`, `5.25 x 8.5`, or `8.5 x 11`.
- `quantity`: required positive number.
- `type`: required string, one of the existing door hanger stock/type labels in the calculator.
- `ink`: required string, either `Standard Black` or `Full Color`.
- `backPrinting`: required string, one of `No`, `Standard Black`, or `Full Color`.
- `perforation`: required string, one of `No`, `Yes (1 Perforation)`, `Yes (2 Perforations)`, `Yes (3 Perforations)`, or `Yes (4 Perforations)`.
- `shrinkWrap`: required string, one of `Shrink Wrap 250`, `Shrink Wrap 25s`, `Shrink Wrap 50s`, or `Shrink Wrap 100s`.

The current door hanger formula prices size, quantity, ink, back printing, perforation, and shrink wrap. `type` is accepted for request compatibility, but is not priced by the current formula.

Example request:

```json
{
  "size": "4 x 11",
  "quantity": 2500,
  "type": "14pt Gloss Front - Uncoated Back",
  "ink": "Full Color",
  "backPrinting": "Full Color",
  "perforation": "Yes (2 Perforations)",
  "shrinkWrap": "Shrink Wrap 50s"
}
```

Example response:

```json
{
  "ok": true,
  "product": "door-hanger",
  "price": {
    "retail": 3807.611213445379,
    "each": 1.5230444853781515
  },
  "currency": "USD",
  "summary": {
    "label": "Door Hangers",
    "quantity": 2500,
    "size": "4 x 11",
    "type": "14pt Gloss Front - Uncoated Back",
    "ink": "Full Color",
    "backPrinting": "Full Color",
    "perforation": "Yes (2 Perforations)",
    "shrinkWrap": "Shrink Wrap 50s"
  },
  "warnings": [
    "Type is accepted for request compatibility but is not priced by the current door hanger formula."
  ]
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
