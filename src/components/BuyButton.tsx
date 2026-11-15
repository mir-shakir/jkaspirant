"use client";

import { useState } from "react";

interface BuyButtonProps {
  bundleId: string;
  bundleSlug: string;
  bundleTitle: string;
  pricePaise: number;
}

export function BuyButton({ bundleId, bundleSlug, bundleTitle, pricePaise }: BuyButtonProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ discount_percent: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const finalPricePaise = couponApplied
    ? Math.round(pricePaise * (1 - couponApplied.discount_percent / 100))
    : pricePaise;

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCouponError("");
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode.trim() }),
    });
    const data = await res.json();
    if (data.valid) {
      setCouponApplied({ discount_percent: data.discount_percent });
    } else {
      setCouponError(data.reason || "Invalid coupon");
      setCouponApplied(null);
    }
  }

  async function handlePurchase() {
    if (!email.trim()) return;
    setLoading(true);

    if (finalPricePaise === 0) {
      const res = await fetch("/api/bundles/free-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bundle_id: bundleId, buyer_email: email.trim(), coupon_code: couponCode.trim() }),
      });
      const data = await res.json();
      if (data.download_token) {
        window.location.href = `/bundles/${bundleSlug}/download?token=${data.download_token}`;
      }
      setLoading(false);
      return;
    }

    const res = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bundle_id: bundleId, buyer_email: email.trim(), coupon_code: couponCode.trim() || undefined }),
    });
    const data = await res.json();

    if (!data.razorpay_order_id) { setLoading(false); return; }

    const options = {
      key: data.key_id,
      amount: data.amount_paise,
      currency: "INR",
      name: "JK Aspirant",
      description: bundleTitle,
      order_id: data.razorpay_order_id,
      prefill: { email: email.trim(), contact: phone.trim() },
      notes: { bundle_id: bundleId, buyer_email: email.trim() },
      handler: function (response: { razorpay_payment_id: string }) {
        window.location.href = `/bundles/${bundleSlug}/download?token=${data.razorpay_order_id}&payment_id=${response.razorpay_payment_id}`;
      },
      modal: { ondismiss: function () { setLoading(false); } },
    };

    const rzp = new (window as unknown as { Razorpay: new (opts: typeof options) => { open: () => void } }).Razorpay(options);
    rzp.open();
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full rounded-full bg-[hsl(var(--accent-strong))] px-6 py-3 text-base font-semibold text-white transition hover:bg-[hsl(var(--accent))]"
      >
        Buy Now &mdash; ₹{pricePaise / 100}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="surface-card w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
              Purchase {bundleTitle}
            </h3>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))]">Email address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1 block w-full rounded-2xl border border-[hsl(var(--line))] bg-[hsl(var(--panel-soft))] px-4 py-3 text-sm text-[hsl(var(--foreground))]" />
                <p className="mt-1 text-xs text-[hsl(var(--muted))]">Download link will be sent to this email.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))]">Phone number</label>
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" className="mt-1 block w-full rounded-2xl border border-[hsl(var(--line))] bg-[hsl(var(--panel-soft))] px-4 py-3 text-sm text-[hsl(var(--foreground))]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))]">Coupon code (optional)</label>
                <div className="mt-1 flex gap-2">
                  <input type="text" value={couponCode} onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponApplied(null); setCouponError(""); }} placeholder="e.g. SHARE50" className="block flex-1 rounded-2xl border border-[hsl(var(--line))] bg-[hsl(var(--panel-soft))] px-4 py-3 text-sm text-[hsl(var(--foreground))]" />
                  <button type="button" onClick={handleApplyCoupon} className="rounded-2xl border border-[hsl(var(--line))] bg-[hsl(var(--panel))] px-4 py-3 text-sm font-medium text-[hsl(var(--foreground))]">Apply</button>
                </div>
                {couponApplied && <p className="mt-1 text-xs text-[hsl(var(--success))]">{couponApplied.discount_percent}% discount applied!</p>}
                {couponError && <p className="mt-1 text-xs text-red-600">{couponError}</p>}
              </div>

              <div className="surface-soft p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[hsl(var(--muted))]">Total</span>
                  <span className="text-lg font-bold text-[hsl(var(--foreground))]">
                    {finalPricePaise === 0 ? "FREE" : `₹${finalPricePaise / 100}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={handlePurchase} disabled={!email.trim() || !phone.trim() || loading} className="flex-1 rounded-full bg-[hsl(var(--accent-strong))] px-4 py-3 text-sm font-medium text-white disabled:opacity-50">
                {loading ? "Processing..." : finalPricePaise === 0 ? "Get Free Download" : `Pay ₹${finalPricePaise / 100}`}
              </button>
              <button onClick={() => setShowModal(false)} className="rounded-full border border-[hsl(var(--line))] px-4 py-3 text-sm font-medium text-[hsl(var(--foreground))]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
