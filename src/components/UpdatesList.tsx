"use client";

import { useState } from "react";
import { UpdateRow, type UpdateRowData } from "@/components/UpdateRow";
import { EmptyState, GroupList } from "@/components/ui";

const filters = [
  { key: "all", label: "All" },
  { key: "notification", label: "Notices" },
  { key: "admit_card", label: "Admit cards" },
  { key: "answer_key", label: "Answer keys" },
  { key: "result", label: "Results" },
] as const;

type FilterKey = (typeof filters)[number]["key"];

/** Updates with one-tap filters. Filters with nothing in them are hidden. */
export function UpdatesList({ updates }: { updates: UpdateRowData[] }) {
  const [active, setActive] = useState<FilterKey>("all");
  const available = filters.filter((f) => f.key === "all" || updates.some((u) => u.category === f.key));
  const shown = active === "all" ? updates : updates.filter((u) => u.category === active);

  return (
    <>
      {available.length > 2 && (
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0" role="group" aria-label="Filter updates">
          {available.map((f) => (
            <button key={f.key} type="button" className="chip" aria-pressed={active === f.key} onClick={() => setActive(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
      )}
      {shown.length > 0 ? (
        <GroupList>
          {shown.map((u) => (
            <UpdateRow key={u.slug} update={u} />
          ))}
        </GroupList>
      ) : (
        <EmptyState>Nothing here yet.</EmptyState>
      )}
    </>
  );
}
