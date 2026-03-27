import { NextRequest, NextResponse } from "next/server";
import { getRazorpay } from "@/lib/razorpay";
import { createServerClient } from "@/lib/supabase/server";
import { validateCoupon, createOrder } from "@/lib/queries/bundles";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { bundle_id, buyer_email, coupon_code } = body;

  if (!bundle_id || !buyer_email) {
    return NextResponse.json({ error: "bundle_id and buyer_email are required" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: bundle, error } = await supabase
    .from("bundles").select("*").eq("id", bundle_id).eq("is_active", true).single();

  if (error || !bundle) {
    return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
  }

  let discountPercent = 0;
  let couponId: string | undefined;
  if (coupon_code) {
    const couponResult = await validateCoupon(coupon_code);
    if (!couponResult.valid) {
      return NextResponse.json({ error: couponResult.reason }, { status: 400 });
    }
    discountPercent = couponResult.coupon!.discount_percent;
    couponId = couponResult.coupon!.id;
  }

  const finalAmountPaise = Math.round(bundle.price_paise * (1 - discountPercent / 100));

  const razorpay = getRazorpay();
  const razorpayOrder = await razorpay.orders.create({
    amount: finalAmountPaise,
    currency: "INR",
    receipt: `bundle_${bundle.id}_${Date.now()}`,
  });

  await createOrder({
    bundleId: bundle.id,
    buyerEmail: buyer_email,
    amountPaidPaise: finalAmountPaise,
    razorpayOrderId: razorpayOrder.id,
    couponId,
    status: "pending",
  });

  return NextResponse.json({
    razorpay_order_id: razorpayOrder.id,
    amount_paise: finalAmountPaise,
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  });
}
