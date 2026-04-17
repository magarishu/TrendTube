import { useState, useEffect } from "react";
import { AlertCircle, Loader, Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import VideoCard from "@/components/VideoCard";
import type { Video } from "@/data/mockData";
import apiClient from "@/services/apiClient";
import { parseYouTubeLink, isYouTubeLink } from "@/utils/youtubeParser";

// YouTube category ID mapping
const CATEGORY_MAP: { [key: string]: string } = {
  "1": "Film & Animation",
  "2": "Autos & Vehicles",
  "10": "Music",
  "15": "Pets & Animals",
  "17": "Sports",
  "18": "Short Movies",
  "19": "Travel & Events",
  "20": "Gaming",
  "21": "Videoblogging",
  "22": "People & Blogs",
  "23": "Comedy",
  "24": "Entertainment",
  "25": "News & Politics",
  "26": "Howto & Style",
  "27": "Education",
  "28": "Science & Technology",
  "29": "Nonprofits & Activism",
  "30": "Movies",
  "31": "Anime/Animation",
  "32": "Action/Adventure",
  "33": "Classics",
  "34": "Comedies",
  "35": "Documentaries",
  "36": "Dramas",
  "37": "Family",
  "38": "Foreign",
  "39": "Horror",
  "40": "Sci-Fi/Fantasy",
  "41": "Thrillers",
  "42": "Shorts",
  "43": "Shows",
  "44": "Trailers",
};

const Categories = () => {
  const location = useLocation();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableCategories, setAvailableCategories] = useState<Set<string>>(new Set());
  const [linkedVideo, setLinkedVideo] = useState<Video | null>(null);
  const [fetchingLinkedVideo, setFetchingLinkedVideo] = useState(false);
  
  // New states for channel and title search
  const [searchResults, setSearchResults] = useState<Video[]>([]);
  const [searchChannelName, setSearchChannelName] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<'video' | 'channel' | 'title' | 'none'>('none');

  // Initialize search query from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search");
    if (search) {
      setSearchQuery(search);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch videos multiple times to get more results
        const allVideos: Video[] = [];
        const regions = ['US', 'GB', 'IN', 'JP', 'FR'];
        
        for (const region of regions) {
          try {
            const response = await apiClient.youtube.getTrending(region, 50);
            
            if (response && response.data && Array.isArray(response.data)) {
              const categories = new Set<string>();
              
              response.data.forEach((item: any) => {
                const categoryId = item.snippet?.categoryId;
                const categoryName = categoryId ? CATEGORY_MAP[categoryId] || `Category ${categoryId}` : "General";
                categories.add(categoryName);
                
                // Check if video already exists (avoid duplicates)
                const exists = allVideos.some(v => v.id === item.id);
                if (!exists) {
                  allVideos.push({
                    id: item.id,
                    title: item.snippet?.title || "Untitled",
                    channel: item.snippet?.channelTitle || "Unknown",
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
                    category: categoryName,
                  });
                }
              });
              
              setAvailableCategories(prev => new Set([...prev, ...categories]));
            }
          } catch (err) {
            console.warn(`Failed to fetch videos from ${region}:`, err);
          }
        }
        
        setVideos(allVideos);
      } catch (err: any) {
        console.error("Failed to fetch videos:", err);
        setError(`Failed to load videos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Handle YouTube link detection and fetching
  useEffect(() => {
    const handleYouTubeLink = async () => {
      if (!searchQuery.trim()) {
        setLinkedVideo(null);
        return;
      }

      if (isYouTubeLink(searchQuery) || (searchQuery.trim().length > 1 && searchQuery.trim().length < 100)) {
        setFetchingLinkedVideo(true);
        const parsed = parseYouTubeLink(searchQuery);

        try {
          if (parsed.type === 'video') {
            // Fetch specific video
            const response = await apiClient.youtube.getVideo(parsed.id);
            if (response && response.data) {
              const item = response.data;
              const categoryId = item.snippet?.categoryId;
              const categoryName = categoryId ? CATEGORY_MAP[categoryId] || `Category ${categoryId}` : "General";

              const linkedVideoData: Video = {
                id: item.id,
                title: item.snippet?.title || "Untitled",
                channel: item.snippet?.channelTitle || "Unknown",
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
                category: categoryName,
              };
              setLinkedVideo(linkedVideoData);
              setSearchResults([]);
              setSearchType('none');
              setError(null);
            }
          } else if (parsed.type === 'channel') {
            // Fetch channel videos
            const response = await apiClient.youtube.getChannelVideos(parsed.id, 1);
            if (response && response.data && response.data.length > 0) {
              const item = response.data[0];
              const categoryId = item.snippet?.categoryId;
              const categoryName = categoryId ? CATEGORY_MAP[categoryId] || `Category ${categoryId}` : "General";

              const linkedVideoData: Video = {
                id: item.id,
                title: item.snippet?.title || "Untitled",
                channel: item.snippet?.channelTitle || "Unknown",
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
                category: categoryName,
              };
              setLinkedVideo(linkedVideoData);
              setSearchResults([]);
              setSearchType('none');
              setError(null);
            }
          } else if (parsed.type === 'search' || parsed.type === 'channel_name') {
            // Fetch search results for channel name or video title
            const response = await apiClient.youtube.search(parsed.id, 8);
            if (response && response.data && response.data.length > 0) {
              const results: Video[] = response.data
                .filter((item: any) => item.snippet)
                .map((item: any) => {
                  const categoryId = item.snippet?.categoryId;
                  const categoryName = categoryId ? CATEGORY_MAP[categoryId] || `Category ${categoryId}` : "General";
                  
                  return {
                    id: item.id,
                    title: item.snippet?.title || "Untitled",
                    channel: item.snippet?.channelTitle || "Unknown",
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
                    category: categoryName,
                  };
                });
              
              setSearchResults(results);
              setSearchChannelName(parsed.name || parsed.id);
              setSearchType(parsed.type === 'channel_name' ? 'channel' : 'title');
              setLinkedVideo(null);
              setError(null);
            } else {
              setSearchResults([]);
              setSearchChannelName(null);
              setSearchType('none');
              setLinkedVideo(null);
            }
          }
        } catch (err: any) {
          console.error("Failed to fetch video from link:", err);
          setError(`Failed to fetch video: ${err.response?.data?.error || err.message}`);
          setLinkedVideo(null);
          setSearchResults([]);
          setSearchType('none');
        } finally {
          setFetchingLinkedVideo(false);
        }
      } else {
        setLinkedVideo(null);
        setSearchResults([]);
        setSearchType('none');
      }
    };

    const debounceTimer = setTimeout(handleYouTubeLink, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Filter videos by search query and category
  let filteredVideos = videos;
  
  if (activeCategory) {
    filteredVideos = filteredVideos.filter((v) => v.category === activeCategory);
  }
  
  if (searchQuery.trim()) {
    // Only apply text filter if it's not a YouTube link and not a search query (no API results)
    if (!isYouTubeLink(searchQuery) && searchResults.length === 0) {
      const query = searchQuery.toLowerCase();
      filteredVideos = filteredVideos.filter((v) =>
        v.title.toLowerCase().includes(query) ||
        v.channel.toLowerCase().includes(query)
      );
    } else if (!isYouTubeLink(searchQuery) && searchResults.length > 0) {
      // If we have search results from API, don't show local videos
      filteredVideos = [];
    }
  }

  return (
    <div className="fade-in space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Categories</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse trending videos by category</p>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, channel, or paste a YouTube link/video ID..."
          className="w-full pl-10 pr-4 py-2.5 rounded-sm border border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
        />
      </div>

      {/* Category selector */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Select Category:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
              activeCategory === null
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            All Videos
          </button>
          {Array.from(availableCategories).sort().map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(activeCategory === category ? null : category)}
              className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Videos grid */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          {activeCategory ? `${activeCategory} Videos (${filteredVideos.length})` : `All Trending Videos (${filteredVideos.length})`}
          {searchQuery && ` - "${searchQuery}"`}
        </h2>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Linked Video Section */}
        {isYouTubeLink(searchQuery) && (
          <div>
            {fetchingLinkedVideo ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : linkedVideo ? (
              <div className="mb-8">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Video from Link</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  <VideoCard video={linkedVideo} />
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Search Results Section */}
        {!isYouTubeLink(searchQuery) && searchResults.length > 0 && (
          <div>
            {fetchingLinkedVideo ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="mb-8">
                <h3 className="mb-4 text-lg font-semibold text-foreground">
                  {searchType === 'channel' 
                    ? `Videos from Channel "${searchChannelName}"` 
                    : `Search Results for "${searchChannelName}"`}
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {searchResults.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            {searchQuery && !isYouTubeLink(searchQuery) ? `No videos found matching "${searchQuery}"` : "No videos found in this category"}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
