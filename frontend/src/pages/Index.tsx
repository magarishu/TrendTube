import { TrendingUp, Play, Users, AlertCircle, Loader, ArrowRight, Zap, BarChart3, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/SearchBar";
import VideoCard from "@/components/VideoCard";
import CreatorCard from "@/components/CreatorCard";
import CategoryCard from "@/components/CategoryCard";
import { mockCreators, mockCategories } from "@/data/mockData";
import type { Video } from "@/data/mockData";
import apiClient from "@/services/apiClient";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching trending videos from:", apiClient);
        
        // Fetch from multiple regions to get more videos
        const allVideos: Video[] = [];
        const regions = ['US', 'GB', 'IN'];
        
        for (const region of regions) {
          try {
            const response = await apiClient.youtube.getTrending(region, 20);
            console.log(`API Response from ${region}:`, response);
            
            if (!response || !response.data) {
              console.warn(`No data from ${region}`);
              continue;
            }
            
            response.data.forEach((item: any) => {
              // Avoid duplicates
              if (!allVideos.some(v => v.id === item.id)) {
                allVideos.push({
                  id: item.id,
                  title: item.snippet?.title || "Untitled",
                  channel: item.snippet?.channelTitle || "Unknown Channel",
                  channelId: item.snippet?.channelId || "",
                  views: item.statistics?.viewCount 
                    ? (parseInt(item.statistics.viewCount) / 1000000 >= 1 
                        ? (parseInt(item.statistics.viewCount) / 1000000).toFixed(1) + "M"
                        : (parseInt(item.statistics.viewCount) / 1000).toFixed(0) + "K")
                    : "0",
                  publishedAt: item.snippet?.publishedAt 
                    ? new Date(item.snippet.publishedAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })
                    : "N/A",
                  thumbnail: item.snippet?.thumbnails?.medium?.url || "",
                  duration: "N/A",
                  category: item.snippet?.categoryId || "General",
                });
              }
            });
          } catch (regionErr) {
            console.warn(`Failed to fetch from ${region}:`, regionErr);
          }
        }
        
        console.log("Transformed videos:", allVideos.slice(0, 3));
        setVideos(allVideos.slice(0, 8)); // Show top 8
      } catch (err: any) {
        console.error("Failed to fetch trending videos:", err);
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        setError(`Failed to load trending videos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch videos if authenticated
    if (isAuthenticated) {
      fetchTrendingVideos();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Landing Page (when not authenticated)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#030303]">
        {/* Navigation */}
        <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#FF0000] rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">TrendTube</span>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8 max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FF0000]/10 px-4 py-2 text-sm font-medium text-[#FF0000]">
              <Sparkles className="h-4 w-4" />
              AI-Powered YouTube Analytics
            </div>

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground">
              Master YouTube{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF0000] to-[#FF6B6B]">
                Analytics
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Get real-time insights on trending videos, analyze audience retention, predict viral potential, and optimize your YouTube strategy with AI-powered analytics.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/signup">
                <Button className="bg-primary hover:bg-primary/90 text-white h-12 px-8 gap-2 text-base">
                  <Play className="h-5 w-5" />
                  Start For Free
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="border-border h-12 px-8 text-base">
                  Already a Member?
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FF0000]">10K+</div>
                <p className="text-sm text-muted-foreground">Videos Analyzed</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FF0000]">500+</div>
                <p className="text-sm text-muted-foreground">Creators Using</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FF0000]">24/7</div>
                <p className="text-sm text-muted-foreground">Live Analytics</p>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Real-Time Analytics"
              description="Track trending videos, viewers, and engagement metrics in real-time with live data updates."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="AI-Powered Insights"
              description="Get intelligent predictions on viral potential, audience retention, and content recommendations."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Creator Tracking"
              description="Monitor top creators, analyze their performance, and benchmark against competitors."
            />
          </div>

          {/* Bottom CTA */}
          <div className="mt-20 text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              Ready to Grow Your YouTube Channel?
            </h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of creators making data-driven decisions
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard (when authenticated)
  return (
    <div className="fade-in space-y-12">
      {/* Hero */}
      <section className="relative py-16 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-sm bg-[#FF0000]/10 px-3 py-1 text-xs font-medium text-[#FF0000]">
            <TrendingUp className="h-3 w-3" />
            Live trending data
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Discover What's Trending on{" "}
            <span className="text-[#FF0000]">YouTube</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Track trending videos, creators, and topics across every category in real time.
          </p>
          <SearchBar />
        </div>
      </section>

      {/* Trending Videos */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Trending Videos</h2>
          <span className="text-xs text-muted-foreground">
            {loading ? "Loading..." : "Updated now"}
          </span>
        </div>
        
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            No videos found
          </div>
        )}
      </section>

      {/* Trending Creators */}
      <section>
        <h2 className="mb-6 text-xl font-bold text-foreground">Trending Creators</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockCreators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="mb-6 text-xl font-bold text-foreground">Categories</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {mockCategories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>
    </div>
  );
};

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
    <div className="text-[#FF0000] mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default Index;
