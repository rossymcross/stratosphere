import React from 'react';
import { ArrowLeft, Ticket, PartyPopper, Axe } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
// Intent selection images
import eventsImg from "../assets/intent/events.png";
import partyImg from "../assets/intent/party.png";
import axeImg from "../assets/intent/axe.png";

interface IntentSelectionProps {
  onBack: () => void;
  onSelect: (intent: string) => void;
}

export const IntentSelection = ({ onBack, onSelect }: IntentSelectionProps) => {
  return (
    <div className="relative z-10 container mx-auto px-4 py-12 md:py-24 max-w-7xl flex flex-col items-center justify-center min-h-screen text-white">
      
      <button 
        onClick={onBack}
        className="absolute left-4 top-6 md:left-8 md:top-12 z-20 group flex items-center gap-2 text-white/80 hover:text-[#71D2EB] transition-colors"
      >
        <div className="p-2 rounded-full border border-white/20 group-hover:border-[#71D2EB] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </div>
        <span className="hidden md:inline font-montserrat font-bold tracking-wide text-sm uppercase">Back</span>
      </button>

      {/* Header Section */}
      <header className="w-full max-w-4xl mx-auto mb-12 md:mb-16 relative">
        <div className="text-center mt-12 md:mt-0">
          <h1 className="font-montserrat font-black text-3xl md:text-5xl tracking-[0.15em] uppercase mb-4 leading-tight">
            What would you <br className="md:hidden" /><span className="text-[#71D2EB]">like to do?</span>
          </h1>
          <p className="font-montserrat font-light text-base md:text-lg text-white/80 leading-relaxed max-w-2xl mx-auto">
            Choose an option to continue
          </p>
        </div>
      </header>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        <GlassCard
          icon={<Ticket className="w-8 h-8" />}
          title="Special Events"
          buttonText="View Events"
          backgroundImage={eventsImg}
          onClick={() => onSelect('events')}
        />
        
        <GlassCard
          icon={<PartyPopper className="w-8 h-8" />}
          title="PARTY BOOKINGS"
          buttonText="Plan Party"
          backgroundImage={partyImg}
          onClick={() => onSelect('party')} className="text-[20px]"
        />

        <GlassCard
          icon={<Axe className="w-8 h-8" />}
          title="Axe Throwing"
          buttonText="Book Bay"
          backgroundImage={axeImg}
          onClick={() => onSelect('axe-throwing')}
        />
      </div>

    </div>
  );
};
