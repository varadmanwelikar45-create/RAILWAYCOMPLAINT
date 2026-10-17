import React from 'react';
import trainHeroImg from '../assets/images/rail_care_train_hero_1792164300650.jpg';
import { ViewMode, User, Complaint } from '../types';
import { PortalSelector } from './PortalSelector';
import { 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Search,
  Sparkles,
  Train,
  Check,
  Building2,
  Users,
  Briefcase
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
    <div className="space-y-16 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* SECTION B: HERO SECTION (2-Column Split: Text + Realistic Train Visual) */}
      <section className="pt-4 lg:pt-8 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Text & Actions */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* Small Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFF5DC] border border-[#E9B949]/40 text-[#142B4A] text-xs font-bold tracking-wider uppercase">
              <Train className="w-3.5 h-3.5 text-[#E9B949]" />
              YOUR RAILWAY PASSENGER SERVICE PORTAL
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-[#142B4A] tracking-tight leading-[1.12]">
              Your Journey.<br />
              <span className="text-[#E9B949] drop-shadow-xs">Your Voice.</span><br />
              Our Responsibility.
            </h1>

            {/* Supporting Paragraph */}
            <p className="text-base sm:text-lg text-[#6B7280] leading-relaxed max-w-xl font-normal">
              Rail Care makes it easier to report railway-related issues, follow complaint progress, and stay informed through a simple and passenger-friendly digital experience.
            </p>

            {/* Prominent Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate(currentUser ? 'register-complaint' : 'register')}
                className="px-6 py-3.5 rounded-xl bg-[#142B4A] hover:bg-[#243F63] text-white font-bold text-sm shadow-md transition-all border border-[#142B4A] hover:border-[#E9B949] flex items-center gap-2.5 cursor-pointer group"
              >
                <span>Register a Complaint</span>
                <ArrowRight className="w-4 h-4 text-[#E9B949] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate(currentUser ? 'book-worker' : 'portal-selection')}
                className="px-6 py-3.5 rounded-xl bg-[#E9B949] hover:bg-[#d6a537] text-[#142B4A] font-extrabold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer border border-[#142B4A]/20"
              >
                <Briefcase className="w-4 h-4 text-[#142B4A]" />
                <span>Gig Worker Services</span>
              </button>

              <button
                onClick={() => onNavigate(currentUser ? (currentUser.isAdmin ? 'admin-dashboard' : 'user-dashboard') : 'login')}
                className="px-6 py-3.5 rounded-xl bg-white border border-[#E8E2D3] hover:bg-[#FFF5DC] text-[#142B4A] font-bold text-sm shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#E9B949]" />
                <span>Track My Complaint</span>
              </button>
            </div>

            {/* Trust Statement */}
            <div className="pt-3 border-t border-[#E8E2D3] flex items-center gap-2 text-xs font-semibold text-[#6B7280]">
              <span className="w-2 h-2 rounded-full bg-[#E9B949]"></span>
              <span>Every complaint matters. Every passenger deserves a better journey.</span>
            </div>

          </div>

          {/* Right Column: Realistic Train Visual */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto rounded-2xl overflow-hidden shadow-xl border-4 border-white ring-1 ring-[#E8E2D3] bg-[#FFF5DC]/50">
              
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
                className="w-full h-auto max-h-[460px] object-cover object-center transform hover:scale-[1.02] transition-transform duration-700"
              />

              {/* Elegant Caption Overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#142B4A]/90 via-[#142B4A]/50 to-transparent p-5 text-white">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E9B949] animate-pulse"></span>
                    <span className="text-white/95 tracking-wide">INDIAN RAILWAYS · CENTRAL GRIEVANCE SYSTEM</span>
                  </div>
                  <span className="text-[#F8E7B0] font-mono">RAIL CARE</span>
                </div>
              </div>

            </div>

            {/* Subtle Gold Decorative Glow Behind Card */}
            <div className="absolute -bottom-4 -right-4 w-64 h-64 bg-[#E9B949]/15 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          </div>

        </div>
      </section>

      {/* SECTION E: EXISTING REAL STATISTICS STRIP */}
      <section className="bg-white rounded-2xl border border-[#E8E2D3] p-6 sm:p-8 shadow-xs">
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

      {/* THREE USER PORTALS SHOWCASE (PASSENGER, WORKER, ADMIN) */}
      <section>
        <PortalSelector
          currentView="landing"
          currentUser={currentUser}
          currentWorker={null}
          onNavigate={onNavigate}
        />
      </section>

      {/* SECTION C: SERVICE HIGHLIGHTS (4 Clean White Cards with Subtle Borders) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs font-extrabold text-[#E9B949] uppercase tracking-widest mb-1">
            KEY CAPABILITIES
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A]">
            Service Highlights
          </h2>
          <p className="text-sm text-[#6B7280] mt-1">
            Comprehensive grievance redressal designed for seamless railway passenger experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1 */}
          <div className="bg-white rounded-2xl border border-[#E8E2D3] p-6 shadow-xs hover:border-[#E9B949] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#FFF5DC] text-[#142B4A] flex items-center justify-center mb-4 border border-[#E9B949]/30">
              <FileText className="w-6 h-6 text-[#142B4A]" />
            </div>
            <h3 className="text-base font-bold text-[#142B4A] mb-2">
              Easy Complaint Registration
            </h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Submit railway-related complaints through a simple and accessible interface with instant Reference ID generation.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl border border-[#E8E2D3] p-6 shadow-xs hover:border-[#E9B949] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#FFF5DC] text-[#142B4A] flex items-center justify-center mb-4 border border-[#E9B949]/30">
              <Clock className="w-6 h-6 text-[#142B4A]" />
            </div>
            <h3 className="text-base font-bold text-[#142B4A] mb-2">
              Complaint Tracking
            </h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Follow the current status of your complaint using the existing tracking functionality across devices.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl border border-[#E8E2D3] p-6 shadow-xs hover:border-[#E9B949] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#FFF5DC] text-[#142B4A] flex items-center justify-center mb-4 border border-[#E9B949]/30">
              <CheckCircle2 className="w-6 h-6 text-[#142B4A]" />
            </div>
            <h3 className="text-base font-bold text-[#142B4A] mb-2">
              Clear Status Updates
            </h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              View available complaint status information in one convenient place with multi-stage progression badges.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl border border-[#E8E2D3] p-6 shadow-xs hover:border-[#E9B949] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#FFF5DC] text-[#142B4A] flex items-center justify-center mb-4 border border-[#E9B949]/30">
              <Users className="w-6 h-6 text-[#142B4A]" />
            </div>
            <h3 className="text-base font-bold text-[#142B4A] mb-2">
              Passenger-Focused Design
            </h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Access the existing complaint services through a clean, warm-toned, and user-friendly interface.
            </p>
          </div>

        </div>
      </section>

      {/* SECTION D: HOW RAIL CARE WORKS (3 Simple Steps with Golden Progression Line) */}
      <section className="bg-[#FFF5DC]/60 rounded-3xl border border-[#E8E2D3] p-8 sm:p-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-extrabold text-[#E9B949] uppercase tracking-widest mb-1">
            STEP-BY-STEP PROCESS
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A]">
            How RAIL CARE Works
          </h2>
          <p className="text-sm text-[#6B7280] mt-1">
            A clear three-step pathway from passenger grievance submission to resolution.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Step 1 */}
          <div className="bg-white rounded-2xl border border-[#E8E2D3] p-6 sm:p-8 relative shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#142B4A] text-[#E9B949] font-extrabold flex items-center justify-center mb-4 text-lg border border-[#E9B949]/40 shadow-xs">
              01
            </div>
            <h3 className="text-lg font-bold text-[#142B4A] mb-2">
              Submit Your Complaint
            </h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Log in with your passenger account, enter your train number, journey date, category, and grievance details.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl border border-[#E8E2D3] p-6 sm:p-8 relative shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#142B4A] text-[#E9B949] font-extrabold flex items-center justify-center mb-4 text-lg border border-[#E9B949]/40 shadow-xs">
              02
            </div>
            <h3 className="text-lg font-bold text-[#142B4A] mb-2">
              Track Your Complaint
            </h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Receive your reference ID instantly and monitor review in the First-In-First-Out administrative queue.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl border border-[#E8E2D3] p-6 sm:p-8 relative shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#142B4A] text-[#E9B949] font-extrabold flex items-center justify-center mb-4 text-lg border border-[#E9B949]/40 shadow-xs">
              03
            </div>
            <h3 className="text-lg font-bold text-[#142B4A] mb-2">
              Follow Its Progress
            </h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Get live status updates across all your devices as railway officers handle and mark your grievance resolved.
            </p>
          </div>

        </div>

        {/* Call to Action Bar */}
        <div className="mt-10 pt-8 border-t border-[#E8E2D3] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-[#142B4A]">
              Experiencing an issue during your journey?
            </h4>
            <p className="text-xs text-[#6B7280]">
              Register your complaint now to notify divisional officers immediately.
            </p>
          </div>
          <button
            onClick={() => onNavigate(currentUser ? 'register-complaint' : 'register')}
            className="px-6 py-2.5 rounded-xl bg-[#142B4A] hover:bg-[#243F63] text-white font-bold text-xs shadow-xs transition-colors border border-[#E9B949] cursor-pointer"
          >
            Lodge Grievance Now &rarr;
          </button>
        </div>
      </section>

    </div>
  );
};
