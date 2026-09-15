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

type GeocodeResponse = {
  found: boolean;
  lat?: string;
  lon?: string;
  display_name?: string;
  original_query?: string;
  matched_query?: string;
};

export default function IncidentMap({
  location,
}: IncidentMapProps) {
  const [position, setPosition] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [matchedQuery, setMatchedQuery] = useState("");

  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const trimmedLocation = location.trim();

    if (!trimmedLocation) {
      setPosition(null);
      setDisplayName("");
      setMatchedQuery("");
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
          `/api/geocode?q=${encodeURIComponent(trimmedLocation)}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Location search failed: ${response.status}`
          );
        }

        const data: GeocodeResponse =
          await response.json();

        /*
         * The API tries several versions of the
         * location before returning found: false.
         */
        if (
          !data.found ||
          !data.lat ||
          !data.lon
        ) {
          setPosition(null);
          setDisplayName("");
          setMatchedQuery("");
          setNotFound(true);
          return;
        }

        const latitude = Number(data.lat);
        const longitude = Number(data.lon);

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ) {
          setPosition(null);
          setDisplayName("");
          setMatchedQuery("");
          setNotFound(true);
          return;
        }

        setPosition({
          lat: latitude,
          lon: longitude,
        });

        setDisplayName(
          data.display_name ||
            trimmedLocation
        );

        setMatchedQuery(
          data.matched_query || ""
        );

        setNotFound(false);
      } catch (error) {
        /*
         * AbortError is expected when the user
         * changes the location while a previous
         * request is still running.
         */
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Geocoding error:",
          error
        );

        setPosition(null);
        setDisplayName("");
        setMatchedQuery("");
        setNotFound(true);
      } finally {
        if (!controller.signal.aborted) {
          setSearching(false);
        }
      }
    }, 800);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [location]);

  /*
   * Create a small bounding box around
   * the resolved coordinates.
   */
  const mapUrl = position
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
        `${position.lon - 0.01},${position.lat - 0.007},${position.lon + 0.01},${position.lat + 0.007}`
      )}&layer=mapnik&marker=${encodeURIComponent(
        `${position.lat},${position.lon}`
      )}`
    : "";

  /*
   * Full OpenStreetMap URL for the
   * "Open Map" button.
   */
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
              className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-blue-500/40 hover:text-blue-400"
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

            <span>
              Locating incident...
            </span>
          </div>
        )}

        {/* LOCATION FOUND */}

        {!searching && position && (
          <div className="mt-4 rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-4 py-3">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Location Found
                </p>

                <p className="mt-1 text-sm leading-5 text-slate-300">
                  {displayName}
                </p>

                {matchedQuery &&
                  matchedQuery.toLowerCase() !==
                    location.trim().toLowerCase() && (
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Interpreted from:{" "}
                      <span className="text-slate-400">
                        {location}
                      </span>
                    </p>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* LOCATION NOT FOUND */}

        {!searching && notFound && (
          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
            <div className="flex items-start gap-3">
              <Search className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />

              <div>
                <p className="text-sm font-medium text-amber-300">
                  Location could not be identified
                </p>

                <p className="mt-1 text-xs leading-5 text-amber-200/70">
                  The system tried multiple versions of the
                  location but could not confidently identify
                  it. Try adding a suburb, city, landmark or
                  street name.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}

        {!location.trim() && (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            <Search className="h-4 w-4" />

            <span>
              Enter an incident location above to locate it
              automatically.
            </span>
          </div>
        )}
      </div>

      {/* MAP */}

      {position ? (
        <div className="relative h-[400px] w-full bg-slate-950">
          <iframe
            key={`${position.lat}-${position.lon}`}
            title={`Emergency location: ${
              displayName || location
            }`}
            src={mapUrl}
            className="h-full w-full border-0"
            loading="lazy"
          />

          {/* INCIDENT INDICATOR */}

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
        /* MAP PLACEHOLDER */

        <div className="flex h-[300px] items-center justify-center bg-slate-950/40">
          <div className="px-6 text-center">
            {searching ? (
              <Loader2 className="mx-auto h-9 w-9 animate-spin text-blue-500" />
            ) : notFound ? (
              <Search className="mx-auto h-9 w-9 text-amber-500/50" />
            ) : (
              <MapPin className="mx-auto h-9 w-9 text-slate-700" />
            )}

            <p className="mt-3 text-sm font-medium text-slate-500">
              {searching
                ? "Searching for incident location..."
                : notFound
                  ? "Location unavailable"
                  : "Waiting for incident location"}
            </p>

            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-600">
              {notFound
                ? "Add more location information and the system will automatically try again."
                : "Enter a place name, landmark or street address in the incident form."}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}