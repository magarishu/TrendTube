import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface SimilarVideo {
  id: string;
  title: string;
  views: string;
  ctr: string;
  date: string;
  channel: string;
  outlier: boolean;
  engagement: string;
}

interface SimilarVideosProps {
  videoId?: string;
}

const SimilarVideos = ({ videoId }: SimilarVideosProps) => {
  const { toast } = useToast();
  const [videos, setVideos] = useState<SimilarVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(true);

  const colors = [
    "from-primary/30 to-primary/10",
    "from-accent/30 to-accent/10",
    "from-chart-orange/30 to-chart-orange/10",
    "from-chart-red/30 to-chart-red/10",
  ];

  useEffect(() => {
    const fetchSimilarVideos = async () => {
      if (!videoId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/analytics/video/${videoId}/similar?limit=6`
        );

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.similarVideos && Array.isArray(data.similarVideos) && data.similarVideos.length > 0) {
          setVideos(data.similarVideos);
          setHasData(true);
        } else {
          setHasData(false);
          toast({
            title: "No similar videos found",
            description: "Could not find videos similar to this one.",
          });
        }
      } catch (error) {
        console.error('Error fetching similar videos:', error);
        setHasData(false);
        toast({
          title: "Failed to load similar videos",
          description: "Could not fetch data from the server.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarVideos();
  }, [videoId, toast]);

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading similar videos...</div>;
  }

  if (!hasData || videos.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Similar Videos Found</h3>
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-amber-900">No Similar Videos Available</h4>
            <p className="text-sm text-amber-800 mt-1">
              Could not find videos similar to this one. Make sure the database has multiple videos with similar tags and categories.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Similar Videos Found</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video, i) => (
          <div key={video.id} className="rounded-lg border border-border bg-card/50 backdrop-blur-sm overflow-hidden card-hover cursor-pointer hover:border-primary/50 transition-colors">
            <div className={`aspect-video bg-gradient-to-br ${colors[i % colors.length]} relative`}>
              {video.outlier && (
                <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground border-0">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Trending
                </Badge>
              )}
            </div>
            <div className="p-3 space-y-1">
              <h4 className="text-sm font-medium text-foreground line-clamp-2">{video.title}</h4>
              <p className="text-xs text-muted-foreground">{video.channel}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{video.views} views</span>
                <span>CTR: {video.ctr}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{video.date}</span>
                <span className="text-primary font-medium">Engagement: {video.engagement}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarVideos;
