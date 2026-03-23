import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BarChart2 } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip as RTooltip,
  YAxis,
  Cell,
  CartesianGrid,
} from "recharts";

export interface BuilderProfileChartsProps {
  toolName: string;
  radarData: { metric: string; value: number }[];
  distributionData: { range: string; count: number }[];
}

export default function BuilderProfileCharts({ toolName, radarData, distributionData }: BuilderProfileChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle as="h2" className="text-base font-sans flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Performance Radar (PVI)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name={toolName}
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.4}
              />
              <RTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle as="h2" className="text-base font-sans flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            PVI Score Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData} margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="range" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
              <RTooltip
                cursor={{ fill: "hsl(var(--muted)/0.5)" }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {distributionData.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.range}`}
                    fill={
                      index === 4
                        ? "hsl(var(--success))"
                        : index === 3
                          ? "hsl(var(--primary))"
                          : "hsl(var(--muted-foreground))"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
