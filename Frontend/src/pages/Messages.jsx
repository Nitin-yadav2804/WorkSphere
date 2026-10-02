import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import api from '../services/api';
import { getSocket } from '../services/socket';
import WorkspaceChat from '../components/WorkspaceChat';
import PageLoading from '../components/ui/PageLoading';
import { getErrorMessage } from '../utils/errors';
export default function Messages() {
  const [params, setParams] = useSearchParams();
  const user = useSelector(s => s.auth.user);
  const userId = String(user?._id || user?.id);
  const [conversations, setConversations] = useState([]),
    [workspaces, setWorkspaces] = useState([]),
    [workspaceId, setWorkspaceId] = useState(''),
    [members, setMembers] = useState([]),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false);
  const selected = conversations.find(c => c._id === params.get('conversation'));
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [a, b] = await Promise.all([api.get('/conversations'), api.get('/workspaces')]);
        if (active) {
          setConversations(a.data.conversations);
          setWorkspaces(b.data.workspaces);
          setWorkspaceId(current => current || b.data.workspaces[0]?._id || '');
        }
      } catch (e) {
        toast.error(getErrorMessage(e, 'Could not load conversations'));
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const socket = getSocket();
    socket?.on('notification:created', load);
    socket?.on('connect', load);
    return () => {
      active = false;
      socket?.off('notification:created', load);
      socket?.off('connect', load);
    };
  }, []);
  useEffect(() => {
    let active = true;
    if (workspaceId) api.get(`/workspaces/${workspaceId}/members`).then(({
      data
    }) => {
      if (active) setMembers(data.members.map(m => m.user).filter(m => m && m._id !== userId));
    }).catch(() => toast.error('Unable to load members'));
    return () => {
      active = false;
    };
  }, [workspaceId, userId]);
  const start = async id => {
    if (!id) return;
    setBusy(true);
    try {
      const {
        data
      } = await api.post('/conversations', {
        workspaceId,
        userId: id
      });
      const response = await api.get('/conversations');
      setConversations(response.data.conversations);
      setParams({
        conversation: data.conversation._id
      });
    } catch (e) {
      toast.error(getErrorMessage(e, 'Could not start conversation'));
    } finally {
      setBusy(false);
    }
  };
  if (loading) return <PageLoading>Loading messages...</PageLoading>;
  return <div className="space-y-6 p-8"><h1 className="text-3xl font-bold text-slate-900">Messages</h1><div className="grid gap-6 xl:grid-cols-[16rem_1fr]"><aside className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4"><h2 className="font-semibold">New conversation</h2><select aria-label="Workspace" value={workspaceId} onChange={e => {
          setMembers([]);
          setWorkspaceId(e.target.value);
        }} className="w-full rounded-xl border border-slate-200 p-2">{workspaces.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}</select><select aria-label="Member" value="" disabled={busy} onChange={e => start(e.target.value)} className="w-full rounded-xl border border-slate-200 p-2"><option value="">Choose a member</option>{members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}</select><h2 className="pt-4 font-semibold">Conversations</h2>{conversations.map(c => <button key={c._id} onClick={() => setParams({
          conversation: c._id
        })} className={`block w-full rounded-xl p-3 text-left text-sm ${selected?._id === c._id ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50'}`}>{c.participants.filter(p => p._id !== userId).map(p => p.name).join(', ')}<span className="block text-xs text-slate-400">{c.workspace?.name}</span></button>)}</aside><section className="rounded-2xl border border-slate-200 bg-white">{selected ? <WorkspaceChat key={selected._id} conversationId={selected._id} workspaceId={selected.workspace._id} participants={selected.participants} /> : <p className="p-12 text-center text-slate-500">Choose a member or conversation to start chatting.</p>}</section></div></div>;
}
