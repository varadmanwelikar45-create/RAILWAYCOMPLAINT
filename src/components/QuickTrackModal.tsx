import React, { useState } from 'react';
import { Complaint, ViewMode } from '../types';
import { Search, X, AlertCircle, ArrowRight } from 'lucide-react';

interface QuickTrackModalProps {
  complaints: Complaint[];
  isOpen: boolean;
  onClose: () => void;
  onSelectComplaint: (complaint: Complaint) => void;
  onNavigate: (view: ViewMode) => void;
}

export const QuickTrackModal: React.FC<QuickTrackModalProps> = ({
  complaints,
  isOpen,
  onClose,
  onSelectComplaint,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const cleanQuery = query.trim().toLowerCase();
  const matchedComplaint = complaints.find((c) => {
    if (!cleanQuery) return false;
    const cid = (c.complaintId || '').toLowerCase();
    const pnr = (c.pnrNumber || '').toLowerCase();
    const train = (c.trainNumber || '').toLowerCase();
    const mobile = (c.passengerMobile || '').toLowerCase();
    return cid === cleanQuery || pnr === cleanQuery || cid.includes(cleanQuery) || pnr.includes(cleanQuery) || mobile === cleanQuery || train.includes(cleanQuery);
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
  };

  const handleViewDetails = (c: Complaint) => {
    onSelectComplaint(c);
    onClose();
    onNavigate('complaint-details');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase tracking-wider mb-1 border border-amber-300">
              REAL-TIME GRIEVANCE TRACKER
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Track Grievance / PNR Status
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your Reference ID (e.g., <button type="button" onClick={() => { setQuery('RC1002'); setHasSearched(true); }} className="font-mono font-bold text-amber-600 underline cursor-pointer">RC1002</button> or <button type="button" onClick={() => { setQuery('RC1001'); setHasSearched(true); }} className="font-mono font-bold text-amber-600 underline cursor-pointer">RC1001</button>) or 10-digit PNR.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHasSearched(false);
              }}
              placeholder="Enter Reference ID (RC1001) or 10-digit PNR..."
              className="w-full pl-10 pr-24 py-3 text-xs sm:text-sm bg-white border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 font-medium shadow-2xs"
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-2 top-2 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold rounded-xl transition cursor-pointer shadow-xs border border-amber-400"
            >
              Search
            </button>
          </div>

          {/* Quick Inquiry Shortcuts */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
            <span>Recent Inquiries:</span>
            {complaints.slice(0, 3).map((c) => (
              <button
                key={c.complaintId}
                type="button"
                onClick={() => {
                  setQuery(c.complaintId);
                  setHasSearched(true);
                }}
                className="font-mono font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200 transition cursor-pointer"
              >
                #{c.complaintId}
              </button>
            ))}
          </div>
        </form>

        {/* Search Result Display */}
        {hasSearched && (
          <div className="space-y-3">
            {matchedComplaint ? (
              <div className="p-4 rounded-2xl border border-amber-300 bg-[#FFFDF5] space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-sm text-slate-900">
                      #{matchedComplaint.complaintId}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        matchedComplaint.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : matchedComplaint.status === 'In Progress'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      ● {matchedComplaint.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {matchedComplaint.createdAt.slice(0, 10)}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900">{matchedComplaint.subject}</h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{matchedComplaint.description}</p>
                </div>

                <div className="pt-2 border-t border-amber-200 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Train: <strong>{matchedComplaint.trainNumber}</strong> · Coach {matchedComplaint.location || 'N/A'}
                  </span>
                  <button
                    onClick={() => handleViewDetails(matchedComplaint)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
                  >
                    <span>View Case File</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-1.5">
                <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
                <h4 className="text-xs font-bold text-slate-900">No matching grievance record found</h4>
                <p className="text-[11px] text-slate-500">
                  Please check the reference number or PNR. Alternatively, sign in to view your complete case history.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="text-center pt-2">
          <button
            onClick={() => {
              onClose();
              onNavigate('register-complaint');
            }}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
          >
            File a New Grievance Complaint &rarr;
          </button>
        </div>

      </div>
    </div>
  );
};
