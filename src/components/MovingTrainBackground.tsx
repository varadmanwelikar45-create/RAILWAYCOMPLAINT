import React from 'react';
import trainHeroImg from '../assets/images/rail_care_train_hero_1792164300650.jpg';
import trainSideImg from '../assets/images/indian_express_train_side_1792164978734.jpg';
import trainMovingImg from '../assets/images/indian_train_moving_asset_1792164949642.jpg';

/**
 * MovingTrainBackground
 * A realistic, continuously moving Indian passenger train background
 * gliding smoothly from right to left across the screen in golden sunrise light,
 * overlaid with a subtle translucent warm white & yellow tint (#FFFDF5, #FFFBEB) to guarantee
 * 100% dashboard readability and preserve the original yellow and white theme.
 */
export const MovingTrainBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* 1. Base Atmosphere: Warm White & Golden Sunrise Sky Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF5] via-[#FFFBEB] to-[#FFFFFF]" />

      {/* Distant Scenic Indian Landscape & Mist */}
      <div className="absolute inset-x-0 bottom-0 h-[65vh] opacity-30 bg-gradient-to-t from-[#EAB308]/15 via-[#FEF08A]/10 to-transparent" />

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
        <div className="w-full h-px bg-slate-400/40 mb-8" />
        {/* Steel Rail 1 */}
        <div className="w-full h-[3px] bg-gradient-to-r from-slate-400 via-[#EAB308] to-slate-400 shadow-xs" />
        {/* Railway Sleepers / Ties Texture */}
        <div
          className="w-full h-3 bg-repeat-x opacity-40"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, #334155 0, #334155 6px, transparent 6px, transparent 18px)`,
          }}
        />
        {/* Steel Rail 2 */}
        <div className="w-full h-[3px] bg-gradient-to-r from-slate-500 via-[#FDE047] to-slate-500" />
        {/* Ballast Gravel Bed */}
        <div className="w-full h-4 bg-gradient-to-b from-stone-300/30 to-transparent" />
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
              className="w-full h-auto object-cover rounded-xl shadow-md opacity-90 drop-shadow-[0_8px_16px_rgba(202,138,4,0.18)]"
            />

            {/* Subtle Golden Morning Sunlight Glint on Roof */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#EAB308]/20 to-[#FEF08A]/25 pointer-events-none rounded-xl" />
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
              className="w-full h-auto object-cover rounded-xl shadow-md opacity-85 drop-shadow-[0_8px_16px_rgba(202,138,4,0.18)]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#EAB308]/20 to-[#FEF08A]/25 pointer-events-none rounded-xl" />
          </div>
        </div>

      </div>

      {/* 3. Translucent Warm White & Yellow Overlay (Guarantees Perfect Contrast & Readability) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF5]/92 via-[#FFFDF5]/82 to-[#FFFFFF]/94 backdrop-blur-[0.5px]" />

      {/* Subtle Warm Vignette Frame */}
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[#CA8A04]/5 pointer-events-none" />

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
