import { Heart, AlertCircle, Loader } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useNavigate } from "react-router-dom";

interface FavoriteVideo {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  views: string;
  duration: string;
  publishedAt: string;
  addedAt: string;
}

const Favorites = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { favorites, loading, error, fetchFavorites, removeFromFavorites } = useFavorites();

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated, fetchFavorites]);

  if (!isAuthenticated) {
    return (
      <div className="fade-in space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Favorites</h1>
          <p className="text-sm text-muted-foreground mt-1">Your saved videos and watchlist</p>
        </div>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
            <Heart className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Sign in to save favorites</h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Sign in to save your favorite trending videos and create personalized watchlists.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-150 rounded-md"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {error}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="fade-in space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Favorites</h1>
          <p className="text-sm text-muted-foreground mt-1">Your saved videos and watchlist</p>
        </div>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
            <Heart className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">No favorites yet</h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Start adding your favorite videos to build your personalized watchlist.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-150 rounded-md"
          >
            Browse Videos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Favorites</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {favorites.length} {favorites.length === 1 ? "video" : "videos"} saved
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {favorites.map((video: FavoriteVideo, index) => (
          <div
            key={index}
            className="group card-hover cursor-pointer fade-in relative"
          >
            {/* Thumbnail */}
            <div
              className="relative aspect-video bg-secondary overflow-hidden rounded-lg"
              onClick={() => {
                const youtubeUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
                navigate(`/video-analyzer?url=${encodeURIComponent(youtubeUrl)}`);
              }}
            >
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-primary/10">
                  <Heart className="h-8 w-8 text-muted-foreground" />
                </div>
              )}

              <span className="absolute bottom-2 right-2 rounded-sm bg-background/80 px-1.5 py-0.5 text-xs font-medium text-foreground">
                {video.duration}
              </span>

              {/* Remove from favorites button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromFavorites(video.videoId);
                }}
                className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 hover:bg-destructive transition-colors duration-150 opacity-0 group-hover:opacity-100"
                title="Remove from favorites"
              >
                <Heart className="h-5 w-5 fill-red-500 text-red-500" />
              </button>
            </div>

            {/* Info */}
            <div
              className="mt-3 space-y-1 cursor-pointer"
              onClick={() => {
                const youtubeUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
                navigate(`/video-analyzer?url=${encodeURIComponent(youtubeUrl)}`);
              }}
            >
              <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-150">
                {video.title}
              </h3>
              <p className="text-xs text-muted-foreground">{video.channel}</p>
              <p className="text-xs text-muted-foreground">
                {video.views} views · {video.publishedAt}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;
