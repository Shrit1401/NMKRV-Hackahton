"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HeaderBar } from "../../components/header-bar";
import { MetricsBar } from "../../components/metrics-bar";
import { EventDetailsPanel } from "../../components/event-details-panel";
import { WeatherForecastPanel } from "../../components/weather-forecast-panel";
import { ActivityFeed } from "../../components/activity-feed";
import { RiskDistributionPanel } from "../../components/risk-distribution-panel";
import { ReportDetailsPanel } from "../../components/report-details-panel";
import { NewsPanel } from "../../components/news-panel";
import { Skeleton } from "../../components/ui/skeleton";
import {
  fetchDashboardFeed,
  fetchEvents,
  fetchNews,
  fetchReport,
} from "../../lib/api";
import { getSourceBreakdown } from "../../lib/disaster-utils";
import { ActivityLogEntry, DisasterEvent } from "../../lib/types";
import type {
  ApiEvent,
  DashboardFeedResponse,
  ReportDetail,
  NewsArticle,
} from "../../lib/api";

const DisasterMap = dynamic(
  () => import("../../components/disaster-map").then((mod) => mod.DisasterMap),
  { ssr: false },
);

function mapApiEvent(event: ApiEvent): DisasterEvent {
  const name = `${event.type.charAt(0).toUpperCase()}${event.type.slice(1)} Event`;
  const label = `Lat ${event.latitude.toFixed(3)}, Lng ${event.longitude.toFixed(3)}`;

  return {
    id: event.id,
    name,
    location: {
      label,
      lat: event.latitude,
      lng: event.longitude,
    },
    severity: event.severity,
    confidenceScore: Math.round(event.confidence),
    socialCount: event.source_breakdown.social ?? 0,
    newsCount: event.source_breakdown.news ?? 0,
    userReports: event.source_breakdown.app ?? 0,
    whatsappReports: event.source_breakdown.whatsapp ?? 0,
    weatherSeverity: Number((event.weather_severity / 10).toFixed(1)),
  };
}

