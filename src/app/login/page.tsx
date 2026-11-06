"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
} from "lucide-react";

interface LoginFormInputs {
  email: string;
  password: string;
  rememberMe: boolean;
  securityPin?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { loginAs } = useAuthStore();
  const [activeModalRole, setActiveModalRole] = useState<UserRole | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>();

  const openRoleModal = (role: UserRole) => {
    setActiveModalRole(role);
    setValue("email", MOCK_USERS[role].email);
    setValue("password", "brandgov2026");
  };

  const closeModal = () => {
    setActiveModalRole(null);
  };

  const onSubmit = async (data: LoginFormInputs) => {
    if (!activeModalRole) return;
    try {
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password || "brandgov2026" }),
      });
    } catch {}
    loginAs(activeModalRole, data.email);
    router.push(`/dashboard/${activeModalRole}`);
  };

  const handleInstantDemoLogin = async (role: UserRole) => {
    try {
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: MOCK_USERS[role].email, password: "password123" }),
      });
    } catch {}
    loginAs(role);
    router.push(`/dashboard/${role}`);
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
          <span>Inkloom AI • Intelligent Brand Governance Portal</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
          Sign In to Your Workspace
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Prevent unverified claims, tone drift, and off-brand visuals before publishing.
          <br className="hidden sm:inline" />
          <span className="text-blue-400 font-medium"> Click your role card </span> to open its dedicated 3D authentication portal.
        </p>

        {/* Database Studio Link */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <Link
            href="/dashboard/database"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-cyan-500/40 bg-slate-900/90 hover:bg-slate-800 text-xs font-mono text-cyan-300 shadow-lg shadow-cyan-500/10 hover:border-cyan-400 transition-all group"
          >
            <Database className="h-4 w-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span className="font-semibold">Live Database Studio</span>
            <span className="text-[10px] text-slate-400">(9 Tables & Audit Logs)</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
          </Link>
        </div>
      </motion.div>

      {/* 3D Interactive Role Cards Grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 px-2">
        {/* CARD 1: CREATOR / WRITER */}
        <motion.div
          whileHover={{ y: -8, rotateX: 2, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={() => openRoleModal("creator")}
          className="group relative rounded-3xl p-7 cursor-pointer overflow-hidden border border-blue-500/30 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(8,112,184,0.15)] hover:shadow-[0_25px_60px_rgba(59,130,246,0.35)] hover:border-blue-400/60 transition-all duration-300 flex flex-col justify-between"
          style={{ transformPerspective: 1000 }}
        >
          {/* Glowing Top Edge Reflection */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/25 transition-all" />

          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 p-0.5 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <div className="h-full w-full rounded-2xl bg-slate-950/80 flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="h-7 w-7 text-cyan-400 group-hover:rotate-12 transition-transform" />
                </div>
              </div>
              <span className="rounded-full bg-blue-500/10 border border-blue-400/30 px-3 py-1 text-[11px] font-bold text-blue-300 uppercase tracking-wider">
                Option 1
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-white group-hover:text-cyan-300 transition-colors">
              Creator / Writer
            </h2>
            <p className="text-xs font-semibold text-blue-400/90 mt-0.5">
              Authoring & Pre-Publication Check
            </p>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Verify copy, blog posts, and campaign assets against brand tone, terminology, and legal claims with instant fix suggestions.
            </p>

            {/* 3D Floating Tags */}
            <div className="flex flex-wrap gap-1.5 mt-5">
              <span className="text-[10px] font-semibold bg-blue-950/80 border border-blue-800/60 text-cyan-300 px-2.5 py-1 rounded-lg">
                ✨ Tone Linting
              </span>
              <span className="text-[10px] font-semibold bg-blue-950/80 border border-blue-800/60 text-cyan-300 px-2.5 py-1 rounded-lg">
                📝 Auto-Diff Fix
              </span>
              <span className="text-[10px] font-semibold bg-blue-950/80 border border-blue-800/60 text-cyan-300 px-2.5 py-1 rounded-lg">
                📖 Brand Glossary
              </span>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
            <span>Open Creator Portal</span>
            <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:translate-x-1.5 transition-transform">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </motion.div>

        {/* CARD 2: BRAND MANAGER */}
        <motion.div
          whileHover={{ y: -8, rotateX: 2, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={() => openRoleModal("brand-manager")}
          className="group relative rounded-3xl p-7 cursor-pointer overflow-hidden border border-purple-500/30 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(147,51,234,0.15)] hover:shadow-[0_25px_60px_rgba(168,85,247,0.35)] hover:border-purple-400/60 transition-all duration-300 flex flex-col justify-between"
          style={{ transformPerspective: 1000 }}
        >
          {/* Glowing Top Edge Reflection */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/25 transition-all" />

          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-0.5 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                <div className="h-full w-full rounded-2xl bg-slate-950/80 flex items-center justify-center backdrop-blur-sm">
                  <Layers className="h-7 w-7 text-purple-400 group-hover:rotate-12 transition-transform" />
                </div>
              </div>
              <span className="rounded-full bg-purple-500/10 border border-purple-400/30 px-3 py-1 text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                Option 2
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-white group-hover:text-purple-300 transition-colors">
              Brand Manager
            </h2>
            <p className="text-xs font-semibold text-purple-400/90 mt-0.5">
              Governance Lead & Review Approvals
            </p>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Enforce corporate brand identity, approve or request revisions on pending content, and adjust tone of voice policies.
            </p>

            {/* 3D Floating Tags */}
            <div className="flex flex-wrap gap-1.5 mt-5">
              <span className="text-[10px] font-semibold bg-purple-950/80 border border-purple-800/60 text-purple-300 px-2.5 py-1 rounded-lg">
                🛡️ Review Pipeline
              </span>
              <span className="text-[10px] font-semibold bg-purple-950/80 border border-purple-800/60 text-purple-300 px-2.5 py-1 rounded-lg">
                🎚️ Voice Sliders
              </span>
              <span className="text-[10px] font-semibold bg-purple-950/80 border border-purple-800/60 text-purple-300 px-2.5 py-1 rounded-lg">
                📊 Hotspot Insights
              </span>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-purple-400 group-hover:text-purple-300">
            <span>Open Manager Portal</span>
            <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:translate-x-1.5 transition-transform">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </motion.div>

        {/* CARD 3: ADMINISTRATOR */}
        <motion.div
          whileHover={{ y: -8, rotateX: 2, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={() => openRoleModal("admin")}
          className="group relative rounded-3xl p-7 cursor-pointer overflow-hidden border border-emerald-500/30 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(16,185,129,0.15)] hover:shadow-[0_25px_60px_rgba(16,185,129,0.35)] hover:border-emerald-400/60 transition-all duration-300 flex flex-col justify-between"
          style={{ transformPerspective: 1000 }}
        >
          {/* Glowing Top Edge Reflection */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/25 transition-all" />

          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-0.5 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                <div className="h-full w-full rounded-2xl bg-slate-950/80 flex items-center justify-center backdrop-blur-sm">
                  <Sliders className="h-7 w-7 text-emerald-400 group-hover:rotate-12 transition-transform" />
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-400/30 px-3 py-1 text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                Option 3
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-white group-hover:text-emerald-300 transition-colors">
              Administrator
            </h2>
            <p className="text-xs font-semibold text-emerald-400/90 mt-0.5">
              System Architecture & Compliance
            </p>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Configure RBAC permissions, AI model and OCR thresholds, confidentiality redaction, and cryptographic audit logs.
            </p>

            {/* 3D Floating Tags */}
            <div className="flex flex-wrap gap-1.5 mt-5">
              <span className="text-[10px] font-semibold bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 px-2.5 py-1 rounded-lg">
                👥 RBAC Roles
              </span>
              <span className="text-[10px] font-semibold bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 px-2.5 py-1 rounded-lg">
                🤖 AI & OCR Engine
              </span>
              <span className="text-[10px] font-semibold bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 px-2.5 py-1 rounded-lg">
                🔒 Zero-Leakage
              </span>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
            <span>Open Admin Portal</span>
            <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:translate-x-1.5 transition-transform">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Branding Info */}
      <div className="mt-12 text-center text-xs text-slate-500 flex items-center gap-4 relative z-10">
        <span>Inkloom AI BrandGov™ v2.4</span>
        <span>•</span>
        <span>SOC2 Type II Certified</span>
        <span>•</span>
        <span>Zero-Retention Confidentiality Guaranteed</span>
      </div>

      {/* ========================================================================= */}
      {/* 3D ROLE-SPECIFIC LOGIN POPUP MODALS (UNIQUE FOR EACH ROLE)                 */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeModalRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* POPUP 1: CREATOR / WRITER MODAL */}
            {activeModalRole === "creator" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30, rotateX: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20, rotateX: -10 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="relative w-full max-w-lg rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-[0_25px_80px_rgba(6,182,212,0.3)] z-10 overflow-hidden"
                style={{ transformPerspective: 1200 }}
              >
                {/* 3D Ambient Top Glow */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500" />
                <div className="absolute -right-16 -top-16 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

                {/* Close Button */}
                <button
                  onClick={closeModal}
                  className="absolute top-5 right-5 h-9 w-9 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Unique Role Header */}
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-cyan-500/30">
                    <div className="h-full w-full rounded-2xl bg-slate-950 flex items-center justify-center">
                      <Sparkles className="h-7 w-7 text-cyan-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                        Creator Studio
                      </span>
                      <span className="text-xs text-slate-400">Writer Portal</span>
                    </div>
                    <h3 className="text-xl font-black text-white mt-0.5">
                      Welcome, Alex Morgan
                    </h3>
                  </div>
                </div>

                {/* Unique Creator Feature Badge */}
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/30 p-3.5 mb-6 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-cyan-200">
                    <Wand2 className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                    <span>Real-Time Tone & Claim Guard Active</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-cyan-400 bg-cyan-900/50 px-2 py-0.5 rounded">
                    94.2% SCORE
                  </span>
                </div>

                {/* Credentials Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Author / Agency Email
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        defaultValue={MOCK_USERS.creator.email}
                        {...register("email", { required: true })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-10 pr-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Workspace Passkey
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type="password"
                        defaultValue="password123"
                        {...register("password", { required: true })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-10 pr-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>
                  </div>

                  {/* 1-Click Instant Creator Launch Button */}
                  <button
                    type="button"
                    onClick={() => handleInstantDemoLogin("creator")}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 py-3 px-4 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-[0.99] transition-all"
                  >
                    <Zap className="h-4 w-4 fill-current" />
                    <span>Instant 1-Click Launch as Creator</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full text-center text-xs text-slate-400 hover:text-cyan-300 py-1 transition-colors"
                  >
                    Authenticate with custom credentials →
                  </button>
                </form>
              </motion.div>
            )}

            {/* POPUP 2: BRAND MANAGER MODAL */}
            {activeModalRole === "brand-manager" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30, rotateX: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20, rotateX: -10 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="relative w-full max-w-lg rounded-3xl border border-purple-500/40 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-[0_25px_80px_rgba(168,85,247,0.3)] z-10 overflow-hidden"
                style={{ transformPerspective: 1200 }}
              >
                {/* 3D Ambient Top Glow */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-purple-500 via-pink-400 to-indigo-500" />
                <div className="absolute -right-16 -top-16 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

                {/* Close Button */}
                <button
                  onClick={closeModal}
                  className="absolute top-5 right-5 h-9 w-9 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Unique Role Header */}
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5 shadow-lg shadow-purple-500/30">
                    <div className="h-full w-full rounded-2xl bg-slate-950 flex items-center justify-center">
                      <Layers className="h-7 w-7 text-purple-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full">
                        Executive Suite
                      </span>
                      <span className="text-xs text-slate-400">Reviewer Console</span>
                    </div>
                    <h3 className="text-xl font-black text-white mt-0.5">
                      Welcome, Sarah Chen
                    </h3>
                  </div>
                </div>

                {/* Unique Manager Feature Badge */}
                <div className="rounded-2xl border border-purple-500/20 bg-purple-950/30 p-3.5 mb-6 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-purple-200">
                    <Scale className="h-4 w-4 text-purple-400 flex-shrink-0" />
                    <span>3 Submissions Awaiting Final Sign-Off</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                    1 CRITICAL
                  </span>
                </div>

                {/* Credentials Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Manager Enterprise ID
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        defaultValue={MOCK_USERS["brand-manager"].email}
                        {...register("email", { required: true })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-10 pr-4 py-2.5 text-sm text-white focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Governance Master Key
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                        <Key className="h-4 w-4" />
                      </div>
                      <input
                        type="password"
                        defaultValue="password123"
                        {...register("password", { required: true })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-10 pr-4 py-2.5 text-sm text-white focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                      />
                    </div>
                  </div>

                  {/* 1-Click Instant Manager Launch Button */}
                  <button
                    type="button"
                    onClick={() => handleInstantDemoLogin("brand-manager")}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500 py-3 px-4 text-sm font-bold text-white shadow-lg shadow-purple-500/25 hover:brightness-110 active:scale-[0.99] transition-all"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Instant 1-Click Launch as Brand Manager</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full text-center text-xs text-slate-400 hover:text-purple-300 py-1 transition-colors"
                  >
                    Authenticate with manager credentials →
                  </button>
                </form>
              </motion.div>
            )}

            {/* POPUP 3: ADMINISTRATOR MODAL */}
            {activeModalRole === "admin" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30, rotateX: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20, rotateX: -10 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="relative w-full max-w-lg rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-[0_25px_80px_rgba(16,185,129,0.3)] z-10 overflow-hidden font-mono"
                style={{ transformPerspective: 1200 }}
              >
                {/* 3D Ambient Top Glow */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />
                <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

                {/* Close Button */}
                <button
                  onClick={closeModal}
                  className="absolute top-5 right-5 h-9 w-9 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Unique Role Header */}
                <div className="flex items-center gap-3.5 mb-6 font-sans">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/30">
                    <div className="h-full w-full rounded-2xl bg-slate-950 flex items-center justify-center">
                      <Terminal className="h-7 w-7 text-emerald-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                        Root Access
                      </span>
                      <span className="text-xs text-slate-400">Security Gateway</span>
                    </div>
                    <h3 className="text-xl font-black text-white mt-0.5">
                      Marcus Vance • SecOps
                    </h3>
                  </div>
                </div>

                {/* Unique Admin Feature Badge */}
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/30 p-3.5 mb-6 flex items-center justify-between text-xs font-sans">
                  <div className="flex items-center gap-2.5 text-emerald-200">
                    <Server className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>Zero-Trust Gateway: Node 01 Connected</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-900/50 px-2 py-0.5 rounded flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    ENCRYPTED
                  </span>
                </div>

                {/* Credentials Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-sans">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Root Admin Credentials
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        defaultValue={MOCK_USERS.admin.email}
                        {...register("email", { required: true })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-10 pr-4 py-2.5 text-sm text-white focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Cryptographic Hardware Token / PIN
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                        <Fingerprint className="h-4 w-4" />
                      </div>
                      <input
                        type="password"
                        defaultValue="982104"
                        {...register("password", { required: true })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-10 pr-4 py-2.5 text-sm text-white focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 font-mono tracking-widest"
                      />
                    </div>
                  </div>

                  {/* 1-Click Instant Admin Launch Button */}
                  <button
                    type="button"
                    onClick={() => handleInstantDemoLogin("admin")}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 py-3 px-4 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/25 hover:brightness-110 active:scale-[0.99] transition-all font-sans"
                  >
                    <Sliders className="h-4 w-4" />
                    <span>Instant 1-Click Launch as Administrator</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full text-center text-xs text-slate-400 hover:text-emerald-300 py-1 transition-colors font-mono"
                  >
                    Authenticate with terminal credentials →
                  </button>
                </form>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
