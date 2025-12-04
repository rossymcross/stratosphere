import React from 'react';
import { CheckCircle2, Home } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';

interface LargeGroupConfirmationProps {
  onHome: () => void;
}

export const LargeGroupConfirmation = ({ onHome }: LargeGroupConfirmationProps) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-[#041C2C]/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-16 max-w-2xl w-full shadow-[0_0_50px_rgba(113,210,235,0.15)] flex flex-col items-center gap-8"
      >
        <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(74,222,128,0.3)]">
          <CheckCircle2 className="w-12 h-12 text-green-400" />
        </div>

        <div>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white uppercase tracking-wider mb-6">
            Request <span className="text-green-400">Received!</span>
          </h1>
          <p className="font-montserrat text-white/80 text-lg leading-relaxed max-w-md mx-auto">
            Thank you for contacting us. Our events team will review your request and get back to you within 24 hours.
          </p>
        </div>

        <Button 
          onClick={onHome}
          className="mt-4 h-14 px-12 text-lg font-bold tracking-wider uppercase rounded-full bg-[#71D2EB] text-[#041C2C] hover:bg-white hover:text-[#041C2C] transition-all duration-300 shadow-[0_0_20px_rgba(113,210,235,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:-translate-y-1"
        >
          <span className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            Return to Home
          </span>
        </Button>
      </motion.div>

      {/* Page Number */}
      <div className="absolute bottom-8 left-8 z-20 text-white/10 font-black text-6xl md:text-8xl pointer-events-none select-none font-montserrat">
        03
      </div>
    </div>
  );
};
