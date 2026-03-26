"use client";

import { useEffect, useState } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAdminSyllabusSections, getAdminExams, upsertSyllabusSection, deleteSyllabusSection } from "@/lib/queries/admin";
import type { SyllabusSection, Exam } from "@/lib/types/database";

export default function AdminSyllabusPage() {
  const [sections, setSections] = useState<(SyllabusSection & { exam?: Pick<Exam, "title"> })[]>([]);
  const [exams, setExams] = useState<Pick<Exam, "id" | "title">[]>([]);
  const [creating, setCreating] = useState(false);

  function loadData() { getAdminSyllabusSections().then(setSections); getAdminExams().then(setExams); }
  useEffect(() => { loadData(); }, []);

  async function handleDelete(id: string) { if (!confirm("Delete?")) return; await deleteSyllabusSection(id); loadData(); }

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Syllabus Sections</h1>
            <button onClick={() => setCreating(true)} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">Add Section</button>
          </div>

          {creating && (
            <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <SyllabusForm exams={exams} onSaved={() => { setCreating(false); loadData(); }} onCancel={() => setCreating(false)} />
            </div>
          )}

          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900"><tr><th className="px-4 py-3 text-left font-semibold">Exam</th><th className="px-4 py-3 text-left font-semibold">Section</th><th className="px-4 py-3 text-left font-semibold">Topics</th><th className="px-4 py-3 text-left font-semibold">Marks</th><th className="px-4 py-3 text-left font-semibold">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {sections.map((s) => (<tr key={s.id}><td className="px-4 py-3 text-gray-900 dark:text-white">{s.exam?.title || "—"}</td><td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{s.section_title}</td><td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.topics?.length || 0} topics</td><td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.marks_weight ?? "—"}</td><td className="px-4 py-3"><button onClick={() => handleDelete(s.id)} className="text-xs font-medium text-red-600 hover:text-red-700">Delete</button></td></tr>))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
}

function SyllabusForm({ exams, onSaved, onCancel }: { exams: Pick<Exam, "id" | "title">[]; onSaved: () => void; onCancel: () => void }) {
  const [examId, setExamId] = useState(""); const [sectionTitle, setSectionTitle] = useState(""); const [topicsText, setTopicsText] = useState(""); const [marksWeight, setMarksWeight] = useState(""); const [sortOrder, setSortOrder] = useState("0"); const [saving, setSaving] = useState(false);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await upsertSyllabusSection({ exam_id: examId, section_title: sectionTitle, topics: topicsText.split("\n").map((t) => t.trim()).filter(Boolean), marks_weight: marksWeight ? parseInt(marksWeight, 10) : null, sort_order: parseInt(sortOrder, 10) || 0 });
    setSaving(false); onSaved();
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Exam</label><select required value={examId} onChange={(e) => setExamId(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"><option value="">Select</option>{exams.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}</select></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Section Title</label><input type="text" required value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
      </div>
      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Topics (one per line)</label><textarea rows={6} value={topicsText} onChange={(e) => setTopicsText(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Marks Weight</label><input type="number" value={marksWeight} onChange={(e) => setMarksWeight(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sort Order</label><input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
        <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">Cancel</button>
      </div>
    </form>
  );
}
