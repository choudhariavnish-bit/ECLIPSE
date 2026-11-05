"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore, MOCK_USERS } from "@/stores/useAuthStore";
import { UserRole } from "@/types/auth";
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Building,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Database,
  PenTool,
  Sliders,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, register: registerUser, loginAs } = useAuthStore();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpOrgName, setSignUpOrgName] = useState("");
  const [signUpRole, setSignUpRole] = useState<UserRole>("creator");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!signInEmail || !signInPassword) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await login(signInEmail.trim(), signInPassword);
      if (res.success && res.user) {
        setSuccessMessage(`Welcome back, ${res.user.name}! Redirecting...`);
        setTimeout(() => {
          router.push(`/dashboard/${res.user?.role || "creator"}`);
        }, 600);
      } else {
        setErrorMessage(res.error || "Invalid email or password.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (signUpPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({
        name: signUpName.trim(),
        email: signUpEmail.trim(),
        password: signUpPassword,
        role: signUpRole,
        organizationName: signUpOrgName.trim() || "Inkloom Enterprise",
      });

      if (res.success && res.user) {
        setSuccessMessage(`Account created & saved to database! Redirecting to ${res.user.role} workspace...`);
        setTimeout(() => {
          router.push(`/dashboard/${res.user?.role || "creator"}`);
        }, 800);
      } else {
        setErrorMessage(res.error || "Registration failed.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemo = (role: UserRole) => {
    loginAs(role);
    router.push(`/dashboard/${role}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_55%)] pointer-events-none" />
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center z-10 mb-8 max-w-md w-full"
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/30 px-3.5 py-1 text-xs font-semibold text-blue-400 mb-4 backdrop-blur-md">
          <ShieldCheck className="h-4 w-4 text-blue-400" />
          <span>PostgreSQL & Supabase Connected</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2.5">
          <span>Inkloom</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            Governance
          </span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Enterprise AI brand safety, relational RBAC, and policy compliance
        </p>
      </motion.div>

      {/* Main Auth Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10"
      >
        {/* Mode Switcher Tabs */}
        <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              mode === "signin"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              mode === "signup"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Notifications */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-5 p-3.5 rounded-xl bg-red-950/50 border border-red-500/30 text-red-200 text-sm flex items-start gap-2.5"
            >
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-5 p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-200 text-sm flex items-start gap-2.5"
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SIGN IN FORM */}
        {mode === "signin" ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="alex.creator@inkloom.ai"
                  required
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <span className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">
                  Default: password123
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Governance Suite</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* SIGN UP FORM */
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
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
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
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
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Company / Organization
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={signUpOrgName}
                    onChange={(e) => setSignUpOrgName(e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Min. 6 chars"
                    required
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Select Your Governance Role
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  {
                    role: "creator" as UserRole,
                    title: "Creator",
                    desc: "Drafts & AI Check",
                    icon: PenTool,
                    accent: "border-blue-500/50 bg-blue-500/10 text-blue-300",
                  },
                  {
                    role: "brand-manager" as UserRole,
                    title: "Brand Mgr",
                    desc: "Reviews & Approvals",
                    icon: Sliders,
                    accent: "border-purple-500/50 bg-purple-500/10 text-purple-300",
                  },
                  {
                    role: "admin" as UserRole,
                    title: "Admin",
                    desc: "DB, Users & Logs",
                    icon: Shield,
                    accent: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = signUpRole === item.role;
                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => setSignUpRole(item.role)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? `${item.accent} ring-1 ring-white/20 shadow-lg`
                          : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <Icon className="h-4 w-4 mb-1.5" />
                      <div className="text-xs font-bold text-white">{item.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  <span>Create Account & Save to Database</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Instant Demo Personas Shortcut */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              Instant 1-Click Persona Access:
            </span>
            <span className="text-[11px] text-slate-500">No password needed</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleInstantDemo("creator")}
              className="py-2 px-2.5 rounded-lg bg-blue-950/40 border border-blue-500/20 hover:border-blue-500/50 text-blue-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <PenTool className="h-3 w-3" />
              <span>Alex (Creator)</span>
            </button>

            <button
              type="button"
              onClick={() => handleInstantDemo("brand-manager")}
              className="py-2 px-2.5 rounded-lg bg-purple-950/40 border border-purple-500/20 hover:border-purple-500/50 text-purple-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sliders className="h-3 w-3" />
              <span>Sarah (Brand)</span>
            </button>

            <button
              type="button"
              onClick={() => handleInstantDemo("admin")}
              className="py-2 px-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 hover:border-emerald-500/50 text-emerald-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Shield className="h-3 w-3" />
              <span>Marcus (Admin)</span>
            </button>
          </div>
        </div>

        {/* Database Studio Link */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => router.push("/dashboard/database")}
            className="text-xs text-slate-500 hover:text-slate-300 inline-flex items-center gap-1.5 transition-colors"
          >
            <Database className="h-3.5 w-3.5 text-blue-400" />
            <span>Inspect Live Database Tables (`users`, `organizations`) &rarr;</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
