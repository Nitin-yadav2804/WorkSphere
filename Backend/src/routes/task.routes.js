import express from "express";
import {
    createTask,
    deleteTask,
    getProjectTasks,
    getTask,
    updateTask,
} from "../controllers/task.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { createTaskSchema, updateTaskSchema } from "../validators/task.validator.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.post(
    "/projects/:projectId/tasks",
    authMiddleware,
    validate(createTaskSchema),
    asyncHandler(createTask)
);
router.get(
    "/projects/:projectId/tasks",
    authMiddleware,
    asyncHandler(getProjectTasks)
);
router.get(
    "/tasks/:taskId",
    authMiddleware,
    asyncHandler(getTask)
);
router.patch(
    "/tasks/:taskId",
    authMiddleware,
    validate(updateTaskSchema),
    asyncHandler(updateTask)
);
router.delete(
    "/tasks/:taskId",
    authMiddleware,
    asyncHandler(deleteTask)
);

export default router;