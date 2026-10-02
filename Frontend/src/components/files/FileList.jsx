import { Download, Eye, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { saveBlob } from "../../utils/download.js";
import { getErrorMessage } from "../../utils/errors.js";
import FilePreviewModal from "./FilePreviewModal";
import { deleteFile, downloadFile } from "../../services/fileService";

function FileList({ files, onDeleted }) {
  const [previewFile, setPreviewFile] = useState(null);
  const [deletingFileId, setDeletingFileId] = useState(null);

  const handleDownload = async (fileId, fileName) => {
    try {
      const { blob } = await downloadFile(fileId);

      saveBlob(blob, fileName);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to download file"));
    }
  };

  const handleDelete = async (file) => {
    const confirmed = window.confirm(
      `Delete "${file.originalName}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingFileId(file._id);
      await deleteFile(file._id);
      onDeleted?.(file._id);
      toast.success("File deleted");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete file"));
    } finally {
      setDeletingFileId(null);
    }
  };

  if (files.length === 0) {
    return <p>No files uploaded yet.</p>;
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file._id}
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
        >
          <div className="flex items-center gap-3 my-2">
            <FileText size={18} />

            <div>
              <p className="truncate text-sm font-semibold text-slate-800">
                {file.originalName}
              </p>

              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPreviewFile(file)}
              className="cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
              title="Preview"
            >
              <Eye size={18} />
            </button>

            <button
              type="button"
              onClick={() => handleDownload(file._id, file.originalName)}
              className="cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
              title="Download"
            >
              <Download size={18} />
            </button>

            {onDeleted && (
            <button
              type="button"
              onClick={() => handleDelete(file)}
              disabled={deletingFileId === file._id}
              className="cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
            )}
          </div>
        </div>
      ))}

      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}

export default FileList;
