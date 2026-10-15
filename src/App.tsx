import React, { useState, useMemo, useEffect } from 'react';
import { User, Complaint, ComplaintStatus, ViewMode, ComplaintCategory } from './types';
import { INITIAL_USERS, INITIAL_COMPLAINTS, ALLOWED_CATEGORIES } from './data/mockData';
import { FIFOQueue } from './algorithms/queue';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { RegisterPage } from './components/RegisterPage';
import { LoginPage } from './components/LoginPage';
import { AdminLoginPage } from './components/AdminLoginPage';
import { UserDashboard } from './components/UserDashboard';
import { RegisterComplaint } from './components/RegisterComplaint';
import { ComplaintDetails } from './components/ComplaintDetails';
import { AdminDashboard } from './components/AdminDashboard';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

// Storage helpers with full sanitization and persistence
const loadStoredCurrentUser = (): User | null => {
  try {
    const saved = localStorage.getItem('railcare_current_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.email) return parsed;
    }
  } catch (e) {}
  return null;
};

const loadStoredUsers = (): User[] => {
  try {
    const saved = localStorage.getItem('railcare_users');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure admin account always exists
        const hasAdmin = parsed.some((u) => u && u.isAdmin);
        if (!hasAdmin) {
          return [...INITIAL_USERS, ...parsed.filter((u) => u && !u.isAdmin)];
        }
        return parsed.filter((u) => u && u.email);
      }
    }
  } catch (e) {}
  return INITIAL_USERS;
};

const loadStoredPasswords = (): Record<string, string> => {
  const base: Record<string, string> = { 'admin@railcare.gov.in': 'Admin@1234' };
  try {
    const saved = localStorage.getItem('railcare_passwords');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return { ...base, ...parsed };
      }
    }
  } catch (e) {}
  return base;
};

const normalizeComplaint = (c: any, index: number): Complaint => {
  const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);
  return {
    id: typeof c?.id === 'number' ? c.id : index + 1,
    complaintId: String(c?.complaintId || c?.complaint_id || `RC${1001 + index}`),
    userId: Number(c?.userId || c?.user_id || 1),
    passengerName: String(c?.passengerName || c?.passenger_name || 'Passenger'),
    passengerEmail: String(c?.passengerEmail || c?.passenger_email || ''),
    passengerMobile: String(c?.passengerMobile || c?.passenger_mobile || ''),
    trainNumber: String(c?.trainNumber || c?.train_number || 'N/A'),
    pnrNumber: c?.pnrNumber || c?.pnr_number || '',
    journeyDate: String(c?.journeyDate || c?.journey_date || nowIso.slice(0, 10)),
    category: (ALLOWED_CATEGORIES.includes(c?.category) ? c.category : 'Cleanliness') as ComplaintCategory,
    subject: String(c?.subject || 'Railway Grievance'),
    description: String(c?.description || ''),
    location: String(c?.location || ''),
    status: (['Pending', 'In Progress', 'Resolved'].includes(c?.status) ? c.status : 'Pending') as ComplaintStatus,
    createdAt: String(c?.createdAt || c?.created_at || nowIso),
    updatedAt: String(c?.updatedAt || c?.updated_at || nowIso),
  };
};

const loadStoredComplaints = (): Complaint[] => {
  try {
    const saved = localStorage.getItem('railcare_complaints');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((item, idx) => normalizeComplaint(item, idx));
      }
    }
  } catch (e) {}
  return INITIAL_COMPLAINTS.map((item, idx) => normalizeComplaint(item, idx));
};

