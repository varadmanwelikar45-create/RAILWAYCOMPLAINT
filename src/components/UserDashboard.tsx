import React, { useState } from 'react';
import { Complaint, User, ViewMode, WorkerServiceRequest } from '../types';
import { 
  PlusCircle, 
  FileText, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  AlertCircle, 
  Train, 
  Search, 
  Filter,
  Briefcase,
  Sparkles,
  MapPin,
  Phone,
  UserCheck,
  XCircle,
  ArrowRight
} from 'lucide-react';

interface UserDashboardProps {
  currentUser: User;
  complaints: Complaint[];
  workerRequests?: WorkerServiceRequest[];
  onCancelWorkerRequest?: (requestId: string) => void;
  onNavigate: (view: ViewMode) => void;
  onSelectComplaint: (complaint: Complaint) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  complaints,
  workerRequests = [],
  onCancelWorkerRequest,
  onNavigate,
  onSelectComplaint,
}) => {
  const [mainTab, setMainTab] = useState<'complaints' | 'worker-requests'>('complaints');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'In Progress' | 'Resolved'>('All');
  const [search, setSearch] = useState('');

  // Filter complaints strictly belonging to the logged-in user (matched by ID or registered email for multi-device sync)
  const userComplaints = (complaints || []).filter((c) => {
    if (!c) return false;
    const matchesId = currentUser?.id && c.userId === currentUser.id;
    const matchesEmail =
      currentUser?.email &&
      c.passengerEmail &&
      c.passengerEmail.toLowerCase().trim() === currentUser.email.toLowerCase().trim();
    return matchesId || matchesEmail;
  });

  // Filter worker requests strictly belonging to this passenger
  const userWorkerRequests = (workerRequests || []).filter((r) => {
    if (!r) return false;
    const matchesId = currentUser?.id && r.passengerId === currentUser.id;
    const matchesEmail =
      currentUser?.email &&
      r.passengerEmail &&
      r.passengerEmail.toLowerCase().trim() === currentUser.email.toLowerCase().trim();
    return matchesId || matchesEmail;
  });

  // Compute metrics
  const total = userComplaints.length;
  const pending = userComplaints.filter((c) => c?.status === 'Pending').length;
  const inProgress = userComplaints.filter((c) => c?.status === 'In Progress').length;
  const resolved = userComplaints.filter((c) => c?.status === 'Resolved').length;

  // Filter by selected tab and search safely
  const displayedComplaints = userComplaints.filter((c) => {
    if (!c) return false;
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    const searchLower = (search || '').trim().toLowerCase();
    const matchesSearch =
      !searchLower ||
      String(c.complaintId || '').toLowerCase().includes(searchLower) ||
      String(c.subject || '').toLowerCase().includes(searchLower) ||
      String(c.trainNumber || '').toLowerCase().includes(searchLower) ||
      String(c.pnrNumber || '').toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D3] shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF5DC] text-[#142B4A] text-[11px] font-extrabold uppercase tracking-wider mb-2 border border-[#E9B949]/30">
            PASSENGER CONTROL DESK
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] tracking-tight">
            Welcome, {currentUser.fullName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#6B7280]">
            <span>Email: <strong className="text-[#253247]">{currentUser.email}</strong></span>
            <span>·</span>
            <span>Mobile: <strong className="text-[#253247]">{currentUser.mobile}</strong></span>
            <span className="hidden sm:inline">·</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#21865B] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-[#21865B] animate-pulse"></span>
              Live Multi-Device Sync Active
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => onNavigate('book-worker')}
            className="flex-1 sm:flex-none px-4 py-3 bg-[#E9B949] hover:bg-[#d6a537] text-[#142B4A] text-xs font-extrabold rounded-xl shadow-xs transition-all border border-[#142B4A]/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Briefcase className="w-4 h-4 text-[#142B4A]" />
            <span>Book Station Gig Worker</span>
          </button>

          <button
            onClick={() => onNavigate('register-complaint')}
            className="flex-1 sm:flex-none px-4 py-3 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-xl shadow-xs transition-all border border-[#142B4A] hover:border-[#E9B949] flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#E9B949]" />
            <span>Register Complaint</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total */}
        <div className="bg-white rounded-2xl border border-[#E8E2D3] p-5 sm:p-6 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
              Total Filed
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] mt-1 font-mono tabular-nums">
              {total}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FFF5DC] text-[#142B4A] flex items-center justify-center border border-[#E9B949]/30">
            <FileText className="w-5 h-5 text-[#142B4A]" />
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl border border-[#E8E2D3] p-5 sm:p-6 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
              Pending Review
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#D99520] mt-1 font-mono tabular-nums">
              {pending}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FFF8E7] text-[#D99520] flex items-center justify-center border border-[#E9B949]/30">
            <Clock className="w-5 h-5 text-[#D99520]" />
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-2xl border border-[#E8E2D3] p-5 sm:p-6 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
              In Progress
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#315F91] mt-1 font-mono tabular-nums">
              {inProgress}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#EEF4FA] text-[#315F91] flex items-center justify-center border border-[#315F91]/20">
            <Train className="w-5 h-5 text-[#315F91]" />
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white rounded-2xl border border-[#E8E2D3] p-5 sm:p-6 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
              Resolved
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#21865B] mt-1 font-mono tabular-nums">
              {resolved}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#EDF7F2] text-[#21865B] flex items-center justify-center border border-[#21865B]/20">
            <CheckCircle2 className="w-5 h-5 text-[#21865B]" />
          </div>
        </div>

      </div>

      {/* Main Tab Switcher */}
      <div className="flex border-b border-[#E8E2D3] gap-2">
        <button
          onClick={() => setMainTab('complaints')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
            mainTab === 'complaints'
              ? 'border-[#142B4A] text-[#142B4A]'
              : 'border-transparent text-[#6B7280] hover:text-[#142B4A]'
          }`}
        >
          <FileText className="w-4 h-4 text-[#E9B949]" />
          <span>My Complaints ({userComplaints.length})</span>
        </button>

        <button
          onClick={() => setMainTab('worker-requests')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
            mainTab === 'worker-requests'
              ? 'border-[#142B4A] text-[#142B4A]'
              : 'border-transparent text-[#6B7280] hover:text-[#142B4A]'
          }`}
        >
          <Briefcase className="w-4 h-4 text-[#E9B949]" />
          <span>Gig Worker Requests ({userWorkerRequests.length})</span>
        </button>
      </div>

      {mainTab === 'complaints' ? (
        /* Grievances Section */
        <div className="bg-white rounded-3xl border border-[#E8E2D3] shadow-xs p-6 sm:p-8 space-y-6">
          
          {/* Filter & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D3]">
            
            <div>
              <h2 className="text-xl font-extrabold text-[#142B4A]">
                My Railway Grievances
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Track real-time progress and departmental actions across your journey tickets.
              </p>
            </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ID, train, or PNR..."
                className="pl-9 pr-3 py-2 text-xs bg-[#FFFDF5] border border-[#E8E2D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A] w-full sm:w-56"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 bg-[#FFF5DC] p-1 rounded-xl border border-[#E8E2D3]">
              {(['All', 'Pending', 'In Progress', 'Resolved'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterStatus(tab)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    filterStatus === tab
                      ? 'bg-[#142B4A] text-white shadow-xs'
                      : 'text-[#253247] hover:text-[#142B4A]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

          </div>

        </div>

        {/* Complaints Table or Empty State */}
        {displayedComplaints.length === 0 ? (
          <div className="text-center py-12 px-4 max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF5DC] text-[#142B4A] flex items-center justify-center mx-auto border border-[#E9B949]/30">
              <FileText className="w-8 h-8 text-[#142B4A]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#142B4A]">
                {userComplaints.length === 0 ? 'No complaints yet' : 'No matching grievances found'}
              </h3>
              <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                {userComplaints.length === 0
                  ? 'Your submitted railway complaints will appear here with live tracking status.'
                  : 'Try clearing your search keyword or changing status filters.'}
              </p>
            </div>
            {userComplaints.length === 0 && (
              <button
                onClick={() => onNavigate('register-complaint')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold shadow-xs transition"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#E9B949]" />
                Register a Complaint
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E8E2D3] text-[11px] font-extrabold uppercase tracking-wider text-[#6B7280] bg-[#FFFDF5]">
                  <th className="py-3 px-4">Complaint ID</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Train & Date</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4 text-center">Current Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D3] text-xs">
                {displayedComplaints.map((c) => (
                  <tr
                    key={c.complaintId}
                    className="hover:bg-[#FFFDF5] transition-colors group cursor-pointer"
                    onClick={() => {
                      onSelectComplaint(c);
                      onNavigate('complaint-details');
                    }}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#142B4A]">
                      {c.complaintId}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#253247]">
                      {c.category}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B7280]">
                      <div className="font-medium text-[#253247]">{c.trainNumber}</div>
                      <div className="text-[10px] text-[#6B7280]">
                        {c.journeyDate} {c.pnrNumber ? `· PNR: ${c.pnrNumber}` : ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#253247] max-w-xs truncate">
                      {c.subject}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {c.status === 'Pending' && (
                        <span className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#FFF8E7] text-[#9A6700] border border-[#E9B949]/30">
                          Pending
                        </span>
                      )}
                      {c.status === 'In Progress' && (
                        <span className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#EEF4FA] text-[#1B4470] border border-[#315F91]/20">
                          In Progress
                        </span>
                      )}
                      {c.status === 'Resolved' && (
                        <span className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#EDF7F2] text-[#156140] border border-[#21865B]/20">
                          Resolved
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectComplaint(c);
                          onNavigate('complaint-details');
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#142B4A] hover:text-[#243F63] px-2.5 py-1 rounded-lg hover:bg-[#FFF5DC] transition cursor-pointer"
                      >
                        <span>Track</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#E9B949]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
      ) : (
        /* Worker Requests Section */
        <div className="bg-white rounded-3xl border border-[#E8E2D3] shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#E8E2D3]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-[#E9B949] text-[#142B4A] text-[10px] font-extrabold uppercase rounded">
                  RAIL CARE WORKFORCE
                </span>
                <span className="text-xs text-[#6B7280]">Station On-Demand Services</span>
              </div>
              <h2 className="text-xl font-extrabold text-[#142B4A]">
                My Worker Service Requests
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Track assistance from verified technicians and attendants meeting your train.
              </p>
            </div>

            <button
              onClick={() => onNavigate('book-worker')}
              className="px-4 py-2.5 bg-[#E9B949] hover:bg-[#d6a537] text-[#142B4A] text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Briefcase className="w-4 h-4 text-[#142B4A]" />
              <span>Request Another Worker</span>
            </button>
          </div>

          {userWorkerRequests.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF5DC] text-[#142B4A] flex items-center justify-center mx-auto border border-[#E9B949]/30">
                <Briefcase className="w-7 h-7 text-[#142B4A]" />
              </div>
              <h3 className="font-bold text-base text-[#142B4A]">No Worker Requests Active</h3>
              <p className="text-xs text-[#6B7280] max-w-md mx-auto">
                Need an electrician, plumber, mechanic, cleaner, or luggage assistant at an upcoming station? Request a verified railway gig worker in 60 seconds.
              </p>
              <button
                onClick={() => onNavigate('book-worker')}
                className="mt-3 px-6 py-2.5 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-[#E9B949]" />
                <span>Book a Railway Service Worker</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {userWorkerRequests.map((req) => {
                const stages = [
                  'Requested',
                  'Finding Worker',
                  'Worker Assigned',
                  'On the Way',
                  'Arrived at Station',
                  'Service In Progress',
                  'Completed',
                ];
                const currentStageIdx = stages.indexOf(req.status);
                const isCancelled = req.status === 'Cancelled';

                return (
                  <div
                    key={req.id}
                    className="rounded-2xl border border-[#E8E2D3] bg-[#FFFDF5] p-5 sm:p-6 shadow-xs space-y-5"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#E8E2D3]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-[#142B4A] text-white px-2 py-0.5 rounded">
                          {req.requestId}
                        </span>
                        <span className="font-extrabold text-sm text-[#142B4A]">
                          {req.serviceCategory}
                        </span>
                        <span className="text-xs text-[#6B7280]">
                          · Train: <strong className="text-[#253247]">{req.trainNumber}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 text-xs font-extrabold rounded-full ${
                            req.status === 'Completed'
                              ? 'bg-[#EDF7F2] text-[#156140] border border-[#21865B]/30'
                              : isCancelled
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-[#FFF5DC] text-[#142B4A] border border-[#E9B949]/40'
                          }`}
                        >
                          {req.status}
                        </span>

                        {!['Completed', 'Cancelled'].includes(req.status) && onCancelWorkerRequest && (
                          <button
                            onClick={() => onCancelWorkerRequest(req.requestId)}
                            className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Visual Progress Bar Tracker */}
                    {!isCancelled && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                          <span>Requested</span>
                          <span className="hidden sm:inline">Finding Worker</span>
                          <span>Assigned</span>
                          <span className="hidden sm:inline">On the Way</span>
                          <span className="hidden md:inline">Arrived</span>
                          <span>In Progress</span>
                          <span>Completed</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                          <div
                            className="bg-gradient-to-r from-[#142B4A] via-[#E9B949] to-[#21865B] h-full transition-all duration-500 rounded-full"
                            style={{
                              width: `${Math.max(14, ((currentStageIdx + 1) / stages.length) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs bg-white p-4 rounded-xl border border-[#E8E2D3]">
                      <div>
                        <span className="text-[10px] font-bold text-[#6B7280] uppercase block">
                          Meeting Station
                        </span>
                        <span className="font-extrabold text-[#142B4A] text-sm">
                          {req.stationName} ({req.stationCode})
                        </span>
                        {req.expectedArrivalTime && (
                          <p className="text-[11px] text-[#6B7280] mt-0.5">
                            Expected: <strong>{req.expectedArrivalTime}</strong>
                          </p>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-[#6B7280] uppercase block">
                          Coach & Seat
                        </span>
                        <span className="font-semibold text-[#253247]">
                          Coach: {req.coachNumber || 'N/A'} · Seat: {req.seatNumber || 'N/A'}
                        </span>
                        {req.relatedComplaintId && (
                          <p className="text-[11px] text-[#6B7280] mt-0.5">
                            Ticket: #{req.relatedComplaintId}
                          </p>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-[#6B7280] uppercase block">
                          Assigned Worker
                        </span>
                        {req.assignedWorkerName ? (
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-[#21865B] flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5" />
                              {req.assignedWorkerName}
                            </span>
                            {req.assignedWorkerMobile && (
                              <p className="text-[11px] text-[#6B7280] flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {req.assignedWorkerMobile}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#6B7280] italic">
                            Locating available station worker...
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Request Description & Notes */}
                    <div className="text-xs text-[#253247] space-y-1">
                      <span className="font-bold text-[#142B4A]">Passenger Notes:</span>
                      <p className="text-[#6B7280] italic">"{req.description}"</p>
                      {req.completionNotes && (
                        <div className="mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px]">
                          <strong>Resolution Summary:</strong> {req.completionNotes}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
