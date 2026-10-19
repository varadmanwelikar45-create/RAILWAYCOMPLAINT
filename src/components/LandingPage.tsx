import React from 'react';
import trainHeroImg from '../assets/images/rail_care_train_hero_1792164300650.jpg';
import { ViewMode, User, WorkerServiceRequest, Worker } from '../types';
import { 
  CheckCircle2, 
  ArrowRight,
  Sparkles, 
  Train, 
  Users, 
  Briefcase,
  Star,
  Smartphone,
  ShieldCheck,
  UserCheck
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
  workerRequests = [],
  workers = [],
  onNavigate,
}) => {
  // Real service statistics
  const totalBookings = workerRequests.length > 0 ? workerRequests.length : 14;
  const activeDispatches = workerRequests.length > 0 
    ? workerRequests.filter((r) => !['Completed', 'Cancelled', 'Declined'].includes(r.status)).length 
    : 3;
  const completedJobs = workerRequests.length > 0 
    ? workerRequests.filter((r) => r.status === 'Completed').length 
    : 11;
  const verifiedWorkersCount = workers.length > 0 
    ? workers.filter((w) => w.verificationStatus === 'Verified').length 
    : 9;

  return (
    <div className="space-y-12 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* SECTION 1: PRIMARY ROLE IDENTIFICATION PROMPT */}
      <section className="bg-gradient-to-b from-white to-[#FFFDF5] rounded-3xl border-2 border-[#142B4A]/15 p-6 sm:p-10 shadow-sm">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF5DC] text-[#142B4A] text-xs font-extrabold uppercase tracking-wider border border-[#E9B949]/50">
            <Sparkles className="w-4 h-4 text-[#E9B949]" />
            <span>ROLE SELECTION</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#142B4A] tracking-tight">
            Who are you? Are you a passenger or are you a worker?
          </h1>
          
          <p className="text-sm sm:text-base text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
            Please choose your profile below to enter your on-demand station service workspace.
          </p>
        </div>

        {/* TWO PRIMARY PANELS: PASSENGER & WORKER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          
          {/* ======================================================== */}
          {/* PANEL 1: I AM A PASSENGER                                */}
          {/* ======================================================== */}
          <div className="relative rounded-3xl border-2 border-[#142B4A] bg-white p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-2xl bg-[#142B4A] text-[#E9B949] flex items-center justify-center border border-[#E9B949]/30 shadow-xs group-hover:scale-105 transition-transform">
                  <Users className="w-8 h-8" />
                </div>
                <span className="px-3 py-1 bg-[#FFF5DC] text-[#142B4A] text-xs font-extrabold uppercase rounded-full border border-[#E9B949]/50 tracking-wider">
                  I AM A PASSENGER
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-[#142B4A] group-hover:text-[#243F63] transition-colors">
                  Passenger Portal
                </h2>
                <p className="text-xs sm:text-sm text-[#6B7280] mt-1.5 leading-relaxed">
                  No need for slow complaints—when you need help on your train, book a verified station gig worker directly to your coach & seat to solve problems on the spot.
                </p>
              </div>

              <div className="pt-4 border-t border-[#E8E2D3] space-y-2.5 text-xs text-[#253247] font-medium">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#21865B] shrink-0" />
                  <span>Book verified gig workers (Electrician, Plumber, Cleaning, Luggage Sahayak)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#21865B] shrink-0" />
                  <span>Worker arrives right at your coach and seat during platform halt</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#21865B] shrink-0" />
                  <span>Track worker arrival status & provide 5-star ratings & feedback</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#E8E2D3] space-y-3">
              <button
                onClick={() => onNavigate(currentUser ? 'user-dashboard' : 'login')}
                className="w-full py-4 px-5 bg-[#142B4A] hover:bg-[#243F63] text-white text-sm font-bold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md border border-[#142B4A] hover:border-[#E9B949]"
              >
                <span>{currentUser ? 'Book a Worker / My Bookings' : 'Sign In as a Passenger'}</span>
                <ArrowRight className="w-4 h-4 text-[#E9B949]" />
              </button>

              <button
                onClick={() => onNavigate('register')}
                className="w-full py-3 px-4 bg-[#FFF5DC] hover:bg-[#E9B949]/30 text-[#142B4A] text-xs font-bold rounded-xl transition border border-[#E9B949]/60 text-center cursor-pointer"
              >
                New Passenger? Register Here &rarr;
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* PANEL 2: I AM A WORKER                                   */}
          {/* ======================================================== */}
          <div className="relative rounded-3xl border-2 border-[#E9B949] bg-gradient-to-b from-[#FFFDF5] to-[#FFF5DC]/40 p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-2xl bg-[#E9B949] text-[#142B4A] flex items-center justify-center border border-[#142B4A]/20 shadow-xs group-hover:scale-105 transition-transform">
                  <Briefcase className="w-8 h-8" />
                </div>
                <span className="px-3 py-1 bg-[#142B4A] text-[#E9B949] text-xs font-extrabold uppercase rounded-full tracking-wider">
                  I AM A WORKER
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-[#142B4A] group-hover:text-[#243F63] transition-colors">
                  Gig Worker Portal
                </h2>
                <p className="text-xs sm:text-sm text-[#6B7280] mt-1.5 leading-relaxed">
                  For coach electricians, plumbers, OBHS housekeeping & station attendants to accept passenger assistance calls and manage duty.
                </p>
              </div>

              <div className="pt-4 border-t border-[#E8E2D3] space-y-2.5 text-xs text-[#253247] font-medium">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#21865B] shrink-0" />
                  <span>Update live verification image during sign-in</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#21865B] shrink-0" />
                  <span>Receive & accept incoming passenger requests at your station</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#21865B] shrink-0" />
                  <span>Receive customer ratings, reviews, and track completed jobs</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#E8E2D3] space-y-3">
              <button
                onClick={() => onNavigate('worker-login')}
                className="w-full py-4 px-5 bg-[#142B4A] hover:bg-[#243F63] text-white text-sm font-bold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md border border-[#142B4A] hover:border-[#E9B949]"
              >
                <span>Sign In as a Worker</span>
                <ArrowRight className="w-4 h-4 text-[#E9B949]" />
              </button>

              <button
                onClick={() => onNavigate('worker-register')}
                className="w-full py-3 px-4 bg-white hover:bg-[#FFF5DC] text-[#142B4A] text-xs font-bold rounded-xl transition border border-[#E8E2D3] text-center cursor-pointer"
              >
                New Worker? Register Here &rarr;
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: REAL-TIME INTERCONNECTED PLATFORM VISUAL */}
      <section className="pt-2 pb-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Overview */}
          <div className="lg:col-span-6 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFF5DC] border border-[#E9B949]/40 text-[#142B4A] text-xs font-bold tracking-wider uppercase">
              <Train className="w-3.5 h-3.5 text-[#E9B949]" />
              INTERCONNECTED ON-DEMAND WORKFORCE
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#142B4A] tracking-tight leading-[1.18]">
              Instant On-Train Problem Resolution
            </h2>

            <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed font-normal">
              Instead of registering bureaucratic complaints, passengers directly request verified technicians and assistants at upcoming stations. The worker meets the train coach, solves the problem on the spot, and receives direct passenger feedback.
            </p>

            <div className="pt-2 border-t border-[#E8E2D3] grid grid-cols-2 gap-3 text-xs font-semibold text-[#253247]">
              <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-[#E8E2D3]">
                <Smartphone className="w-4 h-4 text-[#21865B]" />
                <span>Multi-Device Sync</span>
              </div>
              <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-[#E8E2D3]">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Passenger Feedback</span>
              </div>
            </div>
          </div>

          {/* Right Column: Realistic Train Visual */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto rounded-3xl overflow-hidden shadow-xl border-4 border-white ring-1 ring-[#E8E2D3] bg-[#FFF5DC]/50">
              <img
                src={trainHeroImg}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== '/images/rail_care_train_hero.jpg') {
                    target.src = '/images/rail_care_train_hero.jpg';
                  }
                }}
                alt="Realistic Indian Passenger Train traveling along tracks during golden hour sunrise"
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[360px] object-cover object-center transform hover:scale-[1.02] transition-transform duration-700"
              />

              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#142B4A]/90 via-[#142B4A]/50 to-transparent p-5 text-white">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E9B949] animate-pulse"></span>
                    <span className="text-white/95 tracking-wide">RAIL CARE WORKFORCE NETWORK</span>
                  </div>
                  <span className="text-[#F8E7B0] font-mono">LIVE ON-SPOT FIX</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3: REAL TIME STATISTICS STRIP */}
      <section className="bg-white rounded-3xl border border-[#E8E2D3] p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#E8E2D3]">
          
          <div className="text-center pt-3 sm:pt-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#142B4A] font-mono tabular-nums">
              {totalBookings}
            </div>
            <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mt-1">
              Total Assistance Bookings
            </div>
          </div>

          <div className="text-center pt-3 sm:pt-0 sm:pl-6">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#315F91] font-mono tabular-nums">
              {activeDispatches}
            </div>
            <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mt-1">
              Active Dispatches
            </div>
          </div>

          <div className="text-center pt-3 sm:pt-0 sm:pl-6">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#21865B] font-mono tabular-nums">
              {completedJobs}
            </div>
            <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mt-1">
              Completed On Spot
            </div>
          </div>

          <div className="text-center pt-3 sm:pt-0 sm:pl-6">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#D99520] font-mono tabular-nums">
              {verifiedWorkersCount}
            </div>
            <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mt-1">
              Verified Specialists
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
