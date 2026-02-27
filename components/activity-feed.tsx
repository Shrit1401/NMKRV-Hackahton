import { ActivityLogEntry } from "../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";

type ActivityFeedProps = {
  entries: ActivityLogEntry[];
  onSelectEntry?: (entry: ActivityLogEntry) => void;
};

export function ActivityFeed({ entries, onSelectEntry }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Activity Feed</CardTitle>
      </CardHeader>
      <CardContent className="h-64 p-0">
        <ScrollArea className="h-full">
          <div className="space-y-2 p-4">
            {entries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => onSelectEntry?.(entry)}
                className="w-full rounded-md border border-white/5 bg-linear-to-r from-slate-900/80 via-slate-900/40 to-slate-900/80 p-3 text-left transition hover:border-cyan-400/50 cursor-pointer hover:bg-slate-900/90"
              >
                <div className="mb-1 text-xs font-mono text-slate-500">
                  {entry.timestamp}
                </div>
                <div className="text-sm text-slate-200">{entry.message}</div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
