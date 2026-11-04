import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inkloom BrandGov | Intelligent Brand Governance Platform",
  description:
    "Pre-publication brand governance platform that reviews content against approved guidelines, facts, tone, and visual standards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
        {children}
      </body>
    </html>
  );
}

