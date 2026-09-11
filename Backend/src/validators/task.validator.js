import { z } from "zod";

export const createTaskSchema = z.object({
    title: z
        .string()
        .min(2, "Task title must be at least 2 characters")
        .max(200, "Task title cannot exceed 200 characters"),

    description: z
        .string()
        .max(1000, "Description cannot exceed 1000 characters")
        .optional(),

    assignedTo: z
        .string()
        .optional(),

    status: z
        .enum(["todo", "in-progress", "completed"])
        .optional(),

    priority: z
        .enum(["low", "medium", "high", "urgent"])
        .optional(),

    dueDate: z
        .string()
        .datetime("Invalid due date")
        .optional(),
});
export const updateTaskSchema = z.object({
    title: z
        .string()
        .min(2, "Task title must be at least 2 characters")
        .max(200, "Task title cannot exceed 200 characters")
        .optional(),

    description: z
        .string()
        .max(1000, "Description cannot exceed 1000 characters")
        .optional(),

    assignedTo: z
        .string()
        .optional(),

    status: z
        .enum(["todo", "in-progress", "completed"])
        .optional(),

    priority: z
        .enum(["low", "medium", "high", "urgent"])
        .optional(),

    dueDate: z
        .string()
        .datetime("Invalid due date")
        .optional(),
});