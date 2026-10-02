import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),

    email: z.string().email("Invalid email address"),

    password: z.string().min(6, "Password must be at least 6 characters"),
});
export const loginSchema = registerSchema.pick({ email: true, password: true });

export const updateProfileSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().trim().email("Invalid email address"),
});

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z
            .string()
            .min(6, "New password must be at least 6 characters"),
        confirmPassword: z.string().min(1, "Please confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });
