import React, { useState } from 'react';
import { CreditCard, Calendar, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '../ui/utils';

interface PaymentFormProps {
  total: number;
  onBack: () => void;
  onPay: () => void;
}

export const PaymentForm = ({ total, onBack, onPay }: PaymentFormProps) => {
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [zip, setZip] = useState('');

  const handlePay = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    onPay();
  };

  // Basic formatting for visual effect
  const formatCardNumber = (val: string) => {
    return val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  };

  const formatExpiry = (val: string) => {
    return val.replace(/\D/g, '').replace(/(.{2})/, '$1/').slice(0, 5);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4 mb-6">
         <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-montserrat font-black text-2xl text-white uppercase tracking-wide">Payment Details</h2>
      </div>

      <form onSubmit={handlePay} className="flex-1 flex flex-col gap-6">
        <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-white/60 font-bold ml-1">Card Number</label>
            <div className="relative">
                <CreditCard className="absolute top-3.5 left-4 w-5 h-5 text-white/40" />
                <input 
                    type="text" 
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="0000 0000 0000 0000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#71D2EB] focus:bg-white/10 transition-all font-mono"
                    required
                />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-white/60 font-bold ml-1">Expiry Date</label>
                <div className="relative">
                    <Calendar className="absolute top-3.5 left-4 w-5 h-5 text-white/40" />
                    <input 
                        type="text" 
                        value={expiry}
                        onChange={e => setExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#71D2EB] focus:bg-white/10 transition-all font-mono"
                        required
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-white/60 font-bold ml-1">CVC</label>
                <div className="relative">
                    <Lock className="absolute top-3.5 left-4 w-5 h-5 text-white/40" />
                    <input 
                        type="text" 
                        value={cvc}
                        onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#71D2EB] focus:bg-white/10 transition-all font-mono"
                        required
                    />
                </div>
            </div>
        </div>

        <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-white/60 font-bold ml-1">Billing Zip Code</label>
            <input 
                type="text" 
                value={zip}
                onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="12345"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#71D2EB] focus:bg-white/10 transition-all font-mono"
                required
            />
        </div>

        <div className="mt-auto pt-6">
             <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#71D2EB] hover:bg-[#5dbcd3] text-[#041C2C] font-black py-4 rounded-xl uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(113,210,235,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                        <Lock className="w-4 h-4" />
                        <span>Pay ${total.toFixed(2)}</span>
                    </>
                )}
            </button>
             <div className="mt-4 text-center">
                <p className="text-white/30 text-xs flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" /> 
                    Payments processed securely by Stripe
                </p>
            </div>
        </div>
      </form>
    </div>
  );
};
