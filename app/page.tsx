"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://genai-emergency-response-api.onrender.com";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
);
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), {
  ssr: false,
});

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

  const fetchIncidents = async () => {
    const res = await fetch(`${API_URL}/incidents`);
    const data = await res.json();
    setIncidents(data);
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const analyseIncident = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/analyse-incidents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          location,
          incident_time: incidentTime,
          people_involved: peopleInvolved,
          weapon_involved: weaponInvolved,
          injury_reported: injuryReported,
          location_type: locationType,
        }),
      });

      const data = await res.json();
      setResult(data);

      setDescription("");
      setLocation("");
      setIncidentTime("");
      setPeopleInvolved("");
      setWeaponInvolved("");
      setInjuryReported("");
      setLocationType("");

      fetchIncidents();
    } catch (error) {
      console.error(error);
      alert("Could not connect to AI service.");
    } finally {
      setLoading(false);
    }
  };

  const analytics = useMemo(() => {
    const total = incidents.length;
    const highRisk = incidents.filter(
      (i) => i.risk_level?.toLowerCase() === "high",
    ).length;
    const mediumRisk = incidents.filter(
      (i) => i.risk_level?.toLowerCase() === "medium",
    ).length;
    const lowRisk = incidents.filter(
      (i) => i.risk_level?.toLowerCase() === "low",
    ).length;

    const typeCounts: Record<string, number> = {};
    incidents.forEach((i) => {
      const type = i.incident_type || "Unknown";
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

  const createMarkerIcon = () => {
    if (typeof window === "undefined") return undefined;
    const L = require("leaflet");
    return L.divIcon({
      html: "📍",
      className: "text-3xl",
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
  };

  const confidencePercent = Math.round((result?.confidence_score || 0) * 100);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            GenAI for Effective Emergency Response
          </h1>
          <p className="text-slate-400 mt-2">
            Data fusion, 911 historical retrieval, GenAI reasoning, and first
            responder decision support.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <StatCard label="Total Incidents" value={analytics.total} />
          <StatCard label="High Risk" value={analytics.highRisk} danger />
          <StatCard label="Medium Risk" value={analytics.mediumRisk} />
          <StatCard label="Latest Type" value={analytics.latestType} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold">New Emergency Incident</h2>

            <textarea
              className="w-full p-3 rounded bg-slate-800 border border-slate-700 outline-none focus:border-blue-500"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Incident description..."
            />

            <div className="grid md:grid-cols-2 gap-4">
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
              onClick={analyseIncident}
              disabled={loading || !description}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 px-5 py-3 rounded font-semibold"
            >
              {loading ? "Analysing with GenAI..." : "Analyse Incident"}
            </button>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold mb-4">Incident Map</h2>
            <div className="h-[390px] rounded-xl overflow-hidden">
              <MapContainer
                center={mapLocation}
                zoom={13}
                className="h-full w-full"
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={mapLocation} icon={createMarkerIcon()}>
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
            <div className="grid md:grid-cols-5 gap-4">
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

            <section className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h2 className="text-xl font-bold mb-3">AI Confidence</h2>
              <div className="w-full bg-slate-800 rounded-full h-4">
                <div
                  className="bg-blue-500 h-4 rounded-full"
                  style={{ width: `${confidencePercent}%` }}
                />
              </div>
              <p className="text-sm text-slate-400 mt-2">
                Confidence score: {confidencePercent}%
              </p>
            </section>

            <section className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h2 className="text-xl font-bold mb-4">Data Fusion Sources</h2>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <FusionItem
                  label="Incident Description"
                  active={!!result.summary}
                />
                <FusionItem label="Location" active />
                <FusionItem label="Incident Time" active />
                <FusionItem label="People Involved" active />
                <FusionItem label="Weapon / Injury Info" active />
                <FusionItem label="Historical 911 Dataset" active />
                <FusionItem label="Semantic Similarity" active />
                <FusionItem label="Ollama Llama 3.2" active />
                <FusionItem label="Responder Recommendation" active />
              </div>
            </section>

            <section className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h2 className="text-xl font-bold mb-4">AI Processing Pipeline</h2>
              <div className="grid md:grid-cols-5 gap-3 text-center text-sm">
                {[
                  "Incident Input",
                  "Data Fusion",
                  "Historical Retrieval",
                  "LLM Reasoning",
                  "Decision Support",
                ].map((step, index) => (
                  <div key={step} className="bg-slate-800 p-4 rounded-lg">
                    <p className="text-blue-300 font-bold">Step {index + 1}</p>
                    <p>{step}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
              <h2 className="text-xl font-bold">AI Situational Summary</h2>
              <p className="text-slate-300">{result.summary}</p>

              <h3 className="font-semibold">Recommended Response</h3>
              <p className="text-slate-300">{result.recommended_response}</p>

              <h3 className="font-semibold">Responders</h3>
              <div className="flex flex-wrap gap-2">
                {result.responders?.map((r, i) => (
                  <span
                    key={i}
                    className="bg-blue-600/20 border border-blue-500/40 px-3 py-1 rounded-full text-sm"
                  >
                    {r}
                  </span>
                ))}
              </div>

              <h3 className="font-semibold">Key Risks</h3>
              <ul className="list-disc list-inside text-slate-300">
                {result.key_risks?.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>

              <h3 className="font-semibold">AI Reasoning</h3>
              <p className="text-slate-400 text-sm">{result.reasoning}</p>
            </section>

            <section className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h2 className="text-xl font-bold mb-4">Incident Timeline</h2>
              <div className="space-y-3 text-sm">
                <TimelineItem title="Incident submitted" />
                <TimelineItem title="Historical 911 dataset searched" />
                <TimelineItem title="Similar incidents retrieved" />
                <TimelineItem title="Ollama generated AI analysis" />
                <TimelineItem title="Incident saved to Supabase" />
              </div>
            </section>

            <section className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h2 className="text-xl font-bold mb-4">
                Similar Historical Incidents
              </h2>
              <div className="space-y-4">
                {result.similar_incidents?.map((incident, index) => (
                  <div key={index} className="bg-slate-800 p-4 rounded-lg">
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
                    <p className="text-sm text-slate-300 mt-3">
                      {incident.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold mb-4">Risk Breakdown</h2>
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

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold mb-4">Incident Type Breakdown</h2>
            {Object.entries(analytics.typeCounts).map(([type, count]) => (
              <MiniBar
                key={type}
                label={type}
                value={count}
                total={analytics.total}
              />
            ))}
          </div>
        </section>

        <section className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-xl font-bold mb-4">Recent Incidents</h2>
          <div className="space-y-4">
            {incidents.map((incident) => (
              <div key={incident.id} className="bg-slate-800 p-4 rounded-lg">
                <p className="font-semibold">{incident.description}</p>
                <p className="text-sm text-slate-400">
                  {incident.location || "No location"} •{" "}
                  {incident.incident_type} • {incident.risk_level}
                </p>
                <p className="text-sm mt-2 text-slate-300">
                  {incident.summary}
                </p>
              </div>
            ))}
          </div>
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
      className="p-3 rounded bg-slate-800 border border-slate-700 outline-none focus:border-blue-500"
      value={value}
      onChange={(e) => setValue(e.target.value)}
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
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
      <p className="text-slate-400 text-sm">{label}</p>
      <p className={`text-xl font-bold ${danger ? "text-red-300" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function FusionItem({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="bg-slate-800 p-3 rounded-lg">
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
      <div className="w-3 h-3 rounded-full bg-blue-400" />
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
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>
          {value} ({percent}%)
        </span>
      </div>
      <div className="h-3 bg-slate-800 rounded-full">
        <div
          className="h-3 bg-blue-500 rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
