export default function TaskStatusFields({ register }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Status
        </label>

        <select
          {...register("status")}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        >
          <option value="todo">To Do</option>

          <option value="in-progress">In Progress</option>

          <option value="completed">Completed</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Priority
        </label>

        <select
          {...register("priority")}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        >
          <option value="low">Low</option>

          <option value="medium">Medium</option>

          <option value="high">High</option>

          <option value="urgent">Urgent</option>
        </select>
      </div>
    </div>
  );
}
