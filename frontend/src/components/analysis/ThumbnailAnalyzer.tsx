import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Palette, Type, Smile, MousePointer, Sparkles } from "lucide-react";

const metrics = [
  { icon: Palette, label: "Color Contrast", score: 78, suggestion: "Increase contrast between text and background" },
  { icon: Type, label: "Text Readability", score: 65, suggestion: "Reduce text clutter — use max 4-5 words" },
  { icon: Smile, label: "Emotion Detection", score: 82, suggestion: "Great emotional expression detected" },
  { icon: MousePointer, label: "Click Appeal", score: 71, suggestion: "Add more visual intrigue to boost clicks" },
];

const thumbnailStyles = [
  { name: "Minimalist", description: "Clean, bold text, single focal point", score: 88 },
  { name: "High Contrast", description: "Vivid colors, sharp outlines, dramatic lighting", score: 92 },
  { name: "Reaction Style", description: "Expressive face, bold text overlay", score: 85 },
  { name: "MrBeast Style", description: "Bright colors, large text, shocked expression", score: 94 },
  { name: "Educational", description: "Diagram/infographic style, clean layout", score: 79 },
];

const colors = [
  "from-primary/40 to-chart-blue/20",
  "from-chart-orange/40 to-chart-red/20",
  "from-accent/40 to-primary/20",
  "from-chart-red/40 to-chart-orange/20",
  "from-chart-blue/40 to-accent/20",
];

const ThumbnailAnalyzer = () => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-foreground">Thumbnail Analysis</h3>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-6 space-y-5">
        <h4 className="text-sm font-semibold text-foreground">Analysis Metrics</h4>
        {metrics.map((m, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <m.icon className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground">{m.label}</span>
              </div>
              <span className="text-sm font-medium text-foreground">{m.score}/100</span>
            </div>
            <Progress value={m.score} className="h-1.5" />
            <p className="text-xs text-muted-foreground">{m.suggestion}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">AI Thumbnail Concepts</h4>
        </div>
        <div className="space-y-3">
          {thumbnailStyles.map((style, i) => (
            <div key={i} className="flex items-center gap-4 rounded-md bg-secondary/50 p-3 hover:bg-secondary transition-colors cursor-pointer">
              <div className={`h-14 w-24 rounded bg-gradient-to-br ${colors[i]} shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{style.name}</span>
                  <Badge variant="outline" className="text-xs">{style.score}/100</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{style.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default ThumbnailAnalyzer;
