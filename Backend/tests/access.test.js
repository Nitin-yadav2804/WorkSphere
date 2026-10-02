import test from "node:test";
import assert from "node:assert/strict";
import Workspace from "../src/models/workspace.model.js";
import Project from "../src/models/project.model.js";
import Task from "../src/models/task.model.js";
import File from "../src/models/file.model.js";
import { requireDocument } from "../src/utils/requireDocument.js";
import { requireWorkspaceAccess } from "../src/utils/workspaceAccess.js";
import { deleteTask } from "../src/controllers/task.controller.js";
import { getFileAccess } from "../src/controllers/file.controller.js";

function workspaceQuery(t, document) {
    const calls = [];
    const query = {
        populate(...args) {
            calls.push(args);
            return this;
        },
        then(resolve, reject) {
            return Promise.resolve(document).then(resolve, reject);
        },
    };
    const find = t.mock.method(Workspace, "findOne", () => query);
    return { calls, find };
}

test("membership access retains the query and population order", async (t) => {
    const workspace = { _id: "workspace", members: [] };
    const { find, calls } = workspaceQuery(t, workspace);
    const result = await requireWorkspaceAccess("workspace", "user", {
        message: "Workspace not found or access denied",
        populate: [
            ["owner", "name email"],
            ["members.user", "name email"],
        ],
    });
    assert.equal(result, workspace);
    assert.deepEqual(find.mock.calls[0].arguments, [
        { _id: "workspace", "members.user": "user" },
    ]);
    assert.deepEqual(calls, [
        ["owner", "name email"],
        ["members.user", "name email"],
    ]);
});

test("owner-only access never falls back to membership", async (t) => {
    const { find } = workspaceQuery(t, null);
    await assert.rejects(
        requireWorkspaceAccess("workspace", "member", {
            ownerOnly: true,
            message: "Task not found or you are not the workspace owner",
        }),
        {
            statusCode: 404,
            message: "Task not found or you are not the workspace owner",
        }
    );
    assert.deepEqual(find.mock.calls[0].arguments, [
        { _id: "workspace", owner: "member" },
    ]);
});

test("file access retains its 403 error instead of the normal 404", async (t) => {
    workspaceQuery(t, null);
    t.mock.method(File, "findById", async () => ({ workspace: "workspace" }));
    const next = t.mock.fn();
    await getFileAccess(
        { params: { fileId: "file" }, user: { userId: "user" } },
        {},
        next
    );
    assert.equal(next.mock.callCount(), 1);
    assert.equal(next.mock.calls[0].arguments[0].statusCode, 403);
    assert.equal(
        next.mock.calls[0].arguments[0].message,
        "You do not have access to this file"
    );
});

test("denied task deletion does not reach cascade writes", async (t) => {
    t.mock.method(Task, "findById", async () => ({ project: "project" }));
    t.mock.method(Project, "findById", async () => ({
        workspace: "workspace",
    }));
    workspaceQuery(t, null);
    const remove = t.mock.method(Task, "findByIdAndDelete", () =>
        assert.fail("Unexpected deletion")
    );
    await assert.rejects(
        deleteTask(
            { params: { taskId: "task" }, user: { userId: "user" } },
            {}
        ),
        {
            message: "Task not found or you are not the workspace owner",
            statusCode: 404,
        }
    );
    assert.equal(remove.mock.callCount(), 0);
});

test("missing document errors preserve the caller's message and status", async () => {
    await assert.rejects(
        requireDocument(Promise.resolve(null), "Project not found"),
        {
            message: "Project not found",
            statusCode: 404,
        }
    );
    const document = { _id: "project" };
    assert.equal(
        await requireDocument(Promise.resolve(document), "Missing"),
        document
    );
});

test("database errors pass through unchanged", async (t) => {
    const failure = new Error("Database unavailable");
    t.mock.method(Workspace, "findOne", () => Promise.reject(failure));
    await assert.rejects(
        requireWorkspaceAccess("workspace", "user", { message: "Missing" }),
        (e) => e === failure
    );
    await assert.rejects(
        requireDocument(Promise.reject(failure), "Missing"),
        (e) => e === failure
    );
});
