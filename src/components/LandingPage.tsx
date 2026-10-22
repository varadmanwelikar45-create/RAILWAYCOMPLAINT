import React from 'react';
import { ViewMode, User, WorkerServiceRequest, Worker } from '../types';
import { 
  CheckCircle2, 
  ArrowRight,
  Sparkles, 
  Users, 
  Briefcase,
  Star,
  Compass,
  MapPin,
  Train,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import trainHeroImg from '../assets/images/rail_care_train_hero_1792164300650.jpg';

interface LandingPageProps {
  currentUser: User | null;
  complaints?: any[];
  workerRequests?: WorkerServiceRequest[];
  workers?: Worker[];
  onNavigate: (view: ViewMode) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  currentUser,
  workerRequests = [],
  workers = [],
  onNavigate,
}) => {
  const verifiedWorkersCount = workers.length > 0 
    ? workers.filter((w) => w.verificationStatus === 'Verified').length 
    : 8;

  return (
    <div className="space-y-12 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* SECTION 1: PRIMARY ROLE IDENTIFICATION PROMPT */}
      <section className="bg-white rounded-3xl border border-[#DDE4E6] p-6 sm:p-10 shadow-sm">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DDF8EF] text-[#1E6B52] text-xs font-black uppercase tracking-wider border border-[#65D6B0]/40">
            <Train className="w-4 h-4 text-[#3EA684]" />
            <span>VYOM RATH ON-DEMAND NETWORK</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#202A2B] tracking-tight">
            Indian Railways On-Demand Station Assistance
          </h1>
          
          <p className="text-sm sm:text-base text-[#526365] max-w-2xl mx-auto leading-relaxed">
            Select your role to access coach-level assistance, live technician tracking, and verified station gig services.
          </p>
        </div>

        {/* TWO PRIMARY ROLES: PASSENGER & WORKER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          
          {/* PANEL 1: PASSENGER PORTAL */}
          <div className="relative rounded-3xl border-2 border-[#DDE4E6] bg-[#F8FAFB] p-7 sm:p-8 flex flex-col justify-between shadow-xs hover:border-[#65D6B0] hover:shadow-md transition-all group">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-2xl bg-[#202A2B] text-[#65D6B0] flex items-center justify-center border border-[#202A2B] shadow-xs group-hover:scale-105 transition-transform">
                  <Users className="w-8 h-8" />
                </div>
                <span className="px-3 py-1 bg-[#DDF8EF] text-[#1E6B52] text-xs font-black uppercase rounded-full border border-[#65D6B0]/40 tracking-wider">
                  PASSENGER PORTAL
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-black text-[#202A2B] group-hover:text-[#1E6B52] transition-colors">
                  Passenger Services
                </h2>
                <p className="text-xs sm:text-sm text-[#526365] mt-1.5 leading-relaxed">
                  Book verified station workers directly to your coach and berth. Share your live coordinates and track the technician's arrival during platform halts.
                </p>
              </div>

              <div className="pt-4 border-t border-[#DDE4E6] space-y-2.5 text-xs text-[#202A2B] font-medium">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#3EA684] shrink-0" />
                  <span>Book verified gig workers (Electricians, Plumbers, Cleaning, Luggage Sahayak)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#3EA684] shrink-0" />
                  <span>Mutual live location access to track technician reaching your coach</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#3EA684] shrink-0" />
                  <span>On-the-spot problem resolution with direct rating and feedback</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#DDE4E6] space-y-3">
              <button
                onClick={() => onNavigate(currentUser ? 'user-dashboard' : 'login')}
                className="w-full py-4 px-5 bg-[#202A2B] hover:bg-[#202A2B]/90 text-white text-sm font-black rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs border border-[#202A2B]"
              >
                <span>{currentUser ? 'Open My Bookings & Radar' : 'Sign In as Passenger'}</span>
                <ArrowRight className="w-4 h-4 text-[#65D6B0]" />
              </button>

              <button
                onClick={() => onNavigate('register')}
                className="w-full py-3 px-4 bg-white hover:bg-[#DDF8EF] text-[#202A2B] hover:text-[#1E6B52] text-xs font-bold rounded-xl transition border border-[#DDE4E6] text-center cursor-pointer shadow-2xs"
              >
                New Passenger? Register Here &rarr;
              </button>
            </div>
          </div>

          {/* PANEL 2: WORKER PORTAL */}
          <div className="relative rounded-3xl border-2 border-[#DDE4E6] bg-[#F8FAFB] p-7 sm:p-8 flex flex-col justify-between shadow-xs hover:border-[#00B8D9] hover:shadow-md transition-all group">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-2xl bg-[#007D99] text-white flex items-center justify-center border border-[#007D99] shadow-xs group-hover:scale-105 transition-transform">
                  <Briefcase className="w-8 h-8" />
                </div>
                <span className="px-3 py-1 bg-[#D7F7FC] text-[#007D99] text-xs font-black uppercase rounded-full border border-[#00B8D9]/40 tracking-wider">
                  WORKER PORTAL
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-black text-[#202A2B] group-hover:text-[#007D99] transition-colors">
                  Gig Worker Portal
                </h2>
                <p className="text-xs sm:text-sm text-[#526365] mt-1.5 leading-relaxed">
                  For coach electricians, plumbers, OBHS cleaning &amp; attendants to accept station calls, view passenger berth locations, and navigate directly to coaches.
                </p>
              </div>

              <div className="pt-4 border-t border-[#DDE4E6] space-y-2.5 text-xs text-[#202A2B] font-medium">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#007D99] shrink-0" />
                  <span>Receive and accept passenger calls at your station</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#007D99] shrink-0" />
                  <span>Passenger location access with coach &amp; berth navigation</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#007D99] shrink-0" />
                  <span>Live availability controls and transparent passenger reviews</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#DDE4E6] space-y-3">
              <button
                onClick={() => onNavigate('worker-login')}
                className="w-full py-4 px-5 bg-[#007D99] hover:bg-[#007D99]/90 text-white text-sm font-black rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs border border-[#007D99]"
              >
                <span>Sign In as Worker</span>
                <ArrowRight className="w-4 h-4 text-[#D7F7FC]" />
              </button>

              <button
                onClick={() => onNavigate('worker-register')}
                className="w-full py-3 px-4 bg-white hover:bg-[#D7F7FC] text-[#202A2B] hover:text-[#007D99] text-xs font-bold rounded-xl transition border border-[#DDE4E6] text-center cursor-pointer shadow-2xs"
              >
                New Worker? Register Here &rarr;
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: MUTUAL LIVE LOCATION & ON-SPOT RESOLUTION */}
      <section className="pt-2 pb-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAE2FF] text-[#5032A5] text-xs font-black uppercase tracking-wider border border-[#8055E8]/30">
              <Sparkles className="w-3.5 h-3.5 text-[#8055E8]" />
              <span>COACH-SIDE RESOLUTION</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-[#202A2B] tracking-tight leading-tight">
              Rapid on-spot assistance during scheduled platform halts.
            </h2>

            <p className="text-sm text-[#526365] leading-relaxed">
              When traveling by train, minor issues—a tripped AC breaker, uncharged socket, clogged tap, or dirty berth—don't need to wait for divisional bureaucracy. VYOM RATH connects passengers directly with verified station technicians at upcoming halts.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-[#DDE4E6] shadow-2xs">
                <div className="text-2xl font-black text-[#202A2B]">{verifiedWorkersCount}+</div>
                <div className="text-xs text-[#526365] mt-0.5">Verified Station Personnel</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#DDE4E6] shadow-2xs">
                <div className="text-2xl font-black text-[#3EA684]">100%</div>
                <div className="text-xs text-[#526365] mt-0.5">Cross-Device Synchronized</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden border border-[#DDE4E6] shadow-sm bg-white">
              <img
                src={trainHeroImg}
                alt="VYOM RATH Indian Railways"
                className="w-full h-80 object-cover"
              />
              <div className="p-4 bg-[#202A2B] text-white flex items-center justify-between text-xs">
                <span className="font-bold text-[#65D6B0]">VYOM RATH Unified Station Dispatch</span>
                <span className="text-[#D7F7FC]">Active Service Roster</span>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
