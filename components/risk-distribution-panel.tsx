import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DisasterEvent } from "../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type RiskDistributionPanelProps = {
  events: DisasterEvent[];
};

export function RiskDistributionPanel({ events }: RiskDistributionPanelProps) {
  const severityCounts = {
    high: events.filter((e) => e.severity === "high").length,
    medium: events.filter((e) => e.severity === "medium").length,
    low: events.filter((e) => e.severity === "low").length,
  };

  const pieData = [
    { name: "High", value: severityCounts.high, color: "#ef4444" },
    { name: "Medium", value: severityCounts.medium, color: "#f59e0b" },
    { name: "Low", value: severityCounts.low, color: "#22c55e" },
  ];

  const sourceData = [
    { name: "News", count: events.reduce((sum, e) => sum + e.newsCount, 0) },
    { name: "Social", count: events.reduce((sum, e) => sum + e.socialCount, 0) },
    { name: "App", count: events.reduce((sum, e) => sum + e.userReports, 0) },
    { name: "WhatsApp", count: events.reduce((sum, e) => sum + e.whatsappReports, 0) },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk And Source Snapshot</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-44 rounded-md border border-slate-800 bg-slate-900/30 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={36} outerRadius={58}>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  color: "#e2e8f0",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="h-44 rounded-md border border-slate-800 bg-slate-900/30 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sourceData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  color: "#e2e8f0",
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
