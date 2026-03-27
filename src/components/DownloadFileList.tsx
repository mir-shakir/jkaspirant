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
        <div key={index} className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{file.fileName}</p>
            {file.fileSizeKb && (
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {file.fileSizeKb > 1024 ? `${(file.fileSizeKb / 1024).toFixed(1)} MB` : `${file.fileSizeKb} KB`}
              </p>
            )}
          </div>
          <a href={file.url} download className="shrink-0 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700">
            Download
          </a>
        </div>
      ))}
    </div>
  );
}
