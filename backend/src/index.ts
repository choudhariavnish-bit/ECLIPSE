import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import draftsRoutes from "./routes/drafts.routes";
import reviewRoutes from "./routes/review.routes";
import guidelinesRoutes from "./routes/guidelines.routes";
import workflowRoutes from "./routes/workflow.routes";
import analyticsRoutes from "./routes/analytics.routes";
import { pool } from "./config/db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(morgan("combined"));

// Health Check & Root
app.get("/health", async (req: express.Request, res: express.Response) => {
  let dbStatus = "disconnected";
  if (pool) {
    try {
      await pool.query("SELECT 1;");
      dbStatus = "connected";
    } catch {
      dbStatus = "error";
    }
  }

  res.json({
    status: "ok",
    service: "Inkloom AI Brand Governance REST API",
    database: dbStatus,
    timestamp: new Date().toISOString(),
    security: {
      zeroDataRetention: "enforced",
      rbac: "enabled",
      jwtAuth: "active",
      bcryptHashing: "cost 10",
    },
  });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/drafts", draftsRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/guidelines", guidelinesRoutes);
app.use("/api/workflow", workflowRoutes);
app.use("/api/analytics", analyticsRoutes);

// 404 Handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[Global Error]:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`=====================================================================`);
  console.log(` Inkloom AI Governance Backend listening on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(` Health Check: http://localhost:${PORT}/health`);
  console.log(`=====================================================================`);
});

export default app;
