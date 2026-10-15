import React from 'react';
import { User, ViewMode } from '../types';
import { Shield, LogOut, PlusCircle, LayoutDashboard, UserPlus, LogIn } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentView,
  onNavigate,
  onLogout,
}) => {
  return (
    <header className="bg-[#12304A] text-white shadow-md sticky top-0 z-40 border-b border-[#1E4976]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Tagline */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 group text-left transition"
          >
            <div className="w-10 h-10 rounded-lg bg-[#2563EB] flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-[#1d4ed8] transition">
              RC
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white">RailCare</span>
              <p className="text-xs text-blue-200/80 font-normal hidden sm:block">
                Your Voice. Better Railways.
              </p>
            </div>
          </button>

          {/* Nav Links */}
          <div className="flex items-center gap-2 sm:gap-3">

            <button
              onClick={() => onNavigate('landing')}
              className={`text-xs sm:text-sm font-medium px-2.5 py-1.5 rounded transition ${
                currentView === 'landing' ? 'text-white bg-white/10' : 'text-slate-200 hover:text-white'
              }`}
            >
              Home
            </button>

            {currentUser ? (
              <>
                {currentUser.isAdmin ? (
                  <button
                    onClick={() => onNavigate('admin-dashboard')}
                    className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded transition ${
                      currentView === 'admin-dashboard' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-200 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-300" />
                    Admin Dashboard
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => onNavigate('user-dashboard')}
                      className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded transition ${
                        currentView === 'user-dashboard' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-200 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      My Dashboard
                    </button>
                    <button
                      onClick={() => onNavigate('register-complaint')}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded bg-[#2563EB] hover:bg-[#1d4ed8] text-white transition shadow-sm"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">New Complaint</span>
                    </button>
                  </>
                )}

                {/* Logged in User Profile Info & Logout */}
                <div className="flex items-center gap-2 pl-2 border-l border-white/20">
                  <div className="hidden lg:block text-right">
                    <div className="text-xs font-semibold text-white truncate max-w-[130px]">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[10px] text-blue-200">
                      {currentUser.isAdmin ? 'Railway Officer' : 'Passenger'}
                    </div>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-1.5 text-red-300 hover:text-white hover:bg-red-500/20 rounded transition cursor-pointer"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => onNavigate('register')}
                  className={`inline-flex items-center gap-1 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded transition shadow-sm ${
                    currentView === 'register'
                      ? 'bg-white text-[#12304A]'
                      : 'bg-[#2563EB] hover:bg-[#1d4ed8] text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Register
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className={`inline-flex items-center gap-1 text-xs sm:text-sm font-medium px-3 py-1.5 rounded transition ${
                    currentView === 'login'
                      ? 'text-white bg-white/20'
                      : 'text-blue-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Login
                </button>
                <button
                  onClick={() => onNavigate('admin-login')}
                  className={`hidden sm:inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded transition ${
                    currentView === 'admin-login'
                      ? 'text-white bg-white/20'
                      : 'text-sky-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-amber-300" />
                  Admin
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
