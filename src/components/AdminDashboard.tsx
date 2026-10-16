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
  RotateCcw,
  TrainTrack
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
    <div className="space-y-8 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D3] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-[#142B4A] text-[#E9B949] text-[10px] font-extrabold rounded-md tracking-wider uppercase border border-[#E9B949]/30">
              OFFICIAL CONTROL CENTER
            </span>
            <span className="text-xs text-[#6B7280] font-medium">RAIL CARE Grievance Redressal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] tracking-tight">
            Administrator Dashboard
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#6B7280]">
            <span>
              Officer: <strong className="text-[#142B4A]">{currentUser.fullName}</strong>
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#21865B] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-[#21865B] animate-pulse"></span>
              Live Multi-Device Sync Active
            </span>
          </div>
        </div>

        {/* 1-Click FIFO Dispatch Button */}
        <button
          onClick={handleProcessFIFO}
          disabled={queue.size() === 0}
          className={`px-5 py-3 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 border ${
            queue.size() > 0
              ? 'bg-[#142B4A] hover:bg-[#243F63] border-[#142B4A] hover:border-[#E9B949] cursor-pointer'
              : 'bg-slate-200 border-slate-300 cursor-not-allowed text-slate-500'
          }`}
          title="Dispatch the earliest pending complaint"
        >
          <PlayCircle className="w-4 h-4 text-[#E9B949]" />
          <span>
            {nextInQueue
              ? `Process Next: ${nextInQueue.complaintId} (${(nextInQueue.passengerName || 'Passenger').split(' ')[0]})`
              : 'Queue Empty (All Processed)'}
          </span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between shadow-2xs">
          <span className="flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            {actionNotice}
          </span>
          <button onClick={() => setActionNotice(null)} className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer">×</button>
        </div>
      )}

      {/* Summary Metrics Cards (1-Click Filtering) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <button
          onClick={() => setStatusTab('All')}
          className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
            statusTab === 'All'
              ? 'bg-[#FFF5DC] border-[#E9B949] shadow-xs'
              : 'bg-white border-[#E8E2D3] hover:border-[#E9B949] shadow-xs'
          }`}
        >
          <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
            Total Complaints
          </div>
          <div className="text-3xl font-extrabold text-[#142B4A] mt-2 font-mono tabular-nums">
            {summary.total}
          </div>
          <div className="text-[11px] text-[#6B7280] mt-1">Click to view all</div>
        </button>

        <button
          onClick={() => setStatusTab('Pending')}
          className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
            statusTab === 'Pending'
              ? 'bg-[#FFF8E7] border-[#D99520] shadow-xs'
              : 'bg-white border-[#E8E2D3] hover:border-[#D99520] shadow-xs'
          }`}
        >
          <div className="text-xs font-bold text-[#9A6700] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D99520]"></span>
            Pending Queue
          </div>
          <div className="text-3xl font-extrabold text-[#D99520] mt-2 font-mono tabular-nums">
            {summary.pending}
          </div>
          <div className="text-[11px] text-[#9A6700] mt-1">Click to filter pending</div>
        </button>

        <button
          onClick={() => setStatusTab('In Progress')}
          className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
            statusTab === 'In Progress'
              ? 'bg-[#EEF4FA] border-[#315F91] shadow-xs'
              : 'bg-white border-[#E8E2D3] hover:border-[#315F91] shadow-xs'
          }`}
        >
          <div className="text-xs font-bold text-[#1B4470] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#315F91]"></span>
            In Progress
          </div>
          <div className="text-3xl font-extrabold text-[#315F91] mt-2 font-mono tabular-nums">
            {summary.inProgress}
          </div>
          <div className="text-[11px] text-[#1B4470] mt-1">Click to filter in-progress</div>
        </button>

        <button
          onClick={() => setStatusTab('Resolved')}
          className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
            statusTab === 'Resolved'
              ? 'bg-[#EDF7F2] border-[#21865B] shadow-xs'
              : 'bg-white border-[#E8E2D3] hover:border-[#21865B] shadow-xs'
          }`}
        >
          <div className="text-xs font-bold text-[#156140] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#21865B]"></span>
            Resolved
          </div>
          <div className="text-3xl font-extrabold text-[#21865B] mt-2 font-mono tabular-nums">
            {summary.resolved}
          </div>
          <div className="text-[11px] text-[#156140] mt-1">Click to filter resolved</div>
        </button>

      </div>

      {/* Main Grid: Complaints Management Table + Category Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Table & Filter Controls (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Filter Bar with Status Tabs & Search */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D3] shadow-xs space-y-3">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              
              {/* Quick Status Tabs */}
              <div className="flex items-center gap-1 p-1 bg-[#FFF5DC] rounded-xl border border-[#E8E2D3] text-xs font-semibold">
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
                          ? 'bg-[#142B4A] text-white shadow-2xs'
                          : 'text-[#253247] hover:text-[#142B4A]'
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
                className="px-3 py-1.5 bg-[#FFFDF5] hover:bg-[#FFF5DC] text-[#142B4A] border border-[#E8E2D3] text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-[#E9B949]" />
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
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#FFFDF5] border border-[#E8E2D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                />
                <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-3 top-3" />
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FFFDF5] border border-[#E8E2D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
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
                    className="px-3 py-2 text-xs font-semibold text-[#6B7280] hover:text-red-700 bg-[#FFFDF5] hover:bg-red-50 border border-[#E8E2D3] rounded-xl shrink-0 flex items-center gap-1 cursor-pointer"
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
          <div className="bg-white rounded-2xl border border-[#E8E2D3] shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E8E2D3] flex justify-between items-center bg-[#FFFDF5]">
              <h2 className="text-xs font-extrabold text-[#142B4A] uppercase tracking-wider">
                Grievance Records ({sortResult.sortedList.length})
              </h2>
              <span className="text-[11px] text-[#6B7280]">
                Status changes update the central server immediately
              </span>
            </div>

            {sortResult.sortedList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FFFDF5] text-[#6B7280] font-bold border-b border-[#E8E2D3]">
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Passenger</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Subject / Issue</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E2D3]">
                    {sortResult.sortedList.map((c) => (
                      <tr key={c.complaintId} className="hover:bg-[#FFFDF5] transition">
                        <td className="py-3 px-4 font-mono font-bold text-[#142B4A]">
                          {c.complaintId}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#253247]">{c.passengerName}</div>
                          <div className="text-[10px] text-[#6B7280]">{c.trainNumber}</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-[#253247] whitespace-nowrap">
                          {c.category}
                        </td>
                        <td className="py-3 px-4 max-w-[220px]">
                          <div className="truncate font-medium text-[#253247]" title={c.subject}>
                            {c.subject}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#6B7280] whitespace-nowrap">
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
                                ? 'bg-[#FFF8E7] text-[#9A6700] border-[#E9B949]/40'
                                : c.status === 'In Progress'
                                ? 'bg-[#EEF4FA] text-[#1B4470] border-[#315F91]/30'
                                : 'bg-[#EDF7F2] text-[#156140] border-[#21865B]/30'
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
                            className="p-1.5 bg-[#FFFDF5] hover:bg-[#FFF5DC] text-[#142B4A] border border-[#E8E2D3] rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                            title="View Full Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#E9B949]" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center text-xs text-[#6B7280]">
                No complaint records found matching your current filter.
              </div>
            )}
          </div>

        </div>

        {/* Complaints by Category (1 col) */}
        <div className="bg-white rounded-2xl border border-[#E8E2D3] shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D3]">
            <h3 className="text-xs font-extrabold text-[#142B4A] uppercase tracking-wider">
              By Category
            </h3>
            <BarChart3 className="w-4 h-4 text-[#E9B949]" />
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
                  className={`w-full text-left space-y-1 p-1.5 rounded-xl hover:bg-[#FFF5DC] transition cursor-pointer ${
                    selectedCategory === cat ? 'bg-[#FFF5DC] font-bold border border-[#E9B949]/40' : ''
                  }`}
                >
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#253247] truncate max-w-[140px] font-medium">{cat}</span>
                    <span className="font-bold text-[#142B4A] font-mono tabular-nums">{count}</span>
                  </div>
                  <div className="w-full bg-[#FFF5DC] h-1.5 rounded-full overflow-hidden border border-[#E8E2D3]/60">
                    <div
                      className="bg-[#142B4A] h-full rounded-full transition-all duration-300"
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
