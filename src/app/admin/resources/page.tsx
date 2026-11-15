"use client";

import { useEffect, useState } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  deleteResource,
  getAdminExams,
  getAdminResources,
  upsertResource,
} from "@/lib/queries/admin";
import type { Exam, Resource } from "@/lib/types/database";

const resourceTypes: Resource["resource_type"][] = [
  "notes",
  "book",
  "official_link",
  "external_link",
  "guide",
  "bundle",
  "previous_paper",
];

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [exams, setExams] = useState<Pick<Exam, "id" | "title">[]>([]);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [creating, setCreating] = useState(false);

  function loadData() {
    getAdminResources().then(setResources);
    getAdminExams().then(setExams);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this resource?")) return;
    await deleteResource(id);
    loadData();
  }

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Resources
            </h1>
            <button
              onClick={() => {
                setCreating(true);
                setEditing(null);
              }}
              className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              New Resource
            </button>
          </div>

          {(creating || editing) && (
            <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <ResourceForm
                exams={exams}
                resource={editing}
                onSaved={() => {
                  setCreating(false);
                  setEditing(null);
                  loadData();
                }}
                onCancel={() => {
                  setCreating(false);
                  setEditing(null);
                }}
              />
            </div>
          )}

          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Title</th>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Exam</th>
                  <th className="px-4 py-3 text-left font-semibold">Flags</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {resources.map((resource) => (
                  <tr key={resource.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {resource.title}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {resource.source_label || resource.url}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {resource.resource_type}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {resource.exam?.title || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {[resource.is_featured ? "Featured" : null, resource.is_premium ? "Premium" : null, resource.is_active ? "Active" : "Hidden"]
                        .filter(Boolean)
                        .join(" • ")}
                    </td>
                    <td className="space-x-2 px-4 py-3">
                      <button
                        onClick={() => {
                          setEditing(resource);
                          setCreating(false);
                        }}
                        className="text-xs font-medium text-teal-600 hover:text-teal-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(resource.id)}
                        className="text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {resources.length === 0 && (
              <p className="p-4 text-center text-sm text-gray-500">
                No resources yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
}

function ResourceForm({
  exams,
  resource,
  onSaved,
  onCancel,
}: {
  exams: Pick<Exam, "id" | "title">[];
  resource: Resource | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(resource?.title || "");
  const [description, setDescription] = useState(resource?.description || "");
  const [resourceType, setResourceType] = useState<Resource["resource_type"]>(
    resource?.resource_type || "notes"
  );
  const [examId, setExamId] = useState(resource?.exam_id || "");
  const [url, setUrl] = useState(resource?.url || "");
  const [sourceLabel, setSourceLabel] = useState(resource?.source_label || "");
  const [ctaLabel, setCtaLabel] = useState(resource?.cta_label || "");
  const [sortOrder, setSortOrder] = useState(resource?.sort_order?.toString() || "0");
  const [isExternal, setIsExternal] = useState(resource?.is_external ?? true);
  const [isPremium, setIsPremium] = useState(resource?.is_premium ?? false);
  const [isFeatured, setIsFeatured] = useState(resource?.is_featured ?? false);
  const [isActive, setIsActive] = useState(resource?.is_active ?? true);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    await upsertResource({
      ...(resource?.id ? { id: resource.id } : {}),
      title,
      description: description || null,
      resource_type: resourceType,
      exam_id: examId || null,
      url,
      source_label: sourceLabel || null,
      cta_label: ctaLabel || null,
      sort_order: parseInt(sortOrder, 10) || 0,
      is_external: isExternal,
      is_premium: isPremium,
      is_featured: isFeatured,
      is_active: isActive,
    });
    setSaving(false);
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Type
          </label>
          <select
            value={resourceType}
            onChange={(event) =>
              setResourceType(event.target.value as Resource["resource_type"])
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            {resourceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Exam (optional)
          </label>
          <select
            value={examId}
            onChange={(event) => setExamId(event.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="">None</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            URL
          </label>
          <input
            type="url"
            required
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Source label
          </label>
          <input
            type="text"
            value={sourceLabel}
            onChange={(event) => setSourceLabel(event.target.value)}
            placeholder="Official / Amazon / Notes"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            CTA label
          </label>
          <input
            type="text"
            value={ctaLabel}
            onChange={(event) => setCtaLabel(event.target.value)}
            placeholder="Open / Download / Buy"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Sort order
          </label>
          <input
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={isExternal}
            onChange={(event) => setIsExternal(event.target.checked)}
          />
          External link
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={isPremium}
            onChange={(event) => setIsPremium(event.target.checked)}
          />
          Premium
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(event) => setIsFeatured(event.target.checked)}
          />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
          />
          Active
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
