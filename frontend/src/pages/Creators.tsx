import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import axios from "axios";

interface Creator {
  id: string;
  name: string;
  description: string;
  subscribers: number;
  totalViews: number;
  videoCount: number;
  category: string;
  country: string;
  thumbnail: string;
  url?: string;
  isFromYoutube?: boolean;
  monthlyEarnings?: number;
  yearlyEarnings?: number;
}

interface YouTubeChannel {
  channelId: string;
  title: string;
  description: string;
  thumbnail: string;
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
  customUrl?: string;
}

const Creators = () => {
  const navigate = useNavigate();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [youtubeResults, setYoutubeResults] = useState<YouTubeChannel[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showYoutubeResults, setShowYoutubeResults] = useState(false);

  // Fetch local creators
  useEffect(() => {
    const calculateEarnings = (creator: Creator) => {
      // Estimated CPM (Cost Per Thousand views) - typical YouTube CPM is $0.5 - $5
      const avgCPM = 2; // Average $2 per 1000 views
      
      // Estimate monthly views based on subscriber count and typical engagement
      // Assume average channel gets 10% of their subscribers viewing per month
      const estimatedMonthlyViews = Math.max(creator.subscribers * 0.1, 1000);
      
      // Calculate monthly earnings
      const monthlyEarnings = (estimatedMonthlyViews / 1000) * avgCPM;
      
      // Calculate yearly earnings
      const yearlyEarnings = monthlyEarnings * 12;
      
      return {
        ...creator,
        monthlyEarnings: Math.round(monthlyEarnings),
        yearlyEarnings: Math.round(yearlyEarnings),
      };
    };

    const fetchCreators = async () => {
      try {
        console.log("Fetching creators...");
        const response = await fetch(`/api/analytics/creators?limit=18`);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data);

        if (data.data && Array.isArray(data.data)) {
          console.log("Setting creators:", data.data);
          const creatorsWithEarnings = data.data.map(calculateEarnings);
          setCreators(creatorsWithEarnings);
          setFilteredCreators(creatorsWithEarnings);
        } else {
          setError("No creators found");
        }
      } catch (err: any) {
        console.error("Error fetching creators:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCreators();
  }, []);

  // Search YouTube channels
  useEffect(() => {
    const searchYoutube = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setYoutubeResults([]);
        setShowYoutubeResults(false);
        return;
      }

      setYoutubeLoading(true);
      try {
        const response = await axios.get(`/api/youtube/search-channel`, {
          params: {
            q: searchQuery,
            maxResults: 10,
          },
        });

        console.log("YouTube search results:", response.data);
        
        if (response.data.data && Array.isArray(response.data.data)) {
          setYoutubeResults(response.data.data);
          setShowYoutubeResults(true);
        } else {
          setYoutubeResults([]);
        }
      } catch (err: any) {
        console.error("YouTube search error:", err);
        setYoutubeResults([]);
      } finally {
        setYoutubeLoading(false);
      }
    };

    const timer = setTimeout(() => {
      searchYoutube();
    }, 500); // Debounce search

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter creators based on search
  useEffect(() => {
    let filtered = creators;

    // Search filter - trim and match
    if (searchQuery.trim() && !showYoutubeResults) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
      );
      console.log("Search query:", query, "Results:", filtered.length);
    }

    console.log("Filtered creators:", filtered);
    setFilteredCreators(filtered);
  }, [searchQuery, creators, showYoutubeResults]);

  // Filter YouTube results
  const filteredYoutubeResults = youtubeResults;

  const formatNumber = (num: string | number): string => {
    const numVal = typeof num === 'string' ? parseInt(num) : num;
    
    if (numVal >= 1000000) return (numVal / 1000000).toFixed(1) + "M";
    if (numVal >= 1000) return (numVal / 1000).toFixed(0) + "K";
    return numVal.toString();
  };

  const formatCurrency = (num: number | undefined): string => {
    if (!num) return "$0";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

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

  const displayResults = showYoutubeResults ? filteredYoutubeResults : filteredCreators;
  const isSearching = showYoutubeResults && searchQuery.trim().length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Top Creators</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isSearching 
            ? `YouTube results for "${searchQuery}"` 
            : `${filteredCreators.length} creators found`}
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        {youtubeLoading && <Loader className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-primary" />}
        <Input
          type="text"
          placeholder="Search creators by name or search YouTube..."
          value={searchQuery}
          onChange={(e) => {
            const value = e.target.value;
            console.log("Search input changed:", value);
            setSearchQuery(value);
          }}
          className="pl-10"
          autoFocus={false}
        />
      </div>

      {/* Results */}
      <div className="space-y-3">
        {displayResults.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {youtubeLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader className="h-4 w-4 animate-spin" />
                Searching YouTube...
              </div>
            ) : (
              isSearching 
                ? `No creators found for "${searchQuery}" on YouTube`
                : "No creators found matching your filters"
            )}
          </div>
        ) : (
          displayResults.map((item, index) => {
            // Determine if this is a YouTube result or local creator
            const isYoutube = showYoutubeResults;
            const thumbnail = isYoutube 
              ? (item as YouTubeChannel).thumbnail 
              : (item as Creator).thumbnail;
            const title = isYoutube 
              ? (item as YouTubeChannel).title 
              : (item as Creator).name;
            const description = isYoutube 
              ? (item as YouTubeChannel).description 
              : (item as Creator).description;
            const subs = isYoutube 
              ? (item as YouTubeChannel).subscriberCount 
              : (item as Creator).subscribers;
            const views = isYoutube 
              ? (item as YouTubeChannel).viewCount 
              : (item as Creator).totalViews;
            const videos = isYoutube 
              ? (item as YouTubeChannel).videoCount 
              : (item as Creator).videoCount;
            const youtubeUrl = isYoutube 
              ? `https://youtube.com/channel/${(item as YouTubeChannel).channelId}`
              : (item as Creator).url;
            const category = !isYoutube ? (item as Creator).category : null;
            const monthlyEarnings = !isYoutube ? (item as Creator).monthlyEarnings : null;
            const yearlyEarnings = !isYoutube ? (item as Creator).yearlyEarnings : null;

            return (
              <div
                key={index}
                onClick={() => {
                  // Navigate to channel view for local creators
                  if (!isYoutube) {
                    const creatorId = (item as Creator).id;
                    navigate(`/creators/${creatorId}`);
                  } else {
                    // Open YouTube channel in new tab for YouTube results
                    window.open(youtubeUrl, "_blank");
                  }
                }}
                className="flex gap-4 p-4 border border-border bg-card/50 rounded-lg hover:border-primary/50 hover:bg-card transition-all cursor-pointer"
              >
                {/* Profile Image */}
                {thumbnail && (
                  <div className="flex-shrink-0">
                    <img
                      src={thumbnail}
                      alt={title}
                      className="h-24 w-24 rounded-lg object-cover border-2 border-primary/20"
                      onError={(e) => {
                        console.log("Image failed to load:", thumbnail);
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}

                {/* Creator Info */}
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="font-bold text-foreground text-lg">
                    {title}
                  </h3>
                  
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {description}
                  </p>

                  <div className="flex gap-4 mt-3">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      📊 {formatNumber(subs)} Subs
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      👁️ {formatNumber(views)} Views
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      🎬 {formatNumber(videos)} Videos
                    </span>
                  </div>
                </div>

                {/* Earnings */}
                {!isYoutube && monthlyEarnings && yearlyEarnings && (
                  <div className="flex flex-row justify-center items-center gap-4 text-center">
                    <div className="text-sm font-bold text-green-600">
                      {formatCurrency(monthlyEarnings)}
                      <span className="text-xs block text-muted-foreground">Monthly</span>
                    </div>
                    <div className="text-sm font-bold text-green-600">
                      {formatCurrency(yearlyEarnings)}
                      <span className="text-xs block text-muted-foreground">Yearly</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Creators;
