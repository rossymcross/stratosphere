import React from 'react';
import { ArrowLeft, Check, Users, Sparkles, Star } from 'lucide-react';
import { PARTY_PACKAGES_DATA, PartyCategory } from './partyData';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { cn } from './ui/utils';

interface PartyPackageSelectionProps {
  category: PartyCategory;
  onBack: () => void;
  onSelectPackage: (packageId: string) => void;
}

const highlightText = (text: string, highlights: string[], colorClass: string) => {
  let parts = [text];

  highlights.forEach(term => {
    const newParts: any[] = [];
    parts.forEach(part => {
      if (typeof part === 'string') {
        const split = part.split(new RegExp(`(${term})`, 'g'));
        split.forEach(s => {
          if (s === term) {
            newParts.push(<span key={s} className={colorClass}>{s}</span>);
          } else if (s) {
            newParts.push(s);
          }
        });
      } else {
        newParts.push(part);
      }
    });
    parts = newParts;
  });

  return parts;
};

export const PartyPackageSelection = ({ category, onBack, onSelectPackage }: PartyPackageSelectionProps) => {
  const data = PARTY_PACKAGES_DATA[category];

  if (!data) return <div>Invalid category</div>;

  return (
    <div className="relative z-10 container mx-auto px-4 py-12 md:py-24 max-w-7xl flex flex-col min-h-screen text-white">
      
      {/* Header */}
      <header className="w-full mb-12 relative flex flex-col gap-8 items-start max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-white/80 hover:text-[#71D2EB] transition-colors"
        >
          <div className="p-2 rounded-full border border-white/20 group-hover:border-[#71D2EB] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="font-montserrat font-bold tracking-wide text-sm uppercase">Back</span>
        </button>

        <div className="text-left">
          <h1 className="font-montserrat font-black text-3xl md:text-5xl tracking-[0.1em] uppercase mb-3 leading-tight">
            {data.title}
          </h1>
          <p className="font-montserrat font-light text-base md:text-lg text-white/80 leading-relaxed max-w-2xl">
            {data.subtitle}
          </p>
        </div>
      </header>

      {/* Packages Grid */}
      <div className={cn(
        "grid gap-8 w-full mx-auto",
        data.packages.length === 1 
          ? "grid-cols-1 max-w-3xl" 
          : data.packages.length === 2 
            ? "grid-cols-1 md:grid-cols-2 max-w-4xl justify-center" 
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl"
      )}>
        {data.packages.map((pkg) => {
          const isStrike = pkg.id === 'strike';
          const isSpare = pkg.id === 'spare';
          const isSplit = pkg.id === 'split';
          
          return (
            <div 
              key={pkg.id}
              className={cn(
                "flex flex-col bg-[#041C2C]/60 backdrop-blur-xl border rounded-[32px] overflow-hidden transition-all duration-300 group relative",
                isStrike 
                  ? "border-[#FFD700]/50 shadow-[0_0_40px_rgba(255,215,0,0.15)] scale-[1.02] z-10" 
                  : isSpare
                    ? "border-[#E2E8F0]/50 shadow-[0_0_30px_rgba(226,232,240,0.1)] scale-[1.01] z-0"
                    : isSplit
                      ? "border-[#CD7F32]/50 hover:border-[#CD7F32] hover:shadow-[0_20px_50px_rgba(205,127,50,0.15)]"
                      : "border-white/10 hover:border-[#71D2EB]/50 hover:shadow-[0_20px_50px_rgba(113,210,235,0.15)]"
              )}
            >
              {isStrike && (
                <div className="absolute top-4 right-4 z-20 bg-[#FFD700] text-[#041C2C] px-3 py-1 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-lg">
                  <Star className="w-3 h-3 fill-current" />
                  Best Value
                </div>
              )}

              {isSpare && (
                <div className="absolute top-4 right-4 z-20 bg-[#E2E8F0] text-[#041C2C] px-3 py-1 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-lg">
                  <Sparkles className="w-3 h-3 fill-current" />
                  Most Popular
                </div>
              )}

              {/* Hero Image (if available) */}
              {pkg.image && (
                <div className="relative w-full h-48 overflow-hidden shrink-0">
                  <ImageWithFallback
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-t",
                    isStrike 
                      ? "from-[#041C2C]/90 via-transparent to-[#FFD700]/10" 
                      : isSpare
                        ? "from-[#041C2C]/90 via-transparent to-[#E2E8F0]/10"
                        : isSplit
                          ? "from-[#041C2C]/90 via-transparent to-[#CD7F32]/10"
                          : "from-[#041C2C]/80 to-transparent"
                  )} />
                </div>
              )}

              <div className="flex flex-col p-8 flex-grow">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={cn(
                      "font-montserrat font-black text-2xl uppercase tracking-wide leading-tight",
                      isStrike ? "text-[#FFD700]" : 
                      isSpare ? "text-[#E2E8F0]" : 
                      isSplit ? "text-[#CD7F32]" : 
                      "text-white"
                    )}>
                      {pkg.title}
                    </h3>
                    {pkg.ageRestriction && (
                      <span className="px-3 py-1 rounded-full bg-orange-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg">
                        {pkg.ageRestriction}
                      </span>
                    )}
                  </div>
                  <p className={cn(
                    "font-montserrat font-bold text-lg",
                    isStrike ? "text-white" : 
                    isSpare ? "text-white" : 
                    "text-[#71D2EB]"
                  )}>
                    {pkg.priceDisplay}
                  </p>

                  {/* Value callout for Strike */}
                  {isStrike && (
                    <div className="mt-3 px-4 py-2 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg">
                      <p className="text-[#FFD700] font-black text-sm uppercase tracking-wide">
                        $890 Worth of Value!
                      </p>
                    </div>
                  )}
                  
                  {/* Guests Info */}
                  {(pkg.guestsIncluded || pkg.minGuests) && (
                     <div className="flex items-center gap-2 mt-3 text-white/60 text-sm font-medium">
                       <Users className="w-4 h-4" />
                       <span>
                         {pkg.guestsIncluded ? `${pkg.guestsIncluded} guests included` : `${pkg.minGuests} guests minimum`}
                       </span>
                     </div>
                  )}

                </div>

                {/* Includes List */}
                <div className="flex-grow mb-8">
                  <p className="font-montserrat font-bold text-xs text-white/40 uppercase tracking-widest mb-4">Package Includes</p>
                  <ul className="space-y-3">
                    {pkg.includes.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-white/80 leading-relaxed">
                        <div className={cn(
                          "mt-1 w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                          "bg-[#71D2EB]/20 text-[#71D2EB]"
                        )}>
                          <Check className="w-2.5 h-2.5" strokeWidth={2} />
                        </div>
                        <span>
                          {isStrike 
                            ? highlightText(item, ['90-minute', 'Unlimited', '500'], 'text-[#FFD700] font-black text-base') 
                            : isSpare 
                              ? highlightText(item, ['60-minute', '1 game', '250'], 'text-[#E2E8F0] font-black text-base')
                              : item
                          }
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <button
                  onClick={() => onSelectPackage(pkg.id)}
                  className={cn(
                    "w-full py-4 rounded-full font-black text-sm uppercase tracking-[0.15em] transition-all shadow-lg",
                    isStrike 
                      ? "bg-[#FFD700] hover:bg-[#E6C200] text-[#041C2C] hover:shadow-[#FFD700]/40 hover:scale-[1.02]" 
                      : isSpare
                        ? "bg-[#E2E8F0] hover:bg-white text-[#041C2C] hover:shadow-[#E2E8F0]/40 hover:scale-[1.02]"
                        : isSplit
                          ? "bg-transparent border border-[#CD7F32] text-[#CD7F32] hover:bg-[#CD7F32] hover:text-[#041C2C]"
                          : "bg-transparent border border-[#71D2EB] text-[#71D2EB] hover:bg-[#71D2EB] hover:text-[#041C2C]"
                  )}
                >
                  Select Package
                </button>
              </div>
            </div>
          );
        })}
      </div>


    </div>
  );
};
