import Message from '../models/message.model.js';
import { authorizeScope, messageFilter, populateMessage, sendMessage } from '../services/chat.js';
const history = kind => async (req, res) => {
  const id = req.params[`${kind}Id`];
  await authorizeScope(kind, id, req.user.userId);
  const filter = messageFilter(kind, id);
  if (req.query.before && /^[a-f\d]{24}$/i.test(req.query.before)) filter._id = {
    $lt: req.query.before
  };
  const messages = await populateMessage(Message.find(filter).sort({
    _id: -1
  }).limit(51));
  const hasMore = messages.length > 50;
  res.json({
    success: true,
    hasMore,
    messages: messages.slice(0, 50).reverse()
  });
};
const create = kind => async (req, res) => res.status(201).json({
  success: true,
  message: await sendMessage(kind, req.params[`${kind}Id`], req.user.userId, req.body)
});
export const getWorkspaceMessages = history('workspace');
export const createWorkspaceMessage = create('workspace');
export const getProjectMessages = history('project');
export const createProjectMessage = create('project');
export const getConversationMessages = history('conversation');
export const createConversationMessage = create('conversation');
