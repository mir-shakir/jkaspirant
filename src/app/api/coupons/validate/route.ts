import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/queries/bundles";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { code } = body;

  if (!code) {
    return NextResponse.json({ valid: false, reason: "Coupon code is required" }, { status: 400 });
  }

  const result = await validateCoupon(code);

  if (!result.valid) {
    return NextResponse.json({ valid: false, reason: result.reason });
  }

  return NextResponse.json({ valid: true, discount_percent: result.coupon!.discount_percent });
}
