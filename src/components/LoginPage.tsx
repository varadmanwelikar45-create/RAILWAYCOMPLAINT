import React, { useState, useEffect } from 'react';
import trainJourneyImg from '../assets/images/rail_care_train_journey_1792164300619.jpg';
import { ViewMode } from '../types';
import { LogIn, AlertCircle, Eye, EyeOff, CheckCircle2, TrainTrack, UserPlus, Shield } from 'lucide-react';

interface LoginPageProps {
  initialEmail?: string;
  onLogin: (
    email: string,
    password: string
  ) =>
    | Promise<{ success: boolean; message: string; isAdmin?: boolean }>
    | { success: boolean; message: string; isAdmin?: boolean };
  onNavigate: (view: ViewMode) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialEmail = '', onLogin, onNavigate }) => {
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
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await Promise.resolve(onLogin(cleanEmail, password));
      if (res && res.success) {
        if (res.isAdmin) {
          onNavigate('admin-dashboard');
        } else {
          onNavigate('user-dashboard');
        }
      } else {
        setError(res?.message || 'Invalid email or password. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      
      {/* Split-Screen Container */}
      <div className="bg-white rounded-3xl border border-[#E8E2D3] shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Brand & Railway Visual */}
        <div className="lg:col-span-5 bg-[#FFF5DC] p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#E8E2D3] relative overflow-hidden">
          
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#142B4A] flex items-center justify-center text-[#E9B949] shadow-xs">
                <TrainTrack className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-xl text-[#142B4A] tracking-tight">RAIL CARE</span>
                <p className="text-[10px] text-[#6B7280] font-medium">Railway Grievance Redressal</p>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] leading-snug tracking-tight mb-3">
              Your Journey.<br />
              <span className="text-[#E9B949]">Your Voice.</span><br />
              Our Responsibility.
            </h2>

            <p className="text-xs text-[#6B7280] leading-relaxed mb-6">
              Sign in to lodge new travel grievances, check status updates, and track departmental resolution across all your devices.
            </p>
          </div>

          {/* Railway Visual */}
          <div className="rounded-2xl overflow-hidden border-2 border-white shadow-sm mt-4">
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
            <div className="bg-[#142B4A] text-white p-3 text-[11px] font-semibold flex items-center justify-between">
              <span>Secure Authentication</span>
              <span className="text-[#E9B949]">Central Server Synced</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E8E2D3]/60 text-[11px] text-[#6B7280]">
            Need help? Divisional officials process all tickets in first-in-first-out queue order.
          </div>

        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 bg-white">
          
          <div className="mb-6">
            <div className="text-xs font-bold text-[#E9B949] uppercase tracking-wider mb-1">
              WELCOME BACK
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A]">
              Passenger Login
            </h1>
            <p className="text-xs text-[#6B7280] mt-1">
              Enter your registered passenger email and password to access your dashboard.
            </p>
          </div>

          {initialEmail && (
            <div className="mb-4 p-3.5 rounded-xl bg-[#FFF5DC] border border-[#E9B949]/50 text-xs text-[#142B4A] flex items-center gap-2.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#21865B] shrink-0" />
              <span>Account registered! Enter your password below to sign in.</span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 space-y-1.5">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                <span className="font-medium">{error}</span>
              </div>
              {error.toLowerCase().includes('register') && (
                <div className="pt-1 pl-6">
                  <button
                    type="button"
                    onClick={() => onNavigate('register')}
                    className="text-xs font-bold text-[#142B4A] underline hover:text-[#243F63] cursor-pointer"
                  >
                    Click here to create your passenger account &rarr;
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#253247] mb-1.5">
                Registered Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="passenger@example.com"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FFFDF5] border border-[#E8E2D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A] focus:border-transparent transition"
                required
                autoFocus={!initialEmail}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#253247] mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full px-3.5 py-2.5 pr-10 text-sm bg-[#FFFDF5] border border-[#E8E2D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A] focus:border-transparent transition"
                  required
                  autoFocus={Boolean(initialEmail)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#6B7280] hover:text-[#142B4A] cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 bg-[#142B4A] hover:bg-[#243F63] text-white text-sm font-bold rounded-xl shadow-md transition-all border border-[#142B4A] hover:border-[#E9B949] cursor-pointer flex items-center justify-center gap-2 mt-4 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <LogIn className="w-4 h-4 text-[#E9B949]" />
              <span>{loading ? 'Signing In...' : 'Sign In to RAIL CARE'}</span>
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-[#E8E2D3] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B7280] gap-2">
            <span>
              New passenger?{' '}
              <button
                onClick={() => onNavigate('register')}
                className="text-[#142B4A] font-bold hover:underline cursor-pointer"
              >
                Register an account &rarr;
              </button>
            </span>
            <button
              onClick={() => onNavigate('admin-login')}
              className="inline-flex items-center gap-1 font-semibold text-[#6B7280] hover:text-[#142B4A] cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-[#E9B949]" />
              Railway Officer Portal
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
