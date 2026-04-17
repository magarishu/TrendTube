import { Play, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import type { Video } from "@/data/mockData";

const VideoCard = ({ video }: { video: Video }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isFavorite, addToFavorites, removeFromFavorites, checkFavoriteStatus } = useFavorites();
  const [isFav, setIsFav] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if video is already in favorites
    const checkStatus = async () => {
      if (isAuthenticated) {
        const status = await checkFavoriteStatus(video.id);
        setIsFav(status);
      }
    };
    checkStatus();
  }, [video.id, isAuthenticated, checkFavoriteStatus]);

  const colors = [
    "from-primary/30 to-primary/10",
    "from-accent/30 to-accent/10",
    "from-chart-orange/30 to-chart-orange/10",
    "from-chart-red/30 to-chart-red/10",
  ];
  const colorIdx = parseInt(video.id) % colors.length;

  const handleClick = () => {
    // Construct YouTube URL from video ID
    const youtubeUrl = `https://www.youtube.com/watch?v=${video.id}`;
    // Navigate to Video Analyzer with the video URL
    navigate(`/video-analyzer?url=${encodeURIComponent(youtubeUrl)}`);
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      // Redirect to login
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      if (isFav) {
        await removeFromFavorites(video.id);
        setIsFav(false);
      } else {
        await addToFavorites({
          videoId: video.id,
          title: video.title,
          channel: video.channel,
          thumbnail: video.thumbnail,
          views: video.views,
          duration: video.duration,
          publishedAt: video.publishedAt,
        });
        setIsFav(true);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="group card-hover cursor-pointer fade-in">
      {/* Thumbnail */}
      <div className={`relative aspect-video bg-gradient-to-br ${colors[colorIdx]} bg-secondary overflow-hidden`}>
        {video.thumbnail ? (
          <img 
            src={video.thumbnail} 
            alt={video.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-background/40">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground" onClick={handleClick}>
            <Play className="h-5 w-5 ml-0.5" />
          </div>
        </div>
        <span className="absolute bottom-2 right-2 rounded-sm bg-background/80 px-1.5 py-0.5 text-xs font-medium text-foreground">
          {video.duration}
        </span>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={isLoading}
          className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 hover:bg-background transition-colors duration-150 opacity-0 group-hover:opacity-100"
          title={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={`h-5 w-5 transition-colors duration-150 ${
              isFav ? "fill-red-500 text-red-500" : "text-muted-foreground"
            }`}
          />
        </button>
      </div>

      {/* Info */}
      <div className="mt-3 space-y-1 cursor-pointer" onClick={handleClick}>
        <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-150">
          {video.title}
        </h3>
        <p className="text-xs text-muted-foreground">{video.channel}</p>
        <p className="text-xs text-muted-foreground">
          {video.views} views · {video.publishedAt}
        </p>
      </div>
    </div>
  );
};

export default VideoCard;
