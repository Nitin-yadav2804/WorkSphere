import express from 'express';
import auth from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import { requireWorkspaceAccess } from '../utils/workspaceAccess.js';
import Project from '../models/project.model.js';
import Task from '../models/task.model.js';
import AppError from '../utils/AppError.js';
const router = express.Router();
router.get('/workspaces/:workspaceId/analytics', auth, asyncHandler(async (req, res) => {
  await requireWorkspaceAccess(req.params.workspaceId, req.user.userId, {
    message: 'Workspace access denied',
    statusCode: 403
  });
  const projects = await Project.find({
    workspace: req.params.workspaceId
  }).select('name status');
  const filter = {
    project: {
      $in: projects.map(p => p._id)
    }
  };
  if (req.query.from || req.query.to) {
    filter.createdAt = {};
    for (const [key, operator] of [['from', '$gte'], ['to', '$lte']]) {
      if (!req.query[key]) continue;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(req.query[key])) throw new AppError('Invalid date range', 400);
      const date = new Date(req.query[key] + (key === 'from' ? 'T00:00:00.000Z' : 'T23:59:59.999Z'));
      if (Number.isNaN(+date)) throw new AppError('Invalid date range', 400);
      filter.createdAt[operator] = date;
    }
    if (filter.createdAt.$gte > filter.createdAt.$lte) throw new AppError('Start date must precede end date', 400);
  }
  const tasks = await Task.find(filter).populate('assignedTo', 'name').lean();
  const summarize = list => ({
    total: list.length,
    completed: list.filter(t => t.status === 'completed').length,
    inProgress: list.filter(t => t.status === 'in-progress').length,
    todo: list.filter(t => t.status === 'todo').length,
    overdue: list.filter(t => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < new Date()).length
  });
  const assignees = new Map();
  for (const task of tasks) {
    const id = String(task.assignedTo?._id || 'unassigned');
    if (!assignees.has(id)) assignees.set(id, {
      name: task.assignedTo?.name || 'Unassigned',
      tasks: []
    });
    assignees.get(id).tasks.push(task);
  }
  res.json({
    summary: summarize(tasks),
    projects: projects.map(p => ({
      _id: p._id,
      name: p.name,
      status: p.status,
      ...summarize(tasks.filter(t => String(t.project) === String(p._id)))
    })),
    assignees: [...assignees.entries()].map(([id, value]) => ({
      _id: id,
      name: value.name,
      ...summarize(value.tasks)
    })),
    priorities: ['low', 'medium', 'high', 'urgent'].map(priority => ({
      priority,
      ...summarize(tasks.filter(t => t.priority === priority))
    }))
  });
}));
export default router;
