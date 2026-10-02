import Notification from '../models/notification.model.js';
import Workspace from '../models/workspace.model.js';
import User from '../models/user.model.js';
import { publish } from '../realtime/events.js';
export async function notify({
  recipients,
  actor,
  type,
  text,
  link,
  workspace
}) {
  const ids = [...new Set(recipients.map(String))].filter(id => id !== String(actor));
  if (!ids.length) return;
  const records = await Notification.insertMany(ids.map(recipient => ({
    recipient,
    actor,
    type,
    text,
    link,
    workspace
  })));
  for (const record of records) publish(`user:${record.recipient}`, 'notification:created', record);
}
export async function notifyActivity(activity) {
  if (!activity.workspace) return;
  const workspace = await Workspace.findById(activity.workspace).select('members owner');
  if (!workspace) return;
  const taskId = activity.task?._id || activity.task;
  const projectId = activity.project?._id || activity.project;
  await notify({
    recipients: workspace.members.map(m => m.user),
    actor: activity.user?._id || activity.user,
    type: activity.action,
    text: activity.description,
    workspace: workspace._id,
    link: taskId ? `/tasks/${taskId}` : projectId ? `/projects/${projectId}` : `/workspaces/${workspace._id}`
  });
}
export async function notifyMentions(content, workspaceId, actor, link, allowedRecipients) {
  // Email handles avoid ambiguity when multiple members share a display name.
  const emails = [...content.matchAll(/@([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi)].map(m => m[1].toLowerCase());
  if (!emails.length) return;
  const workspace = await Workspace.findById(workspaceId).select('members');
  if (!workspace) return;
  const users = await User.find({
    _id: {
      $in: workspace.members.map(m => m.user)
    },
    email: {
      $in: emails
    }
  }).select('_id');
  await notify({
    recipients: users.map(u => u._id).filter(id => !allowedRecipients || allowedRecipients.map(String).includes(String(id))),
    actor,
    type: 'mention',
    text: 'You were mentioned: ' + content.slice(0, 180),
    link,
    workspace: workspaceId
  });
}
