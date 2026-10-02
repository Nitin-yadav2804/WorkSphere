import express from 'express';
import crypto from 'node:crypto';
import auth from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/user.model.js';
import Workspace from '../models/workspace.model.js';
import AppError from '../utils/AppError.js';
import { requireWorkspaceAccess } from '../utils/workspaceAccess.js';
import { uploadToStorage, deleteFromStorage, getStorageUrl, getLocalFilePath } from '../utils/storage.service.js';
const router = express.Router();
router.use(auth);
async function target(req, editing = false) {
  if (req.params.kind === 'workspace') {
    const record = await requireWorkspaceAccess(req.params.id, req.user.userId, {
      message: 'Workspace access denied',
      statusCode: 403,
      ownerOnly: editing
    });
    return {
      record,
      field: 'logoKey'
    };
  }
  if (req.params.kind !== 'user') throw new AppError('Invalid image type', 400);
  if (editing && String(req.params.id) !== String(req.user.userId)) throw new AppError('Access denied', 403);
  if (!editing && String(req.params.id) !== String(req.user.userId)) {
    const shared = await Workspace.exists({
      'members.user': {
        $all: [req.params.id, req.user.userId]
      }
    });
    if (!shared) throw new AppError('Access denied', 403);
  }
  const record = await User.findById(req.params.id);
  if (!record) throw new AppError('User not found', 404);
  return {
    record,
    field: 'avatarKey'
  };
}
router.post('/:kind/:id/image', upload.single('file'), asyncHandler(async (req, res) => {
  const {
    record,
    field
  } = await target(req, true);
  const file = req.file;
  if (!file || file.size > 2 * 1024 * 1024) throw new AppError('Choose a PNG, JPEG or WebP image under 2 MB', 400);
  const b = file.buffer;
  const valid = file.mimetype === 'image/png' ? b.subarray(0, 8).toString('hex') === '89504e470d0a1a0a' : file.mimetype === 'image/jpeg' ? b[0] === 255 && b[1] === 216 && b[2] === 255 : file.mimetype === 'image/webp' && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP';
  if (!valid) throw new AppError('Invalid image', 400);
  const key = `images/${req.params.kind}/${record._id}/${crypto.randomUUID()}.${file.mimetype.split('/')[1]}`;
  await uploadToStorage({
    key,
    body: b,
    contentType: file.mimetype
  });
  const old = record[field];
  record[field] = key;
  try {
    await record.save();
  } catch (error) {
    await deleteFromStorage(key);
    throw error;
  }
  if (old) await deleteFromStorage(old);
  res.json({
    success: true
  });
}));
router.get('/:kind/:id/image', asyncHandler(async (req, res) => {
  const {
    record,
    field
  } = await target(req);
  if (!record[field]) throw new AppError('Image not found', 404);
  if (process.env.STORAGE_PROVIDER === 'r2') return res.json({
    url: await getStorageUrl(record[field])
  });
  res.sendFile(getLocalFilePath(record[field]));
}));
router.delete('/:kind/:id/image', asyncHandler(async (req, res) => {
  const {
    record,
    field
  } = await target(req, true);
  if (record[field]) await deleteFromStorage(record[field]);
  record[field] = undefined;
  await record.save();
  res.json({
    success: true
  });
}));
export default router;
