import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, Paperclip, X } from 'lucide-react';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { getSocket, joinScope } from '../services/socket';
import { uploadFile } from '../services/fileService';
import { getErrorMessage } from '../utils/errors';
import { formatCommentDate } from '../utils/dates';
import LoadingState from './ui/LoadingState';
import FileList from './files/FileList';
import MentionPicker from './MentionPicker';
const merge = (a, b) => [...new Map([...a, ...b].map(item => [item._id, item])).values()].sort((a, b) => a._id.localeCompare(b._id));
function ChatSession({
  workspaceId,
  projectId,
  conversationId,
  participants
}) {
  const kind = conversationId ? 'conversation' : projectId ? 'project' : 'workspace';
  const id = conversationId || projectId || workspaceId;
  const room = `${kind}:${id}`;
  const endpoint = `/${kind}s/${id}/messages`;
  const user = useSelector(state => state.auth.user);
  const userId = String(user?._id || user?.id || '');
  const [messages, setMessages] = useState([]),
    [content, setContent] = useState('');
  const [loading, setLoading] = useState(true),
    [sending, setSending] = useState(false),
    [uploading, setUploading] = useState(false);
  const [hasMore, setHasMore] = useState(false),
    [olderBusy, setOlderBusy] = useState(false),
    [error, setError] = useState('');
  const [attachments, setAttachments] = useState([]),
    [online, setOnline] = useState([]),
    [typers, setTypers] = useState({});
  const [visible, setVisible] = useState(document.visibilityState === 'visible');
  const panel = useRef(null),
    typingTimer = useRef(),
    generation = useRef(0);
  useEffect(() => {
    const change = () => setVisible(document.visibilityState === 'visible' && document.hasFocus());
    document.addEventListener('visibilitychange', change);
    window.addEventListener('focus', change);
    window.addEventListener('blur', change);
    return () => {
      document.removeEventListener('visibilitychange', change);
      window.removeEventListener('focus', change);
      window.removeEventListener('blur', change);
    };
  }, []);
  useEffect(() => {
    const serial = ++generation.current;
    let active = true;
    const socket = getSocket();
    const refresh = async () => {
      try {
        const {
          data
        } = await api.get(endpoint);
        if (active) {
          setMessages(current => merge(current, data.messages));
          setHasMore(data.hasMore);
          setError('');
        }
      } catch (e) {
        if (active) setError(getErrorMessage(e, 'Failed to load chat'));
      } finally {
        if (active) setLoading(false);
      }
    };
    const onMessage = message => {
      const match = kind === 'conversation' ? String(message.conversation) === String(id) : kind === 'project' ? String(message.project) === String(id) && !message.conversation : String(message.workspace) === String(id) && !message.project && !message.conversation;
      if (match && active) setMessages(current => merge(current, [message]));
    };
    const onPresence = data => {
      if (data.room === room) setOnline(data.users);
    };
    const onTyping = data => {
      if (data.room === room && String(data.userId) !== userId) setTypers(current => ({
        ...current,
        [data.userId]: data.isTyping ? {
          name: data.name,
          until: Date.now() + 2500
        } : null
      }));
    };
    const onRead = data => {
      if (data.room === room) setMessages(current => current.map(m => data.ids.includes(m._id) ? {
        ...m,
        readBy: [...new Set([...(m.readBy || []).map(String), String(data.userId)])]
      } : m));
    };
    const onRevoked = data => {
      if (data.room === room) {
        setMessages([]);
        setError('You no longer have access to this chat.');
      }
    };
    socket?.on('chat:message', onMessage);
    socket?.on('chat:presence', onPresence);
    socket?.on('chat:typing', onTyping);
    socket?.on('chat:read', onRead);
    socket?.on('scope:revoked', onRevoked);
    socket?.on('connect', refresh);
    const leave = joinScope(kind, id);
    refresh();
    const interval = setInterval(() => setTypers(current => Object.fromEntries(Object.entries(current).filter(([, value]) => value && value.until > Date.now()))), 1000);
    return () => {
      active = false;
      generation.current = serial + 1;
      clearInterval(interval);
      clearTimeout(typingTimer.current);
      socket?.emit('chat:typing', {
        kind,
        id,
        isTyping: false
      });
      leave();
      socket?.off('connect', refresh);
      socket?.off('chat:message', onMessage);
      socket?.off('chat:presence', onPresence);
      socket?.off('chat:typing', onTyping);
      socket?.off('chat:read', onRead);
      socket?.off('scope:revoked', onRevoked);
    };
  }, [endpoint, id, kind, room, userId]);
  useEffect(() => {
    const unread = messages.filter(m => String(m.user?._id) !== userId && !(m.readBy || []).map(String).includes(userId)).map(m => m._id);
    if (!visible || !unread.length) return;
    const serial = generation.current;
    api.post(`/chat/${kind}/${id}/read`, {
      ids: unread.slice(-100)
    }).then(() => {
      if (serial === generation.current) setMessages(current => current.map(m => unread.slice(-100).includes(m._id) ? {
        ...m,
        readBy: [...new Set([...(m.readBy || []).map(String), userId])]
      } : m));
    }).catch(() => {});
  }, [messages, visible, kind, id, userId]);
  const latestId = messages.at(-1)?._id;
  useEffect(() => {
    if (panel.current) panel.current.scrollTop = panel.current.scrollHeight;
  }, [latestId]);
  const type = value => {
    setContent(value);
    const socket = getSocket();
    socket?.emit('chat:typing', {
      kind,
      id,
      isTyping: Boolean(value.trim())
    });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socket?.emit('chat:typing', {
      kind,
      id,
      isTyping: false
    }), 900);
  };
  const send = async e => {
    e.preventDefault();
    if (sending || !content.trim() && !attachments.length) return;
    const serial = generation.current;
    setSending(true);
    try {
      const {
        data
      } = await api.post(endpoint, {
        content: content.trim(),
        attachments: attachments.map(f => f._id)
      });
      if (serial === generation.current) {
        setMessages(current => merge(current, [data.message]));
        setContent('');
        setAttachments([]);
        getSocket()?.emit('chat:typing', {
          kind,
          id,
          isTyping: false
        });
      }
    } catch (e) {
      toast.error(getErrorMessage(e, 'Failed to send message'));
    } finally {
      setSending(false);
    }
  };
  const attach = async e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const serial = generation.current;
    setUploading(true);
    try {
      const data = await uploadFile({
        workspaceId,
        projectId,
        file
      });
      if (serial === generation.current) setAttachments(current => [...current, data.file].slice(0, 5));
    } catch (e) {
      toast.error(getErrorMessage(e, 'Upload failed'));
    } finally {
      setUploading(false);
    }
  };
  const older = async () => {
    const serial = generation.current;
    setOlderBusy(true);
    try {
      const {
        data
      } = await api.get(endpoint, {
        params: {
          before: messages[0]?._id
        }
      });
      if (serial === generation.current) {
        setMessages(current => merge(data.messages, current));
        setHasMore(data.hasMore);
      }
    } catch (e) {
      toast.error(getErrorMessage(e, 'Could not load older messages'));
    } finally {
      setOlderBusy(false);
    }
  };
  return <div className="p-6 sm:p-8">
    <div className="mb-5 flex items-center gap-3"><MessageCircle className="text-blue-600" /><div><h2 className="text-lg font-bold text-slate-900">{kind === 'project' ? 'Project chat' : kind === 'conversation' ? 'Direct message' : 'Workspace chat'}</h2><p className="text-sm text-slate-500">{online.length} online · {online.map(u => u.name).join(', ') || 'Connect with your team'}</p></div></div>
    <div className="rounded-2xl border border-slate-200 bg-slate-50">
      <div ref={panel} className="h-[28rem] space-y-4 overflow-y-auto p-5">
        {hasMore && <button disabled={olderBusy} onClick={older} className="text-sm text-blue-600">{olderBusy ? 'Loading...' : 'Load older messages'}</button>}
        {loading ? <LoadingState>Loading chat...</LoadingState> : error ? <p role="alert" className="text-red-600">{error}</p> : !messages.length ? <p className="py-16 text-center text-sm text-slate-500">No messages yet. Start the conversation.</p> : messages.map(m => {
          const own = String(m.user?._id) === userId;
          const readCount = (m.readBy || []).filter(id => String(id) !== String(m.user?._id)).length;
          return <div key={m._id} className={`flex ${own ? 'justify-end' : ''}`}><div className={`max-w-[85%] rounded-2xl p-4 ${own ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 shadow-sm'}`}><p className="mb-1 text-xs font-semibold">{own ? 'You' : m.user?.name || 'Former member'}</p><p className="whitespace-pre-wrap break-words text-sm">{m.content}</p>{m.attachments?.length > 0 && <div className="mt-3 rounded-xl bg-white p-2"><FileList files={m.attachments.filter(Boolean)} /></div>}<p className="mt-2 text-xs opacity-70">{formatCommentDate(m.createdAt)}{own && ` · ${readCount ? `Read by ${readCount}` : 'Sent'}`}</p></div></div>;
        })}
      </div>
      <p aria-live="polite" className="min-h-6 px-5 text-xs italic text-slate-500">{Object.values(typers).filter(Boolean).map(v => v.name).join(', ')}{Object.values(typers).some(Boolean) ? ' typing...' : ''}</p>
      <form onSubmit={send} className="space-y-3 border-t border-slate-200 bg-white p-4">
        <div className="flex flex-wrap gap-2">{attachments.map(f => <button key={f._id} type="button" onClick={() => setAttachments(current => current.filter(a => a._id !== f._id))} className="flex items-center gap-1 rounded-lg bg-blue-50 p-2 text-xs">{f.originalName}<X size={12} /></button>)}</div>
        <div className="flex gap-3"><input aria-label="Message" value={content} onChange={e => type(e.target.value)} maxLength={2000} placeholder="Write a message..." className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm" /><button disabled={sending || uploading || Boolean(error) || !content.trim() && !attachments.length} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 text-white disabled:opacity-50"><Send size={16} />{sending ? 'Sending...' : 'Send'}</button></div>
        <div className="flex flex-wrap items-center gap-3"><MentionPicker workspaceId={workspaceId} participants={participants} onSelect={value => type(content + value)} /><label className="flex cursor-pointer items-center gap-2 text-xs text-blue-600"><Paperclip size={15} />{uploading ? 'Uploading...' : 'Attach file'}<input type="file" className="sr-only" onChange={attach} disabled={uploading || attachments.length >= 5} /></label><span className="text-xs text-slate-400">Attachments are shared in workspace files.</span></div>
      </form>
    </div>
  </div>;
}
export default function WorkspaceChat(props) {
  const user = useSelector(state => state.auth.user);
  return <ChatSession key={`${props.workspaceId}:${props.projectId}:${props.conversationId}:${user?._id || user?.id}`} {...props} />;
}
