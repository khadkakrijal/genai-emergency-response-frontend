export type ServerStatus = "starting" | "online" | "offline";

export type SimilarIncident = {
  title: string;
  description: string;
  location: string;
  incident_type: string;
  priority_level: string | null;
  similarity_score: number;
};

export type AnalysisResult = {
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

export type Incident = {
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

export type IncidentInput = {
  description: string;
  location?: string | null;
  incident_time?: string | null;
  people_involved?: string | null;
  weapon_involved?: string | null;
  injury_reported?: string | null;
  location_type?: string | null;
};