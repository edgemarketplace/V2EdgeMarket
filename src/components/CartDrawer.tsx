import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../lib/cart';

export function CartDrawer() {
  const { items, removeItem, updateQuantity, isOpen, setIsOpen, total } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[2001] shadow-2xl flex flex-col"
          >
            <div className="p-8 border-b border-black/10 flex justify-between items-center bg-[#F9F8F6]">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5" />
                <h2 className="text-2xl font-serif italic tracking-tight">Your Cart</h2>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-black/5 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30 py-20">
                  <ShoppingBag className="w-12 h-12" />
                  <p className="text-sm font-bold uppercase tracking-widest">Cart is Empty</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-6 group">
                    <div className="w-24 h-32 bg-[#F9F8F6] border border-black/5 flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold uppercase tracking-widest opacity-20">No Image</div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col py-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-sm font-bold uppercase tracking-tight">{item.name}</h3>
                        <p className="text-sm font-serif italic">{item.price}</p>
                      </div>
                      <p className="text-[10px] text-black/40 uppercase tracking-widest mb-auto">Professional Edition</p>
                      
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center border border-black/10 rounded-full px-2 py-1">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-[10px] uppercase font-bold tracking-widest text-black/30 hover:text-red-500 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-8 bg-[#F9F8F6] border-t border-black/10 space-y-6">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold uppercase tracking-widest text-black/40">Estimated Total</span>
                <span className="text-3xl font-serif italic">${total.toFixed(2)}</span>
              </div>
              <button 
                disabled={items.length === 0}
                className="w-full py-5 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-black/90 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed group"
              >
                Checkout Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-[10px] text-center text-black/30 leading-relaxed">
                Taxes and shipping calculated at checkout. <br/>
                Secure Milano Payment Gateway enabled.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
