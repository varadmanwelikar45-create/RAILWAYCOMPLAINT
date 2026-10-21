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
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#183B3A] hover:text-[#0F766E] transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#0F766E]" />
          Back to {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E5F5EF] hover:bg-[#CCFBF1] text-[#0F766E] border border-[#A7E8D0] rounded-xl text-xs font-bold transition cursor-pointer print:hidden shadow-2xs"
            title="Print Grievance Acknowledgment Slip"
          >
            <FileText className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Print Official Slip</span>
          </button>

          {complaint.status === 'Pending' && (
            <span className="inline-flex items-center gap-2 text-xs font-bold text-[#C58B20] bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-[#C58B20] animate-pulse"></span>
              Status: Pending Review
            </span>
          )}
          {complaint.status === 'In Progress' && (
            <span className="inline-flex items-center gap-2 text-xs font-bold text-[#0F766E] bg-[#CCFBF1] px-3.5 py-1.5 rounded-xl border border-[#A7E8D0]">
              <span className="w-2 h-2 rounded-full bg-[#0F766E] animate-pulse"></span>
              Status: In Progress (Dispatched)
            </span>
          )}
          {complaint.status === 'Resolved' && (
            <span className="inline-flex items-center gap-2 text-xs font-bold text-[#16845B] bg-[#E5F5EF] px-3.5 py-1.5 rounded-xl border border-[#A7E8D0]">
              <span className="w-2 h-2 rounded-full bg-[#16845B]"></span>
              Status: Resolved
            </span>
          )}
        </div>
      </div>

      {/* Main Grievance Card */}
      <div className="bg-white rounded-3xl border border-[#D8EAE4] shadow-xs p-6 sm:p-8 space-y-6">
        
        {/* Header Info */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-6 border-b border-[#D8EAE4]">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#647773]">
              Grievance Tracking Number
            </div>
            <h1 className="text-3xl font-extrabold font-mono text-[#115E59] tracking-tight mt-0.5">
              {complaint.complaintId}
            </h1>
          </div>

          <div className="text-left sm:text-right text-xs text-[#647773]">
            <div>Submitted: <strong className="text-[#183B3A]">{complaint.createdAt}</strong></div>
            <div className="text-[11px] text-[#647773] mt-0.5">Last Synced: {complaint.updatedAt}</div>
          </div>
        </div>

        {/* Polished Multi-Stage Progress Timeline */}
        <div className="py-4 px-2">
          <div className="relative">
            {/* Background Line */}
            <div className="absolute top-5 left-8 right-8 h-1 bg-[#D8EAE4] rounded-full"></div>
            {/* Active Teal Line */}
            <div
              className="absolute top-5 left-8 h-1 bg-[#0F766E] rounded-full transition-all duration-500"
              style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : 'calc(100% - 4rem)' }}
            ></div>

            {/* Steps Grid */}
            <div className="relative flex justify-between items-center text-center">
              
              {/* Step 1: Submitted */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#0F766E] text-white flex items-center justify-center font-bold text-sm shadow-xs border-2 border-white">
                  ✓
                </div>
                <div className="text-xs font-bold text-[#115E59] mt-2">Submitted</div>
                <div className="text-[10px] text-[#647773]">{complaint.createdAt.slice(0, 10)}</div>
              </div>

              {/* Step 2: Under Review / In Progress */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-xs border-2 border-white transition-colors ${
                    step >= 2 ? 'bg-[#0F766E] text-white' : 'bg-[#E5F5EF] text-[#647773] border border-[#D8EAE4]'
                  }`}
                >
                  {step >= 2 ? '✓' : '2'}
                </div>
                <div className={`text-xs font-bold mt-2 ${step >= 2 ? 'text-[#115E59]' : 'text-[#647773]'}`}>
                  In Progress
                </div>
                <div className="text-[10px] text-[#647773]">
                  {step >= 2 ? 'Dispatched' : 'Awaiting Turn'}
                </div>
              </div>

              {/* Step 3: Resolved */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-xs border-2 border-white transition-colors ${
                    step >= 3 ? 'bg-[#16845B] text-white' : 'bg-[#E5F5EF] text-[#647773] border border-[#D8EAE4]'
                  }`}
                >
                  {step >= 3 ? '✓' : '3'}
                </div>
                <div className={`text-xs font-bold mt-2 ${step >= 3 ? 'text-[#16845B]' : 'text-[#647773]'}`}>
                  Resolved
                </div>
                <div className="text-[10px] text-[#647773]">
                  {step >= 3 ? 'Grievance Closed' : 'Pending Closure'}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Detailed Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#F4FBF8] p-5 rounded-2xl border border-[#D8EAE4] text-xs">
          
          <div className="space-y-1">
            <span className="text-[#647773] font-medium flex items-center gap-1.5">
              <Train className="w-3.5 h-3.5 text-[#0F766E]" /> Train Details:
            </span>
            <div className="font-bold text-[#115E59] text-sm">{complaint.trainNumber}</div>
            {complaint.pnrNumber && (
              <div className="text-[#647773]">PNR: <strong className="font-mono text-[#183B3A]">{complaint.pnrNumber}</strong></div>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[#647773] font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#0F766E]" /> Journey Date:
            </span>
            <div className="font-bold text-[#115E59] text-sm">{complaint.journeyDate}</div>
            {complaint.location && (
              <div className="text-[#647773]">Location: <strong className="text-[#183B3A]">{complaint.location}</strong></div>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[#647773] font-medium flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#0F766E]" /> Category:
            </span>
            <div className="font-bold text-[#115E59] text-sm">{complaint.category}</div>
          </div>

          <div className="space-y-1">
            <span className="text-[#647773] font-medium flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#0F766E]" /> Passenger:
            </span>
            <div className="font-bold text-[#115E59] text-sm">{complaint.passengerName}</div>
            <div className="text-[#647773]">{complaint.passengerEmail} · {complaint.passengerMobile}</div>
          </div>

        </div>

        {/* Subject & Description */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-[#647773] uppercase tracking-wider">
            Grievance Subject
          </div>
          <div className="text-base font-bold text-[#115E59]">
            {complaint.subject}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-bold text-[#647773] uppercase tracking-wider">
            Detailed Statement
          </div>
          <div className="p-4 rounded-2xl bg-[#F4FBF8] border border-[#D8EAE4] text-xs text-[#183B3A] leading-relaxed whitespace-pre-wrap">
            {complaint.description || 'No additional description provided.'}
          </div>
        </div>

        {/* Admin Action Section */}
        {isAdmin && (
          <div className="mt-6 pt-6 border-t border-[#D8EAE4] bg-[#E5F5EF]/60 p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#115E59]">
              <Shield className="w-4 h-4 text-[#0F766E]" />
              <span>Officer Status Update:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onUpdateStatus(complaint.complaintId, 'Pending')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                  complaint.status === 'Pending'
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'bg-white border border-[#D8EAE4] text-[#183B3A] hover:bg-[#E5F5EF]'
                }`}
              >
                Mark Pending
              </button>
              <button
                onClick={() => onUpdateStatus(complaint.complaintId, 'In Progress')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                  complaint.status === 'In Progress'
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'bg-white border border-[#D8EAE4] text-[#183B3A] hover:bg-[#CCFBF1]'
                }`}
              >
                Mark In Progress
              </button>
              <button
                onClick={() => onUpdateStatus(complaint.complaintId, 'Resolved')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                  complaint.status === 'Resolved'
                    ? 'bg-[#16845B] text-white shadow-xs'
                    : 'bg-white border border-[#D8EAE4] text-[#183B3A] hover:bg-[#E5F5EF]'
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
