import { ActivityLogEntry } from "../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";

type ActivityFeedProps = {
  entries: ActivityLogEntry[];
};

export function ActivityFeed({ entries }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Activity Feed</CardTitle>
      </CardHeader>
      <CardContent className="h-64 p-0">
        <ScrollArea className="h-full">
          <div className="space-y-2 p-4">
            {entries.map((entry) => (
              <div key={entry.id} className="rounded-md border border-slate-800 bg-slate-900/40 p-3">
                <div className="mb-1 text-xs font-mono text-slate-500">{entry.timestamp}</div>
                <div className="text-sm text-slate-200">{entry.message}</div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
