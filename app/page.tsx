"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HeaderBar } from "../components/header-bar";
import { DisasterMap } from "../components/disaster-map";
import { MetricsBar } from "../components/metrics-bar";
import { EventDetailsPanel } from "../components/event-details-panel";
import { SourceBreakdownPanel } from "../components/source-breakdown-panel";
import { ConfidenceChart } from "../components/confidence-chart";
import { ActivityFeed } from "../components/activity-feed";
import { SignalSheetPanel } from "../components/signal-sheet-panel";
import { SourceTrendPanel } from "../components/source-trend-panel";
import { RiskDistributionPanel } from "../components/risk-distribution-panel";
import { fetchDashboardFeed, fetchEvents } from "../lib/api";
import { getSourceBreakdown, makeTrend, signalSheetRows, sourceTrendData } from "../lib/mock-data";
import { ActivityLogEntry, DisasterEvent } from "../lib/types";
import type { ApiEvent, DashboardFeedResponse } from "../lib/api";

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
    confidenceTrend: makeTrend(Math.round(event.confidence)),
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

  items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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
      };
    }

    const e = item.event;
    const status = e.active ? "active" : "resolved";
    const message = `Event ${e.type} (${e.severity}) ${status} with confidence ${Math.round(e.confidence)}%`;

    return {
      id: `feed-event-${index}`,
      timestamp,
      message,
    };
  });
}

export default function Home() {
  const [events, setEvents] = useState<DisasterEvent[]>([]);
  const [activity, setActivity] = useState<ActivityLogEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedId),
    [events, selectedId],
  );

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
        sum + event.socialCount + event.newsCount + event.userReports + event.whatsappReports,
      0,
    );

    const avgConfidence = Math.round(
      events.reduce((sum, event) => sum + event.confidenceScore, 0) / events.length,
    );

    const highRiskZones = events.filter((event) => event.severity === "high").length;

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
      const [eventsResponse, feedResponse] = await Promise.all([
        fetchEvents(),
        fetchDashboardFeed(),
      ]);

      const mappedEvents = eventsResponse.map(mapApiEvent);
      setEvents(mappedEvents);

      if (mappedEvents.length > 0) {
        if (!selectedId || !mappedEvents.some((event) => event.id === selectedId)) {
          setSelectedId(mappedEvents[0].id);
        }
      }

      setActivity(buildActivity(feedResponse));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    loadData();
  };

  return (
    <div className="relative h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_55%),radial-gradient(circle_at_bottom,rgba(129,140,248,0.18),transparent_55%),linear-gradient(to_bottom,#020617,#020617)]" />
      <HeaderBar onRefresh={handleRefresh} />

      <main className="h-[calc(100vh-80px)] p-4">
        <div className="grid h-full grid-cols-1 gap-4 xl:grid-cols-10">
          <section className="h-full xl:col-span-7">
            <DisasterMap events={events} selectedEventId={selectedEvent?.id} onSelectEvent={setSelectedId} />
          </section>

          <aside className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto pr-1 xl:col-span-3">
            <MetricsBar
              activeDisasters={metrics.activeDisasters}
              avgConfidence={metrics.avgConfidence}
              totalReports={metrics.totalReports}
              highRiskZones={metrics.highRiskZones}
            />
            <EventDetailsPanel event={selectedEvent} />
            {selectedEvent ? <SourceBreakdownPanel breakdown={getSourceBreakdown(selectedEvent)} /> : null}
            <SignalSheetPanel rows={signalSheetRows} />
            {selectedEvent ? <ConfidenceChart trend={selectedEvent.confidenceTrend} /> : null}
            <SourceTrendPanel data={sourceTrendData} />
            <RiskDistributionPanel events={events} />
            <ActivityFeed entries={activity} />
          </aside>
        </div>
      </main>
    </div>
  );
}

