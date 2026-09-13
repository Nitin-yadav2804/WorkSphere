import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, ArrowRight } from "lucide-react";
import api from "../services/api";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        try {
            const response = await api.post("/auth/login", data);

            const { token, user } = response.data;

            dispatch(
            setCredentials({
                token,
                user,
            })
            );

            navigate("/dashboard");
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
        }
        };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="relative hidden overflow-hidden bg-blue-600 lg:flex lg:w-1/2">
        {/* Decorative shapes */}
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-500/40" />

        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-blue-700/40" />

        <div className="absolute left-1/3 top-1/2 h-40 w-40 rounded-full bg-blue-400/20" />

        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
          {/* Logo */}
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl font-bold text-blue-600 shadow-lg">
              W
            </div>

            <span className="text-2xl font-bold tracking-tight text-white">
              WorkSphere
            </span>
          </div>

          {/* Heading */}
          <h1 className="max-w-lg text-5xl font-bold leading-tight text-white">
            Manage your work.
            <span className="block text-blue-100">
              Grow together.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-md text-lg leading-8 text-blue-100">
            Bring your projects, tasks, teams and communication together in
            one powerful workspace.
          </p>

          {/* Features */}
          <div className="mt-10 flex items-center gap-8 text-sm text-blue-100">
            <div>
              <p className="text-2xl font-bold text-white">
                Projects
              </p>

              <p>Organized</p>
            </div>

            <div className="h-10 w-px bg-blue-400" />

            <div>
              <p className="text-2xl font-bold text-white">
                Teams
              </p>

              <p>Connected</p>
            </div>

            <div className="h-10 w-px bg-blue-400" />

            <div>
              <p className="text-2xl font-bold text-white">
                Tasks
              </p>

              <p>Tracked</p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          LOGIN SECTION
      ========================== */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-md">
              W
            </div>

            <span className="text-2xl font-bold text-slate-900">
              WorkSphere
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold tracking-wide text-blue-600">
              WELCOME BACK
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Sign in to your account
            </h2>

            <p className="mt-2 text-slate-500">
              Enter your details to continue to WorkSphere.
            </p>
          </div>

          {/* =========================
              FORM
          ========================== */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="you@example.com"
                  className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 ${
                    errors.email
                      ? "border-red-400 focus:border-red-500"
                      : "border-slate-200 focus:border-blue-500"
                  }`}
                />
              </div>

              {errors.email && (
                <p className="mt-1.5 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <button
                  type="button"
                  className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <Lock
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder="Enter your password"
                  className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 ${
                    errors.password
                      ? "border-red-400 focus:border-red-500"
                      : "border-slate-200 focus:border-blue-500"
                  }`}
                />
              </div>

              {errors.password && (
                <p className="mt-1.5 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />

              <label
                htmlFor="remember"
                className="text-sm text-slate-600"
              >
                Remember me
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-blue-600/30 active:scale-[0.99]"
            >
              Sign in

              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </form>

          {/* Register */}
          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Create an account
            </Link>
          </p>

          {/* Footer */}
          <p className="mt-10 text-center text-xs text-slate-400">
            © 2026 WorkSphere. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;