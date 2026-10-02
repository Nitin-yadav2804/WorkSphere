import { Mail } from "lucide-react";

import FieldError from "./ui/FieldError";

export default function AuthEmailField({ register, errors }) {
  return (
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

      <FieldError
          error={errors.email}
          className="mt-1.5 text-sm text-red-500"
        />
    </div>
  );
}
