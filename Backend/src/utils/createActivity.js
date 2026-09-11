import Activity from "../models/activity.model.js";

const createActivity = async ({
    action,
    description,
    user,
    workspace,
    project,
    task,
}) => {
    return await Activity.create({
        action,
        description,
        user,
        workspace,
        project,
        task,
    });
};

export default createActivity;