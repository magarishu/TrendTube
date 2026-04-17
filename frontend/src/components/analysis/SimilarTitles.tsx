import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, TrendingUp, Sparkles, Copy } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TitleData {
  videoId: string;
  title: string;
  views: number;
  viewsFormatted: string;
  likes: number;
  comments: number;
  channelTitle: string;
  engagementRate: number;
  ctrScore: number;
  titleLength: number;
  publishedAt: string;
}

interface TitlePatterns {
  usesNumbers?: boolean;
  curiosityWords?: string[];
  keywordPlacement?: string;
  averageLength?: number;
  commonElements?: string[];
}

interface TitleInsights {
  patterns: TitlePatterns;
  suggestions: string[];
}

interface SimilarTitlesData {
  titles: TitleData[];
  ctrScores: Array<{ videoId: string; ctrScore: number }>;
  engagementRates: Array<{ videoId: string; engagementRate: number }>;
  bestTitle: TitleData | null;
  titleInsights: TitleInsights;
}

interface SimilarTitlesProps {
  title: string;
  videoId?: string;
}

const getCTRColor = (ctrScore: number): string => {
  if (ctrScore >= 5) return 'bg-green-500/20 text-green-700 border-green-300';
  if (ctrScore >= 3) return 'bg-blue-500/20 text-blue-700 border-blue-300';
  if (ctrScore >= 1) return 'bg-yellow-500/20 text-yellow-700 border-yellow-300';
  return 'bg-red-500/20 text-red-700 border-red-300';
};

const getCTRBadgeColor = (ctrScore: number): string => {
  if (ctrScore >= 5) return 'hsl(120 84% 60%)'; // Green
  if (ctrScore >= 3) return 'hsl(217 91% 60%)'; // Blue
  if (ctrScore >= 1) return 'hsl(25 95% 53%)'; // Orange
  return 'hsl(0 84% 60%)'; // Red
};

