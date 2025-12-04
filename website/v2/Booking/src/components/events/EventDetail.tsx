import React, { useState, useMemo, useRef } from 'react';
import { ArrowLeft, Minus, Plus, Calendar, Clock, MapPin, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { EVENTS } from './eventsData';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { cn } from '../ui/utils';

interface EventDetailProps {
  eventId: string;
  onBack: () => void;
  onCheckout: (data: any) => void;
}

// Gallery Carousel Component
const GalleryCarousel = ({ images, title }: { images: string[]; title: string }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-montserrat font-bold text-xl text-white uppercase tracking-wide">
          {title}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={cn(
              "p-2 rounded-full border transition-all",
              canScrollLeft 
                ? "border-[#71D2EB] text-[#71D2EB] hover:bg-[#71D2EB] hover:text-[#041C2C]" 
                : "border-white/20 text-white/20 cursor-not-allowed"
            )}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={cn(
              "p-2 rounded-full border transition-all",
              canScrollRight 
                ? "border-[#71D2EB] text-[#71D2EB] hover:bg-[#71D2EB] hover:text-[#041C2C]" 
                : "border-white/20 text-white/20 cursor-not-allowed"
            )}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {images.map((img, idx) => (
          <div 
            key={idx} 
            className="relative flex-shrink-0 w-[280px] md:w-[320px] aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5 snap-start"
          >
            <ImageWithFallback 
              src={img} 
              alt={`Gallery image ${idx + 1}`}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
            />
          </div>
        ))}
      </div>
      
      {/* Image count indicator */}
      <div className="mt-4 text-center text-white/50 text-sm">
        {images.length} photos • Scroll or use arrows to browse
      </div>
    </div>
  );
};

export const EventDetail = ({ eventId, onBack, onCheckout }: EventDetailProps) => {
  const event = EVENTS.find(e => e.id === eventId);
  
  // State for quantities (optionId -> quantity)
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const totalPrice = useMemo(() => {
    if (!event?.options) return 0;
    return event.options.reduce((acc, option) => {
      return acc + (option.price * (quantities[option.id] || 0));
    }, 0);
  }, [event, quantities]);

  const totalItems = useMemo(() => {
    return Object.values(quantities).reduce((a, b) => a + b, 0);
  }, [quantities]);

  const updateQuantity = (optionId: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[optionId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [optionId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [optionId]: next };
    });
  };

  if (!event) return <div>Event not found</div>;

  return (
    <div className="relative z-10 min-h-screen w-full text-white flex flex-col">
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Boxed Hero Section */}
        <div className="relative w-full h-[400px] md:h-[500px] rounded-[32px] overflow-hidden mb-12 border border-white/10 shadow-2xl">
          <div className="absolute inset-0">
            <ImageWithFallback
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#041C2C]/30 via-transparent to-[#041C2C]" />
            <div className="absolute inset-0 bg-[#041C2C]/40" />
          </div>
          
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
            <button 
              onClick={onBack}
              className="absolute top-8 left-8 group flex items-center gap-2 text-white/80 hover:text-[#71D2EB] transition-colors bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 hover:border-[#71D2EB]/50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-montserrat font-bold text-xs uppercase tracking-wider">Back</span>
            </button>

            <div className="max-w-3xl">
              <div className="flex items-center gap-4 text-[#71D2EB] mb-4">
                <span className="px-3 py-1 rounded-full bg-[#71D2EB]/10 border border-[#71D2EB]/20 font-bold text-xs uppercase tracking-wider backdrop-blur-sm">
                  {event.type === 'table' ? 'Table Reservation' : event.type === 'ticket' ? 'Ticketed Event' : 'Special Event'}
                </span>
              </div>
              <h1 className="font-montserrat font-black text-4xl md:text-6xl tracking-[0.05em] uppercase leading-tight mb-2 drop-shadow-lg">
                {event.title}
              </h1>
              {event.subheading && (
                <p className="font-montserrat font-bold text-xl md:text-2xl text-[#71D2EB] uppercase tracking-widest mb-6 drop-shadow-md">
                  {event.subheading}
                </p>
              )}
              <div className="flex flex-wrap gap-6 text-sm font-medium text-white/90">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#71D2EB]" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#71D2EB]" />
                  <span>Stratosphere Main Hall</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Description */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div className="prose prose-invert max-w-none">
              <h3 className="font-montserrat font-bold text-2xl text-white uppercase tracking-wide mb-4">About the Event</h3>
              <div className="font-montserrat font-light text-lg text-white/80 leading-relaxed whitespace-pre-line">
                {event.longDescription}
              </div>
            </div>

            {/* Additional Info / Requirements */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <Info className="w-6 h-6 text-[#71D2EB] shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-sm mb-2">Important Information</h4>
                  <p className="text-sm text-white/70 leading-relaxed">
                    Please arrive 15 minutes prior to the event start time. All guests must be 21+ with valid ID.
                  </p>
                </div>
              </div>
            </div>

            {/* Gallery Carousel Section */}
            {event.galleryImages && event.galleryImages.length > 0 && (
              <GalleryCarousel 
                images={event.galleryImages} 
                title={event.galleryTitle || 'Photo Gallery'} 
              />
            )}
          </div>

          {/* Right Column: Booking Widget */}
          <div className="lg:col-span-5">
            <div className="sticky top-8 bg-[#041C2C]/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl">
              
              {event.type !== 'info' && (
                <>
                  <h3 className="font-montserrat font-bold text-xl text-white uppercase tracking-wide mb-6">
                    Select Options
                  </h3>

                  {/* Option Selection */}
                  {event.options && event.options.length > 0 && (
                    <div className="flex flex-col gap-4 mb-8">
                      {event.options.map((option) => {
                        const qty = quantities[option.id] || 0;
                        return (
                          <div
                            key={option.id}
                            className={cn(
                              "relative flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
                              qty > 0
                                ? "bg-[#71D2EB]/10 border-[#71D2EB] shadow-[0_0_20px_rgba(113,210,235,0.15)]"
                                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30"
                            )}
                          >
                            <div className="flex flex-col flex-1 pr-4">
                              <span className={cn(
                                "font-bold text-base uppercase tracking-wide mb-1",
                                qty > 0 ? "text-[#71D2EB]" : "text-white"
                              )}>
                                {option.label}
                              </span>
                              <span className="text-xs text-white/60 font-light whitespace-pre-line">
                                {option.description}
                              </span>
                            </div>
                            <div className="flex flex-col items-end gap-3 shrink-0">
                              <span className="font-bold text-lg text-white">
                                ${option.price}
                              </span>
                              
                              <div className="flex items-center gap-3 bg-black/20 rounded-full p-1 border border-white/10">
                                <button 
                                  onClick={() => updateQuantity(option.id, -1)}
                                  disabled={qty === 0}
                                  className="p-1 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-white"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-mono text-sm font-bold text-white w-4 text-center">
                                  {qty}
                                </span>
                                <button 
                                  onClick={() => updateQuantity(option.id, 1)}
                                  className="p-1 rounded-full hover:bg-white/10 transition-colors text-white"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Total & Action */}
                  <div className="pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-white/60 font-medium text-sm uppercase tracking-wider">Total</span>
                      <span className="text-3xl font-bold text-[#71D2EB]">
                        ${totalPrice}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => onCheckout({ eventId, quantities, total: totalPrice })}
                      disabled={event.isComingSoon || totalItems === 0}
                      className={cn(
                        "w-full py-4 rounded-full font-black text-base uppercase tracking-[0.15em] transition-all shadow-lg",
                        (event.isComingSoon || totalItems === 0)
                          ? "bg-white/10 text-white/50 cursor-not-allowed"
                          : "bg-[#71D2EB] hover:bg-[#5dbcd3] text-[#041C2C] hover:scale-[1.02] active:scale-[0.98] hover:shadow-[#71D2EB]/25"
                      )}
                    >
                      {event.buttonText || 'Get Tickets'}
                    </button>
                  </div>
                </>
              )}

              {event.type === 'info' && (
                <div className="flex flex-col items-center text-center py-8">
                  {event.isComingSoon ? (
                    <>
                      <p className="text-white/80 mb-6">
                        Ticket sales for this event will open soon.
                      </p>
                      <button
                        className="w-full py-4 rounded-full border border-[#71D2EB] text-[#71D2EB] hover:bg-[#71D2EB] hover:text-[#041C2C] font-bold text-sm uppercase tracking-widest transition-all"
                      >
                        Join Waitlist
                      </button>
                    </>
                  ) : (
                    <div className="w-full p-6 rounded-xl bg-[#71D2EB]/10 border border-[#71D2EB]/20">
                      <p className="font-bold text-[#71D2EB] mb-2 uppercase tracking-wider">Free Event</p>
                      <p className="text-white/80 text-sm">
                        No tickets or reservation required.
                        <br />
                        First come, first served.
                      </p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
