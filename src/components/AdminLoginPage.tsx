import React, { useState } from 'react';
import { ViewMode } from '../types';
import { Shield, AlertCircle, ArrowLeft, Key, TrainTrack, Lock } from 'lucide-react';

interface AdminLoginPageProps {
  onAdminLogin: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  onNavigate: (view: ViewMode) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onAdminLogin, onNavigate }) => {
  const [email, setEmail] = useState('admin@railcare.gov.in');
  const [password, setPassword] = useState('Admin@1234');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await Promise.resolve(onAdminLogin(email.trim().toLowerCase(), password));
      if (res && res.success) {
        onNavigate('admin-dashboard');
      } else {
        setError(res?.message || 'Invalid administrator credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Admin authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      <div className="bg-white rounded-3xl border border-[#E8E2D3] shadow-md p-8 sm:p-10 relative">
        
        {/* Official Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#142B4A] text-[#E9B949] text-[11px] font-extrabold uppercase tracking-wider rounded-full mb-3 border border-[#E9B949]/30">
            <Lock className="w-3 h-3" />
            AUTHORIZED PERSONNEL ONLY
          </div>

          <div className="w-14 h-14 bg-[#FFF5DC] text-[#142B4A] border-2 border-[#E9B949] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Shield className="w-7 h-7 text-[#142B4A]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] tracking-tight">
            RAIL CARE Control Center
          </h1>
          <p className="text-xs text-[#6B7280] mt-1 font-medium">
            Senior Divisional Officer & Administration Authentication
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
            <div className="font-medium">{error}</div>
          </div>
        )}

        {/* Credentials reminder box with 1-click autofill */}
        <div className="mb-6 p-4 bg-[#FFF5DC]/70 border border-[#E8E2D3] rounded-2xl text-xs text-[#253247] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-[#142B4A] flex items-center gap-1.5">
              <Key className="w-4 h-4 text-[#E9B949]" /> Default Officer Credentials:
            </span>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@railcare.gov.in');
                setPassword('Admin@1234');
              }}
              className="text-[10px] font-bold px-2 py-0.5 bg-[#142B4A] text-white rounded-md hover:bg-[#243F63] transition cursor-pointer"
            >
              1-Click Auto-Fill
            </button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[11px] text-[#6B7280]">
            <span>Email: <code className="font-mono text-[#142B4A] font-bold bg-white px-2 py-0.5 rounded border border-[#E8E2D3]">admin@railcare.gov.in</code></span>
            <span>Password: <code className="font-mono text-[#142B4A] font-bold bg-white px-2 py-0.5 rounded border border-[#E8E2D3]">Admin@1234</code></span>
          </div>
          <div className="pt-1 border-t border-[#E8E2D3]/60 text-[10px] text-[#6B7280]">
            ⚡ <em>Active Algorithms: FIFO Queue auto-dispatch · Merge Sort (O(N log N)) · Linear Search (O(N))</em>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#253247] mb-1.5">
              Official Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#FFFDF5] border border-[#E8E2D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A] focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#253247] mb-1.5">
              Master Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#FFFDF5] border border-[#E8E2D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A] focus:border-transparent transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 bg-[#142B4A] hover:bg-[#243F63] text-white text-sm font-bold rounded-xl shadow-md transition-all border border-[#142B4A] hover:border-[#E9B949] flex items-center justify-center gap-2 cursor-pointer mt-4 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <Shield className="w-4 h-4 text-[#E9B949]" />
            <span>{loading ? 'Authenticating...' : 'Authenticate Officer Access'}</span>
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-[#6B7280] border-t border-[#E8E2D3] pt-4">
          <button
            onClick={() => onNavigate('login')}
            className="text-[#142B4A] hover:underline inline-flex items-center gap-1.5 font-bold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to passenger login
          </button>
        </div>

      </div>
    </div>
  );
};
