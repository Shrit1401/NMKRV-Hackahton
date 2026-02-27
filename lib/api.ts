const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    const body = contentType.includes("application/json")
      ? JSON.stringify(await response.json())
      : await response.text();
    throw new Error(
      `Request to ${path} failed with ${response.status}${body ? `: ${body}` : ""}`,
    );
  }

  return response.json() as Promise<T>;
}

export type NewsArticle = {
  title: string;
  source: string;
  url: string;
  summary: string;
  published: string;
  disaster_type: string;
  query: string;
};

export type NewsResponse = {
  articles: NewsArticle[];
  total: number;
  scraped_at: string;
};

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

export type DisasterPhoto = {
  id: string;
  url: string;
  label?: string;
};

export type DisasterPhotosResponse = {
  files: unknown[];
  total: number;
};

export type ReportDetail = {
  id: string;
  source: string;
  event_id: string | null;
  latitude: number;
  longitude: number;
  description: string;
  disaster_type: string;
  people_count: number | null;
  injuries: boolean;
  created_at: string;
};

export function fetchEvents(): Promise<ApiEvent[]> {
  return getJson<ApiEvent[]>("/api/events");
}

export function fetchDashboardFeed(limit = 20): Promise<DashboardFeedResponse> {
  const search = new URLSearchParams({ limit: String(limit) }).toString();
  return getJson<DashboardFeedResponse>(`/api/dashboard/feed?${search}`);
}

export async function fetchDisasterPhotos(): Promise<DisasterPhoto[]> {
  const response = await getJson<DisasterPhotosResponse>("/api/media/list");

  return (response.files ?? [])
    .map((file, index) => {
      if (typeof file === "string") {
        const url = file.startsWith("http")
          ? file
          : new URL(file, window.location.origin).toString();

        return {
          id: `media-${index}`,
          url,
        } satisfies DisasterPhoto;
      }

      if (typeof file === "object" && file !== null) {
        const anyFile = file as Record<string, unknown>;
        const rawUrl =
          (anyFile.url as string | undefined) ??
          (anyFile.path as string | undefined) ??
          (anyFile.filepath as string | undefined) ??
          (anyFile.filename as string | undefined);

        if (!rawUrl) {
          return null;
        }

        const url = rawUrl.startsWith("http")
          ? rawUrl
          : new URL(rawUrl, window.location.origin).toString();

        const label =
          (anyFile.label as string | undefined) ??
          (anyFile.caption as string | undefined) ??
          (anyFile.name as string | undefined) ??
          (anyFile.filename as string | undefined);

        const id =
          (anyFile.id as string | undefined) ??
          (anyFile.uuid as string | undefined) ??
          `media-${index}`;

        return {
          id,
          url,
          label,
        } satisfies DisasterPhoto;
      }

      return null;
    })
    .filter((photo): photo is DisasterPhoto => photo !== null);
}

export function fetchReport(reportId: string): Promise<ReportDetail> {
  return getJson<ReportDetail>(`/api/reports/${reportId}`);
}

export type WeatherForecastPoint = {
  dt: number;
  dt_txt: string;
  main: {
    temp: number;
    feels_like: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
  };
  rain?: {
    [key: string]: number;
  };
};

export type WeatherForecastResponse = {
  list: WeatherForecastPoint[];
};

export async function fetchWeatherForecast(
  lat: number,
  lon: number,
): Promise<WeatherForecastResponse> {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API;
  if (!apiKey) {
    throw new Error("OpenWeather API key not configured");
  }

  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    units: "metric",
    appid: apiKey,
  });

  const response = await fetch(
    `${OPENWEATHER_BASE_URL}/forecast?${params.toString()}`,
  );

  console.log(response);
  if (!response.ok) {
    throw new Error(`OpenWeather forecast failed with ${response.status}`);
  }

  return response.json() as Promise<WeatherForecastResponse>;
}

export function fetchNews(): Promise<NewsResponse> {
  return getJson<NewsResponse>("/api/news");
}
