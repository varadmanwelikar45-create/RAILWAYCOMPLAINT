import React, { useState } from 'react';
import { ViewMode, Worker } from '../types';
import { INITIAL_WORKERS } from '../data/mockData';
import { Briefcase, ArrowLeft, AlertCircle, Eye, EyeOff, Shield, CheckCircle2, UserCheck, KeyRound } from 'lucide-react';
import trainJourneyImg from '../assets/images/rail_care_train_journey_1792164300619.jpg';

interface WorkerLoginPageProps {
  onWorkerLogin: (email: string, password: string) => Promise<{ success: boolean; message: string; worker?: Worker }> | { success: boolean; message: string; worker?: Worker };
  onNavigate: (view: ViewMode) => void;
}

export const WorkerLoginPage: React.FC<WorkerLoginPageProps> = ({
  onWorkerLogin,
  onNavigate,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please provide both worker email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await onWorkerLogin(email.toLowerCase().trim(), password);
      if (!res.success) {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Worker login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoWorker = (demoWorker: Worker) => {
    setEmail(demoWorker.email);
    setPassword('Worker@1234');
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Breadcrumb & Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          onClick={() => onNavigate('landing')}
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

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Worker Login Form */}
        <div className="md:col-span-7 bg-white rounded-3xl border border-[#E8E2D3] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-[#E9B949] text-[#142B4A] text-[10px] font-extrabold rounded-md tracking-wider uppercase">
              WORKER PORTAL
            </span>
            <span className="text-xs text-[#6B7280] font-medium">RAIL CARE WORKFORCE</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] tracking-tight">
            Gig Worker Sign In
          </h1>
          <p className="text-xs text-[#6B7280] mt-1 mb-6">
            Sign in to check station assignments, manage your availability, and accept passenger assistance requests.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#142B4A] uppercase tracking-wider mb-1.5">
                Worker Registered Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. ramesh.verma@worker.railcare.gov.in"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D3] bg-[#FFFDF5] text-xs focus:outline-none focus:ring-2 focus:ring-[#142B4A]/30 focus:border-[#142B4A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#142B4A] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter worker password"
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

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-xl shadow-sm transition-all mt-4 flex items-center justify-center gap-2 cursor-pointer border border-[#142B4A] hover:border-[#E9B949] ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <Briefcase className="w-4 h-4 text-[#E9B949]" />
              <span>{loading ? 'Authenticating...' : 'Sign In as Worker'}</span>
            </button>
          </form>

          {/* Quick Demo Worker Fast-Select Box */}
          <div className="mt-8 pt-6 border-t border-[#E8E2D3]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#142B4A] mb-3">
              <KeyRound className="w-3.5 h-3.5 text-[#E9B949]" />
              <span>Quick Demo: Test Login as Verified Worker (Password: Worker@1234)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INITIAL_WORKERS.slice(0, 4).map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => handleQuickDemoWorker(w)}
                  className="text-left p-2.5 rounded-xl border border-[#E8E2D3] hover:border-[#142B4A] hover:bg-[#FFF5DC] transition text-xs flex flex-col gap-0.5 cursor-pointer bg-[#FFFDF5]"
                >
                  <span className="font-bold text-[#142B4A] truncate">{w.fullName}</span>
                  <span className="text-[10px] text-[#6B7280] truncate">{w.skillCategory.split('&')[0]} · {w.stationCode}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Registration link */}
          <div className="mt-6 pt-4 border-t border-[#E8E2D3] text-center text-xs text-[#6B7280]">
            Don't have a railway gig worker account?{' '}
            <button
              onClick={() => onNavigate('worker-register')}
              className="font-bold text-[#142B4A] underline hover:text-[#243F63] cursor-pointer"
            >
              Register as New Worker
            </button>
          </div>
        </div>

        {/* Right Column: Portal info */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-[#E8E2D3] p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#142B4A] mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#E9B949]" />
              <span>Worker Verification Policy</span>
            </h3>
            <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
              All railway workers undergo administrative background check and station assignment before receiving live service requests.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#253247]">
                <CheckCircle2 className="w-4 h-4 text-[#21865B] shrink-0" />
                <span>Station platform access permit</span>
              </div>
              <div className="flex items-center gap-2 text-[#253247]">
                <CheckCircle2 className="w-4 h-4 text-[#21865B] shrink-0" />
                <span>Real-time train arrival coordination</span>
              </div>
              <div className="flex items-center gap-2 text-[#253247]">
                <CheckCircle2 className="w-4 h-4 text-[#21865B] shrink-0" />
                <span>Passenger grievance resolution</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border-2 border-white shadow-sm">
            <img
              src={trainJourneyImg}
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== '/images/rail_care_train_journey.jpg') {
                  target.src = '/images/rail_care_train_journey.jpg';
                }
              }}
              alt="Railway Worker Platform"
              className="w-full h-40 object-cover"
            />
            <div className="bg-[#142B4A] text-white p-3 text-xs font-semibold flex items-center justify-between">
              <span>Station Gig Workforce</span>
              <span className="text-[#E9B949]">RAIL CARE</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
