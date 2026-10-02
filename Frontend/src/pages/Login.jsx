import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useDispatch } from "react-redux";

import AuthLayout from "../layouts/AuthLayout.jsx";
import AuthEmailField from "../components/AuthEmailField.jsx";
import { loginSchema } from "../validators/auth.js";
import { getErrorDetails } from "../utils/errors.js";
import FieldError from "../components/ui/FieldError.jsx";
import { login } from "../services/authService.js";
import { setCredentials } from "../store/authSlice";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await login(data);

      const { token, user } = response;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      dispatch(setCredentials({ token, user }));

      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (error) {
      console.error("Login failed:", getErrorDetails(error));

      const message = error.response?.data?.message;

      if (message === "Email not found") {
        setError("email", {
          type: "server",
          message: "Email not found.",
        });
      } else if (message === "Incorrect password") {
        setError("password", {
          type: "server",
          message: "Incorrect password.",
        });
      } else {
        setError("email", {
          type: "server",
          message: message || "Login failed. Please try again.",
        });
      }
    }
  };

  return (
    <AuthLayout
      headline={
        <h1 className="max-w-lg text-5xl font-bold leading-tight text-white">
          Manage your work.
          <span className="block text-blue-100">Grow together.</span>
        </h1>
      }
      description={
        <p className="mt-6 max-w-md text-lg leading-8 text-blue-100">
          Bring your projects, tasks, teams and communication together in one
          powerful workspace.
        </p>
      }
    >
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

      {/*FORM*/}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <AuthEmailField register={register} errors={errors} />

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
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Enter your password"
              className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 ${
                errors.password
                  ? "border-red-400 focus:border-red-500"
                  : "border-slate-200 focus:border-blue-500"
              }`}
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>

          <FieldError
            error={errors.password}
            className="mt-1.5 text-sm text-red-500"
          />
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
    </AuthLayout>
  );
}

export default Login;
