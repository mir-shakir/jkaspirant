import type { Paper } from "@/lib/types/database";

interface PapersListProps {
  papers: Paper[];
}

export function PapersList({ papers }: PapersListProps) {
  if (papers.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {year === 0 ? "Other" : year}
          </h3>
          <div className="mt-2 space-y-2">
            {byYear[year].map((paper) => (
              <div
                key={paper.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-800"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {paper.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
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
                    className="shrink-0 rounded-md bg-teal-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-teal-700"
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
