"use client";

import { useEffect, useState } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAdminStats } from "@/lib/queries/admin";

interface Stats {
  totalExams: number;
  totalNotifications: number;
  pendingNotifications: number;
  totalPapers: number;
  totalResources: number;
}

function StatCard({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${highlight ? "text-amber-600 dark:text-amber-400" : "text-gray-900 dark:text-white"}`}>{value}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => { getAdminStats().then(setStats); }, []);

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          {stats ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard label="Active Exams" value={stats.totalExams} />
              <StatCard label="Published Notifications" value={stats.totalNotifications} />
              <StatCard label="Pending Review" value={stats.pendingNotifications} highlight />
              <StatCard label="Papers Uploaded" value={stats.totalPapers} />
              <StatCard label="Active Resources" value={stats.totalResources} />
            </div>
          ) : (
            <p className="mt-6 text-gray-500">Loading stats...</p>
          )}
        </div>
      </div>
    </AdminAuthGuard>
  );
}
