import { createMessageSchema } from "../validators/message.validator.js";
import mongoose from 'mongoose';
import Project from '../models/project.model.js';
import Task from '../models/task.model.js';
import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';
import File from '../models/file.model.js';
import AppError from '../utils/AppError.js';
import { requireWorkspaceAccess } from '../utils/workspaceAccess.js';
import { publish } from '../realtime/events.js';
import { notify, notifyMentions } from './notifications.js';
export async function authorizeScope(kind, id, userId) {
  if (!['workspace', 'project', 'task', 'conversation'].includes(kind) || !mongoose.isValidObjectId(id)) throw new AppError('Invalid conversation', 400);
  let workspaceId = id;
  let resource;
  if (kind === 'project') {
    resource = await Project.findById(id);
    workspaceId = resource?.workspace;
  } else if (kind === 'task') {
    resource = await Task.findById(id);
    workspaceId = (await Project.findById(resource?.project))?.workspace;
  } else if (kind === 'conversation') {
    resource = await Conversation.findOne({
      _id: id,
      participants: userId
    });
    workspaceId = resource?.workspace;
  }
  if (!workspaceId) throw new AppError('Conversation not found', 404);
  const workspace = await requireWorkspaceAccess(workspaceId, userId, {
    message: 'Conversation not found or access denied',
    statusCode: 403
  });
  return {
    workspace,
    resource,
    room: `${kind}:${id}`
  };
}
export function messageFilter(kind, id) {
  if (kind === 'workspace') return {
    workspace: id,
    project: null,
    conversation: null
  };
  return {
    [kind]: id
  };
}
export const populateMessage = query => query.populate([{
  path: 'user',
  select: 'name email'
}, {
  path: 'attachments',
  select: 'originalName mimeType size workspace'
}]);
export async function sendMessage(kind, id, userId, input) {
  const {
    workspace,
    resource,
    room
  } = await authorizeScope(kind, id, userId);
  if (!['workspace', 'project', 'conversation'].includes(kind)) throw new AppError('Invalid chat', 400);
  const parsed = createMessageSchema.safeParse(input);
  if (!parsed.success) throw new AppError("Invalid message or attachments", 400);
  input = parsed.data;
  const content = typeof input.content === 'string' ? input.content.trim() : '';
  const attachments = [...new Set(input.attachments || [])];
  if (!content && !attachments.length || content.length > 2000 || attachments.length > 5 || attachments.some(a => !mongoose.isValidObjectId(a))) throw new AppError('Add a message up to 2000 characters or up to 5 attachments', 400);
  // Only the uploader can attach files, and only from this workspace.
  const files = await File.find({
    _id: {
      $in: attachments
    },
    workspace: workspace._id,
    uploadedBy: userId
  });
  if (files.length !== attachments.length) throw new AppError('Attachment not available in this workspace', 403);
  const message = await Message.create({
    content,
    attachments,
    workspace: workspace._id,
    project: kind === 'project' ? id : undefined,
    conversation: kind === 'conversation' ? id : undefined,
    user: userId,
    readBy: [userId]
  });
  await populateMessage(message);
  publish(room, 'chat:message', message);
  const link = kind === 'project' ? `/projects/${id}` : kind === 'conversation' ? `/messages?conversation=${id}` : `/workspaces/${workspace._id}`;
  try {
    if (kind === 'conversation') {
      await Conversation.findByIdAndUpdate(id, {
        updatedAt: new Date()
      });
      await notify({
        recipients: resource.participants,
        actor: userId,
        type: 'message',
        text: content.slice(0, 160) || 'Shared an attachment',
        link,
        workspace: workspace._id
      });
    }
    await notifyMentions(content, workspace._id, userId, link, kind === 'conversation' ? resource.participants : undefined);
  } catch (error) {
    console.error("Chat notification failed", error.message);
  }
  return message;
}
