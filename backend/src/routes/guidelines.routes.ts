import { Router, Response } from "express";
import { executeQuery, pool } from "../config/db";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { logAuditEvent } from "../middleware/audit";

const router = Router();

// Fetch Guidelines (All users)
router.get("/", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!pool) return res.status(503).json({ error: "Database not connected." });
    const guidelines = await executeQuery("SELECT * FROM guidelines ORDER BY created_at DESC;");
    return res.json({ guidelines });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Upload Brand Guidelines (Brand Manager & Admin only)
router.post(
  "/",
  authenticateJWT,
  requireRole(["brand-manager", "admin"]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { title, content, version = "1.0.0" } = req.body;
      const user = req.user!;

      if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required." });
      }

      if (!pool) return res.status(503).json({ error: "Database not connected." });

      const rows = await executeQuery(
        `INSERT INTO guidelines (organization_id, title, content, version, created_by)
         VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
        [user.organizationId, title, content, version, user.userId]
      );

      await logAuditEvent(user.organizationId, user.userId, "GUIDELINE_UPLOAD", "guidelines", rows[0].id, { title, version });

      return res.status(201).json({ message: "Brand guideline uploaded", guideline: rows[0] });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// Update Guidelines (Brand Manager & Admin only)
router.put(
  "/:id",
  authenticateJWT,
  requireRole(["brand-manager", "admin"]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      const { title, content, version } = req.body;
      const user = req.user!;

      if (!pool) return res.status(503).json({ error: "Database not connected." });

      const rows = await executeQuery(
        `UPDATE guidelines SET
          title = COALESCE($1, title),
          content = COALESCE($2, content),
          version = COALESCE($3, version),
          updated_at = NOW()
         WHERE id = $4 RETURNING *;`,
        [title, content, version, id]
      );

      if (rows.length === 0) return res.status(404).json({ error: "Guideline not found." });

      await logAuditEvent(user.organizationId, user.userId, "GUIDELINE_UPDATE", "guidelines", id, { title, version });

      return res.json({ message: "Guideline updated", guideline: rows[0] });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// Fetch Rules
router.get("/rules", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!pool) return res.status(503).json({ error: "Database not connected." });
    const rules = await executeQuery("SELECT * FROM rules WHERE is_enabled = TRUE ORDER BY created_at ASC;");
    return res.json({ rules });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
