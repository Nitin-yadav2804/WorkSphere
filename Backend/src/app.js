import express from "express";
import authRoutes from "./routes/auth.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";
import workspaceRoutes from "./routes/workspace.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api", projectRoutes);
app.use("/api", taskRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "WorkSphere API is running",
    });
});

app.use(errorMiddleware);

export default app;