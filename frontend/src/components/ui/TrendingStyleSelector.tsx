import React from 'react';
import { Check, Sparkles } from 'lucide-react';

interface StyleOption {
  id: string;
  name: string;
  description: string;
  badge?: string;
}

const styles: StyleOption[] = [
  { id: 'auto', name: 'Auto-Detect', description: 'Analyze video content to find best style', badge: 'Recommended' },
  { id: 'mrbeast', name: 'MrBeast Style', description: 'Extremely high contrast, shocked faces, neon elements' },
  { id: 'documentary', name: 'Documentary Style', description: 'Cinematic, subtle gradients, highly readable text' },
  { id: 'viral_dark', name: 'Dark & Viral', description: 'Low key lighting, curiosity gaps, glowing accents' },
  { id: 'minimal', name: 'Minimal & Clean', description: 'High contrast, simple elements' },
  { id: '3d', name: '3D Elements', description: 'Trendy 3D renders, soft shadows' },
];

interface TrendingStyleSelectorProps {
  selectedStyle: string;
  onSelect: (styleId: string) => void;
}

export const TrendingStyleSelector: React.FC<TrendingStyleSelectorProps> = ({ selectedStyle, onSelect }) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-white flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#FF0000]" />
        Trending Style Preference
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {styles.map((style) => (
          <button
            key={style.id}
            type="button"
            onClick={() => onSelect(style.id)}
            className={`relative flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
              selectedStyle === style.id
                ? 'border-[#FF0000] bg-[#FF0000]/10'
                : 'border-gray-700 bg-[#121212] hover:border-gray-500'
            }`}
          >
            <div className="flex w-full items-center justify-between mb-1">
              <span className="font-medium text-white text-sm">{style.name}</span>
              {selectedStyle === style.id && <Check className="h-4 w-4 text-[#FF0000]" />}
            </div>
            <span className="text-xs text-[#A0A0A0]">{style.description}</span>
            {style.badge && (
              <span className="absolute -top-2 -right-2 bg-[#FF0000] text-xs font-bold text-white px-2 py-0.5 rounded-full">
                {style.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
