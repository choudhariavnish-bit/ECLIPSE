import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth";
import { executeQuery, pool } from "../config/db";

export async function logAuditEvent(
  organizationId: string,
  userId: string | undefined,
  action: string,
  entityType: string,
  entityId?: string,
  details: any = {},
  ipAddress?: string
) {
  if (!pool) return;
  try {
    await executeQuery(
      `INSERT INTO audit_logs (organization_id, user_id, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [organizationId, userId || null, action, entityType, entityId || null, JSON.stringify(details), ipAddress || "127.0.0.1"]
    );
  } catch (err) {
    console.error("[AuditLog Error]:", err);
  }
}

