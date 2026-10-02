import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { useSelector } from "react-redux";

import LoadingState from "./ui/LoadingState.jsx";
import { getErrorMessage } from "../utils/errors.js";
import { getWorkspaceMessages, createWorkspaceMessage } from "../services/messageService.js";
import { getSocket } from "../services/socket.js";
import { formatCommentDate } from "../utils/dates.js";

function WorkspaceChat({ workspaceId }) {
  const currentUser = useSelector((state) => state.auth.user);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [someoneTyping, setSomeoneTyping] = useState(false);
  const endRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    let active = true;
    const loadMessages = async () => {
      try {
        const response = await getWorkspaceMessages(workspaceId);
        if (active) setMessages(response.messages || []);
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to load chat."));
      } finally {
        if (active) setLoading(false);
      }
    };
    loadMessages();

    const socket = getSocket();
    if (!socket) return () => { active = false; };

    const handleMessage = (message) => {
      setMessages((current) =>
        current.some((item) => item._id === message._id)
          ? current
          : [...current, message]
      );
    };
    const handlePresence = ({ onlineCount: count }) => setOnlineCount(count || 0);
    const handleTyping = ({ userId, isTyping }) => {
      if (String(userId) !== String(currentUser?._id)) setSomeoneTyping(Boolean(isTyping));
    };

    socket.emit("join:workspace", workspaceId);
    socket.on("chat:message", handleMessage);
    socket.on("workspace:presence", handlePresence);
    socket.on("chat:typing", handleTyping);

    return () => {
      active = false;
      socket.off("chat:message", handleMessage);
      socket.off("workspace:presence", handlePresence);
      socket.off("chat:typing", handleTyping);
      clearTimeout(typingTimeoutRef.current);
    };
  }, [workspaceId]);

  const handleTyping = (event) => {
    setContent(event.target.value);
    const socket = getSocket();
    if (!socket?.connected) return;

    socket.emit("chat:typing", { workspaceId, isTyping: true });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("chat:typing", { workspaceId, isTyping: false });
    }, 900);
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    setSending(true);
    try {
      const socket = getSocket();
      if (socket?.connected) {
        await new Promise((resolve, reject) => {
          socket.emit("chat:send", { workspaceId, content: trimmed }, (result) => {
            if (result?.success) resolve(result);
            else reject(new Error(result?.message || "Failed to send message."));
          });
        });
      } else {
        const response = await createWorkspaceMessage(workspaceId, trimmed);
        setMessages((current) => current.some((item) => item._id === response.message._id) ? current : [...current, response.message]);
      }
      setContent("");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to send message."));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <MessageCircle size={19} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Workspace chat</h2>
          <p className="text-sm text-slate-500">{onlineCount} online · Talk with everyone in this workspace.</p>
        </div>
      </div>

      <div className="flex h-[28rem] flex-col rounded-2xl border border-slate-200 bg-slate-50">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {loading ? <LoadingState as="p" className="text-sm text-slate-500">Loading chat...</LoadingState> : messages.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500">No messages yet. Start the conversation.</div>
          ) : messages.map((message) => {
            const own = String(message.user?._id) === String(currentUser?._id);
            return <div key={message._id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${own ? "bg-blue-600 text-white" : "bg-white text-slate-700 shadow-sm"}`}>
                <p className={`mb-1 text-xs font-semibold ${own ? "text-blue-100" : "text-slate-500"}`}>{own ? "You" : message.user?.name || "Workspace member"}</p>
                <p className="whitespace-pre-wrap text-sm leading-5">{message.content}</p>
                <p className={`mt-1 text-[10px] ${own ? "text-blue-100" : "text-slate-400"}`}>{formatCommentDate(message.createdAt)}</p>
              </div>
            </div>;
          })}
          {someoneTyping && <p className="text-xs italic text-slate-400">Someone is typing...</p>}
          <div ref={endRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3 border-t border-slate-200 bg-white p-4">
          <input value={content} onChange={handleTyping} maxLength={2000} placeholder="Write a message..." className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
          <button type="submit" disabled={sending || !content.trim()} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><Send size={16} />{sending ? "Sending..." : "Send"}</button>
        </form>
      </div>
    </div>
  );
}

export default WorkspaceChat;
