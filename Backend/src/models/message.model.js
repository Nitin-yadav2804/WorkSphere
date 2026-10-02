import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            default: "",
            trim: true,
            maxlength: 2000,
        },
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
            index: true,
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            index: true,
        },
        conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", index: true },
        attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: "File" }],
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

messageSchema.index({ workspace: 1, project: 1, conversation: 1, _id: -1 });
messageSchema.index({ project: 1, _id: -1 });
messageSchema.index({ conversation: 1, _id: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
