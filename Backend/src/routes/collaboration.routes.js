import express from 'express';
import mongoose from 'mongoose';
import auth from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import Notification from '../models/notification.model.js';
import Conversation from '../models/conversation.model.js';
import Workspace from '../models/workspace.model.js';
import Message from '../models/message.model.js';
import { authorizeScope, messageFilter } from '../services/chat.js';
import { publish } from '../realtime/events.js';
import AppError from '../utils/AppError.js';
const router = express.Router();
router.use(auth);
router.get('/notifications', asyncHandler(async (req, res) => {
  const filter = {
    recipient: req.user.userId
  };
  if (req.query.unread === 'true') filter.readAt = null;
  if (mongoose.isValidObjectId(req.query.before)) filter._id = {
    $lt: req.query.before
  };
  const [items, unread] = await Promise.all([Notification.find(filter).sort({
    _id: -1
  }).limit(51), Notification.countDocuments({
    recipient: req.user.userId,
    readAt: null
  })]);
  res.json({
    notifications: items.slice(0, 50),
    hasMore: items.length > 50,
    unread
  });
}));
router.patch('/notifications/read', asyncHandler(async (req, res) => {
  const filter = {
    recipient: req.user.userId,
    readAt: null
  };
  if (req.body.id) {
    if (!mongoose.isValidObjectId(req.body.id)) throw new AppError('Invalid notification', 400);
    filter._id = req.body.id;
  }
  await Notification.updateMany(filter, {
    readAt: new Date()
  });
  publish(`user:${req.user.userId}`, 'notification:read', {});
  res.json({
    success: true
  });
}));
router.get('/conversations', asyncHandler(async (req, res) => {
  const workspaces = await Workspace.find({
    'members.user': req.user.userId
  }).select('_id');
  const conversations = await Conversation.find({
    participants: req.user.userId,
    workspace: {
      $in: workspaces.map(w => w._id)
    }
  }).populate('participants', 'name email').populate('workspace', 'name').sort({
    updatedAt: -1
  });
  res.json({
    conversations
  });
}));
router.post('/conversations', asyncHandler(async (req, res) => {
  const {
    workspaceId,
    userId
  } = req.body;
  const {
    workspace
  } = await authorizeScope('workspace', workspaceId, req.user.userId);
  if (String(userId) === String(req.user.userId) || !workspace.members.some(m => String(m.user) === String(userId))) throw new AppError('Choose another workspace member', 400);
  const participants = [String(req.user.userId), String(userId)].sort();
  const key = `${workspaceId}:${participants.join(':')}`;
  let conversation;
  try {
    conversation = await Conversation.findOneAndUpdate({
      key
    }, {
      $setOnInsert: {
        key,
        workspace: workspaceId,
        participants
      }
    }, {
      upsert: true,
      new: true
    });
  } catch (error) {
    if (error.code !== 11000) throw error;
    conversation = await Conversation.findOne({
      key
    });
  }
  res.json({
    conversation
  });
}));
router.post('/chat/:kind/:id/read', asyncHandler(async (req, res) => {
  const {
    kind,
    id
  } = req.params;
  const {
    room
  } = await authorizeScope(kind, id, req.user.userId);
  if (!['workspace', 'project', 'conversation'].includes(kind)) throw new AppError('Invalid chat', 400);
  const ids = req.body.ids;
  if (!Array.isArray(ids) || ids.length > 100 || ids.some(id => !mongoose.isValidObjectId(id))) throw new AppError('Invalid messages', 400);
  const filter = {
    ...messageFilter(kind, id),
    _id: {
      $in: ids
    },
    readBy: {
      $ne: req.user.userId
    }
  };
  const unread = await Message.find(filter).select('_id');
  if (unread.length) {
    const messageIds = unread.map(m => m._id);
    await Message.updateMany({
      _id: {
        $in: messageIds
      }
    }, {
      $addToSet: {
        readBy: req.user.userId
      }
    });
    publish(room, 'chat:read', {
      room,
      userId: req.user.userId,
      ids: messageIds
    });
  }
  res.json({
    success: true
  });
}));
export default router;
