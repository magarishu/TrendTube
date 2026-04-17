import React from 'react';

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
}

const presetColors = [
  '#FF0000', '#00D9FF', '#FF006E', '#00FF00', '#FFD700', 
  '#8A2BE2', '#FF8C00', '#000000', '#FFFFFF', '#121212'
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ label, color, onChange }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-white">{label}</label>
      <div className="flex items-center gap-3">
        <label className="relative flex cursor-pointer">
          <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-10 cursor-pointer rounded-md border border-gray-700 bg-transparent p-1"
          />
        </label>
        <span className="text-sm text-[#A0A0A0] uppercase">{color}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {presetColors.map((preset) => (
          <button
            key={preset}
            type="button"
            className="h-6 w-6 rounded-full border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
            style={{ backgroundColor: preset }}
            onClick={() => onChange(preset)}
            title={preset}
          />
        ))}
      </div>
    </div>
  );
};
