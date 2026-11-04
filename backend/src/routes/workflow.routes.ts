import { Router, Response } from "express";
import { executeQuery, pool } from "../config/db";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { logAuditEvent } from "../middleware/audit";

const router = Router();

// Submit for Review (Creators & Authors)
router.post("/submit", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { draftId, notes } = req.body;
    const user = req.user!;

    if (!draftId) return res.status(400).json({ error: "draftId is required." });
    if (!pool) return res.status(503).json({ error: "Database not connected." });

    const updated = await executeQuery(
      "UPDATE drafts SET status = 'review_pending', updated_at = NOW() WHERE id = $1 RETURNING *;",
      [draftId]
    );

    if (updated.length === 0) return res.status(404).json({ error: "Draft not found." });

    await executeQuery(
      `INSERT INTO approvals (draft_id, approved_by, status, notes)
       VALUES ($1, $2, 'submitted', $3);`,
      [draftId, user.userId, notes || "Submitted for pre-publication governance review."]
    );

    await logAuditEvent(user.organizationId, user.userId, "DRAFT_SUBMITTED", "drafts", draftId, { notes });

    return res.json({ message: "Draft submitted for brand review", draft: updated[0] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Approve Content (Brand Manager & Admin only - strictly blocks Creator!)
router.post(
  "/approve",
  authenticateJWT,
  requireRole(["brand-manager", "admin"]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { draftId, notes } = req.body;
      const user = req.user!;

      if (!draftId) return res.status(400).json({ error: "draftId is required." });
      if (!pool) return res.status(503).json({ error: "Database not connected." });

      const updated = await executeQuery(
        "UPDATE drafts SET status = 'approved', updated_at = NOW() WHERE id = $1 RETURNING *;",
        [draftId]
      );

      if (updated.length === 0) return res.status(404).json({ error: "Draft not found." });

      const approval = await executeQuery(
        `INSERT INTO approvals (draft_id, approved_by, status, notes)
         VALUES ($1, $2, 'approved', $3) RETURNING *;`,
        [draftId, user.userId, notes || "Approved for publication by Brand Governance."]
      );

      await logAuditEvent(user.organizationId, user.userId, "DRAFT_APPROVED", "drafts", draftId, { notes });

      return res.json({ message: "Draft officially approved", draft: updated[0], approval: approval[0] });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// Reject Content / Request Changes (Brand Manager & Admin only)
router.post(
  "/reject",
  authenticateJWT,
  requireRole(["brand-manager", "admin"]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { draftId, notes, action = "changes_requested" } = req.body;
      const user = req.user!;

      if (!draftId) return res.status(400).json({ error: "draftId is required." });
      if (!pool) return res.status(503).json({ error: "Database not connected." });

      const status = action === "reject" ? "rejected" : "changes_requested";

      const updated = await executeQuery(
        "UPDATE drafts SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *;",
        [status, draftId]
      );

      if (updated.length === 0) return res.status(404).json({ error: "Draft not found." });

      const approval = await executeQuery(
        `INSERT INTO approvals (draft_id, approved_by, status, notes)
         VALUES ($1, $2, $3, $4) RETURNING *;`,
        [draftId, user.userId, status, notes || "Brand modifications required."]
      );

      await logAuditEvent(user.organizationId, user.userId, `DRAFT_${status.toUpperCase()}`, "drafts", draftId, { notes });

      return res.json({ message: `Draft status updated to ${status}`, draft: updated[0], approval: approval[0] });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// Add Comments
router.post("/comments", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { draftId, comment } = req.body;
    const user = req.user!;

    if (!draftId || !comment) return res.status(400).json({ error: "draftId and comment are required." });
    if (!pool) return res.status(503).json({ error: "Database not connected." });

    const rows = await executeQuery(
      `INSERT INTO comments (draft_id, reviewer_id, comment)
       VALUES ($1, $2, $3) RETURNING *;`,
      [draftId, user.userId, comment]
    );

    await logAuditEvent(user.organizationId, user.userId, "COMMENT_ADDED", "comments", rows[0].id, { draftId });

    return res.status(201).json({ message: "Comment added", comment: rows[0] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;

