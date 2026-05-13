import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Check, 
  Zap, 
  Rocket, 
  Globe, 
  ArrowLeft, 
  CreditCard, 
  ChevronRight,
  Mail, 
  MapPin, 
  Tag, 
  Target
} from 'lucide-react';
import { MarketplaceIntakeData } from '../lib/types';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Dummy test key for UI purposes
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

interface CheckoutPageProps {
  intakeData: MarketplaceIntakeData;
  onBack: () => void;
  onComplete: (plan: 'launch' | 'pro') => void;
}

const CheckoutForm = ({ plan, onComplete }: { plan: 'launch' | 'pro', onComplete: (plan: 'launch' | 'pro') => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);
    // Simulate network delay for payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onComplete(plan);
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      <div className="p-4 border border-black/10 rounded-xl bg-white shadow-sm mt-4">
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#1A1A1A',
              '::placeholder': { color: '#aab7c4' },
              fontFamily: 'Inter, sans-serif'
            },
            invalid: { color: '#9e2146' },
          },
        }} />
      </div>
      <button 
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-black text-white p-6 rounded-2xl font-bold flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10 group disabled:opacity-50 disabled:scale-100"
      >
        {isProcessing ? (
          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        ) : (
          <CreditCard className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        )}
        {isProcessing ? 'Processing Payment...' : (plan === 'launch' ? 'Pay $5 Activation & Launch' : 'Start Subscription & Launch')}
        {!isProcessing && <ChevronRight className="w-5 h-5 opacity-30" />}
      </button>
      <p className="text-center text-[10px] text-black/30 mt-6 font-medium italic">
        {plan === 'launch' 
          ? '*Activation fee is refunded after your first successful sale.' 
          : 'Subscription starts immediately. Billed monthly. Cancel anytime.'}
      </p>
    </form>
  );
};

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ intakeData, onBack, onComplete }) => {
  const [selectedPlan, setSelectedPlan] = useState<'launch' | 'pro'>('launch');

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1A1A1A] font-sans selection:bg-black selection:text-white pb-20">
      {/* Header */}
      <header className="border-b border-black/5 bg-white py-6 px-8 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold opacity-40 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Editor
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-sm flex items-center justify-center font-serif italic font-bold text-white text-sm">E</div>
            <span className="font-bold tracking-tight text-sm">Edge Marketplace Hub</span>
          </div>
          <div className="w-24"></div> {/* Spacer for balance */}
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Left Side: Business Review */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div>
              <h2 className="text-4xl font-serif italic mb-2">Review Your Business</h2>
              <p className="text-black/50">Your marketplace is ready. Here's a summary of the configuration we're deploying to the edge.</p>
            </div>

            <div className="bg-white border border-black/5 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-8 border-b border-black/5 bg-black/[0.02]">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white font-serif italic text-2xl">
                    {intakeData.businessName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{intakeData.businessName}</h3>
                    <p className="text-xs uppercase tracking-widest text-black/40 font-bold">{intakeData.businessType.replace('-', ' ')}</p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 flex items-center gap-2">
                      <Mail className="w-3 h-3" /> Contact Email
                    </p>
                    <p className="font-medium">{intakeData.contactEmail}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> Service Area
                    </p>
                    <p className="font-medium">{intakeData.serviceArea || 'Global'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 flex items-center gap-2">
                      <Tag className="w-3 h-3" /> Primary Offerings
                    </p>
                    <p className="font-medium line-clamp-1">{intakeData.offerings}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 flex items-center gap-2">
                      <Target className="w-3 h-3" /> Growth Goal
                    </p>
                    <p className="font-medium capitalize">{intakeData.primaryGoal}</p>
                  </div>
                </div>

                <div className="pt-8 border-t border-black/5">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-4">Instance Configuration</p>
                   <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-black/50">Edge Nodes</span>
                        <span className="font-bold">42 Active</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-black/50">Database Tier</span>
                        <span className="font-bold">Encrypted Cluster</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-black/50">SSL Certificate</span>
                        <span className="font-bold text-green-600">Provisioned</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-black/[0.03] rounded-2xl border border-black/5 flex gap-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-black/5 shadow-sm text-black/40">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">Global Deployment Ready</h4>
                <p className="text-xs text-black/50 leading-relaxed">Once you complete the checkout, your business will be live on <code>{intakeData.businessName.toLowerCase().replace(/\s+/g, '-')}.edgemarketplacehub.com</code> within seconds.</p>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Plan Selection */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div>
              <h2 className="text-4xl font-serif italic mb-2">Choose Your Scale</h2>
              <p className="text-black/50">Transparent pricing for the next generation of commerce.</p>
            </div>

            <div className="space-y-6">
              {/* Launch Plan */}
              <div 
                onClick={() => setSelectedPlan('launch')}
                className={`group cursor-pointer p-8 rounded-3xl border transition-all ${
                  selectedPlan === 'launch' 
                    ? 'bg-white border-black shadow-xl ring-1 ring-black' 
                    : 'bg-white/50 border-black/10 hover:border-black/30 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                       <Rocket className={`w-4 h-4 ${selectedPlan === 'launch' ? 'text-black' : 'text-black/30'}`} /> 
                       Launch
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-serif italic font-bold">$0</span>
                      <span className="text-black/30 font-medium">/mo</span>
                    </div>
                  </div>
                  {selectedPlan === 'launch' && (
                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Fees</p>
                    <p className="text-sm font-bold">5% per sale</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Branding</p>
                    <p className="text-sm font-bold">Edge Subdomain</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Go Live</p>
                    <p className="text-sm font-bold">$5 activation*</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Support</p>
                     <p className="text-sm font-bold">Community</p>
                  </div>
                </div>
              </div>

              {/* Pro Plan */}
              <div 
                onClick={() => setSelectedPlan('pro')}
                className={`group cursor-pointer p-8 rounded-3xl border transition-all relative overflow-hidden ${
                  selectedPlan === 'pro' 
                    ? 'bg-[#1A1A1A] text-white border-white shadow-xl ring-1 ring-white' 
                    : 'bg-[#1A1A1A]/90 text-white/40 border-white/10 hover:border-white/30 shadow-sm'
                }`}
              >
                {selectedPlan === 'pro' && (
                  <div className="absolute top-0 right-0 p-4">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-black" />
                    </div>
                  </div>
                )}
                <div className="mb-8">
                  <h3 className={`text-sm font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2 ${selectedPlan === 'pro' ? 'text-white/60' : 'text-white/20'}`}>
                     <Zap className={`w-4 h-4 ${selectedPlan === 'pro' ? 'text-white fill-white' : 'text-white/20'}`} /> 
                     Pro
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-serif italic font-bold text-white">$99</span>
                    <span className="text-white/30 font-medium">/mo</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-1">
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedPlan === 'pro' ? 'text-white/30' : 'text-white/10'}`}>Fees</p>
                    <p className={`text-sm font-bold ${selectedPlan === 'pro' ? 'text-white' : ''}`}>1% per sale</p>
                  </div>
                  <div className="space-y-1">
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedPlan === 'pro' ? 'text-white/30' : 'text-white/10'}`}>Branding</p>
                    <p className={`text-sm font-bold ${selectedPlan === 'pro' ? 'text-white' : ''}`}>Custom Domain</p>
                  </div>
                  <div className="space-y-1">
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedPlan === 'pro' ? 'text-white/30' : 'text-white/10'}`}>Go Live</p>
                    <p className={`text-sm font-bold ${selectedPlan === 'pro' ? 'text-white' : ''}`}>Instant Live</p>
                  </div>
                  <div className="space-y-1">
                     <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedPlan === 'pro' ? 'text-white/30' : 'text-white/10'}`}>Support</p>
                     <p className={`text-sm font-bold ${selectedPlan === 'pro' ? 'text-white' : ''}`}>Priority 24/7</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-black/5">
              <Elements stripe={stripePromise}>
                <CheckoutForm plan={selectedPlan} onComplete={onComplete} />
              </Elements>
            </div>

            {/* Core Features Recap */}
            <div className="bg-white border border-black/5 p-8 rounded-2xl mt-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-6 text-center italic">Included in both tiers</p>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   "Marketplace Templates",
                   "Unlimited Products",
                   "Global Edge Hosting",
                   "Built-in Checkout",
                   "Sales Dashboard",
                   "Automated SSL"
                 ].map((f, i) => (
                   <div key={i} className="flex items-center gap-2 text-[11px] font-bold">
                     <Check className="w-3 h-3 text-green-500" />
                     {f}
                   </div>
                 ))}
              </div>
            </div>

          </motion.div>
        </div>
      </main>
    </div>
  );
};
