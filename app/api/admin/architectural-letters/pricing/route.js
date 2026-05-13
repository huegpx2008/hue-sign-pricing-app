import { NextResponse } from "next/server";
import { buildArchitecturalPricingDebug } from "../../../../../lib/architectural-letters/pricingData";

export async function POST(request) {
  const body = await request.json();
  const mode = body?.mode || "customer-online";

  if (mode !== "admin" && mode !== "customer-in-store") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const debug = buildArchitecturalPricingDebug(body?.input || {});
  return NextResponse.json(debug);
}
