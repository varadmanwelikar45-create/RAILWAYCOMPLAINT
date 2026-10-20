import React, { useState, useEffect } from 'react';
import { User, ViewMode, WorkerServiceRequest } from '../types';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Star, 
  X, 
  PlusCircle, 
  ArrowLeft, 
  Compass, 
  RefreshCw, 
  Navigation,
  Train,
  Radio,
  LocateFixed,
  Send
} from 'lucide-react';

interface UserDashboardProps {
  currentUser: User;
  workerRequests?: WorkerServiceRequest[];
  onCancelWorkerRequest?: (requestId: string) => void;
  onSubmitWorkerFeedback?: (
    requestId: string,
    rating: number,
    comment: string,
    tags: string[]
  ) => Promise<{ success: boolean; message: string }>;
  onNavigate: (view: ViewMode) => void;
  onRefreshData?: () => void;
  onBack?: () => void;
}

const QUICK_FEEDBACK_TAGS = [
  '⚡ Rapid Arrival',
  '🤝 Courteous & Humble',
  '🧳 Handled Luggage Safely',
  '🔧 Quick & Skilled Fix',
  '⏰ Reached Coach on Time',
  '🧼 Clean & Professional',
  '👍 Highly Recommended'
];

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  workerRequests = [],
  onCancelWorkerRequest,
  onSubmitWorkerFeedback,
  onNavigate,
  onRefreshData,
  onBack,
}) => {
  // Filter bookings belonging strictly to current passenger
  const userBookings = (workerRequests || []).filter((r) => {
    if (!r) return false;
    const matchesId = currentUser?.id && r.passengerId === currentUser.id;
    const matchesEmail =
      currentUser?.email &&
      r.passengerEmail &&
      r.passengerEmail.toLowerCase().trim() === currentUser.email.toLowerCase().trim();
    return matchesId || matchesEmail;
  });

  // Filter & Search
  const [filterWorkerStatus, setFilterWorkerStatus] = useState<'All' | 'Active' | 'Completed' | 'Cancelled'>('All');
  const [workerSearch, setWorkerSearch] = useState('');

  // Selected request for live location viewing
  const activeRequest = userBookings.find((r) =>
    ['Requested', 'Awaiting Worker Confirmation', 'Finding Worker', 'Worker Assigned', 'On the Way', 'Arrived at Station', 'Service In Progress'].includes(r.status)
  ) || userBookings[0] || null;

  const [selectedLocationReqId, setSelectedLocationReqId] = useState<string | null>(
    activeRequest ? activeRequest.requestId : null
  );

  // Live Location Sharing State
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);
  const [passengerCoords, setPassengerCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedCoach, setSelectedCoach] = useState('Coach B3');
  const [selectedSeat, setSelectedSeat] = useState('Berth 24');
  const [selectedPlatform, setSelectedPlatform] = useState('Platform 2');

  // Feedback Modal State
  const [feedbackModalReq, setFeedbackModalReq] = useState<WorkerServiceRequest | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackHoverRating, setFeedbackHoverRating] = useState<number>(0);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [feedbackTags, setFeedbackTags] = useState<string[]>(['⚡ Rapid Arrival', '🤝 Courteous & Humble']);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  // Active targeted request for live location
  const currentTrackedReq = userBookings.find((r) => r.requestId === selectedLocationReqId) || activeRequest;

  // Sync selected request if none selected
  useEffect(() => {
    if (!selectedLocationReqId && activeRequest) {
      setSelectedLocationReqId(activeRequest.requestId);
    }
  }, [activeRequest, selectedLocationReqId]);

  // Periodic refresh for mutual live location
  useEffect(() => {
    const interval = setInterval(() => {
      onRefreshData?.();
    }, 5000);
    return () => clearInterval(interval);
  }, [onRefreshData]);

  // Handle passenger sharing their live location
  const handleSharePassengerLocation = () => {
    if (!currentTrackedReq) return;
    setIsLocating(true);
    setLocationSuccessMsg(null);

    const updateLocationOnServer = async (lat: number, lng: number) => {
      try {
        const res = await fetch(`/api/worker-requests/${currentTrackedReq.requestId}/location`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'passenger',
            latitude: lat,
            longitude: lng,
            platform: selectedPlatform,
            coach: currentTrackedReq.coachNumber || selectedCoach,
            seat: currentTrackedReq.seatNumber || selectedSeat,
          }),
        });
        if (res.ok) {
          setLocationSuccessMsg(`Live location shared with worker! Coach & berth coordinates synced.`);
          setPassengerCoords({ latitude: lat, longitude: lng });
          onRefreshData?.();
          setTimeout(() => setLocationSuccessMsg(null), 5000);
        }
      } catch (e) {
        setLocationSuccessMsg(`Location updated (${lat.toFixed(4)}°, ${lng.toFixed(4)}°).`);
        setTimeout(() => setLocationSuccessMsg(null), 4000);
      } finally {
        setIsLocating(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateLocationOnServer(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // Standard station platform coordinates if GPS prompt is dismissed
          updateLocationOnServer(28.6431, 77.2197);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      updateLocationOnServer(28.6431, 77.2197);
    }
  };

  // Filtered Bookings List
  const displayedBookings = userBookings.filter((r) => {
    const isCompleted = r.status === 'Completed';
    const isCancelled = r.status === 'Cancelled' || r.status === 'Declined';
    const isActive = !isCompleted && !isCancelled;

    if (filterWorkerStatus === 'Active' && !isActive) return false;
    if (filterWorkerStatus === 'Completed' && !isCompleted) return false;
    if (filterWorkerStatus === 'Cancelled' && !isCancelled) return false;

    const q = workerSearch.toLowerCase().trim();
    if (!q) return true;

    return (
      r.requestId.toLowerCase().includes(q) ||
      r.stationCode.toLowerCase().includes(q) ||
      r.stationName.toLowerCase().includes(q) ||
      r.trainNumber.toLowerCase().includes(q) ||
      String(r.serviceCategory || '').toLowerCase().includes(q) ||
      String(r.assignedWorkerName || '').toLowerCase().includes(q) ||
      String(r.description || '').toLowerCase().includes(q)
    );
  });

  const handleOpenFeedback = (req: WorkerServiceRequest) => {
    setFeedbackModalReq(req);
    setFeedbackRating(req.feedback?.rating || 5);
    setFeedbackComment(req.feedback?.comment || '');
    setFeedbackTags(req.feedback?.tags || ['⚡ Rapid Arrival', '🤝 Courteous & Humble']);
  };

  const handleTagToggle = (tag: string) => {
    setFeedbackTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackModalReq || !onSubmitWorkerFeedback) return;
    setFeedbackSubmitting(true);
    try {
      await onSubmitWorkerFeedback(
        feedbackModalReq.requestId,
        feedbackRating,
        feedbackComment,
        feedbackTags
      );
      setFeedbackModalReq(null);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Top Navigation Bar with Back Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D3] shadow-xs">
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
            <span className="text-xs font-bold text-[#21865B] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#21865B] animate-pulse"></span>
              Live Connected
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] tracking-tight">
            Passenger Dashboard · {currentUser.fullName}
          </h1>
          
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
            <span>Email: <strong className="text-[#253247]">{currentUser.email}</strong></span>
            <span>·</span>
            <span>Mobile: <strong className="text-[#253247]">{currentUser.mobile}</strong></span>
          </div>
        </div>

        {/* Book Station Worker Button */}
        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => onNavigate('book-worker')}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-2xl shadow-sm transition-all border border-[#142B4A] hover:border-[#E9B949] flex items-center justify-center gap-2 cursor-pointer hover:shadow-md"
          >
            <PlusCircle className="w-4 h-4 text-[#E9B949]" />
            <span>Book Station Worker</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LOCATION ACCESS SECTION: MUTUAL TRACKING (PASSENGER OF WORKER)            */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-b from-white to-[#FFFDF5] rounded-3xl border-2 border-[#142B4A]/15 p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D3]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#142B4A] text-[#E9B949] flex items-center justify-center shadow-xs">
              <Compass className="w-6 h-6 text-[#E9B949]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FFF5DC] text-[#142B4A] text-[10px] font-extrabold uppercase tracking-wider mb-0.5 border border-[#E9B949]/30">
                MUTUAL LIVE LOCATION ACCESS
              </div>
              <h2 className="text-xl font-extrabold text-[#142B4A] tracking-tight">
                Passenger &amp; Worker Live Location Tracking
              </h2>
            </div>
          </div>

          {currentTrackedReq && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#6B7280]">
                Tracking Booking:
              </span>
              <select
                value={selectedLocationReqId || currentTrackedReq.requestId}
                onChange={(e) => setSelectedLocationReqId(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold bg-white border border-[#E8E2D3] rounded-xl text-[#142B4A] focus:outline-none focus:ring-2 focus:ring-[#142B4A] font-mono"
              >
                {userBookings.map((b) => (
                  <option key={b.requestId} value={b.requestId}>
                    #{b.requestId} · {b.serviceCategory.split('&')[0]} ({b.status})
                  </option>
                ))}
              </select>
              <button
                onClick={() => onRefreshData?.()}
                className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                title="Refresh Live Coordinates"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {locationSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-[#EDF7F2] border border-[#21865B]/30 text-xs text-[#156140] flex items-center gap-2 font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#21865B] shrink-0" />
            <span>{locationSuccessMsg}</span>
          </div>
        )}

        {currentTrackedReq ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left: Passenger Shared Location Card */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E8E2D3] p-5 sm:p-6 space-y-5 flex flex-col justify-between shadow-2xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#142B4A]">My Passenger Location</h3>
                      <p className="text-[10px] text-[#6B7280]">Coordinates shared with your assigned station worker</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-200">
                    Coach &amp; Berth Coordinates
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-[#FFFDF5] border border-[#E8E2D3]">
                    <span className="text-[10px] text-[#6B7280] block uppercase font-bold">Coach</span>
                    <span className="font-extrabold text-[#142B4A] text-sm">
                      {currentTrackedReq.coachNumber || selectedCoach}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FFFDF5] border border-[#E8E2D3]">
                    <span className="text-[10px] text-[#6B7280] block uppercase font-bold">Seat / Berth</span>
                    <span className="font-extrabold text-[#142B4A] text-sm">
                      {currentTrackedReq.seatNumber || selectedSeat}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FFFDF5] border border-[#E8E2D3]">
                    <span className="text-[10px] text-[#6B7280] block uppercase font-bold">Platform</span>
                    <span className="font-extrabold text-[#142B4A] text-sm">
                      {currentTrackedReq.passengerLocation?.platform || selectedPlatform}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-[#6B7280]">
                    <span>Train Number / Name:</span>
                    <strong className="text-[#142B4A]">{currentTrackedReq.trainNumber} {currentTrackedReq.trainName ? `(${currentTrackedReq.trainName})` : ''}</strong>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-[#6B7280]">
                    <span>Meeting Station:</span>
                    <strong className="text-[#142B4A]">{currentTrackedReq.stationName} ({currentTrackedReq.stationCode})</strong>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-[#6B7280]">
                    <span>Service Type:</span>
                    <strong className="text-[#142B4A]">{currentTrackedReq.serviceCategory}</strong>
                  </div>
                </div>

                {/* Edit Coach & Berth Quick Selectors */}
                <div className="space-y-2 pt-2 border-t border-[#E8E2D3]">
                  <label className="text-[11px] font-bold text-[#142B4A] block">
                    Update Coach &amp; Berth for Worker:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={selectedCoach}
                      onChange={(e) => setSelectedCoach(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-[#FFFDF5] border border-[#E8E2D3] rounded-lg text-[#142B4A] font-semibold"
                    >
                      {['Coach B1', 'Coach B2', 'Coach B3', 'Coach B4', 'Coach A1', 'Coach A2', 'Coach S1', 'Coach S2', 'Coach S3'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={selectedSeat}
                      onChange={(e) => setSelectedSeat(e.target.value)}
                      placeholder="e.g. Berth 24"
                      className="px-2.5 py-1.5 text-xs bg-[#FFFDF5] border border-[#E8E2D3] rounded-lg text-[#142B4A] font-semibold"
                    />

                    <select
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-[#FFFDF5] border border-[#E8E2D3] rounded-lg text-[#142B4A] font-semibold"
                    >
                      {['Platform 1', 'Platform 2', 'Platform 3', 'Platform 4', 'Platform 5'].map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8E2D3]">
                <button
                  onClick={handleSharePassengerLocation}
                  disabled={isLocating}
                  className="w-full py-2.5 px-4 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
                >
                  <LocateFixed className={`w-4 h-4 text-[#E9B949] ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Capturing GPS...' : 'Share My Live GPS Location with Worker'}</span>
                </button>
              </div>
            </div>

            {/* Right: Worker Live Location Card (Passenger of Worker) */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E8E2D3] p-5 sm:p-6 space-y-5 flex flex-col justify-between shadow-2xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                      <Navigation className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#142B4A]">Worker Live Location</h3>
                      <p className="text-[10px] text-[#6B7280]">
                        Assigned technician moving status &amp; distance
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#21865B] animate-pulse"></span>
                    Live Radar Active
                  </span>
                </div>

                {currentTrackedReq.assignedWorkerName ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-[#FFFDF5] rounded-xl border border-[#E8E2D3] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#6B7280] block font-bold uppercase">Assigned Technician</span>
                        <span className="font-extrabold text-[#142B4A] text-sm">
                          {currentTrackedReq.assignedWorkerName}
                        </span>
                      </div>
                      {currentTrackedReq.assignedWorkerMobile && (
                        <a
                          href={`tel:${currentTrackedReq.assignedWorkerMobile}`}
                          className="px-3 py-1.5 bg-[#142B4A] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-[#243F63] transition"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#E9B949]" />
                          <span>Call Worker</span>
                        </a>
                      )}
                    </div>

                    {/* Live Movement Radar Display */}
                    <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 relative overflow-hidden">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          <span>Platform Movement</span>
                        </span>
                        <span className="text-[#E9B949] font-mono text-xs font-bold">
                          {currentTrackedReq.status === 'Service In Progress' ? 'AT BERTH' : 'EN ROUTE'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl">
                        <div>
                          <span className="text-[10px] text-slate-300 block">Current Position:</span>
                          <span className="text-xs font-bold text-white">
                            {currentTrackedReq.workerLocation?.currentStatusText || (
                              currentTrackedReq.status === 'Arrived at Station' 
                                ? 'Arrived at Platform 2, walking along train coach track'
                                : currentTrackedReq.status === 'On the Way'
                                ? 'Moving towards Station Platform 2'
                                : 'Assigned · Preparing duty kit'
                            )}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-300 block">Est. Distance:</span>
                          <span className="text-xs font-extrabold text-[#E9B949] font-mono">
                            {currentTrackedReq.status === 'Service In Progress' 
                              ? '0m (At Berth)' 
                              : currentTrackedReq.status === 'Arrived at Station'
                              ? '~65 meters'
                              : '~250 meters'}
                          </span>
                        </div>
                      </div>

                      {/* Coach Position Diagram */}
                      <div className="pt-2 border-t border-white/10 text-[10px] text-slate-300">
                        <div className="flex items-center justify-between mb-1">
                          <span>Train Platform Radar</span>
                          <span className="text-emerald-400 font-bold">Worker approaching {currentTrackedReq.coachNumber || 'Coach B3'}</span>
                        </div>
                        <div className="flex items-center gap-1 overflow-x-auto py-1">
                          {['ENG', 'H1', 'A1', 'A2', 'B1', 'B2', 'B3', 'B4', 'S1', 'S2'].map((c) => {
                            const isTargetCoach = c === 'B3' || currentTrackedReq.coachNumber?.includes(c);
                            return (
                              <div
                                key={c}
                                className={`px-2 py-1 rounded text-center font-mono text-[9px] shrink-0 font-bold ${
                                  isTargetCoach
                                    ? 'bg-[#E9B949] text-[#142B4A] ring-2 ring-white animate-pulse'
                                    : 'bg-white/20 text-slate-200'
                                }`}
                              >
                                {c}
                                {isTargetCoach && ' 📍'}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-[#FFFDF5] rounded-xl border border-[#E8E2D3] text-center space-y-2">
                    <Clock className="w-8 h-8 text-amber-600 mx-auto" />
                    <h4 className="text-xs font-bold text-[#142B4A]">Finding Nearby Station Worker</h4>
                    <p className="text-[11px] text-[#6B7280]">
                      Your request has been broadcasted to verified technicians at {currentTrackedReq.stationName}. Once a worker accepts, their live location and phone number will appear here.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#E8E2D3] flex items-center justify-between text-xs text-[#6B7280]">
                <span>Status: <strong className="text-[#142B4A]">{currentTrackedReq.status}</strong></span>
                <span>Ref: <strong className="text-[#142B4A] font-mono">#{currentTrackedReq.requestId}</strong></span>
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E8E2D3] p-10 text-center space-y-3">
            <Compass className="w-10 h-10 text-[#6B7280] mx-auto opacity-40" />
            <h3 className="text-base font-bold text-[#142B4A]">No Active Assistance Bookings Yet</h3>
            <p className="text-xs text-[#6B7280] max-w-md mx-auto">
              Book a verified station worker for electrical, plumbing, sanitation, or luggage help to activate mutual real-time coach tracking.
            </p>
            <button
              onClick={() => onNavigate('book-worker')}
              className="px-5 py-2.5 bg-[#142B4A] text-white text-xs font-bold rounded-xl hover:bg-[#243F63] transition cursor-pointer"
            >
              Book Station Worker Now &rarr;
            </button>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: MY BOOKINGS LIST                                               */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E8E2D3]">
          <div className="flex items-center gap-1.5 p-1 bg-[#FFF5DC] rounded-xl border border-[#E8E2D3]">
            {(['All', 'Active', 'Completed', 'Cancelled'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterWorkerStatus(st)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  filterWorkerStatus === st
                    ? 'bg-[#142B4A] text-white shadow-2xs'
                    : 'text-[#142B4A] hover:bg-white/60'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="text-xs text-[#6B7280] font-semibold">
            Showing <strong>{displayedBookings.length}</strong> of <strong>{userBookings.length}</strong> bookings
          </div>
        </div>

        {/* Bookings Cards Grid */}
        {displayedBookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E2D3] p-8 text-center text-xs text-[#6B7280]">
            No bookings found under this filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedBookings.map((b) => (
              <div
                key={b.requestId}
                className={`bg-white rounded-2xl border p-5 space-y-4 shadow-xs transition hover:shadow-sm ${
                  selectedLocationReqId === b.requestId ? 'border-[#142B4A] ring-1 ring-[#142B4A]/20' : 'border-[#E8E2D3]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#142B4A] block">
                      #{b.requestId}
                    </span>
                    <h4 className="text-sm font-extrabold text-[#142B4A] mt-0.5">
                      {b.serviceCategory}
                    </h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                    b.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : b.status === 'Cancelled'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {b.status}
                  </span>
                </div>

                <div className="text-xs text-[#6B7280] line-clamp-2">
                  {b.description}
                </div>

                <div className="p-2.5 bg-[#FFFDF5] rounded-xl border border-[#E8E2D3] grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-[#6B7280] block font-bold">Train &amp; Station</span>
                    <span className="font-bold text-[#142B4A]">{b.trainNumber} · {b.stationCode}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6B7280] block font-bold">Coach &amp; Seat</span>
                    <span className="font-bold text-[#142B4A]">{b.coachNumber || 'B3'} / {b.seatNumber || '24'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D3] text-xs">
                  <div className="text-[11px] text-[#6B7280]">
                    {b.assignedWorkerName ? (
                      <span className="text-[#142B4A] font-bold">Assigned: {b.assignedWorkerName}</span>
                    ) : (
                      <span>Awaiting worker assignment</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedLocationReqId(b.requestId);
                        window.scrollTo({ top: 120, behavior: 'smooth' });
                      }}
                      className="px-3 py-1 bg-[#FFF5DC] hover:bg-[#E9B949]/30 text-[#142B4A] border border-[#E9B949]/60 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                    >
                      <Compass className="w-3.5 h-3.5 text-[#142B4A]" />
                      <span>Live Location</span>
                    </button>

                    {b.status === 'Completed' && (
                      <button
                        onClick={() => handleOpenFeedback(b)}
                        className="px-3 py-1 bg-[#142B4A] hover:bg-[#243F63] text-white rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        {b.feedback ? 'View Review' : 'Rate Service'}
                      </button>
                    )}

                    {!['Completed', 'Cancelled', 'Declined'].includes(b.status) && onCancelWorkerRequest && (
                      <button
                        onClick={() => onCancelWorkerRequest(b.requestId)}
                        className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Passenger Feedback Modal */}
      {feedbackModalReq && (
        <div className="fixed inset-0 z-50 bg-[#142B4A]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E8E2D3] shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-[#E8E2D3]">
              <div>
                <h3 className="text-lg font-extrabold text-[#142B4A]">
                  Rate Worker Service
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Booking #{feedbackModalReq.requestId} · {feedbackModalReq.assignedWorkerName}
                </p>
              </div>
              <button
                onClick={() => setFeedbackModalReq(null)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitFeedback} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#142B4A] mb-2">
                  Your Overall Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setFeedbackHoverRating(star)}
                      onMouseLeave={() => setFeedbackHoverRating(0)}
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 cursor-pointer transition transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          (feedbackHoverRating || feedbackRating) >= star
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[#142B4A] ml-2 font-mono">
                    {feedbackRating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#142B4A] mb-1.5">
                  Select Feedback Highlights
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_FEEDBACK_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                        feedbackTags.includes(tag)
                          ? 'bg-[#142B4A] text-white border-[#142B4A]'
                          : 'bg-[#FFFDF5] text-[#253247] border-[#E8E2D3] hover:bg-[#FFF5DC]'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#142B4A] mb-1.5">
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Share details about the assistance provided at your berth..."
                  rows={3}
                  className="w-full p-3 text-xs bg-[#FFFDF5] border border-[#E8E2D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E8E2D3]">
                <button
                  type="button"
                  onClick={() => setFeedbackModalReq(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={feedbackSubmitting}
                  className="px-5 py-2 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {feedbackSubmitting ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
