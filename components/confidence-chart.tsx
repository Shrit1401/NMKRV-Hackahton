import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ConfidenceTrend } from "../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type ConfidenceChartProps = {
  trend: ConfidenceTrend[];
};

export function ConfidenceChart({ trend }: ConfidenceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Escalation Timeline</CardTitle>
      </CardHeader>
      <CardContent className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#020617",
                border: "1px solid #334155",
                borderRadius: 8,
                color: "#e2e8f0",
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#e2e8f0"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, fill: "#e2e8f0" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
