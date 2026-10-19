import React, { useState } from 'react';
import { Worker, WorkerServiceRequest, WorkerRequestStatus, WorkerAvailabilityStatus, ViewMode } from '../types';
import { 
  Briefcase, 
  MapPin, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Train, 
  Phone, 
  Mail, 
  LogOut, 
  Play, 
  Check, 
  FileText, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  User,
  Star
} from 'lucide-react';

interface WorkerDashboardProps {
  currentWorker: Worker;
  requests: WorkerServiceRequest[];
  onUpdateAvailability: (availability: WorkerAvailabilityStatus) => Promise<void> | void;
  onAcceptRequest: (requestId: string) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  onUpdateRequestStatus: (requestId: string, newStatus: WorkerRequestStatus, completionNotes?: string) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  onWorkerLogout: () => void;
  onNavigate: (view: ViewMode) => void;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({
  currentWorker,
  requests,
  onUpdateAvailability,
  onAcceptRequest,
  onUpdateRequestStatus,
  onWorkerLogout,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'active-job' | 'incoming-requests' | 'feedback' | 'history'>('active-job');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [completingId, setCompletingId] = useState<string | null>(null);

  // 1. Worker active job
  const activeJob = requests.find(
    (r) =>
      r.assignedWorkerId === currentWorker.id &&
      ['Worker Assigned', 'On the Way', 'Arrived at Station', 'Service In Progress'].includes(r.status)
  );

  // 2. Incoming requests for this worker's station and skill category
  const incomingRequests = requests.filter(
    (r) =>
      r.stationCode.toUpperCase() === currentWorker.stationCode.toUpperCase() &&
      r.serviceCategory === currentWorker.skillCategory &&
      (r.status === 'Requested' || r.status === 'Finding Worker') &&
      !r.assignedWorkerId
  );

  // 3. Completed requests by this worker
  const completedJobs = requests.filter(
    (r) => r.assignedWorkerId === currentWorker.id && r.status === 'Completed'
  );

  // 4. Passenger Feedbacks for this worker
  const requestFeedbacks = (requests || [])
    .filter((r) => r.assignedWorkerId === currentWorker.id && r.feedback)
    .map((r) => ({
      id: r.feedback!.id || Date.now(),
      requestId: r.requestId,
      trainNumber: r.trainNumber,
      coachNumber: r.coachNumber,
      passengerName: r.feedback!.passengerName || r.passengerName,
      rating: r.feedback!.rating,
      tags: r.feedback!.tags || [],
      comment: r.feedback!.comment,
      createdAt: r.feedback!.createdAt,
      stationName: r.stationName,
    }));

  const allReviews = [
    ...requestFeedbacks,
    ...((currentWorker.reviews || [])
      .filter((rev) => !requestFeedbacks.some((rf) => rf.requestId === rev.requestId))
      .map((rev) => ({
        ...rev,
        trainNumber: 'Assigned Duty',
        coachNumber: 'Coach',
        stationName: currentWorker.stationName,
      }))),
  ];

  const averageRating =
    allReviews.length > 0
      ? Math.round(
          (allReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / allReviews.length) * 10
        ) / 10
      : currentWorker.rating || 5.0;

  const handleAvailabilityChange = async (newAvail: WorkerAvailabilityStatus) => {
    setActionLoading(true);
    try {
      await onUpdateAvailability(newAvail);
      setActionNotice(`Your availability has been updated to "${newAvail}".`);
      setTimeout(() => setActionNotice(null), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    setActionLoading(true);
    try {
      const res = await onAcceptRequest(requestId);
      setActionNotice(res.message);
      if (res.success) {
        setActiveTab('active-job');
      }
      setTimeout(() => setActionNotice(null), 4000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleProgress = async (requestId: string, nextStatus: WorkerRequestStatus, notes?: string) => {
    setActionLoading(true);
    try {
      const res = await onUpdateRequestStatus(requestId, nextStatus, notes);
      setActionNotice(res.message);
      if (nextStatus === 'Completed') {
        setCompletingId(null);
        setCompletionNotes('');
        setActiveTab('history');
      }
      setTimeout(() => setActionNotice(null), 4000);
    } finally {
      setActionLoading(false);
    }
  };

  const isVerified = currentWorker.verificationStatus === 'Verified';

  return (
    <div className="space-y-8 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Worker Profile Header */}
      <div className="bg-white rounded-3xl border border-[#E8E2D3] p-6 sm:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#E9B949] text-[#142B4A] text-[10px] font-extrabold rounded-md tracking-wider uppercase">
              WORKER CONTROL DESK
            </span>
            <span className="text-xs text-[#6B7280] font-mono">
              ID: {currentWorker.workerId}
            </span>
            {isVerified ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#156140] bg-[#EDF7F2] border border-[#21865B]/30 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-[#21865B]" />
                Verified Worker
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-full">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                {currentWorker.verificationStatus}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] tracking-tight">
            {currentWorker.fullName}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B7280]">
            <span className="inline-flex items-center gap-1 font-semibold text-[#142B4A]">
              <Briefcase className="w-3.5 h-3.5 text-[#E9B949]" />
              {currentWorker.skillCategory}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#142B4A]" />
              {currentWorker.stationName} ({currentWorker.stationCode})
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 font-semibold text-[#142B4A]">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{averageRating} ★ ({allReviews.length} passenger reviews)</span>
            </span>
          </div>
        </div>

        {/* Right side: Availability Toggle & Logout */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Availability Switch */}
          <div className="bg-[#FFFDF5] p-1.5 rounded-2xl border border-[#E8E2D3] flex items-center justify-between gap-1 shadow-xs">
            <span className="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider px-2">
              Status:
            </span>
            <div className="flex gap-1">
              {(['Available', 'Busy', 'Unavailable'] as WorkerAvailabilityStatus[]).map((st) => (
                <button
                  key={st}
                  disabled={actionLoading || !isVerified}
                  onClick={() => handleAvailabilityChange(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    currentWorker.availability === st
                      ? st === 'Available'
                        ? 'bg-[#21865B] text-white shadow-xs'
                        : st === 'Busy'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-700 text-white shadow-xs'
                      : 'text-[#6B7280] hover:text-[#142B4A] hover:bg-slate-100'
                  } ${!isVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onWorkerLogout}
            className="px-4 py-2.5 bg-slate-100 hover:bg-red-50 text-[#6B7280] hover:text-red-700 rounded-xl transition text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-[#E8E2D3]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Action Notice Alert */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-[#EDF7F2] border border-[#21865B]/30 text-[#156140] text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#21865B] shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Unverified Warning Banner */}
      {!isVerified && (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-6 text-amber-900 text-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-sm">Account Pending Divisional Verification</h3>
              <p className="leading-relaxed text-amber-800">
                Your registration is currently under review by the Railway Divisional Administrator. While in <strong>{currentWorker.verificationStatus}</strong> status, you cannot accept live passenger service requests or switch to active dispatch. Please check back after administrative approval.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl border border-[#E8E2D3] p-5 shadow-xs">
          <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Active Job</div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#142B4A] mt-1">
            {activeJob ? activeJob.requestId : 'None'}
          </div>
          <p className="text-[11px] text-[#6B7280] mt-1 truncate">
            {activeJob ? `${activeJob.status} · Tr: ${activeJob.trainNumber}` : 'Ready for dispatch'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E2D3] p-5 shadow-xs">
          <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Station Requests</div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#142B4A] mt-1 font-mono">
            {incomingRequests.length}
          </div>
          <p className="text-[11px] text-[#6B7280] mt-1">Waiting at {currentWorker.stationCode}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E2D3] p-5 shadow-xs">
          <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Completed Jobs</div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#142B4A] mt-1 font-mono">
            {currentWorker.totalJobsCompleted || completedJobs.length}
          </div>
          <p className="text-[11px] text-[#21865B] mt-1 font-semibold">Verified assistance delivered</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E2D3] p-5 shadow-xs">
          <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Passenger Rating</div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-1 flex items-center gap-1">
            <span>{averageRating}</span>
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-[11px] text-[#6B7280] mt-1 truncate">
            {allReviews.length} passenger reviews
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#E8E2D3] gap-2">
        <button
          onClick={() => setActiveTab('active-job')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'active-job'
              ? 'border-[#142B4A] text-[#142B4A]'
              : 'border-transparent text-[#6B7280] hover:text-[#142B4A]'
          }`}
        >
          <Play className="w-4 h-4 text-[#E9B949]" />
          <span>Active Assignment {activeJob ? '(1)' : '(0)'}</span>
        </button>

        <button
          onClick={() => setActiveTab('incoming-requests')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'incoming-requests'
              ? 'border-[#142B4A] text-[#142B4A]'
              : 'border-transparent text-[#6B7280] hover:text-[#142B4A]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#E9B949]" />
          <span>Incoming Station Requests ({incomingRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'feedback'
              ? 'border-[#142B4A] text-[#142B4A]'
              : 'border-transparent text-[#6B7280] hover:text-[#142B4A]'
          }`}
        >
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>Passenger Reviews ({allReviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-[#142B4A] text-[#142B4A]'
              : 'border-transparent text-[#6B7280] hover:text-[#142B4A]'
          }`}
        >
          <FileText className="w-4 h-4 text-[#E9B949]" />
          <span>Service History ({completedJobs.length})</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE JOB */}
      {activeTab === 'active-job' && (
        <div>
          {activeJob ? (
            <div className="bg-white rounded-3xl border border-[#E8E2D3] p-6 sm:p-8 shadow-xs space-y-6">
              
              {/* Job Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#E8E2D3]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 bg-[#142B4A] text-white text-[10px] font-mono font-bold rounded-md">
                      {activeJob.requestId}
                    </span>
                    <span className="text-xs font-bold text-[#E9B949] uppercase tracking-wider">
                      {activeJob.serviceCategory}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#142B4A]">
                    Train {activeJob.trainNumber} · Coach {activeJob.coachNumber || 'General'} · Seat {activeJob.seatNumber || 'N/A'}
                  </h2>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Meeting Station: <strong>{activeJob.stationName} ({activeJob.stationCode})</strong>
                    {activeJob.expectedArrivalTime && ` · Expected Arrival: ${activeJob.expectedArrivalTime}`}
                  </p>
                </div>

                <div className="px-3.5 py-1.5 rounded-xl bg-[#FFF5DC] text-[#142B4A] border border-[#E9B949]/50 text-xs font-extrabold uppercase tracking-wide">
                  Stage: {activeJob.status}
                </div>
              </div>

              {/* Passenger & Problem Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FFFDF5] p-5 rounded-2xl border border-[#E8E2D3]">
                <div>
                  <h4 className="text-xs font-bold text-[#142B4A] uppercase tracking-wider mb-2">
                    Passenger Contact Information
                  </h4>
                  <div className="space-y-1 text-xs text-[#253247]">
                    <p>Name: <strong>{activeJob.passengerName}</strong></p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#142B4A]" />
                      <span>{activeJob.passengerMobile}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#142B4A]" />
                      <span>{activeJob.passengerEmail}</span>
                    </p>
                    {activeJob.relatedComplaintId && (
                      <p className="pt-1 text-[11px] text-[#6B7280]">
                        Linked Grievance Ticket: <strong className="text-[#142B4A]">#{activeJob.relatedComplaintId}</strong>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#142B4A] uppercase tracking-wider mb-2">
                    Assistance Description
                  </h4>
                  <p className="text-xs text-[#253247] leading-relaxed bg-white p-3 rounded-xl border border-[#E8E2D3]">
                    "{activeJob.description}"
                  </p>
                </div>
              </div>

              {/* Step-by-Step Execution Lifecycle */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#142B4A] uppercase tracking-wider">
                  Update Service Progression
                </h4>

                <div className="flex flex-wrap items-center gap-3">
                  {activeJob.status === 'Worker Assigned' && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleProgress(activeJob.requestId, 'On the Way')}
                      className="px-5 py-2.5 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer border border-[#142B4A]"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-[#E9B949]" />
                      <span>Mark: On the Way to Station Platform</span>
                    </button>
                  )}

                  {activeJob.status === 'On the Way' && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleProgress(activeJob.requestId, 'Arrived at Station')}
                      className="px-5 py-2.5 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer border border-[#142B4A]"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#E9B949]" />
                      <span>Mark: Arrived at Platform & Train Coach</span>
                    </button>
                  )}

                  {activeJob.status === 'Arrived at Station' && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleProgress(activeJob.requestId, 'Service In Progress')}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Mark: Commencing Passenger Assistance</span>
                    </button>
                  )}

                  {activeJob.status === 'Service In Progress' && (
                    <div className="w-full space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-[#142B4A] mb-1">
                          Resolution & Work Summary Notes
                        </label>
                        <textarea
                          rows={2}
                          value={completionNotes}
                          onChange={(e) => setCompletionNotes(e.target.value)}
                          placeholder="e.g. Fixed faulty coach MCB breaker switch; power restored to berth 42. Verified tap pressure restored in toilet."
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E2D3] bg-[#FFFDF5] focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                        />
                      </div>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleProgress(activeJob.requestId, 'Completed', completionNotes)}
                        className="px-6 py-2.5 bg-[#21865B] hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Complete Service Job & Release Availability</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#E8E2D3] p-12 text-center shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF5DC] text-[#142B4A] flex items-center justify-center mx-auto mb-4 border border-[#E9B949]/30">
                <Briefcase className="w-7 h-7 text-[#142B4A]" />
              </div>
              <h3 className="text-lg font-bold text-[#142B4A]">No Active Service Job Assigned</h3>
              <p className="text-xs text-[#6B7280] max-w-md mx-auto mt-1 mb-6">
                You are currently free. Check the "Incoming Station Requests" tab below to accept passenger assistance calls at {currentWorker.stationName}.
              </p>
              <button
                onClick={() => setActiveTab('incoming-requests')}
                className="px-5 py-2.5 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                View Available Requests ({incomingRequests.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INCOMING STATION REQUESTS */}
      {activeTab === 'incoming-requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#142B4A] uppercase tracking-wider">
              Service Requests at {currentWorker.stationName} ({currentWorker.stationCode})
            </h3>
            <span className="text-xs text-[#6B7280]">
              Skill Match: <strong className="text-[#142B4A]">{currentWorker.skillCategory}</strong>
            </span>
          </div>

          {incomingRequests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E8E2D3] p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#6B7280] flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-[#142B4A]">No Pending Requests at This Station</h4>
              <p className="text-xs text-[#6B7280] max-w-md mx-auto mt-1">
                New passenger requests matching your skill category will appear here in real-time when passengers book assistance approaching {currentWorker.stationName}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border border-[#E8E2D3] p-5 shadow-xs hover:border-[#142B4A] transition space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 bg-[#142B4A] text-white font-mono font-bold rounded text-[11px]">
                        {req.requestId}
                      </span>
                      <span className="text-[11px] text-[#6B7280]">
                        Filed: {req.createdAt.slice(11, 16)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Train className="w-4 h-4 text-[#E9B949]" />
                      <h4 className="font-extrabold text-sm text-[#142B4A]">
                        Train {req.trainNumber} {req.trainName ? `(${req.trainName})` : ''}
                      </h4>
                    </div>

                    <div className="text-xs text-[#253247] space-y-1 bg-[#FFFDF5] p-3 rounded-xl border border-[#E8E2D3]">
                      <p>Station: <strong>{req.stationName}</strong></p>
                      <p>Coach & Seat: <strong>{req.coachNumber || 'Coach N/A'}, Seat: {req.seatNumber || 'N/A'}</strong></p>
                      {req.expectedArrivalTime && (
                        <p>Expected Arrival: <strong className="text-amber-800">{req.expectedArrivalTime}</strong></p>
                      )}
                      <p className="pt-1 text-[#6B7280]">
                        "{req.description}"
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={actionLoading || !isVerified || currentWorker.availability !== 'Available' || Boolean(activeJob)}
                    onClick={() => handleAccept(req.requestId)}
                    className={`w-full py-2.5 px-4 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                      !isVerified || currentWorker.availability !== 'Available' || Boolean(activeJob)
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    <Check className="w-4 h-4 text-[#E9B949]" />
                    <span>Accept Service Request</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PASSENGER FEEDBACK & REVIEWS */}
      {activeTab === 'feedback' && (
        <div className="bg-white rounded-3xl border border-[#E8E2D3] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#E8E2D3]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-[#FFF5DC] text-[#142B4A] text-[10px] font-extrabold uppercase rounded border border-[#E9B949]/50">
                  REAL-TIME PASSENGER RATINGS
                </span>
                <span className="text-xs text-[#6B7280]">Station On-Duty Verification</span>
              </div>
              <h3 className="text-xl font-extrabold text-[#142B4A]">
                Passenger Reviews & Feedback
              </h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Ratings and reviews submitted directly by passengers after coach technician & sahayak assistance.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-[#FFFDF5] border border-[#E9B949]/50 px-4 py-2.5 rounded-2xl shadow-2xs">
              <div className="text-right">
                <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                  Overall Score
                </div>
                <div className="text-xs text-[#21865B] font-semibold">
                  100% Verified
                </div>
              </div>
              <div className="flex items-center gap-1 text-2xl font-extrabold text-amber-600 font-mono">
                <span>{averageRating}</span>
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
            </div>
          </div>

          {allReviews.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF5DC] text-[#142B4A] flex items-center justify-center mx-auto border border-[#E9B949]/30">
                <Star className="w-7 h-7 text-[#E9B949]" />
              </div>
              <h4 className="font-bold text-base text-[#142B4A]">No Passenger Reviews Yet</h4>
              <p className="text-xs text-[#6B7280] max-w-md mx-auto">
                When you complete assistance for passengers and they submit their feedback on their mobile devices, their ratings, tags, and reviews will show up here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {allReviews.map((rev, idx) => (
                <div
                  key={rev.id || idx}
                  className="rounded-2xl border border-[#E8E2D3] bg-[#FFFDF5] p-5 space-y-3 shadow-2xs hover:border-[#142B4A]/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#142B4A] text-[#E9B949] flex items-center justify-center font-bold text-xs">
                        {rev.passengerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-extrabold text-sm text-[#142B4A]">
                          {rev.passengerName}
                        </span>
                        <div className="text-[11px] text-[#6B7280]">
                          {rev.trainNumber} · {rev.coachNumber} · {rev.stationName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= rev.rating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-extrabold text-[#142B4A] ml-1">
                        {rev.rating}/5
                      </span>
                    </div>
                  </div>

                  {rev.tags && rev.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {rev.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="text-[10px] font-bold bg-white text-[#142B4A] border border-[#E8E2D3] px-2.5 py-0.5 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {rev.comment && (
                    <p className="text-xs text-[#253247] italic bg-white p-3 rounded-xl border border-[#E8E2D3] leading-relaxed">
                      "{rev.comment}"
                    </p>
                  )}

                  <div className="text-[10px] text-[#6B7280]">
                    Recorded on {rev.createdAt}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SERVICE HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-[#E8E2D3] p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#142B4A] uppercase tracking-wider">
              Completed Service Deliveries
            </h3>
            <span className="text-xs text-[#6B7280]">
              Total Recorded: <strong className="text-[#142B4A]">{completedJobs.length}</strong>
            </span>
          </div>

          {completedJobs.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#6B7280]">
              No completed jobs in current session. Active and completed jobs will be recorded here with timestamps.
            </div>
          ) : (
            <div className="divide-y divide-[#E8E2D3]">
              {completedJobs.map((job) => (
                <div key={job.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#142B4A]">{job.requestId}</span>
                      <span className="font-semibold text-[#253247]">Train {job.trainNumber}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#156140] text-[10px] font-bold border border-emerald-200">
                        Completed
                      </span>
                    </div>
                    <p className="text-[#6B7280]">
                      Passenger: {job.passengerName} · {job.stationName} · Coach: {job.coachNumber || 'N/A'}, Seat: {job.seatNumber || 'N/A'}
                    </p>
                    {job.completionNotes && (
                      <p className="text-[11px] text-[#253247] italic">
                        Resolution: "{job.completionNotes}"
                      </p>
                    )}
                    {job.feedback && (
                      <div className="inline-flex items-center gap-1.5 bg-[#FFF5DC] border border-[#E9B949]/50 px-2.5 py-1 rounded-lg text-[11px] text-[#142B4A]">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="font-bold">{job.feedback.rating}/5</span>
                        {job.feedback.comment && (
                          <span className="italic truncate max-w-xs">"{job.feedback.comment}"</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-right text-[11px] text-[#6B7280]">
                    Completed at: {job.completedAt || job.updatedAt}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
