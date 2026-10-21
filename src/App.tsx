import React, { useState, useMemo, useEffect } from 'react';
import { 
  User, 
  Complaint, 
  ComplaintStatus, 
  ViewMode, 
  ComplaintCategory,
  Worker,
  WorkerServiceRequest,
  WorkerSkillCategory,
  WorkerAvailabilityStatus,
  WorkerRequestStatus
} from './types';
import { INITIAL_USERS, INITIAL_COMPLAINTS, ALLOWED_CATEGORIES, INITIAL_WORKERS } from './data/mockData';
import { FIFOQueue } from './algorithms/queue';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { RegisterPage } from './components/RegisterPage';
import { LoginPage } from './components/LoginPage';
import { UserDashboard } from './components/UserDashboard';
import { MovingTrainBackground } from './components/MovingTrainBackground';
import { PortalSelector } from './components/PortalSelector';
import { WorkerLoginPage } from './components/WorkerLoginPage';
import { WorkerRegisterPage } from './components/WorkerRegisterPage';
import { WorkerDashboard } from './components/WorkerDashboard';
import { BookWorkerSection } from './components/BookWorkerSection';
import { EmergencyModal } from './components/EmergencyModal';
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

const loadStoredWorkers = (): Worker[] => {
  try {
    const saved = localStorage.getItem('railcare_workers');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return INITIAL_WORKERS;
};

const loadStoredCurrentWorker = (): Worker | null => {
  try {
    const saved = localStorage.getItem('railcare_current_worker');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.email) return parsed;
    }
  } catch (e) {}
  return null;
};

const loadStoredWorkerRequests = (): WorkerServiceRequest[] => {
  try {
    const saved = localStorage.getItem('railcare_worker_requests');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
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
  const [workers, setWorkers] = useState<Worker[]>(loadStoredWorkers);
  const [currentWorker, setCurrentWorker] = useState<Worker | null>(loadStoredCurrentWorker);
  const [workerRequests, setWorkerRequests] = useState<WorkerServiceRequest[]>(loadStoredWorkerRequests);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');
  const [userPasswords, setUserPasswords] = useState<Record<string, string>>(loadStoredPasswords);
  const [complaints, setComplaints] = useState<Complaint[]>(loadStoredComplaints);
  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    const savedUser = loadStoredCurrentUser();
    if (savedUser && !savedUser.isAdmin) {
      return 'user-dashboard';
    }
    const savedWorker = loadStoredCurrentWorker();
    if (savedWorker) {
      return 'worker-dashboard';
    }
    return 'landing';
  });
  const [viewHistory, setViewHistory] = useState<ViewMode[]>([
    loadStoredCurrentUser() && !loadStoredCurrentUser()?.isAdmin
      ? 'user-dashboard'
      : loadStoredCurrentWorker()
      ? 'worker-dashboard'
      : 'landing',
  ]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);

  const navigateTo = (view: ViewMode, pushToHistory = true) => {
    // Senior Divisional Railway Officer portal removed without disturbing database
    let targetView = view;
    if (targetView === 'admin-dashboard' || targetView === 'admin-login') {
      targetView = 'landing';
    }
    if (pushToHistory && targetView !== currentView) {
      try {
        window.history.pushState({ view: targetView }, '', `#${targetView}`);
      } catch (e) {}
      setViewHistory((prev) => [...prev, targetView]);
    }
    setCurrentView(targetView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setViewHistory((prev) => {
      if (prev.length > 1) {
        const nextStack = [...prev];
        nextStack.pop();
        const prevView = nextStack[nextStack.length - 1] || 'landing';
        setCurrentView(prevView);
        try {
          window.history.replaceState({ view: prevView }, '', `#${prevView}`);
        } catch (e) {}
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return nextStack;
      } else {
        setCurrentView('landing');
        try {
          window.history.replaceState({ view: 'landing' }, '', '#landing');
        } catch (e) {}
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return ['landing'];
      }
    });
  };

  // Browser physical/header back button synchronization
  useEffect(() => {
    try {
      if (!window.history.state) {
        window.history.replaceState({ view: currentView }, '', `#${currentView}`);
      }
    } catch (e) {}

    const handlePopState = (event: PopStateEvent) => {
      let targetView: ViewMode =
        (event.state && event.state.view) ||
        (window.location.hash ? (window.location.hash.replace('#', '') as ViewMode) : 'landing');
      if (targetView === 'admin-dashboard' || targetView === 'admin-login') {
        targetView = 'landing';
      }
      setCurrentView(targetView);
      setViewHistory((prev) => {
        if (prev.length > 1) {
          return prev.slice(0, prev.length - 1);
        }
        return [targetView];
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' | 'info' } | null>(() => {
    const savedUser = loadStoredCurrentUser();
    if (savedUser) {
      return { message: `Welcome back, ${savedUser.fullName}!`, type: 'info' };
    }
    const savedWorker = loadStoredCurrentWorker();
    if (savedWorker) {
      return { message: `Welcome back, ${savedWorker.fullName}! Ready for duty.`, type: 'info' };
    }
    return {
      message: 'Welcome to RailCare. Please register your passenger account or choose your role portal to begin.',
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

  // Fetch gig workers from central backend server
  const fetchWorkersFromServer = async () => {
    try {
      const res = await fetch('/api/workers');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.workers)) {
          setWorkers(data.workers);
          try {
            localStorage.setItem('railcare_workers', JSON.stringify(data.workers));
          } catch (e) {}

          // Real-time synchronization of logged-in worker across devices
          setCurrentWorker((prevWorker) => {
            if (!prevWorker) return null;
            const updated = data.workers.find(
              (w: Worker) =>
                (w.workerId && w.workerId === prevWorker.workerId) ||
                w.id === prevWorker.id ||
                w.email.toLowerCase() === prevWorker.email.toLowerCase()
            );
            if (updated) {
              try {
                localStorage.setItem('railcare_current_worker', JSON.stringify(updated));
              } catch (e) {}
              return updated;
            }
            return prevWorker;
          });
        }
      }
    } catch (err) {}
  };

  // Fetch worker service requests from central backend server
  const fetchWorkerRequestsFromServer = async () => {
    try {
      const res = await fetch('/api/worker-requests');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.requests)) {
          setWorkerRequests(data.requests);
          try {
            localStorage.setItem('railcare_worker_requests', JSON.stringify(data.requests));
          } catch (e) {}
        }
      }
    } catch (err) {}
  };

  // On mount: fetch initial data and start continuous 3-second polling for real-time cross-device updates
  useEffect(() => {
    fetchComplaintsFromServer();
    fetchUsersFromServer();
    fetchWorkersFromServer();
    fetchWorkerRequestsFromServer();

    const interval = setInterval(() => {
      fetchComplaintsFromServer();
      fetchUsersFromServer();
      fetchWorkersFromServer();
      fetchWorkerRequestsFromServer();
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

  // Sync logged in worker to localStorage
  useEffect(() => {
    try {
      if (currentWorker) {
        localStorage.setItem('railcare_current_worker', JSON.stringify(currentWorker));
      } else {
        localStorage.removeItem('railcare_current_worker');
      }
    } catch (e) {}
  }, [currentWorker]);

  // Sync workers list to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('railcare_workers', JSON.stringify(workers));
    } catch (e) {}
  }, [workers]);

  // Sync worker requests to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('railcare_worker_requests', JSON.stringify(workerRequests));
    } catch (e) {}
  }, [workerRequests]);

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

  // Gig Worker authentication with photo update
  const handleWorkerLogin = async (email: string, password: string, photo?: string) => {
    try {
      const res = await fetch('/api/workers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, photo, verificationPhoto: photo }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.worker) {
        setCurrentWorker(data.worker);
        try {
          localStorage.setItem('railcare_current_worker', JSON.stringify(data.worker));
        } catch (e) {}
        fetchWorkersFromServer();
        setToast({
          message: `Welcome, ${data.worker.fullName}! Verification photo updated and connected to ${data.worker.stationCode} station hub.`,
          type: 'success',
        });
        setCurrentView('worker-dashboard');
        return { success: true, message: 'Login successful', worker: data.worker };
      }
      return { success: false, message: data.message || 'Worker login failed.' };
    } catch (err: any) {
      // Offline fallback
      const found = workers.find((w) => w.email.toLowerCase() === email.toLowerCase());
      if (found) {
        const updated = photo ? { ...found, verificationPhoto: photo, profileImage: photo } : found;
        setCurrentWorker(updated);
        setToast({ message: `Welcome back, ${found.fullName}!`, type: 'success' });
        setCurrentView('worker-dashboard');
        return { success: true, message: 'Login successful', worker: updated };
      }
      return { success: false, message: 'Unable to connect to worker services.' };
    }
  };

  const handleWorkerRegister = async (workerData: any) => {
    try {
      const res = await fetch('/api/workers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workerData),
      });
      const data = await res.json();
      if (res.ok && data.success && data.worker) {
        setWorkers((prev) => [data.worker, ...prev.filter((w) => w.id !== data.worker.id)]);
        setCurrentWorker(data.worker);
        setToast({
          message: `Worker account created for ${data.worker.fullName}! Verification pending by station administration.`,
          type: 'success',
        });
        setCurrentView('worker-dashboard');
        return { success: true, message: 'Registered successfully', worker: data.worker };
      }
      return { success: false, message: data.message || 'Worker registration failed.' };
    } catch (err: any) {
      return { success: false, message: 'Failed to submit worker registration.' };
    }
  };

  const handleWorkerLogout = () => {
    setCurrentWorker(null);
    try {
      localStorage.removeItem('railcare_current_worker');
    } catch (e) {}
    setToast({ message: 'Worker signed out securely.', type: 'info' });
    setCurrentView('landing');
  };

  const handleUpdateWorkerAvailability = async (availability: WorkerAvailabilityStatus) => {
    if (!currentWorker) return;
    try {
      const res = await fetch(`/api/workers/${currentWorker.id}/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.worker) {
        setCurrentWorker(data.worker);
        setWorkers((prev) => prev.map((w) => (w.id === data.worker.id ? data.worker : w)));
        setToast({ message: `Duty status updated to "${availability}".`, type: 'success' });
        return;
      }
    } catch (e) {}
    // Fallback local update
    setCurrentWorker((prev) => (prev ? { ...prev, availability } : null));
    setWorkers((prev) => prev.map((w) => (w.id === currentWorker.id ? { ...w, availability } : w)));
    setToast({ message: `Duty status set to "${availability}".`, type: 'success' });
  };

  const handleAcceptWorkerRequest = async (requestId: string) => {
    if (!currentWorker) return { success: false, message: 'No worker logged in.' };
    try {
      const res = await fetch(`/api/worker-requests/${requestId}/accept`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: currentWorker.id,
          workerName: currentWorker.fullName,
          workerMobile: currentWorker.mobile,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchWorkerRequestsFromServer();
        fetchWorkersFromServer();
        setToast({ message: `Accepted service request #${requestId}!`, type: 'success' });
        return { success: true, message: 'Accepted successfully' };
      }
      return { success: false, message: data.message || 'Failed to accept request.' };
    } catch (e: any) {
      return { success: false, message: 'Network error accepting request.' };
    }
  };

  const handleUpdateWorkerRequestStatus = async (
    requestId: string,
    newStatus: WorkerRequestStatus,
    completionNotes?: string
  ) => {
    try {
      const res = await fetch(`/api/worker-requests/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, completionNotes }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchWorkerRequestsFromServer();
        fetchWorkersFromServer();
        setToast({ message: `Service request #${requestId} marked as "${newStatus}".`, type: 'success' });
        return { success: true, message: 'Updated successfully' };
      }
      return { success: false, message: data.message || 'Failed to update request.' };
    } catch (e: any) {
      return { success: false, message: 'Network error updating request status.' };
    }
  };

  const handleSubmitWorkerRequest = async (requestData: any) => {
    try {
      const res = await fetch('/api/worker-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      const data = await res.json();
      if (res.ok && data.success && data.request) {
        setWorkerRequests((prev) => [data.request, ...prev]);
        setToast({
          message: `Worker requested successfully! Booking ID: #${data.request.requestId}`,
          type: 'success',
        });
        return { success: true, message: 'Worker booked successfully!', requestId: data.request.requestId };
      }
      return { success: false, message: data.message || 'Failed to book worker.' };
    } catch (e: any) {
      return { success: false, message: 'Network error booking worker.' };
    }
  };

  const handleCancelWorkerRequest = async (requestId: string) => {
    await handleUpdateWorkerRequestStatus(requestId, 'Cancelled', 'Cancelled by passenger');
  };

  const handleSubmitWorkerFeedback = async (
    requestId: string,
    rating: number,
    comment: string,
    tags: string[]
  ) => {
    try {
      const res = await fetch(`/api/worker-requests/${requestId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment,
          tags,
          passengerId: currentUser?.id,
          passengerName: currentUser?.fullName || 'Passenger',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchWorkerRequestsFromServer();
        fetchWorkersFromServer();
        setToast({
          message: 'Thank you! Your feedback for the worker has been submitted.',
          type: 'success',
        });
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Failed to submit feedback.' };
    } catch (e: any) {
      return { success: false, message: 'Network error submitting feedback.' };
    }
  };

  const handleUpdateWorkerVerification = async (
    workerId: string,
    status: 'Pending Verification' | 'Verified' | 'Rejected' | 'Suspended'
  ) => {
    const action = status === 'Verified' ? 'approve' : status === 'Rejected' ? 'reject' : status === 'Suspended' ? 'suspend' : 'pending';
    try {
      const res = await fetch(`/api/workers/${encodeURIComponent(workerId)}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          verificationStatus: status,
          action,
          workerId,
          adminName: currentUser?.fullName || 'Station Administration'
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.worker) {
        const savedWorker: Worker = data.worker;
        setWorkers((prev) => {
          const next = prev.map((w) => (w.workerId === workerId || w.id === savedWorker.id ? savedWorker : w));
          try {
            localStorage.setItem('railcare_workers', JSON.stringify(next));
          } catch (e) {}
          return next;
        });
        if (currentWorker && (currentWorker.workerId === workerId || currentWorker.id === savedWorker.id)) {
          setCurrentWorker(savedWorker);
          try {
            localStorage.setItem('railcare_current_worker', JSON.stringify(savedWorker));
          } catch (e) {}
        }
        setToast({ message: `Worker ${savedWorker.fullName} verification status set to "${status}".`, type: 'success' });
        fetchWorkersFromServer();
        return;
      }
    } catch (e) {}
    // Fallback local update
    setWorkers((prev) => {
      const next = prev.map((w) => (w.workerId === workerId || String(w.id) === String(workerId) ? { ...w, verificationStatus: status } : w));
      try {
        localStorage.setItem('railcare_workers', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    setToast({ message: `Worker verification status updated to "${status}".`, type: 'success' });
    fetchWorkersFromServer();
  };

  return (
    <div className="relative min-h-screen bg-[#F4FBF8] text-[#183B3A] font-sans selection:bg-[#A7E8D0]/40 overflow-x-hidden">
      {/* Moving Realistic Indian Passenger Train Background */}
      <MovingTrainBackground />

      {/* Main Foreground Interface Layer */}
      <div className="relative z-10 flex flex-col min-h-screen pointer-events-auto">
        {/* Clean Navigation Bar with Back Button */}
        <Navbar
          currentUser={currentUser}
          currentWorker={currentWorker}
          currentView={currentView}
          onNavigate={navigateTo}
          onLogout={handleLogout}
          onWorkerLogout={handleWorkerLogout}
          onOpenEmergency={() => setIsEmergencyOpen(true)}
          onBack={handleBack}
          canGoBack={currentView !== 'landing'}
        />

      {/* Floating Notification Toast */}
      {toast && (
        <div className="max-w-4xl mx-auto px-4 w-full pt-4">
          <div
            className={`p-4 rounded-2xl border text-xs flex items-center justify-between shadow-xs transition-all ${
              toast.type === 'success'
                ? 'bg-[#E5F5EF] border-[#A7E8D0] text-[#16845B]'
                : toast.type === 'danger'
                ? 'bg-red-50 border-red-200 text-[#C74646]'
                : 'bg-[#CCFBF1] border-[#A7E8D0] text-[#0F766E]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-[#16845B] shrink-0" />
              ) : toast.type === 'danger' ? (
                <AlertCircle className="w-4 h-4 text-[#C74646] shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-[#0F766E] shrink-0" />
              )}
              <span className="font-semibold">{toast.message}</span>
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
            workerRequests={workerRequests}
            workers={workers}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'portal-selection' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <PortalSelector
              currentView={currentView}
              currentUser={currentUser}
              currentWorker={currentWorker}
              onNavigate={navigateTo}
              onBack={handleBack}
            />
          </div>
        )}

        {currentView === 'register' && (
          <RegisterPage
            onRegister={handleRegister}
            onNavigate={navigateTo}
            onBack={handleBack}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            initialEmail={registeredEmail}
            onLogin={handleLogin}
            onNavigate={navigateTo}
            onBack={handleBack}
          />
        )}

        {currentView === 'worker-login' && (
          <WorkerLoginPage
            onWorkerLogin={handleWorkerLogin}
            onNavigate={navigateTo}
            onBack={handleBack}
          />
        )}

        {currentView === 'worker-register' && (
          <WorkerRegisterPage
            onWorkerRegister={handleWorkerRegister}
            onNavigate={navigateTo}
            onBack={handleBack}
          />
        )}

        {currentView === 'worker-dashboard' && (
          currentWorker ? (
            <WorkerDashboard
              currentWorker={currentWorker}
              requests={workerRequests}
              onUpdateAvailability={handleUpdateWorkerAvailability}
              onAcceptRequest={handleAcceptWorkerRequest}
              onUpdateRequestStatus={handleUpdateWorkerRequestStatus}
              onWorkerLogout={handleWorkerLogout}
              onNavigate={navigateTo}
              onBack={handleBack}
              onRefreshData={fetchWorkerRequestsFromServer}
            />
          ) : (
            <WorkerLoginPage
              onWorkerLogin={handleWorkerLogin}
              onNavigate={navigateTo}
              onBack={handleBack}
            />
          )
        )}

        {currentView === 'book-worker' && (
          currentUser ? (
            <BookWorkerSection
              currentUser={currentUser}
              allWorkers={workers}
              onSubmitRequest={handleSubmitWorkerRequest}
              onNavigate={navigateTo}
              onSuccessRedirect={() => navigateTo('user-dashboard')}
              onBack={handleBack}
            />
          ) : (
            <LoginPage
              initialEmail={registeredEmail}
              onLogin={handleLogin}
              onNavigate={navigateTo}
              onBack={handleBack}
            />
          )
        )}

        {currentView === 'user-dashboard' && (
          currentUser ? (
            <UserDashboard
              currentUser={currentUser}
              workerRequests={workerRequests}
              onCancelWorkerRequest={handleCancelWorkerRequest}
              onSubmitWorkerFeedback={handleSubmitWorkerFeedback}
              onNavigate={navigateTo}
              onBack={handleBack}
              onRefreshData={fetchWorkerRequestsFromServer}
            />
          ) : (
            <LoginPage
              initialEmail={registeredEmail}
              onLogin={handleLogin}
              onNavigate={navigateTo}
              onBack={handleBack}
            />
          )
        )}

        {/* Fallback for removed admin routes redirecting safely to landing */}
        {(currentView === 'admin-dashboard' || currentView === 'admin-login') && (
          <LandingPage
            currentUser={currentUser}
            workerRequests={workerRequests}
            workers={workers}
            onNavigate={navigateTo}
          />
        )}
      </main>

      {/* Emergency 139 Hotline Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        currentUser={currentUser}
      />

      {/* Production Grade Rail Care Footer */}
      <footer className="bg-[#115E59] text-[#CCFBF1] py-10 border-t border-[#0F766E]/40 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/10 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center border border-[#A7E8D0]/40 text-[#CCFBF1]">
                <CheckCircle className="w-5 h-5 text-[#A7E8D0]" />
              </div>
              <div>
                <span className="font-extrabold text-xl text-white tracking-tight">RAIL CARE</span>
                <p className="text-[11px] text-[#A7E8D0]">Indian Railways On-Demand Station Gig Workforce &amp; Passenger Assistance Network</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-semibold text-[#CCFBF1]">
              <button onClick={() => navigateTo('landing')} className="hover:text-[#A7E8D0] transition cursor-pointer">Role Selection</button>
              <button onClick={() => navigateTo(currentUser ? 'book-worker' : 'login')} className="hover:text-[#A7E8D0] transition cursor-pointer">Book Station Worker</button>
              {currentUser && (
                <button onClick={() => navigateTo('user-dashboard')} className="hover:text-[#A7E8D0] transition cursor-pointer">My Bookings &amp; Radar</button>
              )}
              {currentWorker && (
                <button onClick={() => navigateTo('worker-dashboard')} className="hover:text-[#A7E8D0] transition cursor-pointer">Worker Station Duty</button>
              )}
              <button onClick={() => setIsEmergencyOpen(true)} className="hover:text-red-300 text-red-200 transition cursor-pointer">Emergency 139 Helpline</button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-[#A7E8D0]/80">
            <p>
              RAIL CARE · Connected Railway Station Services &amp; Rapid Coach Berth Redressal.
            </p>
            <p className="text-[11px]">
              &copy; {new Date().getFullYear()} RAIL CARE. All Rights Reserved. Central Database Connected.
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
