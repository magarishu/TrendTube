import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Trash2, Copy, Loader } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SavedIdea {
  _id: string;
  type: 'title' | 'thumbnail';
  title: string;
  videoId?: string;
  views?: number;
  ctrScore?: number;
  engagementRate?: number;
  channelTitle?: string;
  thumbnailUrl?: string;
  createdAt: string;
}

const SavedIdeas = () => {
  const [ideas, setIdeas] = useState<SavedIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/saved-ideas?type=title');
      
      if (!response.ok) {
        throw new Error('Failed to fetch saved ideas');
      }

      const result = await response.json();
      setIdeas(result.data.ideas || []);
      console.log('Saved ideas loaded:', result.data.ideas);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      console.error('Error fetching ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteIdea = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/saved-idea/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete idea');
      }

      setIdeas(ideas.filter(idea => idea._id !== id));
      console.log('Idea deleted successfully');
    } catch (err) {
      console.error('Error deleting idea:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader className="h-8 w-8 text-primary animate-spin" />
          <span className="text-muted-foreground">Loading saved ideas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Saved Ideas</h1>
        <p className="text-muted-foreground mt-2">Your collection of saved titles and thumbnails</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {ideas.length === 0 && !loading ? (
        <div className="rounded-lg border border-dashed border-border bg-card/30 p-12 text-center">
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">No saved ideas yet</p>
            <p className="text-muted-foreground">
              Save titles and thumbnails from the Video Analyzer to see them here
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((idea) => (
            <Card key={idea._id} className="hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm line-clamp-2 break-words">
                      {idea.title}
                    </CardTitle>
                    <CardDescription className="text-xs mt-2">
                      {idea.channelTitle || 'Unknown Channel'}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {idea.type === 'title' ? 'Title' : 'Thumbnail'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Metrics */}
                  {idea.views !== undefined && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Views</p>
                        <p className="font-semibold text-foreground">
                          {(idea.views / 1000).toFixed(1)}K
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">CTR Score</p>
                        <p className="font-semibold text-foreground">
                          {idea.ctrScore?.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  )}

                  {idea.engagementRate !== undefined && (
                    <div className="rounded-md border border-border bg-secondary/30 p-2">
                      <p className="text-xs text-muted-foreground">Engagement Rate</p>
                      <p className="text-sm font-semibold text-foreground">
                        {idea.engagementRate.toFixed(2)}%
                      </p>
                    </div>
                  )}

                  {/* Date */}
                  <div className="text-xs text-muted-foreground">
                    Saved on {formatDate(idea.createdAt)}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => copyToClipboard(idea.title)}
                      title="Copy to clipboard"
                    >
                      <Copy className="h-3.5 w-3.5 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteIdea(idea._id)}
                      disabled={deletingId === idea._id}
                      title="Delete idea"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedIdeas;
