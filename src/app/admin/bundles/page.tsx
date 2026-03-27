"use client";

import { useEffect, useState } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAdminBundles, getAdminExams, upsertBundle, deleteBundle, uploadBundleFile, insertBundleFile } from "@/lib/queries/admin";
import type { Bundle, BundleFile, Exam } from "@/lib/types/database";

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<(Bundle & { files?: BundleFile[] })[]>([]);
  const [exams, setExams] = useState<Pick<Exam, "id" | "title">[]>([]);
  const [editing, setEditing] = useState<Bundle | null>(null);
  const [creating, setCreating] = useState(false);

  function loadData() { getAdminBundles().then(setBundles); getAdminExams().then(setExams); }
  useEffect(() => { loadData(); }, []);

  async function handleDelete(id: string) { if (!confirm("Delete this bundle and all its files?")) return; await deleteBundle(id); loadData(); }

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bundles</h1>
            <button onClick={() => { setCreating(true); setEditing(null); }} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">New Bundle</button>
          </div>

          {(creating || editing) && (
            <BundleForm exams={exams} bundle={editing} onSaved={() => { setCreating(false); setEditing(null); loadData(); }} onCancel={() => { setCreating(false); setEditing(null); }} />
          )}

          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900"><tr><th className="px-4 py-3 text-left font-semibold">Title</th><th className="px-4 py-3 text-left font-semibold">Price</th><th className="px-4 py-3 text-left font-semibold">Files</th><th className="px-4 py-3 text-left font-semibold">Status</th><th className="px-4 py-3 text-left font-semibold">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {bundles.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{b.title}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">₹{b.price_paise / 100}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.files?.length || 0} files</td>
                    <td className="px-4 py-3"><span className={`rounded px-2 py-0.5 text-xs font-medium ${b.is_active ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600"}`}>{b.is_active ? "Active" : "Inactive"}</span></td>
                    <td className="space-x-2 px-4 py-3">
                      <button onClick={() => { setEditing(b); setCreating(false); }} className="text-xs font-medium text-teal-600 hover:text-teal-700">Edit</button>
                      <button onClick={() => handleDelete(b.id)} className="text-xs font-medium text-red-600 hover:text-red-700">Delete</button>
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

function BundleForm({ exams, bundle, onSaved, onCancel }: { exams: Pick<Exam, "id" | "title">[]; bundle: Bundle | null; onSaved: () => void; onCancel: () => void }) {
  const [title, setTitle] = useState(bundle?.title || "");
  const [slug, setSlug] = useState(bundle?.slug || "");
  const [description, setDescription] = useState(bundle?.description || "");
  const [priceRupees, setPriceRupees] = useState(bundle ? (bundle.price_paise / 100).toString() : "");
  const [examId, setExamId] = useState(bundle?.exam_id || "");
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const saved = await upsertBundle({ ...(bundle?.id ? { id: bundle.id } : {}), title, slug, description: description || null, price_paise: Math.round(parseFloat(priceRupees) * 100), exam_id: examId || null });
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const path = await uploadBundleFile(file, `${saved.id}/${file.name}`);
        await insertBundleFile({ bundle_id: saved.id, file_name: file.name, storage_path: path, file_size_kb: Math.round(file.size / 1024), sort_order: i });
      }
    }
    setSaving(false); onSaved();
  }

  return (
    <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label><input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => !slug && setSlug(title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-"))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slug</label><input type="text" required value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price (₹)</label><input type="number" required min="0" step="1" value={priceRupees} onChange={(e) => setPriceRupees(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Exam (optional)</label><select value={examId} onChange={(e) => setExamId(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"><option value="">None</option>{exams.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}</select></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (HTML)</label><textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload PDF files</label><input type="file" accept="application/pdf" multiple onChange={(e) => setFiles(e.target.files)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-teal-700" /></div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
          <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">Cancel</button>
        </div>
      </form>
    </div>
  );
}
