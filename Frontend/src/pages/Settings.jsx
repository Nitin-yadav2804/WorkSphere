import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  ShieldCheck,
  LogOut,
  Settings as SettingsIcon,
  Lock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { changePassword, updateProfile } from "../services/authService";
import { getErrorDetails, getErrorMessage } from "../utils/errors";
import { setCredentials, logout } from "../store/authSlice";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

function Settings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: currentUser, token } = useSelector((state) => state.auth);

  const profileForm = useForm({
    defaultValues: {
      name: currentUser?.name || "",
      email: currentUser?.email || "",
    },
  });

  const passwordForm = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    profileForm.reset({
      name: currentUser?.name || "",
      email: currentUser?.email || "",
    });
  }, [currentUser]);

  const handleProfileSubmit = async (data) => {
    try {
      const response = await updateProfile(data);
      const updatedUser = response.user;

      localStorage.setItem("user", JSON.stringify(updatedUser));
      dispatch(setCredentials({ token, user: updatedUser }));
      toast.success("Profile updated successfully.");
    } catch (error) {
      console.error("Failed to update profile:", getErrorDetails(error));
      toast.error(getErrorMessage(error, "Failed to update profile."));
    }
  };

  const handlePasswordSubmit = async (data) => {
    try {
      await changePassword(data);
      passwordForm.reset();
      toast.success("Password updated successfully.");
    } catch (error) {
      console.error("Failed to update password:", getErrorDetails(error));
      toast.error(getErrorMessage(error, "Failed to update password."));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully.");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <SettingsIcon size={21} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Settings</h1>
            <p className="mt-1 text-sm text-slate-500">Manage your account and preferences.</p>
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><User size={19} /></div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Profile</h2>
                  <p className="mt-0.5 text-sm text-slate-500">Update your WorkSphere account information.</p>
                </div>
              </div>
            </div>
            <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-5 px-6 py-6 sm:px-8">
              <div>
                <label htmlFor="settings-name" className="mb-2 block text-sm font-semibold text-slate-700">Name</label>
                <input id="settings-name" {...profileForm.register("name", { required: "Name is required" })} className={inputClass} />
                {profileForm.formState.errors.name && <p className="mt-1.5 text-sm text-red-500">{profileForm.formState.errors.name.message}</p>}
              </div>
              <div>
                <label htmlFor="settings-email" className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                <div className="relative"><Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input id="settings-email" type="email" {...profileForm.register("email", { required: "Email is required" })} className={`${inputClass} pl-11`} /></div>
                {profileForm.formState.errors.email && <p className="mt-1.5 text-sm text-red-500">{profileForm.formState.errors.email.message}</p>}
              </div>
              {currentUser?.role && <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5"><ShieldCheck size={18} className="text-slate-400" /><p className="text-sm font-medium capitalize text-slate-700">{currentUser.role}</p></div>}
              <button type="submit" disabled={profileForm.formState.isSubmitting} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                {profileForm.formState.isSubmitting && <Loader2 size={17} className="animate-spin" />}
                {profileForm.formState.isSubmitting ? "Saving..." : "Save changes"}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><ShieldCheck size={19} /></div><div><h2 className="text-lg font-bold text-slate-900">Security</h2><p className="mt-0.5 text-sm text-slate-500">Manage your account security.</p></div></div>
            </div>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-5 px-6 py-6 sm:px-8">
              <div><label htmlFor="current-password" className="mb-2 block text-sm font-semibold text-slate-700">Current password</label><input id="current-password" type="password" {...passwordForm.register("currentPassword", { required: "Current password is required" })} className={inputClass} />{passwordForm.formState.errors.currentPassword && <p className="mt-1.5 text-sm text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>}</div>
              <div><label htmlFor="new-password" className="mb-2 block text-sm font-semibold text-slate-700">New password</label><input id="new-password" type="password" {...passwordForm.register("newPassword", { required: "New password is required", minLength: { value: 6, message: "New password must be at least 6 characters" } })} className={inputClass} />{passwordForm.formState.errors.newPassword && <p className="mt-1.5 text-sm text-red-500">{passwordForm.formState.errors.newPassword.message}</p>}</div>
              <div><label htmlFor="confirm-password" className="mb-2 block text-sm font-semibold text-slate-700">Confirm new password</label><input id="confirm-password" type="password" {...passwordForm.register("confirmPassword", { required: "Please confirm your new password", validate: (value) => value === passwordForm.getValues("newPassword") || "Passwords do not match" })} className={inputClass} />{passwordForm.formState.errors.confirmPassword && <p className="mt-1.5 text-sm text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>}</div>
              <button type="submit" disabled={passwordForm.formState.isSubmitting} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"><Lock size={17} />{passwordForm.formState.isSubmitting ? "Updating..." : "Update password"}</button>
            </form>
          </section>

          <section className="rounded-2xl border border-red-100 bg-white shadow-sm">
            <div className="border-b border-red-50 px-6 py-5 sm:px-8"><h2 className="text-lg font-bold text-slate-900">Account</h2><p className="mt-1 text-sm text-slate-500">Sign out of your WorkSphere account.</p></div>
            <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8"><div><h3 className="text-sm font-semibold text-slate-900">Log out</h3><p className="mt-1 text-sm text-slate-500">You can log back in anytime using your account.</p></div><button type="button" onClick={handleLogout} className="flex w-fit items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"><LogOut size={17} />Log out</button></div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Settings;
