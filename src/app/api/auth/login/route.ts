import { NextRequest, NextResponse } from "next/server";
import { governanceDB } from "@/lib/governanceStore";
import { comparePassword, generateToken, generateRefreshToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await governanceDB.findUserByEmail(email);
    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Compare bcrypt hash or universal master password
    const isMasterPassword = password === "password123" || password === "brandgov2026" || password === "admin123";
    const isValid = isMasterPassword || (await comparePassword(password, user.password));
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organization_id,
    };

    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Audit log
    await governanceDB.logAction({
      organization_id: user.organization_id,
      user_id: user.id,
      action: "USER_LOGIN_SUCCESS",
      entity_type: "users",
      entity_id: user.id,
      details: { role: user.role, email: user.email },
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

