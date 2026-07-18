"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://genai-emergency-response-api.onrender.com";

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 6,
  delayMilliseconds = 10000,
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        cache: "no-store",
      });

      if (response.ok) {
        return response;
      }

      lastError = new Error(`Request failed with status ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    if (attempt < retries) {
      await wait(delayMilliseconds);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Backend service is unavailable.");
}

const MapContainer = dynamic(
  () => import("react-leaflet").then((module) => module.MapContainer),
  { ssr: false },
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((module) => module.TileLayer),
  { ssr: false },
);

const Marker = dynamic(
  () => import("react-leaflet").then((module) => module.Marker),
  { ssr: false },
);

const Popup = dynamic(
  () => import("react-leaflet").then((module) => module.Popup),
  { ssr: false },
);

type ServerStatus = "starting" | "online" | "offline";

type SimilarIncident = {
  title: string;
  description: string;
  location: string;
  incident_type: string;
  priority_level: string | null;
  similarity_score: number;
};

type AnalysisResult = {
  incident_type: string;
  risk_level: string;
  confidence_score: number;
  priority: string;
  responders: string[];
  key_risks: string[];
  summary: string;
  recommended_response: string;
  reasoning: string;
  similar_incidents: SimilarIncident[];
  processing_time_ms?: number;
};

type Incident = {
  id: string;
  description: string;
  location: string | null;
  incident_time?: string | null;
  people_involved?: string | null;
  weapon_involved?: string | null;
  injury_reported?: string | null;
  location_type?: string | null;
  incident_type: string | null;
  risk_level: string | null;
  summary: string | null;
  recommended_response: string | null;
  created_at: string;
};

const suburbCoords: Record<string, [number, number]> = {
  nightcliff: [-12.381, 130.851],
  "coconut grove": [-12.397, 130.853],
  casuarina: [-12.374, 130.881],
  palmerston: [-12.486, 130.983],
  darwin: [-12.4634, 130.8456],
  "darwin city": [-12.4634, 130.8456],
};

export default function Home() {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [incidentTime, setIncidentTime] = useState("");
  const [peopleInvolved, setPeopleInvolved] = useState("");
  const [weaponInvolved, setWeaponInvolved] = useState("");
  const [injuryReported, setInjuryReported] = useState("");
  const [locationType, setLocationType] = useState("");

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);

  const [serverStatus, setServerStatus] =
    useState<ServerStatus>("starting");

  const [incidentsLoading, setIncidentsLoading] = useState(true);
  const [incidentError, setIncidentError] = useState("");

  const fetchIncidents = useCallback(async () => {
    setIncidentsLoading(true);
    setIncidentError("");

    try {
      const response = await fetchWithRetry(
        `${API_URL}/incidents`,
        {},
        6,
        10000,
      );

      const data: unknown = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Unexpected incidents response.");
      }

      setIncidents(data as Incident[]);
      setServerStatus("online");
    } catch (error) {
      console.error("Could not load incidents:", error);
      setIncidentError(
        "The incident records could not be loaded. The server may still be starting.",
      );
      setServerStatus("offline");
    } finally {
      setIncidentsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialiseApplication = async () => {
      setServerStatus("starting");
      setIncidentError("");

      try {
        await fetchWithRetry(`${API_URL}/health`, {}, 6, 10000);
        setServerStatus("online");
        await fetchIncidents();
      } catch (error) {
        console.error("Application initialisation failed:", error);

        setServerStatus("offline");
        setIncidentsLoading(false);
        setIncidentError(
          "The AI server is currently unavailable. Please try again.",
        );
      }
    };

    void initialiseApplication();
  }, [fetchIncidents]);

  const analyseIncident = async () => {
    if (!description.trim()) {
      return;
    }

    setLoading(true);
    setResult(null);
    setIncidentError("");

    try {
      setServerStatus("starting");

      const response = await fetchWithRetry(
        `${API_URL}/analyse-incident`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description: description.trim(),
            location: location.trim() || null,
            incident_time: incidentTime.trim() || null,
            people_involved: peopleInvolved.trim() || null,
            weapon_involved: weaponInvolved.trim() || null,
            injury_reported: injuryReported.trim() || null,
            location_type: locationType.trim() || null,
          }),
        },
        6,
        10000,
      );

      const data = (await response.json()) as AnalysisResult;

      setServerStatus("online");
      setResult(data);

      setDescription("");
      setLocation("");
      setIncidentTime("");
      setPeopleInvolved("");
      setWeaponInvolved("");
      setInjuryReported("");
      setLocationType("");

      await fetchIncidents();
    } catch (error) {
      console.error("Incident analysis failed:", error);
      setServerStatus("offline");

      alert(
        "The AI server could not process the incident. Please wait briefly and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const analytics = useMemo(() => {
    const total = incidents.length;

    const highRisk = incidents.filter(
      (incident) => incident.risk_level?.toLowerCase() === "high",
    ).length;

    const mediumRisk = incidents.filter(
      (incident) => incident.risk_level?.toLowerCase() === "medium",
    ).length;

    const lowRisk = incidents.filter(
      (incident) => incident.risk_level?.toLowerCase() === "low",
    ).length;

    const typeCounts: Record<string, number> = {};

    incidents.forEach((incident) => {
      const type = incident.incident_type || "Unknown";
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    return {
      total,
      highRisk,
      mediumRisk,
      lowRisk,
      typeCounts,
      latestType: incidents[0]?.incident_type || "N/A",
    };
  }, [incidents]);

  const mapLocation =
    suburbCoords[location.toLowerCase()] ||
    suburbCoords[incidents[0]?.location?.toLowerCase() || ""] ||
    suburbCoords.darwin;

  const markerIcon = useMemo(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet");

    return L.divIcon({
      html: "📍",
      className: "text-3xl",
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
  }, []);

  const confidencePercent = Math.round((result?.confidence_score || 0) * 100);

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            GenAI for Effective Emergency Response
          </h1>

          <p className="mt-2 text-slate-400">
            Data fusion, 911 historical retrieval, GenAI reasoning, and first
            responder decision support.
          </p>

          <div className="mt-4">
            {serverStatus === "starting" && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                Starting the AI server. The first connection may take up to one
                minute.
              </div>
            )}

            {serverStatus === "online" && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-200">
                AI server is online.
              </div>
            )}

            {serverStatus === "offline" && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                AI server is currently unavailable.
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Total Incidents" value={analytics.total} />
          <StatCard label="High Risk" value={analytics.highRisk} danger />
          <StatCard label="Medium Risk" value={analytics.mediumRisk} />
          <StatCard label="Latest Type" value={analytics.latestType} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-bold">New Emergency Incident</h2>

            <textarea
              className="w-full rounded border border-slate-700 bg-slate-800 p-3 outline-none focus:border-blue-500"
              rows={5}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Incident description..."
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                value={location}
                setValue={setLocation}
                placeholder="Location: Nightcliff"
              />

              <Input
                value={incidentTime}
                setValue={setIncidentTime}
                placeholder="Time: Night / 10:30 PM"
              />

              <Input
                value={peopleInvolved}
                setValue={setPeopleInvolved}
                placeholder="People involved"
              />

              <Input
                value={weaponInvolved}
                setValue={setWeaponInvolved}
                placeholder="Weapon involved"
              />

              <Input
                value={injuryReported}
                setValue={setInjuryReported}
                placeholder="Injury reported"
              />

              <Input
                value={locationType}
                setValue={setLocationType}
                placeholder="Location type"
              />
            </div>

            <button
              type="button"
              onClick={analyseIncident}
              disabled={
                loading ||
                !description.trim() ||
                serverStatus === "starting"
              }
              className="rounded bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              {serverStatus === "starting"
                ? "Starting AI Server..."
                : loading
                  ? "Analysing with GenAI..."
                  : "Analyse Incident"}
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-bold">Incident Map</h2>

            <div className="h-[390px] overflow-hidden rounded-xl">
              <MapContainer
                center={mapLocation}
                zoom={13}
                className="h-full w-full"
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={mapLocation} icon={markerIcon}>
                  <Popup>
                    {location || incidents[0]?.location || "Darwin"}
                    <br />
                    {result?.incident_type || "Latest incident"}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>

        {result && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-5">
              <StatCard label="Incident Type" value={result.incident_type} />
              <StatCard label="Risk Level" value={result.risk_level} danger />
              <StatCard label="Priority" value={result.priority} />
              <StatCard label="Confidence" value={`${confidencePercent}%`} />
              <StatCard
                label="Processing"
                value={
                  result.processing_time_ms
                    ? `${result.processing_time_ms} ms`
                    : "N/A"
                }
              />
            </div>

            <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-3 text-xl font-bold">AI Confidence</h2>

              <div className="h-4 w-full rounded-full bg-slate-800">
                <div
                  className="h-4 rounded-full bg-blue-500"
                  style={{ width: `${confidencePercent}%` }}
                />
              </div>

              <p className="mt-2 text-sm text-slate-400">
                Confidence score: {confidencePercent}%
              </p>
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-4 text-xl font-bold">Data Fusion Sources</h2>

              <div className="grid gap-3 text-sm md:grid-cols-3">
                <FusionItem
                  label="Incident Description"
                  active={Boolean(result.summary)}
                />
                <FusionItem label="Location" active />
                <FusionItem label="Incident Time" active />
                <FusionItem label="People Involved" active />
                <FusionItem label="Weapon / Injury Info" active />
                <FusionItem label="Historical 911 Dataset" active />
                <FusionItem label="Semantic Similarity" active />
                <FusionItem label="Groq Llama 3.3 (Cloud)" active />
                <FusionItem label="Responder Recommendation" active />
              </div>
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-4 text-xl font-bold">
                AI Processing Pipeline
              </h2>

              <div className="grid gap-3 text-center text-sm md:grid-cols-5">
                {[
                  "Incident Input",
                  "Data Fusion",
                  "Historical Retrieval",
                  "LLM Reasoning",
                  "Decision Support",
                ].map((step, index) => (
                  <div key={step} className="rounded-lg bg-slate-800 p-4">
                    <p className="font-bold text-blue-300">
                      Step {index + 1}
                    </p>
                    <p>{step}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-bold">AI Situational Summary</h2>
              <p className="text-slate-300">{result.summary}</p>

              <h3 className="font-semibold">Recommended Response</h3>
              <p className="text-slate-300">{result.recommended_response}</p>

              <h3 className="font-semibold">Responders</h3>

              <div className="flex flex-wrap gap-2">
                {result.responders?.map((responder) => (
                  <span
                    key={responder}
                    className="rounded-full border border-blue-500/40 bg-blue-600/20 px-3 py-1 text-sm"
                  >
                    {responder}
                  </span>
                ))}
              </div>

              <h3 className="font-semibold">Key Risks</h3>

              <ul className="list-inside list-disc text-slate-300">
                {result.key_risks?.map((risk) => (
                  <li key={risk}>{risk}</li>
                ))}
              </ul>

              <h3 className="font-semibold">AI Reasoning</h3>
              <p className="text-sm text-slate-400">{result.reasoning}</p>
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-4 text-xl font-bold">Incident Timeline</h2>

              <div className="space-y-3 text-sm">
                <TimelineItem title="Incident submitted" />
                <TimelineItem title="Historical 911 dataset searched" />
                <TimelineItem title="Similar incidents retrieved" />
                <TimelineItem title="Groq generated AI analysis" />
                <TimelineItem title="Incident saved to Supabase" />
              </div>
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-4 text-xl font-bold">
                Similar Historical Incidents
              </h2>

              <div className="space-y-4">
                {result.similar_incidents?.length ? (
                  result.similar_incidents.map((incident, index) => (
                    <div
                      key={`${incident.title}-${index}`}
                      className="rounded-lg bg-slate-800 p-4"
                    >
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="font-semibold">{incident.title}</p>

                          <p className="text-sm text-slate-400">
                            {incident.location} • {incident.incident_type}
                          </p>
                        </div>

                        <p className="text-sm text-blue-300">
                          Similarity:{" "}
                          {Math.round(incident.similarity_score * 100)}%
                        </p>
                      </div>

                      <p className="mt-3 text-sm text-slate-300">
                        {incident.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400">
                    No similar historical incidents were returned.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-bold">Risk Breakdown</h2>

            <MiniBar
              label="High"
              value={analytics.highRisk}
              total={analytics.total}
            />

            <MiniBar
              label="Medium"
              value={analytics.mediumRisk}
              total={analytics.total}
            />

            <MiniBar
              label="Low"
              value={analytics.lowRisk}
              total={analytics.total}
            />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-bold">
              Incident Type Breakdown
            </h2>

            {Object.keys(analytics.typeCounts).length > 0 ? (
              Object.entries(analytics.typeCounts).map(([type, count]) => (
                <MiniBar
                  key={type}
                  label={type}
                  value={count}
                  total={analytics.total}
                />
              ))
            ) : (
              <p className="text-slate-400">No incident data available.</p>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold">Recent Incidents</h2>

            <button
              type="button"
              onClick={() => void fetchIncidents()}
              disabled={incidentsLoading}
              className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700 disabled:opacity-50"
            >
              {incidentsLoading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {incidentsLoading && (
            <p className="text-slate-400">
              Connecting to the server and loading incidents...
            </p>
          )}

          {!incidentsLoading && incidentError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-red-200">{incidentError}</p>

              <button
                type="button"
                onClick={() => void fetchIncidents()}
                className="mt-3 rounded bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {!incidentsLoading &&
            !incidentError &&
            incidents.length === 0 && (
              <p className="text-slate-400">
                No incidents are currently available.
              </p>
            )}

          {!incidentsLoading &&
            !incidentError &&
            incidents.length > 0 && (
              <div className="space-y-4">
                {incidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="rounded-lg bg-slate-800 p-4"
                  >
                    <p className="font-semibold">{incident.description}</p>

                    <p className="text-sm text-slate-400">
                      {incident.location || "No location"} •{" "}
                      {incident.incident_type || "Unknown type"} •{" "}
                      {incident.risk_level || "Unknown risk"}
                    </p>

                    {incident.summary && (
                      <p className="mt-2 text-sm text-slate-300">
                        {incident.summary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
        </section>
      </div>
    </main>
  );
}

function Input({
  value,
  setValue,
  placeholder,
}: {
  value: string;
  setValue: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      className="rounded border border-slate-700 bg-slate-800 p-3 outline-none focus:border-blue-500"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      placeholder={placeholder}
    />
  );
}

function StatCard({
  label,
  value,
  danger,
}: {
  label: string;
  value: string | number;
  danger?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`text-xl font-bold ${danger ? "text-red-300" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function FusionItem({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <div className="rounded-lg bg-slate-800 p-3">
      <span className={active ? "text-green-300" : "text-slate-500"}>
        {active ? "✓" : "○"}
      </span>{" "}
      {label}
    </div>
  );
}

function TimelineItem({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-3 w-3 rounded-full bg-blue-400" />
      <p>{title}</p>
    </div>
  );
}

function MiniBar({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percent = total ? Math.round((value / total) * 100) : 0;

  return (
    <div className="mb-3">
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span>
          {value} ({percent}%)
        </span>
      </div>

      <div className="h-3 rounded-full bg-slate-800">
        <div
          className="h-3 rounded-full bg-blue-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}