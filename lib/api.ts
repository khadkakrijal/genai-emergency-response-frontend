import type { AnalysisResult, Incident, IncidentInput } from "@/lib/types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://genai-emergency-response-api.onrender.com";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 6,
  delay = 10000,
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

      lastError = new Error(`Request failed: ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    if (attempt < retries) {
      await wait(delay);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Backend unavailable");
}

export async function checkServerHealth() {
  try {
    await fetchWithRetry(`${API_URL}/health`);
    return true;
  } catch {
    return false;
  }
}

export async function getIncidents(): Promise<Incident[]> {
  const response = await fetchWithRetry(`${API_URL}/incidents`);

  return response.json();
}

export async function analyseIncident(
  incident: IncidentInput,
): Promise<AnalysisResult> {
  const response = await fetchWithRetry(`${API_URL}/analyse-incident`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(incident),
  });

  return response.json();
}

export async function getIncident(id: string): Promise<Incident> {
  const response = await fetchWithRetry(`${API_URL}/incidents/${id}`);

  return response.json();
}
