import test, { after } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const server = await createServer({
  root: fileURLToPath(new URL("..", import.meta.url)),
  server: { middlewareMode: true, ws: false, watch: null },
  appType: "custom",
});
after(() => server.close());
const load = (file) => server.ssrLoadModule(`/src/${file}`);
const { default: ModalFrame } = await load("components/ui/ModalFrame.jsx");
const { default: AsyncButton } = await load("components/ui/AsyncButton.jsx");
const { default: FieldError } = await load("components/ui/FieldError.jsx");
const { default: PageLoading } = await load("components/ui/PageLoading.jsx");
const { default: api } = await load("services/api.js");
const admin = await load("services/adminService.js");
const auth = await load("services/authService.js");

test("modal wrappers preserve independent backdrop and panel handlers", () => {
  const backdrop = () => {};
  const panel = () => {};
  const tree = ModalFrame({
    overlayProps: { className: "overlay", onClick: backdrop },
    panelProps: { className: "panel", onClick: panel },
    children: "Contents",
  });
  assert.equal(tree.props.onClick, backdrop);
  assert.equal(tree.props.children.props.onClick, panel);
  assert.equal(tree.props.children.props.children, "Contents");
});

test("busy buttons retain disabled policy, spinner and exact labels", () => {
  const busy = renderToStaticMarkup(
    React.createElement(
      AsyncButton,
      {
        busy: true,
        disabled: true,
        busyLabel: "Deleting...",
        spinnerProps: { size: 17, className: "animate-spin" },
      },
      "Delete task"
    )
  );
  assert.match(busy, /disabled=""/);
  assert.match(busy, /animate-spin/);
  assert.match(busy, /Deleting\.\.\./);
  assert.doesNotMatch(busy, /Delete task/);
  const idle = renderToStaticMarkup(
    React.createElement(
      AsyncButton,
      { busy: false, busyLabel: "Saving..." },
      "Save changes"
    )
  );
  assert.doesNotMatch(idle, /<svg/);
  assert.match(idle, /Save changes/);
});

test("field errors render only when present and retain supplied styles", () => {
  assert.equal(renderToStaticMarkup(React.createElement(FieldError, {})), "");
  assert.equal(
    renderToStaticMarkup(
      React.createElement(FieldError, {
        error: { message: "Email is required" },
        className: "text-red-500",
      })
    ),
    '<p class="text-red-500">Email is required</p>'
  );
});

test("shared loading layouts preserve text-only and spinner variants", () => {
  const plain = renderToStaticMarkup(
    React.createElement(
      PageLoading,
      { variant: "workspace" },
      "Loading workspace..."
    )
  );
  assert.doesNotMatch(plain, /<svg/);
  assert.match(plain, /Loading workspace\.\.\./);
  const task = renderToStaticMarkup(
    React.createElement(PageLoading, { variant: "task" }, "Loading task...")
  );
  assert.match(task, /max-w-5xl/);
  assert.match(task, /animate-spin/);
  assert.match(task, /Loading task\.\.\./);
});

test("admin and auth services keep methods, URLs, payloads and response unwrapping", async (t) => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { getItem: () => "token" },
  });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, "localStorage", previous);
    else delete globalThis.localStorage;
  });
  const oldAdapter = api.defaults.adapter;
  t.after(() => {
    api.defaults.adapter = oldAdapter;
  });
  let request;
  const data = { success: true, message: "OK", user: { id: "user" } };
  api.defaults.adapter = async (config) => {
    request = config;
    return { data, status: 200, statusText: "OK", headers: {}, config };
  };
  const cases = [
    [admin.getAdminActivities, [], "get", "/admin/activity"],
    [admin.getAdminDashboard, [], "get", "/admin/dashboard"],
    [admin.getAdminProjects, [], "get", "/admin/projects"],
    [admin.getAdminProject, ["p1"], "get", "/admin/projects/p1"],
    [admin.deleteAdminProject, ["p1"], "delete", "/admin/projects/p1"],
    [admin.getAdminTask, ["t1"], "get", "/admin/tasks/t1"],
    [admin.deleteAdminTask, ["t1"], "delete", "/admin/tasks/t1"],
    [admin.getAdminTaskComments, ["t1"], "get", "/admin/tasks/t1/comments"],
    [admin.deleteAdminComment, ["c1"], "delete", "/admin/comments/c1"],
    [admin.getAdminWorkspaces, [], "get", "/admin/workspaces"],
    [admin.getAdminWorkspace, ["w1"], "get", "/admin/workspaces/w1"],
    [admin.deleteAdminWorkspace, ["w1"], "delete", "/admin/workspaces/w1"],
    [admin.getAdminUsers, [], "get", "/admin/users"],
    [
      admin.getAdminUsers,
      ["A&B +"],
      "get",
      "/admin/users/search?search=A%26B%20%2B",
    ],
    [
      admin.updateAdminUserRole,
      ["u1", "admin"],
      "patch",
      "/admin/users/u1/role",
      { role: "admin" },
    ],
    [admin.toggleAdminUserStatus, ["u1"], "patch", "/admin/users/u1/status"],
    [admin.deleteAdminUser, ["u1"], "delete", "/admin/users/u1"],
    [
      auth.login,
      [{ email: "user@example.test", password: "secret" }],
      "post",
      "/auth/login",
      { email: "user@example.test", password: "secret" },
    ],
    [
      auth.registerUser,
      [{ name: "User" }],
      "post",
      "/auth/register",
      { name: "User" },
    ],
  ];
  for (const [fn, args, method, url, payload] of cases) {
    assert.equal(await fn(...args), data);
    assert.equal(request.method, method);
    assert.equal(request.url, url);
    assert.equal(request.headers.Authorization, "Bearer token");
    assert.deepEqual(
      request.data ? JSON.parse(request.data) : undefined,
      payload
    );
  }
  const failure = new Error("Network failure");
  api.defaults.adapter = async () => {
    throw failure;
  };
  await assert.rejects(admin.getAdminDashboard(), (error) => error === failure);
});
