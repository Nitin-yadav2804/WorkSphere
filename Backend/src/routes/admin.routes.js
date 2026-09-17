import express from "express";
import { changeUserRole, deleteUser, getAllUsers, getUserDetails, searchUsers, toggleUserStatus } from "../controllers/admin/adminUser.controller.js";
import roleMiddleware from "../middleware/role.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { getAdminDashboard } from "../controllers/admin/adminDashboard.controller.js";

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

export default router;