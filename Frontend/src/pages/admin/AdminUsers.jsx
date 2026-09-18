import { useEffect, useState } from "react";
import api from "../../services/api";
import { Search, Power } from "lucide-react";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const fetchUsers = async (searchTerm = "") => {
    try {
      const endpoint = searchTerm
        ? `/admin/users/search?search=${encodeURIComponent(searchTerm)}`
        : "/admin/users";

      const response = await api.get(endpoint);
      setUsers(response.data.users);
    } catch (error) {
      console.error(
        "Failed to fetch users:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, {
        role,
      });

      fetchUsers(search);
    } catch (error) {
      console.error(
        "Failed to update user role:",
        error.response?.data || error.message
      );
    }
  };

  const handleStatusChange = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/status`);

      fetchUsers(search);
    } catch (error) {
      console.error(
        "Failed to update user status:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900">
        User Management
      </h1>

      <p className="mt-2 text-slate-500">
        Manage WorkSphere users, roles and account status.
      </p>

      {loading ? (
        <p className="mt-8 text-slate-500">
          Loading users...
        </p>
      ) : (
        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {/* Search */}
          <div className="mt-6 flex w-full items-center gap-4 px-8">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearch(value);
                  fetchUsers(value);
                }}
                placeholder="Search users..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>

            <span className="whitespace-nowrap rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600">
              {users.length}{" "}
              {users.length === 1 ? "user" : "users"}
            </span>
          </div>

          {/* Users Table */}
          <div className="mt-6">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Name
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Email
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Role
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {user.name}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {user.email}
                    </td>

                    <td className="px-6 py-4">
                      {user.email === currentUser?.email ? (
                        <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600">
                          Admin
                        </span>
                      ) : (
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(
                              user._id,
                              e.target.value
                            )
                          }
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          user.isActive === false
                            ? "bg-slate-100 text-slate-600"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {user.isActive === false
                          ? "Inactive"
                          : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.email === currentUser?.email ? (
                        <span className="text-sm text-slate-400">
                          —
                        </span>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(user._id)}
                          className={`cursor-pointer inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                            user.isActive === false
                              ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          <Power size={15} />
                          {user.isActive === false ? "Activate" : "Deactivate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;