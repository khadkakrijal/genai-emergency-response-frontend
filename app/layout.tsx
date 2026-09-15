import type { Metadata } from "next";
import "./globals.css";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "EmergencyAI",
  description:
    "AI-assisted emergency response decision-support platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white antialiased">
        <Sidebar />

        <div className="min-h-screen lg:pl-64">
          <Topbar />

          <main className="min-h-[calc(100vh-5rem)]">
            {children}
          </main>
        </div>

        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}