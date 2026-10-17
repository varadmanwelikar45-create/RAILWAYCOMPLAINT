import React, { useState, useMemo } from 'react';
import { User, Complaint, Worker, WorkerSkillCategory, ViewMode } from '../types';
import { 
  WORKER_SKILL_CATEGORIES, 
  RAILWAY_STATIONS, 
  SKILLS_BY_CATEGORY, 
  COMPLAINT_TO_SERVICE_MAP 
} from '../data/mockData';
import { 
  Briefcase, 
  Train, 
  MapPin, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft, 
  Sparkles, 
  Users, 
  ShieldCheck,
  FileText,
  UserCheck,
  Star,
  Info,
  Calendar,
  X,
  Phone,
  Eye,
  Check
} from 'lucide-react';

interface BookWorkerSectionProps {
  currentUser: User;
  userComplaints: Complaint[];
  allWorkers: Worker[];
  onSubmitRequest: (requestData: {
    passengerId: number;
    passengerName: string;
    passengerEmail: string;
    passengerMobile: string;
    relatedComplaintId?: string;
    trainNumber: string;
    trainName?: string;
    coachNumber?: string;
    seatNumber?: string;
    stationCode: string;
    stationName: string;
    expectedArrivalTime?: string;
    serviceCategory: WorkerSkillCategory;
    requestedSkill?: string;
    assignedWorkerId?: number | null;
    description: string;
  }) => Promise<{ success: boolean; message: string; requestId?: string }> | { success: boolean; message: string; requestId?: string };
  onNavigate: (view: ViewMode) => void;
  onSuccessRedirect?: () => void;
}

