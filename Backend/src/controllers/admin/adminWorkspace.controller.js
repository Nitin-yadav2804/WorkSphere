import Workspace from "../../models/workspace.model.js";
import deleteWorkspaceCascade from "../../utils/deleteWorkspaceCascade.js";

export const getAllWorkspaces = async (req, res) => {
    const workspaces = await Workspace.find()
        .populate("owner", "name email")
        .populate("members.user", "name email")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        workspaces,
    });
};

export const getWorkspaceDetails = async (req, res) => {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId)
        .populate("owner", "name email")
        .populate("members.user", "name email");

    if (!workspace) {
        return res.status(404).json({
            success: false,
            message: "Workspace not found",
        });
    }

    res.status(200).json({
        success: true,
        workspace,
    });
};
export const deleteWorkspace = async (req, res) => {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
        return res.status(404).json({
            success: false,
            message: "Workspace not found",
        });
    }

    await deleteWorkspaceCascade(workspaceId);

    res.status(200).json({
        success: true,
        message: "Workspace deleted successfully",
    });
};