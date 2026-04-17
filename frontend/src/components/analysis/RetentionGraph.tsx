import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, CheckCircle, Users, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RetentionGraphProps {
  videoData: {
    views: number;
    likes: number;
    comments: number;
    title: string;
    analysis?: string;
    audience?: string[];
    keywords?: string[];
    // New dynamic fields
    aiAnalysisOverview?: string;
    retentionInsights?: string[];
    targetAudience?: {
      type: string;
      experienceLevel: string;
      interests: string[];
      geographicRegion: string;
    };
  };
}

const RetentionGraph = ({ videoData }: RetentionGraphProps) => {
  // Generate estimated retention data based on typical YouTube patterns
  // This simulates what typical video retention looks like
  const generateRetentionData = () => {
    const dataPoints = [];
    const engagement = (videoData.likes + videoData.comments) / videoData.views;
    
    // Decay curve based on engagement rate
    for (let i = 0; i <= 100; i += 5) {
      const baseRetention = Math.exp(-(i / 100) * 2); // Exponential decay
      const variance = engagement * 30; // Add variance based on engagement
      const retention = Math.max(5, Math.min(100, (baseRetention * 80 + 20 + (Math.random() * variance - variance / 2))));
      
      dataPoints.push({
        time: `${i}%`,
        retention: Math.round(retention),
        avgRetention: Math.round(baseRetention * 80 + 20),
      });
    }
    return dataPoints;
  };

  const retentionData = generateRetentionData();
  
  // Calculate key metrics
  const avgRetention = Math.round(retentionData.reduce((acc, d) => acc + d.retention, 0) / retentionData.length);
  const midpointRetention = retentionData[10]?.retention || 0;
  const endRetention = retentionData[retentionData.length - 1]?.retention || 0;

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#121212] border border-gray-700 rounded-xl p-4 shadow-lg">
          <p className="text-[#A0A0A0] text-sm font-semibold mb-2">Average Retention</p>
          <p className="text-3xl font-bold text-[#FF0000]">{avgRetention}%</p>
        </div>
        <div className="bg-[#121212] border border-gray-700 rounded-xl p-4 shadow-lg">
          <p className="text-[#A0A0A0] text-sm font-semibold mb-2">Mid-Point Retention</p>
          <p className="text-3xl font-bold text-[#F59E0B]">{midpointRetention}%</p>
        </div>
        <div className="bg-[#121212] border border-gray-700 rounded-xl p-4 shadow-lg">
          <p className="text-[#A0A0A0] text-sm font-semibold mb-2">End-Card Retention</p>
          <p className="text-3xl font-bold text-[#3B82F6]">{endRetention}%</p>
        </div>
      </div>

      {/* Retention Chart */}
      <div className="bg-[#121212] border border-gray-700 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-[#FF0000]" />
          <h3 className="text-lg font-bold text-[#FFFFFF]">Estimated Viewer Retention Curve</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={retentionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#A0A0A0"
              tick={{ fontSize: 12 }}
              interval={Math.floor(retentionData.length / 10)}
            />
            <YAxis 
              stroke="#A0A0A0"
              tick={{ fontSize: 12 }}
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "#030303",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#FFFFFF"
              }}
              cursor={{ stroke: "#FF0000" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="retention"
              stroke="#FF0000"
              strokeWidth={2}
              dot={false}
              name="Estimated Retention"
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-sm text-[#A0A0A0] mt-4">
          This is an estimated retention curve based on your video's engagement metrics. Actual retention may vary.
        </p>
      </div>

      {/* Insights */}
      <div className="bg-[#121212] border border-gray-700 rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-lg font-bold text-[#FFFFFF]">Retention Insights</h3>
        <div className="space-y-3">
          {videoData.retentionInsights && videoData.retentionInsights.length > 0 ? (
            videoData.retentionInsights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-[#030303] rounded-lg border border-gray-700">
                <span className="text-[#F59E0B] font-bold text-lg flex-shrink-0">{idx + 1}.</span>
                <p className="text-[#FFFFFF] text-sm">{insight}</p>
              </div>
            ))
          ) : (
            <>
              <div className="flex items-start gap-3 p-3 bg-[#030303] rounded-lg border border-gray-700">
                <span className="text-[#F59E0B] font-bold text-lg">1.</span>
                <p className="text-[#FFFFFF] text-sm">Hook viewers in the first 10 seconds to maintain retention</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-[#030303] rounded-lg border border-gray-700">
                <span className="text-[#F59E0B] font-bold text-lg">2.</span>
                <p className="text-[#FFFFFF] text-sm">Add pattern interrupts at 25% mark to prevent drop-off</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-[#030303] rounded-lg border border-gray-700">
                <span className="text-[#F59E0B] font-bold text-lg">3.</span>
                <p className="text-[#FFFFFF] text-sm">Include call-to-action and end screen at 90% mark</p>
              </div>
            </>
          )}
        </div>
      </div>


      {/* Target Audience */}
      {(videoData.targetAudience || (videoData.audience && videoData.audience.length > 0)) && (
        <div className="bg-[#121212] border border-gray-700 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#030303] border border-gray-600 rounded-lg">
              <Users className="h-6 w-6 text-[#FF0000]" />
            </div>
            <h3 className="text-xl font-bold text-[#FFFFFF]">Target Audience</h3>
          </div>
          
          {videoData.targetAudience ? (
            <div className="space-y-6">
              {/* Audience Type */}
              <div>
                <p className="text-sm font-semibold text-[#A0A0A0] mb-2 uppercase tracking-wide">Audience Type</p>
                <Badge className="bg-[#FF0000] hover:bg-[#E60030] text-white border-0 px-4 py-2 font-semibold transition-colors">
                  {videoData.targetAudience.type}
                </Badge>
              </div>
              
              {/* Experience Level */}
              <div>
                <p className="text-sm font-semibold text-[#A0A0A0] mb-2 uppercase tracking-wide">Experience Level</p>
                <Badge className="bg-[#3B82F6] hover:bg-[#2563EB] text-white border-0 px-4 py-2 font-semibold transition-colors">
                  {videoData.targetAudience.experienceLevel}
                </Badge>
              </div>
              
              {/* Interests */}
              {videoData.targetAudience.interests && videoData.targetAudience.interests.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-[#A0A0A0] mb-2 uppercase tracking-wide">Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {videoData.targetAudience.interests.map((interest, idx) => (
                      <Badge key={idx} className="bg-[#22C55E] hover:bg-[#16A34A] text-[#030303] border-0 px-4 py-2 font-semibold transition-colors">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Geographic Region */}
              <div>
                <p className="text-sm font-semibold text-[#A0A0A0] mb-2 uppercase tracking-wide">Geographic Region</p>
                <Badge className="bg-[#F59E0B] hover:bg-[#D97706] text-[#030303] border-0 px-4 py-2 font-semibold transition-colors">
                  {videoData.targetAudience.geographicRegion}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {videoData.audience?.map((aud, idx) => (
                <Badge key={idx} className="bg-[#FF0000] hover:bg-[#E60030] text-white border-0 px-4 py-2 font-semibold transition-colors">
                  {aud}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SEO Keywords */}
      {videoData.keywords && videoData.keywords.length > 0 && (
        <div className="bg-[#121212] border border-gray-700 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#030303] border border-gray-600 rounded-lg">
              <Search className="h-6 w-6 text-[#22C55E]" />
            </div>
            <h3 className="text-lg font-bold text-[#FFFFFF]">SEO Keywords</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {videoData.keywords.map((keyword, idx) => (
              <Badge key={idx} className="bg-[#22C55E] hover:bg-[#16A34A] text-[#030303] border-0 px-4 py-2 font-semibold transition-colors">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RetentionGraph;
