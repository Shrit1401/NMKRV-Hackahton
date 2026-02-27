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
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-md border border-slate-800 bg-slate-900/40 p-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">{metric.label}</p>
            <CountValue value={metric.value} suffix={metric.suffix} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
