import type { Paper } from "@/lib/types/database";

interface PapersListProps {
  papers: Paper[];
}

export function PapersList({ papers }: PapersListProps) {
  if (papers.length === 0) {
    return (
      <p className="surface-card p-5 text-[hsl(var(--muted))]">
        No previous papers available yet. Check back soon.
      </p>
    );
  }

  const byYear = papers.reduce<Record<number, Paper[]>>((acc, paper) => {
    const year = paper.year || 0;
    if (!acc[year]) acc[year] = [];
    acc[year].push(paper);
    return acc;
  }, {});

  const sortedYears = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      {sortedYears.map((year) => (
        <div key={year}>
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
            {year === 0 ? "Other" : year}
          </h3>
          <div className="mt-2 space-y-2">
            {byYear[year].map((paper) => (
              <div
                key={paper.id}
                className="surface-card flex items-center justify-between gap-4 p-4"
              >
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {paper.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[hsl(var(--muted))]">
                    {paper.subject && <span>{paper.subject}</span>}
                    {paper.file_size_kb && (
                      <span>
                        {paper.file_size_kb > 1024
                          ? `${(paper.file_size_kb / 1024).toFixed(1)} MB`
                          : `${paper.file_size_kb} KB`}
                      </span>
                    )}
                  </div>
                </div>
                {paper.file_url && (
                  <a
                    href={paper.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-full bg-[hsl(var(--accent-strong))] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[hsl(var(--accent))]"
                  >
                    Download PDF
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
