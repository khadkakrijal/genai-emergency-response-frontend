"use client";

import { use, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";

import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BrainCircuit,
  CalendarDays,
  Clock3,
  Loader2,
  MapPin,
  ShieldAlert,
  Sparkles,
  UserRound,
  Users,
  Zap,
} from "lucide-react";

import IncidentMap from "@/components/incidents/incident-map";
import { getIncident } from "@/lib/api";
import type { Incident } from "@/lib/types";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function IncidentDetailsPage({
  params,
}: PageProps) {
  const { id } = use(params);

  const [incident, setIncident] =
    useState<Incident | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadIncident() {
      try {
        setLoading(true);
        setError("");

        const data = await getIncident(id);

        setIncident(data);
      } catch (err) {
        console.error(
          "Failed to load incident:",
          err
        );

        setError(
          "Unable to load this incident."
        );
      } finally {
        setLoading(false);
      }
    }

    loadIncident();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-400" />

          <p className="mt-4 text-sm text-slate-400">
            Loading incident intelligence...
          </p>
        </div>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link
          href="/incidents"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Incidents
        </Link>

        <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-red-400" />

          <h2 className="mt-4 text-lg font-semibold text-white">
            Incident unavailable
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {error ||
              "The requested incident could not be found."}
          </p>
        </div>
      </div>
    );
  }

  const risk =
    incident.risk_level || "Uncertain";

  const confidence =
    formatConfidence(
      incident.confidence_score
    );

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      {/* BACK */}

      <Link
        href="/incidents"
        className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Incidents
      </Link>

      {/* HEADER */}

      <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
            <Activity className="h-4 w-4" />
            Incident Intelligence Record
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
            {incident.incident_type ||
              "Unclassified Incident"}
          </h1>

          <p className="mt-2 text-xs text-slate-500">
            Incident ID: {incident.id}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold ${getRiskStyle(
              risk
            )}`}
          >
            {risk} Risk
          </span>

          {incident.status && (
            <span className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400">
              {incident.status}
            </span>
          )}
        </div>
      </div>

      {/* TOP CARDS */}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {/* INCIDENT INFORMATION */}

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-blue-400" />

            <div>
              <h2 className="font-semibold text-white">
                Incident Information
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Original information supplied
                during incident analysis.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Reported Incident
            </p>

            <p className="mt-2 leading-7 text-slate-300">
              {incident.description}
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoItem
              icon={
                <MapPin className="h-4 w-4" />
              }
              label="Location"
              value={
                incident.location ||
                "Not provided"
              }
            />

            <InfoItem
              icon={
                <CalendarDays className="h-4 w-4" />
              }
              label="Created"
              value={formatDate(
                incident.created_at
              )}
            />

            <InfoItem
              icon={
                <Clock3 className="h-4 w-4" />
              }
              label="Incident Time"
              value={
                incident.incident_time ||
                "Not provided"
              }
            />

            <InfoItem
              icon={
                <UserRound className="h-4 w-4" />
              }
              label="People Involved"
              value={
                incident.people_involved ||
                "Not provided"
              }
            />

            <InfoItem
              icon={
                <AlertTriangle className="h-4 w-4" />
              }
              label="Weapon Involved"
              value={
                incident.weapon_involved ||
                "Not reported"
              }
            />

            <InfoItem
              icon={
                <Activity className="h-4 w-4" />
              }
              label="Injury Reported"
              value={
                incident.injury_reported ||
                "Not reported"
              }
            />
          </div>

          {incident.location_type && (
            <div className="mt-4">
              <InfoItem
                icon={
                  <MapPin className="h-4 w-4" />
                }
                label="Location Type"
                value={
                  incident.location_type
                }
              />
            </div>
          )}
        </section>

        {/* AI OVERVIEW */}

        <section className="rounded-2xl border border-blue-500/15 bg-gradient-to-br from-blue-500/10 via-slate-900/70 to-slate-900/60 p-6">
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-5 w-5 text-blue-400" />

            <div>
              <h2 className="font-semibold text-white">
                AI Assessment
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Structured decision-support
                assessment.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <AssessmentCard
              label="Risk Level"
              value={risk}
            />

            <AssessmentCard
              label="Confidence"
              value={confidence}
            />

            <AssessmentCard
              label="Priority"
              value={
                incident.priority ||
                "Not available"
              }
            />

            <AssessmentCard
              label="Processing Time"
              value={
                incident.processing_time_ms !=
                null
                  ? `${incident.processing_time_ms} ms`
                  : "Not available"
              }
            />
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Recommended Responders
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {incident.responders &&
              incident.responders.length >
                0 ? (
                incident.responders.map(
                  (responder) => (
                    <span
                      key={responder}
                      className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300"
                    >
                      <Users className="h-3.5 w-3.5" />
                      {responder}
                    </span>
                  )
                )
              ) : (
                <span className="text-sm text-slate-500">
                  No responders recorded.
                </span>
              )}
            </div>
          </div>

          {incident.ai_model && (
            <div className="mt-6 border-t border-slate-800 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                AI Provider / Model
              </p>

              <p className="mt-2 text-sm font-medium text-slate-300">
                {incident.ai_model}
              </p>
            </div>
          )}
        </section>
      </div>

      {/* AI INTELLIGENCE */}

      <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-cyan-400" />

          <div>
            <h2 className="font-semibold text-white">
              AI Situational Intelligence
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Summary, risks, recommended
              response and reasoning.
            </p>
          </div>
        </div>

        {/* SUMMARY */}

        <div className="mt-6">
          <SectionLabel>
            Situational Summary
          </SectionLabel>

          <p className="mt-3 leading-7 text-slate-300">
            {incident.summary ||
              "No summary recorded."}
          </p>
        </div>

        {/* KEY RISKS */}

        <div className="mt-6 border-t border-slate-800 pt-6">
          <SectionLabel>
            Key Risks
          </SectionLabel>

          {incident.key_risks &&
          incident.key_risks.length >
            0 ? (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {incident.key_risks.map(
                (riskItem, index) => (
                  <div
                    key={`${riskItem}-${index}`}
                    className="flex items-start gap-3 rounded-xl border border-red-500/10 bg-red-500/5 px-4 py-3"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />

                    <p className="text-sm leading-6 text-slate-300">
                      {riskItem}
                    </p>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              No key risks recorded.
            </p>
          )}
        </div>

        {/* RECOMMENDED RESPONSE */}

        <div className="mt-6 border-t border-slate-800 pt-6">
          <SectionLabel>
            Recommended Response
          </SectionLabel>

          <div className="mt-3 rounded-xl border border-blue-500/15 bg-blue-500/5 p-4">
            <div className="flex items-start gap-3">
              <Zap className="mt-1 h-4 w-4 shrink-0 text-blue-400" />

              <p className="leading-7 text-slate-300">
                {incident.recommended_response ||
                  "No recommended response recorded."}
              </p>
            </div>
          </div>
        </div>

        {/* REASONING */}

        <div className="mt-6 border-t border-slate-800 pt-6">
          <SectionLabel>
            AI Reasoning
          </SectionLabel>

          <p className="mt-3 leading-7 text-slate-300">
            {incident.reasoning ||
              "No reasoning recorded."}
          </p>
        </div>
      </section>

      {/* MAP */}

      <div
        id="incident-map"
        className="mt-6 scroll-mt-28"
      >
        <IncidentMap
          location={
            incident.location || ""
          }
        />
      </div>

      {/* HUMAN REVIEW */}

      <section className="mt-6 rounded-2xl border border-amber-500/15 bg-amber-500/5 px-6 py-5">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />

          <div>
            <h3 className="text-sm font-semibold text-white">
              Human Decision Support
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              This AI-generated assessment is
              intended to support situational
              awareness and decision-making.
              Operational emergency decisions
              should remain subject to appropriate
              human review.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}


/* ======================================================
   HELPER COMPONENTS
====================================================== */

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}

        <span className="text-xs font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="mt-2 break-words text-sm font-medium text-slate-300">
        {value}
      </p>
    </div>
  );
}


function AssessmentCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-semibold text-white">
        {value}
      </p>
    </div>
  );
}


function SectionLabel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
      {children}
    </p>
  );
}


/* ======================================================
   FORMATTING
====================================================== */

function getRiskStyle(
  risk: string
) {
  switch (risk.toLowerCase()) {
    case "critical":
    case "high":
      return "border-red-500/30 bg-red-500/10 text-red-400";

    case "medium":
      return "border-amber-500/30 bg-amber-500/10 text-amber-400";

    case "low":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";

    default:
      return "border-slate-700 bg-slate-800/70 text-slate-300";
  }
}


function formatConfidence(
  confidence: number | null
) {
  if (
    confidence === null ||
    confidence === undefined
  ) {
    return "Not available";
  }

  /*
   * Supports both:
   * 0.85 → 85%
   * 85   → 85%
   */
  const percentage =
    confidence <= 1
      ? confidence * 100
      : confidence;

  return `${Math.round(
    percentage
  )}%`;
}


function formatDate(
  date: string
) {
  if (!date) {
    return "Not available";
  }

  try {
    return new Intl.DateTimeFormat(
      "en-AU",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(
      new Date(date)
    );
  } catch {
    return date;
  }
}