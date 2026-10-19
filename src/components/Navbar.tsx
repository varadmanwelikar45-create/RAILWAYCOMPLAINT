import React, { useState } from 'react';
import { User, Worker, ViewMode } from '../types';
import { Shield, LogOut, LayoutDashboard, TrainTrack, Briefcase, PhoneCall } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  currentWorker?: Worker | null;
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onLogout: () => void;
  onWorkerLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentWorker,
  currentView,
  onNavigate,
  onLogout,
  onWorkerLogout,
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#E8E2D3] sticky top-0 z-40 shadow-[0_2px_10px_rgba(20,43,74,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Tagline */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-11 h-11 rounded-xl bg-[#142B4A] flex items-center justify-center text-white shadow-sm border border-[#E9B949]/30 group-hover:border-[#E9B949] transition-all duration-200">
              <div className="relative flex items-center justify-center">
                <TrainTrack className="w-6 h-6 text-[#E9B949]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight text-[#142B4A]">
                  RAIL CARE
                </span>
                <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#E9B949]"></span>
              </div>
              <p className="text-[11px] font-medium text-[#6B7280] tracking-wide">
                On-Demand Railway Worker & Assistance Network
              </p>
            </div>
          </button>

          {/* Right Area: Session Controls or Clean Official Badge */}
          <div className="flex items-center gap-3">
            
            {/* 1. Worker Session Active */}
            {currentWorker && (
              <div className="flex items-center gap-2 bg-[#FFFDF5] border border-[#E9B949]/60 rounded-xl px-3 py-1.5 shadow-2xs">
                <button
                  onClick={() => onNavigate('worker-dashboard')}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    currentView === 'worker-dashboard'
                      ? 'bg-[#142B4A] text-white'
                      : 'text-[#142B4A] hover:bg-[#FFF5DC]'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 text-[#E9B949]" />
                  <span>Worker Hub</span>
                </button>
                <div className="text-right border-l border-[#E8E2D3] pl-2 hidden sm:block">
                  <div className="text-[11px] font-bold text-[#142B4A] leading-tight">
                    {currentWorker.fullName}
                  </div>
                  <div className="text-[9px] text-[#6B7280]">
                    {currentWorker.stationCode} · {currentWorker.verificationStatus}
                  </div>
                </div>
                {onWorkerLogout && (
                  <button
                    onClick={onWorkerLogout}
                    className="p-1.5 text-[#6B7280] hover:text-[#D64545] hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Worker Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* 2. Passenger Session Active */}
            {currentUser && (
              <div className="flex items-center gap-2 bg-[#FFFDF5] border border-[#E8E2D3] rounded-xl px-3 py-1.5 shadow-2xs">
                <button
                  onClick={() => onNavigate('user-dashboard')}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    currentView === 'user-dashboard'
                      ? 'bg-[#142B4A] text-white'
                      : 'text-[#142B4A] hover:bg-[#FFF5DC]'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#E9B949]" />
                  <span>Passenger Hub</span>
                </button>

                <div className="text-right border-l border-[#E8E2D3] pl-2 hidden sm:block">
                  <div className="text-[11px] font-bold text-[#142B4A] truncate max-w-[140px]">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[9px] text-[#6B7280]">
                    Passenger
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="p-1.5 text-[#6B7280] hover:text-[#D64545] hover:bg-red-50 rounded-lg transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* 3. Unauthenticated Public State: Clean without 139 banner */}
            {!currentUser && !currentWorker && null}

          </div>

        </div>
      </div>
    </header>
  );
};
