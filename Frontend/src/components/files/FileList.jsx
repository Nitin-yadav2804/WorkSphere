import { Download, Eye, FileText } from "lucide-react";
import { toast } from "sonner";
import FilePreviewModal from "./FilePreviewModal";
import { downloadFile } from "../../services/fileService";
import { useState } from "react";

function FileList({ files }) {

    const [previewFile, setPreviewFile] = useState(null);

    const handleDownload = async (fileId, fileName) => {
    try {
        const { blob } = await downloadFile(fileId);

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        toast.error(
            error.response?.data?.message ||
                "Failed to download file"
        );
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
                            onClick={() =>
                                handleDownload(
                                    file._id,
                                    file.originalName
                                )
                            }
                            className="cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
                            title="Download"
                        >
                            <Download size={18} />
                        </button>
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