import { Link } from "react-router-dom";
import { TrendingUp, Github, Twitter, Youtube } from "lucide-react";

export const LandingFooter = () => {
  return (
    <footer className="bg-[#030303] border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="TrendTube Logo" className="h-8 w-auto rounded-md" />
              <span className="text-xl font-bold text-white tracking-tight">TrendTube</span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed">
              The ultimate analytics and intelligence platform for YouTube creators who want to scale faster.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link to="#" className="text-white/50 hover:text-white transition-colors text-sm">Features</Link></li>
              <li><Link to="#" className="text-white/50 hover:text-white transition-colors text-sm">Pricing</Link></li>
              <li><Link to="#" className="text-white/50 hover:text-white transition-colors text-sm">API</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><Link to="#" className="text-white/50 hover:text-white transition-colors text-sm">Documentation</Link></li>
              <li><Link to="#" className="text-white/50 hover:text-white transition-colors text-sm">Blog</Link></li>
              <li><Link to="#" className="text-white/50 hover:text-white transition-colors text-sm">Community</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <div className="flex gap-4">
              <a href="#" className="h-10 w-10 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors">
                <Twitter className="h-4 w-4 text-white" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors">
                <Youtube className="h-4 w-4 text-white" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors">
                <Github className="h-4 w-4 text-white" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} TrendTube. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-white/40">
            <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
