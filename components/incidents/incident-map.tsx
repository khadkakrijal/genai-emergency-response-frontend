"use client";

import { useEffect, useState } from "react";
import {
  ExternalLink,
  Loader2,
  MapPin,
  Search,
} from "lucide-react";

type IncidentMapProps = {
  location: string;
};

type GeocodeResult = {
  lat: string;
  lon: string;
  display_name: string;
};

export default function IncidentMap({
  location,
}: IncidentMapProps) {
  const [position, setPosition] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

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

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setSearching(true);
      setNotFound(false);

      try {
        const response = await fetch(
          `/api/geocode?q=${encodeURIComponent(location.trim())}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Location search failed");
        }

        const data: GeocodeResult[] =
          await response.json();

        if (!Array.isArray(data) || data.length === 0) {
          setPosition(null);
          setDisplayName("");
          setNotFound(true);
          return;
        }

        const latitude = Number(data[0].lat);
        const longitude = Number(data[0].lon);

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ) {
          setPosition(null);
          setDisplayName("");
          setNotFound(true);
          return;
        }

        setPosition({
          lat: latitude,
          lon: longitude,
        });

        setDisplayName(
          data[0].display_name || location
        );

        setNotFound(false);
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error("Geocoding error:", error);

        setPosition(null);
        setDisplayName("");
        setNotFound(true);
      } finally {
        setSearching(false);
      }
    }, 800);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [location]);

  /*
   * Create a small bounding box around the location
   * for the OpenStreetMap embedded map.
   */
  const mapUrl = position
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
        `${position.lon - 0.01},${position.lat - 0.007},${position.lon + 0.01},${position.lat + 0.007}`
      )}&layer=mapnik&marker=${encodeURIComponent(
        `${position.lat},${position.lon}`
      )}`
    : "";

  const openMapUrl = position
    ? `https://www.openstreetmap.org/?mlat=${position.lat}&mlon=${position.lon}#map=16/${position.lat}/${position.lon}`
    : "";

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-2xl shadow-black/10">
      {/* HEADER */}

      <div className="border-b border-slate-800 px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
              <MapPin className="h-5 w-5 text-blue-400" />
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Emergency Location Map
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Automatically locate the reported emergency
                location.
              </p>
            </div>
          </div>

          {position && (
            <a
              href={openMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-blue-500/40 hover:text-blue-400"
            >
              Open Map
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        {/* SEARCHING */}

        {searching && (
          <div className="mt-4 flex items-center gap-2 text-sm text-blue-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Locating incident...
          </div>
        )}

        {/* LOCATION FOUND */}

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

        {/* NOT FOUND */}

        {!searching && notFound && (
          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
            <p className="text-sm text-amber-300">
              Location could not be found. Try entering a more
              specific place name or street address.
            </p>
          </div>
        )}

        {/* EMPTY */}

        {!location && (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            <Search className="h-4 w-4" />
            Enter an incident location above to locate it
            automatically.
          </div>
        )}
      </div>

      {/* MAP */}

      {position ? (
        <div className="relative h-[400px] w-full bg-slate-950">
          <iframe
            key={`${position.lat}-${position.lon}`}
            title={`Emergency location: ${displayName || location}`}
            src={mapUrl}
            className="h-full w-full border-0"
            loading="lazy"
          />

          <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg border border-slate-700/70 bg-slate-950/90 px-3 py-2 shadow-xl backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />

              <span className="text-xs font-semibold text-white">
                INCIDENT LOCATION
              </span>
            </div>
          </div>
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