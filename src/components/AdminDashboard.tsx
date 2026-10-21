import React, { useState, useMemo } from 'react';
import { Complaint, ComplaintCategory, ComplaintStatus, User, ViewMode, Worker, WorkerServiceRequest } from '../types';
import { ALLOWED_CATEGORIES } from '../data/mockData';
import { FIFOQueue } from '../algorithms/queue';
import { executeMergeSort } from '../algorithms/sorting';
import { executeLinearSearch } from '../algorithms/search';
import { countByCategory, countByStatus } from '../algorithms/categoryCounter';
import { 
  Shield, 
  Search, 
  ArrowUpDown, 
  PlayCircle, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Eye,
  Check,
  RotateCcw,
  TrainTrack,
  Briefcase,
  UserCheck,
  UserX,
  UserMinus,
  Sparkles,
  FileText,
  Phone,
  Mail,
  MapPin,
  Users,
  Camera,
  X,
  Smartphone,
  ExternalLink
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  complaints: Complaint[];
  queue: FIFOQueue;
  users?: User[];
  workers?: Worker[];
  workerRequests?: WorkerServiceRequest[];
  onUpdateWorkerVerification?: (workerId: string, status: 'Pending Verification' | 'Verified' | 'Rejected' | 'Suspended') => void;
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
  onUpdateWorkerVerification,
  onProcessNextFIFO,
  onUpdateStatus,
  onSelectComplaint,
  onNavigate,
  onOpenOverview,
}) => {
  const [adminTab, setAdminTab] = useState<'complaints' | 'gig-workers' | 'passengers'>('complaints');
  const [workerSearch, setWorkerSearch] = useState('');
  const [workerStatusFilter, setWorkerStatusFilter] = useState<'All' | 'Pending Verification' | 'Verified' | 'Rejected' | 'Suspended'>('All');
  const [passengerSearch, setPassengerSearch] = useState('');
  const [inspectingWorkerPhoto, setInspectingWorkerPhoto] = useState<Worker | null>(null);
  const [verifyingWorkerId, setVerifyingWorkerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [statusTab, setStatusTab] = useState<'All' | 'Pending' | 'In Progress' | 'Resolved'>('All');
  const [sortKey, setSortKey] = useState<keyof Complaint>('createdAt');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // 1. Calculate overall summary
  const summary = useMemo(() => countByStatus(complaints), [complaints]);

  // 2. Calculate category counts
  const categoryCounts = useMemo(() => countByCategory(complaints), [complaints]);

  // 3. Search
  const searchResult = useMemo(() => {
    return executeLinearSearch(complaints, searchQuery);
  }, [complaints, searchQuery]);

  // 4. Category & Status Filters
  const filteredComplaints = useMemo(() => {
    let result = searchResult.matches;

    if (selectedCategory) {
      result = result.filter((c) => c.category === selectedCategory);
    }
    if (statusTab !== 'All') {
      result = result.filter((c) => c.status === statusTab);
    }

    return result;
  }, [searchResult.matches, selectedCategory, statusTab]);

  // 5. Sort
  const sortResult = useMemo(() => {
    return executeMergeSort(filteredComplaints, sortKey, sortOrder === 'desc');
  }, [filteredComplaints, sortKey, sortOrder]);

  const nextInQueue = queue.peek();

  const handleProcessFIFO = () => {
    const res = onProcessNextFIFO();
    setActionNotice(res.message);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleInlineStatusChange = (complaintId: string, newStatus: ComplaintStatus) => {
    onUpdateStatus(complaintId, newStatus);
    setActionNotice(`Updated #${complaintId} to "${newStatus}".`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Gig Worker Management Metrics & Filters
  const pendingWorkersCount = useMemo(
    () => (workers || []).filter((w) => w.verificationStatus === 'Pending Verification').length,
    [workers]
  );
  const verifiedWorkersCount = useMemo(
    () => (workers || []).filter((w) => w.verificationStatus === 'Verified').length,
    [workers]
  );
  const activeJobsCount = useMemo(
    () =>
      (workerRequests || []).filter((r) =>
        ['Worker Assigned', 'On the Way', 'Arrived at Station', 'Service In Progress'].includes(r.status)
      ).length,
    [workerRequests]
  );

  const displayedWorkers = useMemo(() => {
    return (workers || []).filter((w) => {
      const matchesStatus = workerStatusFilter === 'All' || w.verificationStatus === workerStatusFilter;
      const q = workerSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        w.fullName.toLowerCase().includes(q) ||
        w.workerId.toLowerCase().includes(q) ||
        w.stationCode.toLowerCase().includes(q) ||
        w.stationName.toLowerCase().includes(q) ||
        w.skillCategory.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [workers, workerStatusFilter, workerSearch]);

  const displayedPassengers = useMemo(() => {
    const q = passengerSearch.toLowerCase().trim();
    return (users || []).filter((u) => {
      if (u.isAdmin) return false;
      if (!q) return true;
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.mobile && u.mobile.includes(q)) ||
        String(u.id).includes(q)
      );
    });
  }, [users, passengerSearch]);

  const handleWorkerVerificationAction = async (
    workerId: string, 
    status: 'Pending Verification' | 'Verified' | 'Rejected' | 'Suspended'
  ) => {
    if (onUpdateWorkerVerification) {
      setVerifyingWorkerId(workerId);
      try {
        await onUpdateWorkerVerification(workerId, status);
        setActionNotice(`Worker #${workerId} status updated to "${status}". Changes synced across devices.`);
        setTimeout(() => setActionNotice(null), 4000);
      } finally {
        setVerifyingWorkerId(null);
      }
    }
  };

  return (
    <div className="space-y-8 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#D8EAE4] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-[#115E59] text-[#0F766E] text-[10px] font-extrabold rounded-md tracking-wider uppercase border border-[#0F766E]/30">
              OFFICIAL CONTROL CENTER
            </span>
            <span className="text-xs text-[#647773] font-medium">RAIL CARE Grievance & Workforce Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#115E59] tracking-tight">
            Administrator Dashboard
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#647773]">
            <span>
              Officer: <strong className="text-[#115E59]">{currentUser.fullName}</strong>
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#16845B] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16845B] animate-pulse"></span>
              Live Multi-Device Sync Active
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">

          {/* 1-Click FIFO Dispatch Button */}
          <button
            onClick={handleProcessFIFO}
            disabled={queue.size() === 0}
            className={`px-5 py-3 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 border ${
              queue.size() > 0
                ? 'bg-[#115E59] hover:bg-[#0F766E] border-[#115E59] hover:border-[#0F766E] cursor-pointer'
                : 'bg-slate-200 border-slate-300 cursor-not-allowed text-slate-500'
            }`}
            title="Dispatch the earliest pending complaint"
          >
            <PlayCircle className="w-4 h-4 text-[#0F766E]" />
            <span>
              {nextInQueue
                ? `Process Next: ${nextInQueue.complaintId} (${(nextInQueue.passengerName || 'Passenger').split(' ')[0]})`
                : 'Queue Empty (All Processed)'}
            </span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between shadow-2xs">
          <span className="flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            {actionNotice}
          </span>
        </div>
      )}

      {/* Module Switcher Tabs */}
      <div className="flex border-b border-[#D8EAE4] gap-2">
        <button
          onClick={() => setAdminTab('complaints')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
            adminTab === 'complaints'
              ? 'border-[#115E59] text-[#115E59]'
              : 'border-transparent text-[#647773] hover:text-[#115E59]'
          }`}
        >
          <Shield className="w-4 h-4 text-[#0F766E]" />
          <span>Grievance Redressal & Queue ({complaints.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('gig-workers')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
            adminTab === 'gig-workers'
              ? 'border-[#115E59] text-[#115E59]'
              : 'border-transparent text-[#647773] hover:text-[#115E59]'
          }`}
        >
          <Briefcase className="w-4 h-4 text-[#0F766E]" />
          <span>Gig Worker Management ({workers.length})</span>
          {pendingWorkersCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold animate-pulse">
              {pendingWorkersCount} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('passengers')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
            adminTab === 'passengers'
              ? 'border-[#115E59] text-[#115E59]'
              : 'border-transparent text-[#647773] hover:text-[#115E59]'
          }`}
        >
          <Users className="w-4 h-4 text-[#0F766E]" />
          <span>Registered Passengers ({users.filter((u) => !u.isAdmin).length})</span>
        </button>
      </div>

      {adminTab === 'complaints' ? (
        <>
          {/* Summary Metrics Cards (1-Click Filtering) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <button
          onClick={() => setStatusTab('All')}
          className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
            statusTab === 'All'
              ? 'bg-[#E5F5EF] border-[#0F766E] shadow-xs'
              : 'bg-white border-[#D8EAE4] hover:border-[#0F766E] shadow-xs'
          }`}
        >
          <div className="text-xs font-bold text-[#647773] uppercase tracking-wider">
            Total Complaints
          </div>
          <div className="text-3xl font-extrabold text-[#115E59] mt-2 font-mono tabular-nums">
            {summary.total}
          </div>
          <div className="text-[11px] text-[#647773] mt-1">Click to view all</div>
        </button>

        <button
          onClick={() => setStatusTab('Pending')}
          className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
            statusTab === 'Pending'
              ? 'bg-[#E5F5EF] border-[#C58B20] shadow-xs'
              : 'bg-white border-[#D8EAE4] hover:border-[#C58B20] shadow-xs'
          }`}
        >
          <div className="text-xs font-bold text-[#C58B20] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C58B20]"></span>
            Pending Queue
          </div>
          <div className="text-3xl font-extrabold text-[#C58B20] mt-2 font-mono tabular-nums">
            {summary.pending}
          </div>
          <div className="text-[11px] text-[#C58B20] mt-1">Click to filter pending</div>
        </button>

        <button
          onClick={() => setStatusTab('In Progress')}
          className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
            statusTab === 'In Progress'
              ? 'bg-[#CCFBF1] border-[#0F766E] shadow-xs'
              : 'bg-white border-[#D8EAE4] hover:border-[#0F766E] shadow-xs'
          }`}
        >
          <div className="text-xs font-bold text-[#115E59] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0F766E]"></span>
            In Progress
          </div>
          <div className="text-3xl font-extrabold text-[#0F766E] mt-2 font-mono tabular-nums">
            {summary.inProgress}
          </div>
          <div className="text-[11px] text-[#115E59] mt-1">Click to filter in-progress</div>
        </button>

        <button
          onClick={() => setStatusTab('Resolved')}
          className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
            statusTab === 'Resolved'
              ? 'bg-[#E5F5EF] border-[#16845B] shadow-xs'
              : 'bg-white border-[#D8EAE4] hover:border-[#16845B] shadow-xs'
          }`}
        >
          <div className="text-xs font-bold text-[#16845B] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#16845B]"></span>
            Resolved
          </div>
          <div className="text-3xl font-extrabold text-[#16845B] mt-2 font-mono tabular-nums">
            {summary.resolved}
          </div>
          <div className="text-[11px] text-[#16845B] mt-1">Click to filter resolved</div>
        </button>

      </div>

      {/* Main Grid: Complaints Management Table + Category Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Table & Filter Controls (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Filter Bar with Status Tabs & Search */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#D8EAE4] shadow-xs space-y-3">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              
              {/* Quick Status Tabs */}
              <div className="flex items-center gap-1 p-1 bg-[#E5F5EF] rounded-xl border border-[#D8EAE4] text-xs font-semibold">
                {(['All', 'Pending', 'In Progress', 'Resolved'] as const).map((tab) => {
                  const count =
                    tab === 'All'
                      ? summary.total
                      : tab === 'Pending'
                      ? summary.pending
                      : tab === 'In Progress'
                      ? summary.inProgress
                      : summary.resolved;

                  return (
                    <button
                      key={tab}
                      onClick={() => setStatusTab(tab)}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        statusTab === tab
                          ? 'bg-[#115E59] text-white shadow-2xs'
                          : 'text-[#183B3A] hover:text-[#115E59]'
                      }`}
                    >
                      {tab} <span className="opacity-75 ml-0.5">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Sort Order Toggle */}
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="px-3 py-1.5 bg-[#F4FBF8] hover:bg-[#E5F5EF] text-[#115E59] border border-[#D8EAE4] text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Date: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
              </button>

            </div>

            {/* Search Input & Category Dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Quick search: ID, passenger, train, PNR..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#F4FBF8] border border-[#D8EAE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#115E59]"
                />
                <Search className="w-3.5 h-3.5 text-[#647773] absolute left-3 top-3" />
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F4FBF8] border border-[#D8EAE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#115E59]"
                >
                  <option value="">All Categories</option>
                  {ALLOWED_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat} ({categoryCounts[cat] || 0})
                    </option>
                  ))}
                </select>

                {(searchQuery || selectedCategory || statusTab !== 'All') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('');
                      setStatusTab('All');
                    }}
                    className="px-3 py-2 text-xs font-semibold text-[#647773] hover:text-red-700 bg-[#F4FBF8] hover:bg-red-50 border border-[#D8EAE4] rounded-xl shrink-0 flex items-center gap-1 cursor-pointer"
                    title="Reset filters"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Table with Inline Status Changer */}
          <div className="bg-white rounded-2xl border border-[#D8EAE4] shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#D8EAE4] flex justify-between items-center bg-[#F4FBF8]">
              <h2 className="text-xs font-extrabold text-[#115E59] uppercase tracking-wider">
                Grievance Records ({sortResult.sortedList.length})
              </h2>
              <span className="text-[11px] text-[#647773]">
                Status changes update the central server immediately
              </span>
            </div>

            {sortResult.sortedList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F4FBF8] text-[#647773] font-bold border-b border-[#D8EAE4]">
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Passenger</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Subject / Issue</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D8EAE4]">
                    {sortResult.sortedList.map((c) => (
                      <tr key={c.complaintId} className="hover:bg-[#F4FBF8] transition">
                        <td className="py-3 px-4 font-mono font-bold text-[#115E59]">
                          {c.complaintId}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#183B3A]">{c.passengerName}</div>
                          <div className="text-[10px] text-[#647773]">{c.trainNumber}</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-[#183B3A] whitespace-nowrap">
                          {c.category}
                        </td>
                        <td className="py-3 px-4 max-w-[220px]">
                          <div className="truncate font-medium text-[#183B3A]" title={c.subject}>
                            {c.subject}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#647773] whitespace-nowrap">
                          {(c.createdAt || '').slice(0, 10) || 'Recent'}
                        </td>
                        
                        {/* 1-Click Inline Status Dropdown */}
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <select
                            value={c.status}
                            onChange={(e) =>
                              handleInlineStatusChange(
                                c.complaintId,
                                e.target.value as ComplaintStatus
                              )
                            }
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg border cursor-pointer transition ${
                              c.status === 'Pending'
                                ? 'bg-[#E5F5EF] text-[#C58B20] border-[#0F766E]/40'
                                : c.status === 'In Progress'
                                ? 'bg-[#CCFBF1] text-[#115E59] border-[#0F766E]/30'
                                : 'bg-[#E5F5EF] text-[#16845B] border-[#16845B]/30'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => {
                              onSelectComplaint(c);
                              onNavigate('complaint-details');
                            }}
                            className="p-1.5 bg-[#F4FBF8] hover:bg-[#E5F5EF] text-[#115E59] border border-[#D8EAE4] rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                            title="View Full Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#0F766E]" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center text-xs text-[#647773]">
                No complaint records found matching your current filter.
              </div>
            )}
          </div>

        </div>

        {/* Complaints by Category (1 col) */}
        <div className="bg-white rounded-2xl border border-[#D8EAE4] shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#D8EAE4]">
            <h3 className="text-xs font-extrabold text-[#115E59] uppercase tracking-wider">
              By Category
            </h3>
            <BarChart3 className="w-4 h-4 text-[#0F766E]" />
          </div>

          <div className="space-y-3 text-xs">
            {ALLOWED_CATEGORIES.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const maxCount = Math.max(...Object.values(categoryCounts), 1);
              const percentage = Math.round((count / maxCount) * 100);

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                  className={`w-full text-left space-y-1 p-1.5 rounded-xl hover:bg-[#E5F5EF] transition cursor-pointer ${
                    selectedCategory === cat ? 'bg-[#E5F5EF] font-bold border border-[#0F766E]/40' : ''
                  }`}
                >
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#183B3A] truncate max-w-[140px] font-medium">{cat}</span>
                    <span className="font-bold text-[#115E59] font-mono tabular-nums">{count}</span>
                  </div>
                  <div className="w-full bg-[#E5F5EF] h-1.5 rounded-full overflow-hidden border border-[#D8EAE4]/60">
                    <div
                      className="bg-[#115E59] h-full rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  ) : (
        /* Gig Worker Management Module */
        <div className="space-y-8">
          
          {/* Worker KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-2xl border border-[#D8EAE4] p-5 shadow-xs">
              <div className="text-xs font-bold text-[#647773] uppercase tracking-wider">
                Total Workers
              </div>
              <div className="text-2xl font-extrabold text-[#115E59] mt-1 font-mono">
                {workers.length}
              </div>
              <p className="text-[11px] text-[#647773] mt-1">Across all junctions</p>
            </div>

            <div className={`rounded-2xl border p-5 shadow-xs ${
              pendingWorkersCount > 0
                ? 'bg-amber-50 border-amber-300'
                : 'bg-white border-[#D8EAE4]'
            }`}>
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center justify-between">
                <span>Pending Review</span>
                {pendingWorkersCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </div>
              <div className="text-2xl font-extrabold text-amber-900 mt-1 font-mono">
                {pendingWorkersCount}
              </div>
              <p className="text-[11px] text-amber-700 mt-1 font-semibold">Requires verification</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#D8EAE4] p-5 shadow-xs">
              <div className="text-xs font-bold text-[#647773] uppercase tracking-wider">
                Verified Active
              </div>
              <div className="text-2xl font-extrabold text-[#16845B] mt-1 font-mono">
                {verifiedWorkersCount}
              </div>
              <p className="text-[11px] text-[#16845B] mt-1 font-semibold">Ready for dispatch</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#D8EAE4] p-5 shadow-xs">
              <div className="text-xs font-bold text-[#647773] uppercase tracking-wider">
                Active Jobs
              </div>
              <div className="text-2xl font-extrabold text-[#115E59] mt-1 font-mono">
                {activeJobsCount}
              </div>
              <p className="text-[11px] text-[#647773] mt-1">Currently on trains</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#D8EAE4] p-5 shadow-xs col-span-2 lg:col-span-1">
              <div className="text-xs font-bold text-[#647773] uppercase tracking-wider">
                Total Requests
              </div>
              <div className="text-2xl font-extrabold text-[#115E59] mt-1 font-mono">
                {workerRequests.length}
              </div>
              <p className="text-[11px] text-[#647773] mt-1">Passenger calls</p>
            </div>
          </div>

          {/* Workers Directory & Administrative Verification Table */}
          <div className="bg-white rounded-3xl border border-[#D8EAE4] shadow-xs p-6 sm:p-8 space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#D8EAE4]">
              <div>
                <h2 className="text-xl font-extrabold text-[#115E59]">
                  Registered Railway Workers Directory
                </h2>
                <p className="text-xs text-[#647773] mt-0.5">
                  Verify, approve, or suspend station gig worker profiles. Only verified workers receive passenger service requests.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-[#647773] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={workerSearch}
                    onChange={(e) => setWorkerSearch(e.target.value)}
                    placeholder="Search name, ID, station, skill..."
                    className="pl-9 pr-3 py-2 text-xs bg-[#F4FBF8] border border-[#D8EAE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#115E59] w-full sm:w-60"
                  />
                </div>

                {/* Filter */}
                <div className="flex flex-wrap gap-1 bg-[#F4FBF8] p-1 rounded-xl border border-[#D8EAE4]">
                  {(['All', 'Pending Verification', 'Verified', 'Suspended'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setWorkerStatusFilter(st)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                        workerStatusFilter === st
                          ? 'bg-[#115E59] text-white shadow-2xs'
                          : 'text-[#647773] hover:text-[#115E59]'
                      }`}
                    >
                      {st === 'Pending Verification' ? 'Pending' : st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Workers Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#D8EAE4] text-[#647773] font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Worker ID</th>
                    <th className="py-3 px-3">Verification Photo</th>
                    <th className="py-3 px-3">Worker Name</th>
                    <th className="py-3 px-3">Skill Category</th>
                    <th className="py-3 px-3">Assigned Station</th>
                    <th className="py-3 px-3">Contact</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Availability</th>
                    <th className="py-3 px-3 text-right">Administrative Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8EAE4]">
                  {displayedWorkers.map((w) => (
                    <tr key={w.id} className="hover:bg-[#F4FBF8] transition">
                      <td className="py-3.5 px-3 font-mono font-bold text-[#115E59]">
                        {w.workerId}
                      </td>

                      {/* Photo Column */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setInspectingWorkerPhoto(w)}
                            className="relative w-11 h-11 rounded-xl overflow-hidden border border-[#D8EAE4] hover:border-[#115E59] shadow-2xs group cursor-pointer shrink-0 bg-slate-100"
                            title="Click to inspect verification photo"
                          >
                            {w.verificationPhoto || w.profileImage ? (
                              <img
                                src={w.verificationPhoto || w.profileImage}
                                alt={w.fullName}
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-200"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#E5F5EF] flex items-center justify-center text-[#115E59]">
                                <Camera className="w-4 h-4 text-[#647773]" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                              <Eye className="w-3.5 h-3.5 text-white" />
                            </div>
                          </button>
                          {w.photoUpdatedAt && (
                            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-emerald-50 text-[9px] font-bold text-emerald-800 border border-emerald-200">
                              Live
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-bold text-[#183B3A]">{w.fullName}</div>
                        <div className="text-[10px] text-[#647773]">{w.city} · {w.experienceYears || 1}y exp</div>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-[#115E59]">
                        {w.skillCategory}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-[#183B3A]">{w.stationCode}</span>
                        <div className="text-[10px] text-[#647773] truncate max-w-[130px]">{w.stationName}</div>
                      </td>
                      <td className="py-3.5 px-3 text-[#647773]">
                        <div>{w.mobile}</div>
                        <div className="text-[10px] truncate max-w-[120px]">{w.email}</div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded-full ${
                          w.verificationStatus === 'Verified'
                            ? 'bg-[#E5F5EF] text-[#16845B] border border-[#16845B]/30'
                            : w.verificationStatus === 'Pending Verification'
                            ? 'bg-amber-50 text-amber-800 border border-amber-300'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {w.verificationStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-extrabold rounded-md ${
                          w.availability === 'Available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : w.availability === 'Busy'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {w.availability}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {w.verificationStatus !== 'Verified' && (
                            <button
                              disabled={verifyingWorkerId === w.workerId}
                              onClick={() => handleWorkerVerificationAction(w.workerId, 'Verified')}
                              className={`px-3 py-1.5 bg-[#16845B] hover:bg-emerald-700 text-white font-bold rounded-lg transition text-xs cursor-pointer shadow-xs flex items-center gap-1.5 ${
                                verifyingWorkerId === w.workerId ? 'opacity-70 cursor-not-allowed' : ''
                              }`}
                              title="Approve and verify worker"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>{verifyingWorkerId === w.workerId ? 'Verifying...' : 'Verify'}</span>
                            </button>
                          )}

                          {w.verificationStatus === 'Pending Verification' && (
                            <button
                              onClick={() => handleWorkerVerificationAction(w.workerId, 'Rejected')}
                              className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-lg transition text-[11px] cursor-pointer"
                              title="Reject registration"
                            >
                              <UserX className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          )}

                          {w.verificationStatus === 'Verified' && (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#16845B] bg-[#E5F5EF] border border-[#16845B]/30 rounded-lg">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#16845B]" />
                                <span>Verified</span>
                              </span>
                              <button
                                onClick={() => handleWorkerVerificationAction(w.workerId, 'Suspended')}
                                className="px-2 py-1 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 font-bold rounded-lg transition text-[11px] cursor-pointer"
                                title="Suspend worker access"
                              >
                                <UserMinus className="w-3 h-3" />
                                <span>Suspend</span>
                              </button>
                            </div>
                          )}

                          {w.verificationStatus === 'Suspended' && (
                            <button
                              onClick={() => handleWorkerVerificationAction(w.workerId, 'Verified')}
                              className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold rounded-lg transition text-[11px] cursor-pointer"
                              title="Reactivate worker"
                            >
                              <span>Reactivate</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {displayedWorkers.length === 0 && (
                <div className="py-12 text-center text-xs text-[#647773]">
                  No railway workers found matching the current filter.
                </div>
              )}
            </div>

          </div>

          {/* Station Service Requests Oversight Table */}
          <div className="bg-white rounded-3xl border border-[#D8EAE4] shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#D8EAE4]">
              <div>
                <h3 className="text-base font-extrabold text-[#115E59]">
                  All Station Gig Service Requests
                </h3>
                <p className="text-xs text-[#647773]">
                  Live monitoring of passenger assistance calls and worker fulfillment across stations.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#115E59] bg-[#E5F5EF] px-2.5 py-1 rounded-lg border border-[#0F766E]/40">
                Total: {workerRequests.length}
              </span>
            </div>

            {workerRequests.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#647773]">
                No passenger service requests recorded yet. Incoming requests from passengers will appear here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#D8EAE4] text-[#647773] font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">Req ID</th>
                      <th className="py-3 px-3">Passenger</th>
                      <th className="py-3 px-3">Train & Coach</th>
                      <th className="py-3 px-3">Station</th>
                      <th className="py-3 px-3">Service</th>
                      <th className="py-3 px-3">Assigned Worker</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D8EAE4]">
                    {workerRequests.map((r) => (
                      <tr key={r.id} className="hover:bg-[#F4FBF8] transition">
                        <td className="py-3 px-3 font-mono font-bold text-[#115E59]">
                          {r.requestId}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#183B3A]">{r.passengerName}</div>
                          <div className="text-[10px] text-[#647773]">{r.passengerMobile}</div>
                        </td>
                        <td className="py-3 px-3 text-[#183B3A]">
                          <div className="font-bold">Train {r.trainNumber}</div>
                          <div className="text-[10px] text-[#647773]">
                            Coach: {r.coachNumber || 'N/A'} · Seat: {r.seatNumber || 'N/A'}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-[#115E59]">{r.stationCode}</span>
                          <div className="text-[10px] text-[#647773]">{r.stationName}</div>
                        </td>
                        <td className="py-3 px-3 font-medium text-[#183B3A]">
                          {r.serviceCategory}
                        </td>
                        <td className="py-3 px-3">
                          {r.assignedWorkerName ? (
                            <span className="font-bold text-[#16845B] flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5" />
                              {r.assignedWorkerName}
                            </span>
                          ) : (
                            <span className="text-[#647773] italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                            r.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#647773] text-[11px]">
                          {r.createdAt.slice(11, 16)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* MODULE 3: REGISTERED PASSENGERS DIRECTORY */}
      {adminTab === 'passengers' && (
        <div className="space-y-6">
          {/* Top KPI Cards for Passengers */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-2xl border border-[#D8EAE4] p-5 shadow-xs">
              <div className="text-xs font-bold text-[#647773] uppercase tracking-wider">
                Total Passengers
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#115E59] mt-1 font-mono">
                {users.filter((u) => !u.isAdmin).length}
              </div>
              <p className="text-[11px] text-[#647773] mt-1">Multi-device registered accounts</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#D8EAE4] p-5 shadow-xs">
              <div className="text-xs font-bold text-[#647773] uppercase tracking-wider">
                Passenger Grievances
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#115E59] mt-1 font-mono">
                {complaints.length}
              </div>
              <p className="text-[11px] text-[#16845B] mt-1 font-semibold">Tracked in FIFO queue</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#D8EAE4] p-5 shadow-xs">
              <div className="text-xs font-bold text-[#647773] uppercase tracking-wider">
                Worker Assistance Calls
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#115E59] mt-1 font-mono">
                {workerRequests.length}
              </div>
              <p className="text-[11px] text-[#647773] mt-1">Gig worker service requests</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#D8EAE4] p-5 shadow-xs">
              <div className="text-xs font-bold text-[#647773] uppercase tracking-wider">
                Cross-Device Sync
              </div>
              <div className="text-lg font-extrabold text-[#16845B] mt-1 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16845B] animate-pulse"></span>
                <span>Active 3s Sync</span>
              </div>
              <p className="text-[11px] text-[#647773] mt-1">Phones & Laptops interconnected</p>
            </div>
          </div>

          {/* Passengers Table */}
          <div className="bg-white rounded-3xl border border-[#D8EAE4] shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D8EAE4]">
              <div>
                <h2 className="text-xl font-extrabold text-[#115E59]">
                  Registered Railway Passengers Directory
                </h2>
                <p className="text-xs text-[#647773] mt-0.5">
                  Real-time list of passengers logged in across mobile devices and platforms.
                </p>
              </div>

              {/* Passenger Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#647773] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={passengerSearch}
                  onChange={(e) => setPassengerSearch(e.target.value)}
                  placeholder="Search passenger name, email, mobile..."
                  className="pl-9 pr-3 py-2 text-xs bg-[#F4FBF8] border border-[#D8EAE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#115E59] w-full sm:w-72"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#D8EAE4] text-[#647773] font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">User ID</th>
                    <th className="py-3 px-3">Passenger Name</th>
                    <th className="py-3 px-3">Email Address</th>
                    <th className="py-3 px-3">Mobile Contact</th>
                    <th className="py-3 px-3 text-center">Grievances Filed</th>
                    <th className="py-3 px-3 text-center">Worker Bookings</th>
                    <th className="py-3 px-3 text-center">System Interconnection</th>
                    <th className="py-3 px-3 text-right">View Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8EAE4]">
                  {displayedPassengers.map((passenger) => {
                    const passengerComplaintsCount = complaints.filter(
                      (c) =>
                        (passenger.id && c.userId === passenger.id) ||
                        (passenger.email && c.passengerEmail && c.passengerEmail.toLowerCase().trim() === passenger.email.toLowerCase().trim())
                    ).length;

                    const passengerRequestsCount = workerRequests.filter(
                      (r) =>
                        (passenger.id && r.passengerId === passenger.id) ||
                        (passenger.email && r.passengerEmail && r.passengerEmail.toLowerCase().trim() === passenger.email.toLowerCase().trim())
                    ).length;

                    return (
                      <tr key={passenger.id} className="hover:bg-[#F4FBF8] transition">
                        <td className="py-3.5 px-3 font-mono font-bold text-[#115E59]">
                          #{passenger.id}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#115E59] text-[#0F766E] flex items-center justify-center font-bold text-xs shrink-0">
                              {passenger.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-[#183B3A]">{passenger.fullName}</div>
                              <div className="text-[10px] text-[#647773]">Registered Passenger</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-medium text-[#183B3A]">
                          {passenger.email}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-[#647773]">
                          {passenger.mobile || '9876543210'}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            passengerComplaintsCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {passengerComplaintsCount}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            passengerRequestsCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {passengerRequestsCount}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                            <Smartphone className="w-3 h-3 text-[#16845B]" />
                            <span>Mobile Connected</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => {
                              setSearchQuery(passenger.fullName);
                              setAdminTab('complaints');
                            }}
                            className="px-2.5 py-1 text-xs font-bold text-[#115E59] hover:bg-[#E5F5EF] rounded-lg transition border border-[#D8EAE4] cursor-pointer"
                            title="Filter complaints for this passenger"
                          >
                            Filter Complaints
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {displayedPassengers.length === 0 && (
                <div className="py-12 text-center text-xs text-[#647773]">
                  No registered passengers found matching "{passengerSearch}".
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* INSPECT WORKER PHOTO MODAL */}
      {inspectingWorkerPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#D8EAE4] max-w-lg w-full p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setInspectingWorkerPhoto(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#0F766E] text-[#115E59] text-[10px] font-extrabold uppercase rounded">
                IDENTITY AUDIT
              </span>
              <span className="text-xs font-mono text-[#647773]">
                Worker ID: {inspectingWorkerPhoto.workerId}
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-[#115E59]">
              {inspectingWorkerPhoto.fullName}
            </h3>

            {/* Large Verification Image */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#115E59] bg-slate-100 max-h-72 flex items-center justify-center">
              {inspectingWorkerPhoto.verificationPhoto || inspectingWorkerPhoto.profileImage ? (
                <img
                  src={inspectingWorkerPhoto.verificationPhoto || inspectingWorkerPhoto.profileImage}
                  alt={inspectingWorkerPhoto.fullName}
                  className="w-full h-72 object-cover object-top"
                />
              ) : (
                <div className="py-16 text-center text-[#647773]">
                  <Camera className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                  <p className="text-xs">No verification photo uploaded yet</p>
                </div>
              )}
            </div>

            {/* Worker Details Summary */}
            <div className="bg-[#F4FBF8] p-3.5 rounded-xl border border-[#D8EAE4] space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#647773]">Station:</span>
                <span className="font-bold text-[#115E59]">
                  {inspectingWorkerPhoto.stationName} ({inspectingWorkerPhoto.stationCode})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#647773]">Skill Category:</span>
                <span className="font-bold text-[#115E59]">
                  {inspectingWorkerPhoto.skillCategory}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#647773]">Verification Status:</span>
                <span className={`font-bold ${
                  inspectingWorkerPhoto.verificationStatus === 'Verified' ? 'text-[#16845B]' : 'text-amber-700'
                }`}>
                  {inspectingWorkerPhoto.verificationStatus}
                </span>
              </div>
              {inspectingWorkerPhoto.photoUpdatedAt && (
                <div className="flex justify-between">
                  <span className="text-[#647773]">Photo Updated:</span>
                  <span className="font-mono text-[11px] text-[#183B3A]">
                    {inspectingWorkerPhoto.photoUpdatedAt}
                  </span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setInspectingWorkerPhoto(null)}
                className="px-4 py-2 text-xs font-bold text-[#647773] hover:text-[#115E59] rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>

              {inspectingWorkerPhoto.verificationStatus !== 'Verified' && (
                <button
                  type="button"
                  disabled={verifyingWorkerId === inspectingWorkerPhoto.workerId}
                  onClick={async () => {
                    await handleWorkerVerificationAction(inspectingWorkerPhoto.workerId, 'Verified');
                    setInspectingWorkerPhoto(null);
                  }}
                  className="px-5 py-2.5 bg-[#16845B] hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Approve & Verify Worker</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
