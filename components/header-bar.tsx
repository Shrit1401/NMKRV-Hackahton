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
    <header className="flex h-20 items-center justify-between border-b border-slate-800 px-5">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-emerald-500/50 bg-emerald-500/10 text-emerald-300">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs tracking-[0.2em] text-slate-400">RESQNET</p>
          <p className="text-sm font-semibold text-slate-100">
            Real-Time Disaster Intelligence Network
          </p>
        </div>
        <Badge variant="success" className="ml-2 hidden md:flex">
          System Status: Active
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right md:block">
          <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Live Clock</p>
          <p className="font-mono text-sm text-slate-200">{clock}</p>
        </div>
        <Button onClick={onRefresh} className="gap-2" size="md">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Simulation
        </Button>
      </div>
    </header>
  );
}
