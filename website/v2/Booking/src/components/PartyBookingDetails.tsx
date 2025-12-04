import React, { useState } from 'react';
import { ArrowLeft, Users, Calendar, Clock, Check, Ticket, Plus, Minus, Info } from 'lucide-react';
import { PARTY_PACKAGES_DATA, PartyCategory } from './partyData';
import { format } from 'date-fns';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PartyBookingDetailsProps {
  bookingData: {
    partyCategory: PartyCategory | null;
    packageId: string | null;
    date: Date | null;
    time: string | null;
    guestCount: number | null;
  };
  onBack: () => void;
  onCheckout: (data: any) => void;
}

export const PartyBookingDetails = ({ bookingData, onBack, onCheckout }: PartyBookingDetailsProps) => {
  const { partyCategory, packageId, date, time, guestCount: paramGuestCount } = bookingData;
  
  const categoryData = partyCategory ? PARTY_PACKAGES_DATA[partyCategory] : null;
  const packageData = categoryData?.packages.find(p => p.id === packageId);

  const guestCount = paramGuestCount || 10;

  // Check for per-person pricing (like Axe Throwing)
  const isPerPerson = packageData?.priceDisplay?.toLowerCase().includes('/person');

  // Defaults
  const guestsIncluded = isPerPerson ? guestCount : (packageData?.guestsIncluded || 10);
  const extraGuestPrice = isPerPerson ? 0 : (packageData?.additionalGuestPrice || 40);
  
  // Cash Card Upsell State
  const [cashCardCount, setCashCardCount] = useState(0);
  const cashCardPrice = 5;
  const cashCardValue = (packageId === 'split' || packageId === 'spare') ? 15 : 20;

  if (!packageData || !date || !time) return <div className="p-8 text-white">Loading details...</div>;

  // Determine Base Price based on date
  const day = date.getDay();
  const isWeekend = day === 0 || day === 5 || day === 6; // Sun(0), Fri(5), Sat(6)
  
  let basePrice = 0;
  
  if (packageId === 'strike') {
      basePrice = isWeekend ? 515 : 489;
  } else if (packageId === 'spare') {
      basePrice = isWeekend ? 415 : 389;
  } else if (packageId === 'split') {
      basePrice = isWeekend ? 365 : 339;
  } else if (packageId === 'nerf-war') {
      basePrice = isWeekend ? 515 : 489;
  } else if (packageId === 'supercharged') {
      basePrice = isWeekend ? 465 : 440;
  } else if (packageId === 'levelup') {
      basePrice = isWeekend ? 340 : 329;
  } else if (packageId === 'pressplay') {
      basePrice = 180;
  } else if (packageId === 'standard-karaoke') {
      basePrice = isWeekend ? 300 : 250;
  } else if (packageId === 'themed-karaoke') {
      basePrice = isWeekend ? 475 : 425;
  } else if (isPerPerson) {
      const match = packageData.priceDisplay.match(/\$(\d+)/);
      const pricePerPerson = match ? parseInt(match[1]) : 0;
      basePrice = pricePerPerson * guestCount;
  } else if (packageData.priceDisplay.includes('$')) {
      const match = packageData.priceDisplay.match(/\$(\d+)/);
      if (match) basePrice = parseInt(match[1]);
  }

  const extraGuests = Math.max(0, guestCount - guestsIncluded);
  const additionalCost = extraGuests * extraGuestPrice;
  
  // Upsells
  const cashCardsTotal = cashCardCount * cashCardPrice;

  // Subtotal (Package + Extra Guests + Cash Cards)
  const subtotal = basePrice + additionalCost + cashCardsTotal;

  // Fees
  const serviceCharge = subtotal * 0.20;
  const processingFee = subtotal * 0.03;
  const tax = subtotal * 0.06;

  // Grand Total
  const total = subtotal + serviceCharge + processingFee + tax;

  const handleCheckout = () => {
    const items = [
      {
        name: `${packageData.title} (${guestCount} Guests)`,
        price: basePrice + additionalCost, // Item price without cash cards for this line
        quantity: 1
      }
    ];

    if (cashCardCount > 0) {
      items.push({
        name: `$${cashCardValue} Cash Card (Promo)`,
        price: cashCardPrice,
        quantity: cashCardCount
      });
    }



    onCheckout({
      title: packageData.title,
      date: format(date, 'EEE, MMM d, yyyy'),
      time: time,
      guests: guestCount,
      basePrice,
      additionalCost,
      subtotal,
      serviceCharge,
      processingFee,
      tax,
      cashCardsTotal,
      total,
      items
    });
  };

  return (
    <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 max-w-6xl flex flex-col min-h-screen text-white">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 md:mb-12">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-white/80 hover:text-[#71D2EB] transition-colors"
        >
          <div className="p-2 rounded-full border border-white/20 group-hover:border-[#71D2EB] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="font-montserrat font-bold tracking-wide text-sm uppercase">Back</span>
        </button>
        
        <div className="text-right hidden md:block">
          <p className="font-montserrat font-bold text-[#71D2EB] uppercase tracking-widest text-xs">Step 4 of 4</p>
          <p className="font-montserrat font-light text-white/60 text-sm">Review & Book</p>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Package Details */}
        <div className="lg:w-2/3 space-y-8">
          <div>
            <h1 className="font-montserrat font-black text-3xl md:text-4xl tracking-wide uppercase mb-2">
              {packageData.title}
            </h1>
            <p className="text-white/60 text-lg">{categoryData?.subtitle}</p>
          </div>

          {/* Package Image */}
          {packageData.image && (
            <div className="w-full h-64 md:h-80 rounded-[32px] overflow-hidden border border-white/10 shadow-2xl relative group">
               <ImageWithFallback 
                 src={packageData.image} 
                 alt={packageData.title} 
                 className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#041C2C]/60 to-transparent" />
            </div>
          )}

          {/* Guest Count Read-Only */}
          <div className="bg-white/5 rounded-[32px] border border-white/10 p-8 backdrop-blur-sm">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="font-montserrat font-bold text-xl text-[#71D2EB] uppercase tracking-wider mb-2">Guest Count</h3>
                <p className="text-white/60 text-sm">
                    {guestsIncluded} guests included.{extraGuestPrice > 0 && ` $${extraGuestPrice} per extra guest.`}
                </p>
              </div>
              <div className="flex flex-col items-end">
                 <div className="flex items-center gap-3 bg-[#041C2C] px-6 py-3 rounded-2xl border border-white/20">
                    <Users className="w-5 h-5 text-[#71D2EB]" />
                    <span className="font-mono text-2xl font-bold text-white">{guestCount}</span>
                 </div>
                 <button 
                    onClick={onBack}
                    className="mt-2 text-xs text-[#71D2EB] hover:text-white underline decoration-dotted underline-offset-4 transition-colors"
                 >
                    Edit Guests
                 </button>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-4 border-t border-white/10 pt-6">
                 <div className="flex justify-between items-center">
                    <span className="text-white/80">Base Package ({guestsIncluded} Guests)</span>
                    <span className="font-mono">${basePrice.toFixed(2)}</span>
                 </div>
                 {extraGuests > 0 && (
                     <div className="flex justify-between items-center text-[#71D2EB]">
                        <span>Extra Guests ({extraGuests} × ${extraGuestPrice})</span>
                        <span className="font-mono">+${additionalCost.toFixed(2)}</span>
                     </div>
                 )}
                 <div className="flex justify-between items-center pt-2 border-t border-white/5 font-bold">
                    <span>Subtotal (Package)</span>
                    <span className="font-mono">${(basePrice + additionalCost).toFixed(2)}</span>
                 </div>
            </div>
          </div>

          {/* Special Offer: Cash Cards - Only for Bowling Packages */}
          {partyCategory === 'bowling' && (
          <div className="relative overflow-hidden bg-gradient-to-br from-[#71D2EB]/20 to-[#041C2C] rounded-[32px] border border-[#71D2EB]/30 p-8">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#71D2EB] blur-[80px] opacity-20" />
             
             <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                <div className="p-4 bg-[#71D2EB] rounded-2xl shadow-lg shadow-[#71D2EB]/20 shrink-0">
                    <Ticket className="w-8 h-8 text-[#041C2C]" />
                </div>
                
                <div className="flex-1 text-center md:text-left">
                    <div className="inline-block px-3 py-1 rounded-full bg-[#71D2EB] text-[#041C2C] text-[10px] font-black uppercase tracking-widest mb-2">
                        Special Offer
                    </div>
                    <h3 className="font-montserrat font-black text-xl uppercase italic mb-1">
                        Add ${cashCardValue} Cash Cards
                    </h3>
                    <p className="text-white/80 text-sm">
                        Get a <strong>${cashCardValue} value card</strong> for just <strong>${cashCardPrice}</strong>! 
                        Perfect for arcade games.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-[#041C2C]/80 p-2 rounded-full border border-[#71D2EB]/30 backdrop-blur-sm">
                    <button 
                        onClick={() => setCashCardCount(Math.max(0, cashCardCount - 1))}
                        className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#71D2EB] hover:text-[#041C2C] flex items-center justify-center transition-colors disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:text-white"
                        disabled={cashCardCount === 0}
                    >
                        <Minus className="w-5 h-5" />
                    </button>
                    <span className="font-mono text-xl font-bold w-8 text-center">{cashCardCount}</span>
                    <button 
                        onClick={() => setCashCardCount(cashCardCount + 1)}
                        className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#71D2EB] hover:text-[#041C2C] flex items-center justify-center transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
             </div>
          </div>
          )}

          {/* Package Includes */}
          <div className="bg-[#041C2C]/50 rounded-[32px] border border-white/10 p-8">
             <h3 className="font-montserrat font-bold text-lg uppercase tracking-wider mb-6">Included in Package</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {packageData.includes.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-[#71D2EB]/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[#71D2EB]" />
                  </div>
                  <span className="text-white/80 text-sm leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Summary */}
        <div className="lg:w-1/3">
            <div className="sticky top-8 bg-[#71D2EB]/10 border border-[#71D2EB]/20 backdrop-blur-xl rounded-[32px] p-6 md:p-8">
                <h3 className="font-montserrat font-bold text-lg uppercase tracking-wider mb-6 border-b border-[#71D2EB]/20 pb-4">Booking Summary</h3>
                
                <div className="space-y-6 mb-8">
                    <div>
                        <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Date & Time</p>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#71D2EB]" />
                            <span className="font-bold">{format(date, 'EEE, MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4 text-[#71D2EB]" />
                            <span className="font-bold">{time}</span>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Guests</p>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#71D2EB]" />
                            <span className="font-bold">{guestCount} People</span>
                        </div>
                    </div>
                </div>

                {/* Detailed Cost Breakdown */}
                <div className="space-y-3 py-6 border-t border-[#71D2EB]/20">
                    {/* Show Cash Cards here so user understands they are in subtotal */}
                    {cashCardsTotal > 0 && (
                        <div className="flex justify-between items-center text-sm text-[#71D2EB]">
                            <span>Cash Cards ({cashCardCount})</span>
                            <span className="font-mono">${cashCardsTotal.toFixed(2)}</span>
                        </div>
                    )}
                    
                    <div className="flex justify-between items-center text-sm font-bold pb-2 mb-2 border-b border-white/10">
                        <span className="text-white/80">Subtotal</span>
                        <span className="font-mono">${subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <span className="text-white/60">Service Charge (20%)</span>
                        <span className="font-mono">${serviceCharge.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-white/60">Processing Fee (3%)</span>
                        <span className="font-mono">${processingFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-white/60">Sales Tax (6%)</span>
                        <span className="font-mono">${tax.toFixed(2)}</span>
                    </div>
                </div>

                <div className="flex justify-between items-end mb-2 pt-4 border-t border-[#71D2EB]/20">
                    <span className="text-sm uppercase tracking-widest font-bold">Total</span>
                    <span className="text-3xl font-black font-mono text-[#71D2EB]">${total.toFixed(2)}</span>
                </div>

                <button 
                    onClick={handleCheckout}
                    className="w-full bg-[#71D2EB] hover:bg-[#5dbcd3] text-[#041C2C] font-black py-4 rounded-xl uppercase tracking-[0.15em] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(113,210,235,0.3)] mt-6"
                >
                    Proceed to Checkout
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
