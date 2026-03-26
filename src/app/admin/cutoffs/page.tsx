"use client";

import { useEffect, useState } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAdminCutoffs, getAdminExams, upsertCutoff, deleteCutoff } from "@/lib/queries/admin";
import type { Cutoff, Exam } from "@/lib/types/database";

export default function AdminCutoffsPage() {
  const [cutoffs, setCutoffs] = useState<(Cutoff & { exam?: Pick<Exam, "title"> })[]>([]);
  const [exams, setExams] = useState<Pick<Exam, "id" | "title">[]>([]);
  const [creating, setCreating] = useState(false);

  function loadData() { getAdminCutoffs().then(setCutoffs); getAdminExams().then(setExams); }
  useEffect(() => { loadData(); }, []);

  async function handleDelete(id: string) { if (!confirm("Delete?")) return; await deleteCutoff(id); loadData(); }

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cut-offs</h1>
            <button onClick={() => setCreating(true)} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">Add Cut-off</button>
          </div>

          {creating && (
            <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <CutoffForm exams={exams} onSaved={() => { setCreating(false); loadData(); }} onCancel={() => setCreating(false)} />
            </div>
          )}

          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900"><tr><th className="px-4 py-3 text-left font-semibold">Exam</th><th className="px-4 py-3 text-left font-semibold">Year</th><th className="px-4 py-3 text-left font-semibold">Category</th><th className="px-4 py-3 text-left font-semibold">Score</th><th className="px-4 py-3 text-left font-semibold">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {cutoffs.map((c) => (<tr key={c.id}><td className="px-4 py-3 text-gray-900 dark:text-white">{c.exam?.title || "—"}</td><td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.year}</td><td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.category}</td><td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.cutoff_score ?? "—"}</td><td className="px-4 py-3"><button onClick={() => handleDelete(c.id)} className="text-xs font-medium text-red-600 hover:text-red-700">Delete</button></td></tr>))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
}

function CutoffForm({ exams, onSaved, onCancel }: { exams: Pick<Exam, "id" | "title">[]; onSaved: () => void; onCancel: () => void }) {
  const [examId, setExamId] = useState(""); const [year, setYear] = useState(""); const [category, setCategory] = useState(""); const [score, setScore] = useState(""); const [saving, setSaving] = useState(false);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await upsertCutoff({ exam_id: examId, year: parseInt(year, 10), category, cutoff_score: score ? parseFloat(score) : null });
    setSaving(false); onSaved();
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-4">
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Exam</label><select required value={examId} onChange={(e) => setExamId(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"><option value="">Select</option>{exams.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}</select></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Year</label><input type="number" required value={year} onChange={(e) => setYear(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label><select required value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"><option value="">Select</option><option>General</option><option>OBC</option><option>SC</option><option>ST</option><option>EWS</option><option>PWD</option></select></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Score</label><input type="number" step="0.01" value={score} onChange={(e) => setScore(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
        <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">Cancel</button>
      </div>
    </form>
  );
}
