import React from 'react';
import { Complaint, ComplaintStatus, User, ViewMode } from '../types';
import { 
  ArrowLeft, 
  Shield, 
  Train, 
  Calendar, 
  UserCheck, 
  FileText,
  Tag
} from 'lucide-react';

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
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <button
          onClick={() => onNavigate(isAdmin ? 'admin-dashboard' : 'user-dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-amber-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-amber-600" />
          Back to {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-amber-950 border border-yellow-300 rounded-xl text-xs font-bold transition cursor-pointer print:hidden shadow-sm"
            title="Print Grievance Acknowledgment Slip"
          >
            <FileText className="w-3.5 h-3.5 text-amber-700" />
            <span>Print Official Slip</span>
          </button>

          {complaint.status === 'Pending' && (
            <span className="inline-flex items-center gap-2 text-xs font-bold text-amber-900 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Status: Pending Review
            </span>
          )}
          {complaint.status === 'In Progress' && (
            <span className="inline-flex items-center gap-2 text-xs font-bold text-amber-950 bg-yellow-100 px-3.5 py-1.5 rounded-xl border border-yellow-300">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
              Status: In Progress (Dispatched)
            </span>
          )}
          {complaint.status === 'Resolved' && (
            <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              Status: Resolved
            </span>
          )}
        </div>
      </div>

      {/* Main Grievance Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Header Info */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-6 border-b border-slate-200">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Grievance Tracking Number
            </div>
            <h1 className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight mt-0.5">
              {complaint.complaintId}
            </h1>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-500">
            <div>Submitted: <strong className="text-slate-900">{complaint.createdAt}</strong></div>
            <div className="text-[11px] text-slate-500 mt-0.5">Last Synced: {complaint.updatedAt}</div>
          </div>
        </div>

        {/* Polished Multi-Stage Progress Timeline */}
        <div className="py-4 px-2">
          <div className="relative">
            {/* Background Line */}
            <div className="absolute top-5 left-8 right-8 h-1 bg-slate-200 rounded-full"></div>
            {/* Active Gold Line */}
            <div
              className="absolute top-5 left-8 h-1 bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : 'calc(100% - 4rem)' }}
            ></div>

            {/* Steps Grid */}
            <div className="relative flex justify-between items-center text-center">
              
              {/* Step 1: Submitted */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-sm border-2 border-white">
                  ✓
                </div>
                <div className="text-xs font-bold text-slate-900 mt-2">Submitted</div>
                <div className="text-[10px] text-slate-500">{complaint.createdAt.slice(0, 10)}</div>
              </div>

              {/* Step 2: Under Review / In Progress */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border-2 border-white transition-colors ${
                    step >= 2 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {step >= 2 ? '✓' : '2'}
                </div>
                <div className={`text-xs font-bold mt-2 ${step >= 2 ? 'text-slate-900' : 'text-slate-500'}`}>
                  In Progress
                </div>
                <div className="text-[10px] text-slate-500">
                  {step >= 2 ? 'Dispatched' : 'Awaiting Turn'}
                </div>
              </div>

              {/* Step 3: Resolved */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border-2 border-white transition-colors ${
                    step >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {step >= 3 ? '✓' : '3'}
                </div>
                <div className={`text-xs font-bold mt-2 ${step >= 3 ? 'text-emerald-700' : 'text-slate-500'}`}>
                  Resolved
                </div>
                <div className="text-[10px] text-slate-500">
                  {step >= 3 ? 'Grievance Closed' : 'Pending Closure'}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Detailed Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FFFDF5] p-5 rounded-2xl border border-amber-200/80 text-xs">
          
          <div className="space-y-1">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Train className="w-3.5 h-3.5 text-amber-600" /> Train Details:
            </span>
            <div className="font-bold text-slate-900 text-sm">{complaint.trainNumber}</div>
            {complaint.pnrNumber && (
              <div className="text-slate-500">PNR: <strong className="font-mono text-slate-900">{complaint.pnrNumber}</strong></div>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-600" /> Journey Date:
            </span>
            <div className="font-bold text-slate-900 text-sm">{complaint.journeyDate}</div>
            {complaint.location && (
              <div className="text-slate-500">Location: <strong className="text-slate-900">{complaint.location}</strong></div>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-600" /> Category:
            </span>
            <div className="font-bold text-slate-900 text-sm">{complaint.category}</div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-amber-600" /> Passenger:
            </span>
            <div className="font-bold text-slate-900 text-sm">{complaint.passengerName}</div>
            <div className="text-slate-500">{complaint.passengerEmail} · {complaint.passengerMobile}</div>
          </div>

        </div>

        {/* Subject & Description */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Grievance Subject
          </div>
          <div className="text-base font-bold text-slate-900">
            {complaint.subject}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Detailed Statement
          </div>
          <div className="p-4 rounded-2xl bg-[#FFFDF5] border border-amber-200/80 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
            {complaint.description || 'No additional description provided.'}
          </div>
        </div>

        {/* Admin Action Section */}
        {isAdmin && (
          <div className="mt-6 pt-6 border-t border-slate-200 bg-yellow-50/60 p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Shield className="w-4 h-4 text-amber-600" />
              <span>Officer Status Update:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onUpdateStatus(complaint.complaintId, 'Pending')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                  complaint.status === 'Pending'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-800 hover:bg-amber-50'
                }`}
              >
                Mark Pending
              </button>
              <button
                onClick={() => onUpdateStatus(complaint.complaintId, 'In Progress')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                  complaint.status === 'In Progress'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-800 hover:bg-yellow-100'
                }`}
              >
                Mark In Progress
              </button>
              <button
                onClick={() => onUpdateStatus(complaint.complaintId, 'Resolved')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                  complaint.status === 'Resolved'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-800 hover:bg-emerald-50'
                }`}
              >
                Mark Resolved
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
