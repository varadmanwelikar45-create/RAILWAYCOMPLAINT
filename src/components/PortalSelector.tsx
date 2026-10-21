import React from 'react';
import { ViewMode, User, Worker } from '../types';
import { Users, Briefcase, ArrowRight, CheckCircle2, Sparkles, ArrowLeft } from 'lucide-react';

interface PortalSelectorProps {
  currentView: ViewMode;
  currentUser: User | null;
  currentWorker: Worker | null;
  onNavigate: (view: ViewMode) => void;
  onClose?: () => void;
  onBack?: () => void;
}

export const PortalSelector: React.FC<PortalSelectorProps> = ({
  currentUser,
  currentWorker,
  onNavigate,
  onClose,
  onBack,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-[#D8EAE4] p-6 sm:p-10 shadow-xs space-y-8">
      {/* Top Header with Back Button */}
      <div className="flex items-center justify-between pb-4 border-b border-[#D8EAE4]">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#183B3A] hover:bg-[#E5F5EF] px-3 py-1.5 rounded-xl transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#0F766E]" />
            <span>Back</span>
          </button>
        )}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCFBF1] text-[#0F766E] text-xs font-bold uppercase tracking-wider border border-[#A7E8D0] ml-auto">
          <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
          <span>RAIL CARE PORTALS · SELECT YOUR ROLE</span>
        </div>
      </div>

      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#115E59] tracking-tight">
          Select Your Workspace
        </h2>
        <p className="text-xs sm:text-sm text-[#647773] mt-2 leading-relaxed">
          Choose your profile to access on-demand station gig worker services with mutual live location tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        {/* 1. PASSENGER PORTAL */}
        <div className="relative rounded-3xl border border-[#D8EAE4] bg-[#F4FBF8] p-7 sm:p-8 flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0F766E] text-[#CCFBF1] flex items-center justify-center border border-[#A7E8D0]/30 shadow-xs">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#647773] uppercase tracking-wider">
                PORTAL 1
              </span>
              <h3 className="text-xl font-extrabold text-[#115E59] group-hover:text-[#0F766E] transition-colors mt-0.5">
                Passenger Portal
              </h3>
            </div>
            <p className="text-xs text-[#647773] leading-relaxed">
              Book verified railway gig workers for on-train assistance at upcoming stations, share your coach coordinates, and track worker live arrival.
            </p>
            <div className="pt-3 border-t border-[#D8EAE4] space-y-2 text-xs text-[#183B3A] font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16845B] shrink-0" />
                <span>Book Station Gig Workers to Your Coach</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16845B] shrink-0" />
                <span>Mutual Live Location &amp; Coach Radar</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16845B] shrink-0" />
                <span>Rate &amp; Review Worker Service</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#D8EAE4] space-y-2.5">
            {currentUser && !currentUser.isAdmin ? (
              <button
                onClick={() => {
                  onNavigate('user-dashboard');
                  onClose?.();
                }}
                className="w-full py-3.5 px-4 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Go to Passenger Dashboard</span>
                <ArrowRight className="w-4 h-4 text-[#CCFBF1]" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onNavigate('login');
                    onClose?.();
                  }}
                  className="flex-1 py-3 px-3 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold rounded-xl transition text-center cursor-pointer shadow-xs"
                >
                  Passenger Sign In
                </button>
                <button
                  onClick={() => {
                    onNavigate('register');
                    onClose?.();
                  }}
                  className="flex-1 py-3 px-3 bg-white hover:bg-[#E5F5EF] text-[#0F766E] text-xs font-bold rounded-xl transition border border-[#D8EAE4] text-center cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. WORKER PORTAL */}
        <div className="relative rounded-3xl border border-[#D8EAE4] bg-[#F4FBF8] p-7 sm:p-8 flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#115E59] text-[#A7E8D0] flex items-center justify-center border border-[#A7E8D0]/30 shadow-xs">
              <Briefcase className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-wider">
                PORTAL 2
              </span>
              <h3 className="text-xl font-extrabold text-[#115E59] group-hover:text-[#0F766E] transition-colors mt-0.5">
                Gig Worker Portal
              </h3>
            </div>
            <p className="text-xs text-[#647773] leading-relaxed">
              For verified technicians, plumbers, electricians, housekeeping, and sahayaks to accept passenger service requests, navigate to coach berths, and manage duty.
            </p>
            <div className="pt-3 border-t border-[#D8EAE4] space-y-2 text-xs text-[#183B3A] font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16845B] shrink-0" />
                <span>Station-Based Job Dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16845B] shrink-0" />
                <span>Passenger Location &amp; Coach Navigation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16845B] shrink-0" />
                <span>Live Availability Switch (Available / Busy)</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#D8EAE4] space-y-2.5">
            {currentWorker ? (
              <button
                onClick={() => {
                  onNavigate('worker-dashboard');
                  onClose?.();
                }}
                className="w-full py-3.5 px-4 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Worker Hub ({currentWorker.fullName.split(' ')[0]})</span>
                <ArrowRight className="w-4 h-4 text-[#CCFBF1]" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onNavigate('worker-login');
                    onClose?.();
                  }}
                  className="flex-1 py-3 px-3 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold rounded-xl transition text-center cursor-pointer shadow-xs"
                >
                  Worker Sign In
                </button>
                <button
                  onClick={() => {
                    onNavigate('worker-register');
                    onClose?.();
                  }}
                  className="flex-1 py-3 px-3 bg-white hover:bg-[#E5F5EF] text-[#0F766E] text-xs font-bold rounded-xl transition border border-[#D8EAE4] text-center cursor-pointer"
                >
                  Join as Worker
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
