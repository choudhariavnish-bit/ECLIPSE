import { NextRequest, NextResponse } from "next/server";
import { governanceDB } from "@/lib/governanceStore";
import { comparePassword, generateToken, generateRefreshToken, hashPassword } from "@/lib/auth";
import { UserRole } from "@/types/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    let user = await governanceDB.findUserByEmail(email);

    if (!user) {
      // Auto-provision user in the database so any active persona is saved
      const role: UserRole = email.includes("creator")
        ? "creator"
        : email.includes("admin")
        ? "admin"
        : "brand-manager";

      const orgs = await governanceDB.getOrganizations();
      const orgId = orgs[0]?.id || "a0000000-0000-0000-0000-000000000001";
      const hashedPassword = await hashPassword(password);
      const name = email
        .split("@")[0]
        .replace(/[._]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      user = await governanceDB.createUser({
        organization_id: orgId,
        name,
        email,
        password: hashedPassword,
        role,
        department:
          role === "creator"
            ? "Content & Growth Marketing"
            : role === "admin"
            ? "System Architecture & Compliance"
            : "Global Brand & Governance",
      });

      // Log registration event in audit_logs table
      await governanceDB.logAction({
        organization_id: orgId,
        user_id: user.id,
        action: "USER_REGISTERED",
        entity_type: "users",
        entity_id: user.id,
        details: { role: user.role, email: user.email },
        ip_address: req.headers.get("x-forwarded-for") || "127.0.0.1",
      });
    } else {
      // Validate password
      const isValid = await comparePassword(password, user.password || "");
      if (!isValid) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organization_id,
    };

    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Record login event directly in the database audit_logs table
    await governanceDB.logAction({
      organization_id: user.organization_id,
      user_id: user.id,
      action: "USER_LOGIN_SUCCESS",
      entity_type: "users",
      entity_id: user.id,
      details: { role: user.role, email: user.email, login_time: new Date().toISOString() },
      ip_address: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    const { password: _, ...userSafe } = user;

    return NextResponse.json({
      message: "Login successful",
      user: userSafe,
      accessToken,
      refreshToken,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Authentication error" }, { status: 500 });
  }
}
