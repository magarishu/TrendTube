import { TrendingUp, AlertCircle, Loader } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import SearchBar from "@/components/SearchBar";
import VideoCard from "@/components/VideoCard";
import CreatorCard from "@/components/CreatorCard";
import CategoryCard from "@/components/CategoryCard";
import { mockCreators, mockCategories } from "@/data/mockData";
import type { Video } from "@/data/mockData";
import apiClient from "@/services/apiClient";
import { useAuth } from "@/context/AuthContext";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { Testimonials } from "@/components/landing/Testimonials";
import { LandingFooter } from "@/components/landing/LandingFooter";

const Index = () => {
  const { isAuthenticated } = useAuth();

  const { data: videos = [], isLoading, error } = useQuery({
    queryKey: ['trendingVideos'],
    queryFn: async () => {
      const allVideos: Video[] = [];
      const regions = ['US', 'GB', 'IN'];
      
      for (const region of regions) {
        try {
          const response = await apiClient.youtube.getTrending(region, 20);
          
          if (!response || !response.data) continue;
          
          response.data.forEach((item: any) => {
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
                  ? new Date(item.snippet.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : "N/A",
                thumbnail: item.snippet?.thumbnails?.medium?.url || "",
                duration: "N/A",
                category: item.snippet?.categoryId || "General",
              });
            }
          });
        } catch (err) {
          console.warn(`Failed to fetch from ${region}:`, err);
        }
      }
      return allVideos.slice(0, 8);
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 15, // Cache in browser for 15 minutes
  });

  // Landing Page (when not authenticated)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#030303] text-white selection:bg-[#FF0000]/30 selection:text-white">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030303]/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/logo.png" alt="TrendTube Logo" className="h-8 w-auto rounded-md group-hover:opacity-90 transition-opacity" />
              <span className="text-xl font-bold text-white tracking-tight">TrendTube</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
                Log in
              </Link>
              <Link to="/signup" className="bg-white text-black hover:bg-white/90 px-4 py-2 rounded-full text-sm font-semibold transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        <HeroSection />
        <FeatureGrid />
        <Testimonials />
        <LandingFooter />
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
            {isLoading ? "Loading..." : "Updated now"}
          </span>
        </div>
        
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Failed to load trending videos.
          </div>
        )}

        {isLoading ? (
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
