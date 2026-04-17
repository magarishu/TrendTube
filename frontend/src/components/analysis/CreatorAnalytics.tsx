import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { TrendingUp, Eye, Clock, Users, MousePointer } from "lucide-react";

const trendData = [
  { day: "Mon", ctr: 8.2, views: 12000, engagement: 6.4 },
  { day: "Tue", ctr: 9.1, views: 15000, engagement: 7.1 },
  { day: "Wed", ctr: 11.4, views: 22000, engagement: 9.2 },
  { day: "Thu", ctr: 10.8, views: 19000, engagement: 8.5 },
  { day: "Fri", ctr: 12.1, views: 28000, engagement: 10.3 },
  { day: "Sat", ctr: 13.5, views: 35000, engagement: 11.8 },
  { day: "Sun", ctr: 11.9, views: 31000, engagement: 9.7 },
];

const radarData = [
  { metric: "CTR", value: 82 },
  { metric: "Retention", value: 68 },
  { metric: "Engagement", value: 75 },
  { metric: "Growth", value: 90 },
  { metric: "Consistency", value: 62 },
  { metric: "SEO", value: 71 },
];

const stats = [
  { icon: MousePointer, label: "Avg CTR", value: "11.0%", change: "+2.1%", up: true },
  { icon: Clock, label: "Avg View Duration", value: "6:42", change: "+0:34", up: true },
  { icon: TrendingUp, label: "Engagement Rate", value: "8.7%", change: "+1.3%", up: true },
  { icon: Eye, label: "View Velocity", value: "23K/day", change: "+5K", up: true },
  { icon: Users, label: "Sub Conversion", value: "3.2%", change: "-0.1%", up: false },
];

const CreatorAnalytics = () => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-foreground">Creator Analytics</h3>

    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {stats.map((s, i) => (
        <div key={i} className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-4">
          <s.icon className="h-4 w-4 text-primary mb-2" />
          <p className="text-lg font-bold text-foreground">{s.value}</p>
          <p className="text-xs text-muted-foreground">{s.label}</p>
          <span className={`text-xs font-medium ${s.up ? "text-accent" : "text-destructive"}`}>{s.change}</span>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-5">
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Weekly Performance</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 18%)" />
              <XAxis dataKey="day" tick={{ fill: "hsl(0 0% 53.3%)", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(0 0% 53.3%)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "hsl(0 0% 11.8%)", border: "1px solid hsl(0 0% 18%)", borderRadius: 8, color: "hsl(0 0% 91.8%)" }} />
              <Line type="monotone" dataKey="ctr" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="engagement" stroke="hsl(160 84% 39%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-5">
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Channel Performance Radar</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(0 0% 18%)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(0 0% 53.3%)", fontSize: 11 }} />
              <PolarRadiusAxis tick={false} domain={[0, 100]} />
              <Radar dataKey="value" stroke="hsl(217 91% 60%)" fill="hsl(217 91% 60%)" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </div>
);

export default CreatorAnalytics;
