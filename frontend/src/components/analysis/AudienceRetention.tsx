import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface RetentionData {
  percentile: number;
  retention: number;
}

interface AudienceRetentionProps {
  videoId?: string;
}

const AudienceRetention = ({ videoId }: AudienceRetentionProps) => {
  const { toast } = useToast();
  const [retentionCurve, setRetentionCurve] = useState<Array<{ time: string; retention: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [avgDuration, setAvgDuration] = useState(0);
  const [isRealData, setIsRealData] = useState(false);
  const [hasData, setHasData] = useState(true);

  const suggestions = [
    { text: "Hook viewers in the first 5 seconds with a bold statement or question", priority: "high" },
    { text: "Add faster pacing between 20-40% mark to prevent drop-off", priority: "medium" },
    { text: "Include a pattern interrupt at the midpoint to re-engage viewers", priority: "medium" },
    { text: "Increase visual engagement with B-roll and graphics", priority: "low" },
  ];

  useEffect(() => {
    const fetchRetentionData = async () => {
      if (!videoId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/analytics/video/${videoId}/retention`
        );

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        
        // Check if we got real retention data
        if (data.retentionCurve && Array.isArray(data.retentionCurve) && data.retentionCurve.length > 0) {
          const formattedData = data.retentionCurve.map((item: RetentionData) => ({
            time: `${item.percentile}%`,
            retention: item.retention,
          }));

          setRetentionCurve(formattedData);
          setIsRealData(true);
          setHasData(true);
        } else {
          // API returned but no actual data
          setHasData(false);
          setIsRealData(false);
          toast({
            title: "No retention data available",
            description: "This video doesn't have retention metrics in the database yet.",
          });
        }

        setAvgDuration(data.avgViewDuration || 0);
      } catch (error) {
        console.error('Error fetching retention data:', error);
        setHasData(false);
        setIsRealData(false);
        toast({
          title: "Failed to load retention data",
          description: "Could not fetch data from the server. Make sure the backend is running.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRetentionData();
  }, [videoId, toast]);

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading retention analysis...</div>;
  }

  if (!hasData) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">Audience Retention Prediction</h3>
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-amber-900">No Data Available</h4>
            <p className="text-sm text-amber-800 mt-1">
              This video doesn't have retention metrics in the database. Please seed the database with test data first by running:
            </p>
            <code className="block bg-black/30 p-2 rounded mt-2 text-xs text-white">
              node scripts/seedTestData.js
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Audience Retention Prediction</h3>
        {isRealData && (
          <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
            Real Data
          </Badge>
        )}
      </div>

      {avgDuration > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-foreground">
            <span className="font-semibold">Average View Duration:</span> {Math.round(avgDuration)} seconds
          </p>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-6">
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Retention Curve</h4>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={retentionCurve}>
              <defs>
                <linearGradient id="retentionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 18%)" />
              <XAxis dataKey="time" tick={{ fill: "hsl(0 0% 53.3%)", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(0 0% 53.3%)", fontSize: 11 }} domain={[0, 100]} unit="%" />
              <Tooltip contentStyle={{ background: "hsl(0 0% 11.8%)", border: "1px solid hsl(0 0% 18%)", borderRadius: 8, color: "hsl(0 0% 91.8%)" }} />
              <Area type="monotone" dataKey="retention" stroke="hsl(217 91% 60%)" fill="url(#retentionGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-4 w-4 text-chart-orange" />
          <h4 className="text-sm font-semibold text-foreground">Improvement Suggestions</h4>
        </div>
        <div className="space-y-3">
          {suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-3 rounded-md bg-secondary/50 p-3">
              <Badge variant={s.priority === "high" ? "destructive" : s.priority === "medium" ? "default" : "secondary"} className="shrink-0 text-xs mt-0.5">
                {s.priority}
              </Badge>
              <span className="text-sm text-foreground">{s.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AudienceRetention;
