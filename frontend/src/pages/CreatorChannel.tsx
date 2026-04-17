import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle, Loader, Play, ArrowLeft, Users, Eye, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface ChannelInfo {
  id?: string;
  channelId: string;
  name: string;
  description: string;
  subscribers: number;
  totalViews: number;
  videoCount: number;
  category: string;
  thumbnail: string;
  monthlyEarnings?: number;
  yearlyEarnings?: number;
}

interface Video {
  id: string;
  title: string;
  channelId: string;
  views: string;
  publishedAt: string;
  thumbnail: string;
  duration?: string;
  url?: string;
}

const CreatorChannel = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const [channel, setChannel] = useState<ChannelInfo | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannelData = async () => {
      if (!channelId) {
        setError("Channel ID not provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch videos for this channel
        const videosResponse = await axios.get(
          `/api/analytics/channel/${channelId}/videos`
        );

        if (videosResponse.data.data && Array.isArray(videosResponse.data.data)) {
          const videosData = videosResponse.data.data;
          setVideos(videosData);

          // Extract channel info from first video or use from response
          let channelInfo: ChannelInfo | null = null;
          
          if (videosResponse.data.channel) {
            channelInfo = videosResponse.data.channel;
          } else if (videosData.length > 0) {
            // Build channel info from videos if not returned separately
            const firstVideo = videosData[0];
            channelInfo = {
              channelId,
              name: firstVideo.channelTitle || firstVideo.channel || "Unknown Channel",
              description: "",
              subscribers: 0,
              totalViews: 0,
              videoCount: videosData.length,
              category: "Unknown",
              thumbnail: firstVideo.channelThumbnail || "",
            };
          }

          if (channelInfo) {
            setChannel(channelInfo);
          }
        }
      } catch (err: any) {
        console.error("Error fetching channel data:", err);
        setError(err.response?.data?.message || "Failed to load channel data");
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, [channelId]);

  const handleVideoClick = (video: Video) => {
    // Navigate to video analyzer with the video URL
    // If video doesn't have a direct URL, construct it from ID if available
    let videoUrl = video.url;
    
    if (!videoUrl && video.id) {
      videoUrl = `https://www.youtube.com/watch?v=${video.id}`;
    }

    if (videoUrl) {
      navigate(`/video-analyzer?url=${encodeURIComponent(videoUrl)}`);
    }
  };

  const formatNumber = (num: string | number): string => {
    const numVal = typeof num === "string" ? parseInt(num) : num;
    if (numVal >= 1000000) return (numVal / 1000000).toFixed(1) + "M";
    if (numVal >= 1000) return (numVal / 1000).toFixed(0) + "K";
    return numVal.toString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/creators")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Creators
        </Button>
        <div className="flex items-center justify-center py-20">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/creators")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Creators
        </Button>
        <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/creators")}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Creators
      </Button>

      {/* Channel Header */}
      {channel && (
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex gap-6">
            {channel.thumbnail && (
              <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full bg-primary/10">
                <img
                  src={channel.thumbnail}
                  alt={channel.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">{channel.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {channel.description || "No description available"}
              </p>
              <div className="mt-4 flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    {formatNumber(channel.subscribers)} subscribers
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    {formatNumber(channel.totalViews)} views
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    {videos.length} videos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Videos Section */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Videos</h2>
        {videos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No videos found for this channel
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <div
                key={video.id}
                className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary hover:shadow-lg"
                onClick={() => handleVideoClick(video)}
              >
                {/* Thumbnail */}
                <div className="relative h-40 overflow-hidden bg-primary/10">
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Play className="h-8 w-8 text-primary/50" />
                    </div>
                  )}
                  {/* Duration Badge */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs font-semibold text-white">
                      {video.duration}
                    </div>
                  )}
                  {/* Play Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                    <Play className="h-12 w-12 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h3 className="line-clamp-2 font-semibold text-foreground group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatNumber(video.views)} views</span>
                    <span>{video.publishedAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorChannel;
