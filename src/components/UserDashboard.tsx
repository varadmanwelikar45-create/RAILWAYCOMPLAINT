import React, { useState } from 'react';
import { Complaint, User, ViewMode } from '../types';
import { PlusCircle, FileText, Clock, CheckCircle2, ChevronRight, AlertCircle, Train, Search } from 'lucide-react';

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

  // Filter complaints strictly belonging to the logged-in user
  const userComplaints = (complaints || []).filter((c) => c && c.userId === currentUser?.id);

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
      String(c.trainNumber || '').toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 py-6 max-w-6xl mx-auto px-4">
      
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-[#2563EB] uppercase tracking-wider mb-1">
            Passenger Portal
          </div>
          <h1 className="text-2xl font-bold text-[#12304A]">
            Welcome, {currentUser.fullName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Email: {currentUser.email} · Mobile: {currentUser.mobile}
          </p>
        </div>

        <button
          onClick={() => onNavigate('register-complaint')}
          className="px-4 py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold text-xs rounded-lg shadow-sm transition flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Register New Complaint
        </button>
      </div>

      {/* Summary Cards with 1-Click Filter */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <button
          onClick={() => setFilterStatus('All')}
          className={`text-left p-5 rounded-xl border transition cursor-pointer ${
            filterStatus === 'All'
              ? 'bg-blue-50/50 border-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Total Submitted
          </div>
          <div className="text-3xl font-extrabold text-[#12304A] mt-2">
            {total}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Click to view all</div>
        </button>

        <button
          onClick={() => setFilterStatus('Pending')}
          className={`text-left p-5 rounded-xl border transition cursor-pointer ${
            filterStatus === 'Pending'
              ? 'bg-amber-50/50 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-wide flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
            Pending Review
          </div>
          <div className="text-3xl font-extrabold text-amber-600 mt-2">
            {pending}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Awaiting dispatch</div>
        </button>

        <button
          onClick={() => setFilterStatus('In Progress')}
          className={`text-left p-5 rounded-xl border transition cursor-pointer ${
            filterStatus === 'In Progress'
              ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
            In Progress
          </div>
          <div className="text-3xl font-extrabold text-blue-600 mt-2">
            {inProgress}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Under investigation</div>
        </button>

        <button
          onClick={() => setFilterStatus('Resolved')}
          className={`text-left p-5 rounded-xl border transition cursor-pointer ${
            filterStatus === 'Resolved'
              ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Resolved
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">
            {resolved}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Successfully closed</div>
        </button>

      </div>

      {/* Complaints History Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Table header & mini-search */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#12304A]">My Complaints History</h2>
            {filterStatus !== 'All' && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-[#2563EB]">
                {filterStatus} ({displayedComplaints.length})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search my complaints..."
                className="w-full pl-7 pr-3 py-1 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
              <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2" />
            </div>

            {filterStatus !== 'All' && (
              <button
                onClick={() => setFilterStatus('All')}
                className="text-xs text-slate-500 hover:text-slate-800 underline shrink-0"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {displayedComplaints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Complaint ID</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Train & Coach</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedComplaints.map((c) => (
                  <tr key={c.complaintId} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 font-mono font-bold text-[#12304A]">
                      {c.complaintId}
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {c.category}
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      <div className="truncate text-slate-800 font-medium" title={c.subject}>
                        {c.subject}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div>{c.trainNumber}</div>
                      {c.location && <div className="text-slate-400 text-[10px]">{c.location}</div>}
                    </td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {(c.createdAt || '').slice(0, 10) || 'Recent'}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {c.status === 'Pending' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          Pending
                        </span>
                      )}
                      {c.status === 'In Progress' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                          In Progress
                        </span>
                      )}
                      {c.status === 'Resolved' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                          Resolved
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          onSelectComplaint(c);
                          onNavigate('complaint-details');
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition cursor-pointer"
                      >
                        Track & View
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 px-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700">No Complaints Found</h3>
            <p className="text-xs text-slate-500 mt-0.5 max-w-sm mx-auto mb-3">
              {filterStatus !== 'All'
                ? `You have no ${filterStatus.toLowerCase()} complaints.`
                : 'You have not submitted any complaints yet.'}
            </p>
            <button
              onClick={() => onNavigate('register-complaint')}
              className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              + Register a Grievance
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
