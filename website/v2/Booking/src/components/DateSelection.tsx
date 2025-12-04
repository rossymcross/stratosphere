import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Loader2, Plus, Minus } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { cn } from './ui/utils';

interface DateSelectionProps {
  onBack: () => void;
  onNext: (date: Date, time: string, guestCount: number) => void;
  pageNumber?: string;
  initialGuestCount?: number;
  minGuests?: number;
  maxGuests?: number;
  laneCapacity?: number;
}

export const DateSelection = ({ 
  onBack, 
  onNext, 
  pageNumber = "05",
  initialGuestCount = 4,
  minGuests = 1,
  maxGuests,
  laneCapacity
}: DateSelectionProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState(initialGuestCount);
  const [isLoading, setIsLoading] = useState(false);
  const [unavailableSlots, setUnavailableSlots] = useState<string[]>([]);

  // Mock time slots
  const timeSlots = [
    "17:00", "17:30", "18:00", "18:30",
    "19:00", "19:30", "20:00", "20:30",
    "21:00", "21:30", "22:00", "22:30"
  ];

  const handleIncrement = () => {
    const limit = maxGuests || 15;
    if (guestCount < limit) setGuestCount(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (guestCount > minGuests) setGuestCount(prev => prev - 1);
  };

  // Effect to simulate checking availability when date OR guest count changes
  useEffect(() => {
    if (date) {
      setIsLoading(true);
      setSelectedTime(null); // Reset time selection on date change
      
      const timer = setTimeout(() => {
        setIsLoading(false);
        // Randomly disable slots to simulate availability
        const shuffled = [...timeSlots].sort(() => 0.5 - Math.random());
        const count = Math.floor(Math.random() * 3) + 2; // 2 to 4 slots unavailable
        setUnavailableSlots(shuffled.slice(0, count));
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [date, guestCount]);

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
          <p className="font-montserrat font-bold text-[#71D2EB] uppercase tracking-widest text-xs">Step 3 of 4</p>
          <p className="font-montserrat font-light text-white/60 text-sm">Details</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8 h-full">
        
        {/* Left Column: Title, Context & Guest Count */}
        <div className="lg:w-1/3 flex flex-col gap-8">
          <div>
            <h1 className="font-montserrat font-black text-4xl md:text-5xl tracking-[0.1em] uppercase leading-tight mb-4">
              When are <br/>
              <span className="text-[#71D2EB]">you visiting?</span>
            </h1>
            <p className="font-montserrat font-light text-white/80 leading-relaxed">
              Select a date and time for your reservation. We'll have everything ready for your arrival.
            </p>
          </div>

          {/* Guest Count Picker */}
          <div className="p-6 rounded-[24px] bg-[#71D2EB]/10 border border-[#71D2EB]/20 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-2 h-2 rounded-full bg-[#71D2EB] animate-pulse" />
               <p className="font-montserrat font-bold text-[#71D2EB] uppercase text-sm tracking-widest">Group Size</p>
            </div>

            <div className="flex items-center justify-between bg-[#041C2C]/50 rounded-2xl p-2 border border-white/10">
                <button 
                    onClick={handleDecrement}
                    disabled={guestCount <= minGuests}
                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-[#71D2EB]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <Minus className="w-5 h-5 text-white group-hover:text-[#71D2EB]" />
                </button>

                <div className="flex flex-col items-center">
                    <span className="font-montserrat font-black text-3xl text-white leading-none">{guestCount}</span>
                    <span className="font-montserrat text-[10px] text-[#71D2EB] uppercase tracking-wider">Guests</span>
                </div>

                <button 
                    onClick={handleIncrement}
                    disabled={guestCount >= (maxGuests || 15)}
                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-[#71D2EB]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <Plus className="w-5 h-5 text-white group-hover:text-[#71D2EB]" />
                </button>
            </div>
            
            {/* Lane Capacity Info */}
            {laneCapacity && (
                <div className="mt-3 p-3 rounded-xl bg-[#71D2EB]/10 border border-[#71D2EB]/20 text-[#71D2EB] text-center">
                    <div className="text-xs font-bold uppercase tracking-wide">
                        Reserving {Math.ceil(guestCount / laneCapacity)} Lane{Math.ceil(guestCount / laneCapacity) > 1 ? 's' : ''}
                    </div>
                    <div className="text-[10px] opacity-70 font-medium mt-0.5">
                        ({laneCapacity} guests per lane)
                    </div>
                </div>
            )}

            <p className="text-center mt-3 text-[10px] text-white/40 font-montserrat uppercase tracking-wider">
                For groups 16+, please use the <br/> Large Group Inquiry form.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Selection Panel */}
        <div className="lg:w-2/3 flex flex-col gap-6">
          
          <div className="flex flex-col md:flex-row gap-6 h-full">
            {/* Calendar Panel */}
            <div className="flex-1 p-6 md:p-8 rounded-[32px] bg-[#041C2C]/70 backdrop-blur-2xl border border-white/20 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <CalendarIcon className="w-5 h-5 text-[#71D2EB]" />
                <h3 className="font-montserrat font-bold text-lg uppercase tracking-wider">Select Date</h3>
              </div>
              
              <div className="flex justify-center w-full">
                 <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="p-0 w-full"
                  classNames={{
                    head_cell: "text-white/40 font-normal text-xs uppercase tracking-wider w-9 h-9",
                    cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                    day: cn(
                      "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-white/10 rounded-full transition-colors text-white"
                    ),
                    day_selected: "bg-[#71D2EB] text-[#041C2C] hover:bg-[#71D2EB] hover:text-[#041C2C] font-bold shadow-[0_0_15px_rgba(113,210,235,0.5)]",
                    day_today: "bg-white/5 text-[#71D2EB] font-bold border border-[#71D2EB]/30",
                    caption_label: "text-white font-bold font-montserrat uppercase tracking-widest text-sm",
                    nav_button: "border-white/20 text-white hover:bg-white/10 hover:text-white",
                  }}
                />
              </div>
            </div>

            {/* Time Slots Panel */}
            <div className="flex-1 p-6 md:p-8 rounded-[32px] bg-[#041C2C]/70 backdrop-blur-2xl border border-white/20 shadow-2xl flex flex-col relative min-h-[400px] md:min-h-0">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-5 h-5 text-[#71D2EB]" />
                <h3 className="font-montserrat font-bold text-lg uppercase tracking-wider">Select Time</h3>
              </div>

              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-white/40">
                  <Loader2 className="w-8 h-8 animate-spin text-[#71D2EB]" />
                  <p className="text-sm font-montserrat tracking-wide uppercase">Checking Availability...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2 max-h-[320px] custom-scrollbar">
                  {timeSlots.map((time) => {
                    const isUnavailable = unavailableSlots.includes(time);
                    return (
                      <button
                        key={time}
                        onClick={() => !isUnavailable && setSelectedTime(time)}
                        disabled={isUnavailable}
                        className={cn(
                          "py-3 px-4 rounded-xl border text-sm font-montserrat font-bold transition-all duration-300",
                          isUnavailable 
                            ? "bg-white/5 border-transparent text-white/20 cursor-not-allowed decoration-white/20"
                            : selectedTime === time
                              ? "bg-[#71D2EB] border-[#71D2EB] text-[#041C2C] shadow-[0_0_15px_rgba(113,210,235,0.4)] scale-105"
                              : "bg-white/5 border-white/10 text-white/80 hover:border-[#71D2EB]/50 hover:bg-[#041C2C]/80 hover:text-white"
                        )}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex justify-end pt-4">
            <button
              onClick={() => date && selectedTime && onNext(date, selectedTime, guestCount)}
              disabled={!date || !selectedTime}
              className={cn(
                "px-10 py-4 rounded-full font-montserrat font-bold text-sm uppercase tracking-widest transition-all duration-300",
                date && selectedTime
                  ? "bg-[#71D2EB] text-[#041C2C] shadow-[0_0_20px_rgba(113,210,235,0.4)] hover:scale-105 hover:shadow-[0_0_30px_rgba(113,210,235,0.6)]"
                  : "bg-white/10 text-white/20 cursor-not-allowed border border-white/5"
              )}
            >
              Continue to Details
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
