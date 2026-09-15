"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import Link from "next/link";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  History,
  Loader2,
  MapPin,
  Pencil,
  RefreshCw,
  Send,
  ShieldAlert,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { toast } from "sonner";

import {
  analyseIncident,
  deleteIncident,
  getIncidents,
  reanalyseIncident,
} from "@/lib/api";

import type {
  AnalysisResult,
  Incident,
  IncidentInput,
} from "@/lib/types";

import IncidentMap from "@/components/incidents/incident-map";

export default function IncidentsPage() {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [mappedLocation, setMappedLocation] = useState("");

  const [incidentTime, setIncidentTime] = useState("");
  const [peopleInvolved, setPeopleInvolved] = useState("");
  const [weaponInvolved, setWeaponInvolved] = useState("");
  const [injuryReported, setInjuryReported] = useState("");
  const [locationType, setLocationType] = useState("");

  const [result, setResult] = useState<AnalysisResult | null>(null);

  const [incidents, setIncidents] = useState<Incident[]>([]);

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [editingIncident, setEditingIncident] =
    useState<Incident | null>(null);

  const [deletingIncident, setDeletingIncident] =
    useState<Incident | null>(null);

  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* LOAD INCIDENTS                                                           */
  /* ------------------------------------------------------------------------ */

  async function loadIncidents() {
    setHistoryLoading(true);

    try {
      const data = await getIncidents();
      setIncidents(data);
    } catch (error) {
      console.error("Failed to load incidents:", error);
      toast.error("Unable to load incident history.");
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    void loadIncidents();
  }, []);

  /* ------------------------------------------------------------------------ */
  /* EDIT INCIDENT                                                            */
  /* ------------------------------------------------------------------------ */

  function handleEdit(incident: Incident) {
    setEditingIncident(incident);

    setDescription(incident.description || "");
    setLocation(incident.location || "");
    setMappedLocation(incident.location || "");

    setIncidentTime(
      formatDateTimeLocal(incident.incident_time),
    );

    setPeopleInvolved(incident.people_involved || "");
    setWeaponInvolved(incident.weapon_involved || "");
    setInjuryReported(incident.injury_reported || "");
    setLocationType(incident.location_type || "");

    setResult(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    toast.info("Incident loaded for editing.");
  }

  function cancelEdit() {
    setEditingIncident(null);

    setDescription("");
    setLocation("");
    setMappedLocation("");
    setIncidentTime("");
    setPeopleInvolved("");
    setWeaponInvolved("");
    setInjuryReported("");
    setLocationType("");

    toast.info("Edit cancelled.");
  }

  /* ------------------------------------------------------------------------ */
  /* CREATE / REANALYSE                                                       */
  /* ------------------------------------------------------------------------ */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!description.trim()) {
      toast.error("Please enter an incident description.");
      return;
    }

    setLoading(true);
    setResult(null);

    const submittedLocation = location.trim();

    if (submittedLocation) {
      setMappedLocation(submittedLocation);
    }

    const payload: IncidentInput = {
      description: description.trim(),
      location: submittedLocation || null,
      incident_time: incidentTime || null,
      people_involved: peopleInvolved.trim() || null,
      weapon_involved: weaponInvolved.trim() || null,
      injury_reported: injuryReported || null,
      location_type: locationType.trim() || null,
    };

    try {
      let analysis: AnalysisResult;

      if (editingIncident) {
        analysis = await reanalyseIncident(
          editingIncident.id,
          payload,
        );

        toast.success(
          "Incident updated and reanalysed successfully.",
        );

        setEditingIncident(null);
      } else {
        analysis = await analyseIncident(payload);

        toast.success("Emergency analysis completed.");
      }

      setResult(analysis);

      setDescription("");
      setLocation("");
      setIncidentTime("");
      setPeopleInvolved("");
      setWeaponInvolved("");
      setInjuryReported("");
      setLocationType("");

      await loadIncidents();

      setTimeout(() => {
        document
          .getElementById("analysis-result")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    } catch (error) {
      console.error("Analysis failed:", error);

      toast.error(
        editingIncident
          ? "Unable to update and reanalyse the incident."
          : "Unable to analyse the incident. Please check the AI server.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* DELETE INCIDENT                                                          */
  /* ------------------------------------------------------------------------ */

  async function handleDelete() {
    if (!deletingIncident) {
      return;
    }

    try {
      setDeleteLoading(true);

      await deleteIncident(deletingIncident.id);

      setIncidents((current) =>
        current.filter(
          (incident) =>
            incident.id !== deletingIncident.id,
        ),
      );

      if (editingIncident?.id === deletingIncident.id) {
        setEditingIncident(null);

        setDescription("");
        setLocation("");
        setMappedLocation("");
        setIncidentTime("");
        setPeopleInvolved("");
        setWeaponInvolved("");
        setInjuryReported("");
        setLocationType("");
      }

      toast.success("Incident deleted successfully.");

      setDeletingIncident(null);
    } catch (error) {
      console.error("Delete failed:", error);

      toast.error("Unable to delete incident.");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-10 p-6 lg:p-8">
      {/* ------------------------------------------------------------------ */}
      {/* PAGE HEADER                                                        */}
      {/* ------------------------------------------------------------------ */}

      <section>
        <div className="flex items-center gap-2 text-blue-400">
          <Activity className="h-4 w-4" />

          <span className="text-xs font-bold uppercase tracking-[0.2em]">
            Emergency Operations
          </span>
        </div>

        <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Incident Intelligence
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Submit emergency information for AI-assisted analysis,
              historical incident retrieval and first responder decision
              support.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

            <span className="text-xs font-semibold text-emerald-400">
              ANALYSIS READY
            </span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* INCIDENT FORM                                                      */}
      {/* ------------------------------------------------------------------ */}

      <section>
        <form
          onSubmit={handleSubmit}
          className={`mx-auto max-w-5xl overflow-hidden rounded-2xl border bg-slate-900/60 shadow-2xl shadow-black/10 ${
            editingIncident
              ? "border-amber-500/30"
              : "border-slate-800"
          }`}
        >
          {/* FORM HEADER */}

          <div className="border-b border-slate-800 px-6 py-5 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    editingIncident
                      ? "bg-amber-500/10"
                      : "bg-blue-500/10"
                  }`}
                >
                  {editingIncident ? (
                    <Pencil className="h-5 w-5 text-amber-400" />
                  ) : (
                    <ShieldAlert className="h-5 w-5 text-blue-400" />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-white">
                      {editingIncident
                        ? "Edit & Reanalyse Incident"
                        : "New Emergency Incident"}
                    </h2>

                    {editingIncident && (
                      <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        Edit Mode
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    {editingIncident
                      ? "Update the incident information. The AI assessment will be generated again."
                      : "Enter the emergency information currently available."}
                  </p>
                </div>
              </div>

              {editingIncident && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={loading}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-slate-600 hover:text-white disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          {/* FORM CONTENT */}

          <div className="space-y-6 p-6 lg:p-8">
            {/* DESCRIPTION */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Incident Description
                <span className="ml-1 text-red-400">*</span>
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                rows={6}
                required
                placeholder="Example: A man is threatening a woman with a knife near a shopping centre in Nightcliff..."
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />

              <p className="mt-2 text-xs text-slate-600">
                Provide as much verified information as currently
                available.
              </p>
            </div>

            {/* LOCATION + TIME */}

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Location"
                icon={<MapPin className="h-4 w-4" />}
              >
                <input
                  value={location}
                  onChange={(event) => {
                    const value = event.target.value;

                    setLocation(value);
                    setMappedLocation(value);
                  }}
                  placeholder="e.g. Nightcliff Shopping Centre, Darwin"
                  className={inputClass}
                />

                <p className="mt-2 text-xs text-slate-600">
                  The map will automatically locate the reported place
                  or address.
                </p>
              </Field>

              <Field
                label="Incident Time"
                icon={<Clock3 className="h-4 w-4" />}
              >
                <input
                  type="datetime-local"
                  value={incidentTime}
                  onChange={(event) =>
                    setIncidentTime(event.target.value)
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            {/* PEOPLE + LOCATION TYPE */}

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="People Involved"
                icon={<UserRound className="h-4 w-4" />}
              >
                <input
                  value={peopleInvolved}
                  onChange={(event) =>
                    setPeopleInvolved(event.target.value)
                  }
                  placeholder="e.g. 2 people"
                  className={inputClass}
                />
              </Field>

              <Field
                label="Location Type"
                icon={<MapPin className="h-4 w-4" />}
              >
                <input
                  value={locationType}
                  onChange={(event) =>
                    setLocationType(event.target.value)
                  }
                  placeholder="e.g. Shopping centre"
                  className={inputClass}
                />
              </Field>
            </div>

            {/* WEAPON + INJURY */}

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Weapon Involved"
                icon={<AlertTriangle className="h-4 w-4" />}
              >
                <input
                  value={weaponInvolved}
                  onChange={(event) =>
                    setWeaponInvolved(event.target.value)
                  }
                  placeholder="e.g. Knife / None / Unknown"
                  className={inputClass}
                />
              </Field>

              <Field
                label="Injury Reported"
                icon={<AlertTriangle className="h-4 w-4" />}
              >
                <select
                  value={injuryReported}
                  onChange={(event) =>
                    setInjuryReported(event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">
                    Unknown / Not provided
                  </option>

                  <option value="Yes">Yes</option>

                  <option value="No">No</option>
                </select>
              </Field>
            </div>

            {/* SUBMIT BUTTON */}

            <div className="border-t border-slate-800 pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm font-semibold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  editingIncident
                    ? "bg-amber-600 shadow-amber-600/20 hover:bg-amber-500"
                    : "bg-blue-600 shadow-blue-600/20 hover:bg-blue-500"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />

                    {editingIncident
                      ? "Reanalysing Incident..."
                      : "Analysing Emergency..."}
                  </>
                ) : (
                  <>
                    {editingIncident
                      ? "Update & Reanalyse"
                      : "Analyse Emergency"}

                    {editingIncident ? (
                      <BrainCircuit className="h-4 w-4" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-xs text-slate-600">
                {editingIncident
                  ? "Updating this incident will generate a new AI assessment for the modified information."
                  : "AI-generated information is intended to support, not replace, human decision-making."}
              </p>
            </div>
          </div>
        </form>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* AUTOMATIC INCIDENT MAP                                             */}
      {/* ------------------------------------------------------------------ */}

      <section className="mx-auto max-w-5xl">
        <IncidentMap location={mappedLocation} />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* AI ANALYSIS RESULT                                                 */}
      {/* ------------------------------------------------------------------ */}

      {result && (
        <section
          id="analysis-result"
          className="scroll-mt-28 space-y-6"
        >
          {/* RESULT HEADER */}

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
                Analysis Complete
              </p>

              <h2 className="mt-1 text-2xl font-bold text-white">
                AI Situational Assessment
              </h2>
            </div>
          </div>

          {/* SUMMARY STATS */}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ResultStat
              label="Incident Type"
              value={result.incident_type}
            />

            <ResultStat
              label="Risk Level"
              value={result.risk_level}
              highlight={getRiskStyle(result.risk_level)}
            />

            <ResultStat
              label="Priority"
              value={result.priority}
              highlight={getPriorityStyle(result.priority)}
            />

            <ResultStat
              label="Confidence"
              value={`${Math.round(
                result.confidence_score * 100,
              )}%`}
              highlight="text-blue-400"
            />
          </div>

          {/* CONFIDENCE */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white">
                  AI Confidence
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Confidence reported by the analysis pipeline
                </p>
              </div>

              <span className="text-2xl font-bold text-blue-400">
                {Math.round(result.confidence_score * 100)}%
              </span>
            </div>

            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-700"
                style={{
                  width: `${Math.min(
                    Math.max(
                      result.confidence_score * 100,
                      0,
                    ),
                    100,
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* SUMMARY + RESPONSE */}

          <div className="grid gap-6 xl:grid-cols-2">
            <ResultPanel
              title="Situational Summary"
              icon={<BrainCircuit className="h-5 w-5" />}
            >
              <p className="text-sm leading-7 text-slate-300">
                {result.summary ||
                  "No situational summary was returned."}
              </p>
            </ResultPanel>

            <ResultPanel
              title="Recommended Response"
              icon={<ShieldAlert className="h-5 w-5" />}
            >
              <p className="text-sm leading-7 text-slate-300">
                {result.recommended_response ||
                  "No recommended response was returned."}
              </p>
            </ResultPanel>
          </div>

          {/* RESPONDERS + RISKS */}

          <div className="grid gap-6 xl:grid-cols-2">
            <ResultPanel title="Recommended Responders">
              {result.responders?.length ? (
                <div className="flex flex-wrap gap-2">
                  {result.responders.map(
                    (responder, index) => (
                      <span
                        key={`${responder}-${index}`}
                        className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-300"
                      >
                        {responder}
                      </span>
                    ),
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No responder recommendation returned.
                </p>
              )}
            </ResultPanel>

            <ResultPanel title="Key Risks">
              {result.key_risks?.length ? (
                <div className="space-y-3">
                  {result.key_risks.map((risk, index) => (
                    <div
                      key={`${risk}-${index}`}
                      className="flex gap-2 text-sm text-slate-300"
                    >
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />

                      <span>{risk}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No key risks returned.
                </p>
              )}
            </ResultPanel>
          </div>

          {/* REASONING */}

          <ResultPanel
            title="AI Reasoning"
            icon={<BrainCircuit className="h-5 w-5" />}
          >
            <p className="text-sm leading-7 text-slate-400">
              {result.reasoning ||
                "No reasoning information was returned."}
            </p>
          </ResultPanel>

          {/* SIMILAR INCIDENTS */}

          <ResultPanel
            title="Similar Historical Incidents"
            icon={<History className="h-5 w-5" />}
          >
            {result.similar_incidents?.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {result.similar_incidents.map(
                  (incident, index) => {
                    const similarity = Math.round(
                      incident.similarity_score * 100,
                    );

                    return (
                      <div
                        key={`${incident.title}-${index}`}
                        className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 transition hover:border-slate-700"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-slate-200">
                              {incident.title ||
                                "Historical Incident"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {incident.incident_type ||
                                "Unclassified"}
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            <span className="rounded-lg bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-400">
                              {similarity}%
                            </span>

                            <p className="mt-2 text-[10px] uppercase tracking-wider text-slate-600">
                              Similarity
                            </p>
                          </div>
                        </div>

                        <p className="mt-4 line-clamp-3 text-xs leading-5 text-slate-500">
                          {incident.description ||
                            "No description available."}
                        </p>

                        {incident.location && (
                          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-600">
                            <MapPin className="h-3.5 w-3.5" />

                            {incident.location}
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center">
                <History className="mx-auto h-6 w-6 text-slate-700" />

                <p className="mt-3 text-sm text-slate-500">
                  No similar historical incidents were returned.
                </p>
              </div>
            )}
          </ResultPanel>

          {/* PROCESSING TIME */}

          {result.processing_time_ms !== undefined && (
            <div className="flex justify-end">
              <span className="rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-500">
                Analysis completed in{" "}
                {result.processing_time_ms} ms
              </span>
            </div>
          )}
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* INCIDENT HISTORY                                                   */}
      {/* ------------------------------------------------------------------ */}

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <History className="h-5 w-5 text-blue-400" />
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Incident History
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Previously analysed emergency incidents
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadIncidents()}
            disabled={historyLoading}
            title="Refresh incidents"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-slate-400 transition hover:border-slate-700 hover:text-white disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                historyLoading ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>

        {historyLoading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-xl bg-slate-800/40"
              />
            ))}
          </div>
        ) : incidents.length === 0 ? (
          <div className="p-12 text-center">
            <History className="mx-auto h-9 w-9 text-slate-700" />

            <p className="mt-3 text-sm font-medium text-slate-400">
              No previous incidents
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Analysed incidents will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {incidents.map((incident) => (
              <HistoryRow
                key={incident.id}
                incident={incident}
                onEdit={handleEdit}
                onDelete={setDeletingIncident}
              />
            ))}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* DELETE CONFIRMATION MODAL                                          */}
      {/* ------------------------------------------------------------------ */}

      {deletingIncident && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!deleteLoading) {
              setDeletingIncident(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-incident-title"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>

              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeletingIncident(null)}
                title="Close"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h2
              id="delete-incident-title"
              className="mt-5 text-lg font-semibold text-white"
            >
              Delete Incident?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              This will permanently delete this incident and its saved
              AI assessment. This action cannot be undone.
            </p>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-200">
                  {deletingIncident.incident_type ||
                    "Unclassified Incident"}
                </span>

                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${getRiskBadge(
                    deletingIncident.risk_level,
                  )}`}
                >
                  {deletingIncident.risk_level || "Unknown"}
                </span>
              </div>

              <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                {deletingIncident.description}
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeletingIncident(null)}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => void handleDelete()}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Incident
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* FORM HELPERS                                                               */
/* -------------------------------------------------------------------------- */

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
        {icon && (
          <span className="text-slate-500">{icon}</span>
        )}

        {label}
      </label>

      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* RESULT HELPERS                                                             */
/* -------------------------------------------------------------------------- */

function ResultStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p
        className={`mt-3 text-xl font-bold ${
          highlight || "text-white"
        }`}
      >
        {value || "Unknown"}
      </p>
    </div>
  );
}

function ResultPanel({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="mb-4 flex items-center gap-2">
        {icon && (
          <span className="text-blue-400">{icon}</span>
        )}

        <h3 className="font-semibold text-white">
          {title}
        </h3>
      </div>

      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* HISTORY ROW                                                                */
/* -------------------------------------------------------------------------- */

function HistoryRow({
  incident,
  onEdit,
  onDelete,
}: {
  incident: Incident;
  onEdit: (incident: Incident) => void;
  onDelete: (incident: Incident) => void;
}) {
  return (
    <div className="group px-6 py-5 transition hover:bg-slate-800/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* INCIDENT DETAILS */}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-slate-200">
              {incident.incident_type ||
                "Unclassified Incident"}
            </p>

            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${getRiskBadge(
                incident.risk_level,
              )}`}
            >
              {incident.risk_level || "Unknown"}
            </span>
          </div>

          <p className="mt-2 line-clamp-2 max-w-4xl text-sm leading-6 text-slate-500">
            {incident.description}
          </p>

          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />

              {incident.location ||
                "Location unavailable"}
            </span>

            <span className="flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" />

              {formatDate(incident.created_at)}
            </span>
          </div>
        </div>

        {/* ACTIONS */}

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link
            href={`/incidents/${incident.id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3.5 py-2 text-xs font-semibold text-blue-400 transition hover:border-blue-500/40 hover:bg-blue-500/15 hover:text-blue-300"
          >
            View Details
            <ArrowRight className="h-4 w-4" />
          </Link>

          <button
            type="button"
            onClick={() => onEdit(incident)}
            className="inline-flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-400 transition hover:border-amber-500/40 hover:bg-amber-500/15 hover:text-amber-300"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit & Reanalyse
          </button>

          <button
            type="button"
            onClick={() => onDelete(incident)}
            className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-400 transition hover:border-red-500/40 hover:bg-red-500/15 hover:text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */

function getRiskStyle(risk: string) {
  switch (risk?.toLowerCase()) {
    case "high":
      return "text-red-400";

    case "medium":
      return "text-amber-400";

    case "low":
      return "text-emerald-400";

    default:
      return "text-slate-300";
  }
}

function getPriorityStyle(priority: string) {
  switch (priority?.toLowerCase()) {
    case "high":
    case "critical":
      return "text-red-400";

    case "medium":
      return "text-amber-400";

    case "low":
      return "text-emerald-400";

    default:
      return "text-white";
  }
}

function getRiskBadge(risk: string | null) {
  switch (risk?.toLowerCase()) {
    case "high":
      return "border border-red-500/20 bg-red-500/10 text-red-400";

    case "medium":
      return "border border-amber-500/20 bg-amber-500/10 text-amber-400";

    case "low":
      return "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400";

    default:
      return "border border-slate-700 bg-slate-800 text-slate-400";
  }
}

/* -------------------------------------------------------------------------- */
/* DATE HELPERS                                                               */
/* -------------------------------------------------------------------------- */

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "Unknown";
  }
}

function formatDateTimeLocal(
  value: string | null | undefined,
) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 16);
  }

  const pad = (number: number) =>
    String(number).padStart(2, "0");

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1,
  )}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}