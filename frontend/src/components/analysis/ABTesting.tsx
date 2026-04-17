import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

const combinations = [
  {
    id: "A",
    title: "I Tested Every AI Tool So You Don't Have To",
    thumbnail: "Reaction Style",
    ctr: 14.2,
    curiosity: 92,
    clickPotential: 89,
    winner: true,
  },
  {
    id: "B",
    title: "AI Tools 2025: Complete Guide for Developers",
    thumbnail: "Minimalist",
    ctr: 11.8,
    curiosity: 74,
    clickPotential: 76,
    winner: false,
  },
  {
    id: "C",
    title: "7 AI Tools That Will 10x Your Productivity",
    thumbnail: "High Contrast",
    ctr: 13.1,
    curiosity: 85,
    clickPotential: 83,
    winner: false,
  },
];

const colors = [
  "from-accent/40 to-primary/20",
  "from-primary/40 to-chart-blue/20",
  "from-chart-orange/40 to-chart-red/20",
];

const ABTesting = () => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-foreground">A/B Testing Predictions</h3>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {combinations.map((combo, i) => (
        <div
          key={combo.id}
          className={`rounded-lg border bg-card/50 backdrop-blur-sm p-5 space-y-4 transition-all ${
            combo.winner ? "border-accent shadow-lg shadow-accent/10" : "border-border"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-foreground">Combo {combo.id}</span>
            {combo.winner && (
              <Badge className="bg-accent text-accent-foreground border-0">
                <Trophy className="h-3 w-3 mr-1" />
                Best
              </Badge>
            )}
          </div>

          <div className={`aspect-video rounded bg-gradient-to-br ${colors[i]}`} />

          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground line-clamp-2">{combo.title}</p>
            <p className="text-xs text-muted-foreground">Thumbnail: {combo.thumbnail}</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Predicted CTR</span>
              <span className="font-medium text-foreground">{combo.ctr}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Curiosity</span>
              <span className="font-medium text-foreground">{combo.curiosity}/100</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Click Potential</span>
              <span className="font-medium text-foreground">{combo.clickPotential}/100</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ABTesting;
