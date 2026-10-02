import { useEffect, useState } from 'react';
import api from '../services/api';
import PageLoading from '../components/ui/PageLoading';
import { getErrorMessage } from '../utils/errors';
export default function Analytics() {
  const [workspaces, setWorkspaces] = useState([]),
    [workspace, setWorkspace] = useState(''),
    [from, setFrom] = useState(''),
    [to, setTo] = useState(''),
    [data, setData] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    api.get('/workspaces').then(({
      data
    }) => {
      if (active) {
        setWorkspaces(data.workspaces);
        setWorkspace(data.workspaces[0]?._id || '');
        setLoading(false);
      }
    }).catch(e => {
      if (active) {
        setError(getErrorMessage(e, 'Unable to load workspaces'));
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!workspace) return;
    let active = true;
    setLoading(true);
    api.get(`/workspaces/${workspace}/analytics`, {
      params: {
        from: from || undefined,
        to: to || undefined
      }
    }).then(({
      data
    }) => {
      if (active) {
        setData(data);
        setError('');
      }
    }).catch(e => {
      if (active) setError(getErrorMessage(e, 'Could not load analytics'));
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [workspace, from, to]);
  const table = (title, rows) => <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-6"><h2 className="mb-4 text-lg font-bold">{title}</h2><table className="w-full text-left text-sm"><thead><tr>{['Name', 'Total', 'Todo', 'In progress', 'Completed', 'Overdue', 'Completion'].map(h => <th key={h} className="p-2 text-slate-500">{h}</th>)}</tr></thead><tbody>{rows.map(r => <tr key={r._id || r.priority} className="border-t border-slate-100"><td className="p-2">{r.name || r.priority}</td>{['total', 'todo', 'inProgress', 'completed', 'overdue'].map(key => <td key={key} className="p-2">{r[key]}</td>)}<td className="p-2">{r.total ? Math.round(r.completed / r.total * 100) : 0}%</td></tr>)}</tbody></table>{!rows.length && <p className="p-6 text-slate-500">No matching data.</p>}</section>;
  return <div className="space-y-6 p-8"><h1 className="text-3xl font-bold text-slate-900">Analytics</h1><div className="flex flex-wrap gap-4 rounded-2xl border border-slate-200 bg-white p-5"><label className="text-sm">Workspace<select value={workspace} onChange={e => setWorkspace(e.target.value)} className="ml-2 rounded-lg border border-slate-200 p-2">{workspaces.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}</select></label><label className="text-sm">Created from<input type="date" value={from} onChange={e => setFrom(e.target.value)} className="ml-2 rounded-lg border border-slate-200 p-2" /></label><label className="text-sm">Through<input type="date" value={to} min={from} onChange={e => setTo(e.target.value)} className="ml-2 rounded-lg border border-slate-200 p-2" /></label><button onClick={() => {
        setFrom('');
        setTo('');
      }} className="text-blue-600">Clear dates</button></div><p className="text-xs text-slate-500">Date filters use task creation dates (UTC). Overdue counts use current due dates and status.</p>{loading ? <PageLoading>Loading analytics...</PageLoading> : error ? <p role="alert" className="text-red-600">{error}</p> : data ? <><div className="grid gap-4 sm:grid-cols-3">{[['Tasks', data.summary.total], ['Completed', data.summary.completed], ['Overdue', data.summary.overdue]].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-6"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>)}</div>{table('Projects', data.projects)}{table('Team workload', data.assignees)}{table('Priority breakdown', data.priorities)}</> : <p className="text-slate-500">Create a workspace to view analytics.</p>}</div>;
}
