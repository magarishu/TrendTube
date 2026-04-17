import React, { useState } from 'react';
import { ColorPicker } from '../ui/ColorPicker';
import { TrendingStyleSelector } from '../ui/TrendingStyleSelector';
import { Button } from '@/components/ui/button';

interface InputSectionProps {
  onGenerate: (data: any) => void;
  isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onGenerate, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'gaming',
    audience: 'all',
    summary: '',
    style: 'auto',
    primaryColor: '#FF0000',
    secondaryColor: '#000000',
    includeText: '',
    referenceImageUrl: '',
    focusElements: {
      face: true,
      text: true,
      product: false,
      numbers: false,
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFocusChange = (element: keyof typeof formData.focusElements) => {
    setFormData((prev) => ({
      ...prev,
      focusElements: {
        ...prev.focusElements,
        [element]: !prev.focusElements[element],
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Video Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white border-b border-gray-800 pb-2">Video Details</h3>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Video Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. I Survived 100 Days in Hardcore Minecraft"
            className="w-full rounded-md border border-gray-700 bg-[#121212] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#FF0000]"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-700 bg-[#121212] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#FF0000]"
            >
              <option value="gaming">Gaming</option>
              <option value="tech">Technology</option>
              <option value="vlog">Vlog / Personal</option>
              <option value="education">Educational</option>
              <option value="finance">Finance / Business</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Target Audience</label>
            <select
              name="audience"
              value={formData.audience}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-700 bg-[#121212] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#FF0000]"
            >
              <option value="all">Broad / All Ages</option>
              <option value="teens">Teens (13-17)</option>
              <option value="adults_18_34">Young Adults (18-34)</option>
              <option value="adults_35_plus">Adults (35+)</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Content Summary</label>
          <textarea
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            placeholder="What is the video about? The more details, the better the AI can design."
            rows={3}
            className="w-full rounded-md border border-gray-700 bg-[#121212] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#FF0000]"
            required
          />
        </div>
      </div>

      {/* Design Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white border-b border-gray-800 pb-2">Design Preferences</h3>
        
        <TrendingStyleSelector
          selectedStyle={formData.style}
          onSelect={(style) => setFormData((prev) => ({ ...prev, style }))}
        />

        <div className="space-y-3">
          <label className="text-sm font-medium text-white">Key Focus Elements</label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'face', label: 'Face / Emotion' },
              { id: 'text', label: 'Bold Text' },
              { id: 'product', label: 'Product Focus' },
              { id: 'numbers', label: 'Numbers / Stats' },
            ].map((element) => (
              <label key={element.id} className="flex items-center gap-2 bg-[#121212] border border-gray-700 px-3 py-1.5 rounded-full cursor-pointer hover:border-gray-500 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.focusElements[element.id as keyof typeof formData.focusElements]}
                  onChange={() => handleFocusChange(element.id as keyof typeof formData.focusElements)}
                  className="rounded border-gray-700 bg-gray-900 text-[#FF0000] focus:ring-[#FF0000] focus:ring-offset-gray-900"
                />
                <span className="text-sm text-white">{element.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ColorPicker
            label="Primary Brand Color"
            color={formData.primaryColor}
            onChange={(color) => setFormData((prev) => ({ ...prev, primaryColor: color }))}
          />
          <ColorPicker
            label="Secondary Brand Color"
            color={formData.secondaryColor}
            onChange={(color) => setFormData((prev) => ({ ...prev, secondaryColor: color }))}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Text Overlay (Optional)</label>
          <input
            type="text"
            name="includeText"
            value={formData.includeText}
            onChange={handleChange}
            placeholder="Short, punchy text (max 3-4 words)"
            className="w-full rounded-md border border-gray-700 bg-[#121212] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#FF0000]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Reference Image URL (Optional)</label>
          <input
            type="url"
            name="referenceImageUrl"
            value={formData.referenceImageUrl}
            onChange={handleChange}
            placeholder="Paste a link to a thumbnail you want to recreate..."
            className="w-full rounded-md border border-gray-700 bg-[#121212] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#FF0000]"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#FF0000] hover:bg-[#CC0000] text-white py-6 text-lg font-bold"
      >
        {isLoading ? 'Generating Concepts...' : 'Generate Thumbnails'}
      </Button>
    </form>
  );
};
