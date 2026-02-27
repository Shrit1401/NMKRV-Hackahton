"use client";

import { useMemo, useState } from "react";
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
import {
  getSourceBreakdown,
  initialActivityLog,
  initialDisasterEvents,
  nextLogEntry,
  signalSheetRows,
  sourceTrendData,
  simulateEvents,
} from "../lib/mock-data";
import { ActivityLogEntry, DisasterEvent } from "../lib/types";

export default function Home() {
  const [events, setEvents] = useState<DisasterEvent[]>(initialDisasterEvents);
  const [activity, setActivity] = useState<ActivityLogEntry[]>(initialActivityLog);
  const [selectedId, setSelectedId] = useState<string>(initialDisasterEvents[0].id);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedId) ?? events[0],
    [events, selectedId],
  );

  const metrics = useMemo(() => {
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

  const handleRefresh = () => {
    const next = simulateEvents(events);
    setEvents(next);

    const updatedSelected = next.find((event) => event.id === selectedId) ?? next[0];
    if (updatedSelected) {
      setActivity((prev) => [nextLogEntry(updatedSelected), ...prev].slice(0, 15));
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-950 text-slate-100">
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
            <SourceBreakdownPanel breakdown={getSourceBreakdown(selectedEvent)} />
            <SignalSheetPanel rows={signalSheetRows} />
            <ConfidenceChart trend={selectedEvent.confidenceTrend} />
            <SourceTrendPanel data={sourceTrendData} />
            <RiskDistributionPanel events={events} />
            <ActivityFeed entries={activity} />
          </aside>
        </div>
      </main>
    </div>
  );
}
