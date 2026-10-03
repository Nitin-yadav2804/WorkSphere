import { Trash2 } from 'lucide-react';
import ModalFrame from '../components/ui/ModalFrame';
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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
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
    socket?.on('conversation:deleted', load);
    socket?.on('notification:created', load);
    socket?.on('connect', load);
    return () => {
      active = false;
      socket?.off('conversation:deleted', load);
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
  const remove = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await api.delete(`/conversations/${deleteTarget._id}`);
      setConversations(current => current.filter(c => c._id !== deleteTarget._id));
      if (params.get('conversation') === deleteTarget._id) setParams({});
      setDeleteTarget(null);
      toast.success('Chat deleted');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not delete chat'));
    } finally {
      setDeleting(false);
    }
  };
  if (loading) return <PageLoading>Loading messages...</PageLoading>;
  return <div className="space-y-6 p-8"><h1 className="text-3xl font-bold text-slate-900">Messages</h1><div className="grid gap-6 xl:grid-cols-[16rem_1fr]"><aside className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4"><h2 className="font-semibold">New conversation</h2><select aria-label="Workspace" value={workspaceId} onChange={e => {
          setMembers([]);
          setWorkspaceId(e.target.value);
        }} className="w-full rounded-xl border border-slate-200 p-2">{workspaces.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}</select><select aria-label="Member" value="" disabled={busy} onChange={e => start(e.target.value)} className="w-full rounded-xl border border-slate-200 p-2"><option value="">Choose a member</option>{members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}</select><h2 className="pt-4 font-semibold">Conversations</h2>{conversations.map(c => <div key={c._id} className={`flex items-center gap-2 rounded-xl p-2 ${selected?._id === c._id ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50'}`}>
          <button onClick={() => setParams({ conversation: c._id })} className="min-w-0 flex-1 p-1 text-left text-sm"><span className="block truncate">{c.participants.filter(p => p._id !== userId).map(p => p.name).join(', ')}</span><span className="block text-xs text-slate-400">{c.workspace?.name}</span></button>
          <button type="button" aria-label={`Delete chat with ${c.participants.filter(p => p._id !== userId).map(p => p.name).join(', ')}`} title="Delete chat" onClick={() => setDeleteTarget(c)} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"><Trash2 size={17} /></button>
        </div>)}</aside><section className="rounded-2xl border border-slate-200 bg-white">{selected ? <WorkspaceChat key={selected._id} conversationId={selected._id} workspaceId={selected.workspace._id} participants={selected.participants} /> : <p className="p-12 text-center text-slate-500">Choose a member or conversation to start chatting.</p>}</section></div>
    {deleteTarget && <ModalFrame overlayProps={{ className: 'fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm' }} panelProps={{ role: 'dialog', 'aria-modal': true, 'aria-labelledby': 'delete-chat-title', className: 'w-full max-w-md' }}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 id="delete-chat-title" className="text-lg font-bold text-slate-900">Delete chat?</h2>
        <p className="mt-3 text-sm text-slate-600">This permanently deletes the conversation and its messages for both participants. Shared files remain in the workspace. This cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" disabled={deleting} onClick={() => setDeleteTarget(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold">Cancel</button>
          <button type="button" disabled={deleting} onClick={remove} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete chat'}</button>
        </div>
      </div>
    </ModalFrame>}
  </div>;
}
