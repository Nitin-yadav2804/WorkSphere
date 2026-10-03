import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/user.model.js";

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Authentication required" });
    }
    let decoded;
    try {
        decoded = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
        if (!mongoose.isValidObjectId(decoded.userId)) throw new Error("Invalid subject");
    } catch {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
    try {
        const user = await User.findById(decoded.userId).select("role isActive");
        if (!user) return res.status(401).json({ success: false, message: "Account no longer exists" });
        if (!user.isActive) return res.status(403).json({ success: false, message: "Your account has been deactivated" });
        req.user = { ...decoded, role: user.role };
        next();
    } catch (error) {
        next(error);
    }
};

export default authMiddleware;
