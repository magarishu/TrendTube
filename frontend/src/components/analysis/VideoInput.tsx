import { useState } from "react";
import { Search, Upload, Play, Code2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VideoInputProps {
  onAnalyze: (data: { url: string; title: string; category: string; audience: string }) => void;
}

const VideoInput = ({ onAnalyze }: VideoInputProps) => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [audience, setAudience] = useState("");

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 border-2 border-blue-800 backdrop-blur-sm rounded-xl p-8 space-y-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-900 rounded-lg">
            <Code2 className="h-6 w-6 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">Video Input</h3>
        </div>

        <div className="space-y-5 border-t border-blue-700 pt-6">
          <div>
            <label className="text-sm font-semibold text-blue-300 mb-2.5 block flex items-center gap-2">
              <Search className="h-4 w-4 text-blue-400" />
              YouTube Video URL
            </label>
            <Input
              placeholder="https://youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-slate-800 border-2 border-blue-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-blue-300 mb-2.5 block">Video Title</label>
            <Input
              placeholder="Enter your video title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-800 border-2 border-blue-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-semibold text-blue-300 mb-2.5 block">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-slate-800 border-2 border-blue-700 rounded-lg text-white focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border border-blue-700">
                  <SelectItem value="tech">Technology</SelectItem>
                  <SelectItem value="gaming">Gaming</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold text-blue-300 mb-2.5 block">Target Audience</label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger className="bg-slate-800 border-2 border-blue-700 rounded-lg text-white focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border border-blue-700">
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="teens">Teens (13-17)</SelectItem>
                  <SelectItem value="young-adults">Young Adults (18-24)</SelectItem>
                  <SelectItem value="adults">Adults (25-44)</SelectItem>
                  <SelectItem value="professionals">Professionals</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-blue-300 mb-2.5 block">Upload Thumbnail</label>
            <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-blue-700 bg-slate-800 p-10 cursor-pointer hover:border-blue-500 hover:bg-slate-700 transition-all duration-300">
              <div className="text-center">
                <div className="p-3 bg-blue-900 rounded-lg w-fit mx-auto mb-3">
                  <Upload className="mx-auto h-6 w-6 text-blue-400" />
                </div>
                <p className="text-sm font-medium text-blue-300">Drop your thumbnail here or click to upload</p>
                <p className="text-xs text-blue-400 mt-1">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={() => onAnalyze({ url, title, category, audience })}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md text-base"
          size="lg"
        >
          <Play className="h-5 w-5 mr-2" />
          Analyze Video
        </Button>
      </div>
    </div>
  );
};

export default VideoInput;
