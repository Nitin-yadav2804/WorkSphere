import test from "node:test";
import assert from "node:assert/strict";
import { getErrorMessage, getErrorDetails } from "../src/utils/errors.js";
import { normalizeMembers } from "../src/utils/members.js";
import {
  getAssignedUserId,
  getTaskDefaultValues,
  toTaskPayload,
} from "../src/utils/taskForm.js";
import {
  formatDashboardDate,
  formatTaskDate,
  formatProjectDate,
  formatDateInput,
  toUTCDateInput,
  toOptionalISODate,
} from "../src/utils/dates.js";
import {
  getTaskStatusLabel,
  getDashboardTaskStatusLabel,
  getPriorityLabel,
  getDashboardPriorityLabel,
  getProjectStatusClasses,
  getWorkspaceProjectStatusClasses,
  getRolePriority,
} from "../src/utils/presentation.js";
import {
  byCreatedAtAscending,
  byRecentActivity,
} from "../src/utils/sorting.js";

test("API errors use server wording and keep page-specific fallbacks", () => {
  const error = {
    response: { data: { message: "Access denied" } },
    message: "Request failed",
  };
  assert.equal(getErrorMessage(error, "Failed to load task."), "Access denied");
  assert.equal(getErrorDetails(error), error.response.data);
  assert.equal(
    getErrorMessage(new Error("Network error"), "Failed to load task."),
    "Failed to load task."
  );
  assert.equal(
    getErrorMessage({ response: { data: { message: "" } } }, "Fallback"),
    "Fallback"
  );
});

test("member normalization accepts both response formats and drops incomplete records", () => {
  const user = { _id: "u1", name: "User" };
  assert.deepEqual(
    normalizeMembers([
      { user, role: "manager" },
      user,
      null,
      { user: "u1" },
      {},
    ]),
    [{ user, role: "manager" }, { user }]
  );
  assert.deepEqual(normalizeMembers(undefined), []);
  assert.equal(getAssignedUserId(user), "u1");
  assert.equal(getAssignedUserId("u1"), "u1");
  assert.equal(getAssignedUserId({}), "");
});

test("task forms keep trimming, empty assignment and UTC-midnight payload behavior", () => {
  assert.deepEqual(
    toTaskPayload({
      title: " Task ",
      description: " Notes ",
      assignedTo: "",
      status: "todo",
      priority: "high",
      dueDate: "2026-10-02",
    }),
    {
      title: "Task",
      description: "Notes",
      assignedTo: undefined,
      status: "todo",
      priority: "high",
      dueDate: "2026-10-02T00:00:00.000Z",
    }
  );
  assert.deepEqual(getTaskDefaultValues(null), {
    title: "",
    description: "",
    assignedTo: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
  });
});

test("date helpers keep each screen's invalid-date fallback and timezone policy", () => {
  for (const date of [undefined, "", "invalid"]) {
    assert.equal(formatDashboardDate(date), "No due date");
    assert.equal(formatTaskDate(date), "Not set");
    assert.equal(formatDateInput(date), "");
  }
  assert.equal(formatProjectDate("invalid"), "Invalid Date");
  assert.equal(toUTCDateInput("2026-10-02T23:30:00-05:00"), "2026-10-03");
  assert.equal(toOptionalISODate(""), undefined);
  assert.equal(toOptionalISODate("2026-10-02"), "2026-10-02T00:00:00.000Z");
  const date = new Date(2026, 9, 2, 23, 30);
  assert.equal(formatDateInput(date), "2026-10-02");
});

test("display variants keep existing labels, classes and unknown-value fallbacks", () => {
  assert.equal(getTaskStatusLabel("todo"), "To Do");
  assert.equal(getDashboardTaskStatusLabel("todo"), "Todo");
  assert.equal(getTaskStatusLabel("future"), "future");
  assert.equal(getTaskStatusLabel(undefined), "Unknown");
  assert.equal(getPriorityLabel(undefined), "Not set");
  assert.equal(getDashboardPriorityLabel(undefined), "Medium");
  assert.deepEqual(
    getProjectStatusClasses("active").split(" ").sort(),
    getWorkspaceProjectStatusClasses("active").split(" ").sort()
  );
  assert.equal(getRolePriority("owner"), 0);
  assert.equal(getRolePriority("__proto__"), 2);
});

test("sorting preserves oldest-created and newest-updated ordering without mutating inputs", () => {
  const input = [
    { _id: "a", createdAt: "2026-01-01", updatedAt: "2026-10-01" },
    { _id: "b", createdAt: "2026-02-01" },
  ];
  assert.deepEqual(
    [...input].sort(byCreatedAtAscending).map((x) => x._id),
    ["a", "b"]
  );
  assert.deepEqual(
    [...input].sort(byRecentActivity).map((x) => x._id),
    ["a", "b"]
  );
  assert.deepEqual(
    input.map((x) => x._id),
    ["a", "b"]
  );
});
