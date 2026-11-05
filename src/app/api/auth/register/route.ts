import { NextRequest, NextResponse } from "next/server";
import { governanceDB } from "@/lib/governanceStore";
import { hashPassword, generateToken, generateRefreshToken } from "@/lib/auth";
import { UserRole } from "@/types/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role = "creator", organizationId, department } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const validRoles: UserRole[] = ["creator", "brand-manager", "admin"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${validRoles.join(", ")}` }, { status: 400 });
    }

    const existingUser = await governanceDB.findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }

    // Default to first organization if organizationId not specified
    const orgs = await governanceDB.getOrganizations();
    const targetOrgId = organizationId || (orgs[0] ? orgs[0].id : "a0000000-0000-0000-0000-000000000001");

    // Hash password with bcrypt
    const hashedPassword = await hashPassword(password);

    const newUser = await governanceDB.createUser({
      name,
      email,
      password: hashedPassword,
      role: role as UserRole,
      organization_id: targetOrgId,
      department: department || "Content & Growth Marketing",
    });

    const payload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      organizationId: newUser.organization_id,
    };

    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await governanceDB.logAction({
      organization_id: targetOrgId,
      user_id: newUser.id,
      action: "USER_REGISTERED",
      entity_type: "users",
      entity_id: newUser.id,
      details: { role: newUser.role, email: newUser.email },
    });

    const { password: _, ...userSafe } = newUser;

    return NextResponse.json({
      message: "User registered successfully",
      user: userSafe,
      accessToken,
      refreshToken,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Registration error" }, { status: 500 });
  }
}

