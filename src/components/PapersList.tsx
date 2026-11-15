import type { Paper } from "@/lib/types/database";
import { EmptyState } from "@/components/ui";

interface PapersListProps {
  papers: Paper[];
}

function size(kb: number | null) {
  if (!kb) return null;
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

/** Papers grouped by year. The whole row downloads the PDF. */
export function PapersList({ papers }: PapersListProps) {
  if (papers.length === 0) {
    return <EmptyState>No previous papers for this exam yet. We add them as soon as we have a clean copy.</EmptyState>;
  }

  const byYear = new Map<number, Paper[]>();
  for (const paper of papers) {
    const year = paper.year || 0;
    byYear.set(year, [...(byYear.get(year) ?? []), paper]);
  }
  const years = Array.from(byYear.keys()).sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      {years.map((year) => (
        <section key={year}>
          <h2 className="mb-2 font-mono-num text-[13px] font-medium uppercase tracking-[0.1em] text-[hsl(var(--muted))]">
            {year === 0 ? "Other" : year}
          </h2>
          <div className="group-list">
            {byYear.get(year)!.map((paper) => {
              const meta = [paper.subject, size(paper.file_size_kb), "PDF"].filter(Boolean).join(" · ");
              const inner = (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium leading-snug">{paper.title}</span>
                    <span className="mt-0.5 block text-[13px] text-[hsl(var(--muted))]">{paper.file_url ? meta : "Coming soon"}</span>
                  </span>
                  {paper.file_url && (
                    <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0 text-[hsl(var(--accent))]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M10 3.5v9m0 0L6.5 9M10 12.5 13.5 9M4 16.5h12" />
                    </svg>
                  )}
                </>
              );
              return paper.file_url ? (
                <a key={paper.id} href={paper.file_url} target="_blank" rel="noopener noreferrer" className="row" aria-label={`Download ${paper.title}`}>
                  {inner}
                </a>
              ) : (
                <div key={paper.id} className="row opacity-70">
                  {inner}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
