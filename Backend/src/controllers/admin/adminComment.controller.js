import Comment from "../../models/comment.model.js";

export const getTaskComments = async (req, res) => {
    const { taskId } = req.params;

    const comments = await Comment.find({
        task: taskId,
    })
        .populate("user", "name email")
        .sort({ createdAt: 1 });

    res.status(200).json({
        success: true,
        comments,
    });
};

export const deleteComment = async (req, res) => {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
        return res.status(404).json({
            success: false,
            message: "Comment not found",
        });
    }

    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({
        success: true,
        message: "Comment deleted successfully",
    });
};