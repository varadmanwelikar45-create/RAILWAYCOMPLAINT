import React, { useState } from 'react';
import trainJourneyImg from '../assets/images/rail_care_train_journey_1792164300619.jpg';
import { ViewMode, User } from '../types';
import { UserPlus, ArrowLeft, AlertCircle, TrainTrack, Shield, CheckCircle2 } from 'lucide-react';

interface RegisterPageProps {
  onRegister: (
    newUser: Omit<User, 'id'>,
    password: string
  ) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  onNavigate: (view: ViewMode) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onNavigate }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form validations
    const cleanEmail = email.trim().toLowerCase();
    const cleanMobile = mobile.replace(/\D/g, '');

    if (!fullName.trim() || !cleanEmail || !cleanMobile || !password || !confirmPassword) {
      setError('All fields are required. Please complete the form.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError('Please provide a valid email address.');
      return;
    }

    if (cleanMobile.length < 10) {
      setError('Please provide a valid 10-digit mobile number.');
      return;
    }

    if (password.length < 4) {
      setError('Password must contain at least 4 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      const res = await Promise.resolve(
        onRegister(
          {
            fullName: fullName.trim(),
            email: cleanEmail,
            mobile: cleanMobile.slice(-10),
            isAdmin: false,
          },
          password
        )
      );

      if (res && res.success) {
        onNavigate('login');
      } else {
        setError(res?.message || 'Registration could not be completed. Please check your details.');
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed due to a network or server issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      
      {/* Split-Screen Container */}
      <div className="bg-white rounded-3xl border border-[#E8E2D3] shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Brand & Realistic Railway Editorial Visual */}
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
              Create your official passenger account to lodge complaints, monitor divisional action, and access real-time status tracking.
            </p>
          </div>

          {/* Railway Train Visual Thumbnail */}
          <div className="rounded-2xl overflow-hidden border-2 border-white shadow-sm mt-4">
            <img
              src={trainJourneyImg}
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== '/images/rail_care_train_journey.jpg') {
                  target.src = '/images/rail_care_train_journey.jpg';
                }
              }}
              alt="Passenger Train at station"
              referrerPolicy="no-referrer"
              className="w-full h-44 object-cover object-center"
            />
            <div className="bg-[#142B4A] text-white p-3 text-[11px] font-semibold flex items-center justify-between">
              <span>Official Passenger Portal</span>
              <span className="text-[#E9B949]">Verified Redressal</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E8E2D3]/60 text-[11px] text-[#6B7280]">
            Protected by central database synchronization across all passenger devices.
          </div>

        </div>

        {/* Right Side: Registration Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 bg-white">
          
          <div className="mb-6">
            <div className="text-xs font-bold text-[#E9B949] uppercase tracking-wider mb-1">
              CREATE PASSENGER ACCOUNT
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A]">
              Passenger Registration
            </h1>
            <p className="text-xs text-[#6B7280] mt-1">
              Fill in your details below to activate your grievance reporting portal.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
              <div className="font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#253247] mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FFFDF5] border border-[#E8E2D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A] focus:border-transparent transition"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#253247] mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="passenger@example.com"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FFFDF5] border border-[#E8E2D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A] focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#253247] mb-1.5">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FFFDF5] border border-[#E8E2D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A] focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#253247] mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 4 characters"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FFFDF5] border border-[#E8E2D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A] focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#253247] mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FFFDF5] border border-[#E8E2D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A] focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 bg-[#142B4A] hover:bg-[#243F63] text-white text-sm font-bold rounded-xl shadow-md transition-all border border-[#142B4A] hover:border-[#E9B949] cursor-pointer flex items-center justify-center gap-2 mt-4 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <UserPlus className="w-4 h-4 text-[#E9B949]" />
              <span>{loading ? 'Creating Account...' : 'Create RAIL CARE Account'}</span>
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-[#E8E2D3] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B7280] gap-2">
            <span>
              Already registered?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-[#142B4A] font-bold hover:underline cursor-pointer"
              >
                Sign in with password &rarr;
              </button>
            </span>
            <button
              onClick={() => onNavigate('admin-login')}
              className="text-[#6B7280] hover:text-[#142B4A] font-medium cursor-pointer"
            >
              Railway Officer Login
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
