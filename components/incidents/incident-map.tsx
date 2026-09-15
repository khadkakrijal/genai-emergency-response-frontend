"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, MapPin, Search } from "lucide-react";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

const markerIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:38px;
      height:38px;
      display:flex;
      align-items:center;
      justify-content:center;
      border-radius:50%;
      background:#ef4444;
      border:3px solid white;
      box-shadow:0 0 20px rgba(239,68,68,.55);
      font-size:18px;
    ">
      📍
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

interface IncidentMapProps {
  location: string;
}

export default function IncidentMap({
  location,
}: IncidentMapProps) {
  const [position, setPosition] =
    useState<[number, number] | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!location.trim()) {
      setPosition(null);
      setDisplayName("");
      setNotFound(false);
      setSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      setNotFound(false);

      try {
        const response = await fetch(
          `/api/geocode?q=${encodeURIComponent(location.trim())}`
        );

        if (!response.ok) {
          throw new Error("Location search failed");
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          const latitude = Number(data[0].lat);
          const longitude = Number(data[0].lon);

          if (
            Number.isFinite(latitude) &&
            Number.isFinite(longitude)
          ) {
            setPosition([latitude, longitude]);
            setDisplayName(
              data[0].display_name || location
            );
            setNotFound(false);
          } else {
            setPosition(null);
            setDisplayName("");
            setNotFound(true);
          }
        } else {
          setPosition(null);
          setDisplayName("");
          setNotFound(true);
        }
      } catch (error) {
        console.error("Geocoding error:", error);

        setPosition(null);
        setDisplayName("");
        setNotFound(true);
      } finally {
        setSearching(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-2xl shadow-black/10">
      <div className="border-b border-slate-800 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
            <MapPin className="h-5 w-5 text-blue-400" />
          </div>

          <div>
            <h2 className="font-semibold text-white">
              Emergency Location Map
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Automatically locate and display the reported
              incident location.
            </p>
          </div>
        </div>

        {searching && (
          <div className="mt-4 flex items-center gap-2 text-sm text-blue-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Locating incident...
          </div>
        )}

        {!searching && position && (
          <div className="mt-4 flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Location Found
              </p>

              <p className="mt-1 text-sm leading-5 text-slate-400">
                {displayName}
              </p>
            </div>
          </div>
        )}

        {!searching && notFound && (
          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
            <p className="text-sm text-amber-300">
              Location could not be found. Try entering a more
              specific place or address.
            </p>
          </div>
        )}

        {!location && (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            <Search className="h-4 w-4" />
            Enter an incident location above to locate it
            automatically.
          </div>
        )}
      </div>

      {position ? (
        <div className="h-[400px] w-full">
          <MapContainer
            key={`${position[0]}-${position[1]}`}
            center={position}
            zoom={15}
            scrollWheelZoom
            className="h-full w-full"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker
              position={position}
              icon={markerIcon}
            >
              <Popup>
                <strong>Emergency Incident</strong>
                <br />
                {displayName || location}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      ) : (
        <div className="flex h-[300px] items-center justify-center bg-slate-950/40">
          <div className="px-6 text-center">
            {searching ? (
              <Loader2 className="mx-auto h-9 w-9 animate-spin text-blue-500" />
            ) : (
              <MapPin className="mx-auto h-9 w-9 text-slate-700" />
            )}

            <p className="mt-3 text-sm font-medium text-slate-500">
              {searching
                ? "Searching for incident location..."
                : "Waiting for incident location"}
            </p>

            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-600">
              Enter a place name, landmark or street address in
              the incident form.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}