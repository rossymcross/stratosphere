import React from 'react';
import { ArrowLeft, ArrowRight, Calendar, Tag } from 'lucide-react';
import { EVENTS, Event } from './eventsData';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { cn } from '../ui/utils';

interface EventsListProps {
  onBack: () => void;
  onSelectEvent: (eventId: string) => void;
}

export const EventsList = ({ onBack, onSelectEvent }: EventsListProps) => {
  return (
    <div className="relative z-10 container mx-auto px-4 py-12 md:py-24 max-w-7xl flex flex-col min-h-screen text-white">
      
      {/* Header */}
      <header className="w-full max-w-5xl mx-auto mb-12 relative flex flex-col gap-8 items-start">
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
            Upcoming <span className="text-[#71D2EB]">Events</span>
          </h1>
          <p className="font-montserrat font-light text-base md:text-lg text-white/80 leading-relaxed max-w-2xl">
            Special experiences you won't want to miss
          </p>
        </div>
      </header>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
        {EVENTS.map((event) => (
          <EventCard 
            key={event.id} 
            event={event} 
            onClick={() => onSelectEvent(event.id)} 
          />
        ))}
      </div>


    </div>
  );
};

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

const EventCard = ({ event, onClick }: EventCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col w-full rounded-[24px] overflow-hidden text-left transition-all duration-500",
        "border border-white/10 shadow-lg bg-[#041C2C]/60 backdrop-blur-xl",
        "hover:shadow-[inset_0_0_0_2px_#66E0F8,0_0_30px_-5px_#66E0F8] hover:-translate-y-2"
      )}
    >
      {/* Image Container - 16:9 Aspect Ratio */}
      <div className="relative w-full aspect-video overflow-hidden">
        <ImageWithFallback
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#041C2C] to-transparent opacity-60" />
        
        {/* Price Badge */}
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#71D2EB] text-[#041C2C] font-bold text-xs uppercase tracking-wider shadow-lg">
          {event.priceDisplay}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col p-6 flex-grow w-full">
        <div className="mb-4">
          <h3 className="font-montserrat font-bold text-xl text-white uppercase tracking-wide mb-2 leading-tight group-hover:text-[#71D2EB] transition-colors">
            {event.title}
          </h3>
          <div className="flex items-center gap-2 text-white/60 text-xs font-medium uppercase tracking-wider mb-3">
            <Calendar className="w-3 h-3" />
            {event.date}
          </div>
          <p className="font-montserrat font-light text-sm text-white/80 line-clamp-2 leading-relaxed">
            {event.shortDescription}
          </p>
        </div>

        <div className="mt-auto pt-4 border-t border-white/10 w-full flex items-center justify-between text-[#71D2EB]">
          <span className="font-bold text-xs tracking-[0.15em] uppercase">View Details</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </button>
  );
};
