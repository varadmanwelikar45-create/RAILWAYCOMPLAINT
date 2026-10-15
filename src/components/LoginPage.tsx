import React, { useState, useEffect } from 'react';
import { ViewMode } from '../types';
import { LogIn, AlertCircle, Shield } from 'lucide-react';

interface LoginPageProps {
  initialEmail?: string;
  onLogin: (email: string, password: string) => { success: boolean; message: string; isAdmin?: boolean };
  onNavigate: (view: ViewMode) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialEmail = '', onLogin, onNavigate }) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    const res = onLogin(email.trim().toLowerCase(), password);
    if (res.success) {
      if (res.isAdmin) {
        onNavigate('admin-dashboard');
      } else {
        onNavigate('user-dashboard');
      }
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
        
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-50 text-[#2563EB] rounded-xl flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-[#12304A]">Passenger Login</h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in with your registered email and password.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              required
              autoFocus={!initialEmail}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              required
              autoFocus={Boolean(initialEmail)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-lg shadow-sm transition mt-2 cursor-pointer"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-100 pt-4 space-y-2">
          <div>
            Don't have an account yet?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-[#2563EB] font-semibold hover:underline"
            >
              Register here
            </button>
          </div>
          <div>
            <button
              onClick={() => onNavigate('admin-login')}
              className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 font-medium"
            >
              <Shield className="w-3 h-3 text-[#12304A]" />
              Railway Officer / Administrator Login &rarr;
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
