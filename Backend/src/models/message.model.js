import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
            index: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
