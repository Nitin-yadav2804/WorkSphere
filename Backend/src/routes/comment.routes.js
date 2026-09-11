import express from "express";
import {
    createComment,
    deleteComment,
    getTaskComments,
    updateComment,
} from "../controllers/comment.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { createCommentSchema, updateCommentSchema } from "../validators/comment.validator.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.post(
    "/tasks/:taskId/comments",
    authMiddleware,
    validate(createCommentSchema),
    asyncHandler(createComment)
);
router.get(
    "/tasks/:taskId/comments",
    authMiddleware,
    asyncHandler(getTaskComments)
);
router.patch(
    "/comments/:commentId",
    authMiddleware,
    validate(updateCommentSchema),
    asyncHandler(updateComment)
);
router.delete(
    "/comments/:commentId",
    authMiddleware,
    asyncHandler(deleteComment)
);

export default router;