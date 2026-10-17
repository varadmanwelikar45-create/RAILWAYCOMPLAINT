import React, { useState } from 'react';
import { User, Worker, ViewMode } from '../types';
import { Shield, LogOut, PlusCircle, LayoutDashboard, UserPlus, LogIn, Menu, X, TrainTrack, Briefcase, Sparkles, Layers } from 'lucide-react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: ViewMode) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#E8E2D3] sticky top-0 z-40 shadow-[0_2px_10px_rgba(20,43,74,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Tagline */}
          <button
            onClick={() => handleNav('landing')}
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
                Railway Complaint Management System
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            
            <button
              onClick={() => handleNav('landing')}
              className={`text-sm font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                currentView === 'landing'
                  ? 'text-[#142B4A] bg-[#FFF5DC]'
                  : 'text-[#253247] hover:text-[#142B4A] hover:bg-[#FFFDF5]'
              }`}
            >
              Home
            </button>

            {/* Portal Switcher Button */}
            <button
              onClick={() => handleNav('portal-selection')}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer border ${
                currentView === 'portal-selection'
                  ? 'bg-[#142B4A] text-[#E9B949] border-[#142B4A]'
                  : 'bg-[#FFFDF5] text-[#142B4A] border-[#E8E2D3] hover:border-[#E9B949]'
              }`}
              title="Switch Between Passenger, Gig Worker & Officer Portals"
            >
              <Layers className="w-3.5 h-3.5 text-[#E9B949]" />
              <span>Portals</span>
            </button>

            {/* If Worker is Logged In */}
            {currentWorker && (
              <div className="flex items-center gap-2 bg-[#FFFDF5] border border-[#E9B949]/50 rounded-xl px-3 py-1.5 shadow-2xs">
                <button
                  onClick={() => handleNav('worker-dashboard')}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    currentView === 'worker-dashboard'
                      ? 'bg-[#142B4A] text-white'
                      : 'text-[#142B4A] hover:bg-[#FFF5DC]'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 text-[#E9B949]" />
                  <span>Worker Dashboard</span>
                </button>
                <div className="text-right border-l border-[#E8E2D3] pl-2">
                  <div className="text-[11px] font-bold text-[#142B4A] leading-tight">
                    {currentWorker.fullName}
                  </div>
                  <div className="text-[9px] text-[#6B7280]">
                    {currentWorker.stationCode} · {currentWorker.availability}
                  </div>
                </div>
                {onWorkerLogout && (
                  <button
                    onClick={onWorkerLogout}
                    className="p-1 text-[#6B7280] hover:text-[#D64545] hover:bg-red-50 rounded-md transition cursor-pointer"
                    title="Worker Log Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Passenger / Admin User Section */}
            {currentUser ? (
              <>
                {currentUser.isAdmin ? (
                  <button
                    onClick={() => handleNav('admin-dashboard')}
                    className={`inline-flex items-center gap-2 text-sm font-semibold px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                      currentView === 'admin-dashboard'
                        ? 'bg-[#142B4A] text-white'
                        : 'text-[#253247] hover:text-[#142B4A] hover:bg-[#FFF5DC]'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-[#E9B949]" />
                    Admin Control Center
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleNav('user-dashboard')}
                      className={`inline-flex items-center gap-2 text-sm font-semibold px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                        currentView === 'user-dashboard'
                          ? 'bg-[#142B4A] text-white'
                          : 'text-[#253247] hover:text-[#142B4A] hover:bg-[#FFF5DC]'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#E9B949]" />
                      My Complaints
                    </button>

                    <button
                      onClick={() => handleNav('book-worker')}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border transition cursor-pointer ${
                        currentView === 'book-worker'
                          ? 'bg-[#E9B949] text-[#142B4A] border-[#E9B949]'
                          : 'bg-[#FFF5DC] text-[#142B4A] border-[#E9B949]/50 hover:bg-[#E9B949]/30'
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5 text-[#142B4A]" />
                      Book a Worker
                    </button>

                    <button
                      onClick={() => handleNav('register-complaint')}
                      className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg bg-[#142B4A] hover:bg-[#243F63] text-white transition-all shadow-xs border border-[#142B4A] hover:border-[#E9B949] cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4 text-[#E9B949]" />
                      Register a Complaint
                    </button>
                  </>
                )}

                {/* Profile info & logout */}
                <div className="flex items-center gap-3 pl-3 ml-2 border-l border-[#E8E2D3]">
                  <div className="text-right">
                    <div className="text-xs font-bold text-[#142B4A] truncate max-w-[140px]">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[10px] text-[#6B7280]">
                      {currentUser.isAdmin ? 'Railway Officer' : 'Passenger'}
                    </div>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2 text-[#6B7280] hover:text-[#D64545] hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('register-complaint')}
                  className="text-sm font-semibold px-2.5 py-2 text-[#253247] hover:text-[#142B4A] hover:bg-[#FFF5DC] rounded-lg transition cursor-pointer"
                >
                  Register a Complaint
                </button>

                <button
                  onClick={() => handleNav('book-worker')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-[#FFF5DC] text-[#142B4A] hover:bg-[#E9B949]/30 border border-[#E9B949]/50 transition cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5 text-[#142B4A]" />
                  <span>Book Worker</span>
                </button>

                {!currentWorker && (
                  <button
                    onClick={() => handleNav('worker-login')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-2 text-[#6B7280] hover:text-[#142B4A] hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    title="Gig Worker Portal"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-[#E9B949]" />
                    <span>Worker</span>
                  </button>
                )}

                <button
                  onClick={() => handleNav('login')}
                  className={`inline-flex items-center gap-1 text-sm font-semibold px-3 py-2 rounded-lg border border-[#E8E2D3] transition cursor-pointer ${
                    currentView === 'login'
                      ? 'bg-[#142B4A] text-white border-[#142B4A]'
                      : 'bg-white text-[#142B4A] hover:bg-[#FFF5DC]'
                  }`}
                >
                  <LogIn className="w-4 h-4 text-[#E9B949]" />
                  Login
                </button>

                <button
                  onClick={() => handleNav('register')}
                  className="inline-flex items-center gap-1 text-sm font-bold px-3.5 py-2 rounded-lg bg-[#142B4A] hover:bg-[#243F63] text-white transition-all shadow-xs border border-[#142B4A] hover:border-[#E9B949] cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-[#E9B949]" />
                  Register
                </button>

                <button
                  onClick={() => handleNav('admin-login')}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-2 rounded-lg text-[#6B7280] hover:text-[#142B4A] hover:bg-slate-100 transition cursor-pointer"
                  title="Official Administrator Portal"
                >
                  <Shield className="w-3.5 h-3.5 text-[#E9B949]" />
                  Admin
                </button>
              </div>
            )}

          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#142B4A] hover:bg-[#FFF5DC] rounded-lg transition cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#E8E2D3] space-y-2 bg-white">
            <button
              onClick={() => handleNav('landing')}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-[#253247] hover:bg-[#FFF5DC] rounded-lg"
            >
              Home
            </button>

            <button
              onClick={() => handleNav('portal-selection')}
              className="w-full text-left px-3 py-2 text-sm font-bold text-[#142B4A] bg-[#FFF5DC] rounded-lg flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-[#E9B949]" />
              Role Portals Selection
            </button>

            {currentWorker && (
              <div className="p-3 bg-[#FFFDF5] border border-[#E9B949]/50 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#142B4A]">
                    {currentWorker.fullName} (Gig Worker)
                  </div>
                  {onWorkerLogout && (
                    <button
                      onClick={onWorkerLogout}
                      className="text-xs text-red-600 font-bold hover:underline"
                    >
                      Logout
                    </button>
                  )}
                </div>
                <button
                  onClick={() => handleNav('worker-dashboard')}
                  className="w-full py-2 text-xs font-bold text-white bg-[#142B4A] rounded-lg flex items-center justify-center gap-1.5"
                >
                  <Briefcase className="w-3.5 h-3.5 text-[#E9B949]" />
                  Go to Worker Dashboard
                </button>
              </div>
            )}

            {currentUser ? (
              <>
                {currentUser.isAdmin ? (
                  <button
                    onClick={() => handleNav('admin-dashboard')}
                    className="w-full text-left px-3 py-2 text-sm font-semibold text-[#142B4A] bg-[#FFF5DC] rounded-lg flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4 text-[#E9B949]" />
                    Admin Control Center
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleNav('user-dashboard')}
                      className="w-full text-left px-3 py-2 text-sm font-semibold text-[#253247] hover:bg-[#FFF5DC] rounded-lg flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#E9B949]" />
                      My Complaints Dashboard
                    </button>
                    <button
                      onClick={() => handleNav('book-worker')}
                      className="w-full text-left px-3 py-2 text-sm font-bold text-[#142B4A] bg-[#FFF5DC] rounded-lg flex items-center gap-2"
                    >
                      <Briefcase className="w-4 h-4 text-[#142B4A]" />
                      Book a Station Gig Worker
                    </button>
                    <button
                      onClick={() => handleNav('register-complaint')}
                      className="w-full text-left px-3 py-2 text-sm font-bold text-white bg-[#142B4A] rounded-lg flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4 text-[#E9B949]" />
                      Register New Complaint
                    </button>
                  </>
                )}
                <div className="pt-2 border-t border-[#E8E2D3] flex items-center justify-between px-3">
                  <div>
                    <div className="text-xs font-bold text-[#142B4A]">{currentUser.fullName}</div>
                    <div className="text-[10px] text-[#6B7280]">{currentUser.email}</div>
                  </div>
                  <button
                    onClick={onLogout}
                    className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"
                  >
                    Log Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNav('book-worker')}
                  className="w-full text-left px-3 py-2 text-sm font-bold text-[#142B4A] bg-[#FFF5DC] rounded-lg flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4 text-[#142B4A]" />
                  Book Station Worker
                </button>
                <button
                  onClick={() => handleNav('register-complaint')}
                  className="w-full text-left px-3 py-2 text-sm font-semibold text-[#253247] hover:bg-[#FFF5DC] rounded-lg"
                >
                  Register a Complaint
                </button>
                <button
                  onClick={() => handleNav('login')}
                  className="w-full text-left px-3 py-2 text-sm font-semibold text-[#253247] hover:bg-[#FFF5DC] rounded-lg"
                >
                  Track Complaint
                </button>
                <div className="pt-2 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleNav('login')}
                    className="w-full py-2 text-center text-sm font-semibold text-[#142B4A] border border-[#E8E2D3] bg-white rounded-lg"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleNav('register')}
                    className="w-full py-2 text-center text-sm font-bold text-white bg-[#142B4A] rounded-lg"
                  >
                    Register
                  </button>
                </div>
                <div className="pt-2 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleNav('worker-login')}
                    className="w-full py-2 text-center text-xs font-bold text-[#142B4A] bg-[#FFF5DC] border border-[#E9B949]/50 rounded-lg flex items-center justify-center gap-1"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-[#E9B949]" />
                    Worker Portal
                  </button>
                  <button
                    onClick={() => handleNav('admin-login')}
                    className="w-full py-2 text-center text-xs font-semibold text-[#6B7280] hover:text-[#142B4A] border border-[#E8E2D3] rounded-lg flex items-center justify-center gap-1"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#E9B949]" />
                    Admin Portal
                  </button>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </header>
  );
};

