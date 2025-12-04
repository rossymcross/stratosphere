import React from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { cn } from '../ui/utils';
import { ArrowRight } from 'lucide-react';

interface GlassCardProps {
  icon: 'user' | 'users' | React.ReactNode;
  title: string;
  subtitle?: string;
  description?: string;
  buttonText: string;
  backgroundImage?: string;
  onClick?: () => void;
}

// Reusable user shape for icons
const UserShape = (
  <g>
    <circle cx="12" cy="8" r="4" />
    <path d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21" />
  </g>
);

// Single user icon
const UserIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    {UserShape}
  </svg>
);

// Multi-user icon with knockout mask effect
const UsersIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <g id="center-user">{UserShape}</g>
      <g id="side-user">
        <circle cx="12" cy="9" r="3" />
        <path d="M6.5 21C6.5 17.9624 8.96243 15.5 12 15.5C15.0376 15.5 17.5 17.9624 17.5 21" />
      </g>
    </defs>
    <mask id="knockout-mask">
      <rect width="24" height="24" fill="white" />
      <use href="#center-user" fill="black" stroke="black" strokeWidth="3" />
    </mask>
    <g mask="url(#knockout-mask)" fill="white">
      <g transform="translate(-6, 0)"><use href="#side-user" /></g>
      <g transform="translate(6, 0)"><use href="#side-user" /></g>
    </g>
    <use href="#center-user" fill="white" />
  </svg>
);

export const GlassCard = ({
  icon,
  title,
  subtitle,
  description,
  buttonText,
  backgroundImage,
  onClick,
}: GlassCardProps) => {
  // Render the appropriate icon
  const renderIcon = () => {
    if (icon === 'user') return <UserIcon />;
    if (icon === 'users') return <UsersIcon />;
    return icon; // Allow custom React nodes
  };

  // LAYOUT FOR CARDS WITH IMAGE (Page 04)
  if (backgroundImage) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "group relative flex flex-col w-full min-h-[400px] rounded-[32px] overflow-hidden text-left transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)",
          "border border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.12)]",
          "hover:border-[#66E0F8]/50 hover:shadow-[0_20px_50px_rgba(102,224,248,0.2)] hover:-translate-y-1",
          "focus:outline-none focus:ring-2 focus:ring-[#66E0F8] bg-[#041C2C]"
        )}
      >
        {/* Background Image - Full Cover */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src={backgroundImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
          />
          {/* Subtle gradient overlay to ensure image isn't too bright behind the floating elements */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#041C2C] via-transparent to-transparent opacity-40" />
        </div>

        {/* Floating Icon - Top Left */}
        <div className="relative z-10 p-6 w-full">
          <div className="p-3 rounded-full w-fit backdrop-blur-md bg-black/30 text-[#66E0F8] border border-white/10 shadow-lg">
            {renderIcon()}
          </div>
        </div>

        {/* Masked Text Content - Bottom Section */}
        <div className="relative z-10 mt-auto w-full bg-[#041C2C]/40 backdrop-blur-md border-t border-white/10 p-6 transition-colors group-hover:bg-[#041C2C]/80">
          <div className="flex flex-col gap-3">
            {/* Title & Subtitle */}
            <div className="flex flex-col gap-1">
              {subtitle && (
                <p className="font-montserrat font-bold text-xs tracking-[0.2em] text-[#66E0F8] uppercase">
                  {subtitle}
                </p>
              )}
              <h2 className="font-montserrat font-bold text-xl md:text-2xl tracking-wide text-white uppercase leading-tight">
                {title}
              </h2>
            </div>

            {/* Description */}
            {description && (
              <p className="font-montserrat font-light text-sm text-white/70 leading-relaxed line-clamp-2">
                {description}
              </p>
            )}

            {/* Action Link */}
            <div className="flex items-center gap-2 text-[#66E0F8] font-bold text-xs md:text-sm tracking-widest uppercase mt-2 group/btn">
              {buttonText}
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </button>
    );
  }

  // GLASSMORPHISM LAYOUT FOR CARDS WITHOUT IMAGE (Page 01)
  return (
    <motion.button
      onClick={onClick}
      initial="rest"
      whileHover="hover"
      className={cn(
        "relative flex flex-col justify-between p-8",
        "w-[340px] min-h-[420px] rounded-[24px]",
        "backdrop-blur-[40px] overflow-hidden",
        "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]",
        "hover:shadow-[inset_0_0_0_2px_#66E0F8,0_0_30px_-5px_#66E0F8]",
        "cursor-pointer text-left transition-shadow duration-300",
        "focus:outline-none focus:ring-2 focus:ring-[#66E0F8]"
      )}
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
            transition: { duration: 0 }
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
      <div className="relative z-10 flex flex-col items-start flex-1">
        {/* Icon */}
        <div className="w-[48px] h-[48px] flex items-center justify-center text-white">
          {renderIcon()}
        </div>

        {/* Headlines */}
        <h2 className="text-[28px] font-medium uppercase text-white mt-6 leading-tight">
          {title}
        </h2>
        
        {subtitle && (
          <h3 className="text-[14px] font-bold uppercase text-[#66E0F8] tracking-[1px] mt-2">
            {subtitle}
          </h3>
        )}

        {/* Body Text */}
        {description && (
          <p className="text-[16px] leading-[1.5] text-[#E0E0E0] mt-4 text-left">
            {description}
          </p>
        )}
      </div>

      {/* Button */}
      <div
        className="relative z-10 w-full h-[56px] min-h-[56px] rounded-[100px] 
        font-semibold text-base shrink-0
        transition-colors flex items-center justify-center mt-6"
        style={{
          backgroundColor: '#66E0F8',
          color: '#1A2B33',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#9eeefe')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#66E0F8')}
      >
        {buttonText}
      </div>
    </motion.button>
  );
};
