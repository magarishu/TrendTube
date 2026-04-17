import { Monitor, Gamepad2, TrendingUp, Film, GraduationCap } from "lucide-react";
import type { Category } from "@/data/mockData";

const iconMap: Record<string, React.ReactNode> = {
  Monitor: <Monitor className="h-5 w-5" />,
  Gamepad2: <Gamepad2 className="h-5 w-5" />,
  TrendingUp: <TrendingUp className="h-5 w-5" />,
  Film: <Film className="h-5 w-5" />,
  GraduationCap: <GraduationCap className="h-5 w-5" />,
};

const CategoryCard = ({ category }: { category: Category }) => {
  return (
    <div className="card-hover fade-in flex items-center gap-4 rounded-none border border-border bg-card p-4 cursor-pointer">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-primary/10 text-primary">
        {iconMap[category.icon] || <Monitor className="h-5 w-5" />}
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-foreground">{category.name}</h3>
        <p className="text-xs text-muted-foreground">{category.videoCount.toLocaleString()} videos</p>
      </div>
      {category.trending && (
        <span className="rounded-sm bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
          Trending
        </span>
      )}
    </div>
  );
};

export default CategoryCard;
