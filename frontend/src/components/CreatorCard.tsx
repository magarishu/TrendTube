import type { Creator } from "@/data/mockData";
import { TrendingUp, User } from "lucide-react";

interface CreatorCardProps {
  creator: Creator;
  onClick?: () => void;
}

const CreatorCard = ({ creator, onClick }: CreatorCardProps) => {
  return (
    <div 
      className="card-hover fade-in flex items-center gap-4 rounded-none border border-border bg-card p-4 cursor-pointer transition-all hover:border-primary hover:shadow-md"
      onClick={onClick}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
        <User className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-foreground truncate">{creator.name}</h3>
        <p className="text-xs text-muted-foreground">{creator.subscribers}</p>
      </div>
      <div className="flex items-center gap-1 text-accent">
        <TrendingUp className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">{creator.trendingVideos} trending</span>
      </div>
    </div>
  );
};

export default CreatorCard;
