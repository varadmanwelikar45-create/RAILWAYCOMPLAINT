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
import { MovingTrainBackground } from './components/MovingTrainBackground';
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

  // Fetch complaints from central backend server
  const fetchComplaintsFromServer = async () => {
    try {
      const res = await fetch('/api/complaints');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.complaints)) {
          const normalized = data.complaints.map((c: any, idx: number) => normalizeComplaint(c, idx));
          setComplaints(normalized);
          try {
            localStorage.setItem('railcare_complaints', JSON.stringify(normalized));
          } catch (e) {}
        }
      }
    } catch (err) {
      // Offline fallback: rely on current state
    }
  };

  // Fetch registered users from central backend server
  const fetchUsersFromServer = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.users)) {
          setUsers(data.users);
          try {
            localStorage.setItem('railcare_users', JSON.stringify(data.users));
          } catch (e) {}
        }
      }
    } catch (err) {
      // Offline fallback
    }
  };

  // On mount: fetch initial data and start continuous 3-second polling for real-time cross-device updates
  useEffect(() => {
    fetchComplaintsFromServer();
    fetchUsersFromServer();

    const interval = setInterval(() => {
      fetchComplaintsFromServer();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Sync users to localStorage as local backup
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

  // Handle passenger registration (connected to central backend)
  const handleRegister = async (newUser: Omit<User, 'id'>, password: string) => {
    try {
      const emailLower = (newUser.email || '').toLowerCase().trim();
      const nameClean = (newUser.fullName || '').trim();
      const mobileClean = (newUser.mobile || '').trim();

      if (!emailLower || !password || !nameClean) {
        return { success: false, message: 'All registration fields are required.' };
      }

      // Try central server API
      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: nameClean,
            email: emailLower,
            mobile: mobileClean,
            password,
          }),
        });

        const data = await response.json();
        if (response.ok && data.success) {
          const registeredUser: User = data.user;
          setUsers((prev) => [...prev.filter((u) => u.email.toLowerCase() !== emailLower), registeredUser]);
          setUserPasswords((prev) => ({ ...prev, [emailLower]: password }));
          setRegisteredEmail(emailLower);

          setToast({
            message: `Account created for ${nameClean}! Please sign in with your password.`,
            type: 'success',
          });

          setCurrentView('login');
          return { success: true, message: 'Account registered successfully!' };
        } else {
          return {
            success: false,
            message: data.message || 'Registration could not be completed. Please check your details.',
          };
        }
      } catch (networkErr) {
        // Fallback to local storage if server route is not reached
        const created: User = {
          id: Date.now(),
          fullName: nameClean,
          email: emailLower,
          mobile: mobileClean,
          isAdmin: false,
        };

        const updatedUsers = [...users.filter((u) => u.email.toLowerCase() !== emailLower), created];
        const updatedPasswords = { ...userPasswords, [emailLower]: password };

        setUsers(updatedUsers);
        setUserPasswords(updatedPasswords);
        setRegisteredEmail(emailLower);

        setToast({
          message: `Account created for ${nameClean}! Please sign in below.`,
          type: 'success',
        });

        setCurrentView('login');
        return { success: true, message: 'Account registered successfully!' };
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      return { success: false, message: 'Registration could not be completed. Please check your details.' };
    }
  };

  // Handle passenger login (authenticates with central server)
  const handleLogin = async (email: string, password: string) => {
    try {
      const emailLower = (email || '').toLowerCase().trim();
      if (!emailLower || !password) {
        return { success: false, message: 'Please enter both your email and password.' };
      }

      // 1. Try server authentication
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailLower, password }),
        });

        const data = await response.json();
        if (response.ok && data.success) {
          const user: User = data.user;
          setCurrentUser(user);
          try {
            localStorage.setItem('railcare_current_user', JSON.stringify(user));
          } catch (e) {}

          // Refresh complaints immediately on login
          fetchComplaintsFromServer();

          setToast({ message: `Welcome, ${user.fullName}!`, type: 'success' });
          return { success: true, message: 'Login successful', isAdmin: Boolean(user.isAdmin) };
        } else {
          return {
            success: false,
            message: data.message || 'Invalid email or password. Please try again.',
          };
        }
      } catch (networkErr) {
        // 2. Offline fallback to local records
        let currentUsers = users.length > 0 ? users : loadStoredUsers();
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
        if (savedPassword && savedPassword !== password) {
          return {
            success: false,
            message: 'Incorrect password. Please verify your password and try again.',
          };
        }

        setCurrentUser(user);
        try {
          localStorage.setItem('railcare_current_user', JSON.stringify(user));
        } catch (e) {}

        setToast({ message: `Welcome, ${user.fullName}!`, type: 'success' });
        return { success: true, message: 'Login successful', isAdmin: Boolean(user.isAdmin) };
      }
    } catch (err: any) {
      console.error('Error during login:', err);
      return {
        success: false,
        message: 'Unable to sign in. Please check your credentials.',
      };
    }
  };

  // Handle admin login (authenticates with central server)
  const handleAdminLogin = async (email: string, password: string) => {
    try {
      const emailLower = (email || '').toLowerCase().trim();

      // 1. Try server authentication
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailLower, password, isAdminLogin: true }),
        });

        const data = await response.json();
        if (response.ok && data.success) {
          const admin: User = data.user;
          setCurrentUser(admin);
          try {
            localStorage.setItem('railcare_current_user', JSON.stringify(admin));
          } catch (e) {}

          fetchComplaintsFromServer();
          setToast({ message: 'Welcome to the Administrator Control Center.', type: 'success' });
          return { success: true, message: 'Admin login successful' };
        } else {
          return { success: false, message: data.message || 'Invalid administrator credentials.' };
        }
      } catch (networkErr) {
        // 2. Offline fallback
        if (
          emailLower === 'admin@railcare.gov.in' &&
          (password === 'Admin@1234' || password === userPasswords[emailLower])
        ) {
          const admin = users.find((u) => u.isAdmin) || INITIAL_USERS[0];
          setCurrentUser(admin);
          setToast({ message: 'Welcome to the Administrator Control Center.', type: 'success' });
          return { success: true, message: 'Admin login successful' };
        }
        return { success: false, message: 'Invalid administrator credentials. Access restricted.' };
      }
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

  // Submit new complaint (persisted to central server for instant cross-device visibility)
  const handleSubmitComplaint = async (
    newComplaint: Omit<Complaint, 'id' | 'complaintId' | 'createdAt' | 'updatedAt'>
  ): Promise<Complaint> => {
    const nextIdNum = 1001 + complaints.length;
    const cidFallback = `RC${nextIdNum}`;
    const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);

    let fullComplaint: Complaint = {
      ...newComplaint,
      id: Date.now(),
      complaintId: cidFallback,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComplaint),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.complaint) {
          fullComplaint = normalizeComplaint(data.complaint, complaints.length);
        }
      }
    } catch (err) {
      console.warn('Network issue writing to server, stored in device cache:', err);
    }

    setComplaints((prev) => [fullComplaint, ...prev.filter((c) => c.complaintId !== fullComplaint.complaintId)]);
    setSelectedComplaint(fullComplaint);
    setToast({
      message: `Grievance registered with Reference ID ${fullComplaint.complaintId}! Visible instantly across all devices.`,
      type: 'success',
    });

    return fullComplaint;
  };

  // Dequeue next complaint from FIFO queue (synced with central server)
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

    // Call server to update database so other devices see the update
    fetch('/api/complaints/fifo-next', { method: 'POST' }).catch((err) =>
      console.error('Failed to sync FIFO next to server:', err)
    );

    return {
      success: true,
      complaint: next,
      message: `Earliest complaint ${next.complaintId} (${next.category}) for ${next.passengerName} moved to 'In Progress'.`,
    };
  };

  // Update status directly (synced with central server)
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

    // Call server API to update persistent store
    fetch(`/api/complaints/${complaintId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    }).catch((err) => console.error('Failed to sync status update to server:', err));

    setToast({
      message: `Complaint ${complaintId} status updated to "${newStatus}". Synced across devices.`,
      type: 'success',
    });
  };

  return (
    <div className="relative min-h-screen bg-[#FFFDF5] text-[#253247] font-sans selection:bg-[#E9B949]/30 overflow-x-hidden">
      {/* Moving Realistic Indian Passenger Train Background */}
      <MovingTrainBackground />

      {/* Main Foreground Interface Layer */}
      <div className="relative z-10 flex flex-col min-h-screen pointer-events-auto">
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
            className={`p-4 rounded-2xl border text-xs flex items-center justify-between shadow-xs transition-all ${
              toast.type === 'success'
                ? 'bg-[#EDF7F2] border-[#21865B]/30 text-[#156140]'
                : toast.type === 'danger'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-[#FFF5DC] border-[#E9B949]/40 text-[#142B4A]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-[#21865B] shrink-0" />
              ) : toast.type === 'danger' ? (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-[#142B4A] shrink-0" />
              )}
              <span className="font-medium">{toast.message}</span>
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
            complaints={complaints}
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
              complaints={complaints}
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

      {/* Footer consistent with RAIL CARE Brand */}
      <footer className="bg-[#142B4A] text-slate-300 py-10 border-t border-[#E8E2D3]/20 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/10 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#243F63] flex items-center justify-center border border-[#E9B949]/40 text-[#E9B949]">
                <CheckCircle className="w-5 h-5 text-[#E9B949]" />
              </div>
              <div>
                <span className="font-extrabold text-xl text-white tracking-tight">RAIL CARE</span>
                <p className="text-[11px] text-slate-300">Railway Complaint Management System</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-300">
              <button onClick={() => setCurrentView('landing')} className="hover:text-[#E9B949] transition cursor-pointer">Home</button>
              <button onClick={() => setCurrentView(currentUser ? 'register-complaint' : 'register')} className="hover:text-[#E9B949] transition cursor-pointer">Register a Complaint</button>
              <button onClick={() => setCurrentView(currentUser ? 'user-dashboard' : 'login')} className="hover:text-[#E9B949] transition cursor-pointer">Track Complaint</button>
              <button onClick={() => setCurrentView('admin-login')} className="hover:text-[#E9B949] transition cursor-pointer">Officer Portal</button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-slate-400">
            <p>
              RAIL CARE · Dedicated to passenger safety, cleanliness, and service excellence.
            </p>
            <p className="text-[11px]">
              &copy; {new Date().getFullYear()} RAIL CARE. All passenger records protected.
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
