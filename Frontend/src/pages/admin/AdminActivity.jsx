import { useEffect, useState } from "react";
import {
  Activity as ActivityIcon,
  Search,
} from "lucide-react";
import api from "../../services/api";
import { toast } from "sonner";

function AdminActivity() {
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      const response = await api.get("/admin/activity");

      setActivities(response.data.activities);
    } catch (error) {
      console.error(
        "Failed to fetch activities:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load activity"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const filteredActivities = activities.filter(
    (activity) => {
      const searchText = search.toLowerCase();

      return (
        activity.action
          ?.toLowerCase()
          .includes(searchText) ||
        activity.description
          ?.toLowerCase()
          .includes(searchText) ||
        activity.user?.name
          ?.toLowerCase()
          .includes(searchText) ||
        activity.user?.email
          ?.toLowerCase()
          .includes(searchText) ||
        activity.workspace?.name
          ?.toLowerCase()
          .includes(searchText) ||
        activity.project?.name
          ?.toLowerCase()
          .includes(searchText) ||
        activity.task?.title
          ?.toLowerCase()
          .includes(searchText)
      );
    }
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <div className="flex items-start gap-3 sm:items-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <ActivityIcon size={20} />
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">
              Activity
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor recent activity across WorkSphere.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search activity..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <span className="w-fit whitespace-nowrap rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600">
          {filteredActivities.length} activities
        </span>
      </div>

      {/* Activity Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            Loading activity...
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            No activity found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                    Action
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                    User
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                    Workspace
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                    Project
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                    Task
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                    Time
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredActivities.map(
                  (activity) => (
                    <tr
                      key={activity._id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* Action */}
                      <td className="px-4 py-4 sm:px-6">
                        <p className="font-medium capitalize text-slate-900">
                          {activity.action ||
                            "Activity"}
                        </p>

                        <p className="mt-1 max-w-xs truncate text-sm text-slate-500">
                          {activity.description ||
                            "—"}
                        </p>
                      </td>

                      {/* User */}
                      <td className="px-4 py-4 sm:px-6">
                        <p className="text-sm font-medium text-slate-700">
                          {activity.user?.name ||
                            "Unknown"}
                        </p>

                        <p className="text-xs text-slate-500">
                          {activity.user?.email ||
                            "—"}
                        </p>
                      </td>

                      {/* Workspace */}
                      <td className="px-4 py-4 text-sm text-slate-700 sm:px-6">
                        {activity.workspace?.name ||
                          "—"}
                      </td>

                      {/* Project */}
                      <td className="px-4 py-4 text-sm text-slate-700 sm:px-6">
                        {activity.project?.name ||
                          "—"}
                      </td>

                      {/* Task */}
                      <td className="px-4 py-4 text-sm text-slate-700 sm:px-6">
                        {activity.task?.title ||
                          "—"}
                      </td>

                      {/* Time */}
                      <td className="px-4 py-4 text-sm text-slate-500 sm:px-6">
                        {activity.createdAt
                          ? new Date(
                              activity.createdAt
                            ).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminActivity;