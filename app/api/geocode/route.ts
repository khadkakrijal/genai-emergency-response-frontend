import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query?.trim()) {
    return NextResponse.json(
      { error: "Location is required" },
      { status: 400 }
    );
  }

  try {
    /*
     * Search the entered location first.
     *
     * Adding Darwin / Northern Territory / Australia helps
     * resolve local place names while still allowing the user
     * to enter a complete address.
     */
    const searchQuery =
      `${query.trim()}, Northern Territory, Australia`;

    const url =
      "https://nominatim.openstreetmap.org/search" +
      `?format=jsonv2` +
      `&limit=1` +
      `&addressdetails=1` +
      `&q=${encodeURIComponent(searchQuery)}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "EmergencyAI-CDU-Academic-Prototype/1.0",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        "Nominatim response:",
        response.status,
        response.statusText
      );

      return NextResponse.json(
        { error: "Geocoding service unavailable" },
        { status: 502 }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Geocoding API error:", error);

    return NextResponse.json(
      { error: "Unable to locate address" },
      { status: 500 }
    );
  }
}