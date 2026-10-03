import { requireWorkspaceAccess } from "../utils/workspaceAccess.js";
import Activity from "../models/activity.model.js";

export const getWorkspaceActivities = async (req, res) => {
    const { workspaceId } = req.params;

    await requireWorkspaceAccess(workspaceId, req.user.userId, {
        message: "Workspace not found or access denied",
        statusCode: 404,
    });

    const requestedPage = Number(req.query.page);
    const requestedLimit = Number(req.query.limit);
    const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const limit = Number.isSafeInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 50) : 20;

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
