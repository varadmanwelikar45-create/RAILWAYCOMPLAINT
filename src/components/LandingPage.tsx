import React from 'react';
import { ViewMode, User } from '../types';
import { 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Train,
  UserPlus,
  LogIn
} from 'lucide-react';

interface LandingPageProps {
  currentUser: User | null;
  onNavigate: (view: ViewMode) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  currentUser,
  onNavigate,
}) => {
  return (
    <div className="space-y-12 py-8 max-w-6xl mx-auto px-4">
      
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto pt-6 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-xs font-semibold tracking-wide uppercase mb-4">
          <Train className="w-3.5 h-3.5" />
          Railway Grievance Redressal Portal
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#12304A] tracking-tight mb-4 leading-tight">
          RailCare Complaint Portal
        </h1>
        
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          A modern, transparent grievance portal for railway passengers. Register your travel complaints, track resolution progress in real time, and receive prompt departmental redressal.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <button
            onClick={() => onNavigate(currentUser ? 'register-complaint' : 'register')}
            className="px-6 py-3 rounded-lg bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            {currentUser ? 'Register New Complaint' : 'Register as Passenger'}
          </button>
          
          <button
            onClick={() => onNavigate(currentUser ? (currentUser.isAdmin ? 'admin-dashboard' : 'user-dashboard') : 'login')}
            className="px-6 py-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-xs transition flex items-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-[#2563EB]" />
            {currentUser ? 'Go to Dashboard' : 'Passenger Login'}
          </button>

          <button
            onClick={() => onNavigate('admin-login')}
            className="px-6 py-3 rounded-lg bg-[#12304A] hover:bg-[#0c2033] text-white font-semibold text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Admin Portal
          </button>
        </div>
      </section>

      {/* Three Core Feature Cards */}
      <section className="pt-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#12304A]">How RailCare Works</h2>
          <p className="text-sm text-slate-500 mt-1">Simple 3-step grievance redressal process</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center mb-4 font-bold text-lg">
              01
            </div>
            <h3 className="text-lg font-bold text-[#12304A] mb-2">1. Register Account</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Create your passenger account in seconds. Once registered, log in to access your personal dashboard.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 font-bold text-lg">
              02
            </div>
            <h3 className="text-lg font-bold text-[#12304A] mb-2">2. Submit Grievance</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Enter your train number, journey date, category, and description. You receive a unique tracking reference immediately.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-4 font-bold text-lg">
              03
            </div>
            <h3 className="text-lg font-bold text-[#12304A] mb-2">3. Track & Resolve</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Monitor real-time progress from Pending review to In Progress divisional dispatch and final Resolved closure.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};
