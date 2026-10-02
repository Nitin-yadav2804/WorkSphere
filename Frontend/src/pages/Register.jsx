import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

import AuthLayout from "../layouts/AuthLayout.jsx";
import AuthEmailField from "../components/AuthEmailField.jsx";
import { registerSchema } from "../validators/auth.js";
import { getErrorDetails } from "../utils/errors.js";
import FieldError from "../components/ui/FieldError.jsx";
import { registerUser } from "../services/authService.js";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", getErrorDetails(error));
    }
  };

  return (
    <AuthLayout
      headline={
        <h1 className="max-w-lg text-5xl font-bold leading-tight text-white">
          Build better.
          <span className="block text-blue-100">Work together.</span>
        </h1>
      }
      description={
        <p className="mt-6 max-w-md text-lg leading-8 text-blue-100">
          Create your workspace and bring projects, tasks and your team together
          in one place.
        </p>
      }
    >
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold tracking-wide text-blue-600">
          GET STARTED
        </p>

        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Create your account
        </h2>

        <p className="mt-2 text-slate-500">
          Join WorkSphere and start managing your work.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Full name
          </label>

          <div className="relative">
            <User
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="name"
              type="text"
              {...register("name")}
              placeholder="John Doe"
              className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 ${
                errors.name
                  ? "border-red-400 focus:border-red-500"
                  : "border-slate-200 focus:border-blue-500"
              }`}
            />
          </div>

          <FieldError
            error={errors.name}
            className="mt-1.5 text-sm text-red-500"
          />
        </div>

        {/* Email */}
        <AuthEmailField register={register} errors={errors} />

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Password
          </label>

          <div className="relative">
            <Lock
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Create a password"
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

        {/* Confirm password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Confirm password
          </label>

          <div className="relative">
            <Lock
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="Confirm your password"
              className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 ${
                errors.confirmPassword
                  ? "border-red-400 focus:border-red-500"
                  : "border-slate-200 focus:border-blue-500"
              }`}
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword((current) => !current)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>

          <FieldError
            error={errors.confirmPassword}
            className="mt-1.5 text-sm text-red-500"
          />
        </div>

        {/* Create account */}
        <button
          type="submit"
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-blue-600/30 active:scale-[0.99]"
        >
          Create account
          <ArrowRight
            size={18}
            className="transition-transform group-hover:translate-x-1"
          />
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-blue-600 transition hover:text-blue-700"
        >
          Sign in
        </Link>
      </p>

      <p className="mt-10 text-center text-xs text-slate-400">
        © 2026 WorkSphere. All rights reserved.
      </p>
    </AuthLayout>
  );
}

export default Register;
