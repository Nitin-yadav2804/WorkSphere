import test from 'node:test';
import assert from 'node:assert/strict';
import Workspace from '../src/models/workspace.model.js';
import Project from '../src/models/project.model.js';
import Conversation from '../src/models/conversation.model.js';
import Message from '../src/models/message.model.js';
import File from '../src/models/file.model.js';
import Notification from '../src/models/notification.model.js';
import { authorizeScope, messageFilter, sendMessage } from '../src/services/chat.js';
import { notify } from '../src/services/notifications.js';
import { events } from '../src/realtime/events.js';
import { deleteFile } from '../src/controllers/file.controller.js';
import { createMessageSchema } from '../src/validators/message.validator.js';
const ids = { workspace: '111111111111111111111111', project: '222222222222222222222222', user: '333333333333333333333333', other: '444444444444444444444444', file: '555555555555555555555555' };

test('workspace history excludes project and direct messages, including legacy workspace messages', () => {
  assert.deepEqual(messageFilter('workspace',ids.workspace), { workspace: ids.workspace, project: null, conversation: null });
  assert.deepEqual(messageFilter('project',ids.project), { project: ids.project });
});
test('project membership denial prevents saving or publishing a message', async t => {
  t.mock.method(Project,'findById',async () => ({ workspace: ids.workspace }));
  t.mock.method(Workspace,'findOne',async () => null);
  t.mock.method(Message,'create',() => assert.fail('Unauthorized write'));
  await assert.rejects(sendMessage('project',ids.project,ids.user,{ content: 'Hello' }), { statusCode: 403 });
});
test('knowing a conversation ID is insufficient without participation', async t => {
  const find = t.mock.method(Conversation,'findOne',async () => null);
  await assert.rejects(authorizeScope('conversation',ids.project,ids.other), { statusCode: 404 });
  assert.equal(find.mock.calls[0].arguments[0].participants,ids.other);
});
test('attachments from outside the authorized scope cannot be shared', async t => {
  t.mock.method(Workspace,'findOne',async () => ({ _id: ids.workspace }));
  const files = t.mock.method(File,'find',async () => []);
  t.mock.method(Message,'create',() => assert.fail('Unauthorized attachment write'));
  await assert.rejects(sendMessage('workspace',ids.workspace,ids.user,{ content: '', attachments: [ids.file] }), { statusCode: 403 });
  assert.equal(files.mock.calls[0].arguments[0].workspace,ids.workspace);
  assert.equal(files.mock.calls[0].arguments[0].uploadedBy,ids.user);
});
test('notifications exclude actor, deduplicate recipients, and publish only to recipient rooms', async t => {
  const insert = t.mock.method(Notification,'insertMany',async rows => rows);
  const deliveries = [];
  const listener = payload => deliveries.push(payload);
  events.on('publish',listener); t.after(() => events.off('publish',listener));
  await notify({ recipients: [ids.user,ids.other,ids.other], actor: ids.user, type: 'mention', text: 'Mention', link: '/activity' });
  assert.equal(insert.mock.calls[0].arguments[0].length,1);
  assert.equal(deliveries[0].room,`user:${ids.other}`);
});
test('whitespace-only chat is rejected while attachment-only chat is supported', () => {
  assert.equal(createMessageSchema.safeParse({content:'   '}).success,false);
  assert.equal(createMessageSchema.safeParse({content:'',attachments:[ids.file]}).success,true);
  assert.equal(createMessageSchema.safeParse({content:'a'.repeat(2001)}).success,false);
  assert.equal(createMessageSchema.safeParse({attachments:'invalid'}).success,false);
});
test('a regular workspace member cannot delete another uploader\'s file', async t => {
  t.mock.method(File,'findById',async () => ({workspace:ids.workspace, uploadedBy: ids.other, storageKey: 'never-delete'}));
  t.mock.method(Workspace,'findOne',async () => ({ owner: ids.other, members: [{ user:ids.user,role:'member' }] }));
  t.mock.method(File,'findByIdAndDelete',() => assert.fail('Unauthorized deletion'));
  let error;
  await deleteFile({ params: {fileId:ids.file}, user:{userId:ids.user}}, {}, e => {error=e;});
  assert.equal(error.statusCode,403);
});
test('former workspace members cannot delete even their own uploaded file', async t => {
  t.mock.method(File,'findById',async () => ({workspace:ids.workspace,uploadedBy:ids.user}));
  t.mock.method(Workspace,'findOne',async () => null);
  t.mock.method(File,'findByIdAndDelete',() => assert.fail('Unauthorized deletion'));
  let error;
  await deleteFile({ params:{fileId:ids.file},user:{userId:ids.user}}, {}, e => {error=e;});
  assert.equal(error.statusCode,403);
});
test('sending persists a populated message and publishes to exactly its project room', async t => {
  t.mock.method(Project,'findById',async () => ({ workspace:ids.workspace }));
  t.mock.method(Workspace,'findOne',async () => ({ _id:ids.workspace }));
  t.mock.method(File,'find',async () => []);
  const save = t.mock.method(Message,'create',async value => ({ _id:ids.file,...value, async populate(paths) { assert.equal(paths.length,2);this.user={_id:ids.user,name:'Sender'};return this; } }));
  const deliveries=[];const listener=payload=>deliveries.push(payload);
  events.on('publish',listener);t.after(()=>events.off('publish',listener));
  const message=await sendMessage('project',ids.project,ids.user,{content:' Hello team '});
  assert.equal(message.content,'Hello team');assert.equal(message.user.name,'Sender');
  assert.equal(save.mock.calls[0].arguments[0].conversation,undefined);
  assert.equal(deliveries.length,1);assert.equal(deliveries[0].room,`project:${ids.project}`);
});
