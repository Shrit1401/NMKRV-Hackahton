import {
  ActivityLogEntry,
  ConfidenceTrend,
  DisasterEvent,
  SignalSheetRow,
  SourceTrendPoint,
  SeverityLevel,
  SourceBreakdown,
} from "./types";

export const INDIA_CENTER: [number, number] = [22.5937, 78.9629];

export const makeTrend = (base: number): ConfidenceTrend[] => [
  { time: "09:10", score: Math.max(30, base - 22) },
  { time: "09:20", score: Math.max(40, base - 16) },
  { time: "09:30", score: Math.max(50, base - 9) },
  { time: "09:40", score: Math.max(55, base - 5) },
  { time: "09:50", score: base },
];

export const initialDisasterEvents: DisasterEvent[] = [
  {
    id: "ev-1",
    type: "flood",
    name: "Urban Flooding",
    location: {
      label: "Koramangala, Bengaluru",
      lat: 12.9352,
      lng: 77.6245,
    },
    severity: "high",
    confidenceScore: 87,
    socialCount: 64,
    newsCount: 12,
    userReports: 31,
    whatsappReports: 18,
    weatherSeverity: 8.4,
    confidenceTrend: makeTrend(87),
  },
  {
    id: "ev-2",
    type: "flood",
    name: "River Overflow Alert",
    location: {
      label: "Patna Riverside Zone",
      lat: 25.5941,
      lng: 85.1376,
    },
    severity: "medium",
    confidenceScore: 74,
    socialCount: 33,
    newsCount: 9,
    userReports: 14,
    whatsappReports: 11,
    weatherSeverity: 6.2,
    confidenceTrend: makeTrend(74),
  },
  {
    id: "ev-3",
    type: "landslide",
    name: "Landslide Warning",
    location: {
      label: "Shimla Hills Corridor",
      lat: 31.1048,
      lng: 77.1734,
    },
    severity: "medium",
    confidenceScore: 69,
    socialCount: 22,
    newsCount: 6,
    userReports: 10,
    whatsappReports: 8,
    weatherSeverity: 7.1,
    confidenceTrend: makeTrend(69),
  },
  {
    id: "ev-4",
    type: "cyclone",
    name: "Cyclone Landfall Risk",
    location: {
      label: "Visakhapatnam Coast",
      lat: 17.6868,
      lng: 83.2185,
    },
    severity: "high",
    confidenceScore: 91,
    socialCount: 88,
    newsCount: 19,
    userReports: 42,
    whatsappReports: 26,
    weatherSeverity: 9.1,
    confidenceTrend: makeTrend(91),
  },
];

export const initialActivityLog: ActivityLogEntry[] = [
  {
    id: "log-1",
    timestamp: "10:24:11",
    message: "New social signal detected in Zone 3",
  },
  {
    id: "log-2",
    timestamp: "10:25:33",
    message: "Confidence increased to 87% for Urban Flooding",
  },
  {
    id: "log-3",
    timestamp: "10:27:08",
    message: "WhatsApp report received from local volunteer",
  },
  {
    id: "log-4",
    timestamp: "10:30:49",
    message: "Weather alert: heavy rainfall likely in east corridor",
  },
  {
    id: "log-5",
    timestamp: "10:33:20",
    message: "App SOS reports crossed threshold in coastal area",
  },
];

