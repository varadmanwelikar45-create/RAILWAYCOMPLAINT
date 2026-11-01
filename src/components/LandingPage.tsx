import React from 'react';
import { ViewMode, User, WorkerServiceRequest, Worker } from '../types';
import { 
  CheckCircle2, 
  ArrowRight,
  Users, 
  Briefcase,
  Train, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface LandingPageProps {
  currentUser: User | null;
  complaints?: any[];
  workerRequests?: WorkerServiceRequest[];
  workers?: Worker[];
  onNavigate: (view: ViewMode) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  currentUser,
  onNavigate,
}) => {
  return (
    <div className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DDF8EF] text-[#1E6B52] text-xs font-bold uppercase tracking-wider border border-[#65D6B0]/40">
          <Train className="w-3.5 h-3.5 text-[#3EA684]" />
          <span>VYOMRATH · RAILWAY COMPLAINT REDRESSAL</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-black text-[#202A2B] tracking-tight">
          Select Your Portal
        </h1>
        
        <p className="text-xs sm:text-sm text-[#526365]">
          Connect passengers, authorized gig technicians, and railway divisional officers for swift complaint resolution.
        </p>
      </div>

      {/* 3 Streamlined Portals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Portal 1: Passenger */}
        <div className="bg-white rounded-2xl border border-[#DDE4E6] p-6 flex flex-col justify-between shadow-xs hover:border-[#65D6B0] transition-all">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#202A2B] text-[#65D6B0] flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-[#1E6B52] bg-[#DDF8EF] px-2 py-0.5 rounded">
                Passenger
              </span>
              <h2 className="text-lg font-black text-[#202A2B] mt-1.5">
                Passenger Portal
              </h2>
              <p className="text-xs text-[#526365] mt-1">
                File AI voice/photo grievances, track assigned technician arrival at your berth, and verify resolution proofs.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#DDE4E6] space-y-2">
            <button
              onClick={() => onNavigate(currentUser ? 'user-dashboard' : 'login')}
              className="w-full py-2.5 px-3 bg-[#202A2B] hover:bg-[#202A2B]/90 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{currentUser ? 'Open Dashboard' : 'Passenger Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#65D6B0]" />
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="w-full py-2 px-3 text-[#526365] hover:text-[#202A2B] text-xs font-semibold rounded-lg text-center cursor-pointer"
            >
              New Passenger? Register
            </button>
          </div>
        </div>

        {/* Portal 2: Gig Worker */}
        <div className="bg-white rounded-2xl border border-[#DDE4E6] p-6 flex flex-col justify-between shadow-xs hover:border-[#007D99] transition-all">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#007D99] text-white flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-[#007D99] bg-[#D7F7FC] px-2 py-0.5 rounded">
                Gig Worker
              </span>
              <h2 className="text-lg font-black text-[#202A2B] mt-1.5">
                Gig Worker Panel
              </h2>
              <p className="text-xs text-[#526365] mt-1">
                Accept assigned coach tasks during scheduled halts, navigate to passenger berths, and upload Before/After photo proof.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#DDE4E6] space-y-2">
            <button
              onClick={() => onNavigate('worker-login')}
              className="w-full py-2.5 px-3 bg-[#007D99] hover:bg-[#007D99]/90 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Worker Sign In</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D7F7FC]" />
            </button>
            <button
              onClick={() => onNavigate('worker-register')}
              className="w-full py-2 px-3 text-[#526365] hover:text-[#202A2B] text-xs font-semibold rounded-lg text-center cursor-pointer"
            >
              New Gig Worker? Register
            </button>
          </div>
        </div>

        {/* Portal 3: Govt Officer */}
        <div className="bg-white rounded-2xl border border-[#DDE4E6] p-6 flex flex-col justify-between shadow-xs hover:border-amber-400 transition-all">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-slate-950" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-amber-900 bg-yellow-100 px-2 py-0.5 rounded">
                Official
              </span>
              <h2 className="text-lg font-black text-[#202A2B] mt-1.5">
                Officer Control Center
              </h2>
              <p className="text-xs text-[#526365] mt-1">
                Verify worker credentials, dispatch technicians to coach grievances, and monitor CAG 2-hour SLA compliance.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#DDE4E6] space-y-2">
            <button
              onClick={() => onNavigate(currentUser?.isAdmin ? 'admin-dashboard' : 'admin-login')}
              className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{currentUser?.isAdmin ? 'Open Officer Dashboard' : 'Officer Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
            </button>
            <div className="py-2 text-[11px] text-[#7E9092] text-center">
              Divisional Administration
            </div>
          </div>
        </div>

      </div>

      {/* Quick Action Strip: AI Grievance */}
      <div className="bg-white rounded-2xl border border-[#DDE4E6] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#DDF8EF] text-[#1E6B52] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-[#3EA684]" />
          </div>
          <div>
            <strong className="text-[#202A2B] block">Have an onboard railway issue right now?</strong>
            <span className="text-[#526365]">Upload an image or voice description; AI categorizes and alerts station personnel.</span>
          </div>
        </div>
        <button
          onClick={() => onNavigate(currentUser ? 'register-complaint' : 'login')}
          className="px-4 py-2 bg-[#65D6B0] hover:bg-[#3EA684] text-[#202A2B] font-bold rounded-xl shrink-0 cursor-pointer transition"
        >
          Report Issue &rarr;
        </button>
      </div>

    </div>
  );
};
