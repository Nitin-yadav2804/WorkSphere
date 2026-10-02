import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { updateTask, getTask } from '../services/taskService';
import { getErrorMessage } from '../utils/errors';
import { getTaskStatusLabel, getPriorityLabel } from '../utils/presentation';
const statuses = ['todo', 'in-progress', 'completed'];
export default function TaskBoard({
  tasks,
  onChanged,
  onOpen,
  onCreate,
  onEdit,
  onDelete
}) {
  const [view, setView] = useState('list'),
    [search, setSearch] = useState(''),
    [status, setStatus] = useState(''),
    [priority, setPriority] = useState(''),
    [assignee, setAssignee] = useState(''),
    [due, setDue] = useState(''),
    [sort, setSort] = useState('oldest'),
    [busy, setBusy] = useState(null);
  const members = [...new Map(tasks.filter(t => t.assignedTo?._id).map(t => [t.assignedTo._id, t.assignedTo])).values()];
  const filtered = useMemo(() => tasks.filter(t => {
    const text = `${t.title} ${t.description || ''}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (!status || t.status === status) && (!priority || t.priority === priority) && (!assignee || (assignee === 'unassigned' ? !t.assignedTo : String(t.assignedTo?._id || t.assignedTo) === assignee)) && (!due || (due === 'overdue' ? t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < new Date() : t.dueDate?.slice(0, 10) === new Date().toISOString().slice(0, 10)));
  }).sort((a, b) => sort === 'due' ? (a.dueDate ? +new Date(a.dueDate) : Infinity) - (b.dueDate ? +new Date(b.dueDate) : Infinity) : sort === 'priority' ? ['urgent', 'high', 'medium', 'low'].indexOf(a.priority) - ['urgent', 'high', 'medium', 'low'].indexOf(b.priority) : (sort === 'newest' ? -1 : 1) * (+new Date(a.createdAt) - +new Date(b.createdAt))), [tasks, search, status, priority, assignee, due, sort]);
  const move = async (id, nextStatus) => {
    const task = tasks.find(t => t._id === id);
    if (!task || task.status === nextStatus || busy) return;
    setBusy(id);
    try {
      await updateTask(id, {
        status: nextStatus
      });
      const data = await getTask(id);
      onChanged(data.task);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Unable to change task status'));
    } finally {
      setBusy(null);
    }
  };
  const selectClass = 'rounded-xl border border-slate-200 bg-white p-2 text-sm';
  const card = task => <article key={task._id} draggable={!busy} onDragStart={e => {
    e.dataTransfer.setData('text/plain', task._id);
    e.dataTransfer.effectAllowed = 'move';
  }} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><button onClick={() => onOpen(task._id)} className="text-left font-semibold text-slate-900 hover:text-blue-600">{task.title}</button><p className="mt-1 line-clamp-2 text-sm text-slate-500">{task.description}</p><p className="mt-3 text-xs text-slate-500">{task.assignedTo?.name || 'Unassigned'} · {getPriorityLabel(task.priority)}{task.dueDate && ` · Due ${task.dueDate.slice(0, 10)}`}</p><div className="mt-3 flex flex-wrap items-center gap-2"><select aria-label={`Status for ${task.title}`} value={task.status} disabled={Boolean(busy)} onChange={e => move(task._id, e.target.value)} className={selectClass}>{statuses.map(s => <option key={s} value={s}>{getTaskStatusLabel(s)}</option>)}</select><button onClick={e => onEdit(e, task)} className="text-xs text-blue-600">Edit</button><button onClick={e => onDelete(e, task)} className="text-xs text-red-600">Delete</button>{busy === task._id && <span className="text-xs">Saving...</span>}</div></article>;
  return <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6"><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">Project tasks</h2><p className="text-sm text-slate-500">{filtered.length} of {tasks.length} tasks</p></div><button onClick={onCreate} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Create task</button></div><div className="flex flex-wrap gap-2"><input aria-label="Search tasks" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." className={`${selectClass} grow`} /><select aria-label="Status filter" value={status} onChange={e => setStatus(e.target.value)} className={selectClass}><option value="">All statuses</option>{statuses.map(s => <option key={s} value={s}>{getTaskStatusLabel(s)}</option>)}</select><select aria-label="Priority filter" value={priority} onChange={e => setPriority(e.target.value)} className={selectClass}><option value="">All priorities</option>{['low', 'medium', 'high', 'urgent'].map(p => <option key={p} value={p}>{getPriorityLabel(p)}</option>)}</select><select aria-label="Assignee filter" value={assignee} onChange={e => setAssignee(e.target.value)} className={selectClass}><option value="">All assignees</option><option value="unassigned">Unassigned</option>{members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}</select><select aria-label="Due date filter" value={due} onChange={e => setDue(e.target.value)} className={selectClass}><option value="">Any due date</option><option value="overdue">Overdue</option><option value="today">Due today (UTC)</option></select><select aria-label="Task sorting" value={sort} onChange={e => setSort(e.target.value)} className={selectClass}><option value="oldest">Oldest first</option><option value="newest">Newest first</option><option value="due">Due date</option><option value="priority">Priority</option></select></div><div className="flex gap-2">{['list', 'board'].map(v => <button key={v} onClick={() => setView(v)} className={`rounded-xl px-4 py-2 text-sm ${view === v ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}>{v === 'list' ? 'List' : 'Kanban board'}</button>)}</div>{view === 'board' ? <><p className="text-xs text-slate-500">Drag tasks between columns, or use the status selector.</p><div className="grid gap-4 lg:grid-cols-3">{statuses.map(s => <div key={s} onDragOver={e => e.preventDefault()} onDrop={e => {
          e.preventDefault();
          move(e.dataTransfer.getData('text/plain'), s);
        }} className="min-h-48 space-y-3 rounded-2xl bg-slate-50 p-3"><h3 className="p-2 font-semibold text-slate-600">{getTaskStatusLabel(s)} ({filtered.filter(t => t.status === s).length})</h3>{filtered.filter(t => t.status === s).map(card)}</div>)}</div></> : <div className="space-y-3">{filtered.map(card)}{!filtered.length && <p className="p-10 text-center text-slate-500">No tasks match these filters.</p>}</div>}</section>;
}
