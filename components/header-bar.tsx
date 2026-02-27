"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, RefreshCw } from "lucide-react";
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
    <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-white/10 bg-black/20 px-5 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-4">
        <img src="/img.png" alt="ResQNet" className="h-8" />

        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-white/72">
            RESQNET
          </p>
          <p className="text-sm text-white/88">Dashboard</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right md:flex md:items-center md:gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c9ffc2]" />
            <span className="text-[10px] tracking-[0.14em] text-white/60 uppercase">
              Field team online
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">
            Local Time
          </p>
          <p className="font-mono text-sm text-white/82">{clock}</p>
        </div>
        <Button
          onClick={onRefresh}
          size="sm"
          className="border-white/15 bg-white/8 text-white hover:bg-white/14"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>
    </header>
  );
}
