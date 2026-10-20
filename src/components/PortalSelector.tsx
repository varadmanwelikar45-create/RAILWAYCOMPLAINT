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
    <div className="bg-white rounded-3xl border border-[#E8E2D3] p-6 sm:p-10 shadow-sm space-y-8">
      {/* Top Header with Back Button */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D3]">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#142B4A] hover:bg-[#FFF5DC] px-3 py-1.5 rounded-xl transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        )}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF5DC] text-[#142B4A] text-xs font-bold uppercase tracking-wider border border-[#E9B949]/40 ml-auto">
          <Sparkles className="w-3.5 h-3.5 text-[#E9B949]" />
          <span>RAIL CARE PORTALS · SELECT YOUR ROLE</span>
        </div>
      </div>

      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] tracking-tight">
          Select Your Workspace
        </h2>
        <p className="text-xs sm:text-sm text-[#6B7280] mt-2 leading-relaxed">
          Choose your profile to access on-demand station gig worker services with mutual live location tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        {/* 1. PASSENGER PORTAL */}
        <div className="relative rounded-3xl border-2 border-[#142B4A] bg-white p-7 sm:p-8 flex flex-col justify-between hover:shadow-lg transition-all group">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#142B4A] text-[#E9B949] flex items-center justify-center border border-[#E9B949]/30 shadow-xs">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                PORTAL 1
              </span>
              <h3 className="text-xl font-extrabold text-[#142B4A] group-hover:text-[#243F63] transition-colors mt-0.5">
                Passenger Portal
              </h3>
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Book verified railway gig workers for on-train assistance at upcoming stations, share your coach coordinates, and track worker live arrival.
            </p>
            <div className="pt-3 border-t border-[#E8E2D3]/60 space-y-2 text-xs text-[#253247] font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#21865B] shrink-0" />
                <span>Book Station Gig Workers to Your Coach</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#21865B] shrink-0" />
                <span>Mutual Live Location &amp; Coach Radar</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#21865B] shrink-0" />
                <span>Rate &amp; Review Worker Service</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E8E2D3] space-y-2.5">
            {currentUser && !currentUser.isAdmin ? (
              <button
                onClick={() => {
                  onNavigate('user-dashboard');
                  onClose?.();
                }}
                className="w-full py-3.5 px-4 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Go to Passenger Dashboard</span>
                <ArrowRight className="w-4 h-4 text-[#E9B949]" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onNavigate('login');
                    onClose?.();
                  }}
                  className="flex-1 py-3 px-3 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-xl transition text-center cursor-pointer shadow-xs"
                >
                  Passenger Sign In
                </button>
                <button
                  onClick={() => {
                    onNavigate('register');
                    onClose?.();
                  }}
                  className="flex-1 py-3 px-3 bg-[#FFF5DC] hover:bg-[#E9B949]/30 text-[#142B4A] text-xs font-bold rounded-xl transition border border-[#E9B949]/50 text-center cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. WORKER PORTAL */}
        <div className="relative rounded-3xl border-2 border-[#E9B949] bg-gradient-to-b from-[#FFFDF5] to-[#FFF5DC]/40 p-7 sm:p-8 flex flex-col justify-between hover:shadow-lg transition-all group">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E9B949] text-[#142B4A] flex items-center justify-center border border-[#142B4A]/20 shadow-xs">
              <Briefcase className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#E9B949] uppercase tracking-wider">
                PORTAL 2
              </span>
              <h3 className="text-xl font-extrabold text-[#142B4A] group-hover:text-[#243F63] transition-colors mt-0.5">
                Gig Worker Portal
              </h3>
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              For verified technicians, plumbers, electricians, housekeeping, and sahayaks to accept passenger service requests, navigate to coach berths, and manage duty.
            </p>
            <div className="pt-3 border-t border-[#E8E2D3]/60 space-y-2 text-xs text-[#253247] font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#21865B] shrink-0" />
                <span>Station-Based Job Dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#21865B] shrink-0" />
                <span>Passenger Location &amp; Coach Navigation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#21865B] shrink-0" />
                <span>Live Availability Switch (Available / Busy)</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E8E2D3] space-y-2.5">
            {currentWorker ? (
              <button
                onClick={() => {
                  onNavigate('worker-dashboard');
                  onClose?.();
                }}
                className="w-full py-3.5 px-4 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Worker Hub ({currentWorker.fullName.split(' ')[0]})</span>
                <ArrowRight className="w-4 h-4 text-[#E9B949]" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onNavigate('worker-login');
                    onClose?.();
                  }}
                  className="flex-1 py-3 px-3 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-xl transition text-center cursor-pointer shadow-xs"
                >
                  Worker Sign In
                </button>
                <button
                  onClick={() => {
                    onNavigate('worker-register');
                    onClose?.();
                  }}
                  className="flex-1 py-3 px-3 bg-white hover:bg-[#FFF5DC] text-[#142B4A] text-xs font-bold rounded-xl transition border border-[#142B4A]/30 text-center cursor-pointer"
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
