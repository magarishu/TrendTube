import React, { useState } from 'react';
import { InputSection } from '../components/ThumbnailGenerator/InputSection';
import { PreviewPanel } from '../components/ThumbnailGenerator/PreviewPanel';
import { VariationGallery } from '../components/ThumbnailGenerator/VariationGallery';
import { ThumbnailRequest, DesignVariation } from '../types/thumbnail';
import { useThumbnailGeneration } from '../hooks/useThumbnailGeneration';

const ThumbnailGenerator = () => {
  const {
    isGeneratingStrategy,
    isGeneratingImage,
    designs,
    selectedDesignId,
    setSelectedDesignId,
    generateThumbnails,
    regenerateImage,
  } = useThumbnailGeneration();

  const handleGenerate = (data: ThumbnailRequest) => {
    generateThumbnails(data);
  };

  const selectedDesign = designs.find((d) => d.id === selectedDesignId) || null;

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col sapce-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          AI Thumbnail Generator
          <span className="bg-[#FF0000]/20 text-[#FF0000] text-xs px-2 py-1 rounded border border-[#FF0000]/30">BETA</span>
        </h1>
        <p className="text-muted-foreground text-[#A0A0A0]">
          Create high-converting, trending-optimized thumbnails using AI.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Input Panel - Left Side */}
        <div className="col-span-1 border border-gray-800 rounded-xl bg-[#0F0F0F] p-5 lg:h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar">
          <InputSection onGenerate={handleGenerate} isLoading={isGeneratingStrategy} />
        </div>

        {/* Preview - Right Side */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6 lg:h-[calc(100vh-12rem)]">
          <div className="flex-1 bg-[#0F0F0F] rounded-xl overflow-hidden min-h-[400px]">
            <PreviewPanel
              selectedDesign={selectedDesign}
              onRegenerateImage={regenerateImage}
              isGeneratingImage={isGeneratingImage}
            />
          </div>
          
          <div className="bg-[#0F0F0F] p-5 rounded-xl border border-gray-800 shrink-0">
            <VariationGallery
              designs={designs}
              selectedId={selectedDesignId}
              onSelect={setSelectedDesignId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailGenerator;
