import React from 'react';
import { BookingCard } from './BookingCard';

interface GroupSizeSelectionProps {
  onSelect: (size: 'small' | 'large') => void;
}

export const GroupSizeSelection = ({ onSelect }: GroupSizeSelectionProps) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white selection:bg-[#66E0F8] selection:text-[#1A2B33]">
      {/* Main Content Container */}
      <div className="relative z-10 container mx-auto px-4 py-12 md:py-24 max-w-4xl flex flex-col items-center justify-center min-h-screen">
        
        {/* Header Section */}
        <header className="text-center mb-12 md:mb-16 max-w-2xl mx-auto">
          <h1 className="font-montserrat font-black text-4xl md:text-6xl tracking-[0.2em] uppercase mb-6 leading-tight">
            Planning a <span className="text-[#66E0F8]">Visit?</span>
          </h1>
          <p className="font-montserrat font-light text-lg md:text-xl text-white/80 leading-relaxed max-w-xl mx-auto">
            Tell us about your group size so we can direct you to the right experience.
          </p>
        </header>

        {/* Cards Grid */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center w-full">
          <div onClick={() => onSelect('small')}>
            <BookingCard
              icon="user"
              headline="1 - 15 Guests"
              subHeadline="Instant Booking"
              bodyText="Perfect for date nights, small family outings, or hanging out with friends. Reserve lanes, tables, or axe throwing bays immediately."
            />
          </div>
          
          <div onClick={() => onSelect('large')}>
            <BookingCard
              icon="users"
              headline="16+ Guests"
              subHeadline="Event Planning"
              bodyText="Ideal for corporate events, birthday bashes, and large celebrations. Get access to dedicated event hosts, custom catering packages, and exclusive area rentals."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
