import { DisasterEvent } from "../lib/types";
import { getWeatherSeverityLabel } from "../lib/disaster-utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

type ConfidencePanelProps = {
  event?: DisasterEvent;
  weatherSeverity?: number | null;
};

export function EventDetailsPanel({ event, weatherSeverity }: ConfidencePanelProps) {
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

  const score =
    typeof weatherSeverity === "number" ? weatherSeverity : event.weatherSeverity;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confidence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm text-slate-300">{event.name}</p>
          <p className="bg-linear-to-r from-cyan-300 via-sky-400 to-violet-400 bg-clip-text text-4xl font-semibold text-transparent">
            {event.confidenceScore}%
          </p>
        </div>
        <Progress value={event.confidenceScore} />
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Weather severity</span>
          <span className="font-mono text-slate-200">
            {getWeatherSeverityLabel(score)} ({score.toFixed(1)}/10)
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Why this matters: this score combines reports from people, media, weather and field apps.
        </p>
      </CardContent>
    </Card>
  );
}