export const BookWorkerSection: React.FC<BookWorkerSectionProps> = ({
  currentUser,
  userComplaints,
  allWorkers,
  onSubmitRequest,
  onNavigate,
  onSuccessRedirect,
}) => {
  const [selectedComplaintId, setSelectedComplaintId] = useState<string>('');
  const [trainNumber, setTrainNumber] = useState('');
  const [trainName, setTrainName] = useState('');
  const [stationCode, setStationCode] = useState<string>(RAILWAY_STATIONS[0].code);
  const [expectedArrivalTime, setExpectedArrivalTime] = useState('');
  const [coachNumber, setCoachNumber] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [serviceCategory, setServiceCategory] = useState<WorkerSkillCategory>(WORKER_SKILL_CATEGORIES[0]);
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [description, setDescription] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
  const [inspectedWorker, setInspectedWorker] = useState<Worker | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingConfirmedSuccess, setBookingConfirmedSuccess] = useState<string | null>(null);

  const selectedStation = RAILWAY_STATIONS.find((s) => s.code === stationCode) || RAILWAY_STATIONS[0];
  const availableSkills = SKILLS_BY_CATEGORY[serviceCategory] || [];

  // Auto-fill from selected complaint if passenger chooses to link one
  const handleLinkComplaint = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    setSelectedComplaintId(cid);

    if (cid) {
      const match = userComplaints.find((c) => c.complaintId === cid);
      if (match) {
        if (match.trainNumber && match.trainNumber !== 'N/A') {
          setTrainNumber(match.trainNumber);
        }
        if (match.description && !description) {
          setDescription(`Assistance requested for complaint #${match.complaintId} (${match.category}): ${match.description}`);
        }
        // Automatic Complaint-to-Service Mapping
        const mapping = COMPLAINT_TO_SERVICE_MAP[match.category];
        if (mapping) {
          setServiceCategory(mapping.serviceCategory);
          setSelectedSkill(mapping.defaultSkill);
        }
      }
    }
  };

  // Real-time station & skill matching: Show ONLY verified workers serving this station and category
  const eligibleStationWorkers = useMemo(() => {
    return (allWorkers || []).filter((w) => {
      if (w.verificationStatus !== 'Verified') return false;
      const servesStation =
        w.stationCode.toUpperCase() === selectedStation.code.toUpperCase() ||
        (Array.isArray(w.stationCodes) && w.stationCodes.some((sc) => sc.toUpperCase() === selectedStation.code.toUpperCase()));
      const matchesCategory = w.skillCategory === serviceCategory;
      return servesStation && matchesCategory;
    });
  }, [allWorkers, selectedStation.code, serviceCategory]);

  const selectedWorker = (allWorkers || []).find((w) => w.id === selectedWorkerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!trainNumber.trim()) {
      setError('Please provide your Train Number.');
      return;
    }

    if (!description.trim()) {
      setError('Please describe the problem or assistance required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await onSubmitRequest({
        passengerId: currentUser.id,
        passengerName: currentUser.fullName,
        passengerEmail: currentUser.email,
        passengerMobile: currentUser.mobile,
        relatedComplaintId: selectedComplaintId || undefined,
        trainNumber: trainNumber.trim(),
        trainName: trainName.trim() || undefined,
        coachNumber: coachNumber.trim() || undefined,
        seatNumber: seatNumber.trim() || undefined,
        stationCode: selectedStation.code,
        stationName: selectedStation.name,
        expectedArrivalTime: expectedArrivalTime.trim() || undefined,
        serviceCategory,
        requestedSkill: selectedSkill || undefined,
        assignedWorkerId: selectedWorkerId,
        description: description.trim(),
      });

      if (res.success) {
        setBookingConfirmedSuccess(res.message);
        setTimeout(() => {
          if (onSuccessRedirect) {
            onSuccessRedirect();
          } else {
            onNavigate('user-dashboard');
          }
        }, 1800);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to submit service request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onNavigate('user-dashboard')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#142B4A] hover:text-[#243F63] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Passenger Dashboard</span>
        </button>

        <span className="text-xs text-[#6B7280]">
          Booking as: <strong className="text-[#142B4A]">{currentUser.fullName}</strong>
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-[#E8E2D3] p-6 sm:p-8 shadow-xs">
        
        {/* Title */}
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 bg-[#E9B949] text-[#142B4A] text-[10px] font-extrabold rounded-md tracking-wider uppercase">
            RAIL CARE WORKFORCE
          </span>
          <span className="text-xs text-[#6B7280] font-medium">Verified On-Demand Railway Assistance</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] tracking-tight">
          Find & Book a Railway Service Worker
        </h1>
        <p className="text-xs text-[#6B7280] mt-1 mb-6">
          Connect with verified electricians, coach plumbers, housekeeping attendants, and mechanics stationed along your route to meet your coach during station stops.
        </p>

        {/* Live Station Match Summary Banner */}
        <div className={`p-4 rounded-2xl border mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
          eligibleStationWorkers.length > 0
            ? 'bg-[#EDF7F2] border-[#21865B]/30 text-[#156140]'
            : 'bg-[#FFF8E7] border-[#E9B949]/40 text-[#9A6700]'
        }`}>
          <div className="flex items-center gap-2.5">
            {eligibleStationWorkers.length > 0 ? (
              <ShieldCheck className="w-5 h-5 text-[#21865B] shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-[#D99520] shrink-0" />
            )}
            <div>
              <p className="font-bold">
                {eligibleStationWorkers.length > 0
                  ? `${eligibleStationWorkers.length} Verified Specialist(s) Stationed at ${selectedStation.name} (${selectedStation.code})`
                  : `No verified workers currently stationed at ${selectedStation.name} (${selectedStation.code}) for "${serviceCategory}"`}
              </p>
              <p className="text-[11px] opacity-85 mt-0.5">
                {eligibleStationWorkers.length > 0
                  ? `Select a specific specialist below or dispatch to the first available technician.`
                  : `You can change the upcoming station to the next junction on your route, or dispatch to the station general queue.`}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/80 border border-current shrink-0">
            {selectedStation.code} · {selectedStation.city}
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {bookingConfirmedSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{bookingConfirmedSuccess} Redirecting to your dashboard...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* STEP 1: Link with Complaint (Optional) */}
          {userComplaints.length > 0 && (
            <div className="bg-[#FFFDF5] p-5 rounded-2xl border border-[#E8E2D3] space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#142B4A] uppercase tracking-wider">
                  Step 1: Link to an Existing Grievance (Optional)
                </label>
                <span className="text-[10px] text-[#6B7280]">Auto-maps category & train</span>
              </div>
              <p className="text-[11px] text-[#6B7280]">
                If this request is related to an issue you previously lodged, link it below to automatically configure the service category and journey details.
              </p>
              <select
                value={selectedComplaintId}
                onChange={handleLinkComplaint}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D3] bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
              >
                <option value="">-- None (Standalone On-Demand Service Request) --</option>
                {userComplaints.map((c) => (
                  <option key={c.complaintId} value={c.complaintId}>
                    #{c.complaintId} · {c.category} · {c.subject} (Tr: {c.trainNumber})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* STEP 2: Service Category & Specific Skill */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#142B4A] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#E8E2D3] pb-2">
              <Briefcase className="w-4 h-4 text-[#E9B949]" />
              <span>Step 2: Service Category & Required Skill</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#142B4A] mb-1">
                  Service Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={serviceCategory}
                  onChange={(e) => {
                    const cat = e.target.value as WorkerSkillCategory;
                    setServiceCategory(cat);
                    setSelectedSkill('');
                    setSelectedWorkerId(null);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D3] bg-[#FFFDF5] text-xs focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                >
                  {WORKER_SKILL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#142B4A] mb-1">
                  Specific Skill Required (Optional)
                </label>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D3] bg-[#FFFDF5] text-xs focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                >
                  <option value="">Any skill in {serviceCategory}</option>
                  {availableSkills.map((sk) => (
                    <option key={sk} value={sk}>
                      {sk}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* STEP 3: Train Journey & Meeting Station */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#142B4A] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#E8E2D3] pb-2">
              <Train className="w-4 h-4 text-[#E9B949]" />
              <span>Step 3: Train Journey & Meeting Station</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#142B4A] mb-1">
                  Train Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={trainNumber}
                  onChange={(e) => setTrainNumber(e.target.value)}
                  placeholder="e.g. 12259"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D3] bg-[#FFFDF5] text-xs focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#142B4A] mb-1">
                  Train Name
                </label>
                <input
                  type="text"
                  value={trainName}
                  onChange={(e) => setTrainName(e.target.value)}
                  placeholder="e.g. Sealdah Bikaner Duronto"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D3] bg-[#FFFDF5] text-xs focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#142B4A] mb-1">
                  Upcoming Service Station <span className="text-red-500">*</span>
                </label>
                <select
                  value={stationCode}
                  onChange={(e) => {
                    setStationCode(e.target.value);
                    setSelectedWorkerId(null);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D3] bg-[#FFFDF5] text-xs focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                >
                  {RAILWAY_STATIONS.map((station) => (
                    <option key={station.code} value={station.code}>
                      {station.name} ({station.code}) - {station.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#142B4A] mb-1">
                  Expected Arrival Time
                </label>
                <input
                  type="text"
                  value={expectedArrivalTime}
                  onChange={(e) => setExpectedArrivalTime(e.target.value)}
                  placeholder="e.g. 16:45 PM / In 45 mins"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D3] bg-[#FFFDF5] text-xs focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#142B4A] mb-1">
                  Coach Number
                </label>
                <input
                  type="text"
                  value={coachNumber}
                  onChange={(e) => setCoachNumber(e.target.value)}
                  placeholder="e.g. B3 or S4"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D3] bg-[#FFFDF5] text-xs focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#142B4A] mb-1">
                  Seat / Berth Number
                </label>
                <input
                  type="text"
                  value={seatNumber}
                  onChange={(e) => setSeatNumber(e.target.value)}
                  placeholder="e.g. Berth 42 (Upper)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D3] bg-[#FFFDF5] text-xs focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                />
              </div>
            </div>
          </div>

          {/* STEP 4: Select Matching Worker (Direct Selection) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#E8E2D3] pb-2">
              <h3 className="text-xs font-bold text-[#142B4A] uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#E9B949]" />
                <span>Step 4: Discover & Select Verified Specialist</span>
              </h3>
              <span className="text-[11px] text-[#6B7280]">
                Showing verified workers at {selectedStation.name}
              </span>
            </div>

            {eligibleStationWorkers.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#FFFDF5] border border-[#E8E2D3] text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#FFF5DC] text-[#142B4A] flex items-center justify-center mx-auto border border-[#E9B949]/30">
                  <Users className="w-6 h-6 text-[#142B4A]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#142B4A]">No Verified Specialist Found at {selectedStation.name}</h4>
                  <p className="text-xs text-[#6B7280] max-w-lg mx-auto mt-1 leading-relaxed">
                    You can still submit an open dispatch request to be queued for on-duty station attendants, or change the service station to an upcoming major junction.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedWorkerId(null)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      selectedWorkerId === null
                        ? 'bg-[#142B4A] text-white border-[#142B4A]'
                        : 'bg-white text-[#142B4A] border-[#E8E2D3] hover:bg-[#FFF5DC]'
                    }`}
                  >
                    {selectedWorkerId === null ? '✓ Open Dispatch Mode Selected' : 'Choose Open Dispatch'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Default option: Open Station Broadcast */}
                <div
                  onClick={() => setSelectedWorkerId(null)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedWorkerId === null
                      ? 'bg-[#FFF5DC] border-[#E9B949] shadow-xs ring-1 ring-[#E9B949]'
                      : 'bg-[#FFFDF5] border-[#E8E2D3] hover:border-[#E9B949]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedWorkerId === null ? 'border-[#142B4A] bg-[#142B4A]' : 'border-slate-300 bg-white'
                    }`}>
                      {selectedWorkerId === null && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-[#142B4A] flex items-center gap-2">
                        <span>Broadcast to Any Available Station Specialist</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#142B4A] text-white">
                          Fastest Response
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B7280] mt-0.5">
                        Dispatches to all {eligibleStationWorkers.length} verified specialists at {selectedStation.name}. First available technician accepts immediately.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Worker Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {eligibleStationWorkers.map((worker) => {
                    const isSelected = selectedWorkerId === worker.id;
                    const isAvailable = worker.availability === 'Available';

                    return (
                      <div
                        key={worker.id}
                        className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#FFF5DC] border-[#E9B949] shadow-sm ring-1 ring-[#E9B949]'
                            : 'bg-white border-[#E8E2D3] hover:border-[#142B4A]/40 shadow-2xs'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Top Row: Worker Name & Verification Badge */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-xl bg-[#142B4A] text-[#E9B949] font-extrabold flex items-center justify-center text-sm shadow-xs border border-[#E9B949]/30">
                                {worker.fullName.charAt(0)}
                              </div>
                              <div>
                                <h4 className="text-xs font-extrabold text-[#142B4A]">
                                  {worker.fullName}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#EDF7F2] text-[#156140] border border-[#21865B]/30">
                                    <ShieldCheck className="w-3 h-3 text-[#21865B]" />
                                    Verified
                                  </span>
                                  <span className="text-[10px] text-[#6B7280] font-mono">
                                    {worker.workerId}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Availability Tag */}
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                isAvailable
                                  ? 'bg-[#EDF7F2] text-[#156140] border border-[#21865B]/30'
                                  : 'bg-[#FFF8E7] text-[#9A6700] border border-[#E9B949]/40'
                              }`}
                            >
                              ● {worker.availability}
                            </span>
                          </div>

                          {/* Headline & Experience */}
                          <div>
                            <p className="text-xs font-semibold text-[#253247]">
                              {worker.headline || worker.skillCategory}
                            </p>
                            <p className="text-[11px] text-[#6B7280] mt-0.5 line-clamp-2">
                              {worker.bio || `Specialist with ${worker.experienceYears || 3}+ years of railway coach experience.`}
                            </p>
                          </div>

                          {/* Skills Badges */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(worker.skills || [worker.skillCategory]).slice(0, 3).map((sk, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-[#FFFDF5] border border-[#E8E2D3] text-[#253247] truncate max-w-[200px]"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Card Footer: View Profile & Book Buttons */}
                        <div className="mt-4 pt-3 border-t border-[#E8E2D3]/60 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectedWorker(worker);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#142B4A] hover:text-[#243F63] px-2.5 py-1.5 rounded-lg hover:bg-white/80 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#E9B949]" />
                            <span>View Profile</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedWorkerId(worker.id);
                            }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                              isSelected
                                ? 'bg-[#142B4A] text-white border border-[#142B4A]'
                                : 'bg-white hover:bg-[#FFF5DC] text-[#142B4A] border border-[#E8E2D3]'
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#E9B949]" />
                                <span>Selected</span>
                              </>
                            ) : (
                              <span>Select Specialist</span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* STEP 5: Problem Description */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#142B4A] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#E8E2D3] pb-2">
              <FileText className="w-4 h-4 text-[#E9B949]" />
              <span>Step 5: Problem Description & Instructions</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#142B4A] mb-1">
                Describe Problem & Exact Seat Location <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Charging point socket not supplying current and AC cooling vent dripping water near seat 42 in coach B3. Please inspect upon train halt at the platform."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D3] bg-[#FFFDF5] text-xs focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
              />
            </div>
          </div>

          {/* STEP 6: Review Booking Details & Confirm */}
          <div className="bg-[#FFFDF5] p-5 rounded-2xl border border-[#E8E2D3] space-y-3">
            <h3 className="text-xs font-bold text-[#142B4A] uppercase tracking-wider">
              Step 6: Review Booking Summary
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-[#E8E2D3]">
                <span className="text-[10px] text-[#6B7280] font-bold block uppercase">Assigned Specialist</span>
                <span className="font-extrabold text-[#142B4A] text-xs truncate block mt-0.5">
                  {selectedWorker ? selectedWorker.fullName : 'Station Queue Broadcast'}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#E8E2D3]">
                <span className="text-[10px] text-[#6B7280] font-bold block uppercase">Service Station</span>
                <span className="font-extrabold text-[#142B4A] text-xs truncate block mt-0.5">
                  {selectedStation.name} ({selectedStation.code})
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#E8E2D3]">
                <span className="text-[10px] text-[#6B7280] font-bold block uppercase">Train & Coach</span>
                <span className="font-extrabold text-[#142B4A] text-xs truncate block mt-0.5">
                  {trainNumber || 'N/A'} {coachNumber ? `· ${coachNumber}` : ''}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#E8E2D3]">
                <span className="text-[10px] text-[#6B7280] font-bold block uppercase">Service Category</span>
                <span className="font-extrabold text-[#142B4A] text-xs truncate block mt-0.5">
                  {serviceCategory}
                </span>
              </div>
            </div>
          </div>

          {/* Explicit Confirmation Button */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-4 px-6 bg-[#142B4A] hover:bg-[#243F63] text-white text-sm font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#142B4A] hover:border-[#E9B949] ${
              submitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#E9B949]" />
            <span>
              {submitting
                ? 'Securing Booking & Assigning Specialist...'
                : selectedWorker
                ? `Confirm Booking with ${selectedWorker.fullName}`
                : 'Confirm & Dispatch Booking to Station Queue'}
            </span>
          </button>
        </form>

      </div>

      {/* Worker Profile Inspection Modal */}
      {inspectedWorker && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#E8E2D3] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#142B4A] text-white p-6 relative">
              <button
                onClick={() => setInspectedWorker(null)}
                className="absolute top-5 right-5 text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E9B949] text-[#142B4A] font-extrabold flex items-center justify-center text-lg shadow-xs">
                  {inspectedWorker.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {inspectedWorker.fullName}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E9B949]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Railway Specialist
                    </span>
                    <span className="text-[10px] text-slate-300">
                      ID: {inspectedWorker.workerId}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
              <div>
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                  Professional Headline
                </span>
                <p className="font-bold text-sm text-[#142B4A] mt-0.5">
                  {inspectedWorker.headline || inspectedWorker.skillCategory}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                  Background & Biography
                </span>
                <p className="text-[#253247] leading-relaxed mt-1">
                  {inspectedWorker.bio || 'Verified Indian Railways technician registered under the central gig workforce roster.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E8E2D3]">
                <div>
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase block">
                    Experience
                  </span>
                  <p className="font-extrabold text-[#142B4A]">
                    {inspectedWorker.experienceYears || 3}+ Years on Coach Services
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase block">
                    Jobs Completed
                  </span>
                  <p className="font-extrabold text-[#142B4A]">
                    {inspectedWorker.totalJobsCompleted || 0} Grievance Calls
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E8E2D3]">
                <span className="text-[10px] font-bold text-[#6B7280] uppercase block mb-1">
                  Registered Stations Served
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(inspectedWorker.stationCodes || [inspectedWorker.stationCode]).map((sc) => (
                    <span
                      key={sc}
                      className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#FFF5DC] text-[#142B4A] border border-[#E9B949]/30"
                    >
                      {sc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#E8E2D3]">
                <span className="text-[10px] font-bold text-[#6B7280] uppercase block mb-1">
                  Verified Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(inspectedWorker.skills || [inspectedWorker.skillCategory]).map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#FFFDF5] text-[#253247] border border-[#E8E2D3]"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#E8E2D3]">
                <span className="text-[10px] font-bold text-[#6B7280] uppercase block">
                  Qualifications & Verification
                </span>
                <p className="text-[11px] text-[#253247] font-medium mt-0.5">
                  {inspectedWorker.qualifications || 'Certified Technical Qualifications Verified by Divisional HQ'}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#FFFDF5] border-t border-[#E8E2D3] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setInspectedWorker(null)}
                className="px-4 py-2 text-xs font-semibold text-[#6B7280] hover:text-[#142B4A] cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedWorkerId(inspectedWorker.id);
                  setInspectedWorker(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#142B4A] hover:bg-[#243F63] text-white shadow-xs transition cursor-pointer"
              >
                Select {inspectedWorker.fullName}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
