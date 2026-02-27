"use client";

import "leaflet/dist/leaflet.css";

import { Fragment, useEffect, useMemo, useState } from "react";
import type { DivIcon } from "leaflet";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Marker,
  Polyline,
} from "react-leaflet";
import { DisasterEvent } from "../lib/types";
import {
  getSeverityColor,
  getSeverityLabel,
  getWeatherSeverityLabel,
  INDIA_CENTER,
} from "../lib/disaster-utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type DisasterMapProps = {
  events: DisasterEvent[];
  selectedEventId?: string;
  onSelectEvent: (id: string) => void;
  weatherSeverity?: number | null;
};

type SimulationMode =
  | "all"
  | "flood"
  | "storm"
  | "network"
  | "landslide"
  | "other";

function getSimulationModeForType(type: string): SimulationMode {
  const normalized = type.toLowerCase();
  if (
    normalized.includes("landslide") ||
    normalized.includes("mudslide") ||
    normalized.includes("rockfall") ||
    normalized.includes("slope")
  ) {
    return "landslide";
  }
  if (
    normalized.includes("flood") ||
    normalized.includes("inundation") ||
    normalized.includes("dam") ||
    normalized.includes("river")
  ) {
    return "flood";
  }
  if (
    normalized.includes("cyclone") ||
    normalized.includes("storm") ||
    normalized.includes("wind") ||
    normalized.includes("thunder")
  ) {
    return "storm";
  }
  if (normalized === "other" || normalized === "unknown") {
    return "other";
  }
  return "other";
}

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API;

let leafletInstance: typeof import("leaflet") | null = null;
const confidenceIconCache = new Map<string, DivIcon>();

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
  const cacheKey = `${score}-${pulseClass}`;
  const cached = confidenceIconCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const icon = leafletInstance.divIcon({
    className: "",
    html: `<div class="${pulseClass}" style="display:flex;align-items:center;justify-content:center;width:34px;height:22px;border-radius:6px;border:1px solid #334155;background:#020617;color:#e2e8f0;font-size:11px;font-weight:600;">${score}%</div>`,
    iconSize: [34, 22],
    iconAnchor: [17, 34],
  });

  confidenceIconCache.set(cacheKey, icon);
  return icon;
}

