
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NsfwSourceSummary } from "@/types";
import { format } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface TopSourcesProps {
  sources: NsfwSourceSummary[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function TopSources({ sources }: TopSourcesProps) {
  const pieChartData = sources.map(source => ({
    name: source.source,
    value: source.visitCount
  }));

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Top Sources</CardTitle>
          <CardDescription>Most frequently visited sources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} visits`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Source Details</CardTitle>
          <CardDescription>Activity breakdown by source</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sources.map((source, index) => (
              <div key={index} className="flex items-center justify-between pb-2 border-b last:border-0">
                <div className="space-y-1">
                  <div className="font-medium">{source.source}</div>
                  <div className="text-sm text-muted-foreground">
                    Last visit: {format(new Date(source.lastVisit), "MMM d, yyyy")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{source.visitCount} visits</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDuration(source.totalDuration)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
