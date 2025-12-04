import React from 'react';
import { CheckCircle2, Home, Ticket, Mail, Download, CalendarCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';

interface TicketConfirmationProps {
  onHome: () => void;
  type?: 'ticket' | 'booking';
}

export const TicketConfirmation = ({ onHome, type = 'ticket' }: TicketConfirmationProps) => {
  const isTicket = type === 'ticket';

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-[#041C2C]/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-16 max-w-2xl w-full shadow-[0_0_50px_rgba(113,210,235,0.15)] flex flex-col items-center gap-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#71D2EB] to-transparent opacity-50" />

        <div className="relative">
             <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full" />
             <div className="relative w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(74,222,128,0.3)] border border-green-500/30">
                <CheckCircle2 className="w-12 h-12 text-green-400" />
            </div>
        </div>

        <div>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white uppercase tracking-wider mb-6">
            You're <span className="text-green-400">Confirmed!</span>
          </h1>
          <p className="font-montserrat text-white/80 text-lg leading-relaxed max-w-md mx-auto mb-2">
            {isTicket 
              ? "Your tickets have been successfully booked." 
              : "Your reservation has been successfully booked."}
          </p>
           <div className="flex items-center justify-center gap-2 text-[#71D2EB] bg-[#71D2EB]/10 py-2 px-4 rounded-full inline-flex border border-[#71D2EB]/20">
                <Mail className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-wide">Confirmation email sent</span>
           </div>
        </div>
        
        {/* Preview Card */}
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between gap-4 max-w-md mx-auto relative overflow-hidden group hover:bg-white/10 transition-colors cursor-pointer">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#71D2EB]" />
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#71D2EB]/20 rounded-xl flex items-center justify-center text-[#71D2EB]">
                    {isTicket ? <Ticket className="w-6 h-6" /> : <CalendarCheck className="w-6 h-6" />}
                </div>
                <div className="text-left">
                    <p className="font-bold text-white text-sm uppercase">
                        {isTicket ? "View Your Tickets" : "View Booking Details"}
                    </p>
                    <p className="text-white/50 text-xs">Order #STRAT-8829</p>
                </div>
            </div>
            <Download className="w-5 h-5 text-white/30 group-hover:text-white transition-colors" />
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full justify-center mt-4">
             <Button 
              onClick={onHome}
              className="h-14 px-8 text-lg font-bold tracking-wider uppercase rounded-full bg-[#71D2EB] text-[#041C2C] hover:bg-white hover:text-[#041C2C] transition-all duration-300 shadow-[0_0_20px_rgba(113,210,235,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:-translate-y-1"
            >
              <span className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Return to Home
              </span>
            </Button>
        </div>
       
      </motion.div>
    </div>
  );
};
