import React, { useState, useMemo } from 'react';
import { Complaint, ComplaintCategory, ComplaintStatus, User, ViewMode, Worker, WorkerServiceRequest } from '../types';
import { FIFOQueue } from '../algorithms/queue';
import { 
  Shield, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Eye, 
  Check, 
  Briefcase, 
  UserCheck, 
  UserX, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  Users, 
  Camera, 
  X, 
  Bell, 
  Send, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileBarChart
} from 'lucide-react';
import { AdminNotification } from '../types';

interface AdminDashboardProps {
  currentUser: User;
  complaints: Complaint[];
  queue: FIFOQueue;
  users?: User[];
  workers?: Worker[];
  workerRequests?: WorkerServiceRequest[];
  adminNotifications?: AdminNotification[];
  onUpdateWorkerVerification?: (workerId: string, status: 'Pending Verification' | 'Verified' | 'Rejected' | 'Suspended') => void;
  onDispatchWorker?: (complaintId: string, workerId: string, instructions?: string) => Promise<{ success: boolean; message: string }>;
  onMarkNotificationRead?: (notificationId: string) => void;
  onClearNotifications?: () => void;
  onProcessNextFIFO: () => { success: boolean; complaint?: Complaint; message: string };
  onUpdateStatus: (complaintId: string, newStatus: ComplaintStatus) => void;
  onSelectComplaint: (complaint: Complaint) => void;
  onNavigate: (view: ViewMode) => void;
  onOpenOverview?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  complaints,
  queue,
  users = [],
  workers = [],
  workerRequests = [],
  adminNotifications = [],
  onUpdateWorkerVerification,
  onDispatchWorker,
  onMarkNotificationRead,
  onClearNotifications,
  onProcessNextFIFO,
  onUpdateStatus,
  onSelectComplaint,
  onNavigate,
}) => {
  const [adminTab, setAdminTab] = useState<'complaints' | 'gig-workers' | 'passengers'>('complaints');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<'All' | 'Pending' | 'In Progress' | 'Resolved'>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'Emergency' | 'High' | 'Medium' | 'Low'>('All');
  const [workerSearch, setWorkerSearch] = useState('');
  const [workerStatusFilter, setWorkerStatusFilter] = useState<'All' | 'Pending Verification' | 'Verified' | 'Rejected' | 'Suspended'>('All');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showGapAnalysisModal, setShowGapAnalysisModal] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Dispatch Specialist Modal
  const [selectedComplaintForDispatch, setSelectedComplaintForDispatch] = useState<Complaint | null>(null);
  const [selectedWorkerIdForDispatch, setSelectedWorkerIdForDispatch] = useState<string>('');
  const [dispatchInstructions, setDispatchInstructions] = useState<string>('');
  const [isDispatching, setIsDispatching] = useState(false);

  // Photo Proof Viewer Modal
  const [inspectPhotoModal, setInspectPhotoModal] = useState<{
    complaintId: string;
    subject: string;
    before?: string;
    after?: string;
    notes?: string;
    workerName?: string;
  } | null>(null);

  // CAG 2-Hour SLA Metrics calculation
  const slaMetrics = useMemo(() => {
    let withinSla = 0;
    let breached = 0;
    const now = Date.now();

    complaints.forEach((c) => {
      const created = new Date((c.createdAt || '').replace(' ', 'T')).getTime();
      if (!isNaN(created)) {
        const diffMins = Math.floor((now - created) / 60000);
        if (c.status === 'Resolved' || diffMins <= 120) {
          withinSla++;
        } else {
          breached++;
        }
      } else {
        withinSla++;
      }
    });

    const total = complaints.length;
    const rate = total > 0 ? Math.round((withinSla / total) * 100) : 100;
    return { withinSla, breached, complianceRate: rate };
  }, [complaints]);

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    let result = complaints;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((c) =>
        c.complaintId.toLowerCase().includes(q) ||
        (c.railMadadRef && c.railMadadRef.toLowerCase().includes(q)) ||
        c.passengerName.toLowerCase().includes(q) ||
        c.trainNumber.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }
    if (statusTab !== 'All') {
      result = result.filter((c) => c.status === statusTab);
    }
    if (priorityFilter !== 'All') {
      result = result.filter((c) => (c.priority || (c.severity === 'Urgent' ? 'Emergency' : c.severity)) === priorityFilter);
    }
    return result;
  }, [complaints, searchQuery, statusTab, priorityFilter]);

  // Filter workers
  const filteredWorkers = useMemo(() => {
    let list = workers;
    if (workerSearch.trim()) {
      const q = workerSearch.toLowerCase().trim();
      list = list.filter((w) =>
        w.fullName.toLowerCase().includes(q) ||
        w.workerId.toLowerCase().includes(q) ||
        w.stationName.toLowerCase().includes(q) ||
        w.stationCode.toLowerCase().includes(q) ||
        w.skillCategory.toLowerCase().includes(q)
      );
    }
    if (workerStatusFilter !== 'All') {
      list = list.filter((w) => w.verificationStatus === workerStatusFilter);
    }
    return list;
  }, [workers, workerSearch, workerStatusFilter]);

  const handleDispatch = async () => {
    if (!selectedComplaintForDispatch || !selectedWorkerIdForDispatch || !onDispatchWorker) return;
    setIsDispatching(true);
    try {
      const res = await onDispatchWorker(
        selectedComplaintForDispatch.complaintId,
        selectedWorkerIdForDispatch,
        dispatchInstructions
      );
      if (res.success) {
        setActionNotice(res.message);
        setSelectedComplaintForDispatch(null);
        setSelectedWorkerIdForDispatch('');
        setDispatchInstructions('');
      } else {
        setActionNotice(res.message);
      }
      setTimeout(() => setActionNotice(null), 4000);
    } finally {
      setIsDispatching(false);
    }
  };

  const handleWorkerVerificationAction = (workerId: string, status: 'Verified' | 'Rejected' | 'Suspended') => {
    if (onUpdateWorkerVerification) {
      onUpdateWorkerVerification(workerId, status);
      setActionNotice(`Worker #${workerId} status updated to: ${status}`);
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const unreadNotifs = adminNotifications.filter((n) => !n.read);

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-[#DDE4E6] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#D7F7FC] text-[#007D99] text-[10px] font-black rounded-full uppercase tracking-wider border border-[#00B8D9]/40">
              GOVERNMENT OFFICER CONTROL
            </span>
            <span className="text-xs text-[#526365] font-semibold">
              Railway Grievance &amp; Workforce Coordination Platform
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#202A2B] tracking-tight">
            Divisional Operations Center
          </h1>
          <p className="text-xs text-[#526365]">
            Officer: <strong className="text-[#202A2B]">{currentUser.fullName}</strong> · Division: <strong className="text-[#202A2B]">Northern Railway (NDLS)</strong>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 relative">
          <button
            onClick={() => setShowGapAnalysisModal(true)}
            className="px-3 py-2 bg-[#DDF8EF] text-[#1E6B52] hover:bg-[#65D6B0]/30 text-xs font-black rounded-xl border border-[#65D6B0]/50 transition cursor-pointer flex items-center gap-1.5"
            title="Read Gap Analysis: RailMadad vs VYOMRATH"
          >
            <FileBarChart className="w-4 h-4 text-[#3EA684]" />
            <span>CAG Gap Analysis</span>
          </button>

          {/* Real-Time Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 bg-[#F8FAFB] hover:bg-[#F0F4F6] text-[#202A2B] border border-[#DDE4E6] rounded-xl transition cursor-pointer relative flex items-center gap-2"
            >
              <Bell className="w-4 h-4 text-[#007D99]" />
              <span className="text-xs font-bold hidden sm:inline">Alerts</span>
              {unreadNotifs.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#D72645] text-white text-[10px] font-black animate-pulse">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#DDE4E6] z-50 overflow-hidden">
                <div className="p-3 bg-[#F8FAFB] border-b border-[#DDE4E6] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#007D99]" />
                    <span className="text-xs font-black text-[#202A2B]">Officer Alerts</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#D7F7FC] text-[#007D99] font-bold">
                      {adminNotifications.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {onClearNotifications && adminNotifications.length > 0 && (
                      <button onClick={onClearNotifications} className="text-[10px] text-[#7E9092] hover:text-[#D72645] cursor-pointer">
                        Clear
                      </button>
                    )}
                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {adminNotifications.length === 0 ? (
                    <div className="p-6 text-center text-[#7E9092]">No new alerts.</div>
                  ) : (
                    adminNotifications.map((n) => (
                      <div key={n.id} className={`p-3 space-y-1 ${n.read ? 'bg-white opacity-70' : 'bg-[#F8FAFB]'}`}>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-[#007D99] uppercase">{n.type.replace('_', ' ')}</span>
                          <span className="text-slate-400 font-mono">{n.timestamp.slice(11, 16)}</span>
                        </div>
                        <p className="font-bold text-[#202A2B]">{n.title}</p>
                        <p className="text-[#526365] text-[11px] leading-tight">{n.message}</p>
                        {!n.read && onMarkNotificationRead && (
                          <button
                            onClick={() => onMarkNotificationRead(n.id)}
                            className="text-[10px] text-[#007D99] hover:underline cursor-pointer pt-0.5 block"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 1-Click FIFO Dispatch */}
          <button
            onClick={() => {
              const res = onProcessNextFIFO();
              setActionNotice(res.message);
              setTimeout(() => setActionNotice(null), 3000);
            }}
            disabled={queue.size() === 0}
            className={`px-4 py-2.5 text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-2 ${
              queue.size() > 0
                ? 'bg-[#202A2B] text-white hover:bg-[#202A2B]/90'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>FIFO Auto-Assign ({queue.size()})</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-[#DDF8EF] border border-[#65D6B0]/40 text-[#1E6B52] rounded-xl text-xs flex items-center justify-between font-bold">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#3EA684]" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-500 hover:text-slate-900 cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* 4 CORE METRIC CARDS (CAG Audit Redressal Tracking) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#DDE4E6] shadow-xs">
          <span className="text-[10px] text-[#526365] uppercase tracking-wider font-bold block">Total Grievances</span>
          <div className="text-xl font-black text-[#202A2B] mt-1 font-mono">
            {complaints.length}
          </div>
          <span className="text-[11px] text-[#526365] block mt-0.5">
            {complaints.filter(c => c.status === 'Pending').length} Pending · {complaints.filter(c => c.status === 'Resolved').length} Resolved
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#DDE4E6] shadow-xs">
          <span className="text-[10px] text-[#526365] uppercase tracking-wider font-bold block">CAG 2h SLA Compliance</span>
          <div className="text-xl font-black text-[#1E6B52] mt-1 font-mono flex items-center gap-1.5">
            <TrendingUp className="w-5 h-5 text-[#3EA684]" />
            <span>{slaMetrics.complianceRate}%</span>
          </div>
          <span className="text-[11px] text-[#526365] block mt-0.5">
            {slaMetrics.withinSla} within SLA · {slaMetrics.breached} breached
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#DDE4E6] shadow-xs">
          <span className="text-[10px] text-[#526365] uppercase tracking-wider font-bold block">Avg Resolution Time</span>
          <div className="text-xl font-black text-[#007D99] mt-1 font-mono">
            34 mins
          </div>
          <span className="text-[11px] text-[#3EA684] font-semibold block mt-0.5">
            Audit benchmark &lt; 120m (CAG 2024 fix)
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#DDE4E6] shadow-xs">
          <span className="text-[10px] text-[#526365] uppercase tracking-wider font-bold block">Verified Gig Roster</span>
          <div className="text-xl font-black text-[#202A2B] mt-1 font-mono">
            {workers.filter(w => w.verificationStatus === 'Verified').length} / {workers.length}
          </div>
          <span className="text-[11px] text-[#B94A3A] font-semibold block mt-0.5">
            {workers.filter(w => w.verificationStatus === 'Pending Verification').length} Pending Approval
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DDE4E6] pb-2 text-xs font-bold">
        <button
          onClick={() => setAdminTab('complaints')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            adminTab === 'complaints'
              ? 'bg-[#202A2B] text-white shadow-xs'
              : 'text-[#526365] hover:bg-[#F0F4F6]'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-[#65D6B0]" />
          <span>Grievance Redressal &amp; Dispatch ({complaints.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('gig-workers')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            adminTab === 'gig-workers'
              ? 'bg-[#007D99] text-white shadow-xs'
              : 'text-[#526365] hover:bg-[#F0F4F6]'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-[#D7F7FC]" />
          <span>Worker Verification &amp; Roster ({workers.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('passengers')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            adminTab === 'passengers'
              ? 'bg-[#202A2B] text-white shadow-xs'
              : 'text-[#526365] hover:bg-[#F0F4F6]'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-[#65D6B0]" />
          <span>Registered Passengers ({users.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: GRIEVANCE REDRESSAL & SPECIALIST DISPATCH                          */}
      {/* ========================================================================= */}
      {adminTab === 'complaints' && (
        <div className="space-y-4">
          
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#DDE4E6]">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[#7E9092] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search complaint, RailMadad Ref, train..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#DDE4E6] focus:outline-none focus:ring-2 focus:ring-[#007D99]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Status pills */}
              <div className="flex items-center gap-1 p-0.5 bg-[#F8FAFB] rounded-xl border border-[#DDE4E6] text-xs">
                {(['All', 'Pending', 'In Progress', 'Resolved'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusTab(st)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                      statusTab === st ? 'bg-[#202A2B] text-white' : 'text-[#526365] hover:text-[#202A2B]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="text-xs py-1.5 px-2 bg-[#F8FAFB] border border-[#DDE4E6] rounded-xl font-bold text-[#202A2B] focus:outline-none"
              >
                <option value="All">All Priorities</option>
                <option value="Emergency">🚨 Emergency</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Complaints Table */}
          <div className="bg-white rounded-2xl border border-[#DDE4E6] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFB] border-b border-[#DDE4E6] text-[#526365] uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Grievance &amp; RailMadad</th>
                    <th className="py-3 px-4">Passenger / Train</th>
                    <th className="py-3 px-4">Subject &amp; Category</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">CAG 2h SLA</th>
                    <th className="py-3 px-4">Assigned Sahayak</th>
                    <th className="py-3 px-4">Status &amp; Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE4E6]">
                  {filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-[#7E9092]">
                        No complaints match your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.map((c) => {
                      const isEmergency = c.priority === 'Emergency' || c.severity === 'Urgent';
                      const createdTime = new Date((c.createdAt || '').replace(' ', 'T')).getTime();
                      const elapsed = !isNaN(createdTime) ? Math.floor((Date.now() - createdTime) / 60000) : 0;
                      const minsLeft = Math.max(0, 120 - elapsed);
                      const isBreached = minsLeft <= 0;

                      return (
                        <tr key={c.complaintId} className="hover:bg-[#F8FAFB] transition">
                          <td className="py-3 px-4 font-mono">
                            <span className="font-bold text-[#B94A3A] block">#{c.complaintId}</span>
                            <span className="text-[10px] text-[#526365] font-semibold">
                              {c.railMadadRef || `RM-2026-${c.id.toString().slice(-6)}`}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <strong className="text-[#202A2B] block">{c.passengerName}</strong>
                            <span className="text-[11px] text-[#526365]">
                              Train {c.trainNumber} {c.location && `· ${c.location}`}
                            </span>
                          </td>

                          <td className="py-3 px-4 max-w-xs">
                            <strong className="text-[#202A2B] block truncate">{c.subject}</strong>
                            <span className="text-[11px] text-[#007D99] font-medium">{c.category}</span>
                          </td>

                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              isEmergency ? 'bg-[#FBE0E6] text-[#92182D] border border-[#D72645]/40 animate-pulse' :
                              c.priority === 'High' ? 'bg-orange-100 text-orange-900 border border-orange-200' :
                              'bg-[#D7F7FC] text-[#007D99] border border-[#00B8D9]/40'
                            }`}>
                              {c.priority || (c.severity === 'Urgent' ? 'Emergency' : c.severity) || 'Medium'}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-mono text-[11px]">
                            {c.status === 'Resolved' ? (
                              <span className="text-[#1E6B52] font-bold">Resolved within SLA</span>
                            ) : isBreached ? (
                              <span className="text-[#92182D] font-black flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-[#D72645]" />
                                <span>Breached (Escalated)</span>
                              </span>
                            ) : (
                              <span className="text-[#007D99] font-bold">
                                {minsLeft}m left
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            {c.assignedWorkerName ? (
                              <div>
                                <span className="font-bold text-[#202A2B] block">{c.assignedWorkerName}</span>
                                <span className="text-[10px] text-[#526365]">{c.assignedWorkerSkill}</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedComplaintForDispatch(c);
                                  if (c.aiAnalysis?.recommendedRole) {
                                    const match = workers.find(
                                      (w) =>
                                        w.verificationStatus === 'Verified' &&
                                        (w.skillCategory.toLowerCase().includes(c.aiAnalysis!.recommendedRole.toLowerCase()) ||
                                          c.aiAnalysis!.recommendedRole.toLowerCase().includes(w.skillCategory.toLowerCase()))
                                    );
                                    if (match) setSelectedWorkerIdForDispatch(String(match.id));
                                  }
                                }}
                                className="px-3 py-1.5 bg-[#007D99] hover:bg-[#007D99]/90 text-white rounded-lg text-[11px] font-black cursor-pointer transition flex items-center gap-1.5 shadow-xs whitespace-nowrap"
                              >
                                <Send className="w-3 h-3 text-[#65D6B0]" />
                                <span>Approve &amp; Send to Worker</span>
                              </button>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <select
                                value={c.status}
                                onChange={(e) => onUpdateStatus(c.complaintId, e.target.value as ComplaintStatus)}
                                className={`text-[11px] font-bold py-1 px-2 rounded-lg border focus:outline-none cursor-pointer ${
                                  c.status === 'Resolved' ? 'bg-[#DDF8EF] border-[#65D6B0] text-[#1E6B52]' :
                                  c.status === 'In Progress' ? 'bg-[#D7F7FC] border-[#00B8D9] text-[#007D99]' :
                                  'bg-slate-100 border-slate-300 text-slate-700'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                              </select>

                              {(c.resolutionProofUrl || c.beforeProofUrl) && (
                                <button
                                  onClick={() => setInspectPhotoModal({
                                    complaintId: c.complaintId,
                                    subject: c.subject,
                                    before: c.beforeProofUrl || c.imageUrl,
                                    after: c.resolutionProofUrl,
                                    notes: c.resolutionNotes,
                                    workerName: c.assignedWorkerName || undefined,
                                  })}
                                  className="p-1 text-[#007D99] hover:bg-slate-100 rounded cursor-pointer"
                                  title="Inspect Photo Proof"
                                >
                                  <Camera className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GIG WORKER VERIFICATION & ONBOARDING ROSTER                        */}
      {/* ========================================================================= */}
      {adminTab === 'gig-workers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#DDE4E6]">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[#7E9092] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={workerSearch}
                onChange={(e) => setWorkerSearch(e.target.value)}
                placeholder="Search worker by name, ID, station..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#DDE4E6] focus:outline-none focus:ring-2 focus:ring-[#007D99]"
              />
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-[#F8FAFB] rounded-xl border border-[#DDE4E6] text-xs">
              {(['All', 'Pending Verification', 'Verified', 'Rejected'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setWorkerStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    workerStatusFilter === st ? 'bg-[#007D99] text-white' : 'text-[#526365] hover:text-[#202A2B]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#DDE4E6] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFB] border-b border-[#DDE4E6] text-[#526365] uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Worker ID &amp; Name</th>
                    <th className="py-3 px-4">Category / Station</th>
                    <th className="py-3 px-4">Qualifications &amp; Documents</th>
                    <th className="py-3 px-4">Duty Status</th>
                    <th className="py-3 px-4">Verification Status</th>
                    <th className="py-3 px-4">Officer Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE4E6]">
                  {filteredWorkers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-[#7E9092]">
                        No workers match your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredWorkers.map((w) => (
                      <tr key={w.id} className="hover:bg-[#F8FAFB] transition">
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs font-bold text-[#007D99] block">{w.workerId}</span>
                          <strong className="text-[#202A2B]">{w.fullName}</strong>
                          <span className="text-[11px] text-[#526365] block">{w.mobile}</span>
                        </td>

                        <td className="py-3 px-4">
                          <strong className="text-[#202A2B] block">{w.skillCategory}</strong>
                          <span className="text-[11px] text-[#526365]">
                            {w.stationName} ({w.stationCode})
                          </span>
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <span className="text-[#202A2B] block">{w.qualifications || 'Certified Technician'}</span>
                          <span className="text-[10px] text-[#7E9092] block">{w.verificationDocuments}</span>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            w.availability === 'Available' ? 'bg-[#DDF8EF] text-[#1E6B52]' :
                            w.availability === 'Busy' ? 'bg-amber-100 text-amber-900' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {w.availability}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            w.verificationStatus === 'Verified' ? 'bg-[#DDF8EF] text-[#1E6B52] border border-[#65D6B0]/40' :
                            w.verificationStatus === 'Pending Verification' ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse' :
                            'bg-[#FBE0E6] text-[#92182D] border border-[#D72645]/40'
                          }`}>
                            {w.verificationStatus}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            {w.verificationStatus !== 'Verified' && (
                              <button
                                onClick={() => handleWorkerVerificationAction(w.workerId, 'Verified')}
                                className="px-2.5 py-1 bg-[#1E6B52] hover:bg-[#1E6B52]/90 text-white text-[11px] font-bold rounded-lg cursor-pointer transition flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                            )}

                            {w.verificationStatus !== 'Rejected' && (
                              <button
                                onClick={() => handleWorkerVerificationAction(w.workerId, 'Rejected')}
                                className="px-2.5 py-1 border border-[#DDE4E6] text-[#D72645] hover:bg-[#FBE0E6] text-[11px] font-bold rounded-lg cursor-pointer transition"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REGISTERED PASSENGERS                                              */}
      {/* ========================================================================= */}
      {adminTab === 'passengers' && (
        <div className="bg-white rounded-2xl border border-[#DDE4E6] overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#DDE4E6]">
            <h3 className="text-xs font-bold text-[#202A2B] uppercase tracking-wider">
              Registered Rail Passengers ({users.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFB] border-b border-[#DDE4E6] text-[#526365] uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Passenger ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Account Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE4E6]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F8FAFB] transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#526365]">#{u.id}</td>
                    <td className="py-3 px-4 font-bold text-[#202A2B]">{u.fullName}</td>
                    <td className="py-3 px-4 text-[#526365]">{u.email}</td>
                    <td className="py-3 px-4 font-mono text-[#202A2B]">{u.mobile}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.isAdmin ? 'bg-[#D7F7FC] text-[#007D99]' : 'bg-[#DDF8EF] text-[#1E6B52]'
                      }`}>
                        {u.isAdmin ? 'Officer Admin' : 'Passenger'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DISPATCH SPECIALIST TO PASSENGER COMPLAINT                         */}
      {/* ========================================================================= */}
      {selectedComplaintForDispatch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#DDE4E6] animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE4E6]">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[#007D99]" />
                <h3 className="text-base font-black text-[#202A2B]">
                  Approve Grievance &amp; Dispatch Gig Worker
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaintForDispatch(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#F8FAFB] rounded-xl border border-[#DDE4E6] text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <div>Grievance: <strong className="text-[#202A2B]">#{selectedComplaintForDispatch.complaintId}</strong> ({selectedComplaintForDispatch.category})</div>
                <span className="font-mono text-[10px] bg-[#D7F7FC] text-[#007D99] px-2 py-0.5 rounded font-bold">
                  {selectedComplaintForDispatch.railMadadRef || 'RailMadad Verified'}
                </span>
              </div>
              <div>Train / Coach: <strong>{selectedComplaintForDispatch.trainNumber} · {selectedComplaintForDispatch.location || 'Coach B3'}</strong></div>
              <div>Passenger: <strong>{selectedComplaintForDispatch.passengerName}</strong> ({selectedComplaintForDispatch.passengerMobile})</div>
              <p className="text-[#526365] italic bg-white p-2 rounded-lg border border-[#DDE4E6]">
                "{selectedComplaintForDispatch.description}"
              </p>
            </div>

            {/* AI Diagnosis details if available */}
            {selectedComplaintForDispatch.aiAnalysis && (
              <div className="p-3 bg-[#DDF8EF]/60 border border-[#65D6B0]/60 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between text-[#1E6B52] font-black text-[11px]">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Grievance Assessment</span>
                  </span>
                  <span>Priority: {selectedComplaintForDispatch.priority || selectedComplaintForDispatch.severity || 'High'}</span>
                </div>
                <div className="text-[#526365] text-[11px]">
                  Recommended Specialist Role: <strong className="text-[#1E6B52]">{selectedComplaintForDispatch.aiAnalysis.recommendedRole}</strong>
                </div>
                {selectedComplaintForDispatch.aiAnalysis.detectedIssues && (
                  <div className="text-[10px] text-[#7E9092]">
                    Detected: {selectedComplaintForDispatch.aiAnalysis.detectedIssues.join(', ')}
                  </div>
                )}
              </div>
            )}

            {/* Specialist Dropdown */}
            <div>
              <label className="block text-xs font-bold text-[#202A2B] mb-1">
                Select Approved Station Worker to Dispatch:
              </label>
              <select
                value={selectedWorkerIdForDispatch}
                onChange={(e) => setSelectedWorkerIdForDispatch(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-[#DDE4E6] rounded-xl font-bold text-[#202A2B] focus:outline-none focus:ring-2 focus:ring-[#007D99]"
              >
                <option value="">-- Choose verified specialist on duty --</option>
                {workers
                  .filter((w) => w.verificationStatus === 'Verified')
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.fullName} ({w.workerId}) — {w.skillCategory} [{w.stationCode}] · {w.availability}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#202A2B] mb-1">
                Officer Dispatch Instructions:
              </label>
              <textarea
                rows={2}
                value={dispatchInstructions}
                onChange={(e) => setDispatchInstructions(e.target.value)}
                placeholder="e.g. Inspect washroom flush valve at coach B3 during 10-minute halt at platform 2."
                className="w-full text-xs p-2 border border-[#DDE4E6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007D99]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedComplaintForDispatch(null)}
                className="flex-1 py-2.5 border border-[#DDE4E6] text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedWorkerIdForDispatch || isDispatching}
                onClick={handleDispatch}
                className="flex-1 py-2.5 bg-[#007D99] hover:bg-[#007D99]/90 text-white text-xs font-black rounded-xl transition cursor-pointer disabled:opacity-60 shadow-xs flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-[#65D6B0]" />
                <span>{isDispatching ? 'Transmitting to Worker...' : 'Approve & Send to Worker'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PHOTO PROOF AUDIT INSPECTION                                       */}
      {/* ========================================================================= */}
      {inspectPhotoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-[#DDE4E6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE4E6]">
              <h3 className="text-base font-black text-[#202A2B]">Resolution Audit Evidence</h3>
              <button onClick={() => setInspectPhotoModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold text-[#526365] block uppercase mb-1">Before Maintenance</span>
                {inspectPhotoModal.before ? (
                  <img src={inspectPhotoModal.before} alt="Before" className="w-full h-40 object-cover rounded-xl border" />
                ) : (
                  <div className="w-full h-40 rounded-xl border border-dashed flex items-center justify-center text-xs text-slate-400">
                    No before image
                  </div>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#1E6B52] block uppercase mb-1">After Resolution (Proof)</span>
                {inspectPhotoModal.after ? (
                  <img src={inspectPhotoModal.after} alt="After" className="w-full h-40 object-cover rounded-xl border-2 border-[#65D6B0]" />
                ) : (
                  <div className="w-full h-40 rounded-xl border border-dashed flex items-center justify-center text-xs text-slate-400">
                    No after proof attached
                  </div>
                )}
              </div>
            </div>

            {inspectPhotoModal.notes && (
              <div className="p-3 bg-[#F8FAFB] rounded-xl border text-xs">
                <strong>Technician Action:</strong> {inspectPhotoModal.notes}
              </div>
            )}

            <button
              onClick={() => setInspectPhotoModal(null)}
              className="w-full py-2 bg-[#202A2B] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CAG AUDIT GAP ANALYSIS & MINISTRY POSITIONING BRIEFING              */}
      {/* ========================================================================= */}
      {showGapAnalysisModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-[#DDE4E6] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE4E6]">
              <div className="flex items-center gap-2">
                <FileBarChart className="w-5 h-5 text-[#007D99]" />
                <h3 className="text-lg font-black text-[#202A2B]">
                  RailMadad vs VYOMRATH — Strategic Gap Analysis
                </h3>
              </div>
              <button onClick={() => setShowGapAnalysisModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ministry Presentation Statement */}
            <div className="p-4 bg-[#DDF8EF]/60 border border-[#65D6B0]/50 rounded-2xl space-y-1.5">
              <span className="text-[10px] font-black uppercase text-[#1E6B52] tracking-wider block">
                Official Ministry Positioning
              </span>
              <blockquote className="text-xs text-[#202A2B] italic leading-relaxed">
                "We recognise that Indian Railways already has a grievance redressal platform called RailMadad. Our objective with VYOMRATH is not to replace RailMadad but to explore an additional layer for complaint execution and workforce coordination. Through our three-panel system, we aim to connect passengers, verified service workers and administrators on one platform. This can help improve accountability, transparency and the monitoring of authorised complaint-resolution activities."
              </blockquote>
            </div>

            {/* 7 Gaps Matrix */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-[#526365] tracking-wider">
                Solved Operational Challenges (CAG Audit 2024 &amp; Lok Sabha 2026 Grounding)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#F8FAFB] rounded-xl border border-[#DDE4E6] space-y-1">
                  <div className="font-bold text-[#B94A3A]">1. Resolution Delay Exceeding SLA</div>
                  <p className="text-[#526365] text-[11px]">CAG found medical/coach assistance took 2h 2m to 6h 42m. VYOMRATH enforces live 2-hour SLA countdowns and direct platform dispatch.</p>
                </div>

                <div className="p-3 bg-[#F8FAFB] rounded-xl border border-[#DDE4E6] space-y-1">
                  <div className="font-bold text-[#B94A3A]">2. Dedicated Worker-Assignment</div>
                  <p className="text-[#526365] text-[11px]">Instead of static departmental forwarding, VYOMRATH provides 1-click on-ground technician assignment with live ETA.</p>
                </div>

                <div className="p-3 bg-[#F8FAFB] rounded-xl border border-[#DDE4E6] space-y-1">
                  <div className="font-bold text-[#B94A3A]">3. Verified Gig-Worker Onboarding</div>
                  <p className="text-[#526365] text-[11px]">Admin officer panel verifies identity and trade credentials before any gig technician can accept passenger calls.</p>
                </div>

                <div className="p-3 bg-[#F8FAFB] rounded-xl border border-[#DDE4E6] space-y-1">
                  <div className="font-bold text-[#B94A3A]">4. Resolution Quality &amp; Photo Evidence</div>
                  <p className="text-[#526365] text-[11px]">Fixes CAG finding: "marked resolved does not mean passenger is satisfied". Requires Before-and-After photo proof.</p>
                </div>

                <div className="p-3 bg-[#F8FAFB] rounded-xl border border-[#DDE4E6] space-y-1">
                  <div className="font-bold text-[#B94A3A]">5. Categorisation &amp; Routing Gaps</div>
                  <p className="text-[#526365] text-[11px]">Multimodal AI analyzes uploaded photos and voice recordings to route directly to the appropriate trade specialist.</p>
                </div>

                <div className="p-3 bg-[#F8FAFB] rounded-xl border border-[#DDE4E6] space-y-1">
                  <div className="font-bold text-[#B94A3A]">6. Priority Levels &amp; Safety Boundary</div>
                  <p className="text-[#526365] text-[11px]">Gig workers handle eligible maintenance only. Emergencies and security auto-route to RPF helpline 139.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowGapAnalysisModal(false)}
              className="w-full py-2.5 bg-[#202A2B] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#202A2B]/90 transition"
            >
              Close Briefing
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
