import React, { useState, useEffect } from 'react';
import trainJourneyImg from '../assets/images/rail_care_train_journey_1792164300619.jpg';
import { ViewMode } from '../types';
import { LogIn, AlertCircle, Eye, EyeOff, CheckCircle2, ArrowLeft, Train, ShieldCheck } from 'lucide-react';

interface LoginPageProps {
  initialEmail?: string;
  onLogin: (
    email: string,
    password: string
  ) =>
    | Promise<{ success: boolean; message: string; isAdmin?: boolean }>
    | { success: boolean; message: string; isAdmin?: boolean };
  onNavigate: (view: ViewMode) => void;
  onBack?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  initialEmail = '', 
  onLogin, 
  onNavigate,
  onBack 
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Please enter both your registered email address and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await Promise.resolve(onLogin(cleanEmail, password));
      if (res && res.success) {
        onNavigate('user-dashboard');
      } else {
        setError(res?.message || 'Invalid email or password. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Sign in failed. Please verify your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={onBack || (() => onNavigate('landing'))}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#202A2B] hover:text-[#B94A3A] bg-white px-3.5 py-2 rounded-xl border border-[#DDE4E6] shadow-2xs hover:bg-[#F8FAFB] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#B94A3A]" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Split-Screen Container */}
      <div className="bg-white rounded-3xl border border-[#DDE4E6] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Brand Visual */}
        <div className="lg:col-span-5 bg-[#F8FAFB] p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#DDE4E6]">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#202A2B] text-[#65D6B0] flex items-center justify-center shadow-xs">
                <Train className="w-5 h-5 font-bold" />
              </div>
              <div>
                <span className="font-black text-xl text-[#202A2B] tracking-tight">VYOM RATH</span>
                <p className="text-[10px] text-[#526365] font-medium">Passenger Assistance Network</p>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[#202A2B] leading-snug tracking-tight mb-3">
              On-Demand Help.<br />
              <span className="text-[#B94A3A]">At Your Coach.</span><br />
              During Platform Halt.
            </h2>

            <p className="text-xs text-[#526365] leading-relaxed mb-6">
              Sign in to book verified technicians, plumbers, electricians, or housekeeping sahayaks directly to your train coach and berth.
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden border-2 border-white shadow-xs mt-4">
            <img
              src={trainJourneyImg}
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== '/images/rail_care_train_journey.jpg') {
                  target.src = '/images/rail_care_train_journey.jpg';
                }
              }}
              alt="Passenger Train at platform"
              referrerPolicy="no-referrer"
              className="w-full h-44 object-cover object-center"
            />
            <div className="bg-[#202A2B] text-white p-3 text-[11px] font-semibold flex items-center justify-between">
              <span className="text-[#65D6B0]">Secure Access</span>
              <span className="text-[#D7F7FC]">Mutual Live Location</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#DDE4E6] text-[11px] text-[#526365]">
            Verified railway service workers provide rapid on-spot resolution during scheduled platform halts.
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 bg-white">
          <div className="mb-6">
            <div className="text-xs font-bold text-[#1E6B52] uppercase tracking-wider mb-1">
              PASSENGER ACCESS
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#202A2B]">
              Passenger Sign In
            </h1>
            <p className="text-xs text-[#526365] mt-1">
              Enter your email and password to access your bookings and live location radar.
            </p>
          </div>

          {initialEmail && (
            <div className="mb-4 p-3.5 rounded-xl bg-[#DDF8EF] border border-[#65D6B0]/40 text-xs text-[#1E6B52] flex items-center gap-2.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#3EA684] shrink-0" />
              <span>Account registered! Enter your password below to sign in.</span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#FBE0E6] border border-[#D72645]/40 text-xs text-[#92182D] space-y-1.5">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#D72645]" />
                <span className="font-semibold">{error}</span>
              </div>
              {error.toLowerCase().includes('register') && (
                <div className="pt-1 pl-6">
                  <button
                    type="button"
                    onClick={() => onNavigate('register')}
                    className="text-xs font-bold text-[#B94A3A] underline hover:text-[#7D2E27] cursor-pointer"
                  >
                    Click here to create a new passenger account &rarr;
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#202A2B] mb-1.5 uppercase tracking-wider">
                Email Address <span className="text-[#D72645]">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DDE4E6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#65D6B0] focus:border-transparent transition text-[#202A2B] shadow-2xs"
                required
                autoFocus={!initialEmail}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#202A2B] mb-1.5 uppercase tracking-wider">
                Password <span className="text-[#D72645]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-[#DDE4E6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#65D6B0] focus:border-transparent transition text-[#202A2B] shadow-2xs"
                  required
                  autoFocus={Boolean(initialEmail)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#7E9092] hover:text-[#202A2B] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 bg-[#202A2B] hover:bg-[#202A2B]/90 text-white text-sm font-extrabold rounded-xl shadow-xs transition-all border border-[#202A2B] cursor-pointer flex items-center justify-center gap-2 mt-4 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <LogIn className="w-4 h-4 text-[#65D6B0]" />
              <span>{loading ? 'Signing In...' : 'Sign In as Passenger'}</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#DDE4E6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-[#526365]">New passenger?</span>
            <button
              onClick={() => onNavigate('register')}
              className="text-[#B94A3A] font-bold hover:underline cursor-pointer"
            >
              Create Passenger Account &rarr;
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-[#DDE4E6] flex items-center justify-between text-xs text-[#526365]">
            <span>Are you a railway worker?</span>
            <button
              onClick={() => onNavigate('worker-login')}
              className="text-[#007D99] font-bold hover:underline cursor-pointer"
            >
              Worker Sign In &rarr;
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
