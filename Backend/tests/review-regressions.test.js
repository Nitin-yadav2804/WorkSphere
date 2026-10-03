import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import User from '../src/models/user.model.js';
import auth from '../src/middleware/auth.middleware.js';
import role from '../src/middleware/role.middleware.js';
import errors from '../src/middleware/error.middleware.js';
import { getAllowedOrigins } from '../src/config/origins.js';
import { updateTaskSchema } from '../src/validators/task.validator.js';
const id = '111111111111111111111111';
function response() {
  return { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
}
function request(t) {
  t.mock.method(jwt, 'verify', () => ({ userId: id, role: 'admin' }));
  return { headers: { authorization: 'Bearer test-token' } };
}
test('REST requests use current account role rather than the token role', async t => {
  const req = request(t);
  t.mock.method(User, 'findById', () => ({ select: async () => ({ role: 'user', isActive: true }) }));
  let passed = false;
  await auth(req, response(), () => { passed = true; });
  assert.equal(passed, true);
  assert.equal(req.user.role, 'user');
  assert.throws(() => role('admin')(req, response(), () => assert.fail()), { statusCode: 403 });
});
for (const [name, account, code] of [['deleted', null, 401], ['deactivated', { isActive: false }, 403]]) {
  test(`${name} accounts cannot continue using an old token`, async t => {
    const req = request(t), res = response();
    t.mock.method(User, 'findById', () => ({ select: async () => account }));
    await auth(req, res, () => assert.fail('Denied account reached handler'));
    assert.equal(res.statusCode, code);
  });
}
test('database failures are forwarded rather than disguised as authentication errors', async t => {
  const req = request(t), failure = new Error('Database unavailable');
  t.mock.method(User, 'findById', () => ({ select: async () => { throw failure; } }));
  let received;
  await auth(req, response(), error => { received = error; });
  assert.equal(received, failure);
});
test('REST and socket origins normalize and deduplicate explicit deployments', () => {
  assert.deepEqual(getAllowedOrigins({ FRONTEND_URL: ' https://example.com/ ', FRONTEND_URLS: 'https://preview.example.com,https://example.com,' }), ['http://localhost:5173', 'https://example.com', 'https://preview.example.com']);
});
test('invalid inputs and duplicate records return client errors without stack logs', t => {
  const log = t.mock.method(console, 'error', () => {});
  for (const [error, code] of [[{ code: 11000 }, 409], [{ name: 'CastError' }, 400], [{ name: 'ZodError' }, 400], [{ name: 'ValidationError' }, 400], [{ name: 'MulterError', code: 'LIMIT_FILE_SIZE' }, 400]]) {
    const res = response();
    errors(error, {}, res, () => assert.fail());
    assert.equal(res.statusCode, code);
  }
  assert.equal(log.mock.callCount(), 0);
});
test('task edits accept explicit assignee and date clearing', () => {
  assert.deepEqual(updateTaskSchema.parse({ assignedTo: '', dueDate: null }), { assignedTo: '', dueDate: null });
});

test('project edits reject reversed dates and support clearing dates', async t => {
  const { updateProject } = await import('../src/controllers/project.controller.js');
  const { updateProjectSchema } = await import('../src/validators/project.validator.js');
  const { default: Project } = await import('../src/models/project.model.js');
  const { default: Workspace } = await import('../src/models/workspace.model.js');
  assert.deepEqual(updateProjectSchema.parse({ startDate: null, dueDate: null }), { startDate: null, dueDate: null });
  t.mock.method(Project, 'findById', async () => ({ workspace: id, startDate: new Date('2026-10-10'), save: () => assert.fail('Invalid dates were saved') }));
  t.mock.method(Workspace, 'findOne', async () => ({ _id: id }));
  await assert.rejects(updateProject({ params: { projectId: id }, user: { userId: id }, body: { dueDate: '2026-10-01T00:00:00.000Z' } }, response()), { statusCode: 400 });
});

test('admin self-access protections are enforced by the backend', async () => {
  const { changeUserRole, toggleUserStatus, deleteUser } = await import('../src/controllers/admin/adminUser.controller.js');
  for (const handler of [changeUserRole, toggleUserStatus, deleteUser]) {
    await assert.rejects(handler({ params: { userId: id }, user: { userId: id }, body: { role: 'user' } }, response()), { statusCode: 403 });
  }
});