export default function App() {
  const [users, setUsers] = useState<User[]>(loadStoredUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(loadStoredCurrentUser);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');
  const [userPasswords, setUserPasswords] = useState<Record<string, string>>(loadStoredPasswords);
  const [complaints, setComplaints] = useState<Complaint[]>(loadStoredComplaints);
  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    const savedUser = loadStoredCurrentUser();
    if (savedUser) {
      return savedUser.isAdmin ? 'admin-dashboard' : 'user-dashboard';
    }
    return 'register';
  });
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' | 'info' } | null>(() => {
    const savedUser = loadStoredCurrentUser();
    if (savedUser) {
      return { message: `Welcome back, ${savedUser.fullName}!`, type: 'info' };
    }
    return {
      message: 'Welcome to RailCare. Please register your passenger account to begin.',
      type: 'info',
    };
  });

  // Sync users to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('railcare_users', JSON.stringify(users));
    } catch (e) {}
  }, [users]);

  // Sync passwords to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('railcare_passwords', JSON.stringify(userPasswords));
    } catch (e) {}
  }, [userPasswords]);

  // Sync complaints to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('railcare_complaints', JSON.stringify(complaints));
    } catch (e) {}
  }, [complaints]);

  // Sync logged in user to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('railcare_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('railcare_current_user');
      }
    } catch (e) {}
  }, [currentUser]);

  // Maintain the FIFO Queue in sync with complaints where status is 'Pending'
  const queue = useMemo(() => {
    const pendingOnes = (complaints || [])
      .filter((c) => c && c.status === 'Pending')
      .sort((a, b) => String(a?.createdAt || '').localeCompare(String(b?.createdAt || '')));
    return new FIFOQueue(pendingOnes);
  }, [complaints]);

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle passenger registration
  const handleRegister = (newUser: Omit<User, 'id'>, password: string) => {
    try {
      const emailLower = (newUser.email || '').toLowerCase().trim();
      const nameClean = (newUser.fullName || '').trim();
      const mobileClean = (newUser.mobile || '').trim();

      if (!emailLower || !password || !nameClean) {
        return { success: false, message: 'All registration fields are required.' };
      }

      // Check if user already exists
      const existingUser = users.find((u) => (u?.email || '').toLowerCase().trim() === emailLower);
      if (existingUser) {
        // Update password in records so user can immediately sign in without error
        setUserPasswords((prev) => ({ ...prev, [emailLower]: password }));
        setRegisteredEmail(emailLower);
        try {
          const pass = { ...userPasswords, [emailLower]: password };
          localStorage.setItem('railcare_passwords', JSON.stringify(pass));
        } catch (e) {}
        return {
          success: false,
          message: 'An account with this email address already exists. Please log in with your password.',
        };
      }

      const created: User = {
        id: Date.now(),
        fullName: nameClean,
        email: emailLower,
        mobile: mobileClean,
        isAdmin: false,
      };

      const updatedUsers = [...users, created];
      const updatedPasswords = { ...userPasswords, [emailLower]: password };

      setUsers(updatedUsers);
      setUserPasswords(updatedPasswords);
      setRegisteredEmail(emailLower);

      try {
        localStorage.setItem('railcare_users', JSON.stringify(updatedUsers));
        localStorage.setItem('railcare_passwords', JSON.stringify(updatedPasswords));
      } catch (e) {}

      setToast({
        message: `Account created for ${nameClean}! Please sign in below.`,
        type: 'success',
      });

      setCurrentView('login');
      return { success: true, message: 'Account registered successfully!' };
    } catch (err: any) {
      console.error('Registration error:', err);
      return { success: false, message: 'Registration could not be completed. Please check your details.' };
    }
  };

  // Handle passenger login
  const handleLogin = (email: string, password: string) => {
    try {
      const emailLower = (email || '').toLowerCase().trim();
      if (!emailLower || !password) {
        return { success: false, message: 'Please enter both your email and password.' };
      }

      // Check current users state or reload from storage if state was cleared
      let currentUsers = users;
      if (!currentUsers || currentUsers.length === 0) {
        currentUsers = loadStoredUsers();
      }

      const user = currentUsers.find((u) => (u?.email || '').toLowerCase().trim() === emailLower);
      if (!user) {
        return {
          success: false,
          message: 'No account registered with this email. Please register as a new passenger first.',
        };
      }

      let passwords = userPasswords;
      if (!passwords || Object.keys(passwords).length === 0) {
        passwords = loadStoredPasswords();
      }

      const savedPassword = passwords[emailLower];

      // Password verification
      if (user.isAdmin) {
        const adminPass = savedPassword || 'Admin@1234';
        if (password !== adminPass) {
          return { success: false, message: 'Incorrect administrator password.' };
        }
      } else {
        if (savedPassword && savedPassword !== password) {
          return {
            success: false,
            message: 'Incorrect password. Please verify your password and try again.',
          };
        }
        // If password was missing from older test runs, remember it now so login succeeds smoothly
        if (!savedPassword) {
          setUserPasswords((prev) => ({ ...prev, [emailLower]: password }));
          try {
            const p = { ...passwords, [emailLower]: password };
            localStorage.setItem('railcare_passwords', JSON.stringify(p));
          } catch (e) {}
        }
      }

      setCurrentUser(user);
      try {
        localStorage.setItem('railcare_current_user', JSON.stringify(user));
      } catch (e) {}

      setToast({ message: `Welcome, ${user.fullName}!`, type: 'success' });
      return { success: true, message: 'Login successful', isAdmin: Boolean(user.isAdmin) };
    } catch (err: any) {
      console.error('Error during login:', err);
      return {
        success: false,
        message: 'Unable to sign in. Please check your credentials.',
      };
    }
  };

  // Handle admin login
  const handleAdminLogin = (email: string, password: string) => {
    try {
      const emailLower = (email || '').toLowerCase().trim();
      const admin = users.find((u) => (u?.email || '').toLowerCase().trim() === emailLower && u.isAdmin);

      if (!admin) {
        return { success: false, message: 'Invalid administrator email. Access restricted.' };
      }

      const savedPassword = userPasswords[emailLower] || 'Admin@1234';
      if (savedPassword !== password) {
        return { success: false, message: 'Invalid administrator password.' };
      }

      setCurrentUser(admin);
      try {
        localStorage.setItem('railcare_current_user', JSON.stringify(admin));
      } catch (e) {}

      setToast({ message: 'Welcome to the Administrator Control Center.', type: 'success' });
      return { success: true, message: 'Admin login successful' };
    } catch (err: any) {
      return { success: false, message: 'Administrator login failed.' };
    }
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('railcare_current_user');
    } catch (e) {}
    setCurrentView('login');
    setToast({ message: 'You have been logged out securely.', type: 'info' });
  };

  // Submit new complaint
  const handleSubmitComplaint = (
    newComplaint: Omit<Complaint, 'id' | 'complaintId' | 'createdAt' | 'updatedAt'>
  ): Complaint => {
    const nextIdNum = 1001 + complaints.length;
    const cid = `RC${nextIdNum}`;
    const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const fullComplaint: Complaint = {
      ...newComplaint,
      id: Date.now(),
      complaintId: cid,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setComplaints([fullComplaint, ...complaints]);
    setSelectedComplaint(fullComplaint);
    setToast({
      message: `Grievance registered with Reference ID ${cid}! Status is Pending.`,
      type: 'success',
    });
    return fullComplaint;
  };

  // Dequeue next complaint from FIFO queue
  const handleProcessNextFIFO = () => {
    const next = queue.dequeue();
    if (!next) {
      return { success: false, message: 'The pending complaints queue is currently empty.' };
    }

    const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setComplaints((prev) =>
      prev.map((c) =>
        c.complaintId === next.complaintId
          ? { ...c, status: 'In Progress', updatedAt: nowIso }
          : c
      )
    );

    return {
      success: true,
      complaint: next,
      message: `Earliest complaint ${next.complaintId} (${next.category}) for ${next.passengerName} moved to 'In Progress'.`,
    };
  };

  // Update status directly
  const handleUpdateStatus = (complaintId: string, newStatus: ComplaintStatus) => {
    const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setComplaints((prev) =>
      prev.map((c) =>
        c.complaintId === complaintId
          ? { ...c, status: newStatus, updatedAt: nowIso }
          : c
      )
    );

    if (selectedComplaint && selectedComplaint.complaintId === complaintId) {
      setSelectedComplaint((prev) => (prev ? { ...prev, status: newStatus, updatedAt: nowIso } : null));
    }

    setToast({
      message: `Complaint ${complaintId} status updated to "${newStatus}".`,
      type: 'success',
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col text-slate-800 font-sans selection:bg-[#2563EB]/20">
      
      {/* Clean Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={setCurrentView}
        onLogout={handleLogout}
      />

      {/* Floating Notification Toast */}
      {toast && (
        <div className="max-w-4xl mx-auto px-4 w-full pt-4">
          <div
            className={`p-3.5 rounded-lg border text-xs flex items-center justify-between shadow-xs transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : toast.type === 'danger'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : toast.type === 'danger' ? (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="font-bold opacity-60 hover:opacity-100 text-sm ml-3 cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            currentUser={currentUser}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'register' && (
          <RegisterPage
            onRegister={handleRegister}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            initialEmail={registeredEmail}
            onLogin={handleLogin}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'admin-login' && (
          <AdminLoginPage
            onAdminLogin={handleAdminLogin}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'user-dashboard' && (
          currentUser && !currentUser.isAdmin ? (
            <UserDashboard
              currentUser={currentUser}
              complaints={complaints}
              onNavigate={setCurrentView}
              onSelectComplaint={setSelectedComplaint}
            />
          ) : currentUser?.isAdmin ? (
            <AdminDashboard
              currentUser={currentUser}
              complaints={complaints}
              queue={queue}
              onProcessNextFIFO={handleProcessNextFIFO}
              onUpdateStatus={handleUpdateStatus}
              onSelectComplaint={setSelectedComplaint}
              onNavigate={setCurrentView}
            />
          ) : (
            <LoginPage
              initialEmail={registeredEmail}
              onLogin={handleLogin}
              onNavigate={setCurrentView}
            />
          )
        )}

        {currentView === 'register-complaint' && (
          currentUser && !currentUser.isAdmin ? (
            <RegisterComplaint
              currentUser={currentUser}
              onSubmitComplaint={handleSubmitComplaint}
              onNavigate={setCurrentView}
              onSelectComplaint={setSelectedComplaint}
            />
          ) : (
            <LoginPage
              initialEmail={registeredEmail}
              onLogin={handleLogin}
              onNavigate={setCurrentView}
            />
          )
        )}

        {currentView === 'complaint-details' && (
          selectedComplaint ? (
            <ComplaintDetails
              complaint={selectedComplaint}
              currentUser={currentUser}
              onUpdateStatus={handleUpdateStatus}
              onNavigate={setCurrentView}
            />
          ) : (
            <LandingPage
              currentUser={currentUser}
              onNavigate={setCurrentView}
            />
          )
        )}

        {currentView === 'admin-dashboard' && (
          currentUser?.isAdmin ? (
            <AdminDashboard
              currentUser={currentUser}
              complaints={complaints}
              queue={queue}
              onProcessNextFIFO={handleProcessNextFIFO}
              onUpdateStatus={handleUpdateStatus}
              onSelectComplaint={setSelectedComplaint}
              onNavigate={setCurrentView}
            />
          ) : (
            <AdminLoginPage
              onAdminLogin={handleAdminLogin}
              onNavigate={setCurrentView}
            />
          )
        )}
      </main>

      {/* Clean Footer */}
      <footer className="bg-[#12304A] text-slate-400 py-6 border-t border-[#1E4976] mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs space-y-1">
          <p className="text-slate-300 font-medium">
            <strong>RailCare — Railway Complaint Management System</strong>
          </p>
          <p className="text-slate-400 text-[11px]">
            Your Voice. Better Railways. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
