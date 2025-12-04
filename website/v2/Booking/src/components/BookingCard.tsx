import React from 'react';
import { motion } from 'motion/react';

interface BookingCardProps {
  headline: string;
  subHeadline: string;
  bodyText: string;
  icon: 'user' | 'users' | React.ReactNode;
  buttonText?: string;
  onClick?: () => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  headline,
  subHeadline,
  bodyText,
  icon,
  buttonText = 'Select',
  onClick,
}) => {
  // Reusable definition for the standard user shape
  const UserShape = (
    <g>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21" />
    </g>
  );

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      className={`
        relative flex flex-col justify-between p-8
        w-[340px] h-[420px] rounded-[24px]
        backdrop-blur-[40px] overflow-hidden
        font-sans
        
        /* Use shadow for border to prevent layout shift */
        shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]
        
        /* Hover effects managed via CSS for shadows/border */
        hover:shadow-[inset_0_0_0_2px_#66E0F8,0_0_30px_-5px_#66E0F8]
        
        group cursor-pointer
      `}
      style={{
        background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.1), rgba(0, 0, 0, 0.6))',
      }}
    >
      {/* Shimmer Effect - Moves across on Hover */}
      <motion.div
        className="absolute top-0 bottom-0 left-0 w-full pointer-events-none z-0"
        style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
            transform: 'skewX(-20deg)',
        }}
        variants={{
          rest: { 
            x: '-150%',
            transition: { duration: 0 } // Reset instantly when hover ends
          },
          hover: { 
            x: '150%',
            transition: { 
              duration: 1.5,
              ease: "linear",
            }
          },
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-start">
        {/* Icon */}
        <div className="w-[48px] h-[48px] flex items-center justify-center text-white">
          {icon === 'user' ? (
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
            >
               {UserShape}
            </svg>
          ) : icon === 'users' ? (
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Center User Shape Definition */}
                <g id="center-user">
                   {UserShape}
                </g>

                {/* Side User Shape Definition (Slightly smaller) */}
                <g id="side-user">
                  <circle cx="12" cy="9" r="3" />
                  <path d="M6.5 21C6.5 17.9624 8.96243 15.5 12 15.5C15.0376 15.5 17.5 17.9624 17.5 21" />
                </g>
              </defs>

              {/* Mask to knockout the area behind the center user */}
              <mask id="knockout-mask">
                <rect width="24" height="24" fill="white" />
                {/* Draw center user in black to cut out background */}
                {/* Stroke creates the gap */}
                <use href="#center-user" fill="black" stroke="black" strokeWidth="3" />
              </mask>

              {/* Background Users (Masked) */}
              <g mask="url(#knockout-mask)" fill="white">
                {/* Left User */}
                <g transform="translate(-6, 0)">
                  <use href="#side-user" />
                </g>
                {/* Right User */}
                <g transform="translate(6, 0)">
                  <use href="#side-user" />
                </g>
              </g>

              {/* Foreground Center User */}
              <use href="#center-user" fill="white" />
            </svg>
          ) : (
            // Custom icon (React node)
            icon
          )}
        </div>

        {/* Headlines */}
        <h2 className="text-[28px] font-medium uppercase text-white mt-6 leading-tight">
          {headline}
        </h2>
        
        <h3 className="text-[14px] font-bold uppercase text-[#66E0F8] tracking-[1px] mt-2">
          {subHeadline}
        </h3>

        {/* Body Text */}
        <p className="text-[16px] leading-[1.5] text-[#E0E0E0] mt-4 text-left">
          {bodyText}
        </p>
      </div>

      {/* Button */}
      <button
        onClick={onClick}
        className="relative z-10 w-full h-[56px] rounded-[100px] bg-[#66E0F8] 
        text-[#1A2B33] font-semibold text-base
        hover:bg-[#9eeefe] transition-colors cursor-pointer flex items-center justify-center"
      >
        {buttonText}
      </button>
    </motion.div>
  );
};
