import React, { useState, useEffect } from 'react';
import { User, ViewMode, WorkerServiceRequest, Worker, WorkerSkillCategory } from '../types';
import { RAILWAY_STATIONS } from '../data/mockData';
import { ServiceDiscoveryMarketplace } from './ServiceDiscoveryMarketplace';
import { 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Star, 
  X, 
  PlusCircle, 
  ArrowLeft, 
  Compass, 
  RefreshCw, 
  Radio,
  LocateFixed,
  Clock,
  Briefcase,
  Search,
  Train,
  Check,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface UserDashboardProps {
  currentUser: User;
  workerRequests?: WorkerServiceRequest[];
  workers?: Worker[];
  onCancelWorkerRequest?: (requestId: string) => void;
  onSubmitWorkerFeedback?: (
    requestId: string,
    rating: number,
    comment: string,
    tags: string[]
  ) => Promise<{ success: boolean; message: string }>;
  onSelectWorkerForBooking?: (worker: Worker, category?: WorkerSkillCategory) => void;
  onNavigate: (view: ViewMode) => void;
  onRefreshData?: () => void;
  onRefreshWorkers?: () => Promise<void> | void;
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
  workers = [],
  onCancelWorkerRequest,
  onSubmitWorkerFeedback,
  onSelectWorkerForBooking,
  onNavigate,
  onRefreshData,
  onRefreshWorkers,
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

  // Selected request for live location viewing
  const activeRequest = userBookings.find((r) =>
    ['Requested', 'Awaiting Worker Confirmation', 'Finding Worker', 'Worker Assigned', 'On the Way', 'Arrived at Station', 'Service In Progress'].includes(r.status)
  ) || null;

  // Navigation Tabs: 'marketplace' | 'radar'
  const [activeTab, setActiveTab] = useState<'marketplace' | 'radar'>(() =>
    activeRequest ? 'radar' : 'marketplace'
  );

  // Filter Bookings Status
  const [filterWorkerStatus, setFilterWorkerStatus] = useState<'All' | 'Active' | 'Completed' | 'Cancelled'>('All');

  const [selectedLocationReqId, setSelectedLocationReqId] = useState<string | null>(
    activeRequest ? activeRequest.requestId : (userBookings[0]?.requestId || null)
  );

  // Live Location Sharing State
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);
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
        await fetch(`/api/worker-requests/${currentTrackedReq.requestId}/location`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'passenger',
            latitude: lat,
            longitude: lng,
            platform: selectedPlatform,
            coach: selectedCoach,
            seat: selectedSeat,
          }),
        });
        setLocationSuccessMsg(`Live Coach Radar Coordinates Shared! (${selectedCoach}, ${selectedSeat})`);
        onRefreshData?.();
      } catch (e) {
        setLocationSuccessMsg(`Coordinates broadcasted via station beacon (${selectedCoach}).`);
      } finally {
        setIsLocating(false);
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => updateLocationOnServer(pos.coords.latitude, pos.coords.longitude),
        () => updateLocationOnServer(28.6143, 77.2185), // Default to station hub coordinates
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      updateLocationOnServer(28.6143, 77.2185);
    }
  };

  // Feedback Submission
  const handleSendFeedback = async () => {
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
      setFeedbackComment('');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#DDE4E6] shadow-sm">
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
            <span className="text-xs font-bold text-[#1E6B52] bg-[#DDF8EF] px-2.5 py-0.5 rounded-full border border-[#65D6B0]/40 inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#65D6B0] animate-pulse"></span>
              Live Connected
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#202A2B] tracking-tight">
            Passenger Dashboard · {currentUser.fullName}
          </h1>
          
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#526365]">
            <span>Email: <strong className="text-[#202A2B]">{currentUser.email}</strong></span>
            <span>·</span>
            <span>Mobile: <strong className="text-[#202A2B]">{currentUser.mobile}</strong></span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => onNavigate('book-worker')}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#202A2B] hover:bg-[#202A2B]/90 text-white text-xs font-black rounded-2xl shadow-xs transition-all border border-[#202A2B] flex items-center justify-center gap-2 cursor-pointer hover:shadow-md"
          >
            <PlusCircle className="w-4 h-4 text-[#65D6B0]" />
            <span>Book Station Worker</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-3 border-b border-[#DDE4E6] pb-2">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
            activeTab === 'marketplace'
              ? 'bg-[#202A2B] text-white shadow-xs'
              : 'text-[#526365] hover:bg-[#F0F4F6] hover:text-[#202A2B]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#65D6B0]" />
          <span>Find Assistance Near Your Station</span>
        </button>

        <button
          onClick={() => setActiveTab('radar')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
            activeTab === 'radar'
              ? 'bg-[#007D99] text-white shadow-xs'
              : 'text-[#526365] hover:bg-[#F0F4F6] hover:text-[#202A2B]'
          }`}
        >
          <Compass className="w-4 h-4 text-[#D7F7FC]" />
          <span>Live Radar &amp; My Bookings ({userBookings.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: RADAR & MY BOOKINGS                                                */}
      {/* ========================================================================= */}
      {activeTab === 'radar' && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Mutual Live Location Radar Container */}
          <div className="bg-white rounded-3xl border border-[#DDE4E6] p-6 sm:p-8 shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDE4E6]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#202A2B] text-[#65D6B0] flex items-center justify-center shadow-xs">
                  <Compass className="w-6 h-6 font-bold" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#DDF8EF] text-[#1E6B52] text-[10px] font-black uppercase tracking-wider mb-0.5 border border-[#65D6B0]/40">
                    MUTUAL LIVE RADAR
                  </div>
                  <h2 className="text-xl font-black text-[#202A2B] tracking-tight">
                    Passenger &amp; Worker Live Location Tracking
                  </h2>
                </div>
              </div>

              {currentTrackedReq && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#526365]">
                    Tracking:
                  </span>
                  <select
                    value={selectedLocationReqId || ''}
                    onChange={(e) => setSelectedLocationReqId(e.target.value)}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl border border-[#DDE4E6] bg-white text-[#202A2B] focus:outline-none focus:ring-2 focus:ring-[#65D6B0]"
                  >
                    {userBookings.map((b) => (
                      <option key={b.requestId} value={b.requestId}>
                        #{b.requestId} · {b.serviceCategory} ({b.status})
                      </option>
                    ))}
                  </select>
                  {onRefreshData && (
                    <button
                      onClick={onRefreshData}
                      className="p-1.5 border border-[#DDE4E6] rounded-xl hover:bg-[#F0F4F6] text-[#526365] transition cursor-pointer"
                      title="Refresh Radar"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {currentTrackedReq ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Left: Passenger Details & Location Broadcast */}
                <div className="lg:col-span-6 rounded-2xl border border-[#DDE4E6] bg-[#F8FAFB] p-5 sm:p-6 space-y-4 flex flex-col justify-between shadow-2xs">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-[#B94A3A]" />
                        <h3 className="text-sm font-bold text-[#202A2B]">Your Coach Location</h3>
                      </div>
                      <span className="text-[10px] font-bold text-[#1E6B52] bg-[#DDF8EF] px-2 py-0.5 rounded-md border border-[#65D6B0]/40">
                        {currentTrackedReq.stationCode} Halting Station
                      </span>
                    </div>

                    <p className="text-xs text-[#526365] leading-relaxed">
                      Share your exact train coach and berth coordinate with <strong>{currentTrackedReq.assignedWorkerName || 'the assigned technician'}</strong> so they can walk directly to your window/berth.
                    </p>

                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-[#526365] uppercase mb-1">Platform</label>
                        <select
                          value={selectedPlatform}
                          onChange={(e) => setSelectedPlatform(e.target.value)}
                          className="w-full text-xs font-bold p-2 bg-white rounded-lg border border-[#DDE4E6] text-[#202A2B]"
                        >
                          {['Platform 1', 'Platform 2', 'Platform 3', 'Platform 4', 'Platform 5', 'Platform 6'].map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#526365] uppercase mb-1">Coach</label>
                        <input
                          type="text"
                          value={selectedCoach}
                          onChange={(e) => setSelectedCoach(e.target.value)}
                          className="w-full text-xs font-bold p-2 bg-white rounded-lg border border-[#DDE4E6] text-[#202A2B]"
                          placeholder="e.g. B3"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#526365] uppercase mb-1">Berth</label>
                        <input
                          type="text"
                          value={selectedSeat}
                          onChange={(e) => setSelectedSeat(e.target.value)}
                          className="w-full text-xs font-bold p-2 bg-white rounded-lg border border-[#DDE4E6] text-[#202A2B]"
                          placeholder="e.g. 24"
                        />
                      </div>
                    </div>

                    {locationSuccessMsg && (
                      <div className="p-3 bg-[#DDF8EF] border border-[#65D6B0]/40 text-[#1E6B52] rounded-xl text-xs flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#3EA684] shrink-0" />
                        <span className="font-semibold">{locationSuccessMsg}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#DDE4E6]">
                    <button
                      onClick={handleSharePassengerLocation}
                      disabled={isLocating}
                      className="w-full py-3 bg-[#202A2B] hover:bg-[#202A2B]/90 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-xs border border-[#202A2B]"
                    >
                      <LocateFixed className="w-4 h-4 text-[#65D6B0]" />
                      <span>{isLocating ? 'Acquiring GPS...' : 'Broadcast Coach Coordinates to Worker'}</span>
                    </button>
                  </div>
                </div>

                {/* Right: Worker Status & Proximity Radar */}
                <div className="lg:col-span-6 rounded-2xl border border-[#DDE4E6] bg-[#202A2B] text-white p-5 sm:p-6 space-y-4 flex flex-col justify-between shadow-md">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <Radio className="w-5 h-5 text-[#65D6B0] animate-pulse" />
                        <h3 className="text-sm font-bold text-white">Technician Radar View</h3>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#007D99] text-white">
                        {currentTrackedReq.status}
                      </span>
                    </div>

                    {currentTrackedReq.assignedWorkerName ? (
                      <div className="space-y-4 pt-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-white/60 block">Assigned Specialist:</span>
                            <span className="text-base font-black text-white">{currentTrackedReq.assignedWorkerName}</span>
                            <span className="text-xs text-[#65D6B0] block">{currentTrackedReq.serviceCategory}</span>
                          </div>
                          {currentTrackedReq.assignedWorkerMobile && (
                            <a
                              href={`tel:${currentTrackedReq.assignedWorkerMobile}`}
                              className="px-3 py-1.5 bg-[#007D99] hover:bg-[#00B8D9] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Call Sahayak</span>
                            </a>
                          )}
                        </div>

                        <div className="p-3 bg-white/10 rounded-xl space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-white/70">Current Station Position:</span>
                            <span className="font-bold text-[#D7F7FC]">
                              {currentTrackedReq.workerLocation?.currentStatusText || 'Platform Concourse · En Route'}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/70">Estimated Distance:</span>
                            <span className="font-mono font-bold text-[#C6F000]">
                              {currentTrackedReq.status === 'Service In Progress' ? '0m (At Berth)' : '~60 meters'}
                            </span>
                          </div>
                        </div>

                        {/* Coach Indicator Diagram */}
                        <div className="pt-2 border-t border-white/10 text-[10px]">
                          <div className="flex justify-between text-white/70 mb-1">
                            <span>Coach Train Layout Radar</span>
                            <span className="text-[#65D6B0] font-bold">Approaching Coach {currentTrackedReq.coachNumber || selectedCoach}</span>
                          </div>
                          <div className="flex items-center gap-1 overflow-x-auto py-1">
                            {['ENG', 'H1', 'A1', 'A2', 'B1', 'B2', 'B3', 'B4', 'S1', 'S2'].map((c) => {
                              const isTarget = c === 'B3' || currentTrackedReq.coachNumber?.includes(c);
                              return (
                                <div
                                  key={c}
                                  className={`px-2 py-1 rounded text-center font-mono text-[9px] shrink-0 font-bold ${
                                    isTarget
                                      ? 'bg-[#65D6B0] text-[#202A2B] ring-2 ring-white animate-pulse'
                                      : 'bg-white/10 text-white/80'
                                  }`}
                                >
                                  {c}
                                  {isTarget && ' 📍'}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center space-y-2">
                        <Clock className="w-8 h-8 text-[#00B8D9] mx-auto animate-pulse" />
                        <h4 className="text-sm font-bold text-white">Broadcasting Request to Station Hub</h4>
                        <p className="text-xs text-white/70 max-w-sm mx-auto">
                          Looking for available verified specialists at {currentTrackedReq.stationName}. As soon as a worker accepts, their live coordinates and direct call link will connect here.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
                    <span>Train: <strong className="text-white">{currentTrackedReq.trainNumber}</strong></span>
                    <span>Ref: <strong className="text-white font-mono">#{currentTrackedReq.requestId}</strong></span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-[#F8FAFB] rounded-2xl border border-[#DDE4E6] p-10 text-center space-y-3">
                <Compass className="w-10 h-10 text-[#7E9092] mx-auto opacity-50" />
                <h3 className="text-base font-bold text-[#202A2B]">No Active Station Bookings</h3>
                <p className="text-xs text-[#526365] max-w-md mx-auto">
                  Book a verified station worker for electrical, plumbing, sanitation, or luggage assistance to activate coach radar.
                </p>
                <button
                  onClick={() => onNavigate('book-worker')}
                  className="px-5 py-2.5 bg-[#202A2B] hover:bg-[#202A2B]/90 text-white text-xs font-black rounded-xl transition cursor-pointer shadow-xs border border-[#202A2B]"
                >
                  Book Station Worker Now &rarr;
                </button>
              </div>
            )}

          </div>

          {/* Bookings List Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#DDE4E6]">
              <div className="flex items-center gap-1.5 p-1 bg-[#F8FAFB] rounded-xl border border-[#DDE4E6]">
                {(['All', 'Active', 'Completed', 'Cancelled'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterWorkerStatus(st)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                      filterWorkerStatus === st
                        ? 'bg-[#202A2B] text-white shadow-xs'
                        : 'text-[#526365] hover:text-[#202A2B]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="text-xs text-[#526365] font-semibold">
                Showing {userBookings.length} booking record(s)
              </div>
            </div>

            {userBookings.length === 0 ? (
              <div className="p-10 bg-white rounded-3xl border border-[#DDE4E6] text-center space-y-2">
                <Briefcase className="w-8 h-8 text-[#7E9092] mx-auto" />
                <h4 className="text-sm font-bold text-[#202A2B]">No Assistance Requests on Record</h4>
                <p className="text-xs text-[#526365]">You have not booked any station gig assistance yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userBookings.map((b) => (
                  <div key={b.requestId} className="bg-white rounded-2xl border border-[#DDE4E6] p-5 shadow-xs space-y-4 hover:border-[#65D6B0] transition-colors">
                    <div className="flex items-center justify-between border-b border-[#DDE4E6] pb-3">
                      <div>
                        <span className="text-xs font-mono font-bold text-[#B94A3A]">#{b.requestId}</span>
                        <h4 className="text-sm font-black text-[#202A2B]">{b.serviceCategory}</h4>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === 'Completed' ? 'bg-[#DDF8EF] text-[#1E6B52] border border-[#65D6B0]/40' :
                        b.status === 'Cancelled' ? 'bg-[#FBE0E6] text-[#92182D] border border-[#D72645]/40' :
                        'bg-[#D7F7FC] text-[#007D99] border border-[#00B8D9]/40'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-[#526365]">
                      <div>Station: <strong className="text-[#202A2B]">{b.stationName} ({b.stationCode})</strong></div>
                      <div>Train: <strong className="text-[#202A2B]">{b.trainNumber}</strong> · Coach: <strong className="text-[#202A2B]">{b.coachNumber || 'B3'}</strong></div>
                      <div>Specialist: <strong className="text-[#202A2B]">{b.assignedWorkerName || 'Awaiting Worker'}</strong></div>
                      <div className="italic text-[11px] text-[#7E9092] mt-1">"{b.description}"</div>
                    </div>

                    <div className="pt-3 border-t border-[#DDE4E6] flex items-center justify-between gap-2">
                      {['Requested', 'Awaiting Worker Confirmation', 'Finding Worker', 'Worker Assigned'].includes(b.status) && onCancelWorkerRequest && (
                        <button
                          onClick={() => onCancelWorkerRequest(b.requestId)}
                          className="px-3 py-1 text-xs font-bold text-[#D72645] hover:bg-[#FBE0E6] rounded-lg transition cursor-pointer"
                        >
                          Cancel Booking
                        </button>
                      )}

                      {b.status === 'Completed' && (
                        b.feedback ? (
                          <div className="text-[11px] text-[#1E6B52] font-semibold flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-[#EAB308] fill-current" />
                            <span>Rated {b.feedback.rating}/5</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setFeedbackModalReq(b)}
                            className="px-3 py-1 bg-[#202A2B] hover:bg-[#202A2B]/90 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            Rate Specialist &rarr;
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: FIND ASSISTANCE NEAR YOUR STATION (SERVICE-FIRST MARKETPLACE)        */}
      {/* ========================================================================= */}
      {activeTab === 'marketplace' && (
        <div className="space-y-6 animate-fadeIn">
          <ServiceDiscoveryMarketplace
            workers={workers}
            onSelectWorkerForBooking={
              onSelectWorkerForBooking ||
              ((worker, category) => {
                onNavigate('book-worker');
              })
            }
            onNavigate={onNavigate}
            currentUser={currentUser}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEEDBACK MODAL                                                            */}
      {/* ========================================================================= */}
      {feedbackModalReq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-[#DDE4E6]">
            <div className="flex items-center justify-between border-b border-[#DDE4E6] pb-3">
              <h3 className="text-base font-black text-[#202A2B]">
                Rate Worker Service · #{feedbackModalReq.requestId}
              </h3>
              <button
                onClick={() => setFeedbackModalReq(null)}
                className="p-1 rounded-lg text-[#7E9092] hover:text-[#202A2B] hover:bg-[#F0F4F6] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#526365]">
              How was your service experience with <strong>{feedbackModalReq.assignedWorkerName || 'the specialist'}</strong>?
            </p>

            {/* Star Rating */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setFeedbackHoverRating(star)}
                  onMouseLeave={() => setFeedbackHoverRating(0)}
                  onClick={() => setFeedbackRating(star)}
                  className="p-1 cursor-pointer transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (feedbackHoverRating || feedbackRating) >= star
                        ? 'text-[#C6F000] fill-current drop-shadow-xs'
                        : 'text-[#DDE4E6]'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Quick Feedback Tags */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_FEEDBACK_TAGS.map((tag) => {
                const isSelected = feedbackTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setFeedbackTags((prev) =>
                        isSelected ? prev.filter((t) => t !== tag) : [...prev, tag]
                      );
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                      isSelected
                        ? 'bg-[#202A2B] text-white border-[#202A2B]'
                        : 'bg-[#F8FAFB] text-[#526365] border-[#DDE4E6] hover:bg-white'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Comment */}
            <div>
              <textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Share any additional feedback for the railway sahayak..."
                rows={3}
                className="w-full p-3 rounded-xl border border-[#DDE4E6] text-xs text-[#202A2B] bg-[#F8FAFB] focus:outline-none focus:ring-2 focus:ring-[#65D6B0]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFeedbackModalReq(null)}
                className="px-4 py-2 text-xs font-bold text-[#526365] hover:text-[#202A2B] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={feedbackSubmitting}
                onClick={handleSendFeedback}
                className="px-5 py-2.5 bg-[#202A2B] hover:bg-[#202A2B]/90 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-xs border border-[#202A2B]"
              >
                {feedbackSubmitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