function buildActivity(feed: DashboardFeedResponse): ActivityLogEntry[] {
  const items = [
    ...feed.recent_reports.map((report) => ({
      kind: "report" as const,
      created_at: report.created_at,
      report,
    })),
    ...feed.recent_events.map((event) => ({
      kind: "event" as const,
      created_at: event.created_at,
      event,
    })),
  ];

  items.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return items.map((item, index) => {
    const createdAt = new Date(item.created_at);
    const timestamp = createdAt.toLocaleTimeString("en-IN", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    if (item.kind === "report") {
      const r = item.report;
      const source = r.source.toUpperCase();
      const type = r.disaster_type;
      const message = `${source} ${type} report: ${r.description}`;

      return {
        id: `feed-report-${index}`,
        timestamp,
        message,
        reportId: r.id,
      };
    }

    const e = item.event;
    const status = e.active ? "active" : "resolved";
    const message = `Event ${e.type} (${e.severity}) ${status} with confidence ${Math.round(e.confidence)}%`;

    return {
      id: `feed-event-${index}`,
      timestamp,
      message,
      eventId: e.id,
    };
  });
}

export default function Home() {
  const [events, setEvents] = useState<DisasterEvent[]>([]);
  const [activity, setActivity] = useState<ActivityLogEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportDetail | null>(
    null,
  );
  const [reportLoading, setReportLoading] = useState(false);
  const [weatherSeverity, setWeatherSeverity] = useState<number | null>(null);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedId),
    [events, selectedId],
  );

  useEffect(() => {
    setWeatherSeverity(null);
  }, [selectedEvent?.id]);

  const metrics = useMemo(() => {
    if (events.length === 0) {
      return {
        activeDisasters: 0,
        avgConfidence: 0,
        totalReports: 0,
        highRiskZones: 0,
      };
    }

    const totalReports = events.reduce(
      (sum, event) =>
        sum +
        event.socialCount +
        event.newsCount +
        event.userReports +
        event.whatsappReports,
      0,
    );

    const avgConfidence = Math.round(
      events.reduce((sum, event) => sum + event.confidenceScore, 0) /
        events.length,
    );

    const highRiskZones = events.filter(
      (event) => event.severity === "high",
    ).length;

    return {
      activeDisasters: events.length,
      avgConfidence,
      totalReports,
      highRiskZones,
    };
  }, [events]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [eventsResponse, feedResponse, newsResponse] = await Promise.all([
        fetchEvents(),
        fetchDashboardFeed(),
        fetchNews(),
      ]);

      const mappedEvents = eventsResponse.map(mapApiEvent);
      setEvents(mappedEvents);

      if (mappedEvents.length > 0) {
        if (
          !selectedId ||
          !mappedEvents.some((event) => event.id === selectedId)
        ) {
          setSelectedId(mappedEvents[0].id);
        }
      }

      setActivity(buildActivity(feedResponse));
      setNewsArticles(newsResponse.articles);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectEntry = async (entry: ActivityLogEntry) => {
    if (!entry.reportId) {
      return;
    }
    setSelectedReportId(entry.reportId);
    setReportLoading(true);
    try {
      const detail = await fetchReport(entry.reportId);
      setSelectedReport(detail);
    } catch (error) {
      console.error(error);
    } finally {
      setReportLoading(false);
    }
  };

  const handleCloseReport = () => {
    setSelectedReportId(null);
    setSelectedReport(null);
  };

  const handleRefresh = () => {
    loadData();
  };

  const breakdown =
    selectedEvent != null ? getSourceBreakdown(selectedEvent) : null;
  const breakdownWithWeather =
    breakdown && weatherSeverity != null
      ? { ...breakdown, weatherSeverity }
      : breakdown;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06070b] text-slate-100">
      <div className="lp-ambient pointer-events-none absolute inset-0 -z-10" />
      <div className="lp-orbit pointer-events-none absolute inset-0 -z-10" />
      <div className="lp-grain pointer-events-none absolute inset-0 -z-10" />
      <HeaderBar onRefresh={handleRefresh} />

      <main className="h-[calc(100vh-72px)] p-4 sm:p-5">
        <div className="mx-auto flex h-full w-full max-w-[1500px] flex-col gap-4">
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-12">
            <section className="h-full xl:col-span-8">
              {loading ? (
                <div className="flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <div className="flex h-full flex-col gap-3">
                    <Skeleton className="h-8 w-56" />
                    <Skeleton className="h-full w-full rounded-xl" />
                  </div>
                </div>
              ) : (
                <DisasterMap
                  events={events}
                  selectedEventId={selectedEvent?.id}
                  onSelectEvent={setSelectedId}
                  weatherSeverity={weatherSeverity ?? undefined}
                />
              )}
            </section>

            <aside className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto pr-1 xl:col-span-4">
              {loading ? (
                <>
                  <Skeleton className="h-24 w-full rounded-2xl" />
                  <Skeleton className="h-40 w-full rounded-2xl" />
                  <Skeleton className="h-40 w-full rounded-2xl" />
                  <Skeleton className="h-32 w-full rounded-2xl" />
                  <Skeleton className="h-32 w-full rounded-2xl" />
                  <Skeleton className="h-32 w-full rounded-2xl" />
                </>
              ) : (
                <>
                  <MetricsBar
                    activeDisasters={metrics.activeDisasters}
                    avgConfidence={metrics.avgConfidence}
                    totalReports={metrics.totalReports}
                    highRiskZones={metrics.highRiskZones}
                  />
                  <EventDetailsPanel
                    event={selectedEvent}
                    weatherSeverity={weatherSeverity ?? undefined}
                  />
                  {selectedEvent ? (
                    <WeatherForecastPanel
                      event={selectedEvent}
                      onSeverityChange={setWeatherSeverity}
                    />
                  ) : null}
                  <RiskDistributionPanel events={events} />
                  <ReportDetailsPanel
                    report={selectedReportId ? selectedReport : null}
                    loading={reportLoading}
                    onClose={handleCloseReport}
                  />
                  <NewsPanel articles={newsArticles} />

                  <ActivityFeed
                    entries={activity}
                    onSelectEntry={handleSelectEntry}
                  />
                </>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
