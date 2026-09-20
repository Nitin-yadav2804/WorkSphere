import Activity from "../../models/activity.model.js";

export const getAllActivities = async (req, res) => {
    const activities = await Activity.find()
        .populate("user", "name email")
        .populate("workspace", "name")
        .populate("project", "name")
        .populate("task", "title")
        .sort({ createdAt: -1 })
        .limit(100);

    res.status(200).json({
        success: true,
        activities,
    });
};