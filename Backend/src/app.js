import { getAllowedOrigins } from "./config/origins.js";
import "dotenv/config";
import { createServer } from "node:http";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";
import workspaceRoutes from "./routes/workspace.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import fileRoutes from "./routes/file.routes.js";
import messageRoutes from "./routes/message.routes.js";
import connectDB from "./config/db.js";
import { initializeSocket } from "./realtime/socket.js";

import collaborationRoutes from "./routes/collaboration.routes.js";

import imagesRoutes from "./routes/images.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api", projectRoutes);
app.use("/api", taskRoutes);
app.use("/api", commentRoutes);
app.use("/api", activityRoutes);
app.use("/api/files", fileRoutes);
app.use("/api", messageRoutes);
app.use("/api", collaborationRoutes);
app.use("/api/images", imagesRoutes);
app.use("/api", analyticsRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "WorkSphere API is running",
  });
});

app.use(errorMiddleware);

const httpServer = createServer(app);
initializeSocket(httpServer);

await connectDB();

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
