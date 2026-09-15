"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  Plus,
  Radio,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import StatCard from "@/components/dashboard/stat-card";
import RiskChart from "@/components/dashboard/risk-chart";
import RecentIncidents from "@/components/dashboard/recent-incidents";
import Pipeline from "@/components/dashboard/pipeline";

import {
  checkServerHealth,
  getIncidents,
} from "@/lib/api";

import type {
  Incident,
  ServerStatus,
} from "@/lib/types";

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>(
    []
  );

  const [loading, setLoading] = useState(true);

  const [serverStatus, setServerStatus] =
    useState<ServerStatus>("starting");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const online = await checkServerHealth();

        if (!online) {
          setServerStatus("offline");
          return;
        }

        setServerStatus("online");

        const data = await getIncidents();
        setIncidents(data);
      } catch (error) {
        console.error(error);
        setServerStatus("offline");
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  const analytics = useMemo(() => {
    return {
      total: incidents.length,

      high: incidents.filter(
        (item) =>
          item.risk_level?.toLowerCase() === "high"
      ).length,

      medium: incidents.filter(
        (item) =>
          item.risk_level?.toLowerCase() === "medium"
      ).length,

      low: incidents.filter(
        (item) =>
          item.risk_level?.toLowerCase() === "low"
      ).length,
    };
  }, [incidents]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 p-6 lg:p-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-8">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-8 xl:flex-row xl:items-center">
          <div>
            <div className="flex items-center gap-2 text-blue-400">
              <BrainCircuit className="h-5 w-5" />

              <span className="text-xs font-bold uppercase tracking-[0.2em]">
                AI Emergency Command Centre
              </span>
            </div>

            <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight lg:text-4xl">
              Situational Intelligence for{" "}
              <span className="text-blue-400">
                Faster Emergency Response
              </span>
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-slate-400">
              Analyse emergency reports, retrieve similar
              historical incidents and generate structured
              AI-assisted decision support for first responders.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/incidents"
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
              >
                <Plus className="h-4 w-4" />
                Analyse New Incident
              </Link>

              <Link
                href="/incidents"
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-300"
              >
                View Incidents
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="min-w-[280px] rounded-2xl border border-slate-700 bg-slate-950/50 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              System Status
            </p>

            <div className="mt-4 flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  serverStatus === "online"
                    ? "bg-emerald-500/10"
                    : serverStatus === "starting"
                      ? "bg-amber-500/10"
                      : "bg-red-500/10"
                }`}
              >
                <Radio
                  className={
                    serverStatus === "online"
                      ? "text-emerald-400"
                      : serverStatus === "starting"
                        ? "text-amber-400"
                        : "text-red-400"
                  }
                />
              </div>

              <div>
                <p className="font-semibold">
                  {serverStatus === "online"
                    ? "AI Server Online"
                    : serverStatus === "starting"
                      ? "Connecting..."
                      : "Server Offline"}
                </p>

                <p className="text-xs text-slate-500">
                  FastAPI Intelligence Service
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Incidents"
          value={analytics.total}
          subtitle="Analysed incidents"
          icon={Activity}
          variant="blue"
        />

        <StatCard
          title="High Risk"
          value={analytics.high}
          subtitle="Priority attention"
          icon={ShieldAlert}
          variant="red"
        />

        <StatCard
          title="Medium Risk"
          value={analytics.medium}
          subtitle="Active monitoring"
          icon={AlertTriangle}
          variant="amber"
        />

        <StatCard
          title="Low Risk"
          value={analytics.low}
          subtitle="Lower priority"
          icon={ShieldCheck}
          variant="green"
        />
      </section>

      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
          Loading emergency intelligence...
        </div>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <RecentIncidents incidents={incidents} />

          <RiskChart
            high={analytics.high}
            medium={analytics.medium}
            low={analytics.low}
          />
        </section>
      )}

      <Pipeline />
    </div>
  );
}