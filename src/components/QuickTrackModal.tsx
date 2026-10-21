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
    <div className="fixed inset-0 z-50 bg-[#115E59]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-[#D8EAE4] shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#D8EAE4]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#CCFBF1] text-[#0F766E] text-[10px] font-extrabold uppercase tracking-wider mb-1 border border-[#A7E8D0]">
              REAL-TIME GRIEVANCE TRACKER
            </div>
            <h3 className="text-xl font-extrabold text-[#115E59]">
              Track Grievance / PNR Status
            </h3>
            <p className="text-xs text-[#647773] mt-0.5">
              Enter your Reference ID (e.g., <button type="button" onClick={() => { setQuery('RC1002'); setHasSearched(true); }} className="font-mono font-bold text-[#0F766E] underline cursor-pointer">RC1002</button> or <button type="button" onClick={() => { setQuery('RC1001'); setHasSearched(true); }} className="font-mono font-bold text-[#0F766E] underline cursor-pointer">RC1001</button>) or 10-digit PNR.
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
            <Search className="w-4 h-4 text-[#647773] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHasSearched(false);
              }}
              placeholder="Enter Reference ID (RC1001) or 10-digit PNR..."
              className="w-full pl-10 pr-24 py-3 text-xs sm:text-sm bg-white border border-[#D8EAE4] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0F766E] text-[#183B3A] font-medium"
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-2 top-2 px-4 py-1.5 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Search
            </button>
          </div>

          {/* Quick Inquiry Shortcuts */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#647773]">
            <span>Recent Inquiries:</span>
            {complaints.slice(0, 3).map((c) => (
              <button
                key={c.complaintId}
                type="button"
                onClick={() => {
                  setQuery(c.complaintId);
                  setHasSearched(true);
                }}
                className="px-2 py-0.5 bg-[#E5F5EF] text-[#0F766E] font-mono font-bold rounded-md border border-[#A7E8D0] hover:bg-[#CCFBF1] transition cursor-pointer"
              >
                {c.complaintId}
              </button>
            ))}
          </div>
        </form>

        {/* Result Area */}
        {matchedComplaint ? (
          <div className="bg-[#F4FBF8] border border-[#D8EAE4] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#647773] uppercase block">
                  Reference ID
                </span>
                <span className="font-mono text-xl font-extrabold text-[#115E59]">
                  {matchedComplaint.complaintId}
                </span>
              </div>
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full ${
                    matchedComplaint.status === 'Resolved'
                      ? 'bg-[#E5F5EF] text-[#16845B] border border-[#A7E8D0]'
                      : matchedComplaint.status === 'In Progress'
                      ? 'bg-[#CCFBF1] text-[#0F766E] border border-[#A7E8D0]'
                      : 'bg-amber-50 text-[#C58B20] border border-amber-200'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      matchedComplaint.status === 'Resolved'
                        ? 'bg-[#16845B]'
                        : matchedComplaint.status === 'In Progress'
                        ? 'bg-[#0F766E] animate-pulse'
                        : 'bg-[#C58B20] animate-pulse'
                    }`}
                  />
                  {matchedComplaint.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-[#D8EAE4] py-3">
              <div>
                <span className="text-[10px] text-[#647773] block font-bold uppercase">Train</span>
                <span className="font-semibold text-[#183B3A]">{matchedComplaint.trainNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#647773] block font-bold uppercase">Category</span>
                <span className="font-semibold text-[#183B3A]">{matchedComplaint.category}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#647773] block font-bold uppercase">Passenger</span>
                <span className="text-[#183B3A]">{matchedComplaint.passengerName}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#647773] block font-bold uppercase">Logged Date</span>
                <span className="text-[#183B3A]">{matchedComplaint.createdAt.slice(0, 10)}</span>
              </div>
            </div>

            <div className="text-xs">
              <span className="font-bold text-[#115E59] block mb-0.5">Subject:</span>
              <p className="text-[#183B3A] font-medium">{matchedComplaint.subject}</p>
            </div>

            <button
              onClick={() => handleViewDetails(matchedComplaint)}
              className="w-full py-2.5 px-4 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>View Full Case Details &amp; Audit Timeline</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#CCFBF1]" />
            </button>
          </div>
        ) : hasSearched && query.trim() ? (
          <div className="py-8 text-center space-y-2 bg-[#F4FBF8] rounded-2xl border border-dashed border-[#D8EAE4]">
            <AlertCircle className="w-8 h-8 text-[#C58B20] mx-auto" />
            <h4 className="font-bold text-sm text-[#115E59]">No Grievance Record Found</h4>
            <p className="text-xs text-[#647773] max-w-sm mx-auto">
              No complaint matching "{query}" was found. Please check your Reference ID (e.g. RC1001) or PNR number.
            </p>
          </div>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-[#647773] pt-2">
          <span>Need immediate assistance?</span>
          <button
            onClick={() => {
              onClose();
              onNavigate('register-complaint');
            }}
            className="font-bold text-[#0F766E] underline hover:text-[#115E59] cursor-pointer"
          >
            Lodge New Complaint &rarr;
          </button>
        </div>

      </div>
    </div>
  );
};
