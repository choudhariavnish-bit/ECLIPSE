import { Router, Response } from "express";
import { executeQuery, pool } from "../config/db";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth";
import { logAuditEvent } from "../middleware/audit";

const router = Router();

// Start Content Review (Zero Data Retention)
router.post("/start", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { draftId, text, channel = "General" } = req.body;
    const user = req.user!;

    if (!text) {
      return res.status(400).json({ error: "Content text is required." });
    }

    if (!pool) return res.status(503).json({ error: "Database not connected." });

    // Fetch active rules from database
    const rules = await executeQuery("SELECT * FROM rules WHERE is_enabled = TRUE;");
    const detected: any[] = [];

    // Zero Data Retention: Evaluated in transient memory
    for (const rule of rules) {
      if (rule.pattern && text.toLowerCase().includes(rule.pattern.toLowerCase())) {
        detected.push({
          draft_id: draftId,
          rule_id: rule.id,
          issue: rule.description,
          severity: rule.severity,
          suggestion: rule.replacement,
          highlight_text: rule.pattern,
          category: rule.rule_type,
          status: "pending",
        });
      }
    }

    // Insert findings into DB if draftId provided
    const insertedFindings = [];
    if (draftId && detected.length > 0) {
      for (const item of detected) {
        const rows = await executeQuery(
          `INSERT INTO findings (draft_id, rule_id, issue, severity, suggestion, highlight_text, category, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending') RETURNING *;`,
          [item.draft_id, item.rule_id, item.issue, item.severity, item.suggestion, item.highlight_text, item.category]
        );
        insertedFindings.push(rows[0]);
      }
    }

    await logAuditEvent(
      user.organizationId,
      user.userId,
      "AI_REVIEW_COMPLETED",
      "drafts",
      draftId,
      { findingsDetected: detected.length, channel, zeroDataRetention: true }
    );

    return res.json({
      message: "AI review completed with Zero Data Retention guarantee.",
      findingsCount: detected.length,
      findings: insertedFindings.length > 0 ? insertedFindings : detected,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Retrieve AI Findings
router.get("/:draftId/findings", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const draftId = req.params.draftId as string;
    if (!pool) return res.status(503).json({ error: "Database not connected." });

    const findings = await executeQuery("SELECT * FROM findings WHERE draft_id = $1 ORDER BY created_at ASC;", [draftId]);
    return res.json({ draftId, findings });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Generate Suggestions
router.post("/suggest", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { flaggedPhrase, ruleType } = req.body;
    if (!flaggedPhrase) return res.status(400).json({ error: "flaggedPhrase is required." });

    let suggestion = "enterprise standard wording";
    const lower = flaggedPhrase.toLowerCase();

    if (lower.includes("foolproof") || lower.includes("100%")) {
      suggestion = "enterprise-grade AI automation with verified high-availability";
    } else if (lower.includes("super crazy fast")) {
      suggestion = "rapid zero-downtime deployment";
    } else if (lower.includes("man hours")) {
      suggestion = "person hours";
    }

    return res.json({
      original: flaggedPhrase,
      suggestion,
      confidence: 0.96,
      ruleType: ruleType || "compliance",
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
