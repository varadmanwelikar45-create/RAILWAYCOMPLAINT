import React, { useState } from 'react';
import { Complaint, ViewMode } from '../types';
import { Search, X, CheckCircle2, Clock, AlertCircle, Train, Calendar, ArrowRight, Tag } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-[#142B4A]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-[#E8E2D3] shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#E8E2D3]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF5DC] text-[#142B4A] text-[10px] font-extrabold uppercase tracking-wider mb-1 border border-[#E9B949]/40">
              REAL-TIME GRIEVANCE TRACKER
            </div>
            <h3 className="text-xl font-extrabold text-[#142B4A]">
              Track Grievance / PNR Status
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Enter your Reference ID (e.g., <button type="button" onClick={() => { setQuery('RC1002'); setHasSearched(true); }} className="font-mono font-bold text-[#142B4A] underline cursor-pointer">RC1002</button> or <button type="button" onClick={() => { setQuery('RC1001'); setHasSearched(true); }} className="font-mono font-bold text-[#142B4A] underline cursor-pointer">RC1001</button>) or 10-digit PNR.
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
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHasSearched(false);
              }}
              placeholder="Enter Reference ID (RC1001) or 10-digit PNR..."
              className="w-full pl-10 pr-24 py-3 text-xs sm:text-sm bg-[#FFFDF5] border border-[#E8E2D3] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#142B4A] font-medium"
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-2 top-2 px-4 py-1.5 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Search
            </button>
          </div>

          {/* Quick Inquiry Shortcuts */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#6B7280]">
            <span>Recent Inquiries:</span>
            {complaints.slice(0, 3).map((c) => (
              <button
                key={c.complaintId}
                type="button"
                onClick={() => {
                  setQuery(c.complaintId);
                  setHasSearched(true);
                }}
                className="px-2 py-0.5 bg-[#FFF5DC] text-[#142B4A] font-mono font-bold rounded-md border border-[#E9B949]/50 hover:bg-[#E9B949] transition cursor-pointer"
              >
                {c.complaintId}
              </button>
            ))}
          </div>
        </form>

        {/* Result Area */}
        {matchedComplaint ? (
          <div className="bg-[#FFFDF5] border border-[#E8E2D3] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#6B7280] uppercase block">
                  Reference ID
                </span>
                <span className="font-mono text-xl font-extrabold text-[#142B4A]">
                  {matchedComplaint.complaintId}
                </span>
              </div>
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full ${
                    matchedComplaint.status === 'Resolved'
                      ? 'bg-[#EDF7F2] text-[#156140] border border-[#21865B]/30'
                      : matchedComplaint.status === 'In Progress'
                      ? 'bg-[#EEF4FA] text-[#1B4470] border border-[#315F91]/30'
                      : 'bg-[#FFF8E7] text-[#9A6700] border border-[#E9B949]/40'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      matchedComplaint.status === 'Resolved'
                        ? 'bg-[#21865B]'
                        : matchedComplaint.status === 'In Progress'
                        ? 'bg-[#315F91] animate-pulse'
                        : 'bg-[#D99520] animate-pulse'
                    }`}
                  />
                  {matchedComplaint.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-[#E8E2D3] py-3">
              <div>
                <span className="text-[10px] text-[#6B7280] block font-bold uppercase">Train</span>
                <span className="font-semibold text-[#142B4A]">{matchedComplaint.trainNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6B7280] block font-bold uppercase">Category</span>
                <span className="font-semibold text-[#142B4A]">{matchedComplaint.category}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6B7280] block font-bold uppercase">Passenger</span>
                <span className="text-[#253247]">{matchedComplaint.passengerName}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6B7280] block font-bold uppercase">Logged Date</span>
                <span className="text-[#253247]">{matchedComplaint.createdAt.slice(0, 10)}</span>
              </div>
            </div>

            <div className="text-xs">
              <span className="font-bold text-[#142B4A] block mb-0.5">Subject:</span>
              <p className="text-[#253247] font-medium">{matchedComplaint.subject}</p>
            </div>

            <button
              onClick={() => handleViewDetails(matchedComplaint)}
              className="w-full py-2.5 px-4 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>View Full Case Details & Audit Timeline</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#E9B949]" />
            </button>
          </div>
        ) : hasSearched && query.trim() ? (
          <div className="py-8 text-center space-y-2 bg-[#FFFDF5] rounded-2xl border border-dashed border-[#E8E2D3]">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <h4 className="font-bold text-sm text-[#142B4A]">No Grievance Record Found</h4>
            <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
              No complaint matching "{query}" was found. Please check your Reference ID (e.g. RC1001) or PNR number.
            </p>
          </div>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-[#6B7280] pt-2">
          <span>Need immediate assistance?</span>
          <button
            onClick={() => {
              onClose();
              onNavigate('register-complaint');
            }}
            className="font-bold text-[#142B4A] underline hover:text-[#243F63] cursor-pointer"
          >
            Lodge New Complaint &rarr;
          </button>
        </div>

      </div>
    </div>
  );
};
