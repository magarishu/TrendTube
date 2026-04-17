import React from 'react';
import { DesignVariation } from '../../types/thumbnail';

interface VariationGalleryProps {
  designs: DesignVariation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const VariationGallery: React.FC<VariationGalleryProps> = ({ designs, selectedId, onSelect }) => {
  if (designs.length === 0) return null;

  return (
    <div className="mt-6 pt-6 border-t border-gray-800">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Generated Variations ({designs.length})
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {designs.map((design) => (
          <div
            key={design.id}
            onClick={() => onSelect(design.id)}
            className={`cursor-pointer group rounded-lg border-2 overflow-hidden transition-all ${
              selectedId === design.id
                ? 'border-[#FF0000] ring-2 ring-[#FF0000]/20'
                : 'border-gray-800 hover:border-gray-500'
            }`}
          >
            <div className="aspect-video bg-black relative">
              {design.imageUrl ? (
                <img
                  src={design.imageUrl}
                  alt={design.conceptName}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gray-900">
                  {design.status === 'generating' ? (
                    <span className="text-xs font-medium text-blue-400 animate-pulse">Generating Image...</span>
                  ) : design.status === 'failed' ? (
                    <span className="text-xs font-medium text-red-500">Failed</span>
                  ) : (
                    <span className="text-xs text-gray-500">Waiting...</span>
                  )}
                </div>
              )}
            </div>
            <div className="p-2 bg-[#1A1A1A]">
              <h4 className="text-xs font-medium text-white line-clamp-1">{design.conceptName}</h4>
              <span className="text-[10px] text-gray-400">{design.expectedCtrImpact}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
