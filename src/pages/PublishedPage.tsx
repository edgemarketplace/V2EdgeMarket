import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Globe, ArrowRight, ExternalLink } from 'lucide-react';
import { MarketplaceIntakeData } from '../lib/types';

interface PublishedPageProps {
  intakeData: MarketplaceIntakeData;
}

export const PublishedPage: React.FC<PublishedPageProps> = ({ intakeData }) => {
  // Generate a mock URL based on the business name
  const slug = intakeData.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const mockUrl = `https://${slug}.edgemarketplacehub.com`;

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1A1A1A] font-sans flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-2xl w-full bg-white p-12 border border-black/10 shadow-2xl relative overflow-hidden"
      >
        {/* Confetti / Success Background effect */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600"></div>

        <div className="flex flex-col items-center text-center space-y-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center"
          >
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </motion.div>

          <div className="space-y-4">
            <h1 className="text-5xl font-serif italic tracking-tight">Your Store is Live!</h1>
            <p className="text-lg text-black/50 max-w-md mx-auto leading-relaxed">
              Congratulations! Your marketplace has been successfully provisioned and deployed to the global edge network.
            </p>
          </div>

          <div className="w-full bg-black/[0.03] border border-black/10 p-6 flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-black/40 text-sm font-bold uppercase tracking-widest">
              <Globe className="w-4 h-4" />
              Public URL
            </div>
            <a 
              href={mockUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-2xl font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors flex items-center gap-2"
            >
              {mockUrl}
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full pt-4">
            <button className="py-4 border border-black/10 text-xs font-bold uppercase tracking-widest hover:bg-black/5 transition-colors">
              Go to Dashboard
            </button>
            <button className="py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-black/90 transition-colors flex justify-center items-center gap-2">
              View Analytics
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
