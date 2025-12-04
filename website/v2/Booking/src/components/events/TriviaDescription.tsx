import React, { useState } from 'react';
import { cn } from '../ui/utils';

export const TriviaDescription = () => {
  const [activeTab, setActiveTab] = useState<'about' | 'themes'>('about');

  return (
    <div>
      <div className="flex gap-6 mb-6 border-b border-white/10">
        <button 
            onClick={() => setActiveTab('about')}
            className={cn(
                "pb-3 text-sm md:text-base uppercase font-bold tracking-wider transition-all relative",
                activeTab === 'about' ? "text-[#71D2EB]" : "text-white/50 hover:text-white"
            )}
        >
            About
            {activeTab === 'about' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#71D2EB] shadow-[0_0_10px_rgba(113,210,235,0.5)]" />
            )}
        </button>
        <button 
            onClick={() => setActiveTab('themes')}
            className={cn(
                "pb-3 text-sm md:text-base uppercase font-bold tracking-wider transition-all relative",
                activeTab === 'themes' ? "text-[#71D2EB]" : "text-white/50 hover:text-white"
            )}
        >
            Theme Nights & Tournaments
             {activeTab === 'themes' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#71D2EB] shadow-[0_0_10px_rgba(113,210,235,0.5)]" />
            )}
        </button>
      </div>

      {activeTab === 'about' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <h4 className="font-bold text-xl text-[#71D2EB] mb-4">Who's ready to put their knowledge to the test?</h4>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-6 text-white/90 font-medium">
                <div className="flex items-center gap-2">
                    <span className="text-[#71D2EB] font-bold text-xl">•</span> 
                    <span>Up to 8 people per team</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[#71D2EB] font-bold text-xl">•</span> 
                    <span>FREE to play!</span>
                </div>
            </div>

            <p className="mb-6">
            Form a team with family or friends and join us every Thursday for some interactive trivia FUN! Not good at trivia? WHO CARES! We’re all here to eat, drink, and have a good time!</p>

            <p className="mb-8">Come early to grab a table and enjoy our Happy Hour specials from 3 PM – 6 PM. All tables are first-come, first-served.</p>
            
             <div>
              <h5 className="font-bold text-[#71D2EB] uppercase tracking-wider mb-2">UPCOMING THEME NIGHTS</h5>
              <p className="text-white/90">Ugly Sweater Holiday Trivia: Thursday, December 18th</p>
            </div>
          </div>
      )}

      {activeTab === 'themes' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-[#71D2EB]/10 to-transparent border-l-4 border-[#71D2EB]">
              <h4 className="font-black text-2xl md:text-3xl text-[#71D2EB] uppercase tracking-wider mb-4 drop-shadow-lg">
                Trivia Theme Nights & Tournaments
              </h4>
              
              <div className="space-y-8">
                <div>
                  <h5 className="font-bold text-xl text-white uppercase mb-2">6-Week Tournaments</h5>
                  <p className="text-white/90 mb-4">
                    Does your team have what it takes to be crowned the Stratosphere Trivia Tournament Champions?! The team with the highest score after 6 weeks will be crowned the winners! We also award prizes to all of the teams that have perfect attendance for all 6 weeks. You do not have to attend all 6 weeks to compete, but the more you attend, the better chance you have at winning!
                  </p>
                </div>

                <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                  <p className="font-bold text-[#71D2EB] uppercase tracking-wide mb-1">Tournament Prize</p>
                  <p className="text-white font-medium">$100 Stratosphere Social gift card for your team plus a special edition Stratosphere Trivia Trophy!</p>
                </div>
                
                <p className="italic text-white/60 text-sm">There will also be weekly winners during the tournament.</p>

                <div>
                  <h5 className="font-bold text-[#71D2EB] uppercase tracking-wider mb-2">FINAL COUNTDOWN TRIVIA TOURNAMENT</h5>
                  <p className="text-white/90">Wednesday, November 26th - January 1st<br/>
                  Every Thursday @ 7 PM<br/>
                  <span className="text-sm text-white/60">(The first night will be on Wednesday because we will be closed on Thanksgiving Day)</span></p>
                </div>
              </div>
            </div>
        </div>
      )}
    </div>
  );
};
