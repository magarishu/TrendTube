import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Zap, Type, Image, FlaskConical, DollarSign, Users, Bot, BarChart3, ArrowLeft } from "lucide-react";
import SimilarVideos from "@/components/analysis/SimilarVideos";
import OutlierDetection from "@/components/analysis/OutlierDetection";
import TitleAnalyzer from "@/components/analysis/TitleAnalyzer";
import ThumbnailAnalyzer from "@/components/analysis/ThumbnailAnalyzer";
import ABTesting from "@/components/analysis/ABTesting";
import EarningsEstimator from "@/components/analysis/EarningsEstimator";
import AudienceRetention from "@/components/analysis/AudienceRetention";
import CreatorAnalytics from "@/components/analysis/CreatorAnalytics";
import AIAssistant from "@/components/analysis/AIAssistant";

const VideoAnalysis = () => {
  const { videoId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [videoTitle] = useState(searchParams.get("title") || "Video Analysis");
  const [videoChannel] = useState(searchParams.get("channel") || "Unknown Channel");

  // Auto-show analysis when video ID is present
  const analyzed = !!videoId;

  return (
    <div className="max-w-7xl mx-auto space-y-6 fade-in">
      {analyzed ? (
        <>
          {/* Back button and video info */}
          <div className="space-y-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground line-clamp-2">{videoTitle}</h1>
              <p className="text-sm text-muted-foreground mt-2">by {videoChannel}</p>
              <p className="text-xs text-muted-foreground mt-1">Video ID: {videoId}</p>
            </div>
          </div>

          {/* Analysis Tabs */}
          <Tabs defaultValue="retention" className="space-y-4">
            <TabsList className="bg-secondary/50 border border-border flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="retention" className="text-xs gap-1.5"><Users className="h-3.5 w-3.5" />Retention</TabsTrigger>
              <TabsTrigger value="earnings" className="text-xs gap-1.5"><DollarSign className="h-3.5 w-3.5" />Earnings</TabsTrigger>
              <TabsTrigger value="similar" className="text-xs gap-1.5"><Search className="h-3.5 w-3.5" />Similar</TabsTrigger>
              <TabsTrigger value="outliers" className="text-xs gap-1.5"><Zap className="h-3.5 w-3.5" />Outliers</TabsTrigger>
              <TabsTrigger value="title" className="text-xs gap-1.5"><Type className="h-3.5 w-3.5" />Title</TabsTrigger>
              <TabsTrigger value="thumbnail" className="text-xs gap-1.5"><Image className="h-3.5 w-3.5" />Thumbnail</TabsTrigger>
              <TabsTrigger value="ab" className="text-xs gap-1.5"><FlaskConical className="h-3.5 w-3.5" />A/B Test</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs gap-1.5"><BarChart3 className="h-3.5 w-3.5" />Analytics</TabsTrigger>
              <TabsTrigger value="ai" className="text-xs gap-1.5"><Bot className="h-3.5 w-3.5" />AI Assistant</TabsTrigger>
            </TabsList>

            <TabsContent value="retention"><AudienceRetention videoId={videoId} /></TabsContent>
            <TabsContent value="earnings"><EarningsEstimator videoId={videoId} /></TabsContent>
            <TabsContent value="similar"><SimilarVideos videoId={videoId} /></TabsContent>
            <TabsContent value="outliers"><OutlierDetection videoId={videoId} /></TabsContent>
            <TabsContent value="title"><TitleAnalyzer videoTitle={videoTitle} videoId={videoId} /></TabsContent>
            <TabsContent value="thumbnail"><ThumbnailAnalyzer videoId={videoId} /></TabsContent>
            <TabsContent value="ab"><ABTesting videoId={videoId} /></TabsContent>
            <TabsContent value="analytics"><CreatorAnalytics videoId={videoId} /></TabsContent>
            <TabsContent value="ai"><AIAssistant videoId={videoId} /></TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="text-center py-12 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">No video selected</h2>
          <p className="text-sm text-muted-foreground">Click on a video to see detailed analytics</p>
          <button
            onClick={() => navigate("/")}
            className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-primary/90"
          >
            Browse Videos
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoAnalysis;
