import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AlertCircle, Loader, Play, TrendingUp, Zap, Search, Target, AlertTriangle, Lightbulb, Image, Type, Sparkles, Users, CheckCircle, BarChart3, Lightbulb as IdeaIcon, Users2, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import RetentionGraph from "@/components/analysis/RetentionGraph";
import SimilarThumbnails from "@/components/analysis/SimilarThumbnails";
import OutlierAnalysis from "@/components/analysis/OutlierAnalysis";
import VideoIdeas from "@/components/analysis/VideoIdeas";
import CompetitorVideos from "@/components/analysis/CompetitorVideos";
import TitleAnalyzer from "@/components/analysis/TitleAnalyzer";

interface AnalysisResult {
  videoId: string;
  title: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  engagementRate: number;
  seoScore: number;
  viralPotential: number;
  viralScore: number;
  audience: string[];
  analysis: string;
  suggestedTitles: string[];
  suggestedKeywords: string[];
  viralVideoIdeas: string[];
  thumbnailScore: number;
  thumbnailTips: string[];
  thumbnailTextIdeas: string[];
  publishedAt: string;
  channelTitle: string;
  // New dynamic fields
  aiAnalysisOverview: string;
  retentionInsights: string[];
  targetAudience: {
    type: string;
    experienceLevel: string;
    interests: string[];
    geographicRegion: string;
  };
}

