import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { executeQuery, pool } from "../config/db";
import { logAuditEvent } from "../middleware/audit";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "inkloom-brand-governance-super-secret-key-2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

// 1. User Registration
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = "creator", organizationId, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    if (!pool) {
      return res.status(503).json({ error: "Database not connected. Please set DATABASE_URL." });
    }

    const existing = await executeQuery("SELECT id FROM users WHERE email = $1 LIMIT 1;", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const orgs = await executeQuery("SELECT id FROM organizations LIMIT 1;");
    const targetOrgId = organizationId || (orgs[0] ? orgs[0].id : null);

    const newUser = await executeQuery(
      `INSERT INTO users (name, email, password, role, organization_id, department)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, organization_id, department, created_at;`,
      [name, email, passwordHash, role, targetOrgId, department || "Content"]
    );

    const user = newUser[0];
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, organizationId: user.organization_id },
      JWT_SECRET,
      { expiresIn: (JWT_EXPIRES_IN as any) }
    );

    await logAuditEvent(user.organization_id, user.id, "USER_REGISTER", "users", user.id, { email, role });

    return res.status(201).json({ message: "Registration successful", user, accessToken });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. User Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    if (!pool) {
      return res.status(503).json({ error: "Database not connected. Please set DATABASE_URL." });
    }

    const users = await executeQuery("SELECT * FROM users WHERE email = $1 LIMIT 1;", [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organization_id,
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: (JWT_EXPIRES_IN as any) });
    const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ("7d" as any) });

    await logAuditEvent(user.organization_id, user.id, "USER_LOGIN", "users", user.id, { role: user.role });

    const { password: _, ...safeUser } = user;
    return res.json({ message: "Login successful", user: safeUser, accessToken, refreshToken });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. Token Refresh
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "Refresh token is required." });

    const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;
    const newAccessToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email, role: decoded.role, organizationId: decoded.organizationId },
      JWT_SECRET,
      { expiresIn: (JWT_EXPIRES_IN as any) }
    );

    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired refresh token." });
  }
});

// 4. Password Reset
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ error: "Email and newPassword required." });

    if (!pool) return res.status(503).json({ error: "Database not connected." });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    await executeQuery("UPDATE users SET password = $1 WHERE email = $2;", [hash, email]);

    return res.json({ message: "Password updated successfully." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
