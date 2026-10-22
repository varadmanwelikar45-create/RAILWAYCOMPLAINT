import React, { useState } from 'react';
import { User, Worker, ViewMode } from '../types';
import { LogOut, Train, Briefcase, Menu, X, ArrowLeft, User as UserIcon } from 'lucide-react';

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
    <header className="bg-white/95 backdrop-blur-md border-b border-[#DDE4E6] sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-6">
          
          {/* Zone 1: Back Button & VYOM RATH Brand Wordmark */}
          <div className="flex items-center gap-3">
            {canGoBack && onBack && (
              <button
                onClick={onBack}
                className="p-2 -ml-2 rounded-xl text-[#202A2B] hover:bg-[#F0F4F6] transition cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0 border border-[#DDE4E6] shadow-xs"
                title="Go Back to Previous Page"
              >
                <ArrowLeft className="w-4 h-4 text-[#B94A3A]" />
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
              <div className="w-10 h-10 rounded-xl bg-[#202A2B] flex items-center justify-center text-[#65D6B0] shadow-xs border border-[#202A2B] group-hover:scale-105 transition-transform">
                <Train className="w-5 h-5 font-bold" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xl sm:text-2xl tracking-tight text-[#202A2B] whitespace-nowrap">
                    VYOM RATH
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#65D6B0] shrink-0"></span>
                </div>
                <p className="text-[10px] font-medium text-[#526365] tracking-wide whitespace-nowrap hidden sm:block">
                  On-Demand Railway Passenger &amp; Gig Workforce Network
                </p>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#202A2B]">
            <button
              onClick={() => onNavigate('landing')}
              className={`transition-colors whitespace-nowrap cursor-pointer pb-1 ${
                currentView === 'landing'
                  ? 'text-[#202A2B] border-b-2 border-[#65D6B0]'
                  : 'text-[#526365] hover:text-[#202A2B]'
              }`}
            >
              Home
            </button>

            {currentUser && (
              <button
                onClick={() => onNavigate('user-dashboard')}
                className={`transition-colors whitespace-nowrap cursor-pointer pb-1 ${
                  currentView === 'user-dashboard'
                    ? 'text-[#202A2B] border-b-2 border-[#65D6B0]'
                    : 'text-[#526365] hover:text-[#202A2B]'
                }`}
              >
                Passenger Dashboard
              </button>
            )}

            {currentWorker && (
              <button
                onClick={() => onNavigate('worker-dashboard')}
                className={`transition-colors whitespace-nowrap cursor-pointer pb-1 ${
                  currentView === 'worker-dashboard'
                    ? 'text-[#202A2B] border-b-2 border-[#00B8D9]'
                    : 'text-[#526365] hover:text-[#007D99]'
                }`}
              >
                Worker Station Duty
              </button>
            )}
          </nav>

          {/* Zone 3: Active User/Worker Sessions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Worker Session Active */}
            {currentWorker && (
              <div className="flex items-center gap-2 bg-[#D7F7FC] border border-[#00B8D9]/40 rounded-xl px-3 py-1.5 shadow-xs">
                <button
                  onClick={() => onNavigate('worker-dashboard')}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition cursor-pointer whitespace-nowrap ${
                    currentView === 'worker-dashboard'
                      ? 'bg-[#007D99] text-white font-extrabold shadow-xs'
                      : 'text-[#007D99] hover:bg-white/50'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{currentWorker.fullName.split(' ')[0]}</span>
                </button>
                <div className="text-right border-l border-[#00B8D9]/30 pl-2 hidden md:block">
                  <div className="text-[10px] text-[#007D99] font-medium">
                    {currentWorker.stationCode} · On Duty
                  </div>
                </div>
                {onWorkerLogout && (
                  <button
                    onClick={onWorkerLogout}
                    className="p-1 text-[#526365] hover:text-[#D72645] hover:bg-[#FBE0E6] rounded-lg transition cursor-pointer"
                    title="Worker Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Passenger Session Active */}
            {currentUser && (
              <div className="flex items-center gap-2 bg-[#DDF8EF] border border-[#65D6B0]/40 rounded-xl px-3 py-1.5 shadow-xs">
                <button
                  onClick={() => onNavigate('user-dashboard')}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition cursor-pointer whitespace-nowrap ${
                    currentView === 'user-dashboard'
                      ? 'bg-[#202A2B] text-white font-extrabold shadow-xs'
                      : 'text-[#1E6B52] hover:bg-white/50'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#65D6B0]" />
                  <span className="font-bold max-w-[120px] truncate">{currentUser.fullName}</span>
                </button>

                <button
                  onClick={onLogout}
                  className="p-1 text-[#526365] hover:text-[#D72645] hover:bg-[#FBE0E6] rounded-lg transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#202A2B] hover:bg-[#F0F4F6] border border-[#DDE4E6] rounded-xl transition cursor-pointer shadow-xs"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#202A2B]" /> : <Menu className="w-5 h-5 text-[#202A2B]" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#DDE4E6] bg-white space-y-2 text-xs font-bold text-[#202A2B]">
            {canGoBack && onBack && (
              <button
                onClick={() => {
                  onBack();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-lg hover:bg-[#F0F4F6] flex items-center gap-2 text-[#202A2B]"
              >
                <ArrowLeft className="w-4 h-4 text-[#B94A3A]" />
                <span>Go Back</span>
              </button>
            )}
            <button
              onClick={() => {
                onNavigate('landing');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-[#DDF8EF] text-[#1E6B52] font-black"
            >
              Home
            </button>
            {currentUser && (
              <button
                onClick={() => {
                  onNavigate('user-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-[#F0F4F6] text-[#202A2B]"
              >
                Passenger Dashboard
              </button>
            )}
            {currentWorker && (
              <button
                onClick={() => {
                  onNavigate('worker-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-[#F0F4F6] text-[#202A2B]"
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
