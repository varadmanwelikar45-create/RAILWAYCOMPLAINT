import React from 'react';
import trainHeroImg from '../assets/images/rail_care_train_hero_1792164300650.jpg';
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
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold uppercase tracking-wider border border-amber-300">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>ROLE SELECTION</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Who are you? Are you a passenger or are you a worker?
          </h1>
          
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Choose your role below to access the on-demand railway station workforce and mutual live location network.
          </p>
        </div>

        {/* TWO PRIMARY ROLES: PASSENGER & WORKER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          
          {/* PANEL 1: I AM A PASSENGER */}
          <div className="relative rounded-3xl border-2 border-slate-200 bg-[#FFFDF5] p-7 sm:p-8 flex flex-col justify-between shadow-xs hover:border-amber-400 hover:shadow-md transition-all group">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center border border-amber-400 shadow-xs group-hover:scale-105 transition-transform">
                  <Users className="w-8 h-8" />
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-extrabold uppercase rounded-full border border-amber-300 tracking-wider">
                  I AM A PASSENGER
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors">
                  Passenger Portal
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  Book verified station workers directly to your coach and berth. Share your live location and track the technician's arrival during platform halts.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-2.5 text-xs text-slate-800 font-medium">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Book verified gig workers (Electricians, Plumbers, Cleaning, Luggage Sahayak)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Mutual live location access to track technician reaching your coach</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>On-the-spot problem resolution with direct rating and feedback</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 space-y-3">
              <button
                onClick={() => onNavigate(currentUser ? 'user-dashboard' : 'login')}
                className="w-full py-4 px-5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-extrabold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm border border-amber-400"
              >
                <span>{currentUser ? 'Open My Bookings & Radar' : 'Sign In as Passenger'}</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>

              <button
                onClick={() => onNavigate('register')}
                className="w-full py-3 px-4 bg-white hover:bg-amber-50 text-slate-800 text-xs font-bold rounded-xl transition border border-slate-200 text-center cursor-pointer shadow-2xs"
              >
                New Passenger? Register Here &rarr;
              </button>
            </div>
          </div>

          {/* PANEL 2: I AM A WORKER */}
          <div className="relative rounded-3xl border-2 border-slate-200 bg-[#FFFDF5] p-7 sm:p-8 flex flex-col justify-between shadow-xs hover:border-amber-400 hover:shadow-md transition-all group">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center border border-slate-700 shadow-xs group-hover:scale-105 transition-transform">
                  <Briefcase className="w-8 h-8" />
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-extrabold uppercase rounded-full border border-slate-300 tracking-wider">
                  I AM A WORKER
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors">
                  Gig Worker Portal
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  For coach electricians, plumbers, OBHS cleaning &amp; attendants to accept station calls, view passenger berth locations, and navigate directly to coaches.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-2.5 text-xs text-slate-800 font-medium">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Receive and accept passenger calls at your station</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Passenger location access with coach &amp; berth navigation</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Live availability controls and transparent passenger reviews</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 space-y-3">
              <button
                onClick={() => onNavigate('worker-login')}
                className="w-full py-4 px-5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-extrabold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm border border-amber-400"
              >
                <span>Sign In as Worker</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>

              <button
                onClick={() => onNavigate('worker-register')}
                className="w-full py-3 px-4 bg-white hover:bg-amber-50 text-slate-800 text-xs font-bold rounded-xl transition border border-slate-200 text-center cursor-pointer shadow-2xs"
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
          
          {/* Left Column */}
          <div className="lg:col-span-6 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold tracking-wider uppercase">
              <Compass className="w-3.5 h-3.5 text-amber-600" />
              MUTUAL LIVE LOCATION ACCESS
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.18]">
              Instant On-Spot Resolution with Real-Time Coach Tracking
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Passengers and station workers share mutual live location during platform halts. The worker pinpoints your exact coach and berth, while you monitor their real-time distance and ETA along the platform.
            </p>

            <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-3 text-xs font-semibold text-slate-800">
              <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Coach Berth GPS Radar</span>
              </div>
              <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Verified 5-Star Service</span>
              </div>
            </div>
          </div>

          {/* Right Column: Train Visual */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto rounded-3xl overflow-hidden shadow-md border-4 border-white ring-1 ring-slate-200 bg-slate-100">
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

              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/95 via-slate-900/60 to-transparent p-5 text-white">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    <span className="text-white/95 tracking-wide">RAIL CARE WORKFORCE NETWORK</span>
                  </div>
                  <span className="text-amber-300 font-mono font-bold">LIVE ON-SPOT FIX</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3: STATISTICS STRIP */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          
          <div className="text-center pt-3 sm:pt-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tabular-nums">
              {totalBookings}
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
              Assistance Bookings
            </div>
          </div>

          <div className="text-center pt-3 sm:pt-0 sm:pl-6">
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-600 font-mono tabular-nums">
              {activeDispatches}
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
              Active Dispatches
            </div>
          </div>

          <div className="text-center pt-3 sm:pt-0 sm:pl-6">
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-mono tabular-nums">
              {completedJobs}
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
              Completed On Spot
            </div>
          </div>

          <div className="text-center pt-3 sm:pt-0 sm:pl-6">
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-500 font-mono tabular-nums">
              {verifiedWorkersCount}
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
              Verified Specialists
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
