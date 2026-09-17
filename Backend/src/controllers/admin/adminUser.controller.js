import User from "../../models/user.model.js";

export const getAllUsers = async (req, res) => {
    const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        users,
    });
};

export const getUserDetails = async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    res.status(200).json({
        success: true,
        user,
    });
};

export const searchUsers = async (req, res) => {
    const { search } = req.query;

    const users = await User.find({
        $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
        ]
    })
        .select("-password")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        users,
    });
};

export const changeUserRole = async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
        return res.status(400).json({
            success: false,
            message: "Invalid role",
        });
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true }
    ).select("-password");

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    res.status(200).json({
        success: true,
        message: "User role updated successfully",
        user,
    });
};

export const toggleUserStatus = async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
        success: true,
        message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
        },
    });
};

export const deleteUser = async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
        success: true,
        message: "User deleted successfully",
    });
};