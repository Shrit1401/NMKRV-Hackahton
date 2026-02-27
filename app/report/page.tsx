"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Gauge,
  Shield,
  Siren,
  Waves,
  Wind,
} from "lucide-react";

type DisasterType = "flood" | "storm" | "wildfire" | "earthquake";

type ModelInputs = {
  rainfall: number;
  wind: number;
  fieldReports: number;
  peopleDensity: number;
};

const baseInputs: ModelInputs = {
  rainfall: 78,
  wind: 42,
  fieldReports: 320,
  peopleDensity: 74,
};

const typeFactors: Record<DisasterType, number> = {
  flood: 1.1,
  storm: 1.0,
  wildfire: 1.05,
  earthquake: 1.2,
};

const typeLabels: Record<DisasterType, string> = {
  flood: "Flood",
  storm: "Storm",
  wildfire: "Wildfire",
  earthquake: "Earthquake",
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function NewPage() {
  const [disaster, setDisaster] = useState<DisasterType>("flood");
  const [inputs, setInputs] = useState<ModelInputs>(baseInputs);

  const model = useMemo(() => {
    const rainfallFactor = inputs.rainfall / 120;
    const windFactor = inputs.wind / 140;
    const reportFactor = inputs.fieldReports / 600;
    const densityFactor = inputs.peopleDensity / 100;

    const rawRisk =
      (rainfallFactor * 0.35 +
        windFactor * 0.2 +
        reportFactor * 0.25 +
        densityFactor * 0.2) *
      100 *
      typeFactors[disaster];

    const riskScore = Math.round(clamp(rawRisk, 3, 99));
    const affectedPopulation = Math.round(
      1800 + riskScore * 84 + inputs.peopleDensity * 31,
    );
    const evacuationWindowMin = Math.round(
      clamp(180 - riskScore * 1.35, 24, 170),
    );
    const medicalTeams = Math.max(2, Math.round(riskScore / 16));
    const rescueUnits = Math.max(
      2,
      Math.round((inputs.rainfall + inputs.wind) / 28),
    );

    const dataCoverage = clamp((inputs.fieldReports / 700) * 100, 12, 100);
    const sourceAgreement = clamp(
      100 - Math.abs(inputs.rainfall - inputs.wind * 0.72),
      28,
      98,
    );
    const sensorHealth = clamp(
      86 + (disaster === "earthquake" ? -7 : 2) - riskScore * 0.08,
      40,
      96,
    );
    const forecastStability = clamp(
      91 - riskScore * 0.34 + inputs.fieldReports / 55,
      35,
      97,
    );

    const weightedConfidence =
      dataCoverage * 0.35 +
      sourceAgreement * 0.25 +
      sensorHealth * 0.2 +
      forecastStability * 0.2;

    const disasterPenalty =
      disaster === "earthquake" ? 0.92 : disaster === "wildfire" ? 0.95 : 1;

    const confidence = Math.round(
      clamp(weightedConfidence * disasterPenalty, 42, 98),
    );

    const actionTone =
      riskScore > 78
        ? "Critical escalation"
        : riskScore > 55
          ? "High urgency"
          : "Managed response";

    return {
      riskScore,
      affectedPopulation,
      evacuationWindowMin,
      medicalTeams,
      rescueUnits,
      confidence,
      actionTone,
      confidenceInputs: {
        dataCoverage,
        sourceAgreement,
        sensorHealth,
        forecastStability,
      },
    };
  }, [inputs, disaster]);

  const playbook = useMemo(
    () => [
      {
        t: "T+00",
        text: `Trigger ${typeLabels[disaster].toLowerCase()} alert and notify district control rooms.`,
      },
      {
        t: "T+10",
        text: `Deploy ${model.rescueUnits} rescue units to highest-risk zones first.`,
      },
      {
        t: "T+20",
        text: `Pre-position ${model.medicalTeams} medical teams near shelters and hospitals.`,
      },
      {
        t: "T+30",
        text: `Push route guidance before the ${model.evacuationWindowMin}-minute window narrows.`,
      },
    ],
    [disaster, model.rescueUnits, model.medicalTeams, model.evacuationWindowMin],
  );

  const twinNodes = useMemo(() => {
    const highRisk = model.riskScore >= 78;
    const mediumRisk = model.riskScore >= 56;

    return [
      {
        id: "zone-a",
        label: "Shelter Grid",
        x: "14%",
        y: "66%",
        status: mediumRisk ? "watch" : "stable",
      },
      {
        id: "zone-b",
        label: "River Edge",
        x: "38%",
        y: "44%",
        status: highRisk ? "risk" : mediumRisk ? "watch" : "stable",
      },
      {
        id: "zone-c",
        label: "Hospital",
        x: "61%",
        y: "30%",
        status: highRisk ? "watch" : "stable",
      },
      {
        id: "zone-d",
        label: "Evac Route",
        x: "82%",
        y: "58%",
        status: highRisk ? "risk" : "watch",
      },
    ] as const;
  }, [model.riskScore]);

  const setInput = (key: keyof ModelInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06070b] text-[#f5f5ef]">
      <div className="lp-ambient pointer-events-none absolute inset-0" />
      <div className="lp-orbit pointer-events-none absolute inset-0" />
      <div className="lp-grain pointer-events-none absolute inset-0" />

      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-10 lg:px-14">
        <header className="lp-reveal flex items-center justify-between">
          <div>
            <p className="text-xs tracking-[0.2em] text-[#d2f6c5]/85 uppercase">
              ResQNet Lab
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Output Report Simulation Engine
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/65 sm:text-base">
              Simulate flood and multi-disaster scenarios, then generate a
              confidence-aware operational report in real time.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-xs tracking-[0.14em] text-white/80 uppercase transition hover:bg-white/[0.1]"
          >
            Open Ops Dashboard
            <ArrowRight className="size-3.5" />
          </Link>
        </header>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_1.25fr]">
          <div className="lp-reveal [animation-delay:120ms] rounded-3xl border border-white/12 bg-black/30 p-5 backdrop-blur-xl">
            <p className="text-xs tracking-[0.16em] text-white/50 uppercase">Scenario Inputs</p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {(["flood", "storm", "wildfire", "earthquake"] as DisasterType[]).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setDisaster(kind)}
                  className={`rounded-xl border px-3 py-2 text-sm transition ${
                    disaster === kind
                      ? "border-[#d2ffd3]/50 bg-[#d2ffd3]/12 text-[#efffed]"
                      : "border-white/12 bg-white/[0.02] text-white/70 hover:bg-white/[0.05]"
                  }`}
                >
                  {typeLabels[kind]}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              <Control
                label="Rainfall intensity"
                value={inputs.rainfall}
                min={0}
                max={150}
                unit="mm/h"
                onChange={(v) => setInput("rainfall", v)}
              />
              <Control
                label="Wind speed"
                value={inputs.wind}
                min={0}
                max={180}
                unit="km/h"
                onChange={(v) => setInput("wind", v)}
              />
              <Control
                label="Field reports"
                value={inputs.fieldReports}
                min={0}
                max={700}
                unit="signals"
                onChange={(v) => setInput("fieldReports", v)}
              />
              <Control
                label="Population density"
                value={inputs.peopleDensity}
                min={10}
                max={100}
                unit="index"
                onChange={(v) => setInput("peopleDensity", v)}
              />
            </div>
          </div>

          <div className="lp-reveal [animation-delay:220ms] space-y-5">
            <div className="rounded-3xl border border-[#d2ffd3]/25 bg-black/35 p-5 backdrop-blur-xl">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs tracking-[0.16em] text-white/50 uppercase">Simulation Output</p>
                  <p className="mt-1 text-2xl font-semibold">{model.actionTone}</p>
                </div>
                <div className="rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-xs tracking-[0.14em] text-white/75 uppercase">
                  {typeLabels[disaster]} Scenario
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Metric icon={<Gauge className="size-4" />} label="Risk score" value={`${model.riskScore}/100`} />
                <Metric icon={<Siren className="size-4" />} label="Estimated affected" value={model.affectedPopulation.toLocaleString()} />
                <Metric icon={<Shield className="size-4" />} label="Evacuation window" value={`${model.evacuationWindowMin} min`} />
                <Metric icon={<Waves className="size-4" />} label="Rescue units" value={`${model.rescueUnits}`} />
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] tracking-[0.14em] text-white/55 uppercase">Confidence Meter</p>
                  <div
                    className="confidence-ring mt-3"
                    style={{
                      background: `conic-gradient(#d2ffd3 0deg ${model.confidence * 3.6}deg, rgba(255,255,255,0.12) ${model.confidence * 3.6}deg 360deg)`,
                    }}
                  >
                    <div className="confidence-core">
                      <p className="text-2xl font-semibold">{model.confidence}%</p>
                      <p className="text-[10px] tracking-[0.12em] text-white/55 uppercase">
                        model trust
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] tracking-[0.14em] text-white/55 uppercase">
                    How Confidence Is Calculated
                  </p>
                  <p className="mt-2 text-xs text-white/70">
                    confidence = (coverage x 0.35) + (agreement x 0.25) +
                    (sensor health x 0.20) + (forecast stability x 0.20), then
                    adjusted by disaster uncertainty.
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <CalcItem label="Data coverage" value={model.confidenceInputs.dataCoverage} weight="35%" />
                    <CalcItem label="Source agreement" value={model.confidenceInputs.sourceAgreement} weight="25%" />
                    <CalcItem label="Sensor health" value={model.confidenceInputs.sensorHealth} weight="20%" />
                    <CalcItem label="Forecast stability" value={model.confidenceInputs.forecastStability} weight="20%" />
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] tracking-[0.14em] text-white/55 uppercase">Autonomous Playbook</p>
                <div className="mt-3 space-y-2">
                  {playbook.map((item) => (
                    <div key={item.t} className="flex gap-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                      <span className="font-mono text-xs text-[#d2ffd3]">{item.t}</span>
                      <p className="text-xs text-white/78">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/12 bg-black/30 p-5 backdrop-blur-xl">
              <p className="text-xs tracking-[0.16em] text-white/50 uppercase">Twin Pulse</p>
              <div className="mt-3 twin-shell rounded-2xl border border-white/12 p-3">
                <div className="relative h-44 overflow-hidden rounded-xl border border-white/12 bg-[#060b12]">
                  <div className="twin-grid absolute inset-0" />
                  <div className="twin-scan absolute inset-0" />
                  <div className="twin-beam absolute inset-x-[10%] top-[30%] z-10 h-px" />
                  <div className="twin-beam absolute inset-x-[20%] top-[56%] z-10 h-px [animation-delay:650ms]" />
                  <div className="twin-link absolute left-[17%] top-[62%] z-10 h-px w-[26%] rotate-[-20deg]" />
                  <div className="twin-link absolute left-[42%] top-[40%] z-10 h-px w-[22%] rotate-[-15deg]" />
                  <div className="twin-link absolute left-[64%] top-[45%] z-10 h-px w-[20%] rotate-[16deg]" />

                  {twinNodes.map((node, index) => (
                    <div key={node.id} className="absolute z-20" style={{ left: node.x, top: node.y }}>
                      <span
                        className={`twin-node ${
                          node.status === "risk"
                            ? "twin-node-risk"
                            : node.status === "watch"
                              ? "twin-node-watch"
                              : "twin-node-stable"
                        }`}
                        style={{ animationDelay: `${index * 180}ms` }}
                      />
                      <p className="mt-1 -translate-x-1/4 text-[10px] text-white/60">{node.label}</p>
                    </div>
                  ))}

                  <div className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/35 px-2 py-1 text-[10px] tracking-[0.12em] text-white/70 uppercase">
                    {typeLabels[disaster]} Mode
                  </div>
                  <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-[#9ee7ff]/30 bg-[#9ee7ff]/10 px-2 py-1 text-[10px] text-[#def8ff]">
                    <Wind className="size-3" />
                    Twin Sync Live
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-reveal [animation-delay:320ms] mt-5 rounded-3xl border border-white/12 bg-black/30 p-5 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs tracking-[0.16em] text-white/50 uppercase">Output Report Simulation</p>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[11px] tracking-[0.13em] text-white/80 uppercase transition hover:bg-white/[0.08]"
            >
              <FileText className="size-3.5" />
              Export Simulation Brief
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[11px] tracking-[0.13em] text-white/55 uppercase">Incident Summary</p>
              <p className="mt-2 text-sm text-white/80">
                {typeLabels[disaster]} scenario indicates a {model.actionTone.toLowerCase()} state with projected impact on around {model.affectedPopulation.toLocaleString()} people.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[11px] tracking-[0.13em] text-white/55 uppercase">Resource Plan</p>
              <p className="mt-2 text-sm text-white/80">
                Recommended deployment: {model.rescueUnits} rescue units, {model.medicalTeams} medical teams, with evacuation routing prioritized inside the next {model.evacuationWindowMin} minutes.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[11px] tracking-[0.13em] text-white/55 uppercase">Confidence Note</p>
              <p className="mt-2 text-sm text-white/80">
                Current confidence is {model.confidence}% based on signal coverage, source agreement, sensor health, and forecast stability. Trigger human verification if confidence drops below 60%.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

type MetricProps = {
  icon: ReactNode;
  label: string;
  value: string;
};

function Metric({ icon, label, value }: MetricProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
      <div className="flex items-center gap-2 text-white/60">
        {icon}
        <p className="text-xs tracking-[0.08em] uppercase">{label}</p>
      </div>
      <p className="mt-2 text-xl font-semibold text-white/92">{value}</p>
    </div>
  );
}

type CalcItemProps = {
  label: string;
  value: number;
  weight: string;
};

function CalcItem({ label, value, weight }: CalcItemProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 px-2.5 py-2">
      <p className="text-[10px] text-white/58">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white/88">{Math.round(value)}%</p>
      <p className="text-[10px] text-white/48">weight {weight}</p>
    </div>
  );
}

type ControlProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
};

function Control({ label, value, min, max, unit, onChange }: ControlProps) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-white/75">{label}</span>
        <span className="text-xs font-mono text-white/60">
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[#d2ffd3]"
      />
    </label>
  );
}
