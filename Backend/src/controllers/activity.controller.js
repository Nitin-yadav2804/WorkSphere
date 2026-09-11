import Activity from "../models/activity.model.js";
import Workspace from "../models/workspace.model.js";
import AppError from "../utils/AppError.js";

export const getWorkspaceActivities = async (req, res) => {
    const { workspaceId } = req.params;


    const workspace = await Workspace.findOne({
        _id: workspaceId,
        "members.user": req.user.userId,
    });

    if (!workspace) {
        throw new AppError("Workspace not found or access denied", 404);
    }

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const skip = (page - 1) * limit;

    const { action } = req.query;

    const filter = {
        workspace: workspaceId,
    };

    if (action) {
        filter.action = action;
    }

    const activities = await Activity.find(filter)
        .populate("user", "name email")
        .populate("project", "name")
        .populate("task", "title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Activity.countDocuments(filter);

    res.status(200).json({
        success: true,
        activities,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
};