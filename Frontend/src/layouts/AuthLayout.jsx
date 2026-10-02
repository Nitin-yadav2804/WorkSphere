export default function AuthLayout({ headline, description, children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
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
          {headline}

          {/* Description */}
          {description}

          {/* Features */}
          <div className="mt-10 flex items-center gap-8 text-sm text-blue-100">
            <div>
              <p className="text-2xl font-bold text-white">Projects</p>
              <p>Organized</p>
            </div>

            <div className="h-10 w-px bg-blue-400" />

            <div>
              <p className="text-2xl font-bold text-white">Teams</p>
              <p>Connected</p>
            </div>

            <div className="h-10 w-px bg-blue-400" />

            <div>
              <p className="text-2xl font-bold text-white">Tasks</p>
              <p>Tracked</p>
            </div>
          </div>
        </div>
      </div>

      {/* LOGIN SECTION */}

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
          {children}
        </div>
      </div>
    </div>
  );
}
