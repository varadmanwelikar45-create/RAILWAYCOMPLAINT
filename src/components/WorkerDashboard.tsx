import React, { useState, useEffect } from 'react';
import { Worker, WorkerServiceRequest, WorkerRequestStatus, WorkerAvailabilityStatus, ViewMode } from '../types';
import { 
  Briefcase, 
  MapPin, 
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
  User,
  Star,
  ArrowLeft,
  Navigation,
  Compass,
  Radio,
  LocateFixed,
  Send
} from 'lucide-react';

interface WorkerDashboardProps {
  currentWorker: Worker;
  requests: WorkerServiceRequest[];
  onUpdateAvailability: (availability: WorkerAvailabilityStatus) => Promise<void> | void;
  onAcceptRequest: (requestId: string) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  onUpdateRequestStatus: (requestId: string, newStatus: WorkerRequestStatus, completionNotes?: string) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  onWorkerLogout: () => void;
  onNavigate: (view: ViewMode) => void;
  onBack?: () => void;
  onRefreshData?: () => void;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({
  currentWorker,
  requests,
  onUpdateAvailability,
  onAcceptRequest,
  onUpdateRequestStatus,
  onWorkerLogout,
  onNavigate,
  onBack,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'active-job' | 'incoming-requests' | 'feedback' | 'history'>('active-job');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  // Location sharing state for worker
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [workerStatusText, setWorkerStatusText] = useState('Walking along platform towards coach');
  const [workerPlatform, setWorkerPlatform] = useState('Platform 2');

  // Auto-refresh data every 5 seconds for live sync
  useEffect(() => {
    const interval = setInterval(() => {
      onRefreshData?.();
    }, 5000);
    return () => clearInterval(interval);
  }, [onRefreshData]);

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
        setCompletionNotes('');
        setActiveTab('history');
      }
      setTimeout(() => setActionNotice(null), 4000);
    } finally {
      setActionLoading(false);
    }
  };

  // Worker shares location with passenger
  const handleShareWorkerLocation = async (customStatus?: string) => {
    if (!activeJob) return;
    setIsUpdatingLocation(true);

    const statusTextToSend = customStatus || workerStatusText;

    const sendCoords = async (lat: number, lng: number) => {
      try {
        const res = await fetch(`/api/worker-requests/${activeJob.requestId}/location`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'worker',
            latitude: lat,
            longitude: lng,
            platform: workerPlatform,
            currentStatusText: statusTextToSend,
          }),
        });
        if (res.ok) {
          setActionNotice(`Live location updated: "${statusTextToSend}". Passenger can see your progress.`);
          onRefreshData?.();
          setTimeout(() => setActionNotice(null), 4000);
        }
      } catch (err) {
        setActionNotice('Location coordinates updated.');
        setTimeout(() => setActionNotice(null), 3000);
      } finally {
        setIsUpdatingLocation(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => sendCoords(pos.coords.latitude, pos.coords.longitude),
        () => sendCoords(28.6431, 77.2197),
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      sendCoords(28.6431, 77.2197);
    }
  };

  const isVerified = currentWorker.verificationStatus === 'Verified';

  return (
    <div className="space-y-8 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Top Header with Back Navigation */}
      <div className="bg-white rounded-3xl border border-[#E8E2D3] p-6 sm:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E2D3] text-xs font-bold text-[#142B4A] hover:bg-[#FFF5DC] transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
            <span className="px-2.5 py-0.5 bg-[#E9B949] text-[#142B4A] text-[10px] font-extrabold rounded-md tracking-wider uppercase">
              WORKER CONTROL DESK
            </span>
            <span className="text-xs text-[#6B7280] font-mono">
              ID: {currentWorker.workerId}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] tracking-tight">
            {currentWorker.fullName}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
            <span className="font-semibold text-[#142B4A]">{currentWorker.skillCategory}</span>
            <span>·</span>
            <span>Station: <strong className="text-[#253247]">{currentWorker.stationName} ({currentWorker.stationCode})</strong></span>
            <span>·</span>
            <span className={`font-bold ${isVerified ? 'text-[#21865B]' : 'text-amber-700'}`}>
              {currentWorker.verificationStatus}
            </span>
          </div>
        </div>

        {/* Status Switcher & Logout */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="bg-[#FFFDF5] p-1.5 rounded-2xl border border-[#E8E2D3] flex items-center justify-between gap-1 shadow-2xs">
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl border border-[#E8E2D3] p-5 shadow-xs">
          <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Active Job</div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#142B4A] mt-1 font-mono">
            {activeJob ? activeJob.requestId : 'None'}
          </div>
          <p className="text-[11px] text-[#6B7280] mt-1 truncate">
            {activeJob ? `${activeJob.status} · Train ${activeJob.trainNumber}` : 'Ready for assignment'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E2D3] p-5 shadow-xs">
          <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Station Requests</div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#142B4A] mt-1 font-mono">
            {incomingRequests.length}
          </div>
          <p className="text-[11px] text-[#6B7280] mt-1">Pending at {currentWorker.stationCode}</p>
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
          <div className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-1 flex items-center gap-1 font-mono">
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
          <span>Incoming Requests ({incomingRequests.length})</span>
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

      {/* TAB 1: ACTIVE JOB WITH MUTUAL LOCATION ACCESS */}
      {activeTab === 'active-job' && (
        <div>
          {activeJob ? (
            <div className="bg-white rounded-3xl border border-[#E8E2D3] p-6 sm:p-8 shadow-xs space-y-6">
              
              {/* Job Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#E8E2D3]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 bg-[#142B4A] text-white text-[10px] font-mono font-bold rounded-md">
                      #{activeJob.requestId}
                    </span>
                    <span className="text-xs font-bold text-[#E9B949] uppercase tracking-wider">
                      {activeJob.serviceCategory}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#142B4A]">
                    Train {activeJob.trainNumber} · Coach {activeJob.coachNumber || 'B3'} · Seat {activeJob.seatNumber || 'Berth 24'}
                  </h2>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Station: <strong>{activeJob.stationName} ({activeJob.stationCode})</strong>
                    {activeJob.expectedArrivalTime && ` · Expected Arrival: ${activeJob.expectedArrivalTime}`}
                  </p>
                </div>

                <div className="px-3.5 py-1.5 rounded-xl bg-[#FFF5DC] text-[#142B4A] border border-[#E9B949]/50 text-xs font-extrabold uppercase tracking-wide">
                  Stage: {activeJob.status}
                </div>
              </div>

              {/* ========================================================================= */}
              {/* MUTUAL LOCATION ACCESS SECTION FOR WORKER                                 */}
              {/* ========================================================================= */}
              <div className="bg-gradient-to-b from-[#FFFDF5] to-[#FFF5DC]/40 rounded-2xl border-2 border-[#142B4A]/15 p-5 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D3]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#142B4A] text-[#E9B949] flex items-center justify-center">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#142B4A]">Passenger Location &amp; Coach Navigation</h3>
                      <p className="text-[10px] text-[#6B7280]">Live mutual tracking for meeting passenger at platform</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-lg border border-emerald-200 inline-flex items-center gap-1.5 self-start sm:self-auto">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#21865B] animate-pulse"></span>
                    Mutual GPS Tracking Active
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left: Passenger Exact Coordinates & Coach Guide */}
                  <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-[#E8E2D3] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#142B4A] flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>Passenger Position:</span>
                      </span>
                      <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {activeJob.passengerLocation?.platform || 'Platform 2'} · {activeJob.coachNumber || 'Coach B3'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-[#6B7280] block font-semibold">Coach</span>
                        <strong className="text-[#142B4A] text-sm">{activeJob.coachNumber || 'B3'}</strong>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-[#6B7280] block font-semibold">Seat / Berth</span>
                        <strong className="text-[#142B4A] text-sm">{activeJob.seatNumber || 'Berth 24'}</strong>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-[#6B7280] block font-semibold">Platform</span>
                        <strong className="text-[#142B4A] text-sm">{activeJob.passengerLocation?.platform || 'Platform 2'}</strong>
                      </div>
                    </div>

                    {/* Interactive Coach Map */}
                    <div className="pt-2">
                      <span className="text-[10px] text-[#6B7280] font-bold block mb-1">
                        Train Coach Guide (Head to highlighted coach):
                      </span>
                      <div className="flex items-center gap-1 overflow-x-auto py-1">
                        {['ENG', 'H1', 'A1', 'A2', 'B1', 'B2', 'B3', 'B4', 'S1', 'S2'].map((c) => {
                          const isTarget = c === 'B3' || activeJob.coachNumber?.includes(c);
                          return (
                            <div
                              key={c}
                              className={`px-2 py-1 rounded text-center font-mono text-[9px] shrink-0 font-bold ${
                                isTarget
                                  ? 'bg-[#142B4A] text-[#E9B949] ring-2 ring-[#E9B949] animate-pulse'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {c}
                              {isTarget && ' 🎯'}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right: Worker Share Location Panel */}
                  <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-[#E8E2D3] space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#142B4A] flex items-center gap-1.5 mb-2">
                        <Navigation className="w-4 h-4 text-emerald-600" />
                        <span>Share Your Progress with Passenger:</span>
                      </span>

                      <div className="space-y-2">
                        <select
                          value={workerStatusText}
                          onChange={(e) => setWorkerStatusText(e.target.value)}
                          className="w-full text-xs p-2 bg-[#FFFDF5] border border-[#E8E2D3] rounded-lg text-[#142B4A] font-semibold"
                        >
                          <option value="Walking along platform towards coach">Walking along platform towards coach</option>
                          <option value="Reached train coach door">Reached train coach door</option>
                          <option value="Boarded coach - entering cabin">Boarded coach - entering cabin</option>
                          <option value="At passenger berth ready for service">At passenger berth ready for service</option>
                        </select>

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleShareWorkerLocation('At coach door')}
                            className="p-1.5 bg-slate-100 hover:bg-[#FFF5DC] text-[10px] font-bold text-[#142B4A] rounded-lg border border-[#E8E2D3] transition"
                          >
                            At Coach Door
                          </button>
                          <button
                            type="button"
                            onClick={() => handleShareWorkerLocation('At passenger berth')}
                            className="p-1.5 bg-slate-100 hover:bg-[#FFF5DC] text-[10px] font-bold text-[#142B4A] rounded-lg border border-[#E8E2D3] transition"
                          >
                            At Berth
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isUpdatingLocation}
                      onClick={() => handleShareWorkerLocation()}
                      className="w-full py-2 px-3 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs mt-2 disabled:opacity-60"
                    >
                      <LocateFixed className={`w-3.5 h-3.5 text-[#E9B949] ${isUpdatingLocation ? 'animate-spin' : ''}`} />
                      <span>{isUpdatingLocation ? 'Broadcasting...' : 'Update Live Location & Status'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Passenger & Problem Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FFFDF5] p-5 rounded-2xl border border-[#E8E2D3]">
                <div>
                  <h4 className="text-xs font-bold text-[#142B4A] uppercase tracking-wider mb-2">
                    Passenger Contact
                  </h4>
                  <div className="space-y-1.5 text-xs text-[#253247]">
                    <p>Name: <strong>{activeJob.passengerName}</strong></p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#142B4A]" />
                      <a href={`tel:${activeJob.passengerMobile}`} className="font-bold text-[#142B4A] hover:underline">
                        {activeJob.passengerMobile}
                      </a>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#142B4A]" />
                      <span>{activeJob.passengerEmail}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#142B4A] uppercase tracking-wider mb-2">
                    Service Description
                  </h4>
                  <p className="text-xs text-[#253247] leading-relaxed bg-white p-3 rounded-xl border border-[#E8E2D3]">
                    "{activeJob.description}"
                  </p>
                </div>
              </div>

              {/* Step-by-Step Execution Lifecycle */}
              <div className="space-y-3 pt-2">
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
                      <span>Mark: Arrived at Platform &amp; Train Coach</span>
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
                          Resolution Summary Notes
                        </label>
                        <textarea
                          rows={2}
                          value={completionNotes}
                          onChange={(e) => setCompletionNotes(e.target.value)}
                          placeholder="e.g. Inspected berth electrical socket; reset coach breaker. Service completed successfully."
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E2D3] bg-[#FFFDF5] focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                        />
                      </div>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleProgress(activeJob.requestId, 'Completed', completionNotes)}
                        className="px-6 py-2.5 bg-[#21865B] hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Complete Service Job &amp; Release Availability</span>
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
                You are currently free. Check the "Incoming Requests" tab below to accept passenger assistance calls at {currentWorker.stationName}.
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
              Skill: <strong className="text-[#142B4A]">{currentWorker.skillCategory}</strong>
            </span>
          </div>

          {incomingRequests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E8E2D3] p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#6B7280] flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-[#142B4A]">No Pending Requests at This Station</h4>
              <p className="text-xs text-[#6B7280] max-w-md mx-auto mt-1">
                New passenger calls at {currentWorker.stationName} will appear here automatically. Keep your status set to "Available".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomingRequests.map((req) => (
                <div
                  key={req.requestId}
                  className="bg-white rounded-2xl border border-[#E8E2D3] p-5 space-y-4 shadow-xs hover:border-[#142B4A] transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#142B4A] block">
                        #{req.requestId}
                      </span>
                      <h4 className="text-base font-extrabold text-[#142B4A] mt-0.5">
                        Train {req.trainNumber} · Coach {req.coachNumber || 'B3'}
                      </h4>
                      <p className="text-xs text-[#6B7280]">
                        Passenger: {req.passengerName}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                      Incoming
                    </span>
                  </div>

                  <p className="text-xs text-[#253247] bg-[#FFFDF5] p-3 rounded-xl border border-[#E8E2D3]">
                    "{req.description}"
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D3]">
                    <span className="text-[11px] text-[#6B7280]">
                      Berth: <strong>{req.seatNumber || 'N/A'}</strong>
                    </span>
                    <button
                      disabled={actionLoading || Boolean(activeJob)}
                      onClick={() => handleAccept(req.requestId)}
                      className={`px-4 py-2 bg-[#21865B] hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1.5 ${
                        activeJob ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>{activeJob ? 'Finish Active Job First' : 'Accept Assignment'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PASSENGER REVIEWS */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#142B4A] uppercase tracking-wider">
              Passenger Ratings &amp; Reviews
            </h3>
            <div className="flex items-center gap-1 text-sm font-extrabold text-[#142B4A] font-mono">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{averageRating} Average Rating</span>
            </div>
          </div>

          {allReviews.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E8E2D3] p-12 text-center shadow-xs">
              <Star className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-[#142B4A]">No Reviews Yet</h4>
              <p className="text-xs text-[#6B7280] max-w-md mx-auto mt-1">
                Complete passenger service requests to receive 5-star ratings and feedback.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allReviews.map((rev, idx) => (
                <div
                  key={`${rev.requestId}-${idx}`}
                  className="bg-white rounded-2xl border border-[#E8E2D3] p-5 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((st) => (
                        <Star
                          key={st}
                          className={`w-4 h-4 ${
                            Number(rev.rating) >= st
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-[#142B4A] ml-1 font-mono">
                        {rev.rating}/5
                      </span>
                    </div>
                    <span className="text-[10px] text-[#6B7280] font-mono">
                      {rev.createdAt ? rev.createdAt.slice(0, 10) : 'Recent'}
                    </span>
                  </div>

                  <p className="text-xs text-[#253247] italic">
                    "{rev.comment || 'Quick and professional passenger assistance.'}"
                  </p>

                  <div className="pt-2 border-t border-[#E8E2D3] flex items-center justify-between text-[11px] text-[#6B7280]">
                    <span>By: <strong className="text-[#142B4A]">{rev.passengerName}</strong></span>
                    <span>Ref: #{rev.requestId}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SERVICE HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#142B4A] uppercase tracking-wider">
              Completed Service History
            </h3>
            <span className="text-xs font-bold text-[#21865B] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {completedJobs.length} Completed Jobs
            </span>
          </div>

          {completedJobs.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E8E2D3] p-12 text-center shadow-xs">
              <Check className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-[#142B4A]">No Completed Jobs Yet</h4>
              <p className="text-xs text-[#6B7280] max-w-md mx-auto mt-1">
                Completed assignments will appear in this history log.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedJobs.map((job) => (
                <div
                  key={job.requestId}
                  className="bg-white rounded-2xl border border-[#E8E2D3] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#142B4A]">
                        #{job.requestId}
                      </span>
                      <span className="text-xs font-bold text-[#21865B] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Completed
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-[#142B4A]">
                      Train {job.trainNumber} · Coach {job.coachNumber || 'B3'} · {job.serviceCategory}
                    </h4>
                    <p className="text-xs text-[#6B7280]">
                      Passenger: {job.passengerName} ({job.passengerMobile})
                    </p>
                    {job.completionNotes && (
                      <p className="text-xs text-[#253247] italic pt-1">
                        Resolution: "{job.completionNotes}"
                      </p>
                    )}
                  </div>

                  <div className="text-right text-xs text-[#6B7280] shrink-0">
                    <span className="block font-mono text-[11px]">
                      {job.updatedAt || job.createdAt}
                    </span>
                    <span className="text-[10px] text-[#21865B] font-semibold">
                      Verified On-Spot Fix
                    </span>
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
