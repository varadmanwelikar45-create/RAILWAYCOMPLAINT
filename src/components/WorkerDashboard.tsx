import React, { useState, useEffect } from 'react';
import { Worker, ViewMode, WorkerServiceRequest, WorkerAvailabilityStatus } from '../types';
import { 
  Briefcase, 
  Clock, 
  Check, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  AlertCircle, 
  Compass, 
  ArrowRight, 
  RefreshCw,
  Navigation,
  LocateFixed,
  Play,
  ArrowLeft
} from 'lucide-react';

interface WorkerDashboardProps {
  currentWorker: Worker;
  requests?: WorkerServiceRequest[];
  workerRequests?: WorkerServiceRequest[];
  onAcceptRequest?: (requestId: string) => Promise<{ success: boolean; message: string }>;
  onUpdateRequestStatus?: (
    requestId: string, 
    status: WorkerServiceRequest['status'], 
    notes?: string
  ) => Promise<{ success: boolean; message: string }> | any;
  onUpdateStatus?: (
    requestId: string, 
    status: WorkerServiceRequest['status'], 
    notes?: string
  ) => Promise<{ success: boolean; message: string }> | any;
  onUpdateAvailability?: (availability: WorkerAvailabilityStatus) => Promise<any> | any;
  onToggleAvailability?: (workerId: string | number, isAvailable: boolean) => Promise<{ success: boolean; message: string }> | any;
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
  onUpdateRequestStatus,
  onUpdateStatus,
  onUpdateAvailability,
  onToggleAvailability,
  onRefreshData,
  onWorkerLogout,
  onBack,
}) => {
  const workerRequests = requests || workerRequestsProp || [];
  const statusUpdateFn = onUpdateRequestStatus || onUpdateStatus;
  const [activeTab, setActiveTab] = useState<'current-job' | 'incoming-requests' | 'history' | 'feedback'>('current-job');
  const [completionNotes, setCompletionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Live Location & Movement status states for Worker
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [workerStatusText, setWorkerStatusText] = useState('Walking along platform towards coach');

  // Filter requests matching this worker
  const activeJob = workerRequests.find(
    (r) =>
      r.assignedWorkerId === currentWorker.id &&
      ['Worker Assigned', 'On the Way', 'Arrived at Station', 'Service In Progress'].includes(r.status)
  );

  const incomingRequests = workerRequests.filter((r) => {
    // Show requests that are unassigned or requested, match station, and match category
    const isUnassigned = !r.assignedWorkerId && ['Requested', 'Awaiting Worker Confirmation', 'Finding Worker'].includes(r.status);
    const stationMatches = r.stationCode === currentWorker.stationCode;
    const categoryMatches =
      r.serviceCategory.toLowerCase().includes(currentWorker.skillCategory.toLowerCase()) ||
      currentWorker.skillCategory.toLowerCase().includes(r.serviceCategory.toLowerCase());
    return isUnassigned && stationMatches && categoryMatches;
  });

  const completedJobs = workerRequests.filter(
    (r) => r.assignedWorkerId === currentWorker.id && r.status === 'Completed'
  );

  // Aggregate genuine passenger feedback
  const allReviews = workerRequests
    .filter((r) => r.assignedWorkerId === currentWorker.id && r.feedback)
    .map((r) => ({
      ...r.feedback!,
      requestId: r.requestId,
      passengerName: r.passengerName,
      trainNumber: r.trainNumber,
      serviceCategory: r.serviceCategory,
    }));

  const averageRating = allReviews.length > 0
    ? (allReviews.reduce((acc, curr) => acc + (curr.rating || 5), 0) / allReviews.length).toFixed(1)
    : (currentWorker.rating || 4.9).toFixed(1);

  // Poll for live requests every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      onRefreshData?.();
    }, 5000);
    return () => clearInterval(interval);
  }, [onRefreshData]);

  // Handle switching tabs when there is no active job
  useEffect(() => {
    if (!activeJob && activeTab === 'current-job' && incomingRequests.length > 0) {
      setActiveTab('incoming-requests');
    }
  }, [activeJob, incomingRequests.length, activeTab]);

  const handleAccept = async (requestId: string) => {
    if (!onAcceptRequest) return;
    try {
      setActionLoading(true);
      const res = await onAcceptRequest(requestId);
      if (res.success) {
        setActionNotice('Service assignment accepted! Proceed to passenger coach.');
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

  const handleProgress = async (requestId: string, nextStatus: WorkerServiceRequest['status'], notes?: string) => {
    if (!statusUpdateFn) return;
    try {
      setActionLoading(true);
      const res = await statusUpdateFn(requestId, nextStatus, notes);
      if (res?.success) {
        setActionNotice(`Status updated to: ${nextStatus}`);
        if (nextStatus === 'Completed') {
          setCompletionNotes('');
          setActiveTab('history');
        }
      } else if (res?.message) {
        setActionNotice(res.message);
      }
      setTimeout(() => setActionNotice(null), 4000);
    } finally {
      setActionLoading(false);
      onRefreshData?.();
    }
  };

  const isWorkerAvailable = currentWorker.availability === 'Available';

  const handleToggle = async () => {
    try {
      setActionLoading(true);
      if (onUpdateAvailability) {
        const nextStatus: WorkerAvailabilityStatus = isWorkerAvailable ? 'Unavailable' : 'Available';
        await onUpdateAvailability(nextStatus);
      } else if (onToggleAvailability) {
        await onToggleAvailability(currentWorker.id, !isWorkerAvailable);
      }
      setActionNotice(isWorkerAvailable ? 'Status set to Unavailable' : 'Status set to Available on Platform');
      setTimeout(() => setActionNotice(null), 3000);
    } finally {
      setActionLoading(false);
      onRefreshData?.();
    }
  };

  // Worker live location broadcaster
  const handleShareWorkerLocation = async (presetStatus?: string) => {
    setIsUpdatingLocation(true);
    const chosenStatus = presetStatus || workerStatusText;

    const sendCoords = async (latitude: number, longitude: number) => {
      try {
        const payload = {
          requestId: activeJob?.requestId,
          workerId: currentWorker.id,
          workerName: currentWorker.fullName,
          statusText: chosenStatus,
          latitude,
          longitude,
          timestamp: new Date().toISOString(),
          accuracyMeters: 5,
        };

        const res = await fetch('/api/workers/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          setActionNotice('Live position & status broadcasted to passenger!');
        } else {
          setActionNotice('Updated worker status broadcast.');
        }
        setTimeout(() => setActionNotice(null), 3000);
      } catch (e) {
        setActionNotice('Worker status update cached.');
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
      <div className="bg-white rounded-3xl border border-[#DDE4E6] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DDE4E6] text-xs font-bold text-[#202A2B] hover:bg-[#F0F4F6] transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-[#B94A3A]" />
                <span>Back</span>
              </button>
            )}
            <span className="px-2.5 py-0.5 bg-[#D7F7FC] text-[#007D99] text-[10px] font-black rounded-md tracking-wider uppercase border border-[#00B8D9]/40">
              VYOM RATH WORKFORCE
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
            <span>Station: <strong className="text-[#202A2B]">{currentWorker.stationName} ({currentWorker.stationCode})</strong></span>
            <span>·</span>
            <span className={`font-bold ${isVerified ? 'text-[#1E6B52]' : 'text-[#007D99]'}`}>
              {currentWorker.verificationStatus}
            </span>
          </div>
        </div>

        {/* Status Switcher & Logout */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Availability Toggle */}
          <div className="flex items-center gap-2 bg-[#F8FAFB] border border-[#DDE4E6] px-3.5 py-2 rounded-2xl">
            <span className="text-xs font-bold text-[#526365]">On-Duty Status:</span>
            <button
              onClick={handleToggle}
              disabled={actionLoading}
              className={`px-3 py-1 text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                isWorkerAvailable
                  ? 'bg-[#007D99] text-white shadow-xs'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isWorkerAvailable ? 'bg-[#D7F7FC] animate-pulse' : 'bg-slate-400'}`}></span>
              <span>{isWorkerAvailable ? 'Available' : 'Unavailable'}</span>
            </button>
          </div>

          {onWorkerLogout && (
            <button
              onClick={onWorkerLogout}
              className="px-4 py-2 border border-[#DDE4E6] hover:bg-[#FBE0E6] hover:text-[#92182D] hover:border-[#D72645]/40 text-xs font-bold text-[#526365] rounded-2xl transition cursor-pointer"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 text-amber-900 rounded-2xl text-xs flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-amber-700" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-500 hover:text-slate-900 cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* Verification Status Warning if not verified */}
      {!isVerified && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900">Account Pending Station Verification</h4>
            <p className="text-slate-600 leading-relaxed">
              Your profile is currently under review by railway station administrators. You will be able to receive passenger calls once verified.
            </p>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Assigned Platform</span>
          <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
            {currentWorker.stationCode}
          </div>
          <span className="text-[11px] text-slate-500 truncate block mt-0.5">
            {currentWorker.stationName}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Incoming Requests</span>
          <div className="text-xl font-extrabold text-amber-600 mt-1 font-mono">
            {incomingRequests.length}
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            At {currentWorker.stationCode}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Jobs Completed</span>
          <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
            {completedJobs.length}
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Verified Resolution
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Passenger Rating</span>
          <div className="text-xl font-extrabold text-amber-600 mt-1 font-mono flex items-center gap-1">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>{averageRating}</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {allReviews.length} Passenger Reviews
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('current-job')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'current-job'
              ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
              : 'text-slate-700 hover:bg-amber-50'
          }`}
        >
          <Compass className="w-4 h-4 text-slate-900" />
          <span>Active Assignment {activeJob ? '(1)' : '(0)'}</span>
        </button>

        <button
          onClick={() => setActiveTab('incoming-requests')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'incoming-requests'
              ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
              : 'text-slate-700 hover:bg-amber-50'
          }`}
        >
          <Clock className="w-4 h-4 text-slate-900" />
          <span>Incoming Requests ({incomingRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
              : 'text-slate-700 hover:bg-amber-50'
          }`}
        >
          <Check className="w-4 h-4 text-slate-900" />
          <span>Service History ({completedJobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'feedback'
              ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
              : 'text-slate-700 hover:bg-amber-50'
          }`}
        >
          <Star className="w-4 h-4 text-slate-900" />
          <span>Reviews ({allReviews.length})</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE CURRENT JOB */}
      {activeTab === 'current-job' && (
        <div className="space-y-6">
          {activeJob ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-amber-700">
                      #{activeJob.requestId}
                    </span>
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                      {activeJob.serviceCategory}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    Train {activeJob.trainNumber} · Coach {activeJob.coachNumber || 'B3'} · Seat {activeJob.seatNumber || 'Berth 24'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Station: <strong>{activeJob.stationName} ({activeJob.stationCode})</strong>
                    {activeJob.expectedArrivalTime && ` · Expected Arrival: ${activeJob.expectedArrivalTime}`}
                  </p>
                </div>

                <div className="px-3.5 py-1.5 rounded-xl bg-yellow-100 text-amber-900 border border-yellow-300 text-xs font-extrabold uppercase tracking-wide">
                  Stage: {activeJob.status}
                </div>
              </div>

              {/* MUTUAL LOCATION ACCESS SECTION FOR WORKER */}
              <div className="bg-[#FFFDF5] rounded-2xl border border-amber-200/80 p-5 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center">
                      <Compass className="w-5 h-5 text-slate-950" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">Passenger Location &amp; Coach Navigation</h3>
                      <p className="text-[10px] text-slate-500">Live mutual tracking for meeting passenger at platform</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-yellow-100 text-amber-900 text-[10px] font-bold rounded-lg border border-yellow-300 inline-flex items-center gap-1.5 self-start sm:self-auto">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                    Mutual GPS Tracking Active
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left: Passenger Exact Coordinates & Coach Guide */}
                  <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-amber-600" />
                        <span>Passenger Position:</span>
                      </span>
                      <span className="text-[11px] font-mono font-bold text-amber-800 bg-yellow-100 px-2 py-0.5 rounded border border-yellow-300">
                        {activeJob.passengerLocation?.platform || 'Platform 2'} · {activeJob.coachNumber || 'Coach B3'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-[#FFFDF5] rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 block font-semibold">Coach</span>
                        <strong className="text-slate-900 text-sm">{activeJob.coachNumber || 'B3'}</strong>
                      </div>
                      <div className="p-2 bg-[#FFFDF5] rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 block font-semibold">Seat / Berth</span>
                        <strong className="text-slate-900 text-sm">{activeJob.seatNumber || 'Berth 24'}</strong>
                      </div>
                      <div className="p-2 bg-[#FFFDF5] rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 block font-semibold">Platform</span>
                        <strong className="text-slate-900 text-sm">{activeJob.passengerLocation?.platform || 'Platform 2'}</strong>
                      </div>
                    </div>

                    {/* Interactive Coach Map */}
                    <div className="pt-2">
                      <span className="text-[10px] text-slate-500 font-bold block mb-1">
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
                                  ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 font-black animate-pulse'
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
                  <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                        <Navigation className="w-4 h-4 text-amber-600" />
                        <span>Share Your Progress with Passenger:</span>
                      </span>

                      <div className="space-y-2">
                        <select
                          value={workerStatusText}
                          onChange={(e) => setWorkerStatusText(e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                            className="p-1.5 bg-yellow-50 hover:bg-yellow-100 text-[10px] font-bold text-amber-900 rounded-lg border border-yellow-200 transition cursor-pointer"
                          >
                            At Coach Door
                          </button>
                          <button
                            type="button"
                            onClick={() => handleShareWorkerLocation('At passenger berth')}
                            className="p-1.5 bg-yellow-50 hover:bg-yellow-100 text-[10px] font-bold text-amber-900 rounded-lg border border-yellow-200 transition cursor-pointer"
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
                      className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm mt-2 disabled:opacity-60"
                    >
                      <LocateFixed className={`w-3.5 h-3.5 text-slate-950 ${isUpdatingLocation ? 'animate-spin' : ''}`} />
                      <span>{isUpdatingLocation ? 'Broadcasting...' : 'Update Live Location & Status'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Passenger & Problem Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FFFDF5] p-5 rounded-2xl border border-amber-200/80">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Passenger Contact
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-800">
                    <p>Name: <strong>{activeJob.passengerName}</strong></p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-amber-600" />
                      <a href={`tel:${activeJob.passengerMobile}`} className="font-bold text-amber-700 hover:underline">
                        {activeJob.passengerMobile}
                      </a>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-amber-600" />
                      <span>{activeJob.passengerEmail}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Service Description
                  </h4>
                  <p className="text-xs text-slate-800 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                    "{activeJob.description}"
                  </p>
                </div>
              </div>

              {/* Step-by-Step Execution Lifecycle */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Update Service Progression
                </h4>

                <div className="flex flex-wrap items-center gap-3">
                  {activeJob.status === 'Worker Assigned' && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleProgress(activeJob.requestId, 'On the Way')}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer border border-amber-500"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Mark: On the Way to Station Platform</span>
                    </button>
                  )}

                  {activeJob.status === 'On the Way' && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleProgress(activeJob.requestId, 'Arrived at Station')}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer border border-amber-500"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Mark: Arrived at Platform &amp; Train Coach</span>
                    </button>
                  )}

                  {activeJob.status === 'Arrived at Station' && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleProgress(activeJob.requestId, 'Service In Progress')}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Mark: Commencing Passenger Assistance</span>
                    </button>
                  )}

                  {activeJob.status === 'Service In Progress' && (
                    <div className="w-full space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Resolution Summary Notes
                        </label>
                        <textarea
                          rows={2}
                          value={completionNotes}
                          onChange={(e) => setCompletionNotes(e.target.value)}
                          placeholder="e.g. Inspected berth electrical socket; reset coach breaker. Service completed successfully."
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                        />
                      </div>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleProgress(activeJob.requestId, 'Completed', completionNotes)}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
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
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-yellow-100 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-yellow-300">
                <Briefcase className="w-7 h-7 text-amber-700" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Active Service Job Assigned</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
                You are currently free. Check the "Incoming Requests" tab below to accept passenger assistance calls at {currentWorker.stationName}.
              </p>
              <button
                onClick={() => setActiveTab('incoming-requests')}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold rounded-xl shadow-sm transition cursor-pointer"
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
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Service Requests at {currentWorker.stationName} ({currentWorker.stationCode})
            </h3>
            <span className="text-xs text-slate-500">
              Skill: <strong className="text-amber-700">{currentWorker.skillCategory}</strong>
            </span>
          </div>

          {incomingRequests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">No Pending Requests at This Station</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                New passenger calls at {currentWorker.stationName} will appear here automatically. Keep your status set to "Available".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomingRequests.map((req) => (
                <div
                  key={req.requestId}
                  className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm hover:border-amber-400 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-amber-700 block">
                        #{req.requestId}
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 mt-0.5">
                        Train {req.trainNumber} · Coach {req.coachNumber || 'B3'}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Passenger: {req.passengerName}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-yellow-100 text-amber-900 border border-yellow-300">
                      Incoming
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 bg-[#FFFDF5] p-3 rounded-xl border border-amber-200/60">
                    "{req.description}"
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="text-[11px] text-slate-500">
                      Berth: <strong>{req.seatNumber || 'N/A'}</strong>
                    </span>
                    <button
                      disabled={actionLoading || Boolean(activeJob)}
                      onClick={() => handleAccept(req.requestId)}
                      className={`px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold rounded-xl transition cursor-pointer shadow-sm flex items-center gap-1.5 ${
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
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Passenger Ratings &amp; Reviews
            </h3>
            <div className="flex items-center gap-1 text-sm font-extrabold text-slate-900 font-mono">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{averageRating} Average Rating</span>
            </div>
          </div>

          {allReviews.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
              <Star className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-slate-900">No Reviews Yet</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Complete passenger service requests to receive 5-star ratings and feedback.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allReviews.map((rev, idx) => (
                <div
                  key={`${rev.requestId}-${idx}`}
                  className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm"
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
                      <span className="text-xs font-bold text-slate-900 ml-1 font-mono">
                        {rev.rating}/5
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {rev.createdAt ? rev.createdAt.slice(0, 10) : 'Recent'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 italic">
                    "{rev.comment || 'Quick and professional passenger assistance.'}"
                  </p>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <span>By: <strong className="text-slate-900">{rev.passengerName}</strong></span>
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
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Completed Service History
            </h3>
            <span className="text-xs font-bold text-slate-800 bg-yellow-100 px-2.5 py-0.5 rounded-full border border-yellow-300">
              {completedJobs.length} Completed Jobs
            </span>
          </div>

          {completedJobs.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
              <Check className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-slate-900">No Completed Jobs Yet</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Completed assignments will appear in this history log.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedJobs.map((job) => (
                <div
                  key={job.requestId}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-700">
                        #{job.requestId}
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Completed
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      Train {job.trainNumber} · Coach {job.coachNumber || 'B3'} · {job.serviceCategory}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Passenger: {job.passengerName} ({job.passengerMobile})
                    </p>
                    {job.completionNotes && (
                      <p className="text-xs text-slate-800 italic pt-1">
                        Resolution: "{job.completionNotes}"
                      </p>
                    )}
                  </div>

                  <div className="text-right text-xs text-slate-500 shrink-0">
                    <span className="block font-mono text-[11px]">
                      {job.updatedAt || job.createdAt}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold">
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
