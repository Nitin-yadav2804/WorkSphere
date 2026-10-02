import Activity from "../models/activity.model.js";
import { emitWorkspaceActivity } from "../realtime/socket.js";

const createActivity = async ({
    action,
    description,
    user,
    workspace,
    project,
    task,
}) => {
    const activity = await Activity.create({
        action,
        description,
        user,
        workspace,
        project,
        task,
    });

    await activity.populate("user", "name email");
    await activity.populate("project", "name");
    await activity.populate("task", "title");

    if (workspace) {
        emitWorkspaceActivity(workspace, activity);
    }

    return activity;
};

export default createActivity;
