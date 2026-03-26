"use client";

import { useEffect, useState } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAdminPapers, getAdminExams, upsertPaper, deletePaper, uploadPaperFile } from "@/lib/queries/admin";
import type { Paper, Exam } from "@/lib/types/database";

export default function AdminPapersPage() {
  const [papers, setPapers] = useState<(Paper & { exam?: Pick<Exam, "title"> })[]>([]);
  const [exams, setExams] = useState<Pick<Exam, "id" | "title">[]>([]);
  const [creating, setCreating] = useState(false);

  function loadData() { getAdminPapers().then(setPapers); getAdminExams().then(setExams); }
  useEffect(() => { loadData(); }, []);

  async function handleDelete(id: string) { if (!confirm("Delete this paper?")) return; await deletePaper(id); loadData(); }

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Papers</h1>
            <button onClick={() => setCreating(true)} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">Upload Paper</button>
          </div>

          {creating && (
            <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <PaperForm exams={exams} onSaved={() => { setCreating(false); loadData(); }} onCancel={() => setCreating(false)} />
            </div>
          )}

          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr><th className="px-4 py-3 text-left font-semibold">Title</th><th className="px-4 py-3 text-left font-semibold">Exam</th><th className="px-4 py-3 text-left font-semibold">Year</th><th className="px-4 py-3 text-left font-semibold">Downloads</th><th className="px-4 py-3 text-left font-semibold">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {papers.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{p.title}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.exam?.title || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.year || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.downloads}</td>
                    <td className="px-4 py-3"><button onClick={() => handleDelete(p.id)} className="text-xs font-medium text-red-600 hover:text-red-700">Delete</button></td>
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

function PaperForm({ exams, onSaved, onCancel }: { exams: Pick<Exam, "id" | "title">[]; onSaved: () => void; onCancel: () => void }) {
  const [title, setTitle] = useState(""); const [examId, setExamId] = useState(""); const [year, setYear] = useState(""); const [subject, setSubject] = useState(""); const [file, setFile] = useState<File | null>(null); const [saving, setSaving] = useState(false);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    let fileUrl = null;
    if (file) { const fileName = `${examId}/${year || "misc"}/${file.name}`; fileUrl = await uploadPaperFile(file, fileName); }
    await upsertPaper({ title, exam_id: examId, year: year ? parseInt(year, 10) : null, subject: subject || null, file_url: fileUrl, file_size_kb: file ? Math.round(file.size / 1024) : null });
    setSaving(false); onSaved();
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label><input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Exam</label><select required value={examId} onChange={(e) => setExamId(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"><option value="">Select</option>{exams.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}</select></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Year</label><input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label><input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
      </div>
      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">PDF File</label><input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-teal-700" /></div>
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50">{saving ? "Uploading..." : "Save"}</button>
        <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">Cancel</button>
      </div>
    </form>
  );
}
