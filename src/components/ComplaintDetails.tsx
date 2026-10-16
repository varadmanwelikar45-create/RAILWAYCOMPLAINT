import React from 'react';
import { Complaint, ComplaintStatus, User, ViewMode } from '../types';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  Train, 
  Calendar, 
  UserCheck, 
  MapPin, 
  FileText,
  Building2,
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
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#142B4A] hover:text-[#243F63] transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to {isAdmin ? 'Admin Dashboard' : 'My Grievances'}
        </button>

        <div className="flex items-center gap-2">
          {complaint.status === 'Pending' && (
            <span className="inline-flex items-center gap-2 text-xs font-bold text-[#9A6700] bg-[#FFF8E7] px-3.5 py-1.5 rounded-xl border border-[#E9B949]/40">
              <span className="w-2 h-2 rounded-full bg-[#D99520] animate-pulse"></span>
              Status: Pending Review
            </span>
          )}
          {complaint.status === 'In Progress' && (
            <span className="inline-flex items-center gap-2 text-xs font-bold text-[#1B4470] bg-[#EEF4FA] px-3.5 py-1.5 rounded-xl border border-[#315F91]/30">
              <span className="w-2 h-2 rounded-full bg-[#315F91] animate-pulse"></span>
              Status: In Progress (Dispatched)
            </span>
          )}
          {complaint.status === 'Resolved' && (
            <span className="inline-flex items-center gap-2 text-xs font-bold text-[#156140] bg-[#EDF7F2] px-3.5 py-1.5 rounded-xl border border-[#21865B]/30">
              <span className="w-2 h-2 rounded-full bg-[#21865B]"></span>
              Status: Resolved
            </span>
          )}
        </div>
      </div>

      {/* Main Grievance Card */}
      <div className="bg-white rounded-3xl border border-[#E8E2D3] shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Header Info */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-6 border-b border-[#E8E2D3]">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#6B7280]">
              Grievance Tracking Number
            </div>
            <h1 className="text-3xl font-extrabold font-mono text-[#142B4A] tracking-tight mt-0.5">
              {complaint.complaintId}
            </h1>
          </div>

          <div className="text-left sm:text-right text-xs text-[#6B7280]">
            <div>Submitted: <strong className="text-[#253247]">{complaint.createdAt}</strong></div>
            <div className="text-[11px] text-[#6B7280] mt-0.5">Last Synced: {complaint.updatedAt}</div>
          </div>
        </div>

        {/* Polished Multi-Stage Progress Timeline */}
        <div className="py-4 px-2">
          <div className="relative">
            {/* Background Line */}
            <div className="absolute top-5 left-8 right-8 h-1 bg-[#E8E2D3] rounded-full"></div>
            {/* Active Gold Line */}
            <div
              className="absolute top-5 left-8 h-1 bg-[#E9B949] rounded-full transition-all duration-500"
              style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : 'calc(100% - 4rem)' }}
            ></div>

            {/* Steps Grid */}
            <div className="relative flex justify-between items-center text-center">
              
              {/* Step 1: Submitted */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#142B4A] text-[#E9B949] flex items-center justify-center font-bold text-sm shadow-xs border-2 border-white">
                  ✓
                </div>
                <div className="text-xs font-bold text-[#142B4A] mt-2">Submitted</div>
                <div className="text-[10px] text-[#6B7280]">{complaint.createdAt.slice(0, 10)}</div>
              </div>

              {/* Step 2: Under Review / In Progress */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-xs border-2 border-white transition-colors ${
                    step >= 2 ? 'bg-[#142B4A] text-[#E9B949]' : 'bg-[#FFF5DC] text-[#6B7280] border border-[#E8E2D3]'
                  }`}
                >
                  {step >= 2 ? '✓' : '2'}
                </div>
                <div className={`text-xs font-bold mt-2 ${step >= 2 ? 'text-[#142B4A]' : 'text-[#6B7280]'}`}>
                  In Progress
                </div>
                <div className="text-[10px] text-[#6B7280]">
                  {step >= 2 ? 'Divisional Dispatch' : 'Awaiting Turn'}
                </div>
              </div>

              {/* Step 3: Resolved */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-xs border-2 border-white transition-colors ${
                    step >= 3 ? 'bg-[#21865B] text-white' : 'bg-[#FFF5DC] text-[#6B7280] border border-[#E8E2D3]'
                  }`}
                >
                  {step >= 3 ? '✓' : '3'}
                </div>
                <div className={`text-xs font-bold mt-2 ${step >= 3 ? 'text-[#21865B]' : 'text-[#6B7280]'}`}>
                  Resolved
                </div>
                <div className="text-[10px] text-[#6B7280]">
                  {step >= 3 ? 'Grievance Closed' : 'Pending Closure'}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Detailed Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FFFDF5] p-5 rounded-2xl border border-[#E8E2D3] text-xs">
          
          <div className="space-y-1">
            <span className="text-[#6B7280] font-medium flex items-center gap-1.5">
              <Train className="w-3.5 h-3.5 text-[#142B4A]" /> Train Details:
            </span>
            <div className="font-bold text-[#142B4A] text-sm">{complaint.trainNumber}</div>
            {complaint.pnrNumber && (
              <div className="text-[#6B7280]">PNR: <strong className="font-mono text-[#253247]">{complaint.pnrNumber}</strong></div>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[#6B7280] font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#142B4A]" /> Journey Date:
            </span>
            <div className="font-bold text-[#142B4A] text-sm">{complaint.journeyDate}</div>
            {complaint.location && (
              <div className="text-[#6B7280]">Location: <strong className="text-[#253247]">{complaint.location}</strong></div>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[#6B7280] font-medium flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#142B4A]" /> Category:
            </span>
            <div className="font-bold text-[#142B4A] text-sm">{complaint.category}</div>
          </div>

          <div className="space-y-1">
            <span className="text-[#6B7280] font-medium flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#142B4A]" /> Passenger:
            </span>
            <div className="font-bold text-[#142B4A] text-sm">{complaint.passengerName}</div>
            <div className="text-[#6B7280]">{complaint.passengerEmail} · {complaint.passengerMobile}</div>
          </div>

        </div>

        {/* Subject & Description */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
            Grievance Subject
          </div>
          <div className="text-base font-bold text-[#142B4A]">
            {complaint.subject}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
            Detailed Statement
          </div>
          <div className="p-4 rounded-2xl bg-[#FFFDF5] border border-[#E8E2D3] text-xs text-[#253247] leading-relaxed whitespace-pre-wrap">
            {complaint.description || 'No additional description provided.'}
          </div>
        </div>

        {/* Admin Action Section */}
        {isAdmin && (
          <div className="mt-6 pt-6 border-t border-[#E8E2D3] bg-[#FFF5DC]/50 p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#142B4A]">
              <Shield className="w-4 h-4 text-[#E9B949]" />
              <span>Officer Status Update:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onUpdateStatus(complaint.complaintId, 'Pending')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                  complaint.status === 'Pending'
                    ? 'bg-[#142B4A] text-white shadow-xs'
                    : 'bg-white border border-[#E8E2D3] text-[#253247] hover:bg-[#FFF5DC]'
                }`}
              >
                Mark Pending
              </button>
              <button
                onClick={() => onUpdateStatus(complaint.complaintId, 'In Progress')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                  complaint.status === 'In Progress'
                    ? 'bg-[#315F91] text-white shadow-xs'
                    : 'bg-white border border-[#E8E2D3] text-[#253247] hover:bg-[#EEF4FA]'
                }`}
              >
                Mark In Progress
              </button>
              <button
                onClick={() => onUpdateStatus(complaint.complaintId, 'Resolved')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                  complaint.status === 'Resolved'
                    ? 'bg-[#21865B] text-white shadow-xs'
                    : 'bg-white border border-[#E8E2D3] text-[#253247] hover:bg-[#EDF7F2]'
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
