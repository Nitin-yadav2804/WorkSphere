import express from "express";
import {
    changePassword,
    getProfile,
    loginUser,
    registerUser,
    updateProfile,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
    changePasswordSchema,
    loginSchema,
    registerSchema,
    updateProfileSchema,
} from "../validators/auth.validator.js";
import asyncHandler from "../utils/asyncHandler.js";
import roleMiddleware from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/register", validate(registerSchema), asyncHandler(registerUser));
router.post("/login", validate(loginSchema), asyncHandler(loginUser));
router.get("/profile", authMiddleware, asyncHandler(getProfile));
router.patch(
    "/profile",
    authMiddleware,
    validate(updateProfileSchema),
    asyncHandler(updateProfile)
);
router.patch(
    "/password",
    authMiddleware,
    validate(changePasswordSchema),
    asyncHandler(changePassword)
);
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
