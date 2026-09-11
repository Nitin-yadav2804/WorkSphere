import User from "../models/user.model.js";
import Workspace from "../models/workspace.model.js";
import AppError from "../utils/AppError.js";


export const createWorkspace = async (req, res) => {
    const { name, description } = req.body;

    const workspace = await Workspace.create({
        name,
        description,
        owner: req.user.userId,
        members: [
            {
                user: req.user.userId,
                role: "manager",
            },
        ],
    });

    res.status(201).json({
        success: true,
        message: "Workspace created successfully",
        workspace,
    });
};

export const getMyWorkspaces = async (req, res) => {
    const workspaces = await Workspace.find({
        "members.user": req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        workspaces,
    });
};

export const getWorkspace = async (req, res) => {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findOne({
        _id: workspaceId,
        "members.user": req.user.userId,
    }).populate("owner", "name email")
      .populate("members.user", "name email");

    if (!workspace) {
        throw new AppError(
            "Workspace not found or access denied",
            404
        );
    }

    res.status(200).json({
        success: true,
        workspace,
    });
};

export const updateWorkspace = async (req, res) => {
    const { workspaceId } = req.params;
    const { name, description } = req.body;

    const workspace = await Workspace.findOne({
        _id: workspaceId,
        owner: req.user.userId,
    });

    if (!workspace) {
        throw new AppError(
            "Workspace not found or you are not the owner",
            404
        );
    }

    if (name !== undefined) {
        workspace.name = name;
    }

    if (description !== undefined) {
        workspace.description = description;
    }

    await workspace.save();

    res.status(200).json({
        success: true,
        message: "Workspace updated successfully",
        workspace,
    });
};

export const deleteWorkspace = async (req, res) => {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findOne({
        _id: workspaceId,
        owner: req.user.userId,
    });

    if (!workspace) {
        throw new AppError(
            "Workspace not found or you are not the owner",
            404
        );
    }

    await Workspace.findByIdAndDelete(workspaceId);

    res.status(200).json({
        success: true,
        message: "Workspace deleted successfully",
    });
};

export const addMember = async (req, res) => {
    const { workspaceId } = req.params;
    const { email } = req.body;

    const workspace = await Workspace.findOne({
        _id: workspaceId,
        owner: req.user.userId,
    });

    if (!workspace) {
        throw new AppError(
            "Workspace not found or you are not the owner",
            404
        );
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new AppError(
            "User with this email does not exist",
            404
        );
    }

    const alreadyMember = workspace.members.some(
        (member) => member.user.toString() === user._id.toString()
    );

    if (alreadyMember) {
        throw new AppError(
            "User is already a member of this workspace",
            409
        );
    }

    workspace.members.push({
        user: user._id,
        role: "member",
    });

    await workspace.save();

    res.status(200).json({
        success: true,
        message: "Member added successfully",
        workspace,
    });
};

export const getWorkspaceMembers = async (req, res) => {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findOne({
        _id: workspaceId,
        "members.user": req.user.userId,
    }).populate("members.user", "name email role");

    if (!workspace) {
        throw new AppError(
            "Workspace not found or access denied",
            404
        );
    }

    res.status(200).json({
        success: true,
        members: workspace.members,
    });
};

export const removeMember = async (req, res) => {
    const { workspaceId, userId } = req.params;

    const workspace = await Workspace.findOne({
        _id: workspaceId,
        owner: req.user.userId,
    });

    if (!workspace) {
        throw new AppError(
            "Workspace not found or you are not the owner",
            404
        );
    }

    if (workspace.owner.toString() === userId) {
        throw new AppError(
            "Workspace owner cannot be removed",
            400
        );
    }

    const memberExists = workspace.members.some(
        (member) => member.user.toString() === userId
    );

    if (!memberExists) {
        throw new AppError(
            "User is not a member of this workspace",
            404
        );
    }

    workspace.members = workspace.members.filter(
        (member) => member.user.toString() !== userId
    );

    await workspace.save();

    res.status(200).json({
        success: true,
        message: "Member removed successfully",
    });
};
export const updateMemberRole = async (req, res) => {
    const { workspaceId, userId } = req.params;
    const { role } = req.body;

    const workspace = await Workspace.findOne({
        _id: workspaceId,
        owner: req.user.userId,
    });

    if (!workspace) {
        throw new AppError(
            "Workspace not found or you are not the owner",
            404
        );
    }

    const member = workspace.members.find(
        (member) => member.user.toString() === userId
    );

    if (!member) {
        throw new AppError(
            "User is not a member of this workspace",
            404
        );
    }

    member.role = role;

    await workspace.save();

    res.status(200).json({
        success: true,
        message: "Member role updated successfully",
    });
};