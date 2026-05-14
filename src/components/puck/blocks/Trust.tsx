import React from 'react';
import { Star, ShieldCheck, Award, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

const StarRating = ({ count = 5 }: { count?: number }) => (
  <div className="flex gap-1 text-[#D4AF37]">
    {[...Array(count)].map((_, i) => (
      <Star key={i} size={14} fill="currentColor" />
    ))}
  </div>
);

export const TrustReviews = ({ title, reviews }: { title: string, reviews?: { quote: string, author: string, location: string, rating: number }[] }) => {
  const defaultReviews = [1, 2, 3].map(i => ({ 
    quote: "An incredible experience from start to finish. The attention to detail and personalized service is unmatched in the industry.",
    author: `Verified Buyer ${i}`,
    location: "NYC, United States",
    rating: 5
  }));
  const items = reviews || defaultReviews;
  return (
    <section className="py-32 px-10 bg-[#F9F8F6] border-b border-black/5">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8"
        >
          <div className="max-w-xl">
            <span className="milano-label mb-4 block">Customer Feedback</span>
            <h2 className="text-5xl milano-heading text-[#1A1A1A]">{title}</h2>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-serif-italic">4.9/5.0</span>
              <StarRating />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Based on 500+ Reviews</span>
          </div>
        </motion.div>
  
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {items.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white p-10 border border-black/5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] flex flex-col h-full"
            >
              <StarRating count={item.rating || 5} />
              <p className="text-sm font-light text-[#1A1A1A]/80 my-8 leading-relaxed italic grow">
                "{item.quote}"
              </p>
              <div className="flex items-center gap-4 pt-6 border-t border-black/5">
                <div className="w-8 h-8 rounded-full bg-[#F9F8F6] border border-black/5 flex items-center justify-center text-[10px] font-bold">
                  {item.author.charAt(0)}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest">{item.author}</p>
                  <p className="text-[9px] text-black/40 uppercase tracking-widest">{item.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const TrustTestimonials = ({ title, testimonials }: { title: string, testimonials?: { quote: string, author: string, company: string, image?: string }[] }) => {
  const defaultItems = [1, 2].map(i => ({
    quote: "This platform has fundamentally transformed how we interact with our clientele. The elegance of the design is matched only by its functional power.",
    author: `Director ${i}`,
    company: "Global Solutions Co.",
    image: ""
  }));
  const items = testimonials || defaultItems;
  return (
    <section className="py-32 px-10 bg-white border-b border-black/5">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <span className="milano-label mb-4 block">Testimonials</span>
          <h2 className="text-6xl milano-heading text-[#1A1A1A] max-w-3xl mx-auto">{title}</h2>
        </motion.div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {items.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative p-12 bg-[#F9F8F6] border border-black/5 group"
            >
              <MessageSquare className="absolute -top-6 -left-4 w-12 h-12 text-black/5 group-hover:text-black/10 transition-colors" />
              <p className="text-2xl font-serif-italic text-[#1A1A1A]/90 mb-12 leading-relaxed relative z-10">
                "{item.quote}"
              </p>
              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 rounded-full bg-white border border-black/5 overflow-hidden shadow-sm flex items-center justify-center">
                   {item.image ? (
                     <img src={item.image} alt={item.author} className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full bg-black/5 animate-pulse" />
                   )}
                 </div>
                 <div>
                   <p className="text-[11px] font-bold uppercase tracking-widest text-[#1A1A1A]">{item.author}</p>
                   <p className="text-[10px] text-black/40 uppercase tracking-widest">{item.company}</p>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const TrustLogos = () => (
  <section className="py-16 px-10 bg-white border-b border-black/5 overflow-hidden">
    <div className="max-w-6xl mx-auto">
      <p className="milano-label text-center mb-12">Partnerships & Recognition</p>
      <div className="flex justify-center items-center gap-12 md:gap-24 opacity-30 flex-wrap grayscale transition-all">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div 
            key={i} 
            whileHover={{ opacity: 1, scale: 1.05 }}
            className="text-2xl font-serif-italic font-bold tracking-tighter"
          >
            Studio_{i}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export const TrustStats = ({ title }: { title: string }) => (
  <section className="py-24 px-10 bg-[#1A1A1A] text-white border-b border-black">
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
        {[
          { num: '1.2k+', label: 'Global Clients', icon: ShieldCheck },
          { num: '99%', label: 'Satisfaction', icon: Award },
          { num: '24/7', label: 'Dedicated Support', icon: MessageSquare },
          { num: '15+', label: 'Industry Awards', icon: Award }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <stat.icon className="mx-auto mb-6 text-white/20 w-8 h-8" strokeWidth={1} />
            <div className="text-5xl milano-heading mb-3 text-white">{stat.num}</div>
            <div className="milano-label text-white/40">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
