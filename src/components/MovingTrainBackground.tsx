import React from 'react';
import trainHeroImg from '../assets/images/rail_care_train_hero_1792164300650.jpg';
import trainSideImg from '../assets/images/indian_express_train_side_1792164978734.jpg';
import trainMovingImg from '../assets/images/indian_train_moving_asset_1792164949642.jpg';

/**
 * MovingTrainBackground
 * A realistic, continuously moving Indian passenger train background
 * gliding smoothly from right to left across the screen,
 * overlaid with a subtle translucent mint green & teal tint (#F4FBF8, #E5F5EF) to guarantee
 * 100% dashboard readability and preserve the modern mint/teal theme.
 */
export const MovingTrainBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* 1. Base Atmosphere: Fresh Mint Green Sky & Light Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F4FBF8] via-[#E5F5EF] to-[#F4FBF8]" />

      {/* Distant Scenic Indian Landscape & Mist */}
      <div className="absolute inset-x-0 bottom-0 h-[65vh] opacity-35 bg-gradient-to-t from-[#0F766E]/10 via-[#A7E8D0]/10 to-transparent" />

      {/* Panoramic Railway Landscape Layer */}
      <div className="absolute inset-x-0 bottom-0 h-[480px] sm:h-[540px] opacity-25">
        <img
          src={trainHeroImg}
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== '/images/rail_care_train_hero.jpg') {
              target.src = '/images/rail_care_train_hero.jpg';
            }
          }}
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-bottom filter blur-[1px] brightness-105"
        />
      </div>

      {/* Continuous Railway Track & Ballast Horizon */}
      <div className="absolute inset-x-0 bottom-12 sm:bottom-16 h-12 flex flex-col justify-end opacity-40">
        {/* Overhead Electric Catenary Wire */}
        <div className="w-full h-px bg-[#115E59]/30 mb-8" />
        {/* Steel Rail 1 */}
        <div className="w-full h-[3px] bg-gradient-to-r from-slate-400 via-[#A7E8D0] to-slate-400 shadow-xs" />
        {/* Railway Sleepers / Ties Texture */}
        <div
          className="w-full h-3 bg-repeat-x opacity-50"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, #115E59 0, #115E59 6px, transparent 6px, transparent 18px)`,
          }}
        />
        {/* Steel Rail 2 */}
        <div className="w-full h-[3px] bg-gradient-to-r from-slate-500 via-[#CCFBF1] to-slate-500" />
        {/* Ballast Gravel Bed */}
        <div className="w-full h-4 bg-gradient-to-b from-stone-400/20 to-transparent" />
      </div>

      {/* 2. Moving Realistic Indian Passenger Trains (Right to Left Continuous Motion) */}
      <div className="absolute inset-x-0 bottom-8 sm:bottom-12 h-64 sm:h-80 overflow-hidden pointer-events-none">
        
        {/* Train 1: WAP-7 Locomotive with LHB Coaches traveling Right to Left */}
        <div
          className="absolute bottom-2 sm:bottom-4 will-change-transform animate-train-primary"
          style={{
            width: 'min(1400px, 180vw)',
          }}
        >
          <div className="relative">
            {/* Soft ground shadow beneath train */}
            <div className="absolute -bottom-2 inset-x-4 h-4 bg-black/25 blur-sm rounded-full" />
            
            {/* Realistic Indian Passenger Train High-Res Visual */}
            <img
              src={trainSideImg}
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== '/images/indian_express_train_side.jpg') {
                  target.src = '/images/indian_express_train_side.jpg';
                }
              }}
              alt="Moving Indian passenger train"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover rounded-xl shadow-md opacity-90 drop-shadow-[0_8px_16px_rgba(15,118,110,0.18)]"
            />

            {/* Subtle Mint Morning Sunlight Glint on Roof */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#A7E8D0]/15 to-[#CCFBF1]/20 pointer-events-none rounded-xl" />
          </div>
        </div>

        {/* Train 2: Staggered Second Train Convoy for Seamless Continuous Journey */}
        <div
          className="absolute bottom-2 sm:bottom-4 will-change-transform animate-train-secondary"
          style={{
            width: 'min(1400px, 180vw)',
          }}
        >
          <div className="relative">
            <div className="absolute -bottom-2 inset-x-4 h-4 bg-black/25 blur-sm rounded-full" />
            
            <img
              src={trainMovingImg}
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== '/images/indian_train_moving_asset.jpg') {
                  target.src = '/images/indian_train_moving_asset.jpg';
                }
              }}
              alt="Indian Railways Express Train"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover rounded-xl shadow-md opacity-85 drop-shadow-[0_8px_16px_rgba(15,118,110,0.18)]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#A7E8D0]/15 to-[#CCFBF1]/20 pointer-events-none rounded-xl" />
          </div>
        </div>

      </div>

      {/* 3. Translucent Mint Overlay (Guarantees Perfect Contrast & Readability) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F4FBF8]/92 via-[#F4FBF8]/82 to-[#F4FBF8]/94 backdrop-blur-[0.5px]" />

      {/* Subtle Teal Vignette Frame */}
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[#0F766E]/5 pointer-events-none" />

      {/* Moving Train CSS Animations */}
      <style>{`
        @keyframes trainMoveAcrossScreen {
          0% {
            transform: translate3d(105vw, 0, 0);
          }
          100% {
            transform: translate3d(-110%, 0, 0);
          }
        }

        .animate-train-primary {
          animation: trainMoveAcrossScreen 28s linear infinite;
        }

        .animate-train-secondary {
          animation: trainMoveAcrossScreen 28s linear infinite;
          animation-delay: -14s;
        }
      `}</style>
    </div>
  );
};