export const signalSheetRows: SignalSheetRow[] = [
  {
    id: "sig-001",
    timestamp: "10:12:09",
    source: "News",
    zone: "Bengaluru South",
    detail: "Local channel reports waterlogging on inner ring roads.",
    severity: "medium",
  },
  {
    id: "sig-002",
    timestamp: "10:14:51",
    source: "Social",
    zone: "Visakhapatnam Coast",
    detail: "Multiple posts mention rising wind and roadside flooding.",
    severity: "high",
  },
  {
    id: "sig-003",
    timestamp: "10:16:03",
    source: "App",
    zone: "Patna Riverside",
    detail: "12 SOS taps from households near low-lying blocks.",
    severity: "high",
  },
  {
    id: "sig-004",
    timestamp: "10:17:27",
    source: "WhatsApp",
    zone: "Shimla Hills",
    detail: "Volunteer group flagged loose soil and minor slide activity.",
    severity: "medium",
  },
  {
    id: "sig-005",
    timestamp: "10:19:10",
    source: "News",
    zone: "Chennai South",
    detail: "Short bulletin on stalled traffic due to heavy rain.",
    severity: "low",
  },
  {
    id: "sig-006",
    timestamp: "10:21:35",
    source: "Social",
    zone: "Kochi Central",
    detail: "Residents sharing videos of fast water flow near drains.",
    severity: "medium",
  },
];

export const sourceTrendData: SourceTrendPoint[] = [
  { time: "09:00", news: 8, social: 21, app: 10, whatsapp: 6 },
  { time: "09:10", news: 10, social: 25, app: 12, whatsapp: 8 },
  { time: "09:20", news: 12, social: 28, app: 14, whatsapp: 10 },
  { time: "09:30", news: 11, social: 31, app: 16, whatsapp: 11 },
  { time: "09:40", news: 14, social: 37, app: 18, whatsapp: 13 },
  { time: "09:50", news: 16, social: 41, app: 22, whatsapp: 15 },
];

export function getSourceBreakdown(event: DisasterEvent): SourceBreakdown {
  return {
    newsSignals: event.newsCount,
    socialPosts: event.socialCount,
    appReports: event.userReports,
    whatsappReports: event.whatsappReports,
    weatherSeverity: event.weatherSeverity,
  };
}

export function getSeverityColor(severity: SeverityLevel): string {
  if (severity === "high") return "#ef4444";
  if (severity === "medium") return "#f59e0b";
  return "#22c55e";
}

export function getSeverityLabel(severity: SeverityLevel): string {
  if (severity === "high") return "High";
  if (severity === "medium") return "Medium";
  return "Low";
}

export function getWeatherSeverityLabel(score: number): string {
  if (score >= 7.5) return "High";
  if (score >= 4) return "Moderate";
  return "Low";
}

export function simulateEvents(events: DisasterEvent[]): DisasterEvent[] {
  return events.map((event) => {
    const delta = Math.random() > 0.5 ? 2 : -2;
    const nextScore = Math.max(35, Math.min(98, event.confidenceScore + delta));

    const nextTrend: ConfidenceTrend[] = [
      ...(event.confidenceTrend ?? []).slice(1),
      {
        time: new Date().toLocaleTimeString("en-IN", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }),
        score: nextScore,
      },
    ];

    return {
      ...event,
      confidenceScore: nextScore,
      socialCount: event.socialCount + Math.floor(Math.random() * 4),
      newsCount: event.newsCount + Math.floor(Math.random() * 2),
      userReports: event.userReports + Math.floor(Math.random() * 3),
      whatsappReports: event.whatsappReports + Math.floor(Math.random() * 2),
      weatherSeverity: Math.max(
        3,
        Math.min(
          10,
          Number(
            (event.weatherSeverity + Math.random() * 0.5 - 0.2).toFixed(1),
          ),
        ),
      ),
      confidenceTrend: nextTrend,
    };
  });
}

export function nextLogEntry(event: DisasterEvent): ActivityLogEntry {
  const samples = [
    `New social signal detected near ${event.location.label}`,
    `Confidence updated to ${event.confidenceScore}% for ${event.name}`,
    `WhatsApp report received for ${event.location.label}`,
    `Weather severity now ${event.weatherSeverity.toFixed(1)} in active zone`,
  ];

  return {
    id: `log-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: new Date().toLocaleTimeString("en-IN", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    message: samples[Math.floor(Math.random() * samples.length)],
  };
}
