import Razorpay from "razorpay";
import crypto from "crypto";

let instance: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!instance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error("Missing Razorpay credentials");
    }
    instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return instance;
}

export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
