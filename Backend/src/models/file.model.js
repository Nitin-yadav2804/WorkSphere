import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
    {
        originalName: {
            type: String,
            required: true,
            trim: true,
        },

        storageKey: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        mimeType: {
            type: String,
            required: true,
            trim: true,
        },

        size: {
            type: Number,
            required: true,
        },

        uploadedBy: {
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

fileSchema.index({ workspace: 1, createdAt: -1 });
fileSchema.index({ project: 1, createdAt: -1 });
fileSchema.index({ task: 1, createdAt: -1 });

const File = mongoose.model("File", fileSchema);

export default File;