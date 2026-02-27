"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type Metric = {
  label: string;
  value: number;
  suffix?: string;
};

type MetricsBarProps = {
  activeDisasters: number;
  avgConfidence: number;
  totalReports: number;
  highRiskZones: number;
};

function CountValue({ value, suffix }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const totalFrames = 20;
    const step = value / totalFrames;

    const id = setInterval(() => {
      frame += 1;
      if (frame >= totalFrames) {
        setDisplay(value);
        clearInterval(id);
        return;
      }
      setDisplay(Math.round(step * frame));
    }, 20);

    return () => clearInterval(id);
  }, [value]);

  return (
    <p className="text-2xl font-semibold tabular-nums text-slate-100">
      {display}
      {suffix ? <span className="ml-1 text-sm text-slate-400">{suffix}</span> : null}
    </p>
  );
}

export function MetricsBar({
  activeDisasters,
  avgConfidence,
  totalReports,
  highRiskZones,
}: MetricsBarProps) {
  const metrics: Metric[] = [
    { label: "Active Disasters", value: activeDisasters },
    { label: "Avg Confidence", value: avgConfidence, suffix: "%" },
    { label: "Total Reports", value: totalReports },
    { label: "High Risk Zones", value: highRiskZones },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metrics</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className={[
              "relative overflow-hidden rounded-md border border-white/5 bg-slate-950/60 p-3 shadow-[0_0_35px_rgba(15,23,42,0.85)]",
              index === 0 && "bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.25),transparent_55%),#020617]",
              index === 1 && "bg-[radial-gradient(circle_at_top,rgba(129,140,248,0.28),transparent_55%),#020617]",
              index === 2 && "bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.28),transparent_55%),#020617]",
              index === 3 && "bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.32),transparent_55%),#020617]",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">{metric.label}</p>
            <CountValue value={metric.value} suffix={metric.suffix} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
