import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Play, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Video {
  videoId: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  category: string;
  channelName: string;
  duration: number;
}

const TestVideos = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/analytics/trending?limit=20`
        );

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.data && Array.isArray(data.data)) {
          setVideos(data.data);
          setError("");
        } else {
          setError("No test videos available");
        }
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError(`Failed to load test videos: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleAnalyze = (video: Video) => {
    navigate(
      `/analysis/${video.videoId}?title=${encodeURIComponent(video.title)}&channel=${encodeURIComponent(video.channelName)}`
    );
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Test Videos</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Analyze our pre-loaded test videos to explore all analytics features
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-3 text-muted-foreground">Loading test videos...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <div
              key={video.videoId}
              className="border border-border bg-card/50 backdrop-blur-sm rounded-lg p-5 space-y-4 hover:border-primary/50 transition-colors"
            >
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  by {video.channelName}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center py-3 border-y border-border/50">
                <div>
                  <p className="text-lg font-bold text-primary">
                    {formatNumber(video.views)}
                  </p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-500">
                    {formatNumber(video.likes)}
                  </p>
                  <p className="text-xs text-muted-foreground">Likes</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-500">
                    {formatNumber(video.comments)}
                  </p>
                  <p className="text-xs text-muted-foreground">Comments</p>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span className="px-2 py-1 bg-secondary rounded text-xs">
                  {video.category}
                </span>
                <span>{Math.floor(video.duration / 60)}m video</span>
              </div>

              <Button
                onClick={() => handleAnalyze(video)}
                className="w-full gap-2"
                variant="default"
              >
                <Play className="h-4 w-4" />
                Analyze Now
              </Button>
            </div>
          ))}
        </div>
      )}

      {!loading && videos.length === 0 && !error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No videos found. Please make sure the backend server is running and test data has been seeded.
          </AlertDescription>
        </Alert>
      )}

      <div className="border border-border/50 bg-secondary/20 rounded-lg p-6 space-y-3">
        <h3 className="font-semibold text-foreground">📊 How to use this page</h3>
        <ol className="text-sm text-muted-foreground space-y-2 ml-4 list-decimal">
          <li>Select any video from the list above</li>
          <li>Click "Analyze Now" to view detailed analytics</li>
          <li>Explore different tabs: Retention, Earnings, Similar Videos, Outliers</li>
          <li>View advanced analytics like Title Analyzer, Thumbnail Analyzer, etc.</li>
        </ol>
      </div>
    </div>
  );
};

export default TestVideos;
