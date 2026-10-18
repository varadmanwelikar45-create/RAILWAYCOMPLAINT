import React from 'react';
import trainHeroImg from '../assets/images/rail_care_train_hero_1792164300650.jpg';
import { ViewMode, User, Complaint } from '../types';
import { 
  FileText, 
  Shield, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Sparkles, 
  Train, 
  Users, 
  Briefcase,
  Lock,
  UserCheck,
  Zap,
  MapPin
} from 'lucide-react';

interface LandingPageProps {
  currentUser: User | null;
  complaints?: Complaint[];
  onNavigate: (view: ViewMode) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  currentUser,
  complaints = [],
  onNavigate,
}) => {
  // Compute real statistics if complaints are present
  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c?.status === 'Pending').length;
  const inProgressCount = complaints.filter((c) => c?.status === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c?.status === 'Resolved').length;

  return (
    <div className="space-y-14 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* SECTION 1: HERO SECTION */}
      <section className="pt-2 lg:pt-6 pb-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Text */}
          <div className="lg:col-span-6 space-y-5 text-left">
            
            {/* Small Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFF5DC] border border-[#E9B949]/40 text-[#142B4A] text-xs font-bold tracking-wider uppercase">
              <Train className="w-3.5 h-3.5 text-[#E9B949]" />
              INDIAN RAILWAYS · CENTRAL GRIEVANCE & WORKFORCE
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-[#142B4A] tracking-tight leading-[1.12]">
              Your Journey.<br />
              <span className="text-[#E9B949] drop-shadow-xs">Your Voice.</span><br />
              Our Responsibility.
            </h1>

            {/* Supporting Paragraph */}
            <p className="text-base sm:text-lg text-[#6B7280] leading-relaxed max-w-xl font-normal">
              RAIL CARE provides unified grievance redressal, real-time complaint tracking, and on-demand station gig worker services across Indian Railways.
            </p>

            {/* Trust Statement */}
            <div className="pt-2 border-t border-[#E8E2D3] flex items-center gap-2 text-xs font-semibold text-[#6B7280]">
              <span className="w-2 h-2 rounded-full bg-[#21865B] animate-pulse"></span>
              <span>Select your portal below to sign in or get started.</span>
            </div>

          </div>

          {/* Right Column: Realistic Train Visual */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto rounded-3xl overflow-hidden shadow-xl border-4 border-white ring-1 ring-[#E8E2D3] bg-[#FFF5DC]/50">
              
              {/* Train Photo */}
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
                className="w-full h-auto max-h-[440px] object-cover object-center transform hover:scale-[1.02] transition-transform duration-700"
              />

              {/* Elegant Caption Overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#142B4A]/90 via-[#142B4A]/50 to-transparent p-5 text-white">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E9B949] animate-pulse"></span>
                    <span className="text-white/95 tracking-wide">RAIL CARE INTEGRATED PLATFORM</span>
                  </div>
                  <span className="text-[#F8E7B0] font-mono">24x7 REDRESSAL</span>
                </div>
              </div>

            </div>

            {/* Subtle Gold Decorative Glow Behind Card */}
            <div className="absolute -bottom-4 -right-4 w-64 h-64 bg-[#E9B949]/15 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          </div>

        </div>
      </section>

      {/* SECTION 2: THREE DEDICATED ROLE PANELS (WORKER, PASSENGER, ADMIN) */}
      <section id="role-portals" className="pt-2">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF5DC] text-[#142B4A] text-xs font-bold uppercase tracking-wider mb-2 border border-[#E9B949]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#E9B949]" />
            <span>ROLE PORTALS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] tracking-tight">
            Select Your Portal
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1.5">
            Choose your role to sign in directly to your dedicated workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          
          {/* ======================================================== */}
          {/* PANEL 1: SIGN IN AS A WORKER (GIG WORKER PORTAL)        */}
          {/* ======================================================== */}
          <div className="relative rounded-3xl border-2 border-[#E9B949] bg-gradient-to-b from-[#FFFDF5] to-[#FFF5DC]/50 p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#E9B949] text-[#142B4A] flex items-center justify-center border border-[#142B4A]/20 shadow-xs">
                  <Briefcase className="w-7 h-7" />
                </div>
                <span className="px-2.5 py-1 bg-[#142B4A] text-[#E9B949] text-[10px] font-extrabold uppercase rounded-full tracking-wider">
                  PANEL 1 · WORKER
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-[#142B4A] group-hover:text-[#243F63] transition-colors">
                  Gig Worker Portal
                </h3>
                <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                  For coach electricians, plumbers, housekeeping & station technicians to accept requests and manage duty.
                </p>
              </div>

              <div className="pt-3 border-t border-[#E8E2D3] space-y-2 text-xs text-[#253247] font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#21865B] shrink-0" />
                  <span>Station-matched job requests</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#21865B] shrink-0" />
                  <span>Live availability status (On/Off)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#21865B] shrink-0" />
                  <span>Official railway verification</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-[#E8E2D3] space-y-2.5">
              <button
                onClick={() => onNavigate('worker-login')}
                className="w-full py-3.5 px-4 bg-[#142B4A] hover:bg-[#243F63] text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md border border-[#142B4A] hover:border-[#E9B949]"
              >
                <span>Sign in as a Worker</span>
                <ArrowRight className="w-4 h-4 text-[#E9B949]" />
              </button>

              <button
                onClick={() => onNavigate('worker-register')}
                className="w-full py-2.5 px-3 bg-white hover:bg-[#FFF5DC] text-[#142B4A] text-xs font-bold rounded-xl transition border border-[#E8E2D3] text-center cursor-pointer"
              >
                New Worker? Register Here &rarr;
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* PANEL 2: SIGN IN AS A PASSENGER (PASSENGER PORTAL)      */}
          {/* ======================================================== */}
          <div className="relative rounded-3xl border-2 border-[#142B4A] bg-white p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#142B4A] text-[#E9B949] flex items-center justify-center border border-[#E9B949]/30 shadow-xs">
                  <Users className="w-7 h-7" />
                </div>
                <span className="px-2.5 py-1 bg-[#FFF5DC] text-[#142B4A] text-[10px] font-extrabold uppercase rounded-full border border-[#E9B949]/50 tracking-wider">
                  PANEL 2 · PASSENGER
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-[#142B4A] group-hover:text-[#243F63] transition-colors">
                  Passenger Portal
                </h3>
                <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                  Lodge travel complaints, track grievances in real-time, and book verified station gig workers for on-train assistance.
                </p>
              </div>

              <div className="pt-3 border-t border-[#E8E2D3] space-y-2 text-xs text-[#253247] font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#21865B] shrink-0" />
                  <span>File complaints with PNR / Train No.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#21865B] shrink-0" />
                  <span>Real-time FIFO queue tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#21865B] shrink-0" />
                  <span>Book verified station gig workers</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-[#E8E2D3] space-y-2.5">
              <button
                onClick={() => onNavigate(currentUser && !currentUser.isAdmin ? 'user-dashboard' : 'login')}
                className="w-full py-3.5 px-4 bg-[#142B4A] hover:bg-[#243F63] text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md border border-[#142B4A] hover:border-[#E9B949]"
              >
                <span>{currentUser && !currentUser.isAdmin ? 'Go to My Dashboard' : 'Sign in as a Passenger'}</span>
                <ArrowRight className="w-4 h-4 text-[#E9B949]" />
              </button>

              <button
                onClick={() => onNavigate('register')}
                className="w-full py-2.5 px-3 bg-[#FFF5DC] hover:bg-[#E9B949]/30 text-[#142B4A] text-xs font-bold rounded-xl transition border border-[#E9B949]/50 text-center cursor-pointer"
              >
                New Passenger? Create Account &rarr;
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* PANEL 3: SIGN IN AS AN ADMIN (OFFICER PORTAL)           */}
          {/* ======================================================== */}
          <div className="relative rounded-3xl border-2 border-[#243F63]/30 bg-gradient-to-b from-white to-[#F8FAFC] p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#243F63] text-[#E9B949] flex items-center justify-center border border-[#E9B949]/30 shadow-xs">
                  <Shield className="w-7 h-7" />
                </div>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase rounded-full tracking-wider border border-slate-200">
                  PANEL 3 · ADMIN
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-[#142B4A] group-hover:text-[#243F63] transition-colors">
                  Administrator Portal
                </h3>
                <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                  Official control center for railway officers to review complaints, verify gig workers, and monitor operations.
                </p>
              </div>

              <div className="pt-3 border-t border-[#E8E2D3] space-y-2 text-xs text-[#253247] font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#21865B] shrink-0" />
                  <span>Review & verify gig workers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#21865B] shrink-0" />
                  <span>Process FIFO complaint queue</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#21865B] shrink-0" />
                  <span>Divisional analytics & reports</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-[#E8E2D3] space-y-2.5">
              <button
                onClick={() => onNavigate(currentUser?.isAdmin ? 'admin-dashboard' : 'admin-login')}
                className="w-full py-3.5 px-4 bg-[#243F63] hover:bg-[#142B4A] text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md border border-[#243F63] hover:border-[#E9B949]"
              >
                <Lock className="w-4 h-4 text-[#E9B949]" />
                <span>{currentUser?.isAdmin ? 'Go to Admin Center' : 'Sign in as an Admin'}</span>
              </button>

              <div className="text-center text-[11px] text-[#6B7280] py-1 font-medium">
                Authorized Railway Officers Only
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
              {totalCount}
            </div>
            <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mt-1">
              Total Grievances
            </div>
          </div>

          <div className="text-center pt-3 sm:pt-0 sm:pl-6">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#D99520] font-mono tabular-nums">
              {pendingCount}
            </div>
            <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mt-1">
              Pending Review
            </div>
          </div>

          <div className="text-center pt-3 sm:pt-0 sm:pl-6">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#315F91] font-mono tabular-nums">
              {inProgressCount}
            </div>
            <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mt-1">
              In Progress
            </div>
          </div>

          <div className="text-center pt-3 sm:pt-0 sm:pl-6">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#21865B] font-mono tabular-nums">
              {resolvedCount}
            </div>
            <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mt-1">
              Resolved
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 4: HOW RAIL CARE WORKS */}
      <section className="bg-[#FFF5DC]/60 rounded-3xl border border-[#E8E2D3] p-8 sm:p-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-extrabold text-[#E9B949] uppercase tracking-widest mb-1">
            SEAMLESS RESOLUTION
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A]">
            How RAIL CARE Works
          </h2>
          <p className="text-sm text-[#6B7280] mt-1">
            Integrated complaint resolution and station gig assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Step 1 */}
          <div className="bg-white rounded-2xl border border-[#E8E2D3] p-6 sm:p-8 relative shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#142B4A] text-[#E9B949] font-extrabold flex items-center justify-center mb-4 text-lg border border-[#E9B949]/40 shadow-xs">
              01
            </div>
            <h3 className="text-lg font-bold text-[#142B4A] mb-2">
              Lodge or Book
            </h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Submit a passenger grievance or book a verified gig worker for upcoming station assistance.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl border border-[#E8E2D3] p-6 sm:p-8 relative shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#142B4A] text-[#E9B949] font-extrabold flex items-center justify-center mb-4 text-lg border border-[#E9B949]/40 shadow-xs">
              02
            </div>
            <h3 className="text-lg font-bold text-[#142B4A] mb-2">
              Officer Review & Queue
            </h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Complaints are queued via First-In-First-Out (FIFO) algorithms and assigned workers are verified by divisional officers.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl border border-[#E8E2D3] p-6 sm:p-8 relative shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#142B4A] text-[#E9B949] font-extrabold flex items-center justify-center mb-4 text-lg border border-[#E9B949]/40 shadow-xs">
              03
            </div>
            <h3 className="text-lg font-bold text-[#142B4A] mb-2">
              Live Resolution Tracking
            </h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Track status updates across all passenger and worker devices with instant database persistence.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};
