import React from "react";
import "./globals.css";

export const metadata = {
  title: "ECLIPSE AI | Intelligent Brand Governance & Fact Verification Engine",
  description:
    "Pre-publication brand governance platform that reviews content against approved guidelines, facts, tone, and visual standards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      {children}
    </div>
  );
}

