import React from 'react';
import { ViewMode, User, Worker } from '../types';
import { Users, Briefcase, Shield, ArrowRight, CheckCircle2, TrainTrack, Sparkles } from 'lucide-react';

interface PortalSelectorProps {
  currentView: ViewMode;
  currentUser: User | null;
  currentWorker: Worker | null;
  onNavigate: (view: ViewMode) => void;
  onClose?: () => void;
}

export const PortalSelector: React.FC<PortalSelectorProps> = ({
  currentView,
  currentUser,
  currentWorker,
  onNavigate,
  onClose,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-[#E8E2D3] p-6 sm:p-8 shadow-sm">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF5DC] text-[#142B4A] text-xs font-bold uppercase tracking-wider mb-3 border border-[#E9B949]/40">
          <Sparkles className="w-3.5 h-3.5 text-[#E9B949]" />
          <span>RAIL CARE PORTALS · SELECT YOUR ROLE</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] tracking-tight">
          Three Dedicated Portals, One Integrated Platform
        </h2>
        <p className="text-xs sm:text-sm text-[#6B7280] mt-2">
          Choose your role to access specialized railway complaint management, on-demand station gig worker services, or divisional administration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        
        {/* 1. PASSENGER PORTAL */}
        <div className="relative rounded-2xl border-2 border-[#E8E2D3] bg-gradient-to-b from-white to-[#FFFDF5] p-6 flex flex-col justify-between hover:border-[#142B4A] hover:shadow-md transition-all group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#142B4A] text-[#E9B949] flex items-center justify-center border border-[#E9B949]/30 shadow-xs">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                PORTAL 1
              </span>
              <h3 className="text-lg font-bold text-[#142B4A] group-hover:text-[#243F63] transition-colors">
                Passenger Portal
              </h3>
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Lodge travel grievances, track complaint resolution in real-time, and book verified railway gig workers for on-train assistance at upcoming stations.
            </p>
            <div className="pt-2 border-t border-[#E8E2D3]/60 space-y-1.5 text-[11px] text-[#253247] font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#21865B] shrink-0" />
                <span>File Railway Grievances</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#21865B] shrink-0" />
                <span>Book Station Gig Workers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#21865B] shrink-0" />
                <span>Live Multi-Device Sync</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E8E2D3] space-y-2">
            {currentUser && !currentUser.isAdmin ? (
              <button
                onClick={() => {
                  onNavigate('user-dashboard');
                  onClose?.();
                }}
                className="w-full py-2.5 px-4 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Go to Passenger Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onNavigate('login');
                    onClose?.();
                  }}
                  className="flex-1 py-2 px-3 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-lg transition text-center cursor-pointer shadow-xs"
                >
                  Passenger Login
                </button>
                <button
                  onClick={() => {
                    onNavigate('register');
                    onClose?.();
                  }}
                  className="flex-1 py-2 px-3 bg-[#FFF5DC] hover:bg-[#E9B949]/30 text-[#142B4A] text-xs font-bold rounded-lg transition border border-[#E9B949]/50 text-center cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. WORKER PORTAL (NEW GIG WORKER SERVICES) */}
        <div className="relative rounded-2xl border-2 border-[#E9B949] bg-gradient-to-b from-[#FFFDF5] to-[#FFF5DC]/60 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group ring-2 ring-[#E9B949]/20">
          <div className="absolute -top-3 right-5 px-2.5 py-0.5 bg-[#E9B949] text-[#142B4A] text-[10px] font-extrabold uppercase rounded-full shadow-xs tracking-wider">
            NEW FEATURE
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#E9B949] text-[#142B4A] flex items-center justify-center border border-[#142B4A]/20 shadow-xs">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#E9B949] uppercase tracking-wider">
                PORTAL 2 · RAIL CARE WORKFORCE
              </span>
              <h3 className="text-lg font-bold text-[#142B4A] group-hover:text-[#243F63] transition-colors">
                Gig Worker Portal
              </h3>
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              For verified railway service workers (electricians, plumbers, mechanics, cleaning & boarding staff) to receive, accept, and coordinate passenger service requests at stations.
            </p>
            <div className="pt-2 border-t border-[#E8E2D3]/60 space-y-1.5 text-[11px] text-[#253247] font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#21865B] shrink-0" />
                <span>Station-Based Job Matching</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#21865B] shrink-0" />
                <span>Live Availability Switch (On/Off)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#21865B] shrink-0" />
                <span>Verified Divisional Profile</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E8E2D3] space-y-2">
            {currentWorker ? (
              <button
                onClick={() => {
                  onNavigate('worker-dashboard');
                  onClose?.();
                }}
                className="w-full py-2.5 px-4 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Worker Dashboard ({currentWorker.fullName.split(' ')[0]})</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E9B949]" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onNavigate('worker-login');
                    onClose?.();
                  }}
                  className="flex-1 py-2 px-3 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-lg transition text-center cursor-pointer shadow-xs"
                >
                  Worker Login
                </button>
                <button
                  onClick={() => {
                    onNavigate('worker-register');
                    onClose?.();
                  }}
                  className="flex-1 py-2 px-3 bg-white hover:bg-[#FFF5DC] text-[#142B4A] text-xs font-bold rounded-lg transition border border-[#142B4A]/30 text-center cursor-pointer"
                >
                  Join as Worker
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. ADMIN PORTAL */}
        <div className="relative rounded-2xl border-2 border-[#E8E2D3] bg-gradient-to-b from-white to-[#FFFDF5] p-6 flex flex-col justify-between hover:border-[#142B4A] hover:shadow-md transition-all group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#243F63] text-white flex items-center justify-center border border-[#E9B949]/30 shadow-xs">
              <Shield className="w-6 h-6 text-[#E9B949]" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                PORTAL 3 · DIVISIONAL HEADQUARTERS
              </span>
              <h3 className="text-lg font-bold text-[#142B4A] group-hover:text-[#243F63] transition-colors">
                Admin Portal
              </h3>
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Official control desk for senior railway officers to review FIFO complaint queues, verify registered gig workers, and monitor system-wide redressal operations.
            </p>
            <div className="pt-2 border-t border-[#E8E2D3]/60 space-y-1.5 text-[11px] text-[#253247] font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#21865B] shrink-0" />
                <span>FIFO Queue Resolution</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#21865B] shrink-0" />
                <span>Gig Worker Verification</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#21865B] shrink-0" />
                <span>Divisional Analytics</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E8E2D3] space-y-2">
            {currentUser?.isAdmin ? (
              <button
                onClick={() => {
                  onNavigate('admin-dashboard');
                  onClose?.();
                }}
                className="w-full py-2.5 px-4 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Go to Admin Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E9B949]" />
              </button>
            ) : (
              <button
                onClick={() => {
                  onNavigate('admin-login');
                  onClose?.();
                }}
                className="w-full py-2.5 px-4 bg-[#142B4A] hover:bg-[#0c2033] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Shield className="w-3.5 h-3.5 text-[#E9B949]" />
                <span>Officer Admin Login</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
