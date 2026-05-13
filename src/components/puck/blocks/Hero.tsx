import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export const HeroImageLeft = ({ heading, subheading, ctaText, image }: { heading: string, subheading: string, ctaText?: string, image?: string }) => (
  <section className="flex flex-col md:flex-row bg-[#F9F8F6] border-b border-black/5 min-h-[90vh] overflow-hidden">
    <motion.div 
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="flex-1 relative border-r border-black/5 min-h-[50vh]"
    >
      {image ? (
        <img src={image} alt="Hero" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5">
          <span className="milano-label opacity-20 text-[12px]">Composition_01</span>
        </div>
      )}
      <div className="absolute inset-0 bg-black/5 mix-blend-overlay" />
    </motion.div>
    <div className="flex-1 flex flex-col items-start justify-center p-12 md:p-24 lg:p-32">
      <motion.span 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="milano-label mb-8"
      >
        Establishment 2026
      </motion.span>
      <motion.h1 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="text-6xl md:text-8xl milano-heading text-[#1A1A1A] max-w-xl"
      >
        {heading}
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-sm uppercase tracking-[0.2em] mt-10 font-medium text-black/50 max-w-md leading-relaxed"
      >
        {subheading}
      </motion.p>
      {ctaText && (
        <motion.button 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-16 group flex items-center gap-4 px-10 py-5 bg-black text-white text-[11px] uppercase font-bold tracking-[0.3em] hover:bg-[#222] transition-all border border-black shadow-2xl"
        >
          {ctaText}
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </motion.button>
      )}
    </div>
  </section>
);

export const HeroFullVisual = ({ heading, subheading, ctaText, padding = 'normal', image }: { heading: string, subheading: string, ctaText?: string, padding?: 'normal' | 'large', image?: string }) => (
  <section className={`relative px-10 text-center border-b border-black/5 overflow-hidden ${padding === 'large' ? 'py-64' : 'py-48'} ${image ? 'text-white' : 'bg-[#F9F8F6] text-[#1A1A1A]'}`}>
    {image && (
      <>
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2 }}
          src={image} 
          alt="Hero background" 
          referrerPolicy="no-referrer" 
          className="absolute inset-0 w-full h-full object-cover z-0" 
        />
        <div className="absolute inset-0 bg-black/40 z-0 backdrop-blur-[2px]" />
      </>
    )}
    <div className="relative z-10 max-w-5xl mx-auto">
      <motion.span 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`milano-label mb-8 block ${image ? 'text-white/60' : ''}`}
      >
        {image ? 'Seasonal Preview' : 'New Collection'}
      </motion.span>
      <motion.h1 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-7xl md:text-9xl milano-heading"
      >
        {heading}
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className={`text-sm uppercase tracking-[0.3em] mt-12 font-medium max-w-2xl mx-auto ${image ? 'text-white/70' : 'text-black/40'}`}
      >
        {subheading}
      </motion.p>
      {ctaText && (
        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.05 }}
          className={`mt-16 px-12 py-6 text-[11px] uppercase font-bold tracking-[0.4em] transition-all border shadow-xl ${image ? 'bg-white text-black hover:bg-[#F9F8F6] border-white' : 'bg-black text-white hover:bg-[#1A1A1A] border-black'}`}
        >
          {ctaText}
        </motion.button>
      )}
    </div>
  </section>
);

export const HeroProductFirst = ({ heading, price, ctaText, image }: { heading: string, price: string, ctaText?: string, image?: string }) => (
  <section className="py-32 px-10 border-b border-black/5 bg-white overflow-hidden">
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24">
      <div className="flex-1 text-left">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <span className="milano-label mb-10 block">Limited Release</span>
          <h1 className="text-6xl md:text-8xl milano-heading text-[#1A1A1A] mb-10">{heading}</h1>
          <div className="flex items-baseline gap-4 mb-14">
            <p className="text-3xl font-serif-italic text-black/80">{price}</p>
            <span className="milano-label line-through opacity-30">$145.00</span>
          </div>
          {ctaText && (
            <button className="group flex items-center gap-6 px-12 py-6 bg-black text-white text-[11px] uppercase font-bold tracking-[0.3em] hover:bg-[#1A1A1A] transition-all border border-black shadow-2xl">
              {ctaText}
              <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </button>
          )}
        </motion.div>
      </div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
        viewport={{ once: true }}
        className="flex-1 w-full aspect-square relative bg-[#F9F8F6] border border-black/5 p-16 flex items-center justify-center group shadow-sm"
      >
        <div className="absolute top-8 left-8 milano-label opacity-40">Item_No. 0042</div>
        {image ? (
          <img src={image} alt="Product" referrerPolicy="no-referrer" className="max-w-[90%] max-h-[90%] object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" />
        ) : (
           <span className="milano-label opacity-20">Preview_Null</span>
        )}
      </motion.div>
    </div>
  </section>
);

export const HeroServiceFirst = ({ heading, subheading, services, image }: { heading: string, subheading: string, services?: { label: string }[], image?: string }) => (
  <section className={`relative py-48 px-10 border-b border-black/10 overflow-hidden ${image ? 'text-white' : 'bg-[#1A1A1A] text-white'} text-center`}>
    {image && (
      <>
        <motion.img 
          initial={{ scale: 1.1, filter: "grayscale(100%)" }}
          whileInView={{ scale: 1, filter: "grayscale(0%)" }}
          transition={{ duration: 1.5 }}
          src={image} 
          alt="Background" 
          referrerPolicy="no-referrer" 
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-40" 
        />
        <div className="absolute inset-0 bg-black/70 z-0" />
      </>
    )}
    <div className="relative z-10 max-w-5xl mx-auto">
      <motion.span 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="milano-label text-white/50 mb-10 block"
      >
        Premier Services
      </motion.span>
      <motion.h1 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-6xl md:text-8xl milano-heading mb-10"
      >
        {heading}
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm uppercase tracking-[0.4em] font-medium text-white/40 mb-20 max-w-2xl mx-auto"
      >
        {subheading}
      </motion.p>
      
      <div className="flex flex-wrap justify-center gap-6">
        {(services || [{ label: 'Consultation' }, { label: 'Execution' }, { label: 'Curation' }]).map((service, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + (i * 0.1) }}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
            className="px-8 py-4 border border-white/20 text-[10px] font-bold uppercase tracking-[0.3em] transition-all cursor-pointer"
          >
            {service.label}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
