import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseYouTubeLink, isYouTubeLink } from "@/utils/youtubeParser";

const SearchBar = ({ onSearch }: { onSearch?: (query: string) => void }) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (query.trim()) {
      // Navigate to Categories page with the search query
      // This handles YouTube links, channel names, and video titles
      navigate(`/categories?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search videos, creators, or paste a YouTube link..."
        className="w-full rounded-none border border-border bg-secondary px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#FF0000] focus:outline-none focus:ring-1 focus:ring-[#FF0000] transition-colors duration-150"
      />
      <button
        type="submit"
        className="absolute right-0 top-0 flex h-full items-center justify-center bg-[#FF0000] px-4 text-white transition-colors duration-150 hover:bg-[#E60030]"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
};

export default SearchBar;