const VideoAnalyzer = () => {
  const location = useLocation();
  const [videoUrl, setVideoUrl] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>("retention");

  // Initialize from URL parameters on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlParam = params.get("url");
    
    if (urlParam) {
      setVideoUrl(urlParam);
      console.log('[VideoAnalyzer] Video URL loaded from URL params:', urlParam);
    }
  }, [location.search]);

  // Auto-analyze when video URL is set from navigation
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlParam = params.get("url");
    
    if (urlParam && videoUrl === urlParam && !analysis && !loading) {
      // Trigger analysis automatically
      setTimeout(() => {
        handleAnalyzeAuto(urlParam);
      }, 500);
    }
  }, [videoUrl, location.search]);

  // Helper function to perform video analysis
  const analyzeVideo = async (url: string) => {
    setError(null);
    setAnalysis(null);

    if (!url || !url.trim()) {
      setError("Please enter a YouTube video URL");
      return;
    }

    setLoading(true);
    console.log('[VideoAnalyzer] Sending request to:', `/api/video/analyze?url=${url}`);
    
    try {
      const response = await fetch(
        `/api/video/analyze?url=${encodeURIComponent(url)}`
      );

      console.log('[VideoAnalyzer] Response status:', response.status);
      console.log('[VideoAnalyzer] Response headers:', {
        contentType: response.headers.get("content-type")
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Failed to analyze video";

        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (e) {
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
        } else {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }

        console.error('[VideoAnalyzer] Error:', errorMessage);
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned invalid response format (not JSON)");
      }

      const data = await response.json();
      console.log('[VideoAnalyzer] Analysis complete:', data);
      setAnalysis(data.data);
    } catch (err: any) {
      const message = err.message || "An error occurred while analyzing the video";
      setError(message);
      console.error("[VideoAnalyzer] Analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    await analyzeVideo(videoUrl);
  };

  const handleAnalyzeAuto = async (url: string) => {
    await analyzeVideo(url);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-emerald-700";
    if (score >= 60) return "text-cyan-700";
    if (score >= 40) return "text-amber-700";
    return "text-rose-700";
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return "bg-emerald-100";
    if (score >= 60) return "bg-cyan-100";
    if (score >= 40) return "bg-amber-100";
    return "bg-rose-100";
  };

  const getScoreTextColor = (score: number): string => {
    if (score >= 80) return "text-emerald-900";
    if (score >= 60) return "text-cyan-900";
    if (score >= 40) return "text-amber-900";
    return "text-rose-900";
  };

  return (
    <div className="min-h-screen space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold text-[#FFFFFF]">Video Analyzer</h1>
        <p className="text-[#A0A0A0] text-lg">
          Get AI-powered insights and optimize your YouTube content
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-[#121212] border border-gray-700 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
        <div className="space-y-4">
          <label className="text-sm font-semibold text-[#FFFFFF] flex items-center gap-2">
            <Search className="h-5 w-5 text-[#FF0000]" />
            YouTube Video URL
          </label>
          <div className="flex flex-col md:flex-row gap-3">
            <Input
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
              className="flex-1 bg-[#030303] border-gray-700 rounded-lg text-[#FFFFFF] placeholder-[#64748B] focus:border-[#FF0000] focus:ring-[#FF0000]"
            />
            <Button
              onClick={handleAnalyze}
              disabled={loading}
              className="bg-[#FF0000] hover:bg-[#E60030] text-white font-semibold rounded-lg shadow-lg px-8 transition-all duration-300 hover:shadow-xl"
            >
              {loading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5 mr-2" />
              )}
              {loading ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-[#121212] border-2 border-[#EF4444] rounded-2xl p-6 flex gap-4 shadow-lg">
          <AlertCircle className="h-6 w-6 text-[#EF4444] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-[#FFFFFF] mb-1">Analysis Error</p>
            <p className="text-sm text-[#A0A0A0]">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-32">
          <div className="text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <Loader className="h-24 w-24 text-[#FF0000] animate-spin mx-auto" />
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-[#FFFFFF]">Analyzing your video...</p>
              <p className="text-[#A0A0A0]">Powered by AI • This typically takes 30-60 seconds</p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && !loading && (
        <div className="space-y-8">
          {/* Video Header Card */}
          <div className="bg-[#121212] border border-gray-700 rounded-2xl p-6 shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
            <div className="flex flex-col md:flex-row gap-6">
              {analysis.thumbnail && (
                <div className="rounded-xl overflow-hidden shadow-lg md:flex-shrink-0 border border-gray-600 hover:border-[#FF0000] transition-all">
                  <img
                    src={analysis.thumbnail}
                    alt={analysis.title}
                    className="w-full md:w-40 h-28 object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="flex-1 space-y-3">
                <h2 className="text-2xl md:text-3xl font-bold text-[#FFFFFF] line-clamp-2">
                  {analysis.title}
                </h2>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[#FF0000]">{analysis.channelTitle}</p>
                  <p className="text-xs text-[#A0A0A0]">
                    Published {new Date(analysis.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Views Metric */}
            <div className="bg-[#121212] border border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:border-gray-500">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#A0A0A0] text-sm font-semibold uppercase tracking-wider">Views</span>
                <Play className="h-5 w-5 text-[#FF0000]" />
              </div>
              <p className="text-4xl font-bold text-[#FFFFFF]">{formatNumber(analysis.views)}</p>
            </div>

            {/* Likes Metric */}
            <div className="bg-[#121212] border border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:border-gray-500">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#A0A0A0] text-sm font-semibold uppercase tracking-wider">Likes</span>
                <Zap className="h-5 w-5 text-[#FF0000]" />
              </div>
              <p className="text-4xl font-bold text-[#FFFFFF]">{formatNumber(analysis.likes)}</p>
            </div>

            {/* Comments Metric */}
            <div className="bg-[#121212] border border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:border-gray-500">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#A0A0A0] text-sm font-semibold uppercase tracking-wider">Comments</span>
                <Users className="h-5 w-5 text-[#FF0000]" />
              </div>
              <p className="text-4xl font-bold text-[#FFFFFF]">{formatNumber(analysis.comments)}</p>
            </div>

            {/* Engagement Metric */}
            <div className="bg-[#121212] border border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:border-gray-500">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#A0A0A0] text-sm font-semibold uppercase tracking-wider">Engagement</span>
                <TrendingUp className="h-5 w-5 text-[#FF0000]" />
              </div>
              <p className="text-4xl font-bold text-[#FFFFFF]">{(analysis.engagementRate * 100).toFixed(1)}%</p>
            </div>
          </div>

          {/* Performance Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* SEO Score */}
            <div className="bg-[#121212] border border-gray-700 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:border-[#22C55E]/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#FFFFFF] flex items-center gap-2">
                  <Zap className="h-5 w-5 text-[#22C55E]" />
                  SEO Score
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <span className="text-5xl font-bold text-[#22C55E]">{analysis.seoScore}</span>
                  <span className="text-[#A0A0A0] text-sm">/100</span>
                </div>
                <div className="w-full bg-[#030303] rounded-full h-3 overflow-hidden border border-gray-700">
                  <div
                    className="h-3 bg-gradient-to-r from-[#22C55E] to-[#16A34A] rounded-full transition-all duration-700"
                    style={{ width: `${analysis.seoScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Viral Score */}
            <div className="bg-[#121212] border border-gray-700 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:border-[#F59E0B]/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#FFFFFF] flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#F59E0B]" />
                  Viral Potential
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <span className="text-5xl font-bold text-[#F59E0B]">{analysis.viralScore || 0}</span>
                  <span className="text-[#A0A0A0] text-sm">/100</span>
                </div>
                <div className="w-full bg-[#030303] rounded-full h-3 overflow-hidden border border-gray-700">
                  <div
                    className="h-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-full transition-all duration-700"
                    style={{ width: `${analysis.viralScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Thumbnail Score */}
            <div className="bg-[#121212] border border-gray-700 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:border-[#3B82F6]/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#FFFFFF] flex items-center gap-2">
                  <Image className="h-5 w-5 text-[#3B82F6]" />
                  Thumbnail
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <span className="text-5xl font-bold text-[#3B82F6]">{analysis.thumbnailScore || 0}</span>
                  <span className="text-[#A0A0A0] text-sm">/100</span>
                </div>
                <div className="w-full bg-[#030303] rounded-full h-3 overflow-hidden border border-gray-700">
                  <div
                    className="h-3 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] rounded-full transition-all duration-700"
                    style={{ width: `${analysis.thumbnailScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Deep Analysis Action Buttons */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#FFFFFF] flex items-center gap-3">
              <BarChart3 className="h-7 w-7 text-[#FF0000]" />
              Deep Analysis
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 overflow-x-auto">
              <Button
                onClick={() => setActiveAnalysis("retention")}
                className={`flex flex-col items-center gap-2 h-auto py-4 rounded-xl transition-all ${
                  activeAnalysis === "retention"
                    ? "bg-[#FF0000] text-white shadow-lg shadow-red-500/50"
                    : "bg-[#121212] border border-gray-700 text-[#FFFFFF] hover:border-[#FF0000]"
                }`}
              >
                <TrendingUp className="h-5 w-5" />
                <span className="text-xs font-semibold text-center">Retention</span>
              </Button>
              <Button
                onClick={() => setActiveAnalysis("thumbnails")}
                className={`flex flex-col items-center gap-2 h-auto py-4 rounded-xl transition-all ${
                  activeAnalysis === "thumbnails"
                    ? "bg-[#FF0000] text-white shadow-lg shadow-red-500/50"
                    : "bg-[#121212] border border-gray-700 text-[#FFFFFF] hover:border-[#FF0000]"
                }`}
              >
                <Image className="h-5 w-5" />
                <span className="text-xs font-semibold text-center">Thumbnails</span>
              </Button>
              <Button
                onClick={() => setActiveAnalysis("titles")}
                className={`flex flex-col items-center gap-2 h-auto py-4 rounded-xl transition-all ${
                  activeAnalysis === "titles"
                    ? "bg-[#FF0000] text-white shadow-lg shadow-red-500/50"
                    : "bg-[#121212] border border-gray-700 text-[#FFFFFF] hover:border-[#FF0000]"
                }`}
              >
                <Type className="h-5 w-5" />
                <span className="text-xs font-semibold text-center">Titles</span>
              </Button>
              <Button
                onClick={() => setActiveAnalysis("competitors")}
                className={`flex flex-col items-center gap-2 h-auto py-4 rounded-xl transition-all ${
                  activeAnalysis === "competitors"
                    ? "bg-[#FF0000] text-white shadow-lg shadow-red-500/50"
                    : "bg-[#121212] border border-gray-700 text-[#FFFFFF] hover:border-[#FF0000]"
                }`}
              >
                <Users2 className="h-5 w-5" />
                <span className="text-xs font-semibold text-center">Competitors</span>
              </Button>
              <Button
                onClick={() => setActiveAnalysis("outlier")}
                className={`flex flex-col items-center gap-2 h-auto py-4 rounded-xl transition-all ${
                  activeAnalysis === "outlier"
                    ? "bg-[#FF0000] text-white shadow-lg shadow-red-500/50"
                    : "bg-[#121212] border border-gray-700 text-[#FFFFFF] hover:border-[#FF0000]"
                }`}
              >
                <TrendingDown className="h-5 w-5" />
                <span className="text-xs font-semibold text-center">Outlier</span>
              </Button>
              <Button
                onClick={() => setActiveAnalysis("ideas")}
                className={`flex flex-col items-center gap-2 h-auto py-4 rounded-xl transition-all ${
                  activeAnalysis === "ideas"
                    ? "bg-[#FF0000] text-white shadow-lg shadow-red-500/50"
                    : "bg-[#121212] border border-gray-700 text-[#FFFFFF] hover:border-[#FF0000]"
                }`}
              >
                <IdeaIcon className="h-5 w-5" />
                <span className="text-xs font-semibold text-center">Ideas</span>
              </Button>
            </div>
          </div>

          {/* Deep Analysis Content */}
          {activeAnalysis && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setActiveAnalysis(null)}
                  variant="ghost"
                  className="text-[#FF0000] hover:bg-[#121212]"
                >
                  ← Back
                </Button>
              </div>

              {activeAnalysis === "retention" && (
                <RetentionGraph videoData={{
                  views: analysis.views,
                  likes: analysis.likes,
                  comments: analysis.comments,
                  title: analysis.title,
                  analysis: analysis.analysis,
                  audience: analysis.audience,
                  keywords: analysis.suggestedKeywords,
                  aiAnalysisOverview: analysis.aiAnalysisOverview,
                  retentionInsights: analysis.retentionInsights,
                  targetAudience: analysis.targetAudience,
                }} />
              )}

              {activeAnalysis === "thumbnails" && (
                <SimilarThumbnails videoData={{
                  title: analysis.title,
                  views: analysis.views,
                }} />
              )}

              {activeAnalysis === "outlier" && (
                <OutlierAnalysis videoData={{
                  videoId: analysis.videoId,
                  views: analysis.views,
                  title: analysis.title,
                  channelTitle: analysis.channelTitle,
                }} />
              )}

              {activeAnalysis === "competitors" && (
                <CompetitorVideos videoData={{
                  title: analysis.title,
                  views: analysis.views,
                }} />
              )}

              {activeAnalysis === "ideas" && (
                <VideoIdeas videoData={{
                  title: analysis.title,
                  description: "",
                }} />
              )}

              {activeAnalysis === "titles" && (
                <TitleAnalyzer videoTitle={analysis.title} videoId={analysis.videoId} />
              )}
            </div>
          )}












        </div>
      )}

      {/* Empty State */}
      {!analysis && !loading && !error && (
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center space-y-6">
            <div className="relative w-32 h-32 mx-auto">
              <Play className="h-32 w-32 text-[#FF0000] opacity-40 mx-auto" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-[#FFFFFF]">Analyze Your First Video</h2>
              <p className="text-[#A0A0A0] text-lg max-w-lg mx-auto">
                Paste a YouTube video URL and get detailed AI-powered analytics, performance metrics, and actionable recommendations to optimize your content
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoAnalyzer;
