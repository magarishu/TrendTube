import { Lightbulb, Target, MessageSquare, Zap, Eye } from "lucide-react";

interface ImprovementReportProps {
  suggestions: {
    titleSuggestions: string[];
    descriptionTips: string[];
    thumbnailTips: string[];
    engagementTips: string[];
    retentionTips: string[];
  };
}

const VideoImprovementReport = ({ suggestions }: ImprovementReportProps) => {
  const sections = [
    {
      id: "title",
      icon: Target,
      title: "Title Suggestions",
      description: "Optimize your title for better clicks and impressions",
      items: suggestions.titleSuggestions,
      color: "text-[#FF0000]",
      bgColor: "bg-[#FF0000]/10",
      borderColor: "border-[#FF0000]/30",
    },
    {
      id: "description",
      icon: MessageSquare,
      title: "Description Tips",
      description: "Improve your description for SEO and viewer engagement",
      items: suggestions.descriptionTips,
      color: "text-[#3B82F6]",
      bgColor: "bg-[#3B82F6]/10",
      borderColor: "border-[#3B82F6]/30",
    },
    {
      id: "thumbnail",
      icon: Lightbulb,
      title: "Thumbnail Suggestions",
      description: "Enhance your thumbnail design for higher CTR",
      items: suggestions.thumbnailTips,
      color: "text-[#F59E0B]",
      bgColor: "bg-[#F59E0B]/10",
      borderColor: "border-[#F59E0B]/30",
    },
    {
      id: "engagement",
      icon: Zap,
      title: "Engagement Tips",
      description: "Boost viewer interactions and community building",
      items: suggestions.engagementTips,
      color: "text-[#22C55E]",
      bgColor: "bg-[#22C55E]/10",
      borderColor: "border-[#22C55E]/30",
    },
    {
      id: "retention",
      icon: Eye,
      title: "Retention Tips",
      description: "Keep viewers watching until the end",
      items: suggestions.retentionTips,
      color: "text-[#EC4899]",
      bgColor: "bg-[#EC4899]/10",
      borderColor: "border-[#EC4899]/30",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-[#FFFFFF]">Video Improvement Report</h2>
        <p className="text-[#A0A0A0]">AI-powered recommendations to boost your video performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.id}
              className={`bg-[#121212] border border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:border-gray-500 ${section.bgColor}`}
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className={`p-3 bg-[#030303] border border-gray-600 rounded-lg ${section.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold text-[#FFFFFF] ${section.color}`}>
                    {section.title}
                  </h3>
                  <p className="text-xs text-[#A0A0A0] mt-1">{section.description}</p>
                </div>
              </div>

              {/* Tips List */}
              <div className="space-y-3">
                {section.items && section.items.length > 0 ? (
                  section.items.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3 bg-[#030303] rounded-lg border ${section.borderColor} hover:border-opacity-100 transition-all`}
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#FF0000] to-[#E60030] text-white text-xs font-bold flex items-center justify-center mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-[#E2E8F0] leading-relaxed flex-1">{item}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#A0A0A0] italic">No suggestions available</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Tips Section */}
      <div className="bg-gradient-to-r from-[#121212] to-[#030303] border border-[#FF0000]/20 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-[#FFFFFF] mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-[#FF0000]" />
          Quick Win Actions
        </h3>
        <div className="space-y-2 text-sm text-[#A0A0A0]">
          <p>✓ Start by implementing 3-5 suggestions that are easiest to apply</p>
          <p>✓ Measure changes using YouTube Analytics after 1-2 weeks</p>
          <p>✓ Focus on high-impact changes like title and thumbnail first</p>
          <p>✓ Test variations and use A/B testing when possible</p>
          <p>✓ Reuse successful patterns in future videos</p>
        </div>
      </div>
    </div>
  );
};

export default VideoImprovementReport;
