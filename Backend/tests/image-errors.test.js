import test from 'node:test';
import assert from 'node:assert/strict';
import images from '../src/routes/images.routes.js';
import User from '../src/models/user.model.js';
import errorMiddleware from '../src/middleware/error.middleware.js';
import AppError from '../src/utils/AppError.js';

const imageHandler = images.stack.find(layer => layer.route?.methods.get).route.stack[0].handle;
const userId = '333333333333333333333333';

test('a profile without an uploaded image returns a normal empty image result', async t => {
  t.mock.method(User, 'findById', async () => ({ _id: userId }));
  const result = await new Promise((resolve, reject) => {
    imageHandler({ params: { kind: 'user', id: userId }, user: { userId } }, { json: resolve }, reject);
  });
  assert.deepEqual(result, { url: null });
});

test('missing users still return an error instead of an empty image result', async t => {
  t.mock.method(User, 'findById', async () => null);
  await assert.rejects(new Promise((resolve, reject) => {
    imageHandler({ params: { kind: 'user', id: userId }, user: { userId } }, { json: resolve }, reject);
  }), { statusCode: 404, message: 'User not found' });
});

test('expected request errors retain the API response without logging stack traces', t => {
  const log = t.mock.method(console, 'error', () => {});
  let status, payload;
  const res = { status(value) { status = value; return this; }, json(value) { payload = value; } };
  errorMiddleware(new AppError('Access denied', 403), { method: 'GET', path: '/example' }, res, () => {});
  assert.equal(status, 403);
  assert.deepEqual(payload, { success: false, message: 'Access denied' });
  assert.equal(log.mock.callCount(), 0);
  errorMiddleware(new Error('Database unavailable'), { method: 'GET', path: '/example' }, res, () => {});
  assert.equal(status, 500);
  assert.equal(log.mock.callCount(), 1);
  assert.deepEqual(log.mock.calls[0].arguments, ['[GET /example] Database unavailable']);
});
