import express from "express";
import { changeUserRole, deleteUser, getAllUsers, getUserDetails, searchUsers, toggleUserStatus } from "../controllers/admin/adminUser.controller.js";
import roleMiddleware from "../middleware/role.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { getAdminDashboard } from "../controllers/admin/adminDashboard.controller.js";
import { deleteWorkspace, getAllWorkspaces, getWorkspaceDetails } from "../controllers/admin/adminWorkspace.controller.js";
import { deleteProject, getAllProjects, getProjectDetails } from "../controllers/admin/adminProject.controller.js";
import {
    getTaskDetails,
    deleteTask
} from "../controllers/admin/adminTask.controller.js";
import { getAllActivities } from "../controllers/admin/adminActivity.controller.js";

const router = express.Router();

router.get(
    "/users",
    authMiddleware,
    roleMiddleware("admin"),
    getAllUsers
);

router.get(
    "/users/search",
    authMiddleware,
    roleMiddleware("admin"),
    searchUsers
);

router.get(
    "/users/:userId",
    authMiddleware,
    roleMiddleware("admin"),
    getUserDetails
);

router.patch(
    "/users/:userId/role",
    authMiddleware,
    roleMiddleware("admin"),
    changeUserRole
);

router.get(
    "/dashboard",
    authMiddleware,
    roleMiddleware("admin"),
    getAdminDashboard
);

router.patch(
    "/users/:userId/status",
    authMiddleware,
    roleMiddleware("admin"),
    toggleUserStatus
);

router.delete(
    "/users/:userId",
    authMiddleware,
    roleMiddleware("admin"),
    deleteUser
);

router.get(
    "/workspaces",
    authMiddleware,
    roleMiddleware("admin"),
    getAllWorkspaces
);

router.get(
    "/workspaces/:workspaceId",
    authMiddleware,
    roleMiddleware("admin"),
    getWorkspaceDetails
);

router.delete(
    "/workspaces/:workspaceId",
    authMiddleware,
    roleMiddleware("admin"),
    deleteWorkspace
);
router.get(
    "/projects",
    authMiddleware,
    roleMiddleware("admin"),
    getAllProjects
);
router.get(
    "/projects/:projectId",
    authMiddleware,
    roleMiddleware("admin"),
    getProjectDetails
);
router.delete(
    "/projects/:projectId",
    authMiddleware,
    roleMiddleware("admin"),
    deleteProject
);
router.get(
    "/tasks/:taskId",
    authMiddleware,
    roleMiddleware("admin"),
    getTaskDetails
);

router.delete(
    "/tasks/:taskId",
    authMiddleware,
    roleMiddleware("admin"),
    deleteTask
);
router.get(
    "/activity",
    authMiddleware,
    roleMiddleware("admin"),
    getAllActivities
);

export default router;