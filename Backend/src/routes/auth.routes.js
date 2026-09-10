import express from "express";
import { getProfile, loginUser, registerUser } from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import asyncHandler from "../utils/asyncHandler.js";
import roleMiddleware from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/register", validate(registerSchema), asyncHandler(registerUser));
router.post("/login", validate(loginSchema), asyncHandler(loginUser));
router.get("/profile", authMiddleware, asyncHandler(getProfile));
router.get(
    "/admin-test",
    authMiddleware,
    roleMiddleware("admin"),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Welcome Admin",
        });
    }
);

export default router;