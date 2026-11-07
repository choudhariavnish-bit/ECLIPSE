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
  ChevronDown,
  ChevronUp,
  Database,
  Cpu,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, loginAs } = useAuthStore();

  const [mode, setMode] = useState<"demo" | "custom">("demo");
  const [authSubMode, setAuthSubMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
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

  // 1. Instant 1-Click Demo Evaluation Persona Login
  const handleDemoLogin = async (role: UserRole) => {
    setErrorMsg(null);
    setLoadingRole(role);
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

  // 2. Custom Login
  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFormLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");

      setUser({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        department: data.user.department,
      });

      router.push(`/dashboard/${data.user.role}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials.");
      setFormLoading(false);
    }
  };

  // 3. Custom Sign Up
  const handleCustomSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFormLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
          role: signupRole,
          department: signupDepartment,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      setUser({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        department: data.user.department,
      });

      router.push(`/dashboard/${data.user.role}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed.");
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfdf9] via-[#fffcf5] to-[#f6fcf3] text-stone-900 flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-[#ffcab0] selection:text-stone-950">
      {/* Subtle, faint ambient glows */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-[#e0ffcd]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-[#ffcab0]/25 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e0ffcd] border border-[#b7e89e] px-4 py-1.5 text-xs font-bold text-stone-900 mb-3 shadow-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-800" />
            <span>ECLIPSE • Intelligent Brand Governance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">
            Enterprise Governance Studio
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-600 font-medium">
            Select a demo evaluation persona below for instant 1-click workspace access.
          </p>
        </div>

        {/* PRIMARY DEMO EVALUATION SECTION */}
        <div className="bg-white/95 border border-[#f2ead8] rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#f2ead8]">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#e0ffcd] border border-[#b7e89e] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                ⚡ 1-Click Demo Evaluation Personas
              </span>
            </div>
            <span className="text-[11px] font-mono text-stone-500 font-semibold px-2 py-0.5 rounded-md bg-[#faf9f5] border border-[#f2ead8]">
              Instant Access
            </span>
          </div>

          {/* 3 Persona Cards */}
          <div className="grid grid-cols-1 gap-3.5">
            {/* 1. Creator Persona */}
            <div
              onClick={() => handleDemoLogin("creator")}
              className="group p-4 rounded-2xl border border-[#b7e89e] bg-[#e0ffcd]/40 hover:bg-[#e0ffcd]/70 transition-all cursor-pointer shadow-2xs hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="h-11 w-11 rounded-xl bg-[#e0ffcd] border border-[#b7e89e] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <Sparkles className="h-5 w-5 text-emerald-800" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-900">Alex Morgan</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e0ffcd] border border-[#b7e89e] text-emerald-950 font-mono">
                      Author Studio
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-snug">
                    Copy inspector, character limits, live drift gauge, and automated claim fixer.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={loadingRole !== null}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-[#ffcab0] text-stone-950 font-bold text-xs border border-[#b7e89e] hover:border-[#f7a077] transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-2xs"
              >
                {loadingRole === "creator" ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-stone-900 border-t-transparent" />
                ) : (
                  <>
                    <span>Enter Creator Studio</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* 2. Brand Manager Persona */}
            <div
              onClick={() => handleDemoLogin("brand-manager")}
              className="group p-4 rounded-2xl border border-[#f2cb7e] bg-[#ffebbb]/35 hover:bg-[#ffebbb]/65 transition-all cursor-pointer shadow-2xs hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="h-11 w-11 rounded-xl bg-[#ffebbb] border border-[#f2cb7e] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <Layers className="h-5 w-5 text-amber-800" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-900">Sarah Chen</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffebbb] border border-[#f2cb7e] text-amber-950 font-mono">
                      Brand Manager
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-snug">
                    Draft approval pipeline, policy signing, and real-time Tone & Voice matrix calibration.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={loadingRole !== null}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-[#ffcab0] text-stone-950 font-bold text-xs border border-[#f2cb7e] hover:border-[#f7a077] transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-2xs"
              >
                {loadingRole === "brand-manager" ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-stone-900 border-t-transparent" />
                ) : (
                  <>
                    <span>Enter Brand Portal</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* 3. Security Admin Persona */}
            <div
              onClick={() => handleDemoLogin("admin")}
              className="group p-4 rounded-2xl border border-[#f7a077] bg-[#ffcab0]/30 hover:bg-[#ffcab0]/60 transition-all cursor-pointer shadow-2xs hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="h-11 w-11 rounded-xl bg-[#ffcab0] border border-[#f7a077] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <ShieldCheck className="h-5 w-5 text-orange-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-900">Elena Rostova</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffcab0] border border-[#f7a077] text-orange-950 font-mono">
                      Security & Admin
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-snug">
                    Database Studio, 9-table Supabase live inspector, audit ledger, and user directory.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={loadingRole !== null}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-[#ffcab0] text-stone-950 font-bold text-xs border border-[#f7a077] transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-2xs"
              >
                {loadingRole === "admin" ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-stone-900 border-t-transparent" />
                ) : (
                  <>
                    <span>Enter Admin Studio</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Collapsible Custom Credential Sign In */}
          <div className="pt-2 border-t border-[#f2ead8]">
            <button
              type="button"
              onClick={() => setMode(mode === "demo" ? "custom" : "demo")}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
            >
              <span>{mode === "demo" ? "Sign in with custom corporate credentials" : "Hide custom login"}</span>
              {mode === "demo" ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
            </button>

            {mode === "custom" && (
              <div className="mt-4 pt-4 border-t border-[#f2ead8] space-y-4 animate-in fade-in duration-200">
                <div className="flex rounded-xl bg-[#faf9f5] p-1 border border-[#f2ead8]">
                  <button
                    type="button"
                    onClick={() => { setAuthSubMode("login"); setErrorMsg(null); }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      authSubMode === "login"
                        ? "bg-[#ffcab0] text-stone-950 border border-[#f7a077] shadow-2xs"
                        : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthSubMode("signup"); setErrorMsg(null); }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      authSubMode === "signup"
                        ? "bg-[#ffcab0] text-stone-950 border border-[#f7a077] shadow-2xs"
                        : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#ffcab0]/40 border border-[#f7a077] text-stone-900 text-xs font-semibold">
                    <ShieldAlert className="h-4 w-4 text-orange-800 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {authSubMode === "login" ? (
                  <form onSubmit={handleCustomLogin} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="alex.creator@eclipse.ai"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#f2ead8] text-stone-900 text-xs focus:outline-hidden focus:border-[#ffcab0]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full px-3 pr-9 py-2 rounded-xl bg-white border border-[#f2ead8] text-stone-900 text-xs focus:outline-hidden focus:border-[#ffcab0]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                        >
                          {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="w-full py-2.5 rounded-xl bg-[#ffcab0] hover:bg-[#f7a077] text-stone-950 font-bold text-xs border border-[#f7a077] transition-all flex items-center justify-center gap-1.5"
                    >
                      {formLoading ? "Authenticating..." : "Sign In with Credentials"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleCustomSignup} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="Alex Morgan"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#f2ead8] text-stone-900 text-xs focus:outline-hidden focus:border-[#ffcab0]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Work Email</label>
                      <input
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="alex@company.com"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#f2ead8] text-stone-900 text-xs focus:outline-hidden focus:border-[#ffcab0]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#f2ead8] text-stone-900 text-xs focus:outline-hidden focus:border-[#ffcab0]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Select Role</label>
                      <select
                        value={signupRole}
                        onChange={(e) => setSignupRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#f2ead8] text-stone-900 text-xs focus:outline-hidden focus:border-[#ffcab0]"
                      >
                        <option value="creator">Content Creator (Author Studio)</option>
                        <option value="brand-manager">Brand Manager (Approval Pipeline)</option>
                        <option value="admin">Security Admin (Database & RBAC)</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="w-full py-2.5 rounded-xl bg-[#ffcab0] hover:bg-[#f7a077] text-stone-950 font-bold text-xs border border-[#f7a077] transition-all flex items-center justify-center gap-1.5"
                    >
                      {formLoading ? "Creating Account..." : "Register & Launch"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
