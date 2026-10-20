import React, { useState } from 'react';
import { ViewMode, Worker, WorkerSkillCategory } from '../types';
import { WORKER_SKILL_CATEGORIES, RAILWAY_STATIONS } from '../data/mockData';
import { Briefcase, ArrowLeft, AlertCircle, Shield, CheckCircle2, TrainTrack, Building2, Eye, EyeOff } from 'lucide-react';
import trainJourneyImg from '../assets/images/rail_care_train_journey_1792164300619.jpg';

interface WorkerRegisterPageProps {
  onWorkerRegister: (workerData: {
    fullName: string;
    email: string;
    mobile: string;
    password: string;
    skillCategory: WorkerSkillCategory;
    stationCode: string;
    stationName: string;
    city: string;
    experienceYears: number;
  }) => Promise<{ success: boolean; message: string; worker?: Worker }> | { success: boolean; message: string; worker?: Worker };
  onNavigate: (view: ViewMode) => void;
  onBack?: () => void;
}

export const WorkerRegisterPage: React.FC<WorkerRegisterPageProps> = ({
  onWorkerRegister,
  onNavigate,
  onBack,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [skillCategory, setSkillCategory] = useState<WorkerSkillCategory>(WORKER_SKILL_CATEGORIES[0]);
  const [stationCode, setStationCode] = useState<string>(RAILWAY_STATIONS[0].code);
  const [experienceYears, setExperienceYears] = useState<number>(3);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedStation = RAILWAY_STATIONS.find((s) => s.code === stationCode) || RAILWAY_STATIONS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !mobile.trim() || !password.trim()) {
      setError('Please fill in all required worker registration fields.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!/^\d{10}$/.test(mobile.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password entry.');
      return;
    }

    setLoading(true);
    try {
      const res = await onWorkerRegister({
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        mobile: mobile.trim(),
        password,
        skillCategory,
        stationCode: selectedStation.code,
        stationName: selectedStation.name,
        city: selectedStation.city,
        experienceYears: Number(experienceYears) || 1,
      });

      if (!res.success) {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Worker registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Top Breadcrumb & Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack || (() => onNavigate('landing'))}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#142B4A] hover:text-[#243F63] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-[#6B7280]">Looking for a different portal?</span>
          <button
            onClick={() => onNavigate('portal-selection')}
            className="text-[#142B4A] underline hover:text-[#243F63] font-bold cursor-pointer"
          >
            Switch Portal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E8E2D3] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-[#E9B949] text-[#142B4A] text-[10px] font-extrabold rounded-md tracking-wider uppercase">
              RAIL CARE WORKFORCE
            </span>
            <span className="text-xs text-[#6B7280] font-medium">Station Service Registration</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] tracking-tight">
            Register as Railway Gig Worker
          </h1>
          <p className="text-xs text-[#6B7280] mt-1 mb-6">
            Join the verified on-demand workforce providing essential assistance to passengers at railway stations.
          </p>

          {/* Verification Warning Box */}
          <div className="bg-[#FFFDF5] border border-[#E9B949]/50 rounded-2xl p-4 mb-6 flex items-start gap-3 text-xs text-[#253247]">
            <Shield className="w-5 h-5 text-[#E9B949] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#142B4A]">Divisional Verification Required</p>
              <p className="text-[#6B7280] mt-0.5 text-[11px] leading-relaxed">
                For passenger safety, all worker registrations start in <strong>Pending Verification</strong> status. You will receive service requests once approved by the railway administrative officer.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#142B4A] uppercase tracking-wider mb-1.5">
                Full Legal Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Kumar Verma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D3] bg-[#FFFDF5] text-xs focus:outline-none focus:ring-2 focus:ring-[#142B4A]/30 focus:border-[#142B4A]"
              />
            </div>

            {/* Email and Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#142B4A] uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. ramesh@railcare.worker"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D3] bg-[#FFFDF5] text-xs focus:outline-none focus:ring-2 focus:ring-[#142B4A]/30 focus:border-[#142B4A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#142B4A] uppercase tracking-wider mb-1.5">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D3] bg-[#FFFDF5] text-xs focus:outline-none focus:ring-2 focus:ring-[#142B4A]/30 focus:border-[#142B4A]"
                />
              </div>
            </div>

            {/* Skill / Service Category */}
            <div>
              <label className="block text-xs font-bold text-[#142B4A] uppercase tracking-wider mb-1.5">
                Worker Skill & Service Category <span className="text-red-500">*</span>
              </label>
              <select
                value={skillCategory}
                onChange={(e) => setSkillCategory(e.target.value as WorkerSkillCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D3] bg-[#FFFDF5] text-xs focus:outline-none focus:ring-2 focus:ring-[#142B4A]/30 focus:border-[#142B4A]"
              >
                {WORKER_SKILL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Railway Station Served and Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#142B4A] uppercase tracking-wider mb-1.5">
                  Assigned Railway Station <span className="text-red-500">*</span>
                </label>
                <select
                  value={stationCode}
                  onChange={(e) => setStationCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D3] bg-[#FFFDF5] text-xs focus:outline-none focus:ring-2 focus:ring-[#142B4A]/30 focus:border-[#142B4A]"
                >
                  {RAILWAY_STATIONS.map((station) => (
                    <option key={station.code} value={station.code}>
                      {station.name} ({station.code}) - {station.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#142B4A] uppercase tracking-wider mb-1.5">
                  Experience (Yrs)
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D3] bg-[#FFFDF5] text-xs focus:outline-none focus:ring-2 focus:ring-[#142B4A]/30 focus:border-[#142B4A]"
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#142B4A] uppercase tracking-wider mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create worker password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D3] bg-[#FFFDF5] text-xs focus:outline-none focus:ring-2 focus:ring-[#142B4A]/30 focus:border-[#142B4A] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#6B7280] hover:text-[#142B4A]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#142B4A] uppercase tracking-wider mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat worker password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D3] bg-[#FFFDF5] text-xs focus:outline-none focus:ring-2 focus:ring-[#142B4A]/30 focus:border-[#142B4A]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-xl shadow-sm transition-all mt-4 flex items-center justify-center gap-2 cursor-pointer border border-[#142B4A] hover:border-[#E9B949] ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <Briefcase className="w-4 h-4 text-[#E9B949]" />
              <span>{loading ? 'Submitting Registration...' : 'Register as Railway Gig Worker'}</span>
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 pt-4 border-t border-[#E8E2D3] text-center text-xs text-[#6B7280]">
            Already registered as a worker?{' '}
            <button
              onClick={() => onNavigate('worker-login')}
              className="font-bold text-[#142B4A] underline hover:text-[#243F63] cursor-pointer"
            >
              Sign In to Worker Portal
            </button>
          </div>
        </div>

        {/* Right Column: Information & Guidelines */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-[#E8E2D3] p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#142B4A] mb-3 flex items-center gap-2">
              <TrainTrack className="w-5 h-5 text-[#E9B949]" />
              <span>How Railway Gig Work Operates</span>
            </h3>

            <div className="space-y-4 text-xs text-[#6B7280]">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#FFF5DC] text-[#142B4A] font-bold text-[11px] flex items-center justify-center shrink-0 border border-[#E9B949]/40">
                  1
                </span>
                <div>
                  <strong className="text-[#253247] block">Profile Verification</strong>
                  Divisional administrators verify your credentials, station assignment, and skill category.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#FFF5DC] text-[#142B4A] font-bold text-[11px] flex items-center justify-center shrink-0 border border-[#E9B949]/40">
                  2
                </span>
                <div>
                  <strong className="text-[#253247] block">Set Availability</strong>
                  Toggle your availability between "Available", "Busy", and "Unavailable" whenever on station premises.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#FFF5DC] text-[#142B4A] font-bold text-[11px] flex items-center justify-center shrink-0 border border-[#E9B949]/40">
                  3
                </span>
                <div>
                  <strong className="text-[#253247] block">Receive Station Requests</strong>
                  When a train arrives at your station with a passenger needing assistance, accept the request on your dashboard.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#FFF5DC] text-[#142B4A] font-bold text-[11px] flex items-center justify-center shrink-0 border border-[#E9B949]/40">
                  4
                </span>
                <div>
                  <strong className="text-[#253247] block">Service Delivery & Completion</strong>
                  Meet the train coach, provide the required assistance, and mark the job as completed.
                </div>
              </div>
            </div>
          </div>

          {/* Visual card */}
          <div className="rounded-2xl overflow-hidden border-2 border-white shadow-sm">
            <img
              src={trainJourneyImg}
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== '/images/rail_care_train_journey.jpg') {
                  target.src = '/images/rail_care_train_journey.jpg';
                }
              }}
              alt="Passenger Train"
              className="w-full h-40 object-cover"
            />
            <div className="bg-[#142B4A] text-white p-3.5 text-xs font-semibold flex items-center justify-between">
              <span>RailCare Workforce Network</span>
              <span className="text-[#E9B949]">Verified Services Only</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