const SimilarTitles = ({ title, videoId }: SimilarTitlesProps) => {
  const [data, setData] = useState<SimilarTitlesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const fetchSimilarTitles = async () => {
    if (!title) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        title: title,
        ...(videoId && { videoId }),
      });

      const response = await fetch(`/api/video/similar-titles?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch similar titles');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      console.error('Error fetching similar titles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setData(null);
    setError(null);
  }, [title]);

  if (!expanded) {
    return (
      <Button
        onClick={() => setExpanded(true)}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
      >
        <TrendingUp className="h-4 w-4 mr-2" />
        Similar Titles
      </Button>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Similar Titles Analysis</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setExpanded(false);
            setData(null);
          }}
        >
          Close
        </Button>
      </div>

      {!data && !loading && (
        <Button
          onClick={fetchSimilarTitles}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Analyze Similar Titles
        </Button>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-muted-foreground ml-3">Analyzing titles...</span>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {data && data.titles.length > 0 && (
        <>
          {/* Best Title Highlight */}
          {data.bestTitle && (
            <div className="rounded-lg border-2 border-primary bg-gradient-to-br from-primary/10 to-accent/10 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">⭐</span>
                    <h4 className="text-sm font-semibold text-primary">Best Performing Title</h4>
                  </div>
                  <p className="text-lg font-bold text-foreground mb-4">{data.bestTitle.title}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Views</p>
                      <p className="text-sm font-semibold text-foreground">{data.bestTitle.viewsFormatted}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">CTR Score</p>
                      <p className="text-sm font-semibold text-foreground">{data.bestTitle.ctrScore.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Engagement</p>
                      <p className="text-sm font-semibold text-foreground">{data.bestTitle.engagementRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Title Length</p>
                      <p className="text-sm font-semibold text-foreground">{data.bestTitle.titleLength} chars</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Title Insights from Gemini AI */}
          {data.titleInsights && (
            <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Title Pattern Analysis</h4>
              </div>

              {/* Patterns */}
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Patterns Found in Top Performers</p>
                  <div className="flex flex-wrap gap-2">
                    {data.titleInsights.patterns.usesNumbers && (
                      <Badge variant="secondary">Numbers Used</Badge>
                    )}
                    {data.titleInsights.patterns.curiosityWords &&
                      data.titleInsights.patterns.curiosityWords.map((word, idx) => (
                        <Badge key={idx} variant="secondary">
                          {word}
                        </Badge>
                      ))}
                    {data.titleInsights.patterns.keywordPlacement && (
                      <Badge variant="secondary">
                        Keywords: {data.titleInsights.patterns.keywordPlacement}
                      </Badge>
                    )}
                  </div>
                </div>

                {data.titleInsights.patterns.averageLength && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Average Title Length: <span className="font-semibold">{data.titleInsights.patterns.averageLength} characters</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Suggestions */}
              {data.titleInsights.suggestions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-3">Optimized Title Suggestions</p>
                  <div className="space-y-2">
                    {data.titleInsights.suggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 rounded-md bg-secondary/50 p-3 group hover:bg-secondary transition-colors"
                      >
                        <span className="text-xs font-bold text-primary shrink-0">#{idx + 1}</span>
                        <span className="flex-1 text-sm text-foreground">{suggestion}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => navigator.clipboard.writeText(suggestion)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Similar Titles Grid */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Similar Video Titles ({data.titles.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.titles.map((titleData, idx) => (
                <Card
                  key={idx}
                  className={`hover:shadow-lg transition-all ${
                    data.bestTitle?.videoId === titleData.videoId
                      ? 'ring-2 ring-primary border-primary'
                      : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm line-clamp-2 flex-1">{titleData.title}</CardTitle>
                      {data.bestTitle?.videoId === titleData.videoId && (
                        <Badge className="shrink-0">Best</Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">
                      {titleData.channelTitle}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Views and Engagement */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Views</p>
                          <p className="text-sm font-semibold text-foreground">{titleData.viewsFormatted}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Published</p>
                          <p className="text-sm font-semibold text-foreground">{titleData.publishedAt}</p>
                        </div>
                      </div>

                      {/* CTR Score */}
                      <div className={`rounded-md border p-3 ${getCTRColor(titleData.ctrScore)}`}>
                        <p className="text-xs font-semibold mb-1">CTR Score</p>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl font-bold">{titleData.ctrScore.toFixed(2)}%</span>
                          <span className="text-xs opacity-75">
                            {titleData.ctrScore >= 5
                              ? 'Excellent'
                              : titleData.ctrScore >= 3
                              ? 'Good'
                              : titleData.ctrScore >= 1
                              ? 'Fair'
                              : 'Low'}
                          </span>
                        </div>
                      </div>

                      {/* Engagement Rate */}
                      <div className="rounded-md border border-border bg-secondary/30 p-3">
                        <p className="text-xs text-muted-foreground">Engagement Rate</p>
                        <p className="text-sm font-semibold text-foreground">
                          {titleData.engagementRate.toFixed(2)}%
                        </p>
                      </div>

                      {/* Title Length */}
                      <div className="rounded-md border border-border bg-secondary/30 p-3">
                        <p className="text-xs text-muted-foreground">Title Length</p>
                        <p className="text-sm font-semibold text-foreground">
                          {titleData.titleLength} chars
                        </p>
                      </div>

                      {/* Engagement Stats */}
                      <div className="pt-2 border-t border-border text-xs text-muted-foreground space-y-1">
                        <p>👍 {titleData.likes.toLocaleString()} likes</p>
                        <p>💬 {titleData.comments.toLocaleString()} comments</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {data && data.titles.length === 0 && !loading && (
        <div className="rounded-lg border border-dashed border-border bg-card/30 p-8 text-center">
          <p className="text-muted-foreground">No similar titles found. Try different keywords.</p>
        </div>
      )}
    </div>
  );
};

export default SimilarTitles;
