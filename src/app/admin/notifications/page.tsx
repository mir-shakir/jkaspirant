"use client";

import { useEffect, useState } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAdminNotifications, getAdminExams, approveNotification, deleteNotification, upsertNotification } from "@/lib/queries/admin";
import type { Notification, Exam } from "@/lib/types/database";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [exams, setExams] = useState<Pick<Exam, "id" | "title">[]>([]);
  const [editing, setEditing] = useState<Notification | null>(null);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "published">("all");

  function loadData() { getAdminNotifications().then(setNotifications); getAdminExams().then(setExams); }
  useEffect(() => { loadData(); }, []);

  const filtered = notifications.filter((n) => {
    if (filter === "pending") return !n.is_published;
    if (filter === "published") return n.is_published;
    return true;
  });

  async function handleApprove(id: string) { await approveNotification(id); loadData(); }
  async function handleDelete(id: string) { if (!confirm("Delete this notification?")) return; await deleteNotification(id); loadData(); }

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <button onClick={() => { setCreating(true); setEditing(null); }} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">New Notification</button>
          </div>
          <div className="mt-4 flex gap-2">
            {(["all", "pending", "published"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-md px-3 py-1 text-sm font-medium ${filter === f ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {(creating || editing) && (
            <NotifForm exams={exams} notification={editing} onSaved={() => { setCreating(false); setEditing(null); loadData(); }} onCancel={() => { setCreating(false); setEditing(null); }} />
          )}

          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Title</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filtered.map((n) => (
                  <tr key={n.id}>
                    <td className="max-w-xs truncate px-4 py-3 font-medium text-gray-900 dark:text-white">{n.title}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{n.category || "—"}</td>
                    <td className="px-4 py-3"><span className={`rounded px-2 py-0.5 text-xs font-medium ${n.is_published ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>{n.is_published ? "Published" : "Pending"}</span></td>
                    <td className="space-x-2 px-4 py-3">
                      {!n.is_published && <button onClick={() => handleApprove(n.id)} className="text-xs font-medium text-green-600 hover:text-green-700">Approve</button>}
                      <button onClick={() => { setEditing(n); setCreating(false); }} className="text-xs font-medium text-teal-600 hover:text-teal-700">Edit</button>
                      <button onClick={() => handleDelete(n.id)} className="text-xs font-medium text-red-600 hover:text-red-700">Delete</button>
                    </td>
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

function NotifForm({ exams, notification, onSaved, onCancel }: { exams: Pick<Exam, "id" | "title">[]; notification: Notification | null; onSaved: () => void; onCancel: () => void }) {
  const [title, setTitle] = useState(notification?.title || "");
  const [slug, setSlug] = useState(notification?.slug || "");
  const [body, setBody] = useState(notification?.body || "");
  const [sourceUrl, setSourceUrl] = useState(notification?.source_url || "");
  const [examId, setExamId] = useState(notification?.exam_id || "");
  const [category, setCategory] = useState<string>(notification?.category || "notification");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await upsertNotification({
      ...(notification?.id ? { id: notification.id } : {}),
      title, slug, body: body || null, source_url: sourceUrl || null, exam_id: examId || null,
      category: category as Notification["category"],
    });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label><input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => !slug && setSlug(title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-"))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slug</label><input type="text" required value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label><select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"><option value="notification">Notification</option><option value="result">Result</option><option value="admit_card">Admit Card</option><option value="answer_key">Answer Key</option></select></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Related Exam</label><select value={examId} onChange={(e) => setExamId(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"><option value="">None</option>{exams.map((exam) => <option key={exam.id} value={exam.id}>{exam.title}</option>)}</select></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Body (HTML)</label><textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Source URL</label><input type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
          <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">Cancel</button>
        </div>
      </form>
    </div>
  );
}
