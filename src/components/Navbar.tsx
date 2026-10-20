import React, { useState } from 'react';
import { User, Worker, ViewMode } from '../types';
import { LogOut, TrainTrack, Briefcase, PhoneCall, Menu, X, ArrowLeft, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  currentWorker?: Worker | null;
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onLogout: () => void;
  onWorkerLogout?: () => void;
  onOpenEmergency?: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentWorker,
  currentView,
  onNavigate,
  onLogout,
  onWorkerLogout,
  onOpenEmergency,
  onBack,
  canGoBack = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#E8E2D3] sticky top-0 z-40 shadow-[0_2px_10px_rgba(20,43,74,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-6">
          
          {/* Zone 1: Back Button & Brand Wordmark */}
          <div className="flex items-center gap-3">
            {canGoBack && onBack && (
              <button
                onClick={onBack}
                className="p-2 -ml-2 rounded-xl text-[#142B4A] hover:bg-[#FFF5DC] transition cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0 border border-[#E8E2D3] shadow-2xs"
                title="Go Back to Previous Page"
              >
                <ArrowLeft className="w-4 h-4 text-[#142B4A]" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}

            <button
              onClick={() => {
                onNavigate('landing');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none shrink-0"
            >
              <div className="w-10 h-10 rounded-xl bg-[#142B4A] flex items-center justify-center text-white shadow-xs border border-[#E9B949]/30 group-hover:border-[#E9B949] transition-all">
                <TrainTrack className="w-5 h-5 text-[#E9B949]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-[#142B4A] whitespace-nowrap">
                    RAIL CARE
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E9B949] shrink-0"></span>
                </div>
                <p className="text-[10px] font-medium text-[#6B7280] tracking-wide whitespace-nowrap hidden sm:block">
                  On-Demand Railway Passenger &amp; Gig Workforce Network
                </p>
              </div>
            </button>
          </div>

          {/* Zone 2: Clean Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-[#142B4A]">
            <button
              onClick={() => onNavigate('landing')}
              className={`hover:text-[#243F63] transition-colors whitespace-nowrap cursor-pointer ${
                currentView === 'landing' ? 'text-[#315F91] border-b-2 border-[#E9B949] pb-0.5' : ''
              }`}
            >
              Home
            </button>

            <button
              onClick={() => onNavigate(currentUser ? 'book-worker' : 'login')}
              className={`hover:text-[#243F63] transition-colors whitespace-nowrap cursor-pointer ${
                currentView === 'book-worker' ? 'text-[#315F91] border-b-2 border-[#E9B949] pb-0.5' : ''
              }`}
            >
              Book Station Worker
            </button>

            {currentUser && (
              <button
                onClick={() => onNavigate('user-dashboard')}
                className={`hover:text-[#243F63] transition-colors whitespace-nowrap cursor-pointer ${
                  currentView === 'user-dashboard' ? 'text-[#315F91] border-b-2 border-[#E9B949] pb-0.5' : ''
                }`}
              >
                My Bookings &amp; Live Radar
              </button>
            )}

            {currentWorker && (
              <button
                onClick={() => onNavigate('worker-dashboard')}
                className={`hover:text-[#243F63] transition-colors whitespace-nowrap cursor-pointer ${
                  currentView === 'worker-dashboard' ? 'text-[#315F91] border-b-2 border-[#E9B949] pb-0.5' : ''
                }`}
              >
                Worker Station Duty
              </button>
            )}
          </nav>

          {/* Zone 3: Actions & Active Sessions */}
          <div className="flex items-center gap-2.5 shrink-0">
            
            {/* Emergency 139 Button */}
            {onOpenEmergency && (
              <button
                onClick={onOpenEmergency}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs"
                title="Call 139 Railway 24x7 Helpline"
              >
                <PhoneCall className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                <span>Helpline 139</span>
              </button>
            )}

            {/* 1. Worker Session Active */}
            {currentWorker && (
              <div className="flex items-center gap-2 bg-[#FFFDF5] border border-[#E9B949]/60 rounded-xl px-2.5 py-1.5 shadow-2xs">
                <button
                  onClick={() => onNavigate('worker-dashboard')}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition cursor-pointer whitespace-nowrap ${
                    currentView === 'worker-dashboard'
                      ? 'bg-[#142B4A] text-white'
                      : 'text-[#142B4A] hover:bg-[#FFF5DC]'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 text-[#E9B949]" />
                  <span>{currentWorker.fullName.split(' ')[0]}</span>
                </button>
                <div className="text-right border-l border-[#E8E2D3] pl-2 hidden md:block">
                  <div className="text-[10px] text-[#6B7280]">
                    {currentWorker.stationCode} · On Duty
                  </div>
                </div>
                {onWorkerLogout && (
                  <button
                    onClick={onWorkerLogout}
                    className="p-1 text-[#6B7280] hover:text-[#D64545] hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Worker Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* 2. Regular Passenger Session Active */}
            {currentUser && (
              <div className="flex items-center gap-2 bg-[#FFFDF5] border border-[#E8E2D3] rounded-xl px-2.5 py-1.5 shadow-2xs">
                <button
                  onClick={() => onNavigate('user-dashboard')}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition cursor-pointer whitespace-nowrap ${
                    currentView === 'user-dashboard'
                      ? 'bg-[#142B4A] text-white'
                      : 'text-[#142B4A] hover:bg-[#FFF5DC]'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#E9B949]" />
                  <span className="font-extrabold text-[#142B4A] max-w-[120px] truncate">{currentUser.fullName}</span>
                </button>

                <button
                  onClick={onLogout}
                  className="p-1 text-[#6B7280] hover:text-[#D64545] hover:bg-red-50 rounded-lg transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* 3. Unauthenticated State */}
            {!currentUser && !currentWorker && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#142B4A] rounded-xl hover:bg-[#243F63] transition-colors whitespace-nowrap shrink-0 shadow-xs border border-[#142B4A] hover:border-[#E9B949] cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#142B4A] hover:bg-[#FFF5DC] rounded-xl transition cursor-pointer"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#E8E2D3] bg-white space-y-2 text-xs font-bold text-[#142B4A]">
            {canGoBack && onBack && (
              <button
                onClick={() => {
                  onBack();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-lg hover:bg-[#FFF5DC] flex items-center gap-2 text-gray-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>
            )}
            <button
              onClick={() => {
                onNavigate('landing');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-[#FFF5DC]"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate(currentUser ? 'book-worker' : 'login');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-[#FFF5DC]"
            >
              Book Station Worker
            </button>
            {currentUser && (
              <button
                onClick={() => {
                  onNavigate('user-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-lg hover:bg-[#FFF5DC]"
              >
                My Bookings &amp; Live Radar
              </button>
            )}
            {onOpenEmergency && (
              <button
                onClick={() => {
                  onOpenEmergency();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-lg bg-red-50 text-red-700 flex items-center gap-2"
              >
                <PhoneCall className="w-3.5 h-3.5 text-red-600" />
                <span>Emergency 139 Helpline</span>
              </button>
            )}
          </div>
        )}

      </div>
    </header>
  );
};
