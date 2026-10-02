import test from "node:test";
import assert from "node:assert/strict";
import {
    createProjectSchema,
    updateProjectSchema,
} from "../src/validators/project.validator.js";
import {
    createTaskSchema,
    updateTaskSchema,
} from "../src/validators/task.validator.js";
import {
    createCommentSchema,
    updateCommentSchema,
} from "../src/validators/comment.validator.js";
import {
    addMemberSchema,
    updateMemberRoleSchema,
} from "../src/validators/member.validator.js";
import {
    registerSchema,
    loginSchema,
} from "../src/validators/auth.validator.js";

test("create requires names and titles; update accepts partial payloads", () => {
    assert.equal(createProjectSchema.safeParse({}).success, false);
    assert.equal(createTaskSchema.safeParse({}).success, false);
    assert.deepEqual(updateProjectSchema.parse({ status: "archived" }), {
        status: "archived",
    });
    assert.deepEqual(updateTaskSchema.parse({ priority: "urgent" }), {
        priority: "urgent",
    });
    assert.deepEqual(updateTaskSchema.parse({}), {});
});

test("shared fields preserve validation wording and datetime requirements", () => {
    for (const schema of [createProjectSchema, updateProjectSchema]) {
        const result = schema.safeParse({ name: "a", dueDate: "2026-10-02" });
        assert.equal(result.success, false);
        assert.equal(
            result.error.flatten().fieldErrors.name[0],
            "Project name must be at least 2 characters"
        );
        assert.equal(
            result.error.flatten().fieldErrors.dueDate[0],
            "Invalid due date"
        );
    }
    assert.equal(
        updateTaskSchema.safeParse({ status: "active" }).success,
        false
    );
    assert.equal(
        updateProjectSchema.safeParse({ status: "todo" }).success,
        false
    );
});

test("comments retain required content on both creation and editing", () => {
    for (const schema of [createCommentSchema, updateCommentSchema]) {
        assert.equal(schema.safeParse({}).success, false);
        assert.equal(
            schema.safeParse({ content: "" }).error.issues[0].message,
            "Comment cannot be empty"
        );
        assert.deepEqual(schema.parse({ content: "hello", task: "ignored" }), {
            content: "hello",
        });
    }
});

test("role editing validates roles without requiring an email", () => {
    assert.equal(addMemberSchema.safeParse({ role: "member" }).success, false);
    assert.deepEqual(updateMemberRoleSchema.parse({ role: "manager" }), {
        role: "manager",
    });
    assert.equal(
        updateMemberRoleSchema.safeParse({ role: "admin" }).error.issues[0]
            .message,
        "Role must be either member or manager"
    );
});

test("login shares credentials validation while registration requires a name", () => {
    const credentials = { email: "user@example.test", password: "secret123" };
    assert.deepEqual(loginSchema.parse(credentials), credentials);
    assert.equal(registerSchema.safeParse(credentials).success, false);
    assert.equal(
        loginSchema.safeParse({ ...credentials, password: "short" }).error
            .issues[0].message,
        "Password must be at least 6 characters"
    );
});
