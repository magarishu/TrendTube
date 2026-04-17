import { useState, useEffect } from "react";
import { Users, Loader, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CompetitorVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  views: string;
  channelTitle: string;
  engagement: string;
}

interface CompetitorVideosProps {
  videoData: {
    title: string;
    views: number;
  };
}

const CompetitorVideos = ({ videoData }: CompetitorVideosProps) => {
  const [competitors, setCompetitors] = useState<CompetitorVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompetitorVideos();
  }, [videoData.title]);

  const fetchCompetitorVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/video/competitors?title=${encodeURIComponent(videoData.title)}`
      );
      if (!response.ok) throw new Error("Failed to fetch competitor videos");
      const data = await response.json();
      setCompetitors(data.data || []);
    } catch (err: any) {
      setError(err.message);
      // Set mock data
      generateMockCompetitors();
    } finally {
      setLoading(false);
    }
  };

  const generateMockCompetitors = () => {
    setCompetitors([
      {
        videoId: "1",
        title: "Competitor Video with High Engagement",
        thumbnail: "https://i.ytimg.com/vi/jNQXAC9IVRw/maxresdefault.jpg",
        views: "2.5M",
        channelTitle: "Competitor Channel",
        engagement: "8.5%"
      },
      {
        videoId: "2",
        title: "Top Performing Similar Content",
        thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
        views: "3.2M",
        channelTitle: "Competitive Channel",
        engagement: "7.2%"
      },
      {
        videoId: "3",
        title: "Industry Leader Video",
        thumbnail: "https://i.ytimg.com/vi/9bZkp7q19f0/maxresdefault.jpg",
        views: "5.8M",
        channelTitle: "Industry Authority",
        engagement: "6.9%"
      },
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-[#3B82F6]" />
          <h3 className="text-lg font-bold text-[#FFFFFF]">Competitor Analysis</h3>
        </div>
        <Button
          onClick={fetchCompetitorVideos}
          disabled={loading}
          variant="outline"
          className="border-gray-700 text-[#FFFFFF] hover:bg-[#121212]"
        >
          {loading ? <Loader className="h-4 w-4 animate-spin" /> : "Refresh"}
        </Button>
      </div>

      {error && (
        <div className="bg-[#121212] border border-gray-700 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-[#F59E0B] flex-shrink-0" />
          <p className="text-sm text-[#A0A0A0]">{error} - Showing sample data</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="h-8 w-8 text-[#FF0000] animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {competitors.map((comp, idx) => (
            <div
              key={idx}
              className="bg-[#121212] border border-gray-700 rounded-xl p-4 shadow-lg hover:shadow-xl hover:border-[#3B82F6] transition-all"
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <img
                    src={comp.thumbnail}
                    alt={comp.title}
                    className="w-32 h-20 object-cover rounded-lg border border-gray-700 hover:border-[#3B82F6]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/128x80?text=No+Image";
                    }}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="font-semibold text-[#FFFFFF] line-clamp-2">{comp.title}</h4>
                  <p className="text-sm text-[#A0A0A0]">{comp.channelTitle}</p>
                  <div className="flex gap-4 flex-wrap">
                    <Badge variant="secondary" className="bg-[#030303] border-gray-700 text-[#FFFFFF]">
                      {comp.views} views
                    </Badge>
                    <Badge variant="secondary" className="bg-[#030303] border-gray-700 text-[#FF0000]">
                      {comp.engagement} engagement
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-[#3B82F6] hover:bg-[#2563EB] text-white self-start"
                  onClick={() => window.open(`https://youtube.com/watch?v=${comp.videoId}`, '_blank')}
                >
                  Watch
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Competitive Intelligence */}
      <div className="bg-[#121212] border border-gray-700 rounded-2xl p-6 shadow-lg space-y-4">
        <h4 className="text-lg font-bold text-[#FFFFFF]">What to Look For in Competitor Videos</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#030303] rounded-lg border border-gray-700">
            <p className="font-semibold text-[#FFFFFF] mb-2">Title Strategy</p>
            <p className="text-sm text-[#A0A0A0]">
              Notice keywords used in successful titles. Do they use power words, numbers, or patterns?
            </p>
          </div>
          <div className="p-4 bg-[#030303] rounded-lg border border-gray-700">
            <p className="font-semibold text-[#FFFFFF] mb-2">Thumbnail Design</p>
            <p className="text-sm text-[#A0A0A0]">
              Analyze thumbnail colors, text placement, and emotional expressions that stand out.
            </p>
          </div>
          <div className="p-4 bg-[#030303] rounded-lg border border-gray-700">
            <p className="font-semibold text-[#FFFFFF] mb-2">Content Structure</p>
            <p className="text-sm text-[#A0A0A0]">
              How do they hook viewers? What's the content flow? Where are the retention points?
            </p>
          </div>
          <div className="p-4 bg-[#030303] rounded-lg border border-gray-700">
            <p className="font-semibold text-[#FFFFFF] mb-2">Engagement Tactics</p>
            <p className="text-sm text-[#A0A0A0]">
              Look for CTAs, community interactions, and how they encourage likes/comments.
            </p>
          </div>
        </div>
      </div>

      {/* Competitive Advantage */}
      <div className="bg-[#121212] border border-gray-700 rounded-2xl p-6 shadow-lg space-y-4">
        <h4 className="text-lg font-bold text-[#FFFFFF]">Gain Your Competitive Edge</h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-[#030303] rounded-lg border border-gray-700">
            <span className="text-[#22C55E] font-bold text-lg">1.</span>
            <p className="text-[#FFFFFF] text-sm"><span className="font-semibold">Differentiate:</span> Find a unique angle they haven't covered</p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-[#030303] rounded-lg border border-gray-700">
            <span className="text-[#22C55E] font-bold text-lg">2.</span>
            <p className="text-[#FFFFFF] text-sm"><span className="font-semibold">Go Deeper:</span> Provide more value and detail than competitors</p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-[#030303] rounded-lg border border-gray-700">
            <span className="text-[#22C55E] font-bold text-lg">3.</span>
            <p className="text-[#FFFFFF] text-sm"><span className="font-semibold">Add Your Style:</span> Use your unique personality and format</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitorVideos;
