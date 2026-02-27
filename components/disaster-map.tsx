"use client";

import "leaflet/dist/leaflet.css";

import { Fragment, useMemo } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, CircleMarker, Popup, Marker } from "react-leaflet";
import { DisasterEvent } from "../lib/types";
import { getSeverityColor, getSeverityLabel, INDIA_CENTER } from "../lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type DisasterMapProps = {
  events: DisasterEvent[];
  selectedEventId?: string;
  onSelectEvent: (id: string) => void;
};

function confidenceIcon(score: number, highRisk: boolean) {
  const pulseClass = highRisk ? "resq-pulse" : "";

  return L.divIcon({
    className: "",
    html: `<div class="${pulseClass}" style="display:flex;align-items:center;justify-content:center;width:34px;height:22px;border-radius:6px;border:1px solid #334155;background:#020617;color:#e2e8f0;font-size:11px;font-weight:600;">${score}%</div>`,
    iconSize: [34, 22],
    iconAnchor: [17, 34],
  });
}

export function DisasterMap({ events, selectedEventId, onSelectEvent }: DisasterMapProps) {
  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? events[0],
    [events, selectedEventId],
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Live Disaster Map</CardTitle>
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
          <div className="pointer-events-none absolute inset-0 z-[350] bg-[radial-gradient(circle_at_top,rgba(2,6,23,0.35),transparent_45%),radial-gradient(circle_at_bottom,rgba(2,6,23,0.55),transparent_55%)]" />

          {selectedEvent ? (
            <div className="pointer-events-none absolute bottom-4 left-4 z-[500] max-w-sm rounded-md border border-slate-700 bg-slate-950/95 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Selected Event</p>
              <p className="text-base font-semibold text-slate-100">{selectedEvent.name}</p>
              <p className="text-sm text-slate-300">{selectedEvent.location.label}</p>
              <div className="mt-2 flex items-center gap-3 text-xs">
                <span className="rounded border border-slate-700 px-2 py-1 text-slate-300">
                  Severity: {getSeverityLabel(selectedEvent.severity)}
                </span>
                <span className="rounded border border-slate-700 px-2 py-1 text-slate-300">
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
