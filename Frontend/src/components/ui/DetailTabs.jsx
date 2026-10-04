export default function DetailTabs({ scope, label, tabs, activeTab, onChange }) {
  return (
    <div className="rounded-t-2xl border-b border-slate-200 px-6 pt-2 sm:px-8">
      <div role="tablist" aria-label={label} className="flex gap-8 overflow-x-auto">
        {tabs.map(({ id, label: tabLabel, icon: Icon, count }) => (
          <button
            key={id}
            id={`${scope}-tab-${id}`}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            aria-controls={`${scope}-panel-${id}`}
            onClick={() => onChange(id)}
            className={`relative flex shrink-0 cursor-pointer items-center gap-2 border-b-2 px-1 py-4 text-sm font-semibold transition ${
              activeTab === id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon size={17} />
            {tabLabel}
            {count != null && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                activeTab === id ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
