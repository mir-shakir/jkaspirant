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
      prefill: { email: email.trim() },
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
        className="w-full rounded-md bg-teal-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-teal-700"
      >
        Buy Now &mdash; ₹{pricePaise / 100}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Purchase {bundleTitle}
            </h3>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                <p className="mt-1 text-xs text-gray-500">Download link will be sent to this email.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Coupon code (optional)</label>
                <div className="mt-1 flex gap-2">
                  <input type="text" value={couponCode} onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponApplied(null); setCouponError(""); }} placeholder="e.g. SHARE50" className="block flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  <button type="button" onClick={handleApplyCoupon} className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">Apply</button>
                </div>
                {couponApplied && <p className="mt-1 text-xs text-green-600 dark:text-green-400">{couponApplied.discount_percent}% discount applied!</p>}
                {couponError && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{couponError}</p>}
              </div>

              <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {finalPricePaise === 0 ? "FREE" : `₹${finalPricePaise / 100}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={handlePurchase} disabled={!email.trim() || loading} className="flex-1 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50">
                {loading ? "Processing..." : finalPricePaise === 0 ? "Get Free Download" : `Pay ₹${finalPricePaise / 100}`}
              </button>
              <button onClick={() => setShowModal(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
