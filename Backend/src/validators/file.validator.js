import { z } from "zod";

export const fileUploadSchema = z.object({
    workspaceId: z.string().min(1, "Workspace ID is required"),

    projectId: z.string().min(1).optional(),

    taskId: z.string().min(1).optional(),
});