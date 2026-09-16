import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  ShieldCheck,
  LogOut,
  Settings as SettingsIcon,
} from "lucide-react";
import { toast } from "sonner";

function Settings() {
  const navigate = useNavigate();

  const currentUser = useSelector(
    (state) => state.auth.user
  );

  const handleLogout = () => {
    localStorage.removeItem("token");

    toast.success("Logged out successfully.");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-8">
      <div className="mx-auto max-w-4xl">

        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <SettingsIcon size={21} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Settings
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage your account and preferences.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <User size={19} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Profile
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Your WorkSphere account information.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 px-6 py-6 sm:px-8">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Name
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5">
                  <User
                    size={18}
                    className="shrink-0 text-slate-400"
                  />

                  <p className="text-sm font-medium text-slate-700">
                    {currentUser?.name ||
                      "Not available"}
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5">
                  <Mail
                    size={18}
                    className="shrink-0 text-slate-400"
                  />

                  <p className="break-all text-sm font-medium text-slate-700">
                    {currentUser?.email ||
                      "Not available"}
                  </p>
                </div>
              </div>

              {currentUser?.role && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Account role
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5">
                    <ShieldCheck
                      size={18}
                      className="shrink-0 text-slate-400"
                    />

                    <p className="text-sm font-medium capitalize text-slate-700">
                      {currentUser.role}
                    </p>
                  </div>
                </div>
              )}

            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <ShieldCheck size={19} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Security
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Manage your account security.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Password
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Password management will be available here.
                </p>
              </div>

              <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
                Coming soon
              </span>
            </div>
          </section>

          <section className="rounded-2xl border border-red-100 bg-white shadow-sm">
            <div className="border-b border-red-50 px-6 py-5 sm:px-8">
              <h2 className="text-lg font-bold text-slate-900">
                Account
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Sign out of your WorkSphere account.
              </p>
            </div>

            <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Log out
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  You can log back in anytime using your account.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-fit items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                <LogOut size={17} />
                Log out
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

export default Settings;