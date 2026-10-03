import { z } from "zod";

const projectName = (trim) =>
  (trim ? z.string().trim() : z.string())
    .min(2, "Project name must be at least 2 characters")
    .max(100, "Project name cannot exceed 100 characters");
const fields = {
  name: projectName(false),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
};
const datesInOrder = (data) =>
  !data.startDate ||
  !data.dueDate ||
  new Date(data.dueDate) >= new Date(data.startDate);

export const createProjectSchema = z.object(fields).refine(datesInOrder, {
  message: "Due date must be after start date",
  path: ["dueDate"],
});
export const addProjectSchema = z
  .object({
    name: fields.name,
    description: fields.description,
    workspaceId: z.string().min(1, "Please select a workspace"),
    startDate: fields.startDate,
    dueDate: fields.dueDate,
  })
  .refine(datesInOrder, {
    message: "Due date must be after the start date",
    path: ["dueDate"],
  });
// Creation and editing use the same date ordering rule.
export const editProjectSchema = z.object({
  name: projectName(true),
  description: fields.description,
  status: z.enum(["active", "completed", "archived"]),
  startDate: fields.startDate,
  dueDate: fields.dueDate,
}).refine(datesInOrder, {
  message: "Due date must be after start date",
  path: ["dueDate"],
});
