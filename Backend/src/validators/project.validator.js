import { z } from "zod";

export const createProjectSchema = z.object({
    name: z
        .string()
        .min(2, "Project name must be at least 2 characters")
        .max(100, "Project name cannot exceed 100 characters"),

    description: z
        .string()
        .max(500, "Description cannot exceed 500 characters")
        .optional(),

    startDate: z
        .string()
        .datetime("Invalid start date")
        .optional(),

    dueDate: z
        .string()
        .datetime("Invalid due date")
        .optional(),
});
export const updateProjectSchema = z.object({
    name: z
        .string()
        .min(2, "Project name must be at least 2 characters")
        .max(100, "Project name cannot exceed 100 characters")
        .optional(),

    description: z
        .string()
        .max(500, "Description cannot exceed 500 characters")
        .optional(),

    status: z
        .enum(["active", "completed", "archived"])
        .optional(),

    startDate: z
        .string()
        .datetime("Invalid start date")
        .optional(),

    dueDate: z
        .string()
        .datetime("Invalid due date")
        .optional(),
});