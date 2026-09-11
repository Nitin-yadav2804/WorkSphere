import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
    {
        action: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
        },

        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
        },

        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
        },
    },
    {
        timestamps: true,
    }
);

activitySchema.index({ workspace: 1, createdAt: -1 });

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;