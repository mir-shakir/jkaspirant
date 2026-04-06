interface DownloadFile {
  fileName: string;
  url: string;
  fileSizeKb: number | null;
}

interface DownloadFileListProps {
  files: DownloadFile[];
}

export function DownloadFileList({ files }: DownloadFileListProps) {
  return (
    <div className="space-y-3">
      {files.map((file, index) => (
        <div key={index} className="surface-card flex items-center justify-between gap-4 p-4">
          <div>
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">{file.fileName}</p>
            {file.fileSizeKb && (
              <p className="mt-0.5 text-xs text-[hsl(var(--muted))]">
                {file.fileSizeKb > 1024 ? `${(file.fileSizeKb / 1024).toFixed(1)} MB` : `${file.fileSizeKb} KB`}
              </p>
            )}
          </div>
          <a href={file.url} download className="shrink-0 rounded-full bg-[hsl(var(--accent-strong))] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[hsl(var(--accent))]">
            Download
          </a>
        </div>
      ))}
    </div>
  );
}
