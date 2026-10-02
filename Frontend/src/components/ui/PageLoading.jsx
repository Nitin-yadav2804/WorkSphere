import LoadingState from "./LoadingState";
import Spinner from "./Spinner";

const card = "rounded-2xl border border-slate-200 bg-white p-8 shadow-sm";
const layouts = {
  workspace: {
    wrappers: ["min-h-screen bg-slate-50 p-8", "mx-auto max-w-7xl"],
  },
  workspaces: { wrappers: ["p-8", "mx-auto max-w-7xl"] },
  activity: {
    wrappers: ["min-h-screen bg-slate-50 p-8", "mx-auto max-w-7xl", card],
    text: "text-sm text-slate-500",
  },
  project: {
    wrappers: [
      "min-h-screen bg-slate-50 p-8",
      "mx-auto max-w-7xl",
      `flex items-center gap-3 ${card}`,
    ],
    text: "text-sm font-medium text-slate-500",
    spinner: 20,
  },
  task: {
    wrappers: [
      "min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8",
      "mx-auto max-w-5xl",
      card,
      "flex items-center gap-3",
    ],
    text: "text-sm font-medium text-slate-500",
    spinner: 20,
  },
  dashboard: {
    wrappers: [
      "min-h-screen bg-slate-50 p-6 sm:p-8",
      "mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center",
      "flex flex-col items-center gap-3 text-slate-500",
    ],
    text: "text-sm font-medium",
    spinner: 30,
  },
  admin: { wrappers: ["p-4 sm:p-6 lg:p-8"] },
  adminDashboard: {
    wrappers: ["flex min-h-screen items-center justify-center"],
    as: "div",
    text: "text-sm text-slate-500",
  },
};

// Named layouts preserve the existing page designs in one implementation.
export default function PageLoading({ variant, children }) {
  const layout = layouts[variant];
  const content = (
    <>
      {layout.spinner && (
        <Spinner size={layout.spinner} className="animate-spin text-blue-600" />
      )}
      <LoadingState as={layout.as} className={layout.text || "text-slate-500"}>
        {children}
      </LoadingState>
    </>
  );
  return layout.wrappers.reduceRight(
    (child, className) => <div className={className}>{child}</div>,
    content
  );
}
