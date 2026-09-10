import express from "express";
import { getProfile, loginUser, registerUser } from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";

const router = express.Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.get("/profile", authMiddleware, getProfile);

export default router;