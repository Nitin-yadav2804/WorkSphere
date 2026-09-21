import express from "express";
import { downloadFile, getFileAccess, getProjectFiles, getWorkspaceFiles, uploadFile } from "../controllers/file.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.post(
    "/upload",
    authMiddleware,
    upload.single("file"),
    uploadFile
);

router.get(
    "/workspace/:workspaceId",
    authMiddleware,
    getWorkspaceFiles
);

router.get(
    "/:fileId/access",
    authMiddleware,
    getFileAccess
);

router.get(
    "/:fileId/download",
    authMiddleware,
    downloadFile
);

router.get(
    "/project/:projectId",
    authMiddleware,
    getProjectFiles
);

export default router;