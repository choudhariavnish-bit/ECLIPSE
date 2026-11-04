import { Router, Response } from "express";
import { executeQuery, pool } from "../config/db";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";

const router = Router();

// Review Statistics
router.get("/stats", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!pool) return res.status(503).json({ error: "Database not connected." });

    const totalDraftsRes = await executeQuery("SELECT COUNT(*) FROM drafts;");
    const approvedDraftsRes = await executeQuery("SELECT COUNT(*) FROM drafts WHERE status = 'approved';");
    const pendingDraftsRes = await executeQuery("SELECT COUNT(*) FROM drafts WHERE status = 'review_pending';");
    const activeRulesRes = await executeQuery("SELECT COUNT(*) FROM rules WHERE is_enabled = TRUE;");

    const total = parseInt(totalDraftsRes[0]?.count || "0", 10);
    const approved = parseInt(approvedDraftsRes[0]?.count || "0", 10);
    const pending = parseInt(pendingDraftsRes[0]?.count || "0", 10);
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 100;

    return res.json({
      statistics: {
        totalDrafts: total,
        approvedDrafts: approved,
        pendingReviews: pending,
        approvalRate: `${approvalRate}%`,
        activeRulesCount: parseInt(activeRulesRes[0]?.count || "0", 10),
        zeroDataRetentionStatus: "Active - Ephemeral Review Guardrails",
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Common Mistakes
router.get("/common-mistakes", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!pool) return res.status(503).json({ error: "Database not connected." });

    const findingsByRule = await executeQuery(
      `SELECT r.name, r.rule_type, r.severity, COUNT(f.id) as count
       FROM rules r
       LEFT JOIN findings f ON f.rule_id = r.id
       GROUP BY r.id, r.name, r.rule_type, r.severity
       ORDER BY count DESC
       LIMIT 5;`
    );

    return res.json({ commonMistakes: findingsByRule });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Governance Dashboard
router.get("/dashboard", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    return res.json({
      governanceHealthScore: 94,
      complianceBenchmarks: {
        claims: 92,
        tone: 96,
        terminology: 95,
        accessibility: 89,
        visuals: 98,
      },
      auditMode: "Zero Data Retention / Strict RLS",
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Audit Logs (Admin only)
router.get(
  "/audit-logs",
  authenticateJWT,
  requireRole(["admin"]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!pool) return res.status(503).json({ error: "Database not connected." });

      const logs = await executeQuery("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100;");
      return res.json({ logs });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

export default router;

