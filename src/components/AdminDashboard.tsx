import React, { useState, useMemo } from 'react';
import { Complaint, ComplaintCategory, ComplaintStatus, User, ViewMode } from '../types';
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
  RotateCcw
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  complaints: Complaint[];
  queue: FIFOQueue;
  onProcessNextFIFO: () => { success: boolean; complaint?: Complaint; message: string };
  onUpdateStatus: (complaintId: string, newStatus: ComplaintStatus) => void;
  onSelectComplaint: (complaint: Complaint) => void;
  onNavigate: (view: ViewMode) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  complaints,
  queue,
  onProcessNextFIFO,
  onUpdateStatus,
  onSelectComplaint,
  onNavigate,
}) => {
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

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-[#12304A] text-white text-[10px] font-bold rounded tracking-wider uppercase">
              Control Center
            </span>
            <span className="text-xs text-slate-500 font-medium">Railway Grievance Redressal</span>
          </div>
          <h1 className="text-2xl font-bold text-[#12304A]">
            Administrator Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Officer: <strong className="text-slate-700">{currentUser.fullName}</strong>
          </p>
        </div>

        {/* 1-Click FIFO Dispatch Button */}
        <button
          onClick={handleProcessFIFO}
          disabled={queue.size() === 0}
          className={`px-4 py-2.5 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-2 ${
            queue.size() > 0
              ? 'bg-[#12304A] hover:bg-[#0c2033] cursor-pointer'
              : 'bg-slate-300 cursor-not-allowed text-slate-500'
          }`}
          title="Dispatch the earliest pending complaint"
        >
          <PlayCircle className="w-4 h-4 text-amber-400" />
          <span>
            {nextInQueue
              ? `Process Next: ${nextInQueue.complaintId} (${nextInQueue.passengerName.split(' ')[0]})`
              : 'Queue Empty (All Processed)'}
          </span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            {actionNotice}
          </span>
          <button onClick={() => setActionNotice(null)} className="text-emerald-600 hover:text-emerald-900 font-bold ml-2">×</button>
        </div>
      )}

      {/* Summary Metrics Cards (Clicking any card acts as a 1-click filter!) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <button
          onClick={() => setStatusTab('All')}
          className={`text-left p-5 rounded-xl border transition cursor-pointer ${
            statusTab === 'All'
              ? 'bg-blue-50/50 border-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Total Complaints
          </div>
          <div className="text-3xl font-extrabold text-[#12304A] mt-2">
            {summary.total}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Click to view all</div>
        </button>

        <button
          onClick={() => setStatusTab('Pending')}
          className={`text-left p-5 rounded-xl border transition cursor-pointer ${
            statusTab === 'Pending'
              ? 'bg-amber-50/50 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-wide flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Pending Queue
          </div>
          <div className="text-3xl font-extrabold text-amber-600 mt-2">
            {summary.pending}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Click to filter pending</div>
        </button>

        <button
          onClick={() => setStatusTab('In Progress')}
          className={`text-left p-5 rounded-xl border transition cursor-pointer ${
            statusTab === 'In Progress'
              ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            In Progress
          </div>
          <div className="text-3xl font-extrabold text-blue-600 mt-2">
            {summary.inProgress}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Click to filter in-progress</div>
        </button>

        <button
          onClick={() => setStatusTab('Resolved')}
          className={`text-left p-5 rounded-xl border transition cursor-pointer ${
            statusTab === 'Resolved'
              ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            Resolved
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">
            {summary.resolved}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Click to filter resolved</div>
        </button>

      </div>

      {/* Main Grid: Complaints Table + Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Table & Filter Controls (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Filter Bar with Status Tabs & Search */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              
              {/* Quick Status Tabs (Zero-Effort 1-Click Filtering) */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
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
                      className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                        statusTab === tab
                          ? 'bg-white text-[#12304A] font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab} <span className="opacity-70 ml-0.5">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Sort Order Toggle */}
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition flex items-center gap-1.5 self-end sm:self-auto cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span>Date: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
              </button>

            </div>

            {/* Search Input & Category Dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Quick search: ID, passenger, train, PNR..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white"
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
                    className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-slate-200 rounded-md shrink-0 flex items-center gap-1"
                    title="Reset filters"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Table with Effortless INLINE Status Changer! */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50/60">
              <h2 className="text-xs font-bold text-[#12304A] uppercase tracking-wider">
                Grievances ({sortResult.sortedList.length})
              </h2>
              <span className="text-[11px] text-slate-400">
                Tip: You can update status directly in each row below!
              </span>
            </div>

            {sortResult.sortedList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <th className="py-2.5 px-3">ID</th>
                      <th className="py-2.5 px-3">Passenger</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Subject / Issue</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Status (Change Directly)</th>
                      <th className="py-2.5 px-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortResult.sortedList.map((c) => (
                      <tr key={c.complaintId} className="hover:bg-slate-50/70 transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#12304A]">
                          {c.complaintId}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-800">{c.passengerName}</div>
                          <div className="text-[10px] text-slate-400">{c.trainNumber}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                          {c.category}
                        </td>
                        <td className="py-2.5 px-3 max-w-[220px]">
                          <div className="truncate font-medium text-slate-800" title={c.subject}>
                            {c.subject}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                          {(c.createdAt || '').slice(0, 10) || 'Recent'}
                        </td>
                        
                        {/* Effortless 1-Click Inline Status Dropdown */}
                        <td className="py-2 px-3 whitespace-nowrap">
                          <select
                            value={c.status}
                            onChange={(e) =>
                              handleInlineStatusChange(
                                c.complaintId,
                                e.target.value as ComplaintStatus
                              )
                            }
                            className={`px-2 py-1 text-xs font-semibold rounded border cursor-pointer transition ${
                              c.status === 'Pending'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : c.status === 'In Progress'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            }`}
                          >
                            <option value="Pending">🟡 Pending</option>
                            <option value="In Progress">🔵 In Progress</option>
                            <option value="Resolved">🟢 Resolved</option>
                          </select>
                        </td>

                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => {
                              onSelectComplaint(c);
                              onNavigate('complaint-details');
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition inline-flex items-center gap-1"
                            title="View Full Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                No complaint records found matching your current filter.
              </div>
            )}
          </div>

        </div>

        {/* Complaints by Category (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-[#12304A] uppercase tracking-wider">
              By Category
            </h3>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-2.5 text-xs">
            {ALLOWED_CATEGORIES.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const maxCount = Math.max(...Object.values(categoryCounts), 1);
              const percentage = Math.round((count / maxCount) * 100);

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                  className={`w-full text-left space-y-0.5 p-1 rounded hover:bg-slate-50 transition cursor-pointer ${
                    selectedCategory === cat ? 'bg-blue-50/80 font-bold' : ''
                  }`}
                >
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-600 truncate max-w-[140px]">{cat}</span>
                    <span className="font-bold text-[#12304A]">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#2563EB] h-full rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
};
