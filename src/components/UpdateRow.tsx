import { DateBlock, Row, categoryLabels } from "@/components/ui";

const NEW_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

export interface UpdateRowData {
  slug: string;
  title: string;
  category: string | null;
  published_at: string | null;
}

/** One update in a grouped list: date on the left, what it is, then the title. */
export function UpdateRow({ update }: { update: UpdateRowData }) {
  const isNew = update.published_at ? Date.now() - new Date(update.published_at).getTime() < NEW_WINDOW_MS : false;
  return (
    <Row
      href={`/notifications/${update.slug}`}
      leading={<DateBlock iso={update.published_at} />}
      title={update.title}
      sub={
        <span className="flex items-center gap-1.5">
          {update.category && <span className="tag">{categoryLabels[update.category] || update.category}</span>}
          {isNew && <span className="tag tag-new">New</span>}
        </span>
      }
    />
  );
}
