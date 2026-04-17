import { trendingKeywords } from "@/data/mockData";

const KeywordCloud = () => {
  const maxVal = Math.max(...trendingKeywords.map((k) => k.value));

  return (
    <div className="flex flex-wrap gap-2">
      {trendingKeywords.map((keyword) => {
        const ratio = keyword.value / maxVal;
        const size = ratio > 0.8 ? "text-xl font-bold" : ratio > 0.6 ? "text-lg font-semibold" : ratio > 0.4 ? "text-base font-medium" : "text-sm";
        return (
          <span
            key={keyword.text}
            className={`${size} cursor-pointer rounded-sm px-3 py-1 transition-colors duration-150 ${
              ratio > 0.7
                ? "bg-primary/20 text-primary hover:bg-primary/30"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
            }`}
          >
            {keyword.text}
          </span>
        );
      })}
    </div>
  );
};

export default KeywordCloud;
