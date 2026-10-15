import React, { useState } from 'react';
import { ViewMode } from '../types';
import { Shield, AlertCircle, ArrowLeft, Key } from 'lucide-react';

interface AdminLoginPageProps {
  onAdminLogin: (email: string, password: string) => { success: boolean; message: string };
  onNavigate: (view: ViewMode) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onAdminLogin, onNavigate }) => {
  const [email, setEmail] = useState('admin@railcare.gov.in');
  const [password, setPassword] = useState('Admin@1234');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = onAdminLogin(email.trim().toLowerCase(), password);
    if (res.success) {
      onNavigate('admin-dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <div className="bg-white rounded-xl border-t-4 border-t-[#12304A] border-x border-b border-slate-200 shadow-md p-6 sm:p-8">
        
        <div className="text-center mb-6">
          <div className="inline-block px-2.5 py-1 bg-slate-100 text-[#12304A] text-[10px] font-extrabold uppercase tracking-wider rounded border border-slate-200 mb-2">
            OFFICIAL USE ONLY
          </div>
          <div className="w-12 h-12 bg-[#12304A] text-amber-300 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-[#12304A]">Administrator Portal</h2>
          <p className="text-xs text-slate-500 mt-1">
            RailCare Grievance Redressal Control Center
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
          <div className="font-semibold text-slate-800 flex items-center gap-1 mb-1">
            <Key className="w-3.5 h-3.5 text-amber-600" /> Default Admin Credentials:
          </div>
          <div>Email: <code className="font-mono text-[#12304A] font-bold">admin@railcare.gov.in</code></div>
          <div>Password: <code className="font-mono text-[#12304A] font-bold">Admin@1234</code></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admin Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#12304A] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Master Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#12304A] focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-[#12304A] hover:bg-[#0c2033] text-white text-sm font-semibold rounded-lg shadow-sm transition mt-2 flex items-center justify-center gap-2"
          >
            <Shield className="w-4 h-4 text-amber-400" />
            Authenticate Control Center
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          <button
            onClick={() => onNavigate('login')}
            className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-3 h-3" />
            Return to passenger login
          </button>
        </div>

      </div>
    </div>
  );
};
