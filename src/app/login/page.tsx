"use client";

import React, { useState } from "react";
import { useRouter } from "@/lib/next-compat/navigation";
import { useAuthStore, MOCK_USERS } from "@/stores/useAuthStore";
import { UserRole } from "@/types/auth";
import {
  ShieldCheck,
  Sparkles,
  Layers,
  CheckCircle2,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
  Building,
  UserPlus,
  LogIn,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, loginAs } = useAuthStore();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign Up Form State
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupRole, setSignupRole] = useState<UserRole>("creator");
  const [signupDepartment, setSignupDepartment] = useState("Content & Growth Marketing");

  const handleRoleSelect = (role: UserRole) => {
    setSignupRole(role);
    if (role === "creator") {
      setSignupDepartment("Content & Growth Marketing");
    } else if (role === "brand-manager") {
      setSignupDepartment("Global Brand & Governance");
    } else {
      setSignupDepartment("System Architecture & Compliance");
    }
  };

  // 1. Submit Sign In
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid email or password");
      }

      setUser({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        department: data.user.department,
      });

      router.push(`/dashboard/${data.user.role}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  // 2. Submit Sign Up (New Account)
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setErrorMsg("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupName.trim(),
          email: signupEmail.trim(),
          password: signupPassword,
          role: signupRole,
          department: signupDepartment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      setUser({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        department: data.user.department,
      });

      router.push(`/dashboard/${data.user.role}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed. Please try a different email.");
      setLoading(false);
    }
  };

  // 3. Quick 1-Click Demo Logins
  const handleDemoLogin = async (role: UserRole) => {
    setErrorMsg(null);
    setLoading(true);
    const demoUser = MOCK_USERS[role];

    try {
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoUser.email, password: "password123" }),
      });
    } catch {}

    loginAs(role);
    router.push(`/dashboard/${role}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfdf9] via-[#fffcf5] to-[#f6fcf3] text-stone-900 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-[#ffcab0] selection:text-stone-950">
      {/* Background Ambience Subtle Glows */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-[#e0ffcd]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-[#ffcab0]/25 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md sm:max-w-lg relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e0ffcd] border border-[#b7e89e] px-4 py-1.5 text-xs font-bold text-stone-900 mb-4 shadow-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-800" />
            <span>ECLIPSE • Enterprise Brand Governance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">
            {mode === "login" ? "Sign in to Workspace" : "Create New Account"}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-600 font-medium">
            {mode === "login"
              ? "Access your assigned role workspace with strict zero-leakage RBAC."
              : "Register your corporate credentials and select your dedicated role."}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/95 border border-[#f2ead8] rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 eclipse-4color-strip">
            <div className="first-color h-full" />
            <div className="second-color h-full" />
            <div className="third-color h-full" />
            <div className="fourth-color h-full" />
          </div>
          {/* Quick Persona Demo Logins (UP SIDE) */}
          <div className="mb-6 pt-2">
            <span className="block text-[11px] font-mono text-stone-500 uppercase tracking-wider text-center mb-3 font-semibold">
              Demo Login
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin("creator")}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-[#b7e89e] bg-[#e0ffcd] hover:bg-[#d2f7be] text-stone-950 text-[11px] font-bold transition-all shadow-2xs group cursor-pointer"
              >
                <Sparkles className="h-4 w-4 mb-1 text-emerald-800 group-hover:scale-110 transition-transform" />
                <span>Creator</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin("brand-manager")}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-[#f2cb7e] bg-[#ffebbb] hover:bg-[#fde1a6] text-stone-950 text-[11px] font-bold transition-all shadow-2xs group cursor-pointer"
              >
                <Layers className="h-4 w-4 mb-1 text-amber-800 group-hover:scale-110 transition-transform" />
                <span>Brand Mgr</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin("admin")}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-[#f7a077] bg-[#ffcab0] hover:bg-[#ffa882] text-stone-950 text-[11px] font-bold transition-all shadow-2xs group cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4 mb-1 text-orange-950 group-hover:scale-110 transition-transform" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#f2ead8] mb-6" />

          {/* Tab Switcher (DOWN WORDS) */}
          <div className="flex rounded-2xl bg-[#faf9f5] p-1.5 mb-6 border border-[#f2ead8]">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMsg(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === "login"
                  ? "bg-[#ffcab0] text-stone-950 shadow-sm border border-[#f7a077]"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Log In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMsg(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === "signup"
                  ? "bg-[#ffcab0] text-stone-950 shadow-sm border border-[#f7a077]"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Sign Up</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-5 flex items-center gap-2.5 p-3 rounded-xl bg-[#ffcab0]/40 border border-[#f7a077] text-stone-900 text-xs font-semibold">
              <ShieldAlert className="h-4 w-4 text-orange-800 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Corporate Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="alex.creator@eclipse.ai"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#f2ead8] text-stone-900 placeholder-stone-400 text-xs focus:outline-hidden focus:border-[#ffcab0] focus:ring-1 focus:ring-[#ffcab0] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-[#f2ead8] text-stone-900 placeholder-stone-400 text-xs focus:outline-hidden focus:border-[#ffcab0] focus:ring-1 focus:ring-[#ffcab0] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl bg-[#ffcab0] hover:bg-[#f7a077] text-stone-950 font-bold text-xs shadow-sm border border-[#f7a077] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-stone-900 border-t-transparent" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* 2. SIGN UP FORM (NEW ACCOUNT) */
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#f2ead8] text-stone-900 placeholder-stone-400 text-xs focus:outline-hidden focus:border-[#ffcab0] focus:ring-1 focus:ring-[#ffcab0] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#f2ead8] text-stone-900 placeholder-stone-400 text-xs focus:outline-hidden focus:border-[#ffcab0] focus:ring-1 focus:ring-[#ffcab0] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-[#f2ead8] text-stone-900 placeholder-stone-400 text-xs focus:outline-hidden focus:border-[#ffcab0] focus:ring-1 focus:ring-[#ffcab0] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Dedicated Role Selection with Strict RBAC Isolation */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Select Role & Workspace Access
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    {
                      role: "creator" as UserRole,
                      title: "Content Creator",
                      desc: "Author Studio: Content auditing, copy linting, tone inspection",
                      icon: Sparkles,
                      activeColor: "border-[#b7e89e] bg-[#e0ffcd] text-stone-950 font-bold",
                    },
                    {
                      role: "brand-manager" as UserRole,
                      title: "Brand Manager",
                      desc: "Approval Pipeline: Review drafts, enforce editorial compliance",
                      icon: Layers,
                      activeColor: "border-[#f2cb7e] bg-[#ffebbb] text-stone-950 font-bold",
                    },
                    {
                      role: "admin" as UserRole,
                      title: "Security & Admin",
                      desc: "Admin Console: RBAC permissions, audit trail ledger, rulebooks",
                      icon: ShieldCheck,
                      activeColor: "border-[#f7a077] bg-[#ffcab0] text-stone-950 font-bold",
                    },
                  ].map((r) => {
                    const isSelected = signupRole === r.role;
                    return (
                      <div
                        key={r.role}
                        onClick={() => handleRoleSelect(r.role)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 shadow-2xs ${
                          isSelected
                            ? `${r.activeColor} ring-1 ring-stone-900/10`
                            : "border-[#f2ead8] bg-[#faf9f5] hover:bg-white text-stone-700"
                        }`}
                      >
                        <r.icon className="h-4 w-4 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-900">{r.title}</span>
                            {isSelected && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-stone-900" />
                            )}
                          </div>
                          <p className="text-[11px] text-stone-600 mt-0.5 leading-snug font-normal">
                            {r.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Department
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    value={signupDepartment}
                    onChange={(e) => setSignupDepartment(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#f2ead8] text-stone-900 placeholder-stone-400 text-xs focus:outline-hidden focus:border-[#ffcab0] focus:ring-1 focus:ring-[#ffcab0] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl bg-[#ffcab0] hover:bg-[#f7a077] text-stone-950 font-bold text-xs shadow-sm border border-[#f7a077] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-stone-900 border-t-transparent" />
                ) : (
                  <>
                    <span>Create Account & Enter Workspace</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Mode Switcher */}
          <div className="mt-6 text-center text-xs text-stone-500">
            {mode === "login" ? (
              <p>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setErrorMsg(null);
                  }}
                  className="font-bold text-[#c84518] hover:text-[#a23310] transition-colors underline"
                >
                  Sign up now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setErrorMsg(null);
                  }}
                  className="font-bold text-[#c84518] hover:text-[#a23310] transition-colors underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
