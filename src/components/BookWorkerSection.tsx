import React, { useState } from 'react';
import { User, Worker, WorkerSkillCategory, ViewMode } from '../types';
import { 
  WORKER_SKILL_CATEGORIES, 
  RAILWAY_STATIONS, 
  SKILLS_BY_CATEGORY as CATEGORY_SKILL_MAP 
} from '../data/mockData';
import { 
  Briefcase, 
  Train, 
  Users, 
  ShieldCheck, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Eye, 
  X, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';

interface BookWorkerSectionProps {
  currentUser: User;
  allWorkers: Worker[];
  onSubmitRequest: (bookingData: any) => Promise<{ success: boolean; message: string; bookingId?: string; requestId?: string }> | any;
  onNavigate: (view: ViewMode) => void;
  onSuccessRedirect?: () => void;
  onBack?: () => void;
}

export const BookWorkerSection: React.FC<BookWorkerSectionProps> = ({
  currentUser,
  allWorkers,
  onSubmitRequest,
  onNavigate,
  onSuccessRedirect,
  onBack,
}) => {
  // Form State
  const [serviceCategory, setServiceCategory] = useState<WorkerSkillCategory>(WORKER_SKILL_CATEGORIES[0]);
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [stationCode, setStationCode] = useState<string>(RAILWAY_STATIONS[0].code);
  const [trainNumber, setTrainNumber] = useState<string>('12259');
  const [trainName, setTrainName] = useState<string>('Sealdah Bikaner Duronto Express');
  const [expectedArrivalTime, setExpectedArrivalTime] = useState<string>('16:45 PM');
  const [coachNumber, setCoachNumber] = useState<string>('B3');
  const [seatNumber, setSeatNumber] = useState<string>('Berth 24');
  const [description, setDescription] = useState<string>('');
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);

  // Modal / Preview state
  const [inspectedWorker, setInspectedWorker] = useState<Worker | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingConfirmedSuccess, setBookingConfirmedSuccess] = useState<string | null>(null);

  // Selected Station Details
  const selectedStation = RAILWAY_STATIONS.find((s) => s.code === stationCode) || RAILWAY_STATIONS[0];

  // Available skills in the selected category
  const availableSkills = CATEGORY_SKILL_MAP[serviceCategory] || [];

  // Filter verified, eligible workers stationed at the selected station
  const eligibleStationWorkers = allWorkers.filter((w) => {
    // 1. Must be verified
    if (w.verificationStatus !== 'Verified') return false;

    // 2. Must match the service category
    const catMatches =
      w.skillCategory.toLowerCase().trim() === serviceCategory.toLowerCase().trim() ||
      Boolean((w as any).serviceCategories?.some((c: string) => c.toLowerCase().trim() === serviceCategory.toLowerCase().trim()));
    if (!catMatches) return false;

    // 3. Must serve the selected railway station
    const servesStation =
      w.stationCode === stationCode ||
      (w.stationCodes && w.stationCodes.includes(stationCode));
    if (!servesStation) return false;

    // 4. If a specific skill is requested, match it if possible
    if (selectedSkill && w.skills && w.skills.length > 0) {
      const hasSkill = w.skills.some((sk) => sk.toLowerCase().includes(selectedSkill.toLowerCase()));
      if (!hasSkill) return false;
    }

    return true;
  });

  const selectedWorker = selectedWorkerId
    ? allWorkers.find((w) => w.id === selectedWorkerId) || null
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBookingConfirmedSuccess(null);

    if (!trainNumber.trim()) {
      setError('Please provide your Train Number.');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a brief description of the assistance or repair required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await onSubmitRequest({
        serviceCategory,
        requestedSkill: selectedSkill || undefined,
        stationCode: selectedStation.code,
        stationName: selectedStation.name,
        city: selectedStation.city,
        trainNumber: trainNumber.trim(),
        trainName: trainName.trim() || undefined,
        expectedArrivalTime: expectedArrivalTime.trim() || undefined,
        coachNumber: coachNumber.trim() || undefined,
        seatNumber: seatNumber.trim() || undefined,
        description: description.trim(),
        selectedWorkerId: selectedWorkerId || undefined,
      });

      if (res && res.success) {
        setBookingConfirmedSuccess(`Booking #${res.bookingId || 'CONFIRMED'} created successfully!`);
        setTimeout(() => {
          if (onSuccessRedirect) {
            onSuccessRedirect();
          } else {
            onNavigate('user-dashboard');
          }
        }, 1500);
      } else {
        setError(res?.message || 'Booking could not be processed. Please check details.');
      }
    } catch (err: any) {
      setError(err?.message || 'A network error occurred while booking worker.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack || (() => onNavigate('user-dashboard'))}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#183B3A] hover:text-[#0F766E] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#0F766E]" />
          <span>Back to Passenger Dashboard</span>
        </button>

        <span className="text-xs text-[#647773]">
          Booking as: <strong className="text-[#183B3A]">{currentUser.fullName}</strong>
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-[#D8EAE4] p-6 sm:p-8 shadow-xs">
        
        {/* Title */}
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 bg-[#CCFBF1] text-[#0F766E] text-[10px] font-extrabold rounded-md tracking-wider uppercase border border-[#A7E8D0]">
            RAIL CARE WORKFORCE
          </span>
          <span className="text-xs text-[#647773] font-medium">Verified On-Demand Railway Assistance</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#115E59] tracking-tight">
          Find &amp; Book a Railway Service Worker
        </h1>
        <p className="text-xs text-[#647773] mt-1 mb-6">
          Connect with verified electricians, coach plumbers, housekeeping attendants, and mechanics stationed along your route to meet your coach during station stops.
        </p>

        {/* Live Station Match Summary Banner */}
        <div className={`p-4 rounded-2xl border mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
          eligibleStationWorkers.length > 0
            ? 'bg-[#E5F5EF] border-[#A7E8D0] text-[#16845B]'
            : 'bg-amber-50 border-amber-200 text-[#C58B20]'
        }`}>
          <div className="flex items-center gap-2.5">
            {eligibleStationWorkers.length > 0 ? (
              <ShieldCheck className="w-5 h-5 text-[#16845B] shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-[#C58B20] shrink-0" />
            )}
            <div>
              <p className="font-bold">
                {eligibleStationWorkers.length > 0
                  ? `${eligibleStationWorkers.length} Verified Specialist(s) Stationed at ${selectedStation.name} (${selectedStation.code})`
                  : `No verified workers currently stationed at ${selectedStation.name} (${selectedStation.code}) for "${serviceCategory}"`}
              </p>
              <p className="text-[11px] opacity-90 mt-0.5">
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
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-[#C74646] text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#C74646]" />
            <span>{error}</span>
          </div>
        )}

        {bookingConfirmedSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-[#E5F5EF] border border-[#A7E8D0] text-[#16845B] text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#16845B] shrink-0" />
            <span>{bookingConfirmedSuccess} Redirecting to your dashboard...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* STEP 1: Service Category & Specific Skill */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#115E59] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#D8EAE4] pb-2">
              <Briefcase className="w-4 h-4 text-[#0F766E]" />
              <span>Step 1: Service Category &amp; Required Skill</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#183B3A] mb-1">
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8EAE4] bg-white text-xs text-[#183B3A] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                >
                  {WORKER_SKILL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#183B3A] mb-1">
                  Specific Skill Required (Optional)
                </label>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8EAE4] bg-white text-xs text-[#183B3A] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
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

          {/* STEP 2: Train Journey & Meeting Station */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#115E59] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#D8EAE4] pb-2">
              <Train className="w-4 h-4 text-[#0F766E]" />
              <span>Step 2: Train Journey &amp; Meeting Station</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#183B3A] mb-1">
                  Train Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={trainNumber}
                  onChange={(e) => setTrainNumber(e.target.value)}
                  placeholder="e.g. 12259"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8EAE4] bg-white text-xs text-[#183B3A] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#183B3A] mb-1">
                  Train Name
                </label>
                <input
                  type="text"
                  value={trainName}
                  onChange={(e) => setTrainName(e.target.value)}
                  placeholder="e.g. Sealdah Bikaner Duronto"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8EAE4] bg-white text-xs text-[#183B3A] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#183B3A] mb-1">
                  Upcoming Service Station <span className="text-red-500">*</span>
                </label>
                <select
                  value={stationCode}
                  onChange={(e) => {
                    setStationCode(e.target.value);
                    setSelectedWorkerId(null);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8EAE4] bg-white text-xs text-[#183B3A] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                >
                  {RAILWAY_STATIONS.map((station) => (
                    <option key={station.code} value={station.code}>
                      {station.name} ({station.code}) - {station.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#183B3A] mb-1">
                  Expected Arrival Time
                </label>
                <input
                  type="text"
                  value={expectedArrivalTime}
                  onChange={(e) => setExpectedArrivalTime(e.target.value)}
                  placeholder="e.g. 16:45 PM / In 45 mins"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8EAE4] bg-white text-xs text-[#183B3A] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#183B3A] mb-1">
                  Coach Number
                </label>
                <input
                  type="text"
                  value={coachNumber}
                  onChange={(e) => setCoachNumber(e.target.value)}
                  placeholder="e.g. B3 or S4"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8EAE4] bg-white text-xs text-[#183B3A] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#183B3A] mb-1">
                  Seat / Berth Number
                </label>
                <input
                  type="text"
                  value={seatNumber}
                  onChange={(e) => setSeatNumber(e.target.value)}
                  placeholder="e.g. Berth 42 (Upper)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8EAE4] bg-white text-xs text-[#183B3A] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>
            </div>
          </div>

          {/* STEP 3: Select Matching Worker (Direct Selection) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#D8EAE4] pb-2">
              <h3 className="text-xs font-bold text-[#115E59] uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#0F766E]" />
                <span>Step 3: Discover &amp; Select Verified Specialist</span>
              </h3>
              <span className="text-[11px] text-[#647773]">
                Showing verified workers at {selectedStation.name}
              </span>
            </div>

            {eligibleStationWorkers.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#F4FBF8] border border-[#D8EAE4] text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#E5F5EF] text-[#0F766E] flex items-center justify-center mx-auto border border-[#A7E8D0]">
                  <Users className="w-6 h-6 text-[#0F766E]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#115E59]">No Verified Specialist Found at {selectedStation.name}</h4>
                  <p className="text-xs text-[#647773] max-w-lg mx-auto mt-1 leading-relaxed">
                    You can still submit an open dispatch request to be queued for on-duty station attendants, or change the service station to an upcoming major junction.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedWorkerId(null)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      selectedWorkerId === null
                        ? 'bg-[#0F766E] text-white border-[#0F766E]'
                        : 'bg-white text-[#183B3A] border-[#D8EAE4] hover:bg-[#E5F5EF]'
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
                      ? 'bg-[#E5F5EF] border-[#0F766E] shadow-xs ring-1 ring-[#0F766E]'
                      : 'bg-[#F4FBF8] border-[#D8EAE4] hover:border-[#0F766E]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedWorkerId === null ? 'border-[#0F766E] bg-[#0F766E]' : 'border-slate-300 bg-white'
                    }`}>
                      {selectedWorkerId === null && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-[#115E59] flex items-center gap-2">
                        <span>Broadcast to Any Available Station Specialist</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0F766E] text-white">
                          Fastest Response
                        </span>
                      </div>
                      <p className="text-[11px] text-[#647773] mt-0.5">
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
                            ? 'bg-[#E5F5EF] border-[#0F766E] shadow-sm ring-1 ring-[#0F766E]'
                            : 'bg-white border-[#D8EAE4] hover:border-[#0F766E]/40 shadow-2xs'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Top Row: Worker Name & Verification Badge */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-xl bg-[#0F766E] text-[#CCFBF1] font-extrabold flex items-center justify-center text-sm shadow-xs border border-[#A7E8D0]/30">
                                {worker.fullName.charAt(0)}
                              </div>
                              <div>
                                <h4 className="text-xs font-extrabold text-[#115E59]">
                                  {worker.fullName}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#CCFBF1] text-[#0F766E] border border-[#A7E8D0]">
                                    <ShieldCheck className="w-3 h-3 text-[#16845B]" />
                                    Verified
                                  </span>
                                  <span className="text-[10px] text-[#647773] font-mono">
                                    {worker.workerId}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Availability Tag */}
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                isAvailable
                                  ? 'bg-[#E5F5EF] text-[#16845B] border border-[#A7E8D0]'
                                  : 'bg-amber-50 text-[#C58B20] border border-amber-200'
                              }`}
                            >
                              ● {worker.availability}
                            </span>
                          </div>

                          {/* Headline & Experience */}
                          <div>
                            <p className="text-xs font-semibold text-[#183B3A]">
                              {worker.headline || worker.skillCategory}
                            </p>
                            <p className="text-[11px] text-[#647773] mt-0.5 line-clamp-2">
                              {worker.bio || `Specialist with ${worker.experienceYears || 3}+ years of railway coach experience.`}
                            </p>
                          </div>

                          {/* Skills Badges */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(worker.skills || [worker.skillCategory]).slice(0, 3).map((sk, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-[#F4FBF8] border border-[#D8EAE4] text-[#183B3A] truncate max-w-[200px]"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Card Footer: View Profile & Book Buttons */}
                        <div className="mt-4 pt-3 border-t border-[#D8EAE4] flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectedWorker(worker);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#183B3A] hover:text-[#0F766E] px-2.5 py-1.5 rounded-lg hover:bg-white/80 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#0F766E]" />
                            <span>View Profile</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedWorkerId(worker.id);
                            }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                              isSelected
                                ? 'bg-[#0F766E] text-white border border-[#0F766E]'
                                : 'bg-white hover:bg-[#E5F5EF] text-[#183B3A] border border-[#D8EAE4]'
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#A7E8D0]" />
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

          {/* STEP 4: Problem Description */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#115E59] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#D8EAE4] pb-2">
              <FileText className="w-4 h-4 text-[#0F766E]" />
              <span>Step 4: Problem Description &amp; Instructions</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#183B3A] mb-1">
                Describe Problem &amp; Exact Seat Location <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Charging point socket not supplying current and AC cooling vent dripping water near seat 42 in coach B3. Please inspect upon train halt at the platform."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8EAE4] bg-white text-xs text-[#183B3A] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              />
            </div>
          </div>

          {/* STEP 5: Review Booking Details & Confirm */}
          <div className="bg-[#F4FBF8] p-5 rounded-2xl border border-[#D8EAE4] space-y-3">
            <h3 className="text-xs font-bold text-[#115E59] uppercase tracking-wider">
              Step 5: Review Booking Summary
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-[#D8EAE4]">
                <span className="text-[10px] text-[#647773] font-bold block uppercase">Assigned Specialist</span>
                <span className="font-extrabold text-[#115E59] text-xs truncate block mt-0.5">
                  {selectedWorker ? selectedWorker.fullName : 'Station Queue Broadcast'}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#D8EAE4]">
                <span className="text-[10px] text-[#647773] font-bold block uppercase">Service Station</span>
                <span className="font-extrabold text-[#115E59] text-xs truncate block mt-0.5">
                  {selectedStation.name} ({selectedStation.code})
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#D8EAE4]">
                <span className="text-[10px] text-[#647773] font-bold block uppercase">Train &amp; Coach</span>
                <span className="font-extrabold text-[#115E59] text-xs truncate block mt-0.5">
                  {trainNumber || 'N/A'} {coachNumber ? `· ${coachNumber}` : ''}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#D8EAE4]">
                <span className="text-[10px] text-[#647773] font-bold block uppercase">Service Category</span>
                <span className="font-extrabold text-[#115E59] text-xs truncate block mt-0.5">
                  {serviceCategory}
                </span>
              </div>
            </div>
          </div>

          {/* Explicit Confirmation Button */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-4 px-6 bg-[#0F766E] hover:bg-[#115E59] text-white text-sm font-bold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#0F766E] ${
              submitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#A7E8D0]" />
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
        <div className="fixed inset-0 z-50 bg-[#115E59]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#D8EAE4] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#0F766E] text-white p-6 relative">
              <button
                onClick={() => setInspectedWorker(null)}
                className="absolute top-5 right-5 text-emerald-100 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#CCFBF1] text-[#0F766E] font-extrabold flex items-center justify-center text-lg shadow-xs">
                  {inspectedWorker.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {inspectedWorker.fullName}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#A7E8D0]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#A7E8D0]" />
                      Verified Railway Specialist
                    </span>
                    <span className="text-[10px] text-emerald-100">
                      ID: {inspectedWorker.workerId}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
              <div>
                <span className="text-[10px] font-bold text-[#647773] uppercase tracking-wider block">
                  Professional Headline
                </span>
                <p className="font-bold text-sm text-[#115E59] mt-0.5">
                  {inspectedWorker.headline || inspectedWorker.skillCategory}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#647773] uppercase tracking-wider block">
                  Background &amp; Biography
                </span>
                <p className="text-[#183B3A] leading-relaxed mt-1">
                  {inspectedWorker.bio || 'Verified Indian Railways technician registered under the central gig workforce roster.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#D8EAE4]">
                <div>
                  <span className="text-[10px] font-bold text-[#647773] uppercase block">
                    Experience
                  </span>
                  <p className="font-extrabold text-[#115E59]">
                    {inspectedWorker.experienceYears || 3}+ Years on Coach Services
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#647773] uppercase block">
                    Jobs Completed
                  </span>
                  <p className="font-extrabold text-[#115E59]">
                    {inspectedWorker.totalJobsCompleted || 0} Grievance Calls
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#D8EAE4]">
                <span className="text-[10px] font-bold text-[#647773] uppercase block mb-1">
                  Registered Stations Served
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(inspectedWorker.stationCodes || [inspectedWorker.stationCode]).map((sc) => (
                    <span
                      key={sc}
                      className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#E5F5EF] text-[#0F766E] border border-[#A7E8D0]"
                    >
                      {sc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#D8EAE4]">
                <span className="text-[10px] font-bold text-[#647773] uppercase block mb-1">
                  Verified Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(inspectedWorker.skills || [inspectedWorker.skillCategory]).map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#F4FBF8] text-[#183B3A] border border-[#D8EAE4]"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#D8EAE4]">
                <span className="text-[10px] font-bold text-[#647773] uppercase block">
                  Qualifications &amp; Verification
                </span>
                <p className="text-[11px] text-[#183B3A] font-medium mt-0.5">
                  {inspectedWorker.qualifications || 'Certified Technical Qualifications Verified by Divisional HQ'}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#F4FBF8] border-t border-[#D8EAE4] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setInspectedWorker(null)}
                className="px-4 py-2 text-xs font-semibold text-[#647773] hover:text-[#183B3A] cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedWorkerId(inspectedWorker.id);
                  setInspectedWorker(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0F766E] hover:bg-[#115E59] text-white shadow-xs transition cursor-pointer"
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
