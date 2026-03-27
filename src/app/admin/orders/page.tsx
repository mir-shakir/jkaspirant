"use client";

import { useEffect, useState } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAdminOrders } from "@/lib/queries/admin";
import type { Order } from "@/lib/types/database";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => { getAdminOrders().then(setOrders); }, []);

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900"><tr><th className="px-4 py-3 text-left font-semibold">Email</th><th className="px-4 py-3 text-left font-semibold">Bundle</th><th className="px-4 py-3 text-left font-semibold">Amount</th><th className="px-4 py-3 text-left font-semibold">Status</th><th className="px-4 py-3 text-left font-semibold">Coupon</th><th className="px-4 py-3 text-left font-semibold">Date</th></tr></thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{o.buyer_email}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{o.bundle?.title || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{o.amount_paid_paise === 0 ? "Free" : `₹${o.amount_paid_paise / 100}`}</td>
                    <td className="px-4 py-3"><span className={`rounded px-2 py-0.5 text-xs font-medium ${o.status === "paid" ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : o.status === "free" ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>{o.status}</span></td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{o.coupon?.code || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <p className="p-4 text-center text-sm text-gray-500">No orders yet.</p>}
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
