import React from 'react';
import { Download, RefreshCw, Layout, Eye, TrendingUp, Info } from 'lucide-react';
import { DesignVariation } from '../../types/thumbnail';
import { Button } from '@/components/ui/button';

interface PreviewPanelProps {
  selectedDesign: DesignVariation | null;
  onRegenerateImage: (id: string) => void;
  isGeneratingImage: boolean;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  selectedDesign,
  onRegenerateImage,
  isGeneratingImage,
}) => {
  if (!selectedDesign) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-700 rounded-xl bg-[#0F0F0F]">
        <Layout className="h-12 w-12 text-[#A0A0A0] mb-4" />
        <h3 className="text-xl font-medium text-white mb-2">No Design Selected</h3>
        <p className="text-[#A0A0A0] max-w-sm">
          Fill out the form on the left to generate AI-powered thumbnail strategies and designs.
        </p>
      </div>
    );
  }

  const handleDownload = async () => {
    if (!selectedDesign.imageUrl) return;
    try {
      const response = await fetch(selectedDesign.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `thumbnail-${selectedDesign.conceptName.replace(/\\s+/g, '-').toLowerCase()}.jpg`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error downloading image', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] rounded-xl border border-gray-800 overflow-hidden">
      {/* Image Preview Area */}
      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
        {selectedDesign.status === 'generating' || isGeneratingImage ? (
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="h-8 w-8 text-[#FF0000] animate-spin" />
            <span className="text-white text-sm font-medium">Generating Masterpiece...</span>
          </div>
        ) : selectedDesign.status === 'failed' ? (
          <div className="text-red-500 text-center p-4">
            <p>Failed to generate image.</p>
            <p className="text-sm text-red-400 mt-2">{selectedDesign.error}</p>
          </div>
        ) : selectedDesign.imageUrl ? (
          <>
            <img
              src={selectedDesign.imageUrl}
              alt={selectedDesign.conceptName}
              className="w-full h-full object-cover"
            />
            {/* Overlay actions on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <Button onClick={handleDownload} className="bg-white text-black hover:bg-gray-200">
                <Download className="h-4 w-4 mr-2" /> Download HQ
              </Button>
              <Button
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white/20"
                onClick={() => onRegenerateImage(selectedDesign.id)}
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Regenerate
              </Button>
            </div>
          </>
        ) : (
          <div className="text-[#A0A0A0]">Image pending generation...</div>
        )}
      </div>

      {/* Design Details */}
      <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{selectedDesign.conceptName}</h3>
            <div className="flex items-center gap-2 text-sm text-[#00D9FF]">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">Expected CTR Impact: {selectedDesign.expectedCtrImpact}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <div className="space-y-4">
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
                <Layout className="h-4 w-4" /> Composition
              </h4>
              <p className="text-sm text-gray-400 leading-relaxed">{selectedDesign.layoutDescription}</p>
            </div>
            
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
                <Eye className="h-4 w-4" /> Psychological Appeal
              </h4>
              <p className="text-sm text-gray-400 leading-relaxed">{selectedDesign.psychologicalAppeal}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Key Elements</h4>
              <ul className="flex flex-wrap gap-2">
                {selectedDesign.keyVisualElements.map((item, idx) => (
                  <li key={idx} className="bg-gray-800 text-xs text-gray-300 px-2 py-1 rounded">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-gray-900 rounded border border-gray-800">
              <h4 className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                <Info className="h-3 w-3" /> Color Rationale
              </h4>
              <p className="text-xs text-gray-500">{selectedDesign.colorSchemeRationale}</p>
            </div>
            <div className="p-3 bg-gray-900 rounded border border-gray-800">
              <h4 className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                <Info className="h-3 w-3" /> Typography Specs
              </h4>
              <p className="text-xs text-gray-500">{selectedDesign.typographySpecs}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
