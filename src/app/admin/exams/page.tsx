"use client";

import { useEffect, useState } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAdminExams, upsertExam, deleteExam } from "@/lib/queries/admin";
import type { Exam } from "@/lib/types/database";

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [editing, setEditing] = useState<Exam | null>(null);
  const [creating, setCreating] = useState(false);

  function loadData() { getAdminExams().then(setExams); }
  useEffect(() => { loadData(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this exam and all related data?")) return;
    await deleteExam(id);
    loadData();
  }

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exams</h1>
            <button onClick={() => { setCreating(true); setEditing(null); }} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">New Exam</button>
          </div>

          {(creating || editing) && (
            <ExamForm exam={editing} onSaved={() => { setCreating(false); setEditing(null); loadData(); }} onCancel={() => { setCreating(false); setEditing(null); }} />
          )}

          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Title</th>
                  <th className="px-4 py-3 text-left font-semibold">Dept</th>
                  <th className="px-4 py-3 text-left font-semibold">Vacancies</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {exams.map((exam) => (
                  <tr key={exam.id}>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{exam.title}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{exam.department || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{exam.vacancy_count || "—"}</td>
                    <td className="px-4 py-3"><span className={`rounded px-2 py-0.5 text-xs font-medium ${exam.is_active ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600"}`}>{exam.is_active ? "Active" : "Inactive"}</span></td>
                    <td className="space-x-2 px-4 py-3">
                      <button onClick={() => { setEditing(exam); setCreating(false); }} className="text-xs font-medium text-teal-600 hover:text-teal-700">Edit</button>
                      <button onClick={() => handleDelete(exam.id)} className="text-xs font-medium text-red-600 hover:text-red-700">Delete</button>
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

function ExamForm({ exam, onSaved, onCancel }: { exam: Exam | null; onSaved: () => void; onCancel: () => void }) {
  const [title, setTitle] = useState(exam?.title || "");
  const [slug, setSlug] = useState(exam?.slug || "");
  const [department, setDepartment] = useState(exam?.department || "");
  const [description, setDescription] = useState(exam?.description || "");
  const [vacancyCount, setVacancyCount] = useState(exam?.vacancy_count?.toString() || "");
  const [payScale, setPayScale] = useState(exam?.pay_scale || "");
  const [eligibility, setEligibility] = useState(exam?.eligibility || "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await upsertExam({
      ...(exam?.id ? { id: exam.id } : {}),
      title, slug,
      department: department || null,
      description: description || null,
      vacancy_count: vacancyCount ? parseInt(vacancyCount, 10) : null,
      pay_scale: payScale || null,
      eligibility: eligibility || null,
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
        <div className="grid gap-4 sm:grid-cols-3">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label><input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vacancies</label><input type="number" value={vacancyCount} onChange={(e) => setVacancyCount(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pay Scale</label><input type="text" value={payScale} onChange={(e) => setPayScale(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label><textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Eligibility</label><textarea rows={2} value={eligibility} onChange={(e) => setEligibility(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
          <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">Cancel</button>
        </div>
      </form>
    </div>
  );
}
