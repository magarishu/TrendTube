import { motion } from "framer-motion";
import { Zap, Eye, Target, TrendingUp, Layers, MousePointerClick } from "lucide-react";

const features = [
  {
    title: "Real-time Trending Intel",
    description: "Monitor what's going viral across every niche before your competitors do. Instant updates on global trends.",
    icon: TrendingUp,
    colSpan: "col-span-1 md:col-span-2",
    delay: 0.1,
  },
  {
    title: "Audience Retention AI",
    description: "Our AI predicts exactly when viewers will drop off before you hit publish.",
    icon: Target,
    colSpan: "col-span-1",
    delay: 0.2,
  },
  {
    title: "Thumbnail A/B Testing",
    description: "Analyze click-through rates on custom thumbnails with predictive heatmaps.",
    icon: MousePointerClick,
    colSpan: "col-span-1",
    delay: 0.3,
  },
  {
    title: "Competitor Deep Dive",
    description: "Reverse engineer the exact strategies top creators use to scale their channels.",
    icon: Eye,
    colSpan: "col-span-1 md:col-span-2",
    delay: 0.4,
  },
  {
    title: "Multi-channel Tracking",
    description: "Manage and compare analytics across all your YouTube channels from a single dashboard.",
    icon: Layers,
    colSpan: "col-span-1 md:col-span-3",
    delay: 0.5,
  }
];

export const FeatureGrid = () => {
  return (
    <section className="py-24 bg-[#030303] relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white"
          >
            Unfair Advantage <br className="hidden sm:block" />
            <span className="text-[#FF0000]">In a Box.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/60 max-w-2xl mx-auto text-lg"
          >
            Everything you need to grow faster, packed into an intuitive, ultra-fast interface.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: feature.delay }}
              className={`glass-panel p-8 rounded-3xl relative overflow-hidden group hover:border-[#FF0000]/30 transition-colors duration-500 ${feature.colSpan}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF0000]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#FF0000]/20 transition-all duration-300">
                    <feature.icon className="h-6 w-6 text-white group-hover:text-[#FF0000] transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/60 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
