import React, { useState } from 'react';
import { ViewMode, Worker, WorkerSkillCategory } from '../types';
import { WORKER_SKILL_CATEGORIES, RAILWAY_STATIONS } from '../data/mockData';
import { Briefcase, ArrowLeft, AlertCircle, Shield, Eye, EyeOff, LogIn, Train, CheckCircle2 } from 'lucide-react';
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

    // Sanitize mobile input: remove non-digits, accept +91 or 0 prefix
    const rawDigits = mobile.replace(/\D/g, '');
    let cleanMobile = rawDigits;
    if (rawDigits.length === 12 && rawDigits.startsWith('91')) {
      cleanMobile = rawDigits.slice(2);
    } else if (rawDigits.length === 11 && rawDigits.startsWith('0')) {
      cleanMobile = rawDigits.slice(1);
    }

    if (cleanMobile.length !== 10) {
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
        mobile: cleanMobile,
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
      setError(err?.message || 'Worker registration failed. Please check connection and try again.');
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
          className="inline-flex items-center gap-2 text-xs font-bold text-[#202A2B] hover:text-[#B94A3A] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#B94A3A]" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-[#526365]">Already registered?</span>
          <button
            onClick={() => onNavigate('worker-login')}
            className="text-[#007D99] underline hover:text-[#00B8D9] font-bold cursor-pointer"
          >
            Worker Sign In
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#DDE4E6] p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-[#D7F7FC] text-[#007D99] text-[10px] font-black rounded-md tracking-wider uppercase border border-[#00B8D9]/40">
              VYOM RATH WORKFORCE
            </span>
            <span className="text-xs text-[#526365] font-medium">Station Service Registration</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#202A2B] tracking-tight">
            Register as Railway Gig Worker
          </h1>
          <p className="text-xs text-[#526365] mt-1 mb-6">
            Join the verified on-demand workforce providing essential assistance to passengers at railway stations.
          </p>

          {/* Verification Box */}
          <div className="bg-[#DDF8EF]/50 border border-[#65D6B0]/40 rounded-2xl p-4 mb-6 flex items-start gap-3 text-xs text-[#202A2B]">
            <Shield className="w-5 h-5 text-[#1E6B52] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#202A2B]">Immediate Station Dispatch &amp; Visibility</p>
              <p className="text-[#526365] mt-0.5 text-[11px] leading-relaxed">
                Registered railway workers connect directly to the central station dispatch. Once registered, your profile is immediately visible to passengers across all devices.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[#FBE0E6] border border-[#D72645]/40 text-[#92182D] text-xs space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#D72645] mt-0.5" />
                <span className="font-semibold text-[#92182D]">{error}</span>
              </div>
              {error.toLowerCase().includes('already exists') && (
                <div className="pt-2 border-t border-[#D72645]/20 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-[#526365]">Already registered?</span>
                  <button
                    type="button"
                    onClick={() => onNavigate('worker-login')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#007D99] hover:bg-[#00B8D9] text-white font-bold rounded-lg text-xs transition cursor-pointer shadow-xs"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In Now</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#202A2B] uppercase tracking-wider mb-1.5">
                Full Legal Name <span className="text-[#D72645]">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Kumar Verma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE4E6] bg-white text-xs text-[#202A2B] focus:outline-none focus:ring-2 focus:ring-[#65D6B0] focus:border-transparent shadow-2xs"
              />
            </div>

            {/* Email and Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#202A2B] uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-[#D72645]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. ramesh@vyomrath.worker"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE4E6] bg-white text-xs text-[#202A2B] focus:outline-none focus:ring-2 focus:ring-[#65D6B0] focus:border-transparent shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#202A2B] uppercase tracking-wider mb-1.5">
                  Mobile Number <span className="text-[#D72645]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE4E6] bg-white text-xs text-[#202A2B] focus:outline-none focus:ring-2 focus:ring-[#65D6B0] focus:border-transparent shadow-2xs"
                />
              </div>
            </div>

            {/* Service Skill Category */}
            <div>
              <label className="block text-xs font-bold text-[#202A2B] uppercase tracking-wider mb-1.5">
                Primary Railway Skill Category <span className="text-[#D72645]">*</span>
              </label>
              <select
                value={skillCategory}
                onChange={(e) => setSkillCategory(e.target.value as WorkerSkillCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE4E6] bg-white text-xs text-[#202A2B] focus:outline-none focus:ring-2 focus:ring-[#65D6B0] focus:border-transparent shadow-2xs"
              >
                {WORKER_SKILL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Station and Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#202A2B] uppercase tracking-wider mb-1.5">
                  Assigned Station Hub <span className="text-[#D72645]">*</span>
                </label>
                <select
                  value={stationCode}
                  onChange={(e) => setStationCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE4E6] bg-white text-xs text-[#202A2B] focus:outline-none focus:ring-2 focus:ring-[#65D6B0] focus:border-transparent shadow-2xs"
                >
                  {RAILWAY_STATIONS.map((stn) => (
                    <option key={stn.code} value={stn.code}>
                      {stn.name} ({stn.code}) - {stn.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#202A2B] uppercase tracking-wider mb-1.5">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE4E6] bg-white text-xs text-[#202A2B] focus:outline-none focus:ring-2 focus:ring-[#65D6B0] focus:border-transparent shadow-2xs"
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#202A2B] uppercase tracking-wider mb-1.5">
                  Password <span className="text-[#D72645]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 4 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE4E6] bg-white text-xs text-[#202A2B] focus:outline-none focus:ring-2 focus:ring-[#65D6B0] focus:border-transparent pr-10 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#7E9092] hover:text-[#202A2B] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#202A2B] uppercase tracking-wider mb-1.5">
                  Confirm Password <span className="text-[#D72645]">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE4E6] bg-white text-xs text-[#202A2B] focus:outline-none focus:ring-2 focus:ring-[#65D6B0] focus:border-transparent shadow-2xs"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 px-4 bg-[#202A2B] hover:bg-[#202A2B]/90 text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer border border-[#202A2B] ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                <Briefcase className="w-4 h-4 text-[#65D6B0]" />
                <span>{loading ? 'Creating Worker Profile...' : 'Complete Worker Registration'}</span>
              </button>
            </div>

          </form>

        </div>

        {/* Right Column: Information card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-[#DDE4E6] p-6 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#202A2B] text-[#65D6B0] flex items-center justify-center shadow-xs">
                <Train className="w-5 h-5 font-bold" />
              </div>
              <div>
                <span className="font-black text-lg text-[#202A2B] tracking-tight">VYOM RATH</span>
                <p className="text-[10px] text-[#526365] font-medium">Gig Workforce Network</p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden mb-4 border border-[#DDE4E6]">
              <img
                src={trainJourneyImg}
                alt="Train station platform"
                className="w-full h-40 object-cover"
              />
            </div>

            <div className="space-y-3 text-xs text-[#526365]">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1E6B52] shrink-0 mt-0.5" />
                <span>Instant dispatch assignment upon passenger coach request.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1E6B52] shrink-0 mt-0.5" />
                <span>Live mutual radar helps you reach the passenger's exact berth.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1E6B52] shrink-0 mt-0.5" />
                <span>Direct passenger feedback and verified service rating.</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#DDE4E6] text-center">
              <button
                type="button"
                onClick={() => onNavigate('worker-login')}
                className="text-xs font-bold text-[#007D99] hover:underline cursor-pointer"
              >
                Already have an account? Sign In &rarr;
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
