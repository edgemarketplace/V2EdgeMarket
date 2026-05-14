import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, Loader2, X, MessageSquare } from 'lucide-react';
import { safeFetchJson } from '../../lib/http';

interface AiAssistantProps {
  currentData: any;
  businessDetails: any;
  onUpdate: (newData: any) => void;
}

export function AiAssistant({ currentData, businessDetails, onUpdate }: AiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim() || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      const newData = await safeFetchJson<any>('/api/edit-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentData,
          instruction,
          businessDetails
        }),
      });

      onUpdate(newData);
      setInstruction('');
      // Keep open so they can see the change or ask for more
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[1000] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-96 bg-white rounded-3xl shadow-2xl border border-black/5 overflow-hidden flex flex-col"
          >
            <div className="p-6 bg-black text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-serif italic text-lg leading-none">Design Partner</h3>
                  <p className="text-[10px] uppercase tracking-widest opacity-50 mt-1">AI-Powered Edits</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 space-y-4">
              <p className="text-sm text-black/60 leading-relaxed font-sans">
                Tell me what to change. I can rewrite copy, swap images, add new sections, or adjust your theme.
              </p>
              
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 font-sans">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest font-bold text-black/40">Try asking for:</p>
                <div className="flex flex-wrap gap-2">
                  {['Make it more aggressive', 'Add a testimonial section', 'Use darker colors', 'Rewrite the hero headline'].map((tip) => (
                    <button
                      key={tip}
                      onClick={() => setInstruction(tip)}
                      className="text-[10px] px-3 py-1.5 bg-black/5 hover:bg-black/10 rounded-full transition-colors text-black/60 font-sans"
                    >
                      {tip}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 bg-black/5 border-t border-black/5">
              <div className="relative">
                <textarea
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder="e.g. Add a FAQ section about shipping..."
                  className="w-full bg-white border-none rounded-2xl p-4 pr-12 text-sm focus:ring-2 focus:ring-black min-h-[100px] resize-none shadow-inner font-sans"
                />
                <button
                  type="submit"
                  disabled={isProcessing || !instruction.trim()}
                  className="absolute bottom-3 right-3 p-2 bg-black text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-black text-white rounded flex items-center justify-center border border-black/20 hover:bg-black/90 transition-colors"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-7 h-7" />
            </motion.div>
          ) : (
            <motion.div
              key="sparkle"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <Sparkles className="w-7 h-7" />
            </motion.div>
          )}
        </AnimatePresence>
        
      </motion.button>
    </div>
  );
}
