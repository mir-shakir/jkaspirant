"use client";

import { useEffect, useState } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAdminExamDates, getAdminExams, upsertExamDate, deleteExamDate } from "@/lib/queries/admin";
import type { ExamDate, Exam } from "@/lib/types/database";

export default function AdminDatesPage() {
  const [dates, setDates] = useState<(ExamDate & { exam?: Pick<Exam, "title"> })[]>([]);
  const [exams, setExams] = useState<Pick<Exam, "id" | "title">[]>([]);
  const [creating, setCreating] = useState(false);

  function loadData() { getAdminExamDates().then(setDates); getAdminExams().then(setExams); }
  useEffect(() => { loadData(); }, []);

  async function handleDelete(id: string) { if (!confirm("Delete?")) return; await deleteExamDate(id); loadData(); }

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exam Dates</h1>
            <button onClick={() => setCreating(true)} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">Add Date</button>
          </div>

          {creating && (
            <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <DateForm exams={exams} onSaved={() => { setCreating(false); loadData(); }} onCancel={() => setCreating(false)} />
            </div>
          )}

          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900"><tr><th className="px-4 py-3 text-left font-semibold">Exam</th><th className="px-4 py-3 text-left font-semibold">Event</th><th className="px-4 py-3 text-left font-semibold">Date</th><th className="px-4 py-3 text-left font-semibold">Status</th><th className="px-4 py-3 text-left font-semibold">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {dates.map((d) => (<tr key={d.id}><td className="px-4 py-3 text-gray-900 dark:text-white">{d.exam?.title || "—"}</td><td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{d.event_name}</td><td className="px-4 py-3 text-gray-600 dark:text-gray-400">{d.event_date || "TBA"}</td><td className="px-4 py-3">{d.is_tentative ? <span className="rounded bg-yellow-50 px-2 py-0.5 text-xs text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Tentative</span> : <span className="text-xs text-gray-500">Confirmed</span>}</td><td className="px-4 py-3"><button onClick={() => handleDelete(d.id)} className="text-xs font-medium text-red-600 hover:text-red-700">Delete</button></td></tr>))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
}

function DateForm({ exams, onSaved, onCancel }: { exams: Pick<Exam, "id" | "title">[]; onSaved: () => void; onCancel: () => void }) {
  const [examId, setExamId] = useState(""); const [eventName, setEventName] = useState(""); const [eventDate, setEventDate] = useState(""); const [isTentative, setIsTentative] = useState(false); const [saving, setSaving] = useState(false);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await upsertExamDate({ exam_id: examId, event_name: eventName, event_date: eventDate || null, is_tentative: isTentative });
    setSaving(false); onSaved();
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Exam</label><select required value={examId} onChange={(e) => setExamId(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"><option value="">Select</option>{exams.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}</select></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Event Name</label><input type="text" required value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="e.g. Application Start, Exam Date" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label><input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
        <div className="flex items-end"><label className="flex items-center gap-2"><input type="checkbox" checked={isTentative} onChange={(e) => setIsTentative(e.target.checked)} /><span className="text-sm text-gray-700 dark:text-gray-300">Tentative date</span></label></div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
        <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">Cancel</button>
      </div>
    </form>
  );
}