export function DisasterMap({
  events,
  selectedEventId,
  onSelectEvent,
  weatherSeverity,
}: DisasterMapProps) {
  const [showWeatherLayer, setShowWeatherLayer] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);
  const [simulationMode, setSimulationMode] = useState<SimulationMode>("all");
  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? events[0],
    [events, selectedEventId],
  );

  useEffect(() => {
    if (!isSimulating) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSimulationTime((prev) => {
        const step = 0.06;
        const next = prev + step;
        if (next >= 1) return 0;
        return next;
      });
    }, 200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isSimulating]);

  useEffect(() => {
    if (!selectedEvent) {
      return;
    }
    if (simulationMode === "all") {
      return;
    }
    setSimulationMode(getSimulationModeForType(selectedEvent.type));
  }, [selectedEvent?.id, selectedEvent?.type, simulationMode]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k") {
        setIsSimulating((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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

            {OPENWEATHER_API_KEY && showWeatherLayer ? (
              <TileLayer
                attribution='&copy; <a href="https://openweathermap.org/">OpenWeather</a>'
                url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`}
                opacity={0.9}
              />
            ) : null}

            {events.map((event) => {
              const highRisk = event.confidenceScore >= 85;
              const eventType = event.type.toLowerCase();
              const isFloodLike =
                eventType.includes("flood") ||
                eventType.includes("inundation") ||
                eventType.includes("dam") ||
                eventType.includes("river");
              const isStormLike =
                eventType.includes("cyclone") ||
                eventType.includes("storm") ||
                eventType.includes("wind") ||
                eventType.includes("thunder");
              const isLandslideLike =
                eventType.includes("landslide") ||
                eventType.includes("mudslide") ||
                eventType.includes("rockfall") ||
                eventType.includes("slope");
              const isOtherType =
                !isFloodLike && !isStormLike && !isLandslideLike;

              const phase = (simulationTime + event.confidenceScore / 140) % 1;
              const baseEnvelope = 1 - Math.abs(0.5 - phase) * 2;
              const intensity = 0.25 + 0.55 * baseEnvelope;
              const baseRadius = event.id === selectedEvent?.id ? 26 : 20;
              const waveRadius = baseRadius + phase * 22;
              const stormRadius = baseRadius + baseEnvelope * 26;
              const landslideRadius = baseRadius + baseEnvelope * 20;
              const otherRadius = baseRadius + 6 + baseEnvelope * 10;

              const showFloodLayer =
                (simulationMode === "all" || simulationMode === "flood") &&
                isFloodLike;
              const showStormLayer =
                (simulationMode === "all" || simulationMode === "storm") &&
                isStormLike;
              const showLandslideLayer =
                (simulationMode === "all" || simulationMode === "landslide") &&
                isLandslideLike;
              const showOtherLayer =
                (simulationMode === "all" || simulationMode === "other") &&
                isOtherType;
              const showNetworkLayer =
                (simulationMode === "all" || simulationMode === "network") &&
                highRisk;

              return (
                <Fragment key={event.id}>
                  {showFloodLayer ? (
                    <CircleMarker
                      center={[event.location.lat, event.location.lng]}
                      radius={waveRadius}
                      pathOptions={{
                        color: "rgba(56,189,248,0.7)",
                        fillColor: "rgba(56,189,248,0.45)",
                        fillOpacity: intensity,
                        weight: 1.5,
                      }}
                      stroke
                    />
                  ) : null}

                  {showStormLayer ? (
                    <CircleMarker
                      center={[event.location.lat, event.location.lng]}
                      radius={stormRadius}
                      pathOptions={{
                        color: "rgba(190, 242, 100, 0.6)",
                        fillColor: "rgba(250, 250, 250, 0.18)",
                        fillOpacity: 0.15 + 0.6 * baseEnvelope,
                        weight: 2.2,
                        dashArray: "4 4",
                      }}
                      stroke
                    />
                  ) : null}

                  {showLandslideLayer ? (
                    <CircleMarker
                      center={[event.location.lat, event.location.lng]}
                      radius={landslideRadius}
                      pathOptions={{
                        color: "rgba(248, 165, 76, 0.9)",
                        fillColor: "rgba(30, 64, 175, 0.45)",
                        fillOpacity: 0.2 + 0.55 * baseEnvelope,
                        weight: 2.1,
                      }}
                      stroke
                    />
                  ) : null}

                  {showOtherLayer ? (
                    <CircleMarker
                      center={[event.location.lat, event.location.lng]}
                      radius={otherRadius}
                      pathOptions={{
                        color: "rgba(244, 114, 182, 0.85)",
                        fillColor: "rgba(24, 24, 37, 0.9)",
                        fillOpacity: 0.5,
                        weight: 2,
                        dashArray: "1 3",
                      }}
                      stroke
                    />
                  ) : null}

                  {showNetworkLayer ? (
                    <CircleMarker
                      center={[event.location.lat, event.location.lng]}
                      radius={baseRadius + 10}
                      pathOptions={{
                        color: "rgba(94, 234, 212, 0.85)",
                        fillColor: "rgba(15, 23, 42, 0.9)",
                        fillOpacity: 0.4,
                        weight: 2.4,
                      }}
                      stroke
                    />
                  ) : null}
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
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                          {event.type}
                        </p>
                        <p>{event.location.label}</p>
                        <p>Confidence: {event.confidenceScore}%</p>
                        <p>
                          Weather:{" "}
                          {getWeatherSeverityLabel(event.weatherSeverity)} (
                          {event.weatherSeverity.toFixed(1)}/10)
                        </p>
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
          {OPENWEATHER_API_KEY ? (
            <div className="pointer-events-auto absolute right-4 top-4 z-500 flex items-center gap-2 rounded-md border border-white/10 bg-slate-900/80 px-3 py-1.5 text-[11px] text-slate-200 shadow-lg backdrop-blur">
              <span className="uppercase tracking-[0.16em] text-slate-400">
                Weather Layer
              </span>
              <button
                type="button"
                onClick={() => setShowWeatherLayer((prev) => !prev)}
                className={[
                  "rounded px-2 py-0.5 text-xs font-medium transition",
                  showWeatherLayer
                    ? "bg-sky-500 text-slate-950 shadow-sm"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700",
                ].join(" ")}
              >
                {showWeatherLayer ? "On" : "Off"}
              </button>
            </div>
          ) : null}
          <div
            className={[
              "pointer-events-none absolute inset-0 z-350 transition-opacity duration-300",
              showWeatherLayer
                ? "opacity-100 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.45),transparent_45%),radial-gradient(circle_at_bottom,rgba(56,189,248,0.4),transparent_55%)]"
                : "opacity-70 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.24),transparent_45%),radial-gradient(circle_at_bottom,rgba(129,140,248,0.3),transparent_55%)]",
            ]
              .filter(Boolean)
              .join(" ")}
          />
          <div
            className={[
              "pointer-events-none absolute inset-0 z-360",
              (simulationMode === "all" || simulationMode === "flood") &&
                "resq-flood-overlay",
              (simulationMode === "all" || simulationMode === "storm") &&
                "resq-storm-overlay",
              (simulationMode === "all" || simulationMode === "network") &&
                "resq-network-overlay",
              (simulationMode === "all" || simulationMode === "landslide") &&
                "resq-landslide-overlay",
              (simulationMode === "all" || simulationMode === "other") &&
                "resq-other-overlay",
            ]
              .filter(Boolean)
              .join(" ")}
          />
          <div className="resq-radar-overlay z-370" />

          {selectedEvent ? (
            <div className="pointer-events-auto absolute left-4 top-4 z-500 flex items-center gap-3 rounded-md border border-sky-500/40 bg-slate-950/85 px-3 py-1.5 text-[11px] text-sky-100 shadow-xl backdrop-blur">
              <div className="flex flex-col gap-0.5">
                <span className="uppercase tracking-[0.16em] text-sky-300/80">
                  Simulation Modes
                </span>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="rounded bg-slate-900/70 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.18em] text-slate-300">
                    {simulationMode === "all"
                      ? "All Modes"
                      : simulationMode === "flood"
                        ? "Flood"
                        : simulationMode === "storm"
                          ? "Storm"
                          : simulationMode === "network"
                            ? "Network"
                            : simulationMode === "landslide"
                              ? "Landslide"
                              : "Other"}
                  </span>
                  <span className="text-slate-400">
                    {Math.round(simulationTime * 180)
                      .toString()
                      .padStart(3, "0")}{" "}
                    min scenario
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <select
                  value={simulationMode}
                  onChange={(event) =>
                    setSimulationMode(event.target.value as SimulationMode)
                  }
                  className="rounded border border-sky-500/40 bg-slate-950/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-100 shadow-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-500"
                >
                  <option value="all">All (combined)</option>
                  <option value="flood">Flood</option>
                  <option value="storm">Storm</option>
                  <option value="network">Network</option>
                  <option value="landslide">Landslide</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => setIsSimulating((prev) => !prev)}
                className={[
                  "rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide transition",
                  isSimulating
                    ? "bg-sky-500 text-slate-950 shadow-sm"
                    : "bg-slate-800 text-slate-100 hover:bg-slate-700",
                ].join(" ")}
              >
                {isSimulating ? "Pause" : "Play"}
              </button>
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-800/80">
                <div
                  className="h-full bg-linear-to-r from-sky-400 via-cyan-300 to-indigo-400 transition-[width] duration-150"
                  style={{ width: `${Math.max(simulationTime, 0.02) * 100}%` }}
                />
              </div>
            </div>
          ) : null}

          {selectedEvent ? (
            <div className="pointer-events-none absolute bottom-4 left-4 z-500 max-w-sm rounded-lg border border-white/10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.32),transparent_55%),rgba(15,23,42,0.96)] p-3 shadow-[0_20px_70px_rgba(15,23,42,0.95)] backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                Selected Event
              </p>
              <div className="flex items-center gap-2">
                <p className="text-base font-semibold text-slate-100">
                  {selectedEvent.name}
                </p>
                <span className="rounded-full border border-white/15 bg-slate-900/70 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-300">
                  {selectedEvent.type}
                </span>
              </div>
              <p className="text-sm text-slate-300">
                {selectedEvent.location.label}
              </p>
              <p className="mt-0.5 text-[11px] font-mono text-slate-400">
                Lat {selectedEvent.location.lat.toFixed(3)}, Lng{" "}
                {selectedEvent.location.lng.toFixed(3)}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs">
                <span className="rounded border border-white/10 bg-slate-900/60 px-2 py-1 text-slate-200">
                  Severity: {getSeverityLabel(selectedEvent.severity)}
                </span>
                <span className="rounded border border-white/10 bg-slate-900/60 px-2 py-1 text-slate-200">
                  Confidence: {selectedEvent.confidenceScore}%
                </span>
                {(() => {
                  const score =
                    typeof weatherSeverity === "number"
                      ? weatherSeverity
                      : selectedEvent.weatherSeverity;
                  return (
                    <span className="rounded border border-white/10 bg-slate-900/70 px-2 py-1 text-slate-200">
                      Weather: {getWeatherSeverityLabel(score)} (
                      {score.toFixed(1)}/10)
                    </span>
                  );
                })()}
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
