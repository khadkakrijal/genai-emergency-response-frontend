import Link from "next/link";
import {
  Activity,
  Clock3,
  MapPin,
} from "lucide-react";

import type { Incident } from "@/lib/types";

export default function RecentIncidents({
  incidents,
}: {
  incidents: Incident[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
      <div className="border-b border-slate-800 px-6 py-5">
        <h2 className="font-semibold">
          Recent Incidents
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Latest AI-analysed emergency reports
        </p>
      </div>

      {incidents.length === 0 ? (
        <div className="p-10 text-center">
          <Activity className="mx-auto h-8 w-8 text-slate-700" />

          <p className="mt-3 text-sm text-slate-500">
            No incidents analysed yet.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800">
          {incidents.slice(0, 5).map((incident) => (
            <IncidentRow
              key={incident.id}
              incident={incident}
            />
          ))}
        </div>
      )}

      <div className="border-t border-slate-800 p-4 text-center">
        <Link
          href="/incidents"
          className="text-sm font-medium text-blue-400 hover:text-blue-300"
        >
          View all incidents →
        </Link>
      </div>
    </div>
  );
}

function IncidentRow({
  incident,
}: {
  incident: Incident;
}) {
  const risk = incident.risk_level?.toLowerCase();

  const riskStyle =
    risk === "high"
      ? "bg-red-500/10 text-red-400"
      : risk === "medium"
        ? "bg-amber-500/10 text-amber-400"
        : "bg-emerald-500/10 text-emerald-400";

  return (
    <div className="flex gap-4 px-6 py-5 hover:bg-slate-800/30">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800">
        <MapPin className="h-4 w-4 text-blue-400" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">
            {incident.incident_type ||
              "Unknown Incident"}
          </p>

          <span
            className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${riskStyle}`}
          >
            {incident.risk_level || "Unknown"}
          </span>
        </div>

        <p className="mt-1 line-clamp-1 text-sm text-slate-500">
          {incident.description}
        </p>

        <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {incident.location || "No location"}
          </span>

          <span className="flex items-center gap-1">
            <Clock3 className="h-3 w-3" />
            {formatDate(incident.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en-AU", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "Unknown";
  }
}