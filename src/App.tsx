import React, { useState, useMemo, useEffect } from 'react';
import { User, Complaint, ComplaintStatus, ViewMode } from './types';
import { INITIAL_USERS, INITIAL_COMPLAINTS } from './data/mockData';
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

export default function App() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  // User starts unauthenticated on the registration page at first
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');
  const [userPasswords, setUserPasswords] = useState<Record<string, string>>({
    'admin@railcare.gov.in': 'Admin@1234',
  });

  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  // At first, open the passenger registration page
  const [currentView, setCurrentView] = useState<ViewMode>('register');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' | 'info' } | null>({
    message: 'Welcome to RailCare. Please register your passenger account to begin.',
    type: 'info'
  });

  // Maintain the FIFO Queue in sync with complaints where status is 'Pending'
  const queue = useMemo(() => {
    const pendingOnes = complaints
      .filter((c) => c.status === 'Pending')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
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
    const emailLower = newUser.email.toLowerCase();
    const exists = users.some((u) => u.email.toLowerCase() === emailLower);
    if (exists) {
      return { success: false, message: 'An account with this email address already exists. Please log in.' };
    }

    const created: User = {
      ...newUser,
      id: users.length + 1,
    };

    setUsers((prev) => [...prev, created]);
    setUserPasswords((prev) => ({ ...prev, [emailLower]: password }));
    setRegisteredEmail(newUser.email);

    setToast({
      message: 'Account registered successfully! Please log in with your password.',
      type: 'success',
    });

    // Switch to login view after registration so passenger can log in
    setCurrentView('login');
    return { success: true, message: 'Account registered successfully!' };
  };

  // Handle passenger login
  const handleLogin = (email: string, password: string) => {
    const emailLower = email.toLowerCase().trim();
    const user = users.find((u) => u.email.toLowerCase() === emailLower);

    if (!user) {
      return {
        success: false,
        message: 'No account found with this email. Please register first.',
      };
    }

    const savedPassword = userPasswords[emailLower];
    if (savedPassword && savedPassword !== password) {
      return {
        success: false,
        message: 'Incorrect password. Please verify and try again.',
      };
    }

    setCurrentUser(user);
    setToast({ message: `Welcome, ${user.fullName}!`, type: 'success' });
    return { success: true, message: 'Login successful', isAdmin: user.isAdmin };
  };

  // Handle admin login
  const handleAdminLogin = (email: string, password: string) => {
    const emailLower = email.toLowerCase().trim();
    const admin = users.find((u) => u.email.toLowerCase() === emailLower && u.isAdmin);

    if (!admin) {
      return { success: false, message: 'Invalid administrator email. Access restricted.' };
    }

    const savedPassword = userPasswords[emailLower] || 'Admin@1234';
    if (savedPassword !== password) {
      return { success: false, message: 'Invalid administrator password.' };
    }

    setCurrentUser(admin);
    setToast({ message: 'Welcome to the Administrator Control Center.', type: 'success' });
    return { success: true, message: 'Admin login successful' };
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
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
      id: complaints.length + 1,
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

        {currentView === 'user-dashboard' && currentUser && !currentUser.isAdmin && (
          <UserDashboard
            currentUser={currentUser}
            complaints={complaints}
            onNavigate={setCurrentView}
            onSelectComplaint={setSelectedComplaint}
          />
        )}

        {currentView === 'register-complaint' && currentUser && !currentUser.isAdmin && (
          <RegisterComplaint
            currentUser={currentUser}
            onSubmitComplaint={handleSubmitComplaint}
            onNavigate={setCurrentView}
            onSelectComplaint={setSelectedComplaint}
          />
        )}

        {currentView === 'complaint-details' && selectedComplaint && (
          <ComplaintDetails
            complaint={selectedComplaint}
            currentUser={currentUser}
            onUpdateStatus={handleUpdateStatus}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'admin-dashboard' && currentUser?.isAdmin && (
          <AdminDashboard
            currentUser={currentUser}
            complaints={complaints}
            queue={queue}
            onProcessNextFIFO={handleProcessNextFIFO}
            onUpdateStatus={handleUpdateStatus}
            onSelectComplaint={setSelectedComplaint}
            onNavigate={setCurrentView}
          />
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
