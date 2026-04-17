import { useState, useEffect } from "react";
import { Image, Loader, AlertCircle, TrendingUp, Sparkles, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Thumbnail {
  videoId: string;
  title: string;
  thumbnail: string;
  views: number;
  viewsFormatted: string;
  likes: number;
  comments: number;
  channelTitle: string;
  engagementRate: number;
  ctrScore: number;
}

interface DesignInsights {
  designElements: string[];
  strengths: string[];
  styleTags: string[];
  whyItWorks: string;
}

interface SimilarThumbnailsData {
  thumbnails: Thumbnail[];
  ctrScores: Array<{ videoId: string; ctrScore: number }>;
  engagementRates: Array<{ videoId: string; engagementRate: number }>;
  bestThumbnail: Thumbnail | null;
  designInsights: DesignInsights;
}

interface SimilarThumbnailsProps {
  videoData: {
    title: string;
    views: number;
  };
}

const SimilarThumbnails = ({ videoData }: SimilarThumbnailsProps) => {
  const [data, setData] = useState<SimilarThumbnailsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSimilarThumbnails();
  }, [videoData.title]);

  const fetchSimilarThumbnails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/video/similar-thumbnails?title=${encodeURIComponent(videoData.title)}`
      );
      if (!response.ok) throw new Error("Failed to fetch similar thumbnails");
      const apiData = await response.json();
      setData(apiData.data);
    } catch (err: any) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const getCTRColor = (ctr: number) => {
    if (ctr >= 5) return "text-green-400";
    if (ctr >= 3) return "text-blue-400";
    if (ctr >= 1) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image className="h-5 w-5 text-[#3B82F6]" />
          <h3 className="text-lg font-bold text-[#FFFFFF]">Similar Video Thumbnails Analysis</h3>
        </div>
        <Button
          onClick={fetchSimilarThumbnails}
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
          <p className="text-sm text-[#A0A0A0]">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="h-8 w-8 text-[#FF0000] animate-spin" />
        </div>
      ) : data && data.thumbnails.length > 0 ? (
        <>
          {/* Best Thumbnail Highlight */}
          {data.bestThumbnail && (
            <div className="bg-gradient-to-r from-[#FF0000]/10 to-[#E60030]/10 border border-[#FF0000]/50 rounded-2xl p-6 shadow-lg">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={data.bestThumbnail.thumbnail}
                    alt={data.bestThumbnail.title}
                    className="w-40 h-24 rounded-lg object-cover border-2 border-[#FF0000]"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-lg font-bold text-[#FFFFFF] line-clamp-2">{data.bestThumbnail.title}</h4>
                    <Badge className="bg-[#FF0000] text-white">⭐ Best CTR</Badge>
                  </div>
                  <p className="text-sm text-[#A0A0A0] mb-4">{data.bestThumbnail.channelTitle}</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-[#A0A0A0] mb-1">Views</p>
                      <p className="text-lg font-bold text-[#FFFFFF]">{data.bestThumbnail.viewsFormatted}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#A0A0A0] mb-1">Engagement</p>
                      <p className="text-lg font-bold text-[#22C55E]">{(data.bestThumbnail.engagementRate * 100).toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#A0A0A0] mb-1">CTR Score</p>
                      <p className={`text-lg font-bold ${getCTRColor(data.bestThumbnail.ctrScore)}`}>
                        {data.bestThumbnail.ctrScore.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Why This Thumbnail Works */}
          {data.designInsights && (
            <div className="bg-[#121212] border border-gray-700 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-[#030303] border border-gray-600 rounded-lg">
                  <Sparkles className="h-6 w-6 text-[#FF0000]" />
                </div>
                <h3 className="text-lg font-bold text-[#FFFFFF]">Why This Thumbnail Works</h3>
              </div>
              
              <p className="text-[#A0A0A0] text-base leading-relaxed mb-6">
                {data.designInsights.whyItWorks}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-[#FFFFFF] mb-3 text-sm">Design Elements</h4>
                  <div className="space-y-2">
                    {data.designInsights.designElements.map((element, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-[#E2E8F0]">
                        <span className="text-[#FF0000]">✓</span>
                        {element}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#FFFFFF] mb-3 text-sm">Strengths</h4>
                  <div className="space-y-2">
                    {data.designInsights.strengths.map((strength, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-[#E2E8F0]">
                        <span className="text-[#22C55E]">★</span>
                        {strength}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {data.designInsights.styleTags && data.designInsights.styleTags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h4 className="font-semibold text-[#FFFFFF] mb-3 text-sm">Style Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.designInsights.styleTags.map((tag, idx) => (
                      <Badge key={idx} className="bg-[#FF0000]/20 text-[#FF0000] border border-[#FF0000]/50">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Thumbnail Grid */}
          <div>
            <h4 className="text-lg font-semibold text-[#FFFFFF] mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#3B82F6]" />
              Top Performing Thumbnails
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.thumbnails.map((thumb) => (
                <div
                  key={thumb.videoId}
                  className={`bg-[#121212] border-2 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all ${
                    data.bestThumbnail?.videoId === thumb.videoId
                      ? "border-[#FF0000] ring-2 ring-[#FF0000]/50"
                      : "border-gray-700 hover:border-[#FF0000]"
                  }`}
                >
                  <div className="relative aspect-video overflow-hidden bg-[#030303]">
                    <img
                      src={thumb.thumbnail}
                      alt={thumb.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/320x180?text=No+Image";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="sm"
                        className="bg-[#FF0000] hover:bg-[#E60030] text-white"
                        onClick={() => window.open(`https://youtube.com/watch?v=${thumb.videoId}`, '_blank')}
                      >
                        Watch
                      </Button>
                    </div>
                    {data.bestThumbnail?.videoId === thumb.videoId && (
                      <div className="absolute top-2 right-2 bg-[#FF0000] text-white px-3 py-1 rounded-full text-xs font-bold">
                        ⭐ Best
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <h5 className="font-semibold text-[#FFFFFF] text-sm line-clamp-2">{thumb.title}</h5>
                    <p className="text-xs text-[#A0A0A0]">{thumb.channelTitle}</p>
                    
                    {/* Metrics */}
                    <div className="space-y-2 pt-2 border-t border-gray-700">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#A0A0A0]">Views</span>
                        <span className="font-semibold text-[#FFFFFF]">{thumb.viewsFormatted}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#A0A0A0]">Engagement</span>
                        <span className="font-semibold text-[#22C55E]">{(thumb.engagementRate * 100).toFixed(2)}%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#A0A0A0]">CTR Score</span>
                        <span className={`font-semibold ${getCTRColor(thumb.ctrScore)}`}>
                          {thumb.ctrScore.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <AlertCircle className="h-8 w-8 text-[#A0A0A0] mx-auto mb-3" />
          <p className="text-[#A0A0A0]">No similar thumbnails found. Try refining your search.</p>
        </div>
      )}
    </div>
  );
};

export default SimilarThumbnails;
