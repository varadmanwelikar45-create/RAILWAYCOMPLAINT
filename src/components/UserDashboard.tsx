import React, { useState, useEffect } from 'react';
import { User, ViewMode, WorkerServiceRequest, Worker, WorkerSkillCategory, Complaint } from '../types';
import { ServiceDiscoveryMarketplace } from './ServiceDiscoveryMarketplace';
import { MutualGoogleMap } from './MutualGoogleMap';
import { AIVoiceAssistantModal } from './AIVoiceAssistantModal';
import { 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Star, 
  X, 
  PlusCircle, 
  ArrowLeft, 
  Compass, 
  Clock, 
  Briefcase, 
  Train, 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle, 
  Camera, 
  ShieldAlert, 
  Eye, 
  ChevronRight,
  LocateFixed,
  FileCheck,
  Mic,
  Radio,
  Navigation,
  Bot
} from 'lucide-react';

interface UserDashboardProps {
  currentUser: User;
  complaints?: Complaint[];
  workerRequests?: WorkerServiceRequest[];
  workers?: Worker[];
  onSubmitComplaint?: (
    newComplaint: Omit<Complaint, 'id' | 'complaintId' | 'createdAt' | 'updatedAt'>
  ) => Promise<Complaint> | Complaint;
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
  '🔧 Clean & Skilled Fix',
  '⏰ Reached Berth on Time',
  '📸 Verified Photo Proof',
  '👍 Highly Recommended'
];

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  complaints = [],
  workerRequests = [],
  workers = [],
  onSubmitComplaint,
  onCancelWorkerRequest,
  onSubmitWorkerFeedback,
  onSelectWorkerForBooking,
  onNavigate,
  onRefreshData,
  onRefreshWorkers,
  onBack,
}) => {
  // Voice Modal State
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [expandedMapId, setExpandedMapId] = useState<string | null>(null);

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

  // Filter complaints belonging to current passenger
  const userComplaints = (complaints || []).filter((c) => {
    if (!c) return false;
    const matchesId = currentUser?.id && c.userId === currentUser.id;
    const matchesEmail =
      currentUser?.email &&
      c.passengerEmail &&
      c.passengerEmail.toLowerCase().trim() === currentUser.email.toLowerCase().trim();
    return matchesId || matchesEmail;
  });

  // Active items
  const activeBookings = userBookings.filter((r) =>
    ['Requested', 'Awaiting Worker Confirmation', 'Finding Worker', 'Worker Assigned', 'On the Way', 'Arrived at Station', 'Service In Progress'].includes(r.status)
  );
  const activeComplaints = userComplaints.filter((c) => c.status !== 'Resolved');

  const [activeTab, setActiveTab] = useState<'tracker' | 'marketplace' | 'history'>('tracker');
  const [photoProofModal, setPhotoProofModal] = useState<{
    title: string;
    before?: string;
    after?: string;
    notes?: string;
    workerName?: string;
    resolvedAt?: string;
  } | null>(null);

  // Feedback Modal State
  const [feedbackModalReq, setFeedbackModalReq] = useState<WorkerServiceRequest | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [feedbackTags, setFeedbackTags] = useState<string[]>(['⚡ Rapid Arrival', '📸 Verified Photo Proof']);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  // Periodic refresh
  useEffect(() => {
    const interval = setInterval(() => {
      onRefreshData?.();
    }, 6000);
    return () => clearInterval(interval);
  }, [onRefreshData]);

  // Helper for CAG SLA Countdown
  const calculateSlaStatus = (item: Complaint | WorkerServiceRequest) => {
    const createdTime = new Date((item.createdAt || '').replace(' ', 'T')).getTime();
    if (isNaN(createdTime)) {
      return { minsRemaining: 120, isBreached: false, text: '120m left · Within SLA' };
    }
    const elapsedMins = Math.floor((Date.now() - createdTime) / 60000);
    const minsRemaining = Math.max(0, 120 - elapsedMins);
    const isBreached = minsRemaining <= 0;
    return {
      minsRemaining,
      isBreached,
      text: isBreached
        ? 'SLA Breached (>2h) · Auto-Escalated to Station Superintendent'
        : `${minsRemaining}m remaining (CAG 2h SLA)`,
    };
  };

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-[#DDE4E6] shadow-xs">
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
            <span className="text-[10px] font-black text-[#007D99] bg-[#D7F7FC] px-2.5 py-0.5 rounded-full border border-[#00B8D9]/40 uppercase tracking-wider">
              PASSENGER PORTAL
            </span>
            <span className="text-xs text-[#526365]">
              {currentUser.fullName} · {currentUser.mobile}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#202A2B] tracking-tight">
            Railway Grievance &amp; Station Assistance
          </h1>
          <p className="text-xs text-[#526365]">
            Track verified on-ground technician resolution, inspect before-and-after photo proof, and coordinate during platform halts.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="flex-1 md:flex-none px-4 py-2.5 bg-[#202A2B] hover:bg-[#202A2B]/90 text-white text-xs font-black rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer border border-[#65D6B0]/40"
          >
            <Mic className="w-4 h-4 text-[#65D6B0] animate-pulse" />
            <span>🎙️ Speak to AI Sahayak</span>
          </button>

          <button
            onClick={() => onNavigate('register-complaint')}
            className="flex-1 md:flex-none px-4 py-2.5 bg-[#65D6B0] hover:bg-[#3EA684] text-[#202A2B] text-xs font-black rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#202A2B]" />
            <span>AI Voice &amp; Photo Grievance</span>
          </button>

          <button
            onClick={() => onNavigate('book-worker')}
            className="flex-1 md:flex-none px-4 py-2.5 bg-[#F0F4F6] hover:bg-slate-200 text-[#202A2B] text-xs font-black rounded-xl transition flex items-center justify-center gap-2 cursor-pointer border border-[#DDE4E6]"
          >
            <PlusCircle className="w-4 h-4 text-[#007D99]" />
            <span>Book Station Sahayak</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DDE4E6] pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('tracker')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer ${
            activeTab === 'tracker'
              ? 'bg-[#202A2B] text-white shadow-xs'
              : 'text-[#526365] hover:bg-[#F0F4F6] hover:text-[#202A2B]'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-[#65D6B0]" />
          <span>Active Grievances &amp; Resolution ({activeComplaints.length + activeBookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('marketplace')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer ${
            activeTab === 'marketplace'
              ? 'bg-[#007D99] text-white shadow-xs'
              : 'text-[#526365] hover:bg-[#F0F4F6] hover:text-[#202A2B]'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-[#D7F7FC]" />
          <span>Book Sahayak / Station Services</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#202A2B] text-white shadow-xs'
              : 'text-[#526365] hover:bg-[#F0F4F6] hover:text-[#202A2B]'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5 text-[#65D6B0]" />
          <span>Resolved History &amp; Evidence ({userComplaints.filter(c => c.status === 'Resolved').length + userBookings.filter(b => b.status === 'Completed').length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ACTIVE GRIEVANCES & LIVE RESOLUTION TRACKER                        */}
      {/* ========================================================================= */}
      {activeTab === 'tracker' && (
        <div className="space-y-6">
          
          {/* Active Grievances List */}
          {activeComplaints.length === 0 && activeBookings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#DDE4E6] p-10 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-[#3EA684] mx-auto" />
              <h3 className="text-base font-bold text-[#202A2B]">No Pending Grievances</h3>
              <p className="text-xs text-[#526365] max-w-md mx-auto">
                You have no active unresolved grievances or pending bookings. Use "AI Voice &amp; Photo Grievance" or "Book Station Sahayak" if you require assistance during your journey.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* COMPLAINTS (AI GRIEVANCES) */}
              {activeComplaints.map((c) => {
                const sla = calculateSlaStatus(c);
                const isEmergency = c.priority === 'Emergency' || c.severity === 'Urgent';

                return (
                  <div
                    key={c.complaintId}
                    className="bg-white rounded-2xl border border-[#DDE4E6] p-5 shadow-xs space-y-4 hover:border-[#65D6B0] transition"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DDE4E6]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#B94A3A]">
                          #{c.complaintId}
                        </span>
                        {c.railMadadRef && (
                          <span className="font-mono text-[10px] font-black bg-[#F0F4F6] text-[#202A2B] px-2 py-0.5 rounded border border-[#DDE4E6]" title="Linked RailMadad Grievance ID">
                            RailMadad: {c.railMadadRef}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          isEmergency ? 'bg-[#FBE0E6] text-[#92182D] border border-[#D72645]/40 animate-pulse' :
                          c.priority === 'High' ? 'bg-orange-100 text-orange-900 border border-orange-200' :
                          'bg-[#D7F7FC] text-[#007D99] border border-[#00B8D9]/40'
                        }`}>
                          Priority: {c.priority || c.severity || 'Medium'}
                        </span>
                      </div>

                      {/* CAG 2-Hour SLA Timer */}
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
                        sla.isBreached
                          ? 'bg-[#FBE0E6] text-[#92182D] border border-[#D72645]/40'
                          : sla.minsRemaining <= 30
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-[#DDF8EF] text-[#1E6B52] border border-[#65D6B0]/40'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{sla.text}</span>
                      </div>
                    </div>

                    {/* Safety Alert for Emergency Cases */}
                    {isEmergency && (
                      <div className="p-3 bg-[#FBE0E6] border border-[#D72645]/40 rounded-xl text-xs text-[#92182D] flex items-center gap-2 font-medium">
                        <ShieldAlert className="w-4 h-4 text-[#D72645] shrink-0" />
                        <span>
                          <strong>RPF Emergency Escalation Active:</strong> This priority grievance has been forwarded directly to the Railway Protection Force (Helpline 139) &amp; Station Superintendent for immediate intervention.
                        </span>
                      </div>
                    )}

                    {/* Problem Description & Train Location */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                      <div className="md:col-span-8 space-y-1.5">
                        <h4 className="text-sm font-black text-[#202A2B]">{c.subject}</h4>
                        <p className="text-[#526365] leading-relaxed">{c.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#7E9092] pt-1">
                          <span>Train: <strong className="text-[#202A2B]">{c.trainNumber}</strong></span>
                          <span>·</span>
                          <span>Category: <strong className="text-[#202A2B]">{c.category}</strong></span>
                          {c.location && (
                            <>
                              <span>·</span>
                              <span>Coach/Berth: <strong className="text-[#202A2B]">{c.location}</strong></span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Specialist Assignment Status */}
                      <div className="md:col-span-4 bg-[#F8FAFB] p-3.5 rounded-xl border border-[#DDE4E6] flex flex-col justify-between space-y-2.5">
                        <div>
                          <span className="text-[10px] text-[#526365] font-bold block uppercase tracking-wider">
                            On-Ground Specialist
                          </span>
                          {c.assignedWorkerName ? (
                            <div className="mt-1 space-y-1">
                              <span className="text-xs font-black text-[#202A2B] block">
                                {c.assignedWorkerName}
                              </span>
                              <span className="text-[11px] text-[#007D99] block font-semibold">
                                {c.assignedWorkerSkill || 'Station Duty Technician'}
                              </span>
                              {c.assignedWorkerMobile && (
                                <a
                                  href={`tel:${c.assignedWorkerMobile}`}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1E6B52] hover:underline"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>Call: {c.assignedWorkerMobile}</span>
                                </a>
                              )}
                            </div>
                          ) : (
                            <div className="mt-1 space-y-1">
                              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                                <Clock className="w-3 h-3 animate-spin" />
                                <span>Awaiting Officer Dispatch</span>
                              </div>
                              <p className="text-[11px] text-[#526365]">
                                Control Room officer is verifying complaint &amp; selecting authorized specialist.
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-[#DDE4E6] flex items-center justify-between">
                          <span className="text-[10px] text-[#526365]">Stage:</span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                            c.status === 'In Progress'
                              ? 'bg-[#DDF8EF] text-[#1E6B52] border border-[#65D6B0]/40'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            {c.status === 'Pending' ? 'Transmitted to Officer' : c.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Google Maps Mutual Tracking View for Complaint */}
                    {c.assignedWorkerName && (
                      <div className="pt-2 border-t border-[#DDE4E6]">
                        <button
                          onClick={() => setExpandedMapId(expandedMapId === c.complaintId ? null : c.complaintId)}
                          className="w-full py-2 px-3 bg-[#007D99] hover:bg-[#007D99]/90 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                        >
                          <Navigation className="w-3.5 h-3.5 text-[#65D6B0]" />
                          <span>
                            {expandedMapId === c.complaintId
                              ? 'Hide Live Google Map'
                              : `🗺️ Live Google Maps: Track ${c.assignedWorkerName} Approaching Coach`}
                          </span>
                        </button>

                        {expandedMapId === c.complaintId && (
                          <div className="mt-3">
                            <MutualGoogleMap
                              userRole="passenger"
                              requestId={c.complaintId}
                              trainNumber={c.trainNumber}
                              coachNumber={c.location?.split(',')[0]?.trim() || 'Coach B3'}
                              seatNumber={c.location?.split(',')[1]?.trim() || 'Berth 24'}
                              stationName="New Delhi Junction"
                              stationCode="NDLS"
                              passengerName={c.passengerName}
                              workerName={c.assignedWorkerName}
                              workerSkill={c.assignedWorkerSkill || 'Station Duty Technician'}
                              workerStatusText="En route along Platform 2 to Coach"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* BOOKINGS (SAHAYAK DIRECT CALLS) */}
              {activeBookings.map((b) => {
                const sla = calculateSlaStatus(b);
                return (
                  <div
                    key={b.requestId}
                    className="bg-white rounded-2xl border border-[#DDE4E6] p-5 shadow-xs space-y-4 hover:border-[#007D99] transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DDE4E6]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#007D99]">
                          #{b.requestId}
                        </span>
                        <span className="font-bold text-xs text-[#202A2B]">
                          {b.serviceCategory}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D7F7FC] text-[#007D99] border border-[#00B8D9]/40">
                          Stage: {b.status}
                        </span>
                        <span className="text-xs text-[#526365] font-mono">
                          {sla.text}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                      <div className="md:col-span-8 space-y-1.5">
                        <p className="text-[#202A2B] leading-relaxed">"{b.description}"</p>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#7E9092]">
                          <span>Train: <strong className="text-[#202A2B]">{b.trainNumber}</strong></span>
                          <span>·</span>
                          <span>Coach: <strong className="text-[#202A2B]">{b.coachNumber || 'B3'}</strong> (Berth {b.seatNumber || '24'})</span>
                          <span>·</span>
                          <span>Halt Station: <strong className="text-[#202A2B]">{b.stationName}</strong></span>
                        </div>
                      </div>

                      <div className="md:col-span-4 bg-[#F8FAFB] p-3 rounded-xl border border-[#DDE4E6] flex flex-col justify-between space-y-2">
                        <div>
                          <span className="text-[10px] text-[#526365] font-bold block uppercase tracking-wider">
                            Sahayak on Duty
                          </span>
                          <span className="text-xs font-black text-[#202A2B] block mt-0.5">
                            {b.assignedWorkerName || 'Broadcasting to Station Hub'}
                          </span>
                          {b.assignedWorkerMobile && (
                            <a
                              href={`tel:${b.assignedWorkerMobile}`}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1E6B52] hover:underline mt-1"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{b.assignedWorkerMobile}</span>
                            </a>
                          )}
                        </div>

                        {onCancelWorkerRequest && (
                          <button
                            onClick={() => onCancelWorkerRequest(b.requestId)}
                            className="text-[11px] text-[#D72645] hover:underline self-start cursor-pointer font-semibold pt-1"
                          >
                            Cancel Request
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Google Maps Mutual Tracking for Booking */}
                    {b.assignedWorkerName && (
                      <div className="pt-2 border-t border-[#DDE4E6]">
                        <button
                          onClick={() => setExpandedMapId(expandedMapId === b.requestId ? null : b.requestId)}
                          className="w-full py-2 px-3 bg-[#007D99] hover:bg-[#007D99]/90 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                        >
                          <Navigation className="w-3.5 h-3.5 text-[#65D6B0]" />
                          <span>
                            {expandedMapId === b.requestId
                              ? 'Hide Live Google Map'
                              : `🗺️ Live Google Maps: Track Sahayak ${b.assignedWorkerName} on Platform`}
                          </span>
                        </button>

                        {expandedMapId === b.requestId && (
                          <div className="mt-3">
                            <MutualGoogleMap
                              userRole="passenger"
                              requestId={b.requestId}
                              trainNumber={b.trainNumber}
                              coachNumber={b.coachNumber || 'B3'}
                              seatNumber={b.seatNumber || 'Berth 24'}
                              stationName={b.stationName || 'New Delhi Junction'}
                              stationCode={b.stationCode || 'NDLS'}
                              passengerName={b.passengerName}
                              workerName={b.assignedWorkerName}
                              workerSkill={b.serviceCategory}
                              workerStatusText={b.status}
                              passengerLocation={b.passengerLocation}
                              workerLocation={b.workerLocation}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FIND SAHAYAK / STATION SERVICES MARKETPLACE                        */}
      {/* ========================================================================= */}
      {activeTab === 'marketplace' && (
        <div className="space-y-4">
          <ServiceDiscoveryMarketplace
            workers={workers}
            onSelectWorkerForBooking={
              onSelectWorkerForBooking ||
              ((worker, category) => {
                onNavigate('book-worker');
              })
            }
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RESOLVED HISTORY & BEFORE-AND-AFTER PHOTO PROOF                     */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-[#DDF8EF]/40 border border-[#65D6B0]/40 rounded-2xl p-4 flex items-center justify-between text-xs text-[#1E6B52]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#3EA684]" />
              <span>
                <strong>Audit Resolution Redressal:</strong> Every resolved task requires verified proof so passenger satisfaction is guaranteed (resolving CAG finding).
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Resolved Complaints */}
            {userComplaints.filter(c => c.status === 'Resolved').map((c) => (
              <div key={c.complaintId} className="bg-white rounded-2xl border border-[#DDE4E6] p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#DDE4E6] pb-2.5">
                  <span className="font-mono text-xs font-bold text-[#1E6B52]">#{c.complaintId}</span>
                  <span className="text-[10px] font-bold bg-[#DDF8EF] text-[#1E6B52] px-2 py-0.5 rounded">
                    Verified Resolved
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-black text-[#202A2B]">{c.subject}</h4>
                  <p className="text-[11px] text-[#526365] mt-0.5">{c.description}</p>
                </div>

                {/* Photo Proof Action */}
                <div className="pt-2 border-t border-[#DDE4E6] flex items-center justify-between">
                  <span className="text-[11px] text-[#7E9092]">
                    By: {c.assignedWorkerName || 'Station Technician'}
                  </span>
                  {(c.resolutionProofUrl || c.beforeProofUrl) && (
                    <button
                      onClick={() => setPhotoProofModal({
                        title: c.subject,
                        before: c.beforeProofUrl || c.imageUrl,
                        after: c.resolutionProofUrl,
                        notes: c.resolutionNotes,
                        workerName: c.assignedWorkerName || undefined,
                        resolvedAt: c.resolvedAt,
                      })}
                      className="px-2.5 py-1 bg-[#202A2B] text-white text-[11px] font-bold rounded-lg flex items-center gap-1.5 cursor-pointer hover:bg-[#202A2B]/90 transition"
                    >
                      <Camera className="w-3 h-3 text-[#65D6B0]" />
                      <span>Inspect Photo Proof</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Completed Bookings */}
            {userBookings.filter(b => b.status === 'Completed').map((b) => (
              <div key={b.requestId} className="bg-white rounded-2xl border border-[#DDE4E6] p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#DDE4E6] pb-2.5">
                  <span className="font-mono text-xs font-bold text-[#1E6B52]">#{b.requestId}</span>
                  <span className="text-[10px] font-bold bg-[#DDF8EF] text-[#1E6B52] px-2 py-0.5 rounded">
                    Completed
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-black text-[#202A2B]">{b.serviceCategory}</h4>
                  <p className="text-[11px] text-[#526365] mt-0.5">"{b.description}"</p>
                </div>

                <div className="pt-2 border-t border-[#DDE4E6] flex items-center justify-between">
                  {b.feedback ? (
                    <div className="text-[11px] text-[#1E6B52] font-semibold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-[#EAB308] fill-current" />
                      <span>Rated {b.feedback.rating}/5</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setFeedbackModalReq(b)}
                      className="px-2.5 py-1 bg-[#007D99] text-white text-[11px] font-bold rounded-lg cursor-pointer hover:bg-[#007D99]/90 transition"
                    >
                      Rate Specialist &rarr;
                    </button>
                  )}

                  {(b.resolutionProofUrl || b.afterPhotoUrl || b.beforePhotoUrl) && (
                    <button
                      onClick={() => setPhotoProofModal({
                        title: b.serviceCategory,
                        before: b.beforePhotoUrl,
                        after: b.resolutionProofUrl || b.afterPhotoUrl,
                        notes: b.resolutionSummary || b.completionNotes,
                        workerName: b.assignedWorkerName || undefined,
                        resolvedAt: b.completedAt,
                      })}
                      className="px-2.5 py-1 bg-[#202A2B] text-white text-[11px] font-bold rounded-lg flex items-center gap-1.5 cursor-pointer hover:bg-[#202A2B]/90 transition"
                    >
                      <Camera className="w-3 h-3 text-[#65D6B0]" />
                      <span>View Proof</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BEFORE-AND-AFTER PHOTO PROOF VIEWER                                */}
      {/* ========================================================================= */}
      {photoProofModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-[#DDE4E6] animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE4E6]">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#007D99]" />
                <h3 className="text-base font-black text-[#202A2B]">Verified Photo Proof of Resolution</h3>
              </div>
              <button
                onClick={() => setPhotoProofModal(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-[#526365]">
              Task: <strong className="text-[#202A2B]">{photoProofModal.title}</strong>
              {photoProofModal.workerName && (
                <span> · Resolved by: <strong className="text-[#202A2B]">{photoProofModal.workerName}</strong></span>
              )}
            </div>

            {/* Before vs After Photos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-[#526365] block uppercase">Before Maintenance</span>
                {photoProofModal.before ? (
                  <img
                    src={photoProofModal.before}
                    alt="Before Maintenance"
                    className="w-full h-48 object-cover rounded-2xl border border-[#DDE4E6] bg-slate-100"
                  />
                ) : (
                  <div className="w-full h-48 rounded-2xl border border-dashed border-[#DDE4E6] flex items-center justify-center text-xs text-[#7E9092] bg-[#F8FAFB]">
                    Initial passenger report image
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-[#1E6B52] block uppercase">After Resolution (Sahayak Proof)</span>
                {photoProofModal.after ? (
                  <img
                    src={photoProofModal.after}
                    alt="After Resolution"
                    className="w-full h-48 object-cover rounded-2xl border-2 border-[#65D6B0] bg-slate-100"
                  />
                ) : (
                  <div className="w-full h-48 rounded-2xl border border-dashed border-[#DDE4E6] flex items-center justify-center text-xs text-[#7E9092] bg-[#F8FAFB]">
                    No after photo attached
                  </div>
                )}
              </div>
            </div>

            {photoProofModal.notes && (
              <div className="p-3 bg-[#F8FAFB] rounded-xl border border-[#DDE4E6] text-xs text-[#202A2B]">
                <span className="font-bold text-[#526365] block mb-0.5">Technician Resolution Summary:</span>
                "{photoProofModal.notes}"
              </div>
            )}

            <button
              onClick={() => setPhotoProofModal(null)}
              className="w-full py-2.5 bg-[#202A2B] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#202A2B]/90 transition"
            >
              Close Proof Viewer
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PASSENGER RATING & REVIEW                                          */}
      {/* ========================================================================= */}
      {feedbackModalReq && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#DDE4E6] animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE4E6]">
              <h3 className="text-base font-black text-[#202A2B]">Rate Station Sahayak</h3>
              <button
                onClick={() => setFeedbackModalReq(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2 space-y-1">
              <span className="text-xs text-[#526365]">Specialist:</span>
              <div className="text-sm font-black text-[#202A2B]">{feedbackModalReq.assignedWorkerName}</div>
              <span className="text-[11px] text-[#007D99] block font-semibold">{feedbackModalReq.serviceCategory}</span>

              {/* Star Rating Selection */}
              <div className="flex items-center justify-center gap-2 pt-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    className="p-1 cursor-pointer transition transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= feedbackRating
                          ? 'text-[#EAB308] fill-current'
                          : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Feedback Tags */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#526365]">Select Feedback Tags:</span>
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
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#DDF8EF] border-[#65D6B0] text-[#1E6B52]'
                          : 'bg-[#F8FAFB] border-[#DDE4E6] text-[#526365] hover:bg-slate-100'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#526365] mb-1">
                Comments (Optional)
              </label>
              <textarea
                rows={2}
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="How was the resolution quality at your coach?"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDE4E6] focus:outline-none focus:ring-2 focus:ring-[#007D99] text-[#202A2B]"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFeedbackModalReq(null)}
                className="flex-1 py-2.5 border border-[#DDE4E6] text-[#526365] text-xs font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={feedbackSubmitting}
                onClick={handleSendFeedback}
                className="flex-1 py-2.5 bg-[#202A2B] hover:bg-[#202A2B]/90 text-white text-xs font-black rounded-xl transition cursor-pointer disabled:opacity-60"
              >
                {feedbackSubmitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Voice Assistant Modal */}
      {isVoiceModalOpen && (
        <AIVoiceAssistantModal
          currentUser={currentUser}
          isOpen={isVoiceModalOpen}
          onClose={() => {
            setIsVoiceModalOpen(false);
            onRefreshData?.();
          }}
          onSubmitGrievance={async (newComplaint) => {
            if (onSubmitComplaint) {
              return await Promise.resolve(onSubmitComplaint(newComplaint));
            }
            const res = await fetch('/api/complaints', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newComplaint),
            });
            const data = await res.json();
            onRefreshData?.();
            return data.complaint;
          }}
          onComplaintCreated={() => {
            onRefreshData?.();
          }}
        />
      )}

    </div>
  );
};
