import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, AlertCircle, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffect, useState } from "react";
import SimilarTitles from "./SimilarTitles";

const scores = {
  overall: 72,
  keyword: 85,
  emotional: 64,
  curiosity: 78,
};

interface TitleScoreData {
  videoId: string;
  originalTitle: string;
  titleScore: number;
  breakdown: {
    lengthScore: number;
    keywordScore: number;
    curiosityScore: number;
    engagementScore: number;
    competitionScore: number;
  };
  metadata: {
    titleLength: number;
    engagementRate: number;
    views: number;
    likes: number;
    comments: number;
  };
  suggestions: string[];
}

const ScoreRing = ({ value, label, color }: { value: number; label: string; color: string }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="relative h-20 w-20">
      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(0 0% 18%)" strokeWidth="6" />
        <circle
          cx="40" cy="40" r="34" fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={`${(value / 100) * 213.6} 213.6`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">{value}</span>
    </div>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

const TitleAnalyzer = ({ videoTitle, videoId }: { videoTitle: string; videoId?: string }) => {
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  
  const [titleScore, setTitleScore] = useState<TitleScoreData | null>(null);
  const [loadingScore, setLoadingScore] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);

  // Fetch title score
  useEffect(() => {
    if (!videoId) {
      setTitleScore(null);
      setScoreError(null);
      return;
    }

    const fetchScore = async () => {
      setLoadingScore(true);
      setScoreError(null);

      try {
        console.log('[TitleAnalyzer] Fetching title score for videoId:', videoId);
        
        const response = await fetch(`/api/video/calculate-title-score?videoId=${videoId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to calculate title score');
        }

        const result = await response.json();
        console.log('[TitleAnalyzer] Title score received:', result.data);
        
        setTitleScore(result.data);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        console.error('[TitleAnalyzer] Error fetching title score:', message);
        setScoreError(message);
      } finally {
        setLoadingScore(false);
      }
    };

    fetchScore();
  }, [videoId]);

  // Fetch title suggestions
  useEffect(() => {
    if (!videoId) {
      setTitleSuggestions([]);
      setSuggestionsError(null);
      return;
    }

    const fetchSuggestions = async () => {
      setLoadingSuggestions(true);
      setSuggestionsError(null);

      try {
        console.log('[TitleAnalyzer] Fetching suggestions for videoId:', videoId);
        
        const response = await fetch(`/api/video/generate-title-suggestions?videoId=${videoId}`);
        
        console.log('[TitleAnalyzer] Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('[TitleAnalyzer] API error:', errorData);
          throw new Error(errorData.message || 'Failed to generate title suggestions');
        }

        const result = await response.json();
        console.log('[TitleAnalyzer] Suggestions received:', result.data.titleSuggestions);
        
        setTitleSuggestions(result.data.titleSuggestions || []);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        console.error('[TitleAnalyzer] Error:', message);
        setSuggestionsError(message);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [videoId]);

  // Get display scores - use dynamic scores if available, otherwise use defaults
  const displayScores = titleScore ? {
    overall: titleScore.titleScore,
    keyword: titleScore.breakdown.keywordScore * 5, // Scale to 100
    emotional: titleScore.breakdown.curiosityScore * 5, // Scale to 100
    curiosity: titleScore.breakdown.engagementScore * 5, // Scale to 100
  } : scores;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Title Analysis</h3>

      {loadingScore ? (
        <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-6">
          <div className="flex items-center justify-center py-8">
            <Loader className="h-6 w-6 text-primary animate-spin mr-3" />
            <span className="text-sm text-muted-foreground">Calculating title score...</span>
          </div>
        </div>
      ) : scoreError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{scoreError}</AlertDescription>
        </Alert>
      ) : (
        <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-6">
          <div className="flex flex-wrap justify-center gap-8 mb-6">
            <ScoreRing value={Math.round(displayScores.overall)} label="Overall Score" color="hsl(217 91% 60%)" />
            <ScoreRing value={Math.round(displayScores.keyword)} label="Keyword Strength" color="hsl(160 84% 39%)" />
            <ScoreRing value={Math.round(displayScores.emotional)} label="Curiosity & Clickability" color="hsl(25 95% 53%)" />
            <ScoreRing value={Math.round(displayScores.curiosity)} label="Engagement Score" color="hsl(0 84% 60%)" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Title Length</span>
              <span className="text-foreground">{titleScore ? `${titleScore.metadata.titleLength} chars` : 'Good (50-60 chars)'}</span>
            </div>
            <Progress 
              value={Math.min((titleScore?.metadata.titleLength || 52) / 70 * 100, 100)} 
              className="h-1.5" 
            />
          </div>

          {titleScore && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Score Breakdown</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Length:</span>
                  <span className="font-semibold text-foreground">{titleScore.breakdown.lengthScore}/20</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Keywords:</span>
                  <span className="font-semibold text-foreground">{titleScore.breakdown.keywordScore}/20</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Curiosity:</span>
                  <span className="font-semibold text-foreground">{titleScore.breakdown.curiosityScore}/20</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Engagement:</span>
                  <span className="font-semibold text-foreground">{titleScore.breakdown.engagementScore}/20</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Competition:</span>
                  <span className="font-semibold text-foreground">{titleScore.breakdown.competitionScore}/20</span>
                </div>
              </div>
            </div>
          )}

          {titleScore && titleScore.suggestions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Improvement Suggestions</p>
              <ul className="space-y-1">
                {titleScore.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex gap-2">
                    <span>•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">AI-Generated Title Suggestions</h4>
        </div>

        {loadingSuggestions && (
          <div className="flex items-center justify-center py-6">
            <Loader className="h-5 w-5 text-primary animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Generating suggestions...</span>
          </div>
        )}

        {suggestionsError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{suggestionsError}</AlertDescription>
          </Alert>
        )}

        {!loadingSuggestions && titleSuggestions.length > 0 && (
          <div className="space-y-3">
            {titleSuggestions.map((suggestion, i) => (
              <div key={i} className="flex items-center gap-3 rounded-md bg-secondary/50 p-3 group hover:bg-secondary transition-colors">
                <Badge variant="outline" className="shrink-0 text-xs">Suggestion {i + 1}</Badge>
                <span className="flex-1 text-sm text-foreground">{suggestion}</span>
                <span className="text-xs font-medium text-accent shrink-0">{suggestion.length} chars</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => navigator.clipboard.writeText(suggestion)}
                  title="Copy to clipboard"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {!loadingSuggestions && !suggestionsError && titleSuggestions.length === 0 && videoId && (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">No suggestions available</p>
          </div>
        )}

        {!videoId && !loadingSuggestions && (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">Analyze a video to see AI-generated title suggestions</p>
          </div>
        )}
      </div>

      <SimilarTitles title={videoTitle} videoId={videoId} />
    </div>
  );
};

export default TitleAnalyzer;
