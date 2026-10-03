import test from 'node:test';
import assert from 'node:assert/strict';
import Conversation from '../src/models/conversation.model.js';
import Workspace from '../src/models/workspace.model.js';
import Message from '../src/models/message.model.js';
import Notification from '../src/models/notification.model.js';
import { deleteConversation } from '../src/services/conversations.js';
import { events } from '../src/realtime/events.js';
const id = '111111111111111111111111';
const user = '222222222222222222222222';
const other = '333333333333333333333333';

test('nonparticipants cannot delete a conversation', async t => {
  t.mock.method(Conversation, 'findOne', async () => null);
  t.mock.method(Message, 'deleteMany', () => assert.fail('Unauthorized deletion'));
  t.mock.method(Conversation, 'deleteOne', () => assert.fail('Unauthorized deletion'));
  await assert.rejects(deleteConversation(id, user), { statusCode: 404 });
});
test('former workspace members cannot delete a conversation', async t => {
  t.mock.method(Conversation, 'findOne', async () => ({ workspace: id, participants: [user, other] }));
  t.mock.method(Workspace, 'findOne', async () => null);
  t.mock.method(Message, 'deleteMany', () => assert.fail('Unauthorized deletion'));
  await assert.rejects(deleteConversation(id, user), { statusCode: 403 });
});
test('deletion scopes message cleanup and notifies both participants', async t => {
  t.mock.method(Conversation, 'findOne', async () => ({ workspace: id, participants: [user, other] }));
  t.mock.method(Workspace, 'findOne', async () => ({ _id: id }));
  const messages = t.mock.method(Message, 'deleteMany', async () => ({}));
  const conversations = t.mock.method(Conversation, 'deleteOne', async () => ({}));
  const notifications = t.mock.method(Notification, 'deleteMany', async () => ({}));
  const deliveries = [];
  const listener = event => deliveries.push(event);
  events.on('publish', listener);
  t.after(() => events.off('publish', listener));
  await deleteConversation(id, user);
  assert.deepEqual(messages.mock.calls[0].arguments, [{ conversation: id }]);
  assert.deepEqual(conversations.mock.calls[0].arguments, [{ _id: id }]);
  assert.deepEqual(notifications.mock.calls[0].arguments, [{ link: `/messages?conversation=${id}` }]);
  assert.deepEqual(deliveries.map(d => d.room), [`user:${user}`, `user:${other}`]);
});
