const BASE_URL = "https://7025-14-195-240-42.ngrok-free.app";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Request to ${path} failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export type ApiEvent = {
  id: string;
  type: string;
  latitude: number;
  longitude: number;
  confidence: number;
  severity: "low" | "medium" | "high";
  source_breakdown: {
    app: number;
    whatsapp: number;
    news: number;
    social: number;
  };
  weather_severity: number;
  active: boolean;
  created_at: string;
};

export type DashboardFeedReport = {
  id: string;
  source: string;
  disaster_type: string;
  description: string;
  latitude: number;
  longitude: number;
  created_at: string;
};

export type DashboardFeedEvent = {
  id: string;
  type: string;
  confidence: number;
  severity: "low" | "medium" | "high";
  active: boolean;
  created_at: string;
};

export type DashboardFeedResponse = {
  recent_reports: DashboardFeedReport[];
  recent_events: DashboardFeedEvent[];
};

export function fetchEvents(): Promise<ApiEvent[]> {
  return getJson<ApiEvent[]>("/events");
}

export function fetchDashboardFeed(limit = 20): Promise<DashboardFeedResponse> {
  const search = new URLSearchParams({ limit: String(limit) }).toString();
  return getJson<DashboardFeedResponse>(`/dashboard/feed?${search}`);
}

