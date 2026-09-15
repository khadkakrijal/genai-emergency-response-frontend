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

  // Original incident information
  description: string;
  location: string | null;
  incident_time: string | null;
  people_involved: string | null;
  weapon_involved: string | null;
  injury_reported: string | null;
  location_type: string | null;

  // AI assessment
  incident_type: string | null;
  risk_level: string | null;
  priority: string | null;
  confidence_score: number | null;
  responders: string[] | null;
  key_risks: string[] | null;
  summary: string | null;
  recommended_response: string | null;
  reasoning: string | null;

  // System information
  ai_model: string | null;
  processing_time_ms: number | null;
  status: string | null;

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
