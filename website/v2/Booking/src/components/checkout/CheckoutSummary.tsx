import React, { useState } from 'react';
import { ArrowLeft, CreditCard, ShieldCheck, Ticket, Check } from 'lucide-react';
import { EVENTS } from '../events/eventsData';
import { cn } from '../ui/utils';
import { PaymentForm } from './PaymentForm';
import { ImageWithFallback } from '../figma/ImageWithFallback';
// Checkout summary images
import bowlingSummaryImage from '../../assets/checkout/bowling-summary.png';
import karaokeSummaryImage from '../../assets/activities/karaoke.png';
import themedKaraokeSummaryImage from '../../assets/activities/themed-karaoke.png';

interface CheckoutSummaryProps {
  data: any;
  onBack: () => void;
  onConfirm: () => void;
}

export const CheckoutSummary = ({ data, onBack, onConfirm }: CheckoutSummaryProps) => {
  const [view, setView] = useState<'summary' | 'payment'>('summary');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Identify Type (Event Booking has eventId)
  const event = data.eventId ? EVENTS.find(e => e.id === data.eventId) : null;
  
  // Data Normalization
  let title = "";
  let dateDisplay = "";
  let imageSrc = "";
  let lineItems: any[] = [];
  
  let subtotal = 0;
  let serviceCharge = 0;
  let processingFee = 0;
  let tax = 0;
  let total = 0;

  if (event) {
      // Event Booking Logic
      title = event.title;
      dateDisplay = event.date;
      imageSrc = event.image;
      
      lineItems = event.options?.filter(opt => data.quantities[opt.id] > 0).map(opt => {
        const qty = data.quantities[opt.id];
        return {
          id: opt.id,
          label: opt.label,
          qty,
          price: opt.price,
          total: opt.price * qty
        };
      }) || [];
      
      subtotal = lineItems.reduce((acc, item) => acc + item.total, 0);
      processingFee = subtotal * 0.03;
      tax = subtotal * 0.06;
      total = subtotal + processingFee + tax;
  } else if (data.items) {
      // Party/Package Booking Logic
      title = data.title;
      dateDisplay = `${data.date} at ${data.time}`;
      imageSrc = ""; // Package bookings might not pass an image currently
      
      lineItems = data.items.map((item: any, i: number) => ({
          id: i,
          label: item.name,
          qty: item.quantity,
          price: item.price,
          total: item.price * item.quantity
      }));

      subtotal = data.subtotal;
      serviceCharge = data.serviceCharge || 0;
      processingFee = data.processingFee;
      tax = data.tax;
      total = data.total;
  } else {
      return <div className="min-h-screen flex items-center justify-center text-white">Error: Invalid Checkout Data</div>;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl bg-[#041C2C]/90 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side: Event/Package Info */}
        <div className="hidden md:flex md:w-1/3 bg-black/20 flex-col p-8 border-r border-white/5 relative overflow-hidden">
            {imageSrc && (
                <div className="absolute inset-0">
                     <ImageWithFallback src={imageSrc} alt={title} className="w-full h-full object-cover opacity-40" />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#041C2C] to-transparent" />
                </div>
            )}
            {!imageSrc && (
                <div className="absolute inset-0">
                     <ImageWithFallback 
                        src={title === 'THEMED KARAOKE' ? themedKaraokeSummaryImage : (title.toLowerCase().includes('karaoke') ? karaokeSummaryImage : bowlingSummaryImage)}
                        alt={title || "Summary"}
                        className="w-full h-full object-cover opacity-50"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#041C2C] via-[#041C2C]/50 to-transparent" />
                </div>
            )}
            
            <div className="relative z-10 mt-auto">
                <h3 className="font-montserrat font-bold text-xl text-white uppercase tracking-wide leading-tight mb-2">{title}</h3>
                <p className="text-[#71D2EB] text-sm font-medium">{dateDisplay}</p>
            </div>
        </div>

        {/* Right Side */}
        <div className="flex-1 p-8 flex flex-col">
          {view === 'payment' ? (
            <PaymentForm 
                total={total} 
                onBack={() => setView('summary')} 
                onPay={onConfirm} 
            />
          ) : (
            <>
              <div className="flex items-center gap-4 mb-8">
                 <button 
                    onClick={onBack}
                    className="p-2 -ml-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="font-montserrat font-black text-2xl text-white uppercase tracking-wide">Order Summary</h2>
              </div>

              {/* Line Items */}
              <div className="flex-1 space-y-4 mb-8 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin scrollbar-thumb-white/10">
                {lineItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#71D2EB]/10 flex items-center justify-center border border-[#71D2EB]/20">
                        <Ticket className="w-5 h-5 text-[#71D2EB]" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm uppercase tracking-wide">{item.label}</p>
                        <p className="text-white/50 text-xs">{item.qty} x ${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <span className="font-bold text-white">${item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-3 pt-6 border-t border-white/10 mb-8">
                 <div className="flex justify-between text-white/60 text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                 </div>
                 {serviceCharge > 0 && (
                     <div className="flex justify-between text-white/60 text-sm">
                        <span>Service Charge (20%)</span>
                        <span>${serviceCharge.toFixed(2)}</span>
                     </div>
                 )}
                 <div className="flex justify-between text-white/60 text-sm">
                    <span>Processing Fee (3%)</span>
                    <span>${processingFee.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-white/60 text-sm">
                    <span>Sales Tax (6%)</span>
                    <span>${tax.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-end pt-4 border-t border-white/5 mt-2">
                    <span className="font-bold text-white text-lg uppercase tracking-wide">Total Due</span>
                    <span className="font-black text-[#71D2EB] text-3xl">${total.toFixed(2)}</span>
                 </div>
              </div>
              
              {/* Terms */}
               <div className="mb-6 flex items-center gap-3 cursor-pointer group" onClick={() => setAgreedToTerms(!agreedToTerms)}>
                 <div className={cn(
                     "w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0",
                     agreedToTerms ? "bg-[#71D2EB] border-[#71D2EB] text-[#041C2C]" : "border-white/30 group-hover:border-white/50"
                 )}>
                     {agreedToTerms && <Check className="w-3 h-3" strokeWidth={4} />}
                 </div>
                 <span className="text-sm text-white/70 select-none">
                     I agree to the <span className="text-[#71D2EB] underline hover:text-[#71D2EB]/80">Booking Terms</span>
                 </span>
               </div>

               <button
                 onClick={() => setView('payment')}
                 disabled={!agreedToTerms}
                 className={cn(
                     "w-full font-black py-4 rounded-xl uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all",
                     !agreedToTerms 
                         ? "bg-white/10 text-white/30 cursor-not-allowed" 
                         : "bg-[#71D2EB] hover:bg-[#5dbcd3] text-[#041C2C] hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(113,210,235,0.3)]"
                 )}
               >
                 <ShieldCheck className="w-5 h-5" />
                 <span>Confirm & Pay</span>
               </button>
               
               <div className="mt-4 flex items-center justify-center gap-2 text-white/30 text-xs">
                  <CreditCard className="w-3 h-3" />
                  <span>Secure Payment Processing</span>
               </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
