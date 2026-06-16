import { useState, useEffect } from "react";
import { Lightbulb, Loader, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import apiClient from "@/services/apiClient";
interface VideoIdeasProps {
  videoData: {
    title: string;
    description?: string;
  };
}

const VideoIdeas = ({ videoData }: VideoIdeasProps) => {
  const [ideas, setIdeas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingIdeas, setSavingIdeas] = useState<Record<number, boolean>>({});

  useEffect(() => {
    generateIdeas();
  }, [videoData.title]);

  const generateIdeas = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/video/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: videoData.title,
          description: videoData.description || "",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIdeas(data.data?.ideas || generateMockIdeas());
      } else {
        setIdeas(generateMockIdeas());
      }
    } catch (err) {
      setIdeas(generateMockIdeas());
    } finally {
      setLoading(false);
    }
  };

  const generateMockIdeas = (): string[] => {
    const topic = videoData.title.split(" ")[0];
    return [
      `"Top 10 ${topic} Hacks You Won't Find Online" - Create a listicle format video with actionable tips`,
      `"${topic} Level Up Challenge" - Create a series where you compare different versions or improvements`,
      `"Common ${topic} Mistakes (And How To Fix Them)" - Educational content addressing pain points`,
      `"${topic} in 60 Seconds" - Fast-paced, snackable content perfect for shorts`,
      `"Day in the Life with ${topic}" - Vlog-style content showing real-world application`,
    ];
  };

  const handleSaveIdea = async (idea: string, idx: number) => {
    setSavingIdeas((prev) => ({ ...prev, [idx]: true }));
    try {
      await apiClient.savedIdeas.save({
        type: 'title',
        title: idea,
      });
      toast.success("Idea saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save idea");
    } finally {
      setSavingIdeas((prev) => ({ ...prev, [idx]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-[#F59E0B]" />
          <h3 className="text-lg font-bold text-[#FFFFFF]">AI-Powered Video Ideas</h3>
        </div>
        <Button
          onClick={generateIdeas}
          disabled={loading}
          variant="outline"
          size="sm"
          className="border-gray-700 text-[#FFFFFF] hover:bg-[#121212]"
        >
          {loading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Generate More
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="h-8 w-8 text-[#FF0000] animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {ideas.map((idea, idx) => (
            <div
              key={idx}
              className="bg-[#121212] border border-gray-700 rounded-xl p-5 shadow-lg hover:shadow-xl hover:border-[#F59E0B] transition-all duration-300"
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 bg-[#F59E0B] text-[#030303] rounded-full font-bold text-sm">
                    {idx + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[#FFFFFF] leading-relaxed">{idea}</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {idx % 3 === 0 && <Badge className="bg-[#FF0000] hover:bg-[#E60030] text-white border-0">High CTR</Badge>}
                    {idx % 2 === 0 && <Badge className="bg-[#3B82F6] hover:bg-[#2563EB] text-white border-0">Trending</Badge>}
                    <Badge className="bg-[#22C55E] hover:bg-[#16A34A] text-white border-0">Actionable</Badge>
                  </div>
                </div>
                <div className="flex flex-col justify-start">
                  <Button
                    onClick={() => handleSaveIdea(idea, idx)}
                    disabled={savingIdeas[idx]}
                    variant="outline"
                    size="sm"
                    className="border-gray-700 text-white hover:bg-white/10"
                  >
                    {savingIdeas[idx] ? <Loader className="h-4 w-4 animate-spin" /> : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content Creation Tips */}
      <div className="bg-[#121212] border border-gray-700 rounded-2xl p-6 shadow-lg space-y-4">
        <h4 className="text-lg font-bold text-[#FFFFFF]">Content Creation Framework</h4>
        <div className="space-y-3">
          <div className="p-4 bg-[#030303] rounded-lg border border-gray-700">
            <p className="font-semibold text-[#FFFFFF] mb-1">Research Your Audience</p>
            <p className="text-sm text-[#A0A0A0]">Check comments, community posts, and search trends to understand what your audience wants</p>
          </div>
          <div className="p-4 bg-[#030303] rounded-lg border border-gray-700">
            <p className="font-semibold text-[#FFFFFF] mb-1">Test & Iterate</p>
            <p className="text-sm text-[#A0A0A0]">Upload variations of similar ideas and observe which performs best with your audience</p>
          </div>
          <div className="p-4 bg-[#030303] rounded-lg border border-gray-700">
            <p className="font-semibold text-[#FFFFFF] mb-1">Series Creation</p>
            <p className="text-sm text-[#A0A0A0]">Turn successful single videos into series to build anticipation and recurring viewers</p>
          </div>
          <div className="p-4 bg-[#030303] rounded-lg border border-gray-700">
            <p className="font-semibold text-[#FFFFFF] mb-1">Collaborate</p>
            <p className="text-sm text-[#A0A0A0]">Partner with creators in your niche to expose your content to new audiences</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoIdeas;
