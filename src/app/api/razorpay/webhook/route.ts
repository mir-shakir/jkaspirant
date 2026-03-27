import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { updateOrderPayment, incrementCouponUsage } from "@/lib/queries/bundles";
import { sendDownloadEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);

  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;
    const order = await updateOrderPayment(payment.order_id, payment.id);

    if (order) {
      if (order.coupon_id) {
        await incrementCouponUsage(order.coupon_id);
      }
      if (order.bundle) {
        await sendDownloadEmail({
          to: order.buyer_email,
          bundleTitle: order.bundle.title,
          bundleSlug: order.bundle.slug,
          downloadToken: order.download_token,
        });
      }
    }
  }

  return NextResponse.json({ status: "ok" });
}
