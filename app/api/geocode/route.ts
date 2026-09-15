import { NextRequest, NextResponse } from "next/server";

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  importance?: number;
  type?: string;
};

function cleanLocation(input: string) {
  return input
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/,+/g, ",")
    .replace(/,\s*,/g, ",");
}

function normaliseDarwinLocation(input: string) {
  let value = cleanLocation(input);

  // Normalise common user wording.
  value = value.replace(
    /\bdarwin\s+cbd\b/gi,
    "Darwin"
  );

  value = value.replace(
    /\bNT\b/gi,
    "Northern Territory"
  );

  return cleanLocation(value);
}

function unique(values: string[]) {
  return [...new Set(
    values
      .map((value) => cleanLocation(value))
      .filter(Boolean)
  )];
}

async function searchNominatim(
  query: string
): Promise<NominatimResult[]> {
  const url =
    "https://nominatim.openstreetmap.org/search" +
    `?format=jsonv2` +
    `&limit=3` +
    `&addressdetails=1` +
    `&countrycodes=au` +
    `&q=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "EmergencyAI-CDU-Academic-Prototype/1.0",
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Nominatim request failed: ${response.status}`
    );
  }

  return response.json();
}

export async function GET(
  request: NextRequest
) {
  const rawQuery =
    request.nextUrl.searchParams.get("q");

  if (!rawQuery?.trim()) {
    return NextResponse.json(
      {
        error: "Location is required",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const original =
      cleanLocation(rawQuery);

    const normalised =
      normaliseDarwinLocation(original);

    /*
     * Search from most specific/user-provided
     * wording to increasingly normalised forms.
     */
    const queries = unique([
      original,

      normalised,

      `${normalised}, Australia`,

      // Useful fallback when the user only enters
      // a street, suburb or landmark around Darwin.
      `${original}, Darwin, Northern Territory, Australia`,
    ]);

    for (const query of queries) {
      const results =
        await searchNominatim(query);

      if (results.length > 0) {
        const best = results[0];

        return NextResponse.json({
          found: true,

          lat: best.lat,
          lon: best.lon,

          display_name:
            best.display_name,

          original_query:
            original,

          matched_query:
            query,
        });
      }
    }

    return NextResponse.json({
      found: false,
      original_query: original,
    });
  } catch (error) {
    console.error(
      "Geocoding API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to search for the location",
      },
      {
        status: 500,
      }
    );
  }
}