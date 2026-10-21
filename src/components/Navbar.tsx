import React, { useState } from 'react';
import { User, Worker, ViewMode } from '../types';
import { LogOut, TrainTrack, Briefcase, Menu, X, ArrowLeft, User as UserIcon } from 'lucide-react';

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
  onBack,
  canGoBack = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#D8EAE4] sticky top-0 z-40 shadow-[0_2px_12px_rgba(15,118,110,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-6">
          
          {/* Zone 1: Back Button & RAIL CARE Brand Wordmark */}
          <div className="flex items-center gap-3">
            {canGoBack && onBack && (
              <button
                onClick={onBack}
                className="p-2 -ml-2 rounded-xl text-[#183B3A] hover:bg-[#E5F5EF] transition cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0 border border-[#D8EAE4] shadow-xs"
                title="Go Back to Previous Page"
              >
                <ArrowLeft className="w-4 h-4 text-[#0F766E]" />
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
              <div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shadow-xs border border-[#A7E8D0]/40 group-hover:border-[#A7E8D0] group-hover:bg-[#115E59] transition-all">
                <TrainTrack className="w-5 h-5 text-[#A7E8D0]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-[#183B3A] whitespace-nowrap">
                    RAIL CARE
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#0F766E] shrink-0"></span>
                </div>
                <p className="text-[10px] font-medium text-[#647773] tracking-wide whitespace-nowrap hidden sm:block">
                  On-Demand Railway Passenger &amp; Gig Workforce Network
                </p>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Retains Home, plus authenticated views when active) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#183B3A]">
            <button
              onClick={() => onNavigate('landing')}
              className={`transition-colors whitespace-nowrap cursor-pointer pb-1 ${
                currentView === 'landing'
                  ? 'text-[#0F766E] border-b-2 border-[#0F766E]'
                  : 'text-[#183B3A] hover:text-[#0F766E]'
              }`}
            >
              Home
            </button>

            {currentUser && (
              <button
                onClick={() => onNavigate('user-dashboard')}
                className={`transition-colors whitespace-nowrap cursor-pointer pb-1 ${
                  currentView === 'user-dashboard'
                    ? 'text-[#0F766E] border-b-2 border-[#0F766E]'
                    : 'text-[#183B3A] hover:text-[#0F766E]'
                }`}
              >
                My Bookings &amp; Live Radar
              </button>
            )}

            {currentWorker && (
              <button
                onClick={() => onNavigate('worker-dashboard')}
                className={`transition-colors whitespace-nowrap cursor-pointer pb-1 ${
                  currentView === 'worker-dashboard'
                    ? 'text-[#0F766E] border-b-2 border-[#0F766E]'
                    : 'text-[#183B3A] hover:text-[#0F766E]'
                }`}
              >
                Worker Station Duty
              </button>
            )}
          </nav>

          {/* Zone 3: Active User/Worker Sessions (No Helpline 139, No Book Station Worker, No Sign In) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* 1. Worker Session Active */}
            {currentWorker && (
              <div className="flex items-center gap-2 bg-[#F4FBF8] border border-[#D8EAE4] rounded-xl px-3 py-1.5 shadow-xs">
                <button
                  onClick={() => onNavigate('worker-dashboard')}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition cursor-pointer whitespace-nowrap ${
                    currentView === 'worker-dashboard'
                      ? 'bg-[#0F766E] text-white shadow-xs'
                      : 'text-[#183B3A] hover:bg-[#E5F5EF]'
                  }`}
                >
                  <Briefcase className={`w-3.5 h-3.5 ${currentView === 'worker-dashboard' ? 'text-[#A7E8D0]' : 'text-[#0F766E]'}`} />
                  <span>{currentWorker.fullName.split(' ')[0]}</span>
                </button>
                <div className="text-right border-l border-[#D8EAE4] pl-2 hidden md:block">
                  <div className="text-[10px] text-[#647773] font-medium">
                    {currentWorker.stationCode} · On Duty
                  </div>
                </div>
                {onWorkerLogout && (
                  <button
                    onClick={onWorkerLogout}
                    className="p-1 text-[#647773] hover:text-[#C74646] hover:bg-[#CCFBF1]/40 rounded-lg transition cursor-pointer"
                    title="Worker Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* 2. Regular Passenger Session Active */}
            {currentUser && (
              <div className="flex items-center gap-2 bg-[#F4FBF8] border border-[#D8EAE4] rounded-xl px-3 py-1.5 shadow-xs">
                <button
                  onClick={() => onNavigate('user-dashboard')}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition cursor-pointer whitespace-nowrap ${
                    currentView === 'user-dashboard'
                      ? 'bg-[#0F766E] text-white shadow-xs'
                      : 'text-[#183B3A] hover:bg-[#E5F5EF]'
                  }`}
                >
                  <UserIcon className={`w-3.5 h-3.5 ${currentView === 'user-dashboard' ? 'text-[#A7E8D0]' : 'text-[#0F766E]'}`} />
                  <span className="font-bold max-w-[120px] truncate">{currentUser.fullName}</span>
                </button>

                <button
                  onClick={onLogout}
                  className="p-1 text-[#647773] hover:text-[#C74646] hover:bg-[#CCFBF1]/40 rounded-lg transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Mobile Menu Button (only shown on mobile if links or back available) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#183B3A] hover:bg-[#E5F5EF] border border-[#D8EAE4] rounded-xl transition cursor-pointer shadow-xs"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#0F766E]" /> : <Menu className="w-5 h-5 text-[#0F766E]" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#D8EAE4] bg-white space-y-2 text-xs font-bold text-[#183B3A]">
            {canGoBack && onBack && (
              <button
                onClick={() => {
                  onBack();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-lg hover:bg-[#E5F5EF] flex items-center gap-2 text-[#183B3A]"
              >
                <ArrowLeft className="w-4 h-4 text-[#0F766E]" />
                <span>Go Back</span>
              </button>
            )}
            <button
              onClick={() => {
                onNavigate('landing');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-[#E5F5EF] text-[#0F766E] font-extrabold"
            >
              Home
            </button>
            {currentUser && (
              <button
                onClick={() => {
                  onNavigate('user-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-[#E5F5EF] text-[#183B3A]"
              >
                My Bookings &amp; Live Radar
              </button>
            )}
            {currentWorker && (
              <button
                onClick={() => {
                  onNavigate('worker-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-[#E5F5EF] text-[#183B3A]"
              >
                Worker Station Duty
              </button>
            )}
          </div>
        )}

      </div>
    </header>
  );
};
