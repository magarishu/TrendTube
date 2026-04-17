import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

interface OutlierAnalysisData {
  outlierScore: number;
  isOutlier: boolean;
  velocity24h: number;
  growthRate: number;
}

interface EngagementTrend {
  date: string;
  ctr: number;
  engagement: number;
  velocity: number;
}

interface OutlierDetectionProps {
  videoId?: string;
}

const OutlierDetection = ({ videoId }: OutlierDetectionProps) => {
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<OutlierAnalysisData | null>(null);
  const [engagementTrends, setEngagementTrends] = useState<EngagementTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(true);

  const mockVelocityData = [
    { name: "Video 1", views: 2400, avg: 800 },
    { name: "Video 2", views: 890, avg: 800 },
    { name: "Outlier 3", views: 5100, avg: 800 },
    { name: "Video 4", views: 1200, avg: 800 },
    { name: "Video 5", views: 670, avg: 800 },
    { name: "Outlier 6", views: 3800, avg: 800 },
  ];

  useEffect(() => {
    const fetchOutlierAnalysis = async () => {
      if (!videoId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/analytics/video/${videoId}/outlier-analysis`
        );

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.analysis) {
          setAnalysis(data.analysis);
          setEngagementTrends(data.engagementTrends || []);
          setHasData(true);
        } else {
          setHasData(false);
          toast({
            title: "No analysis data available",
            description: "This video doesn't have enough data for outlier analysis.",
          });
        }
      } catch (error) {
        console.error('Error fetching outlier analysis:', error);
        setHasData(false);
        toast({
          title: "Failed to load outlier analysis",
          description: "Could not fetch data from the server.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOutlierAnalysis();
  }, [videoId, toast]);

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading outlier analysis...</div>;
  }

  if (!hasData || !analysis) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">Outlier Detection & Performance Analysis</h3>
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-amber-900">No Analysis Data Available</h4>
            <p className="text-sm text-amber-800 mt-1">
              This video doesn't have enough metrics for outlier analysis. Make sure the database has been populated with video metrics data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Outlier Detection & Performance Analysis</h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg bg-card/50 border border-border p-4">
          <p className="text-xs text-muted-foreground mb-2">Outlier Score</p>
          <p className="text-2xl font-bold text-foreground">{analysis.outlierScore.toFixed(2)}x</p>
          <p className="text-xs text-muted-foreground mt-2">
            {analysis.isOutlier ? "✓ Above Average" : "— Average"}
          </p>
        </div>
        <div className="rounded-lg bg-card/50 border border-border p-4">
          <p className="text-xs text-muted-foreground mb-2">24h Velocity</p>
          <p className="text-2xl font-bold text-foreground">{analysis.velocity24h.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">Views per hour</p>
        </div>
        <div className="rounded-lg bg-card/50 border border-border p-4">
          <p className="text-xs text-muted-foreground mb-2">7-Day Growth</p>
          <p className="text-2xl font-bold text-foreground text-accent">{analysis.growthRate.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground mt-2">Growth rate</p>
        </div>
        <div className="rounded-lg bg-card/50 border border-border p-4">
          <p className="text-xs text-muted-foreground mb-2">Status</p>
          <p className={`text-lg font-bold ${analysis.isOutlier ? 'text-accent' : 'text-muted-foreground'}`}>
            {analysis.isOutlier ? '🚀 Viral' : '📊 Normal'}
          </p>
          <p className="text-xs text-muted-foreground mt-2">Performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-5">
          <h4 className="text-sm font-medium text-muted-foreground mb-4">View Velocity vs Channel Average</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockVelocityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 18%)" />
                <XAxis dataKey="name" tick={{ fill: "hsl(0 0% 53.3%)", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(0 0% 53.3%)", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "hsl(0 0% 11.8%)", border: "1px solid hsl(0 0% 18%)", borderRadius: 8, color: "hsl(0 0% 91.8%)" }} />
                <Bar dataKey="views" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avg" fill="hsl(0 0% 30%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-5">
          <h4 className="text-sm font-medium text-muted-foreground mb-4">Engagement Trends</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagementTrends.length > 0 ? engagementTrends : mockVelocityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 18%)" />
                <XAxis dataKey="name" tick={{ fill: "hsl(0 0% 53.3%)", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(0 0% 53.3%)", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "hsl(0 0% 11.8%)", border: "1px solid hsl(0 0% 18%)", borderRadius: 8, color: "hsl(0 0% 91.8%)" }} />
                <Line type="monotone" dataKey="views" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutlierDetection;
