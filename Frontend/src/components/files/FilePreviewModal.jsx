import { useEffect, useState } from "react";
import { X, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
    getFileAccess,
    downloadFile,
} from "../../services/fileService";

function FilePreviewModal({ file, onClose }) {
    const [loading, setLoading] = useState(true);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [textContent, setTextContent] = useState(null);

    useEffect(() => {
        if (!file) {
            return;
        }

        let objectUrl = null;

        const loadPreview = async () => {
            try {
                setLoading(true);

                const { url } = await getFileAccess(file._id);

                const response = url.startsWith("/api/")
                    ? await fetch(
                          `http://localhost:3000${url}`,
                          {
                              headers: {
                                  Authorization: `Bearer ${localStorage.getItem(
                                      "token"
                                  )}`,
                              },
                          }
                      )
                    : await fetch(url);

                if (!response.ok) {
                    throw new Error("Failed to load preview");
                }

                const blob = await response.blob();

                objectUrl = window.URL.createObjectURL(blob);

                if (file.mimeType === "text/plain") {
                    const text = await blob.text();
                    setTextContent(text);
                } else {
                    setPreviewUrl(objectUrl);
                }
            } catch (error) {
                console.error(error);

                toast.error("Failed to load file preview");
            } finally {
                setLoading(false);
            }
        };

        loadPreview();

        return () => {
            if (objectUrl) {
                window.URL.revokeObjectURL(objectUrl);
            }
        };
    }, [file]);

    if (!file) {
        return null;
    }

    const isImage = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ].includes(file.mimeType);

    const isPdf = file.mimeType === "application/pdf";

    const isText = file.mimeType === "text/plain";

    const handleDownload = async () => {
        try {
            const { blob } = await downloadFile(file._id);

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;
            link.download = file.originalName;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error("Failed to download file");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold text-slate-900">
                            {file.originalName}
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            {(file.size / 1024).toFixed(1)} KB
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleDownload}
                            className="cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
                        >
                            <Download size={18} />
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-red-600"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Preview */}
                <div className="flex min-h-[400px] flex-1 items-center justify-center overflow-auto bg-slate-50 p-6">
                    {loading && (
                        <Loader2
                            size={32}
                            className="animate-spin text-slate-400"
                        />
                    )}

                    {!loading && isImage && previewUrl && (
                        <img
                            src={previewUrl}
                            alt={file.originalName}
                            className="max-h-[70vh] max-w-full rounded-lg object-contain shadow-sm"
                        />
                    )}

                    {!loading && isPdf && previewUrl && (
                        <iframe
                            src={previewUrl}
                            title={file.originalName}
                            className="h-[70vh] w-full rounded-lg border border-slate-200 bg-white"
                        />
                    )}

                    {!loading && isText && textContent !== null && (
                        <pre className="max-h-[70vh] w-full overflow-auto whitespace-pre-wrap rounded-lg bg-white p-6 text-sm text-slate-700 shadow-sm">
                            {textContent}
                        </pre>
                    )}

                    {!loading &&
                        !isImage &&
                        !isPdf &&
                        !isText && (
                            <div className="text-center">
                                <p className="text-sm font-semibold text-slate-700">
                                    Preview not available
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    Download the file to open it.
                                </p>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
}

export default FilePreviewModal;