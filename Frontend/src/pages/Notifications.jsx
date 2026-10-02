import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../services/api';
import { getSocket } from '../services/socket';
import PageLoading from '../components/ui/PageLoading';
import { getErrorMessage } from '../utils/errors';
import { formatRelativeTime } from '../utils/dates';
export default function Notifications() {
  const [items, setItems] = useState([]),
    [loading, setLoading] = useState(true),
    [unreadOnly, setUnreadOnly] = useState(false),
    [hasMore, setHasMore] = useState(false),
    [error, setError] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const {
          data
        } = await api.get('/notifications', {
          params: {
            unread: unreadOnly
          }
        });
        if (active) {
          setItems(data.notifications);
          setHasMore(data.hasMore);
          setError('');
        }
      } catch (e) {
        if (active) setError(getErrorMessage(e, 'Unable to load notifications'));
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const socket = getSocket();
    for (const event of ['connect', 'notification:created', 'notification:read']) socket?.on(event, load);
    return () => {
      active = false;
      for (const event of ['connect', 'notification:created', 'notification:read']) socket?.off(event, load);
    };
  }, [unreadOnly]);
  const read = async item => {
    try {
      await api.patch('/notifications/read', item ? {
        id: item._id
      } : {});
      setItems(current => unreadOnly ? current.filter(n => item && n._id !== item._id) : current.map(n => !item || n._id === item._id ? {
        ...n,
        readAt: new Date()
      } : n));
      if (item?.link) navigate(item.link);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Could not update notifications'));
    }
  };
  const older = async () => {
    try {
      const {
        data
      } = await api.get('/notifications', {
        params: {
          unread: unreadOnly,
          before: items.at(-1)?._id
        }
      });
      setItems(current => [...new Map([...current, ...data.notifications].map(n => [n._id, n])).values()]);
      setHasMore(data.hasMore);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Could not load notifications'));
    }
  };
  if (loading) return <PageLoading>Loading notifications...</PageLoading>;
  return <div className="mx-auto max-w-5xl space-y-6 p-8"><h1 className="text-3xl font-bold text-slate-900">Notifications</h1><div className="flex justify-between"><label className="text-sm"><input type="checkbox" checked={unreadOnly} onChange={e => setUnreadOnly(e.target.checked)} /> Unread only</label><button onClick={() => read()} className="text-sm font-semibold text-blue-600">Mark all as read</button></div>{error && <p role="alert" className="text-red-600">{error}</p>}<div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">{!items.length && <p className="p-12 text-center text-slate-500">No notifications.</p>}{items.map(item => <button key={item._id} onClick={() => read(item)} className={`block w-full p-5 text-left hover:bg-slate-50 ${item.readAt ? '' : 'bg-blue-50'}`}><p className="text-sm font-semibold text-slate-800">{!item.readAt && <span className="mr-2 text-blue-600">●</span>}{item.text}</p><p className="mt-2 text-xs text-slate-400">{formatRelativeTime(item.createdAt)}</p></button>)}</div>{hasMore && <button onClick={older} className="text-blue-600">Load older notifications</button>}</div>;
}
