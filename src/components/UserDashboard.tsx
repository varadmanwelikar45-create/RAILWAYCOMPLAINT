import React, { useState } from 'react';
import { Complaint, User, ViewMode } from '../types';
import { PlusCircle, FileText, Clock, CheckCircle2, ChevronRight, AlertCircle, Train, Search, Filter } from 'lucide-react';

interface UserDashboardProps {
  currentUser: User;
  complaints: Complaint[];
  onNavigate: (view: ViewMode) => void;
  onSelectComplaint: (complaint: Complaint) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  complaints,
  onNavigate,
  onSelectComplaint,
}) => {
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D3] shadow-xs">
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

        {/* Primary Action Button */}
        <button
          onClick={() => onNavigate('register-complaint')}
          className="px-5 py-3 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-xl shadow-sm transition-all border border-[#142B4A] hover:border-[#E9B949] flex items-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-[#E9B949]" />
          <span>Register New Complaint</span>
        </button>
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

      {/* Grievances Section */}
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

    </div>
  );
};
