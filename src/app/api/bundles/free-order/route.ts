import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { validateCoupon, createOrder, incrementCouponUsage } from "@/lib/queries/bundles";
import { sendDownloadEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { bundle_id, buyer_email, coupon_code } = body;

  if (!bundle_id || !buyer_email || !coupon_code) {
    return NextResponse.json({ error: "bundle_id, buyer_email, and coupon_code are required" }, { status: 400 });
  }

  const couponResult = await validateCoupon(coupon_code);
  if (!couponResult.valid || couponResult.coupon!.discount_percent !== 100) {
    return NextResponse.json({ error: "Invalid or non-free coupon" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: bundle, error } = await supabase
    .from("bundles").select("title, slug").eq("id", bundle_id).eq("is_active", true).single();

  if (error || !bundle) {
    return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
  }

  const order = await createOrder({
    bundleId: bundle_id,
    buyerEmail: buyer_email,
    amountPaidPaise: 0,
    couponId: couponResult.coupon!.id,
    status: "free",
  });

  await incrementCouponUsage(couponResult.coupon!.id);

  await sendDownloadEmail({
    to: buyer_email,
    bundleTitle: bundle.title,
    bundleSlug: bundle.slug,
    downloadToken: order.download_token,
  });

  return NextResponse.json({ download_token: order.download_token, slug: bundle.slug });
}
