import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { uploadFile } from "../../services/fileService";

function FileUpload({
    workspaceId,
    projectId,
    taskId,
    onUploaded,
}) {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        try {
            setUploading(true);

            const response = await uploadFile({
                workspaceId,
                projectId,
                taskId,
                file,
            });

            toast.success("File uploaded successfully");

            onUploaded?.(response.file);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "Failed to upload file"
            );
        } finally {
            setUploading(false);

            if (inputRef.current) {
                inputRef.current.value = "";
            }
        }
    };

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                hidden
                onChange={handleFileChange}
            />

            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="cursor-pointer flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
                <Upload size={16} />

                {uploading ? "Uploading..." : "Upload File"}
            </button>
        </>
    );
}

export default FileUpload;