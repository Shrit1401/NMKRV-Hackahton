import { TrendingDown, TrendingUp } from "lucide-react";
import { DisasterEvent } from "../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

type ConfidencePanelProps = {
  event?: DisasterEvent;
};

export function EventDetailsPanel({ event }: ConfidencePanelProps) {
  if (!event) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Confidence</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400">Select an event from the map.</p>
        </CardContent>
      </Card>
    );
  }

  const trendUp =
    event.confidenceTrend.length > 1
      ? event.confidenceTrend[event.confidenceTrend.length - 1].score >=
        event.confidenceTrend[event.confidenceTrend.length - 2].score
      : true;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confidence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm text-slate-300">{event.name}</p>
          <p className="bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 bg-clip-text text-4xl font-semibold text-transparent">
            {event.confidenceScore}%
          </p>
        </div>
        <Progress value={event.confidenceScore} />
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {trendUp ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-red-400" />
          )}
          <span>{trendUp ? "Trend: increasing" : "Trend: decreasing"}</span>
        </div>
        <p className="text-xs text-slate-400">
          Why this matters: this score combines reports from people, media, weather and field apps.
        </p>
      </CardContent>
    </Card>
  );
}
