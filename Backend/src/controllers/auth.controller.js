import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { requireDocument } from "../utils/requireDocument.js";
import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await requireDocument(
        User.findOne({ email }),
        "Email not found",
        404
    );

    if (!user.isActive) {
        throw new AppError("Your account has been deactivated", 403);
    }

    const isPasswordCorrect = await requireDocument(
        bcrypt.compare(password, user.password),
        "Incorrect password",
        401
    );

    const token = jwt.sign(
        {
            userId: user._id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );

    res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
};

export const getProfile = async (req, res) => {
    const user = await requireDocument(
        User.findById(req.user.userId).select("-password"),
        "User not found",
        404
    );

    res.status(200).json({
        success: true,
        user,
    });
};
