"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, RefreshCw } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

type HeaderBarProps = {
  onRefresh: () => void;
};

export function HeaderBar({ onRefresh }: HeaderBarProps) {
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => {
      setClock(
        new Date().toLocaleString("en-IN", {
          hour12: false,
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-white/5 bg-linear-to-r from-slate-950/80 via-slate-950/60 to-slate-950/80 px-5 backdrop-blur-xl shadow-[0_18px_60px_rgba(15,23,42,0.9)]">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-400/40 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.35),transparent_55%),rgba(15,23,42,0.9)] text-cyan-300">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="bg-linear-to-r from-cyan-300 to-violet-400 bg-clip-text text-xs font-semibold tracking-[0.22em] text-transparent">
            RESQNET
          </p>
          <p className="text-sm font-semibold text-slate-100">
            Real-Time Disaster Intelligence Network
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right md:block">
          <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
            Live Clock
          </p>
          <p className="font-mono text-sm text-slate-100">{clock}</p>
        </div>
        <Button onClick={onRefresh} size="lg" variant="secondary">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Simulation
        </Button>
      </div>
    </header>
  );
}
