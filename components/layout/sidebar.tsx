"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  BrainCircuit,
  LayoutDashboard,
  Radio,
  ShieldCheck,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Incidents",
    href: "/incidents",
    icon: Radio,
  },
  {
    name: "AI System",
    href: "/about",
    icon: BrainCircuit,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-800 bg-slate-950 lg:flex">
      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex h-20 items-center gap-3 border-b border-slate-800 px-6"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>

        <div>
          <h1 className="font-bold text-white">EmergencyAI</h1>

          <p className="text-xs text-slate-500">Decision Support</p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
          Command Centre
        </p>

        {navigation.map((item) => {
          const Icon = item.icon;

          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/10"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-800 p-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>

            <span className="text-sm font-medium text-emerald-400">
              AI System
            </span>
          </div>

          <p className="mt-2 text-xs text-slate-500">Emergency Intelligence</p>
        </div>
      </div>
    </aside>
  );
}
