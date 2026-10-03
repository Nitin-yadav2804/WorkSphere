import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';
import Notification from '../models/notification.model.js';
import { authorizeScope } from './chat.js';
import { publish } from '../realtime/events.js';

export async function deleteConversation(id, userId) {
  const { resource } = await authorizeScope('conversation', id, userId);
  await Message.deleteMany({ conversation: id });
  await Conversation.deleteOne({ _id: id });
  await Notification.deleteMany({ link: `/messages?conversation=${id}` });
  // Attachments are workspace files and remain available in Files.
  for (const participant of resource.participants) {
    publish(`user:${participant}`, 'conversation:deleted', { id });
  }
}
