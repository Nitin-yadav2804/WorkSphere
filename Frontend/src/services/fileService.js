import api from "./api";

export const uploadFile = async ({
    workspaceId,
    projectId,
    taskId,
    file,
}) => {
    const formData = new FormData();

    formData.append("workspaceId", workspaceId);

    if (projectId) {
        formData.append("projectId", projectId);
    }

    if (taskId) {
        formData.append("taskId", taskId);
    }

    formData.append("file", file);

    const response = await api.post("/files/upload", formData);

    return response.data;
};

export const getWorkspaceFiles = async (workspaceId) => {
    const response = await api.get(
        `/files/workspace/${workspaceId}`
    );

    return response.data;
};

export const getFileAccess = async (fileId) => {
    const response = await api.get(
        `/files/${fileId}/access`
    );

    return response.data;
};

export const downloadFile = async (fileId) => {
    const accessResponse = await getFileAccess(fileId);

    const url = accessResponse.url;

    if (url.startsWith("/api/")) {
        const response = await api.get(url.replace("/api", ""), {
            responseType: "blob",
        });

        return {
            blob: response.data,
            contentType: response.headers["content-type"],
        };
    }

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to download file");
    }

    return {
        blob: await response.blob(),
        contentType: response.headers.get("content-type"),
    };
};

export const getProjectFiles = async (projectId) => {
    const response = await api.get(
        `/files/project/${projectId}`
    );

    return response.data;
};

export const getTaskFiles = async (taskId) => {
    const response = await api.get(
        `/files/task/${taskId}`
    );

    return response.data;
};