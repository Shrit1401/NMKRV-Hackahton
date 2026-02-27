import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SourceTrendPoint } from "../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type SourceTrendPanelProps = {
  data: SourceTrendPoint[];
};

export function SourceTrendPanel({ data }: SourceTrendPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Source Signal Trend</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#020617",
                border: "1px solid #334155",
                borderRadius: 8,
                color: "#e2e8f0",
              }}
            />
            <Area type="monotone" dataKey="news" stackId="1" stroke="#64748b" fill="#334155" fillOpacity={0.35} />
            <Area type="monotone" dataKey="social" stackId="1" stroke="#0284c7" fill="#0369a1" fillOpacity={0.35} />
            <Area type="monotone" dataKey="app" stackId="1" stroke="#059669" fill="#065f46" fillOpacity={0.4} />
            <Area type="monotone" dataKey="whatsapp" stackId="1" stroke="#22c55e" fill="#166534" fillOpacity={0.35} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
