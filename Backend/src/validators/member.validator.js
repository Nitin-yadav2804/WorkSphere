import { z } from "zod";

export const addMemberSchema = z.object({
  email: z.string().email("Invalid email address"),

  role: z.enum(
    ["member", "manager"],
    {
      message:
        "Role must be either member or manager",
    }
  ),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(
    ["member", "manager"],
    {
      message:
        "Role must be either member or manager",
    }
  ),
});