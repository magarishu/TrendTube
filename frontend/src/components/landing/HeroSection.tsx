import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Play, Sparkles, TrendingUp, BarChart3, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  return (
    <div className="relative overflow-hidden w-full pt-32 pb-20 lg:pt-48 lg:pb-32 bg-[#030303] bg-grid-pattern">
      {/* Animated Lines Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <svg className="w-full h-full opacity-40" preserveAspectRatio="none" viewBox="0 0 1440 800" xmlns="http://www.w3.org/2000/svg">
          {/* Original Lines */}
          <motion.path
            d="M-100 600 C 300 400, 500 700, 900 300 S 1300 100, 1600 400"
            stroke="url(#grad1)" strokeWidth="3" fill="none"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
          />
          <motion.path
            d="M-100 300 C 400 100, 600 500, 1100 200 S 1400 600, 1600 300"
            stroke="url(#grad2)" strokeWidth="2" fill="none"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 5, ease: "easeInOut", repeat: Infinity, repeatType: "mirror", delay: 1 }}
          />
          <motion.path
            d="M 200 -100 C 300 300, 100 600, 500 900"
            stroke="#FF0000" strokeWidth="1.5" fill="none"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.4 }}
            transition={{ duration: 6, ease: "linear", repeat: Infinity, repeatType: "reverse", delay: 2 }}
          />
          
          {/* New Additional Lines for Density */}
          <motion.path
            d="M -200 800 C 200 600, 400 800, 800 500 S 1200 300, 1500 500"
            stroke="url(#grad1)" strokeWidth="1.5" fill="none"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ duration: 7, ease: "easeInOut", repeat: Infinity, repeatType: "mirror", delay: 0.5 }}
          />
          <motion.path
            d="M 0 0 C 400 200, 800 100, 1200 400 S 1400 700, 1600 800"
            stroke="url(#grad2)" strokeWidth="2" fill="none"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ duration: 8, ease: "easeInOut", repeat: Infinity, repeatType: "mirror", delay: 1.5 }}
          />
          <motion.path
            d="M -100 400 C 300 500, 500 200, 900 400 S 1300 600, 1600 200"
            stroke="#FF0000" strokeWidth="1" fill="none"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 5.5, ease: "linear", repeat: Infinity, repeatType: "reverse", delay: 0.2 }}
          />
          <motion.path
            d="M 400 -100 C 500 300, 200 600, 700 900"
            stroke="#FF6B6B" strokeWidth="1.5" fill="none"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.4 }}
            transition={{ duration: 6.5, ease: "linear", repeat: Infinity, repeatType: "reverse", delay: 3 }}
          />
          <motion.path
            d="M 1000 -100 C 900 300, 1200 600, 1000 900"
            stroke="url(#grad1)" strokeWidth="2" fill="none"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ duration: 4.5, ease: "easeInOut", repeat: Infinity, repeatType: "mirror", delay: 1.2 }}
          />

          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF0000" stopOpacity="0" />
              <stop offset="50%" stopColor="#FF0000" stopOpacity="1" />
              <stop offset="100%" stopColor="#FF6B6B" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF6B6B" stopOpacity="0" />
              <stop offset="50%" stopColor="#FF0000" stopOpacity="1" />
              <stop offset="100%" stopColor="#FF0000" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full glass-card px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-md"
          >
            <Sparkles className="h-4 w-4 text-[#FF0000]" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Next-Gen YouTube Analytics
            </span>
            <span className="w-1 h-1 rounded-full bg-[#FF0000] mx-1" />
            <span className="text-[#FF0000] font-semibold">Live Now</span>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
              Master the <br className="hidden sm:block" />
              <span className="gradient-text">Algorithm.</span>
            </h1>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed"
          >
            Predict viral trends, analyze competitor strategies, and dominate your niche with AI-powered insights designed for serious creators.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
          >
            <Link to="/signup">
              <Button className="group relative bg-[#FF0000] hover:bg-[#FF0000]/90 text-white h-14 px-8 text-lg font-semibold overflow-hidden rounded-full w-full sm:w-auto transition-all shadow-[0_0_40px_rgba(255,0,0,0.3)] hover:shadow-[0_0_60px_rgba(255,0,0,0.5)] border-0">
                <span className="relative z-10 flex items-center gap-2">
                  <Play className="h-5 w-5 fill-current" />
                  Start Free Trial
                </span>
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="glass-card text-white hover:bg-white/10 h-14 px-8 text-lg font-medium rounded-full w-full sm:w-auto border-white/10 hover:border-white/20 transition-all">
                Login
                <ChevronRight className="ml-2 h-5 w-5 opacity-70 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {/* Stats / Floating elements */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="pt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {[
              { icon: TrendingUp, label: "Videos Analyzed", value: "2M+" },
              { icon: BarChart3, label: "Data Points", value: "50B+" },
              { icon: Sparkles, label: "Active Creators", value: "10k+" }
            ].map((stat, idx) => (
              <div key={idx} className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center gap-3 card-hover">
                <div className="h-12 w-12 rounded-full bg-[#FF0000]/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-[#FF0000]" />
                </div>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
