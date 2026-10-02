import { z } from "zod";

const workspaceName = (trim) =>
  (trim ? z.string().trim() : z.string())
    .min(2, "Workspace name must be at least 2 characters")
    .max(100, "Workspace name cannot exceed 100 characters");
const description = z
  .string()
  .max(500, "Description cannot exceed 500 characters")
  .optional();

export const createWorkspaceSchema = z.object({
  name: workspaceName(false),
  description,
});
export const editWorkspaceSchema = z.object({
  name: workspaceName(true),
  description,
});
