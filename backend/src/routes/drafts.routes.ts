import { Router, Response } from "express";
import { executeQuery, pool } from "../config/db";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth";
import { logAuditEvent } from "../middleware/audit";

const router = Router();

// Upload Draft
router.post("/", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, content, channel = "Blog & Press", format = "Rich Article" } = req.body;
    const user = req.user!;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required." });
    }

    if (!pool) return res.status(503).json({ error: "Database not connected." });

    const rows = await executeQuery(
      `INSERT INTO drafts (user_id, organization_id, title, content, channel, format, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'draft') RETURNING *;`,
      [user.userId, user.organizationId, title, content, channel, format]
    );

    await logAuditEvent(user.organizationId, user.userId, "DRAFT_UPLOAD", "drafts", rows[0].id, { title, channel });

    return res.status(201).json({ message: "Draft uploaded successfully", draft: rows[0] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Get Drafts
router.get("/", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    if (!pool) return res.status(503).json({ error: "Database not connected." });

    let drafts;
    if (user.role === "creator") {
      drafts = await executeQuery("SELECT * FROM drafts WHERE user_id = $1 ORDER BY updated_at DESC;", [user.userId]);
    } else {
      drafts = await executeQuery("SELECT * FROM drafts WHERE organization_id = $1 ORDER BY updated_at DESC;", [user.organizationId]);
    }

    return res.json({ drafts });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Get Single Draft
router.get("/:id", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!pool) return res.status(503).json({ error: "Database not connected." });

    const drafts = await executeQuery("SELECT * FROM drafts WHERE id = $1 LIMIT 1;", [id]);
    if (drafts.length === 0) return res.status(404).json({ error: "Draft not found." });

    const findings = await executeQuery("SELECT * FROM findings WHERE draft_id = $1 ORDER BY created_at ASC;", [id]);
    const comments = await executeQuery("SELECT * FROM comments WHERE draft_id = $1 ORDER BY created_at ASC;", [id]);

    return res.json({ draft: drafts[0], findings, comments });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Update Draft
router.put("/:id", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { title, content, status } = req.body;
    const user = req.user!;
    if (!pool) return res.status(503).json({ error: "Database not connected." });

    const rows = await executeQuery(
      `UPDATE drafts SET 
        title = COALESCE($1, title),
        content = COALESCE($2, content),
        status = COALESCE($3, status),
        updated_at = NOW()
       WHERE id = $4 RETURNING *;`,
      [title, content, status, id]
    );

    if (rows.length === 0) return res.status(404).json({ error: "Draft not found." });

    await logAuditEvent(user.organizationId, user.userId, "DRAFT_UPDATE", "drafts", id, { title });

    return res.json({ message: "Draft updated successfully", draft: rows[0] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Delete Draft
router.delete("/:id", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = req.user!;
    if (!pool) return res.status(503).json({ error: "Database not connected." });

    await executeQuery("DELETE FROM drafts WHERE id = $1;", [id]);
    await logAuditEvent(user.organizationId, user.userId, "DRAFT_DELETE", "drafts", id);

    return res.json({ message: "Draft deleted successfully." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
