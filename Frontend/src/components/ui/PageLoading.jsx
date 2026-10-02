import LoadingState from "./LoadingState";
import Spinner from "./Spinner";

// Every page uses the same loading treatment while keeping its existing message.
export default function PageLoading({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 sm:p-8">
      <div className="flex w-full max-w-md items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <Spinner size={24} className="animate-spin text-blue-600" />
        <LoadingState as="p" className="text-sm font-medium text-slate-500">
          {children}
        </LoadingState>
      </div>
    </div>
  );
}
