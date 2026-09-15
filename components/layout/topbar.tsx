"use client";

import { Bell, Radio } from "lucide-react";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-800 bg-slate-950/90 px-6 backdrop-blur-xl lg:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
          Emergency Intelligence Platform
        </p>

        <p className="mt-1 text-sm text-slate-400">
          AI-Assisted First Responder Decision Support
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 sm:flex">
          <Radio className="h-4 w-4 text-emerald-400" />

          <span className="text-xs font-semibold text-emerald-400">
            SYSTEM LIVE
          </span>
        </div>
      </div>
    </header>
  );
}
