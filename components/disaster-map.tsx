"use client";

import "leaflet/dist/leaflet.css";

import { Fragment, useMemo } from "react";
import type { DivIcon } from "leaflet";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Marker,
} from "react-leaflet";
import { DisasterEvent } from "../lib/types";
import {
  getSeverityColor,
  getSeverityLabel,
  INDIA_CENTER,
} from "../lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type DisasterMapProps = {
  events: DisasterEvent[];
  selectedEventId?: string;
  onSelectEvent: (id: string) => void;
};

let leafletInstance: typeof import("leaflet") | null = null;

if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const leafletModule = require("leaflet") as typeof import("leaflet") & {
    default?: typeof import("leaflet");
  };
  leafletInstance = leafletModule.default ?? leafletModule;
}

function confidenceIcon(score: number, highRisk: boolean): DivIcon | undefined {
  if (!leafletInstance) {
    return undefined;
  }

  const pulseClass = highRisk ? "resq-pulse" : "";

  return leafletInstance.divIcon({
    className: "",
    html: `<div class="${pulseClass}" style="display:flex;align-items:center;justify-content:center;width:34px;height:22px;border-radius:6px;border:1px solid #334155;background:#020617;color:#e2e8f0;font-size:11px;font-weight:600;">${score}%</div>`,
    iconSize: [34, 22],
    iconAnchor: [17, 34],
  });
}

export function DisasterMap({
  events,
  selectedEventId,
  onSelectEvent,
}: DisasterMapProps) {
  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? events[0],
    [events, selectedEventId],
  );

  return (
    <Card className="relative h-full overflow-hidden">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-base font-semibold text-slate-100">
          Live Disaster Map
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-56px)] p-0">
        <div className="relative h-full w-full">
          <MapContainer
            center={INDIA_CENTER}
            zoom={5}
            minZoom={4}
            maxZoom={12}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {events.map((event) => {
              const highRisk = event.confidenceScore >= 85;

              return (
                <Fragment key={event.id}>
                  <CircleMarker
                    center={[event.location.lat, event.location.lng]}
                    radius={event.id === selectedEvent?.id ? 18 : 14}
                    pathOptions={{
                      color: getSeverityColor(event.severity),
                      fillColor: getSeverityColor(event.severity),
                      fillOpacity: 0.25,
                      weight: 2,
                    }}
                    eventHandlers={{
                      click: () => onSelectEvent(event.id),
                    }}
                  >
                    <Popup>
                      <div className="space-y-1 text-xs">
                        <p className="font-semibold">{event.name}</p>
                        <p>{event.location.label}</p>
                        <p>Confidence: {event.confidenceScore}%</p>
                      </div>
                    </Popup>
                  </CircleMarker>

                  <Marker
                    position={[event.location.lat, event.location.lng]}
                    icon={confidenceIcon(event.confidenceScore, highRisk)}
                    eventHandlers={{
                      click: () => onSelectEvent(event.id),
                    }}
                  />
                </Fragment>
              );
            })}
          </MapContainer>
          <div className="pointer-events-none absolute inset-0 z-350 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.24),transparent_45%),radial-gradient(circle_at_bottom,rgba(129,140,248,0.3),transparent_55%)]" />

          {selectedEvent ? (
            <div className="pointer-events-none absolute bottom-4 left-4 z-500 max-w-sm rounded-lg border border-white/10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.32),transparent_55%),rgba(15,23,42,0.96)] p-3 shadow-[0_20px_70px_rgba(15,23,42,0.95)] backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                Selected Event
              </p>
              <p className="text-base font-semibold text-slate-100">
                {selectedEvent.name}
              </p>
              <p className="text-sm text-slate-300">
                {selectedEvent.location.label}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs">
                <span className="rounded border border-white/10 bg-slate-900/60 px-2 py-1 text-slate-200">
                  Severity: {getSeverityLabel(selectedEvent.severity)}
                </span>
                <span className="rounded border border-white/10 bg-slate-900/60 px-2 py-1 text-slate-200">
                  Confidence: {selectedEvent.confidenceScore}%
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
