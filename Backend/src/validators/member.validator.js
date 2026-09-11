import { z } from "zod";

export const addMemberSchema = z.object({
    email: z
        .string()
        .email("Invalid email address"),
});
export const updateMemberRoleSchema = z.object({
    role: z.enum(["member", "manager"], {
        message: "Role must be either member or manager",
    }),
});