import React, { useState } from 'react';
import { User, ViewMode, WorkerServiceRequest } from '../types';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  Train, 
  Search, 
  Filter,
  Sparkles,
  MapPin,
  Phone,
  UserCheck,
  Star,
  Send,
  X,
  PlusCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface UserDashboardProps {
  currentUser: User;
  complaints?: any[];
  workerRequests?: WorkerServiceRequest[];
  onCancelWorkerRequest?: (requestId: string) => void;
  onSubmitWorkerFeedback?: (
    requestId: string,
    rating: number,
    comment: string,
    tags: string[]
  ) => Promise<{ success: boolean; message: string }>;
  onNavigate: (view: ViewMode) => void;
  onSelectComplaint?: (complaint: any) => void;
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
}) => {
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Completed' | 'Cancelled'>('All');
  const [search, setSearch] = useState('');

  // Feedback State
  const [feedbackModalReq, setFeedbackModalReq] = useState<WorkerServiceRequest | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackHoverRating, setFeedbackHoverRating] = useState<number>(0);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [feedbackTags, setFeedbackTags] = useState<string[]>(['⚡ Rapid Arrival', '🤝 Courteous & Humble']);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Filter worker requests strictly belonging to this passenger (matched by ID or registered email for multi-device sync)
  const userWorkerRequests = (workerRequests || []).filter((r) => {
    if (!r) return false;
    const matchesId = currentUser?.id && r.passengerId === currentUser.id;
    const matchesEmail =
      currentUser?.email &&
      r.passengerEmail &&
      r.passengerEmail.toLowerCase().trim() === currentUser.email.toLowerCase().trim();
    return matchesId || matchesEmail;
  });

  // KPI Metrics for Worker Services
  const totalBookings = userWorkerRequests.length;
  const activeBookings = userWorkerRequests.filter((r) =>
    ['Requested', 'Finding Worker', 'Worker Assigned', 'On the Way', 'Arrived at Station', 'Service In Progress'].includes(r.status)
  ).length;
  const completedBookings = userWorkerRequests.filter((r) => r.status === 'Completed').length;
  const feedbackGivenCount = userWorkerRequests.filter((r) => Boolean(r.feedback)).length;

  // Search & Status Filtering
  const displayedRequests = userWorkerRequests.filter((r) => {
    if (!r) return false;
    const isCompleted = r.status === 'Completed';
    const isCancelled = r.status === 'Cancelled' || r.status === 'Declined';
    const isActive = !isCompleted && !isCancelled;

    let matchesStatus = true;
    if (filterStatus === 'Active') matchesStatus = isActive;
    else if (filterStatus === 'Completed') matchesStatus = isCompleted;
    else if (filterStatus === 'Cancelled') matchesStatus = isCancelled;

    const q = (search || '').trim().toLowerCase();
    const matchesSearch =
      !q ||
      String(r.requestId || '').toLowerCase().includes(q) ||
      String(r.trainNumber || '').toLowerCase().includes(q) ||
      String(r.stationName || '').toLowerCase().includes(q) ||
      String(r.stationCode || '').toLowerCase().includes(q) ||
      String(r.serviceCategory || '').toLowerCase().includes(q) ||
      String(r.assignedWorkerName || '').toLowerCase().includes(q) ||
      String(r.description || '').toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Welcome & Primary Booking Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D3] shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF5DC] text-[#142B4A] text-[11px] font-extrabold uppercase tracking-wider mb-2 border border-[#E9B949]/30">
            PASSENGER ASSISTANCE HUB
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] tracking-tight">
            Welcome, {currentUser.fullName}
          </h1>
          <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
            Need an on-train technician, cleaner, porter, or medical assistant? Book verified gig workers who meet your train coach and solve problems on the spot.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-[#6B7280]">
            <span>Email: <strong className="text-[#253247]">{currentUser.email}</strong></span>
            <span>·</span>
            <span>Mobile: <strong className="text-[#253247]">{currentUser.mobile}</strong></span>
            <span className="hidden sm:inline">·</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#21865B] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-[#21865B] animate-pulse"></span>
              Live Multi-Device Sync
            </span>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="shrink-0 w-full sm:w-auto">
          <button
            onClick={() => onNavigate('book-worker')}
            className="w-full sm:w-auto px-5 py-3.5 bg-[#E9B949] hover:bg-[#d6a537] text-[#142B4A] text-xs font-extrabold rounded-2xl shadow-sm transition-all border border-[#142B4A]/20 flex items-center justify-center gap-2 cursor-pointer hover:shadow-md"
          >
            <Briefcase className="w-4 h-4 text-[#142B4A]" />
            <span>Book a Railway Worker</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#142B4A]" />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards for Worker Services */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Bookings */}
        <div className="bg-white rounded-2xl border border-[#E8E2D3] p-5 sm:p-6 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
              Total Bookings
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] mt-1 font-mono tabular-nums">
              {totalBookings}
            </div>
            <p className="text-[10px] text-[#6B7280] mt-0.5">Assistance calls placed</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FFF5DC] text-[#142B4A] flex items-center justify-center border border-[#E9B949]/30">
            <Briefcase className="w-5 h-5 text-[#142B4A]" />
          </div>
        </div>

        {/* Active / In Progress */}
        <div className="bg-white rounded-2xl border border-[#E8E2D3] p-5 sm:p-6 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
              En Route / In Progress
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#315F91] mt-1 font-mono tabular-nums">
              {activeBookings}
            </div>
            <p className="text-[10px] text-[#315F91] mt-0.5 font-medium">Workers dispatched</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#EEF4FA] text-[#315F91] flex items-center justify-center border border-[#315F91]/20">
            <Train className="w-5 h-5 text-[#315F91]" />
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl border border-[#E8E2D3] p-5 sm:p-6 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
              Completed Assistance
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#21865B] mt-1 font-mono tabular-nums">
              {completedBookings}
            </div>
            <p className="text-[10px] text-[#21865B] mt-0.5 font-medium">Problems resolved on spot</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#EDF7F2] text-[#21865B] flex items-center justify-center border border-[#21865B]/20">
            <CheckCircle2 className="w-5 h-5 text-[#21865B]" />
          </div>
        </div>

        {/* Feedback Recorded */}
        <div className="bg-white rounded-2xl border border-[#E8E2D3] p-5 sm:p-6 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
              Reviews & Ratings
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1 font-mono tabular-nums flex items-center gap-1">
              <span>{feedbackGivenCount}</span>
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <p className="text-[10px] text-[#6B7280] mt-0.5">Worker feedback logged</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FFF8E7] text-amber-600 flex items-center justify-center border border-[#E9B949]/30">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>
        </div>

      </div>

      {/* Main Worker Requests Section */}
      <div className="bg-white rounded-3xl border border-[#E8E2D3] shadow-xs p-6 sm:p-8 space-y-6">
        
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-[#E8E2D3]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-[#E9B949] text-[#142B4A] text-[10px] font-extrabold uppercase rounded">
                ON-DEMAND WORKFORCE
              </span>
              <span className="text-xs text-[#6B7280]">Real-Time Train Coach Delivery</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#142B4A]">
              My Worker Bookings & Assistance
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Track technicians and sahayaks assigned to your journey, review status, and leave passenger feedback.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search booking, train, worker..."
                className="pl-9 pr-3 py-2 text-xs bg-[#FFFDF5] border border-[#E8E2D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A] w-full sm:w-56"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#FFF5DC] p-1 rounded-xl border border-[#E8E2D3]">
              {(['All', 'Active', 'Completed', 'Cancelled'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterStatus(tab)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    filterStatus === tab
                      ? 'bg-[#142B4A] text-white shadow-xs font-bold'
                      : 'text-[#253247] hover:text-[#142B4A]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              onClick={() => onNavigate('book-worker')}
              className="px-4 py-2 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#E9B949]" />
              <span>Book Worker</span>
            </button>
          </div>
        </div>

        {/* Requests List */}
        {displayedRequests.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF5DC] text-[#142B4A] flex items-center justify-center mx-auto border border-[#E9B949]/30">
              <Briefcase className="w-7 h-7 text-[#142B4A]" />
            </div>
            <h3 className="font-bold text-base text-[#142B4A]">
              {search || filterStatus !== 'All' ? 'No Matching Bookings' : 'No Active Worker Requests'}
            </h3>
            <p className="text-xs text-[#6B7280] max-w-md mx-auto">
              {search || filterStatus !== 'All'
                ? 'Try adjusting your search terms or filter to find your worker bookings.'
                : 'Need assistance on your journey? Book a verified electrician, plumber, cleaner, luggage sahayak, or first aid medical attendant at your upcoming station in 60 seconds.'}
            </p>
            <button
              onClick={() => onNavigate('book-worker')}
              className="mt-3 px-6 py-2.5 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-[#E9B949]" />
              <span>Book a Railway Worker</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {displayedRequests.map((req) => {
              const stages = [
                'Requested',
                'Finding Worker',
                'Worker Assigned',
                'On the Way',
                'Arrived at Station',
                'Service In Progress',
                'Completed',
              ];
              const currentStageIdx = stages.indexOf(req.status);
              const isCancelled = req.status === 'Cancelled' || req.status === 'Declined';

              return (
                <div
                  key={req.id}
                  className="rounded-2xl border border-[#E8E2D3] bg-[#FFFDF5] p-5 sm:p-6 shadow-xs space-y-5"
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#E8E2D3]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-[#142B4A] text-white px-2 py-0.5 rounded">
                        {req.requestId}
                      </span>
                      <span className="font-extrabold text-sm text-[#142B4A]">
                        {req.serviceCategory}
                      </span>
                      <span className="text-xs text-[#6B7280]">
                        · Train: <strong className="text-[#253247]">{req.trainNumber}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 text-xs font-extrabold rounded-full ${
                          req.status === 'Completed'
                            ? 'bg-[#EDF7F2] text-[#156140] border border-[#21865B]/30'
                            : isCancelled
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-[#FFF5DC] text-[#142B4A] border border-[#E9B949]/40'
                        }`}
                      >
                        {req.status}
                      </span>

                      {!['Completed', 'Cancelled', 'Declined'].includes(req.status) && onCancelWorkerRequest && (
                        <button
                          onClick={() => onCancelWorkerRequest(req.requestId)}
                          className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline cursor-pointer ml-1"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Visual Progress Bar Tracker */}
                  {!isCancelled && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                        <span>Requested</span>
                        <span className="hidden sm:inline">Finding Worker</span>
                        <span>Assigned</span>
                        <span className="hidden sm:inline">On the Way</span>
                        <span className="hidden md:inline">Arrived</span>
                        <span>In Progress</span>
                        <span>Completed</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                        <div
                          className="bg-gradient-to-r from-[#142B4A] via-[#E9B949] to-[#21865B] h-full transition-all duration-500 rounded-full"
                          style={{
                            width: `${Math.max(14, ((currentStageIdx + 1) / stages.length) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs bg-white p-4 rounded-xl border border-[#E8E2D3]">
                    <div>
                      <span className="text-[10px] font-bold text-[#6B7280] uppercase block">
                        Meeting Station
                      </span>
                      <span className="font-extrabold text-[#142B4A] text-sm">
                        {req.stationName} ({req.stationCode})
                      </span>
                      {req.expectedArrivalTime && (
                        <p className="text-[11px] text-[#6B7280] mt-0.5">
                          Expected: <strong>{req.expectedArrivalTime}</strong>
                        </p>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#6B7280] uppercase block">
                        Coach & Seat
                      </span>
                      <span className="font-semibold text-[#253247]">
                        Coach: {req.coachNumber || 'N/A'} · Seat: {req.seatNumber || 'N/A'}
                      </span>
                      {req.trainName && (
                        <p className="text-[11px] text-[#6B7280] mt-0.5">
                          {req.trainName}
                        </p>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#6B7280] uppercase block">
                        Assigned Station Worker
                      </span>
                      {req.assignedWorkerName ? (
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-[#21865B] flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5" />
                            {req.assignedWorkerName}
                          </span>
                          {req.assignedWorkerMobile && (
                            <p className="text-[11px] text-[#6B7280] flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {req.assignedWorkerMobile}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#6B7280] italic">
                          Locating available station worker...
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Request Description & Notes */}
                  <div className="text-xs text-[#253247] space-y-1">
                    <span className="font-bold text-[#142B4A]">Problem / Assistance Details:</span>
                    <p className="text-[#6B7280] italic">"{req.description}"</p>
                    {req.completionNotes && (
                      <div className="mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px]">
                        <strong>Resolution Summary by Worker:</strong> {req.completionNotes}
                      </div>
                    )}
                  </div>

                  {/* Passenger Feedback for Worker Section */}
                  <div className="pt-2 border-t border-[#E8E2D3]">
                    {req.feedback ? (
                      <div className="bg-gradient-to-r from-[#FFFDF5] to-[#FFF5DC]/50 border border-[#E9B949]/60 rounded-2xl p-4 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold uppercase text-[#142B4A] tracking-wider">
                              Your Rating & Review for Worker
                            </span>
                            <span className="inline-flex items-center gap-1 bg-[#EDF7F2] text-[#156140] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#21865B]/30">
                              <CheckCircle2 className="w-3 h-3 text-[#21865B]" />
                              Verified Feedback
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= req.feedback!.rating
                                    ? 'text-amber-500 fill-amber-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-xs font-bold text-[#142B4A] ml-1">
                              {req.feedback.rating}/5
                            </span>
                          </div>
                        </div>

                        {req.feedback.tags && req.feedback.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {req.feedback.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] font-bold bg-white text-[#142B4A] border border-[#E8E2D3] px-2.5 py-0.5 rounded-md shadow-2xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {req.feedback.comment && (
                          <p className="text-xs text-[#253247] italic bg-white/80 p-3 rounded-xl border border-[#E8E2D3]">
                            "{req.feedback.comment}"
                          </p>
                        )}

                        <div className="text-[10px] text-[#6B7280]">
                          Recorded on {req.feedback.createdAt}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#FFFDF5] border border-dashed border-[#E9B949] rounded-2xl p-4">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-[#E9B949]" />
                            <h4 className="text-xs font-extrabold text-[#142B4A]">
                              Rate & Review {req.assignedWorkerName || 'Station Worker'}
                            </h4>
                          </div>
                          <p className="text-[11px] text-[#6B7280] mt-0.5">
                            Share your feedback on worker punctuality, courtesy, and service quality.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setFeedbackModalReq(req);
                            setFeedbackRating(5);
                            setFeedbackComment('');
                            setFeedbackTags(['⚡ Rapid Arrival', '🤝 Courteous & Humble']);
                          }}
                          className="px-4 py-2 bg-[#E9B949] hover:bg-[#d6a537] text-[#142B4A] text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                        >
                          <Star className="w-3.5 h-3.5 fill-[#142B4A]" />
                          <span>Leave Worker Feedback</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Feedback & Review Modal */}
      {feedbackModalReq && (
        <div className="fixed inset-0 z-50 bg-[#142B4A]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E8E2D3] shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#E8E2D3]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-[#FFF5DC] text-[#142B4A] text-[10px] font-extrabold rounded uppercase border border-[#E9B949]/50">
                    PASSENGER FEEDBACK
                  </span>
                  <span className="text-xs text-[#6B7280] font-mono">
                    #{feedbackModalReq.requestId}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-[#142B4A]">
                  Rate Worker Service
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Worker: <strong className="text-[#142B4A]">{feedbackModalReq.assignedWorkerName || 'Assigned Specialist'}</strong> · Station: {feedbackModalReq.stationName}
                </p>
              </div>

              <button
                onClick={() => setFeedbackModalReq(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Star Selector */}
            <div className="space-y-2 text-center py-2">
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block">
                How would you rate your overall experience?
              </span>

              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (feedbackHoverRating || feedbackRating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setFeedbackHoverRating(star)}
                      onMouseLeave={() => setFeedbackHoverRating(0)}
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          isFilled
                            ? 'text-amber-500 fill-amber-500 drop-shadow-xs'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="text-xs font-extrabold text-[#142B4A]">
                {feedbackRating === 5 && '🌟 Outstanding & Highly Recommended'}
                {feedbackRating === 4 && '😊 Very Good Service'}
                {feedbackRating === 3 && '🙂 Satisfactory / Good'}
                {feedbackRating === 2 && '😐 Needs Improvement'}
                {feedbackRating === 1 && '😞 Poor Experience'}
              </div>
            </div>

            {/* Quick Compliment Tags */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#142B4A] uppercase tracking-wider block">
                Quick Compliments (Select all that apply):
              </label>
              <div className="flex flex-wrap gap-2">
                {QUICK_FEEDBACK_TAGS.map((tag) => {
                  const selected = feedbackTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setFeedbackTags((prev) =>
                          prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                        );
                      }}
                      className={`text-xs px-3 py-1.5 rounded-xl font-bold transition cursor-pointer border ${
                        selected
                          ? 'bg-[#142B4A] text-white border-[#142B4A] shadow-xs'
                          : 'bg-[#FFFDF5] text-[#253247] border-[#E8E2D3] hover:border-[#142B4A]'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#142B4A] uppercase tracking-wider block">
                Detailed Passenger Review & Notes:
              </label>
              <textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                rows={3}
                placeholder="Share details (e.g. Worker arrived on time at Coach B3, repaired the plug quickly, very helpful with luggage)..."
                className="w-full text-xs p-3 bg-[#FFFDF5] border border-[#E8E2D3] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#142B4A] resize-none"
              />
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E2D3]">
              <button
                type="button"
                onClick={() => setFeedbackModalReq(null)}
                className="px-4 py-2.5 text-xs font-bold text-[#6B7280] hover:text-[#142B4A] rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={feedbackSubmitting}
                onClick={async () => {
                  if (!feedbackModalReq) return;
                  setFeedbackSubmitting(true);
                  try {
                    if (onSubmitWorkerFeedback) {
                      await onSubmitWorkerFeedback(
                        feedbackModalReq.requestId,
                        feedbackRating,
                        feedbackComment,
                        feedbackTags
                      );
                    } else {
                      await fetch(`/api/worker-requests/${feedbackModalReq.requestId}/feedback`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          rating: feedbackRating,
                          comment: feedbackComment,
                          tags: feedbackTags,
                          passengerId: currentUser.id,
                          passengerName: currentUser.fullName,
                        }),
                      });
                    }
                    setFeedbackModalReq(null);
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setFeedbackSubmitting(false);
                  }
                }}
                className="px-5 py-2.5 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-[#E9B949]" />
                <span>{feedbackSubmitting ? 'Recording Feedback...' : 'Submit Feedback'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
