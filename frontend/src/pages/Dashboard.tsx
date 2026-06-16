import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Loader, AlertCircle, Search, X } from "lucide-react";

interface TrendsData {
  keyword: string;
  region: string;
  category: string | null;
  timeline: Array<{ date: string; interest: number }>;
  topQueries: Array<{ query: string; volume: number; percentChange: number }>;
  risingQueries: Array<{ query: string; volume: number; growth: number; unit: string }>;
  commonlySearched: Array<{ query: string; frequency: string; trend: string }>;
  isRealData: boolean;
}

const Dashboard = () => {
  const [trendKeyword, setTrendKeyword] = useState("");
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [trendsError, setTrendsError] = useState<string | null>(null);
  
  // Filter states
  const [selectedLocation, setSelectedLocation] = useState("US");
  const [selectedTimeRange, setSelectedTimeRange] = useState("90days");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Common locations
  const locations = [
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "CA", name: "Canada" },
    { code: "AU", name: "Australia" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "JP", name: "Japan" },
    { code: "IN", name: "India" },
    { code: "BR", name: "Brazil" },
    { code: "MX", name: "Mexico" },
    { code: "WORLD", name: "Worldwide" },
  ];

  // Time ranges
  const timeRanges = [
    { value: "1hour", label: "Past hour", days: 1 },
    { value: "1day", label: "Past day", days: 1 },
    { value: "7days", label: "Past week", days: 7 },
    { value: "30days", label: "Past month", days: 30 },
    { value: "90days", label: "Past 3 months", days: 90 },
    { value: "1year", label: "Past year", days: 365 },
    { value: "5years", label: "Past 5 years", days: 1825 },
  ];

  // Categories
  const categories = [
    { value: "all", label: "All categories" },
    { value: "0-1", label: "Web Search" },
    { value: "71", label: "YouTube Search" },
    { value: "109", label: "News Search" },
    { value: "126", label: "Frommer's" },
    { value: "0-47", label: "Shopping" },
    { value: "0-71", label: "Image Search" },
  ];

  const fetchGoogleTrends = async (keyword: string, location?: string, timeRange?: string, category?: string) => {
    if (!keyword.trim()) {
      setTrendsError("Please enter a keyword");
      return;
    }

    try {
      setTrendsLoading(true);
      setTrendsError(null);

      const loc = location || selectedLocation;
      const time = timeRange || selectedTimeRange;
      const cat = category || selectedCategory;
      
      const timeConfig = timeRanges.find(t => t.value === time);
      const days = timeConfig?.days || 90;

      const trendsResponse = await fetch(
        `/api/trends/trends?keyword=${encodeURIComponent(keyword)}&days=${days}&region=${loc}&category=${cat}`
      );

      if (!trendsResponse.ok) {
        throw new Error("Failed to fetch trends data");
      }

      const trendsResult = await trendsResponse.json();
      setTrendsData(trendsResult.data);
    } catch (err: any) {
      console.error("[Trends] Error:", err);
      setTrendsError(err.message || "Failed to fetch trends data");
    } finally {
      setTrendsLoading(false);
    }
  };

  const handleTrendSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGoogleTrends(trendKeyword);
  };

  return (
    <div className="min-h-screen fade-in space-y-8">
      {/* Header Section */}
      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">Google Trends</h1>
        <p className="text-lg text-muted-foreground">
          Discover what's trending globally and analyze search interest patterns in real-time
        </p>
        <div className="pt-2 flex gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>Live trending data</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Search className="h-4 w-4 text-primary" />
            <span>90-day analytics</span>
          </div>
        </div>
      </div>

      {/* Main Search Section */}
      <div className="bg-card border border-border rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="TrendTube Logo" className="h-20 w-auto rounded-xl" />
        </div>
        <form onSubmit={handleTrendSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Enter a topic or keyword (e.g., 'AI', 'React', 'Gaming')..."
                value={trendKeyword}
                onChange={(e) => setTrendKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              disabled={trendsLoading}
              className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {trendsLoading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                "Search"
              )}
            </button>
          </div>
        </form>

        {/* Filters Section */}
        <div className="mb-6 p-4 bg-secondary/20 border border-border/50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  if (trendKeyword) {
                    setTimeout(() => fetchGoogleTrends(trendKeyword, e.target.value, selectedTimeRange, selectedCategory), 100);
                  }
                }}
                className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {locations.map((loc) => (
                  <option key={loc.code} value={loc.code}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Range Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Time Range</label>
              <select
                value={selectedTimeRange}
                onChange={(e) => {
                  setSelectedTimeRange(e.target.value);
                  if (trendKeyword) {
                    setTimeout(() => fetchGoogleTrends(trendKeyword, selectedLocation, e.target.value, selectedCategory), 100);
                  }
                }}
                className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {timeRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  if (trendKeyword) {
                    setTimeout(() => fetchGoogleTrends(trendKeyword, selectedLocation, selectedTimeRange, e.target.value), 100);
                  }
                }}
                className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {trendsData && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                Location: {locations.find(l => l.code === selectedLocation)?.name}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent">
                Time: {timeRanges.find(t => t.value === selectedTimeRange)?.label}
              </span>
              {selectedCategory !== "all" && (
                <span className="text-xs px-2 py-1 rounded-full bg-secondary/50 text-foreground border border-border/50">
                  Category: {categories.find(c => c.value === selectedCategory)?.label}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Empty State */}
        {!trendsData && !trendsLoading && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Start exploring trends</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Search for any topic or keyword to see real-time interest data, top queries, rising searches, and commonly searched terms from Google Trends.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                <div className="font-semibold text-foreground text-sm mb-1">Example 1</div>
                <button 
                  onClick={() => {
                    setTrendKeyword("AI");
                    setTimeout(() => fetchGoogleTrends("AI", selectedLocation, selectedTimeRange, selectedCategory), 0);
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Try "AI"
                </button>
              </div>
              <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                <div className="font-semibold text-foreground text-sm mb-1">Example 2</div>
                <button 
                  onClick={() => {
                    setTrendKeyword("React");
                    setTimeout(() => fetchGoogleTrends("React", selectedLocation, selectedTimeRange, selectedCategory), 0);
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Try "React"
                </button>
              </div>
              <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                <div className="font-semibold text-foreground text-sm mb-1">Example 3</div>
                <button 
                  onClick={() => {
                    setTrendKeyword("Gaming");
                    setTimeout(() => fetchGoogleTrends("Gaming", selectedLocation, selectedTimeRange, selectedCategory), 0);
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Try "Gaming"
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {trendsLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <Loader className="h-12 w-12 text-primary animate-spin mx-auto" />
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">Fetching trends data...</p>
                <p className="text-sm text-muted-foreground">Analyzing search interest patterns</p>
              </div>
            </div>
          </div>
        )}

        {trendsData && trendsData.timeline && trendsData.timeline.length > 0 && (
          <>
            <div className="mb-6 p-4 rounded-lg bg-secondary/30 border border-border/50">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Trends for "<span className="text-primary">{trendsData.keyword}</span>"
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {trendsData.isRealData ? "Real-time Google Trends data" : "Simulated trend data"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setTrendsData(null);
                    setTrendKeyword("");
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="h-80 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendsData.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 18%)" />
                  <XAxis dataKey="date" stroke="hsl(0 0% 53%)" fontSize={12} />
                  <YAxis stroke="hsl(0 0% 53%)" fontSize={12} label={{ value: "Interest", angle: -90, position: "insideLeft" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0 0% 12%)",
                      border: "1px solid hsl(0 0% 18%)",
                      borderRadius: 0,
                      color: "hsl(0 0% 92%)",
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="interest"
                    stroke="hsl(217 91% 60%)"
                    strokeWidth={2}
                    dot={false}
                    name="Search Interest"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {trendsData.topQueries && trendsData.topQueries.length > 0 && (
              <div className="pt-6 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4">Top Queries</h3>
                <div className="space-y-3">
                  {trendsData.topQueries.slice(0, 5).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => {
                        setTrendKeyword(item.query);
                        setTimeout(() => {
                          fetchGoogleTrends(item.query, selectedLocation, selectedTimeRange, selectedCategory);
                        }, 0);
                      }}
                    >
                      <div className="flex-1">
                        <p className="text-sm text-foreground truncate">{item.query}</p>
                        <p className="text-xs text-muted-foreground mt-1">{(item.volume / 1000000).toFixed(1)}M searches</p>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <span className={`text-sm font-semibold ${item.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {item.percentChange >= 0 ? '+' : ''}{item.percentChange}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {trendsData.risingQueries && trendsData.risingQueries.length > 0 && (
              <div className="pt-6 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  <span className="inline-flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    Rising Queries
                  </span>
                </h3>
                <div className="space-y-3">
                  {trendsData.risingQueries.slice(0, 5).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-accent/10 hover:bg-accent/20 transition-colors cursor-pointer"
                      onClick={() => {
                        setTrendKeyword(item.query);
                        setTimeout(() => {
                          fetchGoogleTrends(item.query, selectedLocation, selectedTimeRange, selectedCategory, selectedLocation, selectedTimeRange, selectedCategory);
                        }, 0);
                      }}
                    >
                      <div className="flex-1">
                        <p className="text-sm text-foreground truncate">{item.query}</p>
                        <p className="text-xs text-muted-foreground mt-1">{(item.volume / 1000000).toFixed(1)}M searches</p>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <span className="text-sm font-bold text-accent">
                          +{item.growth}% {item.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {trendsData.commonlySearched && trendsData.commonlySearched.length > 0 && (
              <div className="pt-6 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4">Commonly Searched</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {trendsData.commonlySearched.slice(0, 6).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-secondary/40 hover:bg-secondary/60 transition-colors cursor-pointer"
                      onClick={() => {
                        setTrendKeyword(item.query);
                        setTimeout(() => {
                          fetchGoogleTrends(item.query, selectedLocation, selectedTimeRange, selectedCategory);
                        }, 0);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-foreground truncate">{item.query}</p>
                          <div className="flex gap-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              item.frequency === 'Very High' 
                                ? 'bg-red-500/20 text-red-500' 
                                : item.frequency === 'High'
                                ? 'bg-orange-500/20 text-orange-500'
                                : 'bg-blue-500/20 text-blue-500'
                            }`}>
                              {item.frequency}
                            </span>
                          </div>
                        </div>
                        <div className="ml-2">
                          {item.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                          {item.trend === 'down' && <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />}
                          {item.trend === 'stable' && <div className="h-4 w-4 border-t-2 border-muted-foreground" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
