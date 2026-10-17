import React, { useState, useMemo } from 'react';
import { User, Complaint, Worker, WorkerSkillCategory, ViewMode } from '../types';
import { WORKER_SKILL_CATEGORIES, RAILWAY_STATIONS } from '../data/mockData';
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
  FileText
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
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedStation = RAILWAY_STATIONS.find((s) => s.code === stationCode) || RAILWAY_STATIONS[0];

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
          setDescription(`Assistance requested regarding grievance #${match.complaintId}: ${match.description}`);
        }
        // Map complaint category to worker skill if applicable
        if (match.category === 'Electrical Issues') {
          setServiceCategory('Coach Electrician & AC Technician');
        } else if (match.category === 'Water Availability') {
          setServiceCategory('Railway Coach Plumber & Sanitation Worker');
        } else if (match.category === 'Cleanliness') {
          setServiceCategory('Coach Cleaning & Housekeeping Worker');
        }
      }
    }
  };

  // Real-time station matching: count verified & available workers at selected station with selected skill
  const matchingWorkers = useMemo(() => {
    return allWorkers.filter(
      (w) =>
        w.stationCode.toUpperCase() === selectedStation.code.toUpperCase() &&
        w.skillCategory === serviceCategory &&
        w.verificationStatus === 'Verified' &&
        w.availability === 'Available'
    );
  }, [allWorkers, selectedStation.code, serviceCategory]);

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
        description: description.trim(),
      });

      if (res.success) {
        if (onSuccessRedirect) {
          onSuccessRedirect();
        } else {
          onNavigate('user-dashboard');
        }
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
    <div className="max-w-4xl mx-auto px-4 py-8">
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
          Passenger: <strong className="text-[#142B4A]">{currentUser.fullName}</strong>
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-[#E8E2D3] p-6 sm:p-8 shadow-xs">
        
        {/* Title */}
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 bg-[#E9B949] text-[#142B4A] text-[10px] font-extrabold rounded-md tracking-wider uppercase">
            RAIL CARE WORKFORCE
          </span>
          <span className="text-xs text-[#6B7280] font-medium">Uber-Style On-Demand Assistance</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] tracking-tight">
          Book a Railway Service Worker
        </h1>
        <p className="text-xs text-[#6B7280] mt-1 mb-6">
          Request verified railway technicians and assistance staff to meet your train coach at upcoming stations along your journey.
        </p>

        {/* Live Station Matching Status Pill */}
        <div className={`p-4 rounded-2xl border mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
          matchingWorkers.length > 0
            ? 'bg-[#EDF7F2] border-[#21865B]/30 text-[#156140]'
            : 'bg-[#FFF5DC] border-[#E9B949]/40 text-[#142B4A]'
        }`}>
          <div className="flex items-center gap-2.5">
            {matchingWorkers.length > 0 ? (
              <ShieldCheck className="w-5 h-5 text-[#21865B] shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-[#E9B949] shrink-0" />
            )}
            <div>
              <p className="font-bold">
                {matchingWorkers.length > 0
                  ? `${matchingWorkers.length} Verified Worker(s) Available at ${selectedStation.name} (${selectedStation.code})`
                  : `Station Match: ${selectedStation.name} (${selectedStation.code})`}
              </p>
              <p className="text-[11px] opacity-80 mt-0.5">
                {matchingWorkers.length > 0
                  ? `Qualified in "${serviceCategory}". Ready to be dispatched upon arrival.`
                  : `Your request will be queued on the station's roster and available to workers upon arrival.`}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/70 border border-current shrink-0">
            Station-Based Match
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Optional: Link with Existing Complaint */}
          {userComplaints.length > 0 && (
            <div className="bg-[#FFFDF5] p-4 rounded-2xl border border-[#E8E2D3]">
              <label className="block text-xs font-bold text-[#142B4A] uppercase tracking-wider mb-1">
                Link to an Existing Complaint (Optional)
              </label>
              <p className="text-[11px] text-[#6B7280] mb-2">
                Select a previously filed grievance to automatically reuse journey details.
              </p>
              <select
                value={selectedComplaintId}
                onChange={handleLinkComplaint}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E2D3] bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
              >
                <option value="">-- None (Standalone Service Request) --</option>
                {userComplaints.map((c) => (
                  <option key={c.complaintId} value={c.complaintId}>
                    #{c.complaintId} · {c.category} · {c.subject} (Tr: {c.trainNumber})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Section 1: Train & Station Coordination */}
          <div>
            <h3 className="text-xs font-bold text-[#142B4A] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Train className="w-4 h-4 text-[#E9B949]" />
              <span>1. Train Journey & Meeting Station</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  Train Name (Optional)
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
                  onChange={(e) => setStationCode(e.target.value)}
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
                  Expected Arrival Time (Passenger Provided)
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

          {/* Section 2: Service Assistance Required */}
          <div>
            <h3 className="text-xs font-bold text-[#142B4A] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-[#E9B949]" />
              <span>2. Service Assistance Required</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#142B4A] mb-1">
                  Service Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value as WorkerSkillCategory)}
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
                  Describe Problem & Assistance Needed <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Charging point socket not supplying current and AC cooling vent dripping water near seat 42. Please inspect upon arrival at the station."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D3] bg-[#FFFDF5] text-xs focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3.5 px-4 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#142B4A] hover:border-[#E9B949] ${
              submitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#E9B949]" />
            <span>{submitting ? 'Broadcasting Service Request...' : 'Dispatch Request to Station Workers'}</span>
          </button>
        </form>

      </div>
    </div>
  );
};
