import { useEffect, useState } from 'react';
import { getWorkspaceMembers } from '../services/workspaceService';
export default function MentionPicker({
  workspaceId,
  onSelect,
  participants
}) {
  const [members, setMembers] = useState([]);
  useEffect(() => {
    let active = true;
    if (participants) return;
    if (workspaceId) getWorkspaceMembers(workspaceId).then(data => {
      if (active) setMembers((data.members || []).map(m => m.user).filter(Boolean));
    }).catch(() => {});
    return () => {
      active = false;
    };
  }, [workspaceId, participants]);
  return <select aria-label="Mention a member" className="rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-600" value="" onChange={e => {
    if (e.target.value) onSelect(`@${e.target.value} `);
  }}><option value="">@ Mention member</option>{(participants || members).map(m => <option key={m._id} value={m.email}>{m.name}</option>)}</select>;
}
