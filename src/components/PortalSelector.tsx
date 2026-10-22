import React, { useState } from 'react';
import { ViewMode, User, Worker } from '../types';
import { Users, Briefcase, ArrowRight, ArrowLeft, UserPlus, Train, ShieldCheck } from 'lucide-react';

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
  const [showRegisterChoice, setShowRegisterChoice] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between mb-8">
        {onBack ? (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#202A2B] hover:text-[#B94A3A] bg-white px-3.5 py-2 rounded-xl border border-[#DDE4E6] shadow-xs transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#B94A3A]" />
            <span>Back</span>
          </button>
        ) : <div />}

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#DDF8EF] text-[#1E6B52] text-xs font-bold uppercase tracking-wider border border-[#65D6B0]/40">
          <ShieldCheck className="w-3.5 h-3.5 text-[#3EA684]" />
          <span>VYOM RATH SECURE ACCESS</span>
        </div>
      </div>

      {/* Main Authentication Container */}
      <div className="bg-white rounded-3xl border border-[#DDE4E6] p-6 sm:p-10 shadow-sm space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#202A2B] text-[#65D6B0] shadow-sm mb-2">
            <Train className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#202A2B] tracking-tight">
            VYOM RATH
          </h1>
          <p className="text-xs sm:text-sm text-[#526365] font-medium">
            Please choose an action below to proceed.
          </p>
        </div>

        {/* The 3 Primary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
          
          {/* Action 1: Login as Passenger */}
          <div className="rounded-2xl border-2 border-[#DDE4E6] hover:border-[#65D6B0] bg-[#F8FAFB] p-6 flex flex-col justify-between transition-all hover:shadow-md group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#DDF8EF] text-[#1E6B52] flex items-center justify-center border border-[#65D6B0]/30 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6 text-[#3EA684]" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#7E9092] uppercase tracking-wider">
                  Action 1
                </span>
                <h2 className="text-lg font-black text-[#202A2B] group-hover:text-[#1E6B52] transition-colors mt-0.5">
                  Passenger Login
                </h2>
                <p className="text-xs text-[#526365] mt-1.5 leading-relaxed">
                  Access your coach bookings, request station sahayaks, and view live technician radar.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#DDE4E6]">
              <button
                onClick={() => {
                  if (currentUser && !currentUser.isAdmin) {
                    onNavigate('user-dashboard');
                  } else {
                    onNavigate('login');
                  }
                  onClose?.();
                }}
                className="w-full py-3 px-4 bg-[#202A2B] hover:bg-[#202A2B]/90 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs border border-[#202A2B]"
              >
                <span>{currentUser ? 'Open Dashboard' : 'Login as Passenger'}</span>
                <ArrowRight className="w-4 h-4 text-[#65D6B0]" />
              </button>
            </div>
          </div>

          {/* Action 2: Login as Worker */}
          <div className="rounded-2xl border-2 border-[#DDE4E6] hover:border-[#00B8D9] bg-[#F8FAFB] p-6 flex flex-col justify-between transition-all hover:shadow-md group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#D7F7FC] text-[#007D99] flex items-center justify-center border border-[#00B8D9]/30 group-hover:scale-105 transition-transform">
                <Briefcase className="w-6 h-6 text-[#007D99]" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#7E9092] uppercase tracking-wider">
                  Action 2
                </span>
                <h2 className="text-lg font-black text-[#202A2B] group-hover:text-[#007D99] transition-colors mt-0.5">
                  Worker Login
                </h2>
                <p className="text-xs text-[#526365] mt-1.5 leading-relaxed">
                  For registered railway electricians, plumbers, OBHS cleaners, and station porters.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#DDE4E6]">
              <button
                onClick={() => {
                  if (currentWorker) {
                    onNavigate('worker-dashboard');
                  } else {
                    onNavigate('worker-login');
                  }
                  onClose?.();
                }}
                className="w-full py-3 px-4 bg-[#007D99] hover:bg-[#007D99]/90 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs border border-[#007D99]"
              >
                <span>{currentWorker ? 'Open Duty Hub' : 'Login as Worker'}</span>
                <ArrowRight className="w-4 h-4 text-[#D7F7FC]" />
              </button>
            </div>
          </div>

          {/* Action 3: Register */}
          <div className="rounded-2xl border-2 border-[#DDE4E6] hover:border-[#B94A3A] bg-[#F8FAFB] p-6 flex flex-col justify-between transition-all hover:shadow-md group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#F3D8D2] text-[#7D2E27] flex items-center justify-center border border-[#B94A3A]/30 group-hover:scale-105 transition-transform">
                <UserPlus className="w-6 h-6 text-[#B94A3A]" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#7E9092] uppercase tracking-wider">
                  Action 3
                </span>
                <h2 className="text-lg font-black text-[#202A2B] group-hover:text-[#B94A3A] transition-colors mt-0.5">
                  Create Account
                </h2>
                <p className="text-xs text-[#526365] mt-1.5 leading-relaxed">
                  New to VYOM RATH? Register easily as either a passenger or a railway gig worker.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#DDE4E6]">
              {!showRegisterChoice ? (
                <button
                  onClick={() => setShowRegisterChoice(true)}
                  className="w-full py-3 px-4 bg-[#B94A3A] hover:bg-[#7D2E27] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs border border-[#B94A3A]"
                >
                  <span>Register</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              ) : (
                <div className="space-y-2 animate-fadeIn">
                  <button
                    onClick={() => {
                      onNavigate('register');
                      onClose?.();
                    }}
                    className="w-full py-2 px-3 bg-white hover:bg-[#DDF8EF] text-[#202A2B] hover:text-[#1E6B52] border border-[#DDE4E6] text-xs font-bold rounded-lg transition text-left flex items-center justify-between cursor-pointer"
                  >
                    <span>As Passenger</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#3EA684]" />
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('worker-register');
                      onClose?.();
                    }}
                    className="w-full py-2 px-3 bg-white hover:bg-[#D7F7FC] text-[#202A2B] hover:text-[#007D99] border border-[#DDE4E6] text-xs font-bold rounded-lg transition text-left flex items-center justify-between cursor-pointer"
                  >
                    <span>As Worker</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#007D99]" />
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-[#DDE4E6] text-center text-xs text-[#7E9092]">
          <span>VYOM RATH · Connected Indian Railways Passenger Assistance &amp; Gig Workforce Network</span>
        </div>

      </div>
    </div>
  );
};
