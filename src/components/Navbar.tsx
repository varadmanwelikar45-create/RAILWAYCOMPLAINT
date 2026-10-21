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
    <header className="bg-white/95 backdrop-blur-md border-b border-amber-100 sticky top-0 z-40 shadow-[0_2px_12px_rgba(234,179,8,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-6">
          
          {/* Zone 1: Back Button & RAIL CARE Brand Wordmark */}
          <div className="flex items-center gap-3">
            {canGoBack && onBack && (
              <button
                onClick={onBack}
                className="p-2 -ml-2 rounded-xl text-slate-800 hover:bg-amber-50 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0 border border-slate-200 shadow-xs"
                title="Go Back to Previous Page"
              >
                <ArrowLeft className="w-4 h-4 text-amber-600" />
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
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-900 shadow-xs border border-amber-400 group-hover:bg-amber-600 transition-all">
                <TrainTrack className="w-5 h-5 text-slate-950 font-bold" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 whitespace-nowrap">
                    RAIL CARE
                  </span>
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                </div>
                <p className="text-[10px] font-medium text-slate-500 tracking-wide whitespace-nowrap hidden sm:block">
                  On-Demand Railway Passenger &amp; Gig Workforce Network
                </p>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Retains Home, plus authenticated views when active) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-800">
            <button
              onClick={() => onNavigate('landing')}
              className={`transition-colors whitespace-nowrap cursor-pointer pb-1 ${
                currentView === 'landing'
                  ? 'text-amber-600 border-b-2 border-amber-500'
                  : 'text-slate-700 hover:text-amber-600'
              }`}
            >
              Home
            </button>

            {currentUser && (
              <button
                onClick={() => onNavigate('user-dashboard')}
                className={`transition-colors whitespace-nowrap cursor-pointer pb-1 ${
                  currentView === 'user-dashboard'
                    ? 'text-amber-600 border-b-2 border-amber-500'
                    : 'text-slate-700 hover:text-amber-600'
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
                    ? 'text-amber-600 border-b-2 border-amber-500'
                    : 'text-slate-700 hover:text-amber-600'
                }`}
              >
                Worker Station Duty
              </button>
            )}
          </nav>

          {/* Zone 3: Active User/Worker Sessions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* 1. Worker Session Active */}
            {currentWorker && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 shadow-xs">
                <button
                  onClick={() => onNavigate('worker-dashboard')}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition cursor-pointer whitespace-nowrap ${
                    currentView === 'worker-dashboard'
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs'
                      : 'text-slate-800 hover:bg-amber-100'
                  }`}
                >
                  <Briefcase className={`w-3.5 h-3.5 ${currentView === 'worker-dashboard' ? 'text-slate-950' : 'text-amber-600'}`} />
                  <span>{currentWorker.fullName.split(' ')[0]}</span>
                </button>
                <div className="text-right border-l border-amber-200 pl-2 hidden md:block">
                  <div className="text-[10px] text-amber-800 font-medium">
                    {currentWorker.stationCode} · On Duty
                  </div>
                </div>
                {onWorkerLogout && (
                  <button
                    onClick={onWorkerLogout}
                    className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Worker Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* 2. Regular Passenger Session Active */}
            {currentUser && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 shadow-xs">
                <button
                  onClick={() => onNavigate('user-dashboard')}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition cursor-pointer whitespace-nowrap ${
                    currentView === 'user-dashboard'
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs'
                      : 'text-slate-800 hover:bg-amber-100'
                  }`}
                >
                  <UserIcon className={`w-3.5 h-3.5 ${currentView === 'user-dashboard' ? 'text-slate-950' : 'text-amber-600'}`} />
                  <span className="font-bold max-w-[120px] truncate">{currentUser.fullName}</span>
                </button>

                <button
                  onClick={onLogout}
                  className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-800 hover:bg-amber-50 border border-slate-200 rounded-xl transition cursor-pointer shadow-xs"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-amber-600" /> : <Menu className="w-5 h-5 text-amber-600" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-amber-100 bg-white space-y-2 text-xs font-bold text-slate-800">
            {canGoBack && onBack && (
              <button
                onClick={() => {
                  onBack();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-lg hover:bg-amber-50 flex items-center gap-2 text-slate-800"
              >
                <ArrowLeft className="w-4 h-4 text-amber-600" />
                <span>Go Back</span>
              </button>
            )}
            <button
              onClick={() => {
                onNavigate('landing');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-amber-50 text-amber-600 font-extrabold"
            >
              Home
            </button>
            {currentUser && (
              <button
                onClick={() => {
                  onNavigate('user-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-amber-50 text-slate-800"
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
                className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-amber-50 text-slate-800"
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
