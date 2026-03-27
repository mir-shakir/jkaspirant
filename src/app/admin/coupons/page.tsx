"use client";

import { useEffect, useState } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAdminCoupons, upsertCoupon, deleteCoupon } from "@/lib/queries/admin";
import type { Coupon } from "@/lib/types/database";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [creating, setCreating] = useState(false);

  function loadData() { getAdminCoupons().then(setCoupons); }
  useEffect(() => { loadData(); }, []);

  async function handleDelete(id: string) { if (!confirm("Delete this coupon?")) return; await deleteCoupon(id); loadData(); }

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Coupons</h1>
            <button onClick={() => setCreating(true)} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">New Coupon</button>
          </div>

          {creating && <CouponForm onSaved={() => { setCreating(false); loadData(); }} onCancel={() => setCreating(false)} />}

          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900"><tr><th className="px-4 py-3 text-left font-semibold">Code</th><th className="px-4 py-3 text-left font-semibold">Discount</th><th className="px-4 py-3 text-left font-semibold">Used</th><th className="px-4 py-3 text-left font-semibold">Max</th><th className="px-4 py-3 text-left font-semibold">Expires</th><th className="px-4 py-3 text-left font-semibold">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {coupons.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-mono font-medium text-gray-900 dark:text-white">{c.code}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.discount_percent}%</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.times_used}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.max_uses ?? "∞"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.expires_at ? new Date(c.expires_at).toLocaleDateString("en-IN") : "Never"}</td>
                    <td className="px-4 py-3"><button onClick={() => handleDelete(c.id)} className="text-xs font-medium text-red-600 hover:text-red-700">Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
}

function CouponForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const [code, setCode] = useState(""); const [discountPercent, setDiscountPercent] = useState(""); const [maxUses, setMaxUses] = useState(""); const [expiresAt, setExpiresAt] = useState(""); const [saving, setSaving] = useState(false);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await upsertCoupon({ code: code.toUpperCase(), discount_percent: parseInt(discountPercent, 10), max_uses: maxUses ? parseInt(maxUses, 10) : null, expires_at: expiresAt || null });
    setSaving(false); onSaved();
  }
  return (
    <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Code</label><input type="text" required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="SHARE50" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Discount %</label><input type="number" required min="0" max="100" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Max uses</label><input type="number" min="1" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Unlimited" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expires</label><input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
          <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">Cancel</button>
        </div>
      </form>
    </div>
  );
}
