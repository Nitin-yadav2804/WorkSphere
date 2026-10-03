import test from "node:test";
import assert from "node:assert/strict";
import {
  createWorkspaceSchema,
  editWorkspaceSchema,
} from "../src/validators/workspace.js";
import {
  createProjectSchema,
  editProjectSchema,
  addProjectSchema,
} from "../src/validators/project.js";
import { loginSchema, registerSchema } from "../src/validators/auth.js";

test("workspace creation and editing preserve their different trimming rules", () => {
  assert.equal(createWorkspaceSchema.parse({ name: "  " }).name, "  ");
  assert.equal(editWorkspaceSchema.safeParse({ name: "  " }).success, false);
  assert.equal(editWorkspaceSchema.parse({ name: " Team " }).name, "Team");
});

test("project forms retain date-order validation, exact wording and edit behavior", () => {
  const data = {
    name: "Project",
    workspaceId: "workspace",
    startDate: "2026-10-03",
    dueDate: "2026-10-02",
  };
  assert.equal(
    createProjectSchema.safeParse(data).error.issues[0].message,
    "Due date must be after start date"
  );
  assert.equal(
    addProjectSchema.safeParse(data).error.issues[0].message,
    "Due date must be after the start date"
  );
  assert.equal(
    editProjectSchema.safeParse({ ...data, status: "active" }).success,
    false
  );
  assert.equal(
    addProjectSchema.safeParse({ ...data, dueDate: "", workspaceId: "" }).error
      .issues[0].message,
    "Please select a workspace"
  );
});

test("authentication schemas keep required email and confirmation messages", () => {
  const login = loginSchema.safeParse({ email: "", password: "" });
  assert.equal(login.error.flatten().fieldErrors.email[0], "Email is required");
  assert.equal(
    login.error.flatten().fieldErrors.password[0],
    "Password is required"
  );
  const signup = registerSchema.safeParse({
    name: "User",
    email: "user@example.test",
    password: "secret123",
    confirmPassword: "different",
  });
  assert.equal(signup.error.issues[0].message, "Passwords do not match");
});
