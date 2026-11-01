import React, { useState, useEffect } from 'react';
import { Worker, ViewMode, WorkerServiceRequest, WorkerAvailabilityStatus } from '../types';
import { MutualGoogleMap } from './MutualGoogleMap';
import { 
  Briefcase, 
  Clock, 
  Check, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Compass, 
  ArrowRight, 
  Navigation,
  LocateFixed,
  Play,
  ArrowLeft,
  X,
  Camera,
  Upload,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface WorkerDashboardProps {
  currentWorker: Worker;
  requests?: WorkerServiceRequest[];
  workerRequests?: WorkerServiceRequest[];
  onAcceptRequest?: (requestId: string) => Promise<{ success: boolean; message: string }>;
  onRejectRequest?: (requestId: string, reason?: string) => Promise<{ success: boolean; message: string }> | any;
  onUpdateRequestStatus?: (
    requestId: string, 
    status: WorkerServiceRequest['status'], 
    notes?: string,
    proofData?: {
      beforePhotoUrl?: string;
      afterPhotoUrl?: string;
      resolutionProofUrl?: string;
      resolutionSummary?: string;
    }
  ) => Promise<{ success: boolean; message: string }> | any;
  onUpdateStatus?: (
    requestId: string, 
    status: WorkerServiceRequest['status'], 
    notes?: string,
    proofData?: any
  ) => Promise<{ success: boolean; message: string }> | any;
  onUpdateAvailability?: (availability: WorkerAvailabilityStatus) => Promise<any> | any;
  onNavigate: (view: ViewMode) => void;
  onRefreshData?: () => void;
  onWorkerLogout?: () => void;
  onBack?: () => void;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({
  currentWorker,
  requests,
  workerRequests: workerRequestsProp,
  onAcceptRequest,
  onRejectRequest,
  onUpdateRequestStatus,
  onUpdateStatus,
  onUpdateAvailability,
  onRefreshData,
  onWorkerLogout,
  onBack,
}) => {
  const workerRequests = requests || workerRequestsProp || [];
  const statusUpdateFn = onUpdateRequestStatus || onUpdateStatus;
  const [activeTab, setActiveTab] = useState<'current-job' | 'incoming-requests' | 'history' | 'feedback'>('current-job');
  const [completionNotes, setCompletionNotes] = useState('');
  const [beforePhotoUrl, setBeforePhotoUrl] = useState<string>('');
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Rejection modal
  const [rejectModalReq, setRejectModalReq] = useState<WorkerServiceRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Active Job
  const activeJob = workerRequests.find(
    (r) =>
      r.assignedWorkerId === currentWorker.id &&
      ['Worker Assigned', 'On the Way', 'Arrived at Station', 'Service In Progress'].includes(r.status)
  );

  // Incoming Requests for this worker
  const incomingRequests = workerRequests.filter((r) => {
    if (r.assignedWorkerId === currentWorker.id && ['Requested', 'Awaiting Worker Confirmation', 'Finding Worker'].includes(r.status)) {
      return true;
    }
    const isUnassigned = !r.assignedWorkerId && ['Requested', 'Awaiting Worker Confirmation', 'Finding Worker'].includes(r.status);
    const stationMatches =
      r.stationCode === currentWorker.stationCode ||
      (Array.isArray(currentWorker.stationCodes) && currentWorker.stationCodes.includes(r.stationCode));
    const categoryMatches =
      !r.serviceCategory ||
      r.serviceCategory.toLowerCase().includes(currentWorker.skillCategory.toLowerCase()) ||
      currentWorker.skillCategory.toLowerCase().includes(r.serviceCategory.toLowerCase());
    return isUnassigned && stationMatches && categoryMatches;
  });

  const completedJobs = workerRequests.filter(
    (r) => r.assignedWorkerId === currentWorker.id && r.status === 'Completed'
  );

  const allReviews = workerRequests
    .filter((r) => r.assignedWorkerId === currentWorker.id && r.feedback)
    .map((r) => r.feedback!);

  const averageRating = allReviews.length > 0
    ? (allReviews.reduce((acc, curr) => acc + (curr.rating || 5), 0) / allReviews.length).toFixed(1)
    : (currentWorker.rating || 5.0).toFixed(1);

  // Periodic polling
  useEffect(() => {
    const interval = setInterval(() => {
      onRefreshData?.();
    }, 5000);
    return () => clearInterval(interval);
  }, [onRefreshData]);

  useEffect(() => {
    if (!activeJob && activeTab === 'current-job' && incomingRequests.length > 0) {
      setActiveTab('incoming-requests');
    }
  }, [activeJob, incomingRequests.length, activeTab]);

  const handleToggleDuty = async () => {
    if (!onUpdateAvailability) return;
    const nextStatus = currentWorker.availability === 'Available' ? 'Unavailable' : 'Available';
    try {
      setActionLoading(true);
      await onUpdateAvailability(nextStatus);
    } finally {
      setActionLoading(false);
      onRefreshData?.();
    }
  };

  const handleAccept = async (requestId: string) => {
    if (!onAcceptRequest) return;
    try {
      setActionLoading(true);
      const res = await onAcceptRequest(requestId);
      if (res.success) {
        setActionNotice('Task accepted! Proceed to passenger coach.');
        setActiveTab('current-job');
      } else {
        setActionNotice(res.message);
      }
      setTimeout(() => setActionNotice(null), 4000);
    } finally {
      setActionLoading(false);
      onRefreshData?.();
    }
  };

  const handleReject = async (requestId: string) => {
    if (!onRejectRequest) return;
    try {
      setActionLoading(true);
      const res = await onRejectRequest(requestId, rejectReason || 'Worker unavailable');
      if (res.success) {
        setActionNotice(`Request declined.`);
        setRejectModalReq(null);
        setRejectReason('');
      } else {
        setActionNotice(res.message);
      }
      setTimeout(() => setActionNotice(null), 4000);
    } finally {
      setActionLoading(false);
      onRefreshData?.();
    }
  };

  const handleProgress = async (nextStatus: WorkerServiceRequest['status']) => {
    if (!activeJob || !statusUpdateFn) return;
    try {
      setActionLoading(true);
      const proofPayload = nextStatus === 'Completed' ? {
        beforePhotoUrl: beforePhotoUrl || activeJob.beforePhotoUrl,
        afterPhotoUrl: afterPhotoUrl || activeJob.afterPhotoUrl,
        resolutionProofUrl: afterPhotoUrl || beforePhotoUrl,
        resolutionSummary: completionNotes,
      } : undefined;

      const res = await statusUpdateFn(activeJob.requestId, nextStatus, completionNotes, proofPayload);
      if (res?.success) {
        setActionNotice(`Status updated to: ${nextStatus}`);
        if (nextStatus === 'Completed') {
          setCompletionNotes('');
          setBeforePhotoUrl('');
          setAfterPhotoUrl('');
          setActiveTab('history');
        }
      }
      setTimeout(() => setActionNotice(null), 4000);
    } finally {
      setActionLoading(false);
      onRefreshData?.();
    }
  };

  // Image Upload helper for before/after photos
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (type === 'before') setBeforePhotoUrl(reader.result);
          else setAfterPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const isVerified = currentWorker.verificationStatus === 'Verified';

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Top Header */}
      <div className="bg-white rounded-3xl border border-[#DDE4E6] p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DDE4E6] text-xs font-bold text-[#202A2B] hover:bg-[#F0F4F6] transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#B94A3A]" />
                <span>Back</span>
              </button>
            )}
            <span className="px-2.5 py-0.5 bg-[#D7F7FC] text-[#007D99] text-[10px] font-black rounded-full uppercase tracking-wider border border-[#00B8D9]/40">
              VYOM RATH GIG WORKER
            </span>
            <span className="text-xs text-[#526365] font-mono">
              ID: {currentWorker.workerId}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#202A2B] tracking-tight">
            {currentWorker.fullName}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[#526365]">
            <span className="font-semibold text-[#007D99]">{currentWorker.skillCategory}</span>
            <span>·</span>
            <span>Platform: <strong className="text-[#202A2B]">{currentWorker.stationName} ({currentWorker.stationCode})</strong></span>
            <span>·</span>
            <span className={`font-bold ${isVerified ? 'text-[#1E6B52]' : 'text-[#B94A3A]'}`}>
              {currentWorker.verificationStatus}
            </span>
          </div>
        </div>

        {/* Status Switcher & Logout */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[#F8FAFB] border border-[#DDE4E6] px-3 py-1.5 rounded-xl">
            <span className="text-xs font-bold text-[#526365]">Duty:</span>
            <button
              onClick={handleToggleDuty}
              disabled={actionLoading}
              className={`px-3 py-1 text-xs font-black rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                currentWorker.availability === 'Available'
                  ? 'bg-[#007D99] text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${currentWorker.availability === 'Available' ? 'bg-[#D7F7FC] animate-pulse' : 'bg-slate-400'}`}></span>
              <span>{currentWorker.availability}</span>
            </button>
          </div>

          {onWorkerLogout && (
            <button
              onClick={onWorkerLogout}
              className="px-3.5 py-2 border border-[#DDE4E6] hover:bg-[#FBE0E6] hover:text-[#92182D] text-xs font-bold text-[#526365] rounded-xl transition cursor-pointer"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 bg-[#DDF8EF] border border-[#65D6B0]/40 text-[#1E6B52] rounded-xl text-xs flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#3EA684]" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-500 hover:text-slate-900 cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* Immediate Officer Work Order Alert */}
      {activeJob && activeJob.status === 'Worker Assigned' && (
        <div className="p-4 bg-[#FFECC7] border-2 border-[#FFD68A] text-[#915900] rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#915900] text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#FFECC7]" />
            </div>
            <div>
              <div className="font-black text-sm text-[#202A2B]">
                🚨 Work Order Assigned by Railway Divisional Officer
              </div>
              <p className="text-xs text-[#704500] mt-0.5">
                Officer Control Room has dispatched you to <strong>Train {activeJob.trainNumber} (Coach {activeJob.coachNumber || 'B3'}, Berth {activeJob.seatNumber || '24'})</strong>. Please proceed to coach immediately.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleProgress('On the Way')}
            className="px-4 py-2 bg-[#202A2B] hover:bg-[#202A2B]/90 text-[#65D6B0] text-xs font-black rounded-xl transition flex items-center gap-2 cursor-pointer shrink-0 shadow-xs"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Acknowledge &amp; Start Walking</span>
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#DDE4E6] shadow-xs">
          <span className="text-[10px] text-[#526365] uppercase tracking-wider font-bold block">Assigned Station</span>
          <div className="text-xl font-black text-[#202A2B] mt-1 font-mono">
            {currentWorker.stationCode}
          </div>
          <span className="text-[11px] text-[#526365] truncate block mt-0.5">
            {currentWorker.stationName}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#DDE4E6] shadow-xs">
          <span className="text-[10px] text-[#526365] uppercase tracking-wider font-bold block">Pending Calls</span>
          <div className="text-xl font-black text-[#007D99] mt-1 font-mono">
            {incomingRequests.length}
          </div>
          <span className="text-[11px] text-[#526365] block mt-0.5">
            Awaiting Confirmation
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#DDE4E6] shadow-xs">
          <span className="text-[10px] text-[#526365] uppercase tracking-wider font-bold block">Completed Jobs</span>
          <div className="text-xl font-black text-[#1E6B52] mt-1 font-mono">
            {completedJobs.length}
          </div>
          <span className="text-[11px] text-[#526365] block mt-0.5">
            Verified Resolution
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#DDE4E6] shadow-xs">
          <span className="text-[10px] text-[#526365] uppercase tracking-wider font-bold block">Passenger Rating</span>
          <div className="text-xl font-black text-[#202A2B] mt-1 font-mono flex items-center gap-1">
            <Star className="w-5 h-5 text-[#EAB308] fill-current" />
            <span>{averageRating}</span>
          </div>
          <span className="text-[11px] text-[#526365] block mt-0.5">
            {allReviews.length} Reviews
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#DDE4E6] pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('current-job')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'current-job'
              ? 'bg-[#202A2B] text-white shadow-xs'
              : 'text-[#526365] hover:bg-[#F0F4F6]'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-[#65D6B0]" />
          <span>Active Assignment {activeJob ? '(1)' : '(0)'}</span>
        </button>

        <button
          onClick={() => setActiveTab('incoming-requests')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'incoming-requests'
              ? 'bg-[#007D99] text-white shadow-xs'
              : 'text-[#526365] hover:bg-[#F0F4F6]'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-[#D7F7FC]" />
          <span>Incoming Requests ({incomingRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-[#202A2B] text-white shadow-xs'
              : 'text-[#526365] hover:bg-[#F0F4F6]'
          }`}
        >
          <Check className="w-3.5 h-3.5 text-[#65D6B0]" />
          <span>Service History ({completedJobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'feedback'
              ? 'bg-[#202A2B] text-white shadow-xs'
              : 'text-[#526365] hover:bg-[#F0F4F6]'
          }`}
        >
          <Star className="w-3.5 h-3.5 text-[#EAB308]" />
          <span>Reviews ({allReviews.length})</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE CURRENT JOB */}
      {activeTab === 'current-job' && (
        <div className="space-y-4">
          {activeJob ? (
            <div className="bg-white rounded-3xl border border-[#DDE4E6] p-6 space-y-5 shadow-xs">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DDE4E6]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[#B94A3A]">
                      #{activeJob.requestId}
                    </span>
                    <span className="text-xs font-bold text-[#007D99] uppercase tracking-wider">
                      {activeJob.serviceCategory}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#202A2B]">
                    Train {activeJob.trainNumber} · Coach {activeJob.coachNumber || 'B3'} · Berth {activeJob.seatNumber || '24'}
                  </h2>
                  <p className="text-xs text-[#526365] mt-0.5">
                    Halt Station: <strong>{activeJob.stationName} ({activeJob.stationCode})</strong>
                  </p>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-[#D7F7FC] text-[#007D99] border border-[#00B8D9]/40 text-xs font-black uppercase">
                  Stage: {activeJob.status}
                </div>
              </div>

              {/* Passenger & Problem Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#F8FAFB] p-4 rounded-2xl border border-[#DDE4E6] text-xs">
                <div>
                  <h4 className="font-bold text-[#202A2B] uppercase tracking-wider mb-1.5">
                    Passenger Contact
                  </h4>
                  <div className="space-y-1 text-[#526365]">
                    <p>Name: <strong className="text-[#202A2B]">{activeJob.passengerName}</strong></p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#007D99]" />
                      <a href={`tel:${activeJob.passengerMobile}`} className="font-bold text-[#007D99] hover:underline">
                        {activeJob.passengerMobile}
                      </a>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-[#202A2B] uppercase tracking-wider mb-1.5">
                    Issue Details
                  </h4>
                  <p className="text-[#202A2B] leading-relaxed bg-white p-2.5 rounded-xl border border-[#DDE4E6]">
                    "{activeJob.description}"
                  </p>
                </div>
              </div>

              {/* Coach Guide */}
              <div className="p-3 bg-white rounded-xl border border-[#DDE4E6] space-y-1.5">
                <span className="text-[10px] font-bold text-[#526365] block uppercase">
                  Train Coach Layout Beacon (Proceed to highlighted coach):
                </span>
                <div className="flex items-center gap-1 overflow-x-auto py-1">
                  {['ENG', 'H1', 'A1', 'A2', 'B1', 'B2', 'B3', 'B4', 'S1', 'S2'].map((c) => {
                    const isTarget = c === 'B3' || activeJob.coachNumber?.includes(c);
                    return (
                      <div
                        key={c}
                        className={`px-2.5 py-1 rounded text-center font-mono text-[10px] shrink-0 font-bold ${
                          isTarget
                            ? 'bg-[#65D6B0] text-[#202A2B] ring-2 ring-[#202A2B] font-black'
                            : 'bg-[#F0F4F6] text-[#526365]'
                        }`}
                      >
                        {c}
                        {isTarget && ' 🎯'}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mutual Google Maps Real-Time Navigation View */}
              <div className="pt-2">
                <MutualGoogleMap
                  userRole="worker"
                  requestId={activeJob.requestId}
                  trainNumber={activeJob.trainNumber}
                  coachNumber={activeJob.coachNumber || 'B3'}
                  seatNumber={activeJob.seatNumber || 'Berth 24'}
                  stationName={activeJob.stationName || currentWorker.stationName}
                  stationCode={activeJob.stationCode || currentWorker.stationCode}
                  passengerName={activeJob.passengerName}
                  workerName={currentWorker.fullName}
                  workerSkill={currentWorker.skillCategory}
                  workerStatusText={activeJob.status}
                  passengerLocation={activeJob.passengerLocation}
                  workerLocation={activeJob.workerLocation}
                />
              </div>

              {/* Progress Flow & Evidence Upload */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-[#202A2B] uppercase tracking-wider">
                  Update Service Stage
                </h4>

                <div className="flex flex-wrap items-center gap-2.5">
                  {activeJob.status === 'Worker Assigned' && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleProgress('On the Way')}
                      className="px-4 py-2.5 bg-[#007D99] hover:bg-[#007D99]/90 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Mark: On the Way to Coach</span>
                    </button>
                  )}

                  {activeJob.status === 'On the Way' && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleProgress('Arrived at Station')}
                      className="px-4 py-2.5 bg-[#007D99] hover:bg-[#007D99]/90 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Mark: Reached Passenger Coach Door</span>
                    </button>
                  )}

                  {activeJob.status === 'Arrived at Station' && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleProgress('Service In Progress')}
                      className="px-4 py-2.5 bg-[#202A2B] hover:bg-[#202A2B]/90 text-[#65D6B0] text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Mark: Commencing Passenger Assistance</span>
                    </button>
                  )}

                  {/* Resolution & Photo Proof Section */}
                  {activeJob.status === 'Service In Progress' && (
                    <div className="w-full space-y-4 pt-2">
                      <div className="p-4 bg-[#DDF8EF]/40 border border-[#65D6B0]/40 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-[#3EA684]" />
                          <span className="text-xs font-black text-[#1E6B52]">
                            CAG Quality Audit: Before &amp; After Photo Proof
                          </span>
                        </div>
                        <p className="text-[11px] text-[#526365]">
                          Upload proof of completed repair/cleaning before closing the job. This directly satisfies railway audit accountability.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Before Photo */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-[#526365] block">
                              1. Before Photo (Optional)
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handlePhotoUpload(e, 'before')}
                              className="text-xs text-[#526365] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-[#F0F4F6] file:text-[#202A2B] hover:file:bg-slate-200 cursor-pointer"
                            />
                            {beforePhotoUrl && (
                              <img src={beforePhotoUrl} alt="Before" className="h-20 w-32 object-cover rounded-lg border mt-1" />
                            )}
                          </div>

                          {/* After Photo */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-[#1E6B52] block">
                              2. After Photo (Resolution Proof)
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handlePhotoUpload(e, 'after')}
                              className="text-xs text-[#526365] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-[#DDF8EF] file:text-[#1E6B52] hover:file:bg-[#65D6B0] cursor-pointer"
                            />
                            {afterPhotoUrl && (
                              <img src={afterPhotoUrl} alt="After" className="h-20 w-32 object-cover rounded-lg border-2 border-[#65D6B0] mt-1" />
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#202A2B] mb-1">
                            Resolution Action Taken
                          </label>
                          <textarea
                            rows={2}
                            value={completionNotes}
                            onChange={(e) => setCompletionNotes(e.target.value)}
                            placeholder="e.g. Cleaned berth washroom basin / Replaced MCB socket / Sealed pantry packet."
                            className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDE4E6] bg-white focus:outline-none focus:ring-2 focus:ring-[#007D99] text-[#202A2B]"
                          />
                        </div>
                      </div>

                      <button
                        disabled={actionLoading}
                        onClick={() => handleProgress('Completed')}
                        className="px-6 py-3 bg-[#1E6B52] hover:bg-[#1E6B52]/90 text-white text-xs font-black rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                      >
                        <Check className="w-4 h-4" />
                        <span>Complete Service Job &amp; Submit Proof</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#DDE4E6] p-10 text-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#D7F7FC] text-[#007D99] flex items-center justify-center mx-auto mb-3">
                <Briefcase className="w-6 h-6 text-[#007D99]" />
              </div>
              <h3 className="text-base font-bold text-[#202A2B]">No Active Job In Progress</h3>
              <p className="text-xs text-[#526365] max-w-md mx-auto mt-1 mb-4">
                You are currently free on platform at {currentWorker.stationName}. Check "Incoming Requests" to accept passenger calls.
              </p>
              <button
                onClick={() => setActiveTab('incoming-requests')}
                className="px-4 py-2 bg-[#007D99] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                View Incoming Requests ({incomingRequests.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INCOMING STATION REQUESTS */}
      {activeTab === 'incoming-requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#202A2B] uppercase tracking-wider">
              Pending Calls at {currentWorker.stationName} ({currentWorker.stationCode})
            </h3>
            <span className="text-xs text-[#526365]">
              Category: <strong className="text-[#007D99]">{currentWorker.skillCategory}</strong>
            </span>
          </div>

          {incomingRequests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#DDE4E6] p-10 text-center shadow-xs">
              <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-[#202A2B]">No Pending Calls</h4>
              <p className="text-xs text-[#526365] max-w-md mx-auto mt-1">
                New passenger calls at {currentWorker.stationName} will appear here live.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomingRequests.map((req) => (
                <div
                  key={req.requestId}
                  className="bg-white rounded-2xl border border-[#DDE4E6] p-5 space-y-3 shadow-xs hover:border-[#65D6B0] transition"
                >
                  <div className="flex items-center justify-between border-b border-[#DDE4E6] pb-2.5">
                    <span className="font-mono text-xs font-bold text-[#B94A3A]">
                      #{req.requestId}
                    </span>
                    <span className="text-[10px] font-bold bg-[#D7F7FC] text-[#007D99] px-2 py-0.5 rounded">
                      {req.serviceCategory}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <div>Train: <strong className="text-[#202A2B]">{req.trainNumber}</strong> · Coach: <strong className="text-[#202A2B]">{req.coachNumber || 'B3'}</strong></div>
                    <div>Passenger: <strong className="text-[#202A2B]">{req.passengerName}</strong></div>
                    <p className="text-[#526365] italic pt-1">"{req.description}"</p>
                  </div>

                  <div className="pt-2 border-t border-[#DDE4E6] flex items-center justify-between gap-2">
                    <button
                      onClick={() => setRejectModalReq(req)}
                      className="px-3 py-1.5 border border-[#DDE4E6] text-[#D72645] hover:bg-[#FBE0E6] text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleAccept(req.requestId)}
                      className="px-4 py-1.5 bg-[#202A2B] hover:bg-[#202A2B]/90 text-white text-xs font-black rounded-lg cursor-pointer"
                    >
                      Accept Task &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SERVICE HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedJobs.map((b) => (
              <div key={b.requestId} className="bg-white rounded-2xl border border-[#DDE4E6] p-4 shadow-xs space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-[#DDE4E6] pb-2">
                  <span className="font-mono font-bold text-[#1E6B52]">#{b.requestId}</span>
                  <span className="text-[10px] bg-[#DDF8EF] text-[#1E6B52] px-2 py-0.5 rounded font-bold">
                    Completed
                  </span>
                </div>
                <div>Train: <strong>{b.trainNumber}</strong> · Coach: <strong>{b.coachNumber || 'B3'}</strong></div>
                <p className="text-[#526365]">"{b.description}"</p>
                {b.resolutionSummary && (
                  <div className="p-2 bg-[#F8FAFB] rounded-lg border text-[11px]">
                    <strong>Action:</strong> {b.resolutionSummary}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REVIEWS */}
      {activeTab === 'feedback' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allReviews.map((r, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-[#DDE4E6] shadow-xs space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#202A2B]">{r.passengerName}</span>
                  <div className="flex items-center text-[#EAB308]">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-bold ml-1">{r.rating}/5</span>
                  </div>
                </div>
                {r.comment && <p className="text-[#526365]">"{r.comment}"</p>}
                {r.tags && r.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {r.tags.map((t, ti) => (
                      <span key={ti} className="text-[10px] bg-[#DDF8EF] text-[#1E6B52] px-2 py-0.5 rounded font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decline Reason Modal */}
      {rejectModalReq && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#DDE4E6]">
            <h3 className="text-base font-black text-[#202A2B]">Decline Assignment</h3>
            <p className="text-xs text-[#526365]">
              Please state why you are unable to take task #{rejectModalReq.requestId}.
            </p>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Attending another coach breakdown / Shift ended."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDE4E6] focus:outline-none focus:ring-2 focus:ring-[#B94A3A]"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setRejectModalReq(null)}
                className="flex-1 py-2 text-xs font-bold border border-[#DDE4E6] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(rejectModalReq.requestId)}
                className="flex-1 py-2 text-xs font-bold bg-[#D72645] text-white rounded-xl cursor-pointer"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
