import React from 'react';
import { Complaint, ComplaintStatus, User, ViewMode } from '../types';
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, Shield, Train, Calendar, UserCheck, MapPin } from 'lucide-react';

interface ComplaintDetailsProps {
  complaint: Complaint;
  currentUser: User | null;
  onUpdateStatus: (complaintId: string, newStatus: ComplaintStatus) => void;
  onNavigate: (view: ViewMode) => void;
}

export const ComplaintDetails: React.FC<ComplaintDetailsProps> = ({
  complaint,
  currentUser,
  onUpdateStatus,
  onNavigate,
}) => {
  const isAdmin = currentUser?.isAdmin || false;

  const getStepProgress = () => {
    if (complaint.status === 'Pending') return 1;
    if (complaint.status === 'In Progress') return 2;
    return 3;
  };

  const step = getStepProgress();

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <button
          onClick={() => onNavigate(isAdmin ? 'admin-dashboard' : 'user-dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#2563EB] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to {isAdmin ? 'Admin Dashboard' : 'My Complaints'}
        </button>

        <div className="flex items-center gap-2">
          {complaint.status === 'Pending' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Status: Pending Review
            </span>
          )}
          {complaint.status === 'In Progress' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-md border border-blue-200">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Status: In Progress
            </span>
          )}
          {complaint.status === 'Resolved' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              Status: Resolved
            </span>
          )}
        </div>
      </div>

      {/* Complaint Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs text-slate-500 font-medium">Grievance Tracking Number</div>
            <h1 className="text-2xl font-extrabold font-mono text-[#12304A]">
              {complaint.complaintId}
            </h1>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-700">{complaint.category}</div>
            <div className="text-[11px] text-slate-400">Filed {complaint.createdAt}</div>
          </div>
        </div>

        {/* 3-Step Visual Resolution Timeline */}
        <div className="pt-6 pb-2">
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-6">
            Resolution Lifecycle Progression
          </div>

          <div className="grid grid-cols-3 relative text-center">
            {/* Connecting line */}
            <div className="absolute top-4 left-[16%] right-[16%] h-1 bg-slate-200 -z-0">
              <div
                className="h-full bg-[#2563EB] transition-all duration-300"
                style={{
                  width: step === 1 ? '0%' : step === 2 ? '50%' : '100%',
                }}
              ></div>
            </div>

            {/* Step 1 */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition ${
                  step >= 1
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                1
              </div>
              <div className="text-xs font-bold text-[#12304A]">Registered</div>
              <div className="text-[10px] text-slate-400">Enqueued in FIFO Queue</div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition ${
                  step >= 2
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                2
              </div>
              <div
                className={`text-xs font-bold ${
                  step >= 2 ? 'text-[#12304A]' : 'text-slate-400'
                }`}
              >
                In Progress
              </div>
              <div className="text-[10px] text-slate-400">Divisional Dispatch</div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition ${
                  step === 3
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                3
              </div>
              <div
                className={`text-xs font-bold ${
                  step === 3 ? 'text-emerald-700' : 'text-slate-400'
                }`}
              >
                Resolved
              </div>
              <div className="text-[10px] text-slate-400">Grievance Closed</div>
            </div>

          </div>
        </div>

      </div>

      {/* Complaint Particulars */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        
        <div>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
            Journey & Passenger Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Passenger Name</span>
              <strong className="text-slate-800 text-sm font-semibold">{complaint.passengerName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Contact Details</span>
              <span className="text-slate-700">{complaint.passengerEmail}</span>
              {complaint.passengerMobile && <div className="text-slate-500">{complaint.passengerMobile}</div>}
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Train Info</span>
              <strong className="text-slate-800 font-semibold">{complaint.trainNumber}</strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Journey Date</span>
              <span className="text-slate-700">{complaint.journeyDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">PNR Number</span>
              <span className="text-slate-700 font-mono">{complaint.pnrNumber || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Coach & Berth / Location</span>
              <span className="text-slate-700">{complaint.location || 'Not specified'}</span>
            </div>
          </div>
        </div>

        {/* Subject & Description */}
        <div>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
            Subject: {complaint.subject}
          </h2>
          <div className="p-4 rounded-lg bg-white border border-slate-200 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
            {complaint.description}
          </div>
        </div>

        {/* Timestamps */}
        <div className="flex flex-wrap justify-between items-center text-xs text-slate-400 pt-3 border-t border-slate-100">
          <span>Submitted at: {complaint.createdAt}</span>
          <span>Last updated: {complaint.updatedAt}</span>
        </div>

        {/* Admin Status Override Action */}
        {isAdmin && (
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-[#12304A]" />
              <h3 className="text-xs font-bold text-[#12304A] uppercase tracking-wider">
                Administrator Status Override
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Change the status of this grievance. Updating status synchronizes the persistent SQLite database and adjusts the FIFO queue.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {(['Pending', 'In Progress', 'Resolved'] as ComplaintStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => onUpdateStatus(complaint.complaintId, st)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition ${
                    complaint.status === st
                      ? 'bg-[#12304A] text-white border-[#12304A]'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                  }`}
                >
                  Set to {st}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
