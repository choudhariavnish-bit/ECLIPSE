import { NextRequest, NextResponse } from "next/server";
import { governanceDB } from "@/lib/governanceStore";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json({ error: "Email and newPassword are required" }, { status: 400 });
    }

    const user = await governanceDB.findUserByEmail(email);
    if (!user) {
      // Security: do not leak whether email exists
      return NextResponse.json({ message: "If an account exists, password has been reset." });
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;

    await governanceDB.logAction({
      organization_id: user.organization_id,
      user_id: user.id,
      action: "PASSWORD_RESET_COMPLETED",
      entity_type: "users",
      entity_id: user.id,
      details: { email: user.email },
    });

    return NextResponse.json({ message: "Password reset completed successfully." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Reset password error" }, { status: 500 });
  }
}

