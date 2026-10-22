import React, { useState } from 'react';
import trainJourneyImg from '../assets/images/rail_care_train_journey_1792164300619.jpg';
import { ViewMode, User } from '../types';
import { ArrowLeft, AlertCircle, Train, Eye, EyeOff, UserPlus, CheckCircle2 } from 'lucide-react';

interface RegisterPageProps {
  onRegister: (
    newUser: Omit<User, 'id'>,
    password: string
  ) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  onNavigate: (view: ViewMode) => void;
  onBack?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onNavigate, onBack }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const rawMobile = mobile.replace(/\D/g, '');
    let cleanMobile = rawMobile;
    if (rawMobile.length === 12 && rawMobile.startsWith('91')) {
      cleanMobile = rawMobile.slice(2);
    } else if (rawMobile.length === 11 && rawMobile.startsWith('0')) {
      cleanMobile = rawMobile.slice(1);
    }

    if (!fullName.trim() || !cleanEmail || !cleanMobile || !password || !confirmPassword) {
      setError('All fields are required. Please complete the form.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError('Please provide a valid email address.');
      return;
    }

    if (cleanMobile.length !== 10) {
      setError('Please provide a valid 10-digit mobile number.');
      return;
    }

    if (password.length < 4) {
      setError('Password must contain at least 4 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password entry.');
      return;
    }

    setLoading(true);
    try {
      const res = await Promise.resolve(
        onRegister(
          {
            fullName: fullName.trim(),
            email: cleanEmail,
            mobile: cleanMobile,
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
      setError(err?.message || 'Registration could not connect to server. Please try again.');
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
          <span>Back</span>
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
                <p className="text-[10px] text-[#526365] font-medium">Passenger Network</p>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[#202A2B] leading-snug tracking-tight mb-3">
              Fast Booking.<br />
              <span className="text-[#B94A3A]">Coach Assistance.</span><br />
              Direct to Berth.
            </h2>

            <p className="text-xs text-[#526365] leading-relaxed mb-6">
              Create your passenger profile to book railway gig workers at upcoming stations, share your berth coordinates, and track worker arrivals in real time.
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
              alt="Passenger Train at station"
              referrerPolicy="no-referrer"
              className="w-full h-44 object-cover object-center"
            />
            <div className="bg-[#202A2B] text-white p-3 text-[11px] font-semibold flex items-center justify-between">
              <span className="text-[#65D6B0]">Passenger Registration</span>
              <span className="text-[#C6F000]">Instant Access</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#DDE4E6] text-[11px] text-[#526365]">
            Safe, verified, and interconnected station gig workforce platform.
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 bg-white">
          <div className="mb-6">
            <div className="text-xs font-bold text-[#1E6B52] uppercase tracking-wider mb-1">
              CREATE PASSENGER ACCOUNT
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#202A2B]">
              Passenger Registration
            </h1>
            <p className="text-xs text-[#526365] mt-1">
              Fill in your details to begin booking station gig worker services.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#FBE0E6] border border-[#D72645]/40 text-xs text-[#92182D] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#D72645]" />
              <div className="font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#202A2B] mb-1.5 uppercase tracking-wider">
                Full Name <span className="text-[#D72645]">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DDE4E6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#65D6B0] focus:border-transparent transition text-[#202A2B] shadow-2xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#202A2B] mb-1.5 uppercase tracking-wider">
                  Mobile Number <span className="text-[#D72645]">*</span>
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="10-digit mobile"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DDE4E6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#65D6B0] focus:border-transparent transition text-[#202A2B] shadow-2xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#202A2B] mb-1.5 uppercase tracking-wider">
                  Password <span className="text-[#D72645]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 4 characters"
                    className="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-[#DDE4E6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#65D6B0] focus:border-transparent transition text-[#202A2B] shadow-2xs"
                    required
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

              <div>
                <label className="block text-xs font-bold text-[#202A2B] mb-1.5 uppercase tracking-wider">
                  Confirm Password <span className="text-[#D72645]">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type password"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DDE4E6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#65D6B0] focus:border-transparent transition text-[#202A2B] shadow-2xs"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 bg-[#202A2B] hover:bg-[#202A2B]/90 text-white text-sm font-extrabold rounded-xl shadow-xs transition-all border border-[#202A2B] cursor-pointer flex items-center justify-center gap-2 mt-4 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <UserPlus className="w-4 h-4 text-[#65D6B0]" />
              <span>{loading ? 'Registering Account...' : 'Create Passenger Account'}</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#DDE4E6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-[#526365]">Already have a passenger account?</span>
            <button
              onClick={() => onNavigate('login')}
              className="text-[#1E6B52] font-bold hover:underline cursor-pointer"
            >
              Sign In &rarr;
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-[#DDE4E6] flex items-center justify-between text-xs text-[#526365]">
            <span>Are you a railway worker?</span>
            <button
              onClick={() => onNavigate('worker-register')}
              className="text-[#007D99] font-bold hover:underline cursor-pointer"
            >
              Register as Worker &rarr;
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
