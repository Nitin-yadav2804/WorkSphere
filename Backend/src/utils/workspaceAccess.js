import Workspace from "../models/workspace.model.js";
import AppError from "./AppError.js";

// Access policy, error wording/status, and population remain explicit per endpoint.
export const requireWorkspaceAccess = async (
    workspaceId,
    userId,
    { ownerOnly = false, message, statusCode = 404, populate = [] }
) => {
    let query = Workspace.findOne({
        _id: workspaceId,
        [ownerOnly ? "owner" : "members.user"]: userId,
    });
    for (const args of populate) {
        query = query.populate(...args);
    }
    const workspace = await query;
    if (!workspace) {
        throw new AppError(message, statusCode);
    }
    return workspace;
};
