import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "TrendTube completely changed how I plan my content. My channel views are up 300% since I started using their predictive analytics.",
    author: "Alex Rivers",
    role: "Tech Creator (1.2M Subs)",
    image: "https://i.pravatar.cc/150?u=alex",
  },
  {
    quote: "The thumbnail A/B testing alone is worth 10x the price. I no longer guess what works, the data just tells me.",
    author: "Sarah Jenkins",
    role: "Finance Vlogger (850k Subs)",
    image: "https://i.pravatar.cc/150?u=sarah",
  },
  {
    quote: "I was stuck at 50k subs for a year. TrendTube helped me identify a micro-trend before it exploded. Hit 200k in two months.",
    author: "Marcus Chen",
    role: "Gaming Channel (240k Subs)",
    image: "https://i.pravatar.cc/150?u=marcus",
  }
];

export const Testimonials = () => {
  return (
    <section className="py-24 bg-[#030303] border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white mb-4"
          >
            Trusted by Top <span className="text-[#FF0000]">Creators</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/60 text-lg"
          >
            Don't just take our word for it. See what others are achieving.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-panel p-8 rounded-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-[#FF0000] text-[#FF0000]" />
                  ))}
                </div>
                <p className="text-white/80 text-lg italic mb-8">"{testimonial.quote}"</p>
              </div>
              <div className="flex items-center gap-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.author} 
                  className="w-12 h-12 rounded-full border border-white/20"
                />
                <div>
                  <h4 className="text-white font-semibold">{testimonial.author}</h4>
                  <p className="text-white/50 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
