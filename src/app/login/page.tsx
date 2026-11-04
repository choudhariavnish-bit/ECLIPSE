"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
  FileCheck2,
  Info,
} from "lucide-react";

interface LoginFormInputs {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface RoleOption {
  role: UserRole;
  title: string;
  tagline: string;
  description: string;
  icon: React.ElementType;
  accent: {
    border: string;
    bg: string;
    text: string;
    ring: string;
    badgeBg: string;
  };
  keyResponsibilities: string[];
  mockEmail: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: "creator",
    title: "1. Creator / Writer",
    tagline: "Content author & copywriter",
    description:
      "Draft and review copy, blog posts, or campaigns before publication. Check tone, terminology, and unsupported claims with AI-guided fixes.",
    icon: Sparkles,
    accent: {
      border: "border-blue-500",
      bg: "bg-blue-50/50",
      text: "text-blue-700",
      ring: "ring-blue-500",
      badgeBg: "bg-blue-100 text-blue-800",
    },
    keyResponsibilities: [
      "Run pre-publication brand checks",
      "Accept or reject AI tone & claim suggestions",
      "Browse approved brand terminology & facts",
    ],
    mockEmail: "alex.creator@inkloom.ai",
  },
  {
    role: "brand-manager",
    title: "2. Brand Manager",
    tagline: "Governance lead & reviewer",
    description:
      "Enforce company brand identity, manage the approval workflow, review flagged content, resolve tone drift, and update brand rules.",
    icon: Layers,
    accent: {
      border: "border-purple-500",
      bg: "bg-purple-50/50",
      text: "text-purple-700",
      ring: "ring-purple-500",
      badgeBg: "bg-purple-100 text-purple-800",
    },
    keyResponsibilities: [
      "Review & sign off on pending submissions",
      "Define approved facts, guidelines & prohibited terms",
      "Monitor department brand compliance scores",
    ],
    mockEmail: "sarah.brand@inkloom.ai",
  },
  {
    role: "admin",
    title: "3. Administrator",
    tagline: "System compliance & configuration",
    description:
      "Oversee enterprise brand-governance policies, manage user permissions (RBAC), monitor AI & OCR sensitivity, and protect confidential materials.",
    icon: Sliders,
    accent: {
      border: "border-emerald-500",
      bg: "bg-emerald-50/50",
      text: "text-emerald-700",
      ring: "ring-emerald-500",
      badgeBg: "bg-emerald-100 text-emerald-800",
    },
    keyResponsibilities: [
      "Manage role-based access control (RBAC)",
      "Configure AI governance guardrails & OCR pipeline",
      "Inspect immutable system audit trails & security",
    ],
    mockEmail: "marcus.admin@inkloom.ai",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { loginAs } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<UserRole>("creator");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      email: MOCK_USERS.creator.email,
      password: "password123",
      rememberMe: true,
    },
  });

  // When role changes, pre-fill sample email for convenience
  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setValue("email", MOCK_USERS[role].email);
  };

  const onSubmit = (data: LoginFormInputs) => {
    loginAs(selectedRole, data.email);
    router.push(`/dashboard/${selectedRole}`);
  };

  const handleQuickLogin = (role: UserRole) => {
    loginAs(role);
    router.push(`/dashboard/${role}`);
  };

  const currentOption = ROLE_OPTIONS.find((r) => r.role === selectedRole)!;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Platform Branding Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl text-center">
        <div className="inline-flex items-center gap-2.5 rounded-full bg-blue-50 border border-blue-200/80 px-4 py-1.5 text-xs font-semibold text-blue-700 shadow-sm mb-4">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          <span>Inkloom AI • Pre-Publication Brand Governance Platform</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Sign In to Your Governance Portal
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          Prevent brand inconsistency, factual errors, and tone drift before content goes live. Choose your access role to continue.
        </p>
      </div>

      {/* Main Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-5xl">
        {/* Step 1: 3 Role Options Card Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Your Access Persona (3 Dedicated Options)
            </span>
            <span className="text-xs text-slate-400">
              Click a card to switch active role
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ROLE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedRole === option.role;
              return (
                <div
                  key={option.role}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectRole(option.role)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleSelectRole(option.role);
                    }
                  }}
                  className={`relative flex flex-col justify-between rounded-2xl p-5 text-left border-2 transition-all duration-200 cursor-pointer bg-white shadow-sm hover:shadow-md ${
                    isSelected
                      ? `${option.accent.border} ${option.accent.bg} ring-2 ring-offset-2 ${option.accent.ring}`
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  aria-pressed={isSelected}
                >
                  {/* Selection indicator pill */}
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                        isSelected
                          ? "bg-white shadow-sm text-slate-900"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-900 shadow-sm border border-slate-200">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Selected
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                        Option {option.title.slice(0, 1)}
                      </span>
                    )}
                  </div>

                  {/* Role Title & Description */}
                  <div className="mt-4">
                    <h2 className="text-base font-bold text-slate-900">
                      {option.title}
                    </h2>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      {option.tagline}
                    </p>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {option.description}
                    </p>
                  </div>

                  {/* Highlights */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60 space-y-1.5">
                    {option.keyResponsibilities.map((resp, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-[11px] text-slate-600"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        <span>{resp}</span>
                      </div>
                    ))}
                  </div>

                  {/* Direct Instant Login Button for Evaluation */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickLogin(option.role);
                    }}
                    className="mt-5 w-full flex items-center justify-center gap-1.5 rounded-lg bg-white border border-slate-300 py-1.5 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 transition-colors shadow-xs"
                  >
                    <span>Instant Demo Login as {option.role}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Sign-in Form for the Selected Role */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-6 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Signing In As:
                </span>
                <span
                  className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold ${currentOption.accent.badgeBg}`}
                >
                  {currentOption.title}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                Enter Credentials for {currentOption.tagline}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
              <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span>Demo accounts are pre-configured with active workspaces</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Work Email Address
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Please enter a valid email",
                    },
                  })}
                  className="block w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Password
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className="block w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("rememberMe")}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-600">Remember this workstation</span>
              </label>
              <span className="text-blue-600 hover:underline cursor-pointer">
                Single Sign-On (SSO / Okta)
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-all"
            >
              <FileCheck2 className="h-4 w-4" />
              <span>Launch {currentOption.title} Dashboard</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </form>

          {/* Privacy & Brand Governance Notice */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Inkloom AI BrandGuard™ v2.4 • SOC2 Type II Certified</span>
            <span>Zero-Retention Policy for Confidential Brand Assets</span>
          </div>
        </div>
      </div>
    </div>
  );
}

