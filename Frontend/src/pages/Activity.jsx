import { useEffect, useState } from "react";
import {
  Activity as ActivityIcon,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Filter,
  FolderKanban,
  ListTodo,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { getWorkspaces } from "../services/workspaceService";
import { getWorkspaceActivities } from "../services/activityService";

function Activity() {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState("");
  const [activities, setActivities] = useState([]);

  const [actionFilter, setActionFilter] = useState("");

  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });


  // Fetch workspaces


  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setLoadingWorkspaces(true);

        const response = await getWorkspaces();

        const workspaceList = response.workspaces || [];

        setWorkspaces(workspaceList);

        if (workspaceList.length > 0) {
          setSelectedWorkspace(workspaceList[0]._id);
        }
      } catch (error) {
        console.error(
          "Failed to fetch workspaces:",
          error.response?.data || error.message
        );

        toast.error(
          error.response?.data?.message ||
            "Failed to load workspaces."
        );
      } finally {
        setLoadingWorkspaces(false);
      }
    };

    fetchWorkspaces();
  }, []);


  // Fetch activities


  useEffect(() => {
    if (!selectedWorkspace) {
      setActivities([]);
      return;
    }

    const fetchActivities = async () => {
      try {
        setLoadingActivities(true);
        setError("");

        const response = await getWorkspaceActivities(
          selectedWorkspace,
          {
            page,
            limit: 20,
            ...(actionFilter
              ? { action: actionFilter }
              : {}),
          }
        );

        setActivities(response.activities || []);

        setPagination(
          response.pagination || {
            page,
            limit: 20,
            total: 0,
            totalPages: 0,
          }
        );
      } catch (error) {
        console.error(
          "Failed to fetch activities:",
          error.response?.data || error.message
        );

        setError(
          error.response?.data?.message ||
            "Failed to load activities."
        );

        setActivities([]);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities();
  }, [selectedWorkspace, page, actionFilter]);


  // Change workspace


  const handleWorkspaceChange = (event) => {
    setSelectedWorkspace(event.target.value);
    setPage(1);
  };


  // Change action filter


  const handleActionChange = (event) => {
    setActionFilter(event.target.value);
    setPage(1);
  };


  // Format date


  const formatRelativeTime = (date) => {
    if (!date) {
      return "";
    }

    const now = new Date();
    const activityDate = new Date(date);

    const diffInSeconds = Math.floor(
      (now - activityDate) / 1000
    );

    if (diffInSeconds < 60) {
      return "Just now";
    }

    const diffInMinutes = Math.floor(
      diffInSeconds / 60
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${
        diffInMinutes === 1 ? "minute" : "minutes"
      } ago`;
    }

    const diffInHours = Math.floor(
      diffInMinutes / 60
    );

    if (diffInHours < 24) {
      return `${diffInHours} ${
        diffInHours === 1 ? "hour" : "hours"
      } ago`;
    }

    const diffInDays = Math.floor(
      diffInHours / 24
    );

    if (diffInDays < 7) {
      return `${diffInDays} ${
        diffInDays === 1 ? "day" : "days"
      } ago`;
    }

    return activityDate.toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };


  // Activity icon


  const getActivityIcon = (action) => {
    if (!action) {
      return ActivityIcon;
    }

    if (action.includes("task")) {
      return ListTodo;
    }

    if (action.includes("project")) {
      return FolderKanban;
    }

    if (
      action.includes("member") ||
      action.includes("workspace")
    ) {
      return Briefcase;
    }

    return ActivityIcon;
  };


  // Loading workspaces


  if (loadingWorkspaces) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-slate-500">
              Loading activity...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header*/}

        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ActivityIcon size={23} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Activity
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Keep track of what's happening across your
                workspaces.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">

            {/* Workspace */}
            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Workspace
              </label>

              <div className="relative">
                <Briefcase
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={selectedWorkspace}
                  onChange={handleWorkspaceChange}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  {workspaces.map((workspace) => (
                    <option
                      key={workspace._id}
                      value={workspace._id}
                    >
                      {workspace.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action */}
            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Activity type
              </label>

              <div className="relative">
                <Filter
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={actionFilter}
                  onChange={handleActionChange}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="">
                    All activities
                  </option>

                  <option value="workspace_created">
                    Workspace created
                  </option>

                  <option value="workspace_updated">
                    Workspace updated
                  </option>

                  <option value="workspace_deleted">
                    Workspace deleted
                  </option>

                  <option value="member_removed">
                    Member removed
                  </option>

                  <option value="member_role_updated">
                    Member role updated
                  </option>

                  <option value="project_created">
                    Project created
                  </option>

                  <option value="project_updated">
                    Project updated
                  </option>

                  <option value="project_deleted">
                    Project deleted
                  </option>

                  <option value="task_created">
                    Task created
                  </option>

                  <option value="task_updated">
                    Task updated
                  </option>

                  <option value="task_deleted">
                    Task deleted
                  </option>

                  <option value="comment_created">
                    Comment created
                  </option>

                  <option value="comment_updated">
                    Comment updated
                  </option>

                  <option value="comment_deleted">
                    Comment deleted
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Activity card */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Recent activity
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {pagination.total || 0}{" "}
                  {pagination.total === 1
                    ? "activity"
                    : "activities"}{" "}
                  recorded
                </p>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loadingActivities ? (
            <div className="p-10 text-center">
              <p className="text-sm text-slate-500">
                Loading activities...
              </p>
            </div>
          ) : error ? (
            /* Error */
            <div className="p-10">
              <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                <p className="text-sm font-medium text-red-600">
                  {error}
                </p>
              </div>
            </div>
          ) : activities.length === 0 ? (
            /* Empty */
            <div className="p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <ActivityIcon size={26} />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No activity yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Activity from this workspace will appear
                here.
              </p>
            </div>
          ) : (
            /* Activity list */
            <div className="divide-y divide-slate-100">
              {activities.map((activity) => {
                const Icon = getActivityIcon(
                  activity.action
                );

                return (
                  <div
                    key={activity._id}
                    className="flex gap-4 px-6 py-5 transition hover:bg-slate-50/70 sm:px-8"
                  >
                    {/* Icon */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon size={18} />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-6 text-slate-800">
                        {activity.description}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">

                        {/* User */}
                        <span className="flex items-center gap-1.5">
                          <User size={13} />

                          {activity.user?.name ||
                            "Unknown user"}
                        </span>

                        <span className="text-slate-300">
                          •
                        </span>

                        {/* Time */}
                        <span>
                          {formatRelativeTime(
                            activity.createdAt
                          )}
                        </span>

                        {/* Project */}
                        {activity.project?.name && (
                          <>
                            <span className="text-slate-300">
                              •
                            </span>

                            <span className="flex items-center gap-1.5">
                              <FolderKanban size={13} />

                              {activity.project.name}
                            </span>
                          </>
                        )}

                        {/* Task */}
                        {activity.task?.title && (
                          <>
                            <span className="text-slate-300">
                              •
                            </span>

                            <span className="flex items-center gap-1.5">
                              <ListTodo size={13} />

                              {activity.task.title}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}

          {!loadingActivities &&
            !error &&
            activities.length > 0 &&
            pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 sm:px-8">

                <p className="text-sm text-slate-500">
                  Page {pagination.page} of{" "}
                  {pagination.totalPages}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((current) =>
                        Math.max(current - 1, 1)
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={17} />
                  </button>

                  <button
                    type="button"
                    disabled={
                      page >= pagination.totalPages
                    }
                    onClick={() =>
                      setPage((current) =>
                        Math.min(
                          current + 1,
                          pagination.totalPages
                        )
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Next page"
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default Activity;