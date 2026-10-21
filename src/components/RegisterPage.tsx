import React, { useState } from 'react';
import trainJourneyImg from '../assets/images/rail_care_train_journey_1792164300619.jpg';
import { ViewMode, User } from '../types';
import { ArrowLeft, AlertCircle, TrainTrack, UserPlus } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      
      {/* Back Button Navigation */}
      <div className="mb-4">
        <button
          onClick={onBack || (() => onNavigate('landing'))}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#183B3A] hover:text-[#0F766E] bg-white px-3.5 py-2 rounded-xl border border-[#D8EAE4] shadow-2xs hover:bg-[#E5F5EF] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#0F766E]" />
          <span>Back</span>
        </button>
      </div>

      {/* Split-Screen Container */}
      <div className="bg-white rounded-3xl border border-[#D8EAE4] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Brand Visual */}
        <div className="lg:col-span-5 bg-[#F4FBF8] p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#D8EAE4]">
          
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center text-[#A7E8D0] shadow-xs">
                <TrainTrack className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-xl text-[#183B3A] tracking-tight">RAIL CARE</span>
                <p className="text-[10px] text-[#647773] font-medium">Passenger Network</p>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#115E59] leading-snug tracking-tight mb-3">
              Fast Booking.<br />
              <span className="text-[#0F766E]">Coach Assistance.</span><br />
              Direct to Berth.
            </h2>

            <p className="text-xs text-[#647773] leading-relaxed mb-6">
              Create your passenger profile to book railway gig workers at upcoming stations, share your berth coordinates, and track worker arrivals.
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
            <div className="bg-[#115E59] text-white p-3 text-[11px] font-semibold flex items-center justify-between">
              <span>Passenger Registration</span>
              <span className="text-[#A7E8D0]">Instant Activation</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#D8EAE4] text-[11px] text-[#647773]">
            Safe, verified, and interconnected station gig workforce platform.
          </div>

        </div>

        {/* Right Side: Registration Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 bg-white">
          
          <div className="mb-6">
            <div className="text-xs font-bold text-[#0F766E] uppercase tracking-wider mb-1">
              CREATE PASSENGER ACCOUNT
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#115E59]">
              Passenger Registration
            </h1>
            <p className="text-xs text-[#647773] mt-1">
              Fill in your details to begin booking station gig worker services.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-[#C74646] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#C74646]" />
              <div className="font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#183B3A] mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8EAE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition text-[#183B3A]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#183B3A] mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8EAE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition text-[#183B3A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#183B3A] mb-1.5">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8EAE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition text-[#183B3A]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#183B3A] mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 4 characters"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8EAE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition text-[#183B3A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#183B3A] mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8EAE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition text-[#183B3A]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 bg-[#0F766E] hover:bg-[#115E59] text-white text-sm font-bold rounded-xl shadow-xs transition-all border border-[#0F766E] cursor-pointer flex items-center justify-center gap-2 mt-4 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <UserPlus className="w-4 h-4 text-[#A7E8D0]" />
              <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-[#D8EAE4] flex flex-col sm:flex-row items-center justify-between text-xs text-[#647773] gap-2">
            <span>
              Already registered?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-[#0F766E] font-bold hover:underline cursor-pointer"
              >
                Sign in here &rarr;
              </button>
            </span>
            <button
              onClick={onBack || (() => onNavigate('landing'))}
              className="font-semibold text-[#647773] hover:text-[#0F766E] cursor-pointer"
            >
              &larr; Back to Role Selection
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
