import React, { useState } from 'react';
import { ViewMode } from '../types';
import { Shield, AlertCircle, ArrowLeft, Key, Lock } from 'lucide-react';

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
      <div className="bg-white rounded-3xl border border-[#D8EAE4] shadow-xs p-8 sm:p-10 relative">
        
        {/* Official Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#CCFBF1] text-[#0F766E] text-[11px] font-extrabold uppercase tracking-wider rounded-full mb-3 border border-[#A7E8D0]">
            <Lock className="w-3 h-3 text-[#0F766E]" />
            AUTHORIZED PERSONNEL ONLY
          </div>

          <div className="w-14 h-14 bg-[#E5F5EF] text-[#0F766E] border-2 border-[#A7E8D0] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Shield className="w-7 h-7 text-[#0F766E]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#115E59] tracking-tight">
            RAIL CARE Control Center
          </h1>
          <p className="text-xs text-[#647773] mt-1 font-medium">
            Station Administration &amp; Grievance Management
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-[#C74646] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#C74646]" />
            <div className="font-medium">{error}</div>
          </div>
        )}

        {/* Credentials reminder box with 1-click autofill */}
        <div className="mb-6 p-4 bg-[#F4FBF8] border border-[#D8EAE4] rounded-2xl text-xs text-[#183B3A] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-[#115E59] flex items-center gap-1.5">
              <Key className="w-4 h-4 text-[#0F766E]" /> Default Officer Credentials:
            </span>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@railcare.gov.in');
                setPassword('Admin@1234');
              }}
              className="text-[10px] font-bold px-2 py-0.5 bg-[#0F766E] text-white rounded-md hover:bg-[#115E59] transition cursor-pointer"
            >
              1-Click Auto-Fill
            </button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[11px] text-[#647773]">
            <span>Email: <code className="font-mono text-[#0F766E] font-bold bg-white px-2 py-0.5 rounded border border-[#D8EAE4]">admin@railcare.gov.in</code></span>
            <span>Password: <code className="font-mono text-[#0F766E] font-bold bg-white px-2 py-0.5 rounded border border-[#D8EAE4]">Admin@1234</code></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#183B3A] mb-1.5">
              Official Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8EAE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition text-[#183B3A]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#183B3A] mb-1.5">
              Master Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8EAE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition text-[#183B3A]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 bg-[#0F766E] hover:bg-[#115E59] text-white text-sm font-bold rounded-xl shadow-xs transition-all border border-[#0F766E] flex items-center justify-center gap-2 cursor-pointer mt-4 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <Shield className="w-4 h-4 text-[#A7E8D0]" />
            <span>{loading ? 'Authenticating...' : 'Authenticate Officer Access'}</span>
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-[#647773] border-t border-[#D8EAE4] pt-4">
          <button
            onClick={() => onNavigate('login')}
            className="text-[#0F766E] hover:underline inline-flex items-center gap-1.5 font-bold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to passenger login
          </button>
        </div>

      </div>
    </div>
  );
};
