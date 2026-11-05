"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore, MOCK_USERS } from "@/stores/useAuthStore";
import { UserRole } from "@/types/auth";
import {
  ShieldCheck,
  Sparkles,
  Layers,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Lock,
  Mail,
  User,
  Building,
  Key,
  X,
  FileCheck2,
  PenTool,
  Wand2,
  Scale,
  Cpu,
  Terminal,
  ShieldAlert,
  Zap,
  Fingerprint,
  ChevronRight,
  Star,
  Activity,
  Server,
  Database,
  Eye,
  EyeOff,
  AlertCircle,
  Shield,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, register: registerUser, loginAs } = useAuthStore();

  // Active Role Modal
  const [activeModalRole, setActiveModalRole] = useState<UserRole | null>(null);
  const [modalTab, setModalTab] = useState<"signin" | "signup">("signin");

  // Form States
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("password123");
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpOrg, setSignUpOrg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const openRoleModal = (role: UserRole) => {
    setActiveModalRole(role);
    setModalTab("signin");
    setSignInEmail(MOCK_USERS[role].email);
    setSignInPassword("password123");
    setSignUpEmail("");
    setSignUpName("");
    setSignUpPassword("");
    setSignUpOrg("");
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const closeModal = () => {
    setActiveModalRole(null);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleInstantDemo = (role: UserRole) => {
    loginAs(role);
    router.push(`/dashboard/${role}`);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalRole) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    setLoading(true);
    try {
      const res = await login(signInEmail.trim(), signInPassword);
      if (res.success && res.user) {
        setSuccessMessage(`Authenticated as ${res.user.name}! Redirecting...`);
        setTimeout(() => {
          router.push(`/dashboard/${res.user?.role || activeModalRole}`);
        }, 500);
      } else {
        setErrorMessage(res.error || "Invalid credentials.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalRole) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (signUpPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({
        name: signUpName.trim(),
        email: signUpEmail.trim(),
        password: signUpPassword,
        role: activeModalRole,
        organizationName: signUpOrg.trim() || "Inkloom Enterprise",
      });

      if (res.success && res.user) {
        setSuccessMessage(`Account created & saved to database! Redirecting...`);
        setTimeout(() => {
          router.push(`/dashboard/${res.user?.role || activeModalRole}`);
        }, 700);
      } else {
        setErrorMessage(res.error || "Registration failed.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* 3D Ambient Background Lights & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.25),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle perspective grid lines */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-4xl text-center relative z-10 mb-10"
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-400/30 px-4 py-1.5 text-xs font-semibold text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] mb-4 backdrop-blur-md">
          <ShieldCheck className="h-4 w-4 text-blue-400" />
          <span>Inkloom AI • PostgreSQL & Supabase Connected</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
          Select Your Governance Workspace
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Prevent unverified claims, tone drift, and off-brand visuals before publishing.
          <br className="hidden sm:inline" />
          <span className="text-blue-400 font-medium"> Click your role card </span> to Log In or Sign Up directly with the database.
        </p>
      </motion.div>

      {/* 3D Interactive Role Cards Grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 px-2">
        {/* CARD 1: CREATOR */}
        <motion.div
          whileHover={{ y: -8, rotateX: 2, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={() => openRoleModal("creator")}
          className="group relative rounded-3xl p-7 cursor-pointer overflow-hidden border border-blue-500/30 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(8,112,184,0.15)] hover:shadow-[0_25px_60px_rgba(59,130,246,0.35)] hover:border-blue-400/60 transition-all duration-300 flex flex-col justify-between"
          style={{ transformPerspective: 1000 }}
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-12 -top-12 w-44 h-44 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-1 text-xs font-bold text-blue-300">
                  <Sparkles className="h-3 w-3 text-blue-400" />
                  Creator Studio
                </span>
              </div>
              <span className="text-xs font-mono font-medium text-slate-400 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Persona
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                <div className="h-full w-full rounded-2xl bg-slate-950/80 flex items-center justify-center backdrop-blur-sm">
                  <PenTool className="h-7 w-7 text-blue-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black text-white group-hover:text-blue-300 transition-colors">
                  Content Creator
                </h2>
                <p className="text-xs text-slate-400 font-medium">Alex Morgan • Growth Marketing</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6 font-normal">
              High-velocity content generation with real-time brand voice alignment & automated compliance checking.
            </p>

            {/* Live Metrics Pill */}
            <div className="rounded-2xl border border-blue-500/20 bg-blue-950/30 p-3 mb-6 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-blue-200">
                <Activity className="h-4 w-4 text-blue-400" />
                <span>Drift Target &lt; 20</span>
              </div>
              <span className="font-mono text-blue-300 font-bold bg-blue-900/40 px-2 py-0.5 rounded">
                Real-time Checks
              </span>
            </div>

            {/* Key Capabilities */}
            <div className="space-y-2 mb-8">
              {[
                "Real-time Brand Drift scoring (<20 target)",
                "Auto-replacement of prohibited terminology",
                "Multi-channel copy generation (Social, Blog, Ads)",
                "Pre-publication AI safety gate checks",
              ].map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/30 group-hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <span>Log In / Sign Up as Creator</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* CARD 2: BRAND MANAGER */}
        <motion.div
          whileHover={{ y: -8, rotateX: 2, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={() => openRoleModal("brand-manager")}
          className="group relative rounded-3xl p-7 cursor-pointer overflow-hidden border border-purple-500/30 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(139,92,246,0.15)] hover:shadow-[0_25px_60px_rgba(168,85,247,0.35)] hover:border-purple-400/60 transition-all duration-300 flex flex-col justify-between"
          style={{ transformPerspective: 1000 }}
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-12 -top-12 w-44 h-44 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 px-3 py-1 text-xs font-bold text-purple-300">
                  <Scale className="h-3 w-3 text-purple-400" />
                  Policy & Approval Authority
                </span>
              </div>
              <span className="text-xs font-mono font-medium text-slate-400 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
                Active Persona
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 p-0.5 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
                <div className="h-full w-full rounded-2xl bg-slate-950/80 flex items-center justify-center backdrop-blur-sm">
                  <Sliders className="h-7 w-7 text-purple-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black text-white group-hover:text-purple-300 transition-colors">
                  Brand Manager
                </h2>
                <p className="text-xs text-slate-400 font-medium">Sarah Chen • Global Governance</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6 font-normal">
              Centralized policy orchestrator for global brand integrity, tone calibration, and publishing workflows.
            </p>

            {/* Live Metrics Pill */}
            <div className="rounded-2xl border border-purple-500/20 bg-purple-950/30 p-3 mb-6 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-purple-200">
                <Layers className="h-4 w-4 text-purple-400" />
                <span>3 Active Rulebooks</span>
              </div>
              <span className="font-mono text-purple-300 font-bold bg-purple-900/40 px-2 py-0.5 rounded">
                18 Total Rules
              </span>
            </div>

            {/* Key Capabilities */}
            <div className="space-y-2 mb-8">
              {[
                "Multi-rulebook management & activation",
                "Threshold adjustments (Claims, Jargon, Visuals)",
                "Content review queues & sign-off workflows",
                "Version-controlled guidelines",
              ].map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-purple-600/30 group-hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <span>Log In / Sign Up as Brand Mgr</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* CARD 3: ADMIN */}
        <motion.div
          whileHover={{ y: -8, rotateX: 2, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={() => openRoleModal("admin")}
          className="group relative rounded-3xl p-7 cursor-pointer overflow-hidden border border-emerald-500/30 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(16,185,129,0.15)] hover:shadow-[0_25px_60px_rgba(52,211,153,0.35)] hover:border-emerald-400/60 transition-all duration-300 flex flex-col justify-between"
          style={{ transformPerspective: 1000 }}
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-12 -top-12 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-bold text-emerald-300">
                  <Terminal className="h-3 w-3 text-emerald-400" />
                  Zero-Trust Governance
                </span>
              </div>
              <span className="text-xs font-mono font-medium text-slate-400 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Persona
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                <div className="h-full w-full rounded-2xl bg-slate-950/80 flex items-center justify-center backdrop-blur-sm">
                  <Shield className="h-7 w-7 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black text-white group-hover:text-emerald-300 transition-colors">
                  Compliance Admin
                </h2>
                <p className="text-xs text-slate-400 font-medium">Marcus Vance • Architecture & SecOps</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6 font-normal">
              Enterprise system compliance, database audit logs, cryptographic verification, and IAM permissions.
            </p>

            {/* Live Metrics Pill */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/30 p-3 mb-6 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-200">
                <Server className="h-4 w-4 text-emerald-400" />
                <span>Zero Data Retention (ZDR)</span>
              </div>
              <span className="font-mono text-emerald-300 font-bold bg-emerald-900/40 px-2 py-0.5 rounded">
                SOC2 Type II
              </span>
            </div>

            {/* Key Capabilities */}
            <div className="space-y-2 mb-8">
              {[
                "Multi-tenant brand segregation & encryption",
                "Live PostgreSQL / Supabase table inspector",
                "Immutable SHA-256 audit logging",
                "Zero Data Retention (ZDR) infrastructure",
              ].map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 group-hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <span>Log In / Sign Up as Admin</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>

      {/* Footer Navigation Bar */}
      <div className="mt-12 text-center z-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
        <button
          type="button"
          onClick={() => router.push("/dashboard/database")}
          className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 hover:text-blue-300 transition-colors"
        >
          <Database className="h-4 w-4 text-blue-400" />
          <span>Inspect Database Studio (All 9 Tables) &rarr;</span>
        </button>
      </div>

      {/* MODAL: ROLE AUTHENTICATION (LOGIN & SIGNUP) */}
      <AnimatePresence>
        {activeModalRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={closeModal}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Role Header */}
              <div className="flex items-center gap-3.5 mb-6">
                <div
                  className={`h-12 w-12 rounded-2xl flex items-center justify-center p-2.5 ${
                    activeModalRole === "creator"
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : activeModalRole === "brand-manager"
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  {activeModalRole === "creator" && <PenTool className="h-6 w-6" />}
                  {activeModalRole === "brand-manager" && <Sliders className="h-6 w-6" />}
                  {activeModalRole === "admin" && <Shield className="h-6 w-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Workspace Auth
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        activeModalRole === "creator"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          : activeModalRole === "brand-manager"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      }`}
                    >
                      {activeModalRole}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white capitalize">
                    {activeModalRole.replace("-", " ")} Portal
                  </h3>
                </div>
              </div>

              {/* Tab Selector: LOGIN vs SIGNUP */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setModalTab("signin");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                    modalTab === "signin"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalTab("signup");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                    modalTab === "signup"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Create New Account (Sign Up)
                </button>
              </div>

              {/* Status Alerts */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-200 text-xs flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{successMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* TAB 1: LOG IN */}
              {modalTab === "signin" ? (
                <div className="space-y-4">
                  {/* 1-Click Demo Shortcut */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-amber-400" />
                        Default Persona: {MOCK_USERS[activeModalRole].name}
                      </span>
                      <span className="text-[10px] text-slate-500">1-Click Access</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInstantDemo(activeModalRole)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
                        activeModalRole === "creator"
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25"
                          : activeModalRole === "brand-manager"
                          ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 shadow-purple-500/25"
                          : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/25"
                      }`}
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Instant 1-Click Launch as {activeModalRole.replace("-", " ")}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-800" />
                    <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase tracking-wider">
                      Or Sign In with Credentials
                    </span>
                    <div className="flex-grow border-t border-slate-800" />
                  </div>

                  <form onSubmit={handleSignIn} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Work Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                          type="email"
                          value={signInEmail}
                          onChange={(e) => setSignInEmail(e.target.value)}
                          required
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-medium text-slate-400">Password</label>
                        <span className="text-[11px] text-blue-400">Default: password123</span>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          required
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span>Sign In</span>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                /* TAB 2: SIGN UP */
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-200 flex items-center gap-2">
                    <Database className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>
                      Signing up as <strong>{activeModalRole}</strong>. New account will be hashed with bcrypt & saved to database.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        placeholder="e.g. Jordan Hayes"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Work Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="email"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        placeholder="jordan.hayes@company.com"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Company Name
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                          type="text"
                          value={signUpOrg}
                          onChange={(e) => setSignUpOrg(e.target.value)}
                          placeholder="Acme Corp"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Password (min 6)
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                          {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm"
                  >
                    {loading ? (
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Database className="h-4 w-4" />
                        <span>Create {activeModalRole.replace("-", " ")} Account & Save</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
