import { DollarSign, Globe, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface EarningsEstimatorProps {
  videoId?: string;
}

const EarningsEstimator = ({ videoId }: EarningsEstimatorProps) => {
  const { toast } = useToast();
  const [views, setViews] = useState("0");
  const [actualVideoViews, setActualVideoViews] = useState<number>(0);
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [cpm, setCpm] = useState("");
  const [country, setCountry] = useState("US");
  const [niche, setNiche] = useState("tech");
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // First fetch: Get video data
  useEffect(() => {
    const fetchVideoData = async () => {
      if (!videoId) {
        setDataLoaded(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/analytics/video/${videoId}`
        );

        if (response.ok) {
          const data = await response.json();
          const videoViews = data.data?.views || 0;
          
          if (videoViews > 0) {
            setActualVideoViews(videoViews);
            setViews(videoViews.toString());
            setVideoTitle(data.data?.title || "");
            setDataLoaded(true);
          } else {
            setDataLoaded(false);
            toast({
              title: "Video data not found",
              description: "Could not retrieve view count for this video. Make sure it exists in the database.",
              variant: "destructive",
            });
          }
        } else {
          setDataLoaded(false);
          toast({
            title: "Failed to load video data",
            description: `Error ${response.status}: Could not fetch video information.`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching video data:', error);
        setDataLoaded(false);
        toast({
          title: "Connection error",
          description: "Make sure the backend server is running.",
          variant: "destructive",
        });
      }
    };

    fetchVideoData();
  }, [videoId, toast]);

  // Second fetch: Calculate earnings based on views and settings
  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const viewsNum = parseInt(views) || actualVideoViews || 0;
        
        if (viewsNum === 0 || !videoId) {
          return;
        }

        // Build URL with video-specific views
        let url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/analytics/video/${videoId}/earnings?views=${viewsNum}&country=${country}&niche=${niche}`;
        
        if (cpm) {
          url += `&cpm=${cpm}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch earnings data');

        const data = await response.json();
        setEarnings(data.earnings);
      } catch (error) {
        console.error('Error fetching earnings:', error);
        // Calculate locally as fallback
        calculateLocal();
      } finally {
        setLoading(false);
      }
    };

    if (videoId && views !== "0" && dataLoaded) {
      fetchEarnings();
    }
  }, [videoId, views, country, niche, cpm, dataLoaded]);

  const calculateLocal = () => {
    const viewsNum = parseInt(views) || 0;
    const cpmNum = parseFloat(cpm) || 4.5;
    const adRevenue = (viewsNum / 1000) * cpmNum;
    const rpm = cpmNum * 0.55;
    const monthly = adRevenue * 4;
    const yearly = monthly * 12;

    setEarnings({
      adRevenue: parseFloat(adRevenue.toFixed(2)),
      cpm: parseFloat(cpmNum.toFixed(2)),
      rpm: parseFloat(rpm.toFixed(2)),
      estimatedMonthly: parseFloat(monthly.toFixed(2)),
      estimatedYearly: parseFloat(yearly.toFixed(2)),
    });
  };

  const fmt = (n: number) => "$" + n.toLocaleString(undefined, { maximumFractionDigits: 0 });

  const stats = [
    { icon: DollarSign, label: "Est. Ad Revenue", value: earnings?.adRevenue ? fmt(earnings.adRevenue) : "$0", color: "text-accent" },
    { icon: TrendingUp, label: "RPM", value: earnings?.rpm ? `$${earnings.rpm.toFixed(2)}` : "$0.00", color: "text-primary" },
    { icon: Calendar, label: "Monthly Est.", value: earnings?.estimatedMonthly ? fmt(earnings.estimatedMonthly) : "$0", color: "text-chart-orange" },
    { icon: Globe, label: "Yearly Est.", value: earnings?.estimatedYearly ? fmt(earnings.estimatedYearly) : "$0", color: "text-chart-green" },
  ];

  if (!dataLoaded) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">Earnings Estimator</h3>
        <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-red-900">Video Data Not Available</h4>
            <p className="text-sm text-red-800 mt-1">
              This video could not be found in the database. Make sure the database is populated with video data by running:
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
      <div>
        <h3 className="text-lg font-semibold text-foreground">Earnings Estimator</h3>
        {videoTitle && (
          <p className="text-sm text-muted-foreground mt-2">Video: {videoTitle}</p>
        )}
      </div>

      {actualVideoViews > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-foreground">
            <span className="font-semibold">Video Views:</span> {actualVideoViews.toLocaleString()} views
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            The earnings below are calculated based on this video's actual view count. You can adjust the views or CPM rate to see different scenarios.
          </p>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
              View Count {views === actualVideoViews.toString() ? "(Actual)" : "(Adjusted)"}
            </label>
            <Input 
              value={views} 
              onChange={(e) => setViews(e.target.value)} 
              className="bg-secondary/50 border-border"
              type="number"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">CPM ($) {cpm && "(Custom)"}</label>
            <Input 
              value={cpm} 
              onChange={(e) => setCpm(e.target.value)} 
              className="bg-secondary/50 border-border"
              placeholder="Auto-detect"
              type="number"
              step="0.01"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Country</label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="UK">United Kingdom</SelectItem>
                <SelectItem value="IN">India</SelectItem>
                <SelectItem value="DE">Germany</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Niche</label>
            <Select value={niche} onValueChange={setNiche}>
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tech">Technology</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="gaming">Gaming</SelectItem>
                <SelectItem value="education">Education</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="rounded-lg bg-secondary/50 p-4 text-center">
              <s.icon className={`h-5 w-5 mx-auto mb-2 ${s.color}`} />
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {loading && <p className="text-xs text-muted-foreground text-center mt-4">Calculating...</p>}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold">Note:</span> These are estimates based on actual CPM rates by country and niche. Actual earnings depend on viewer location, engagement, watch time, and other factors.
        </p>
      </div>
    </div>
  );
};

export default EarningsEstimator;
