import React, { useState } from 'react';
import { Complaint, ComplaintCategory, User, ViewMode } from '../types';
import { ALLOWED_CATEGORIES } from '../data/mockData';
import { ArrowLeft, Send, AlertCircle, Sparkles, Check, CheckCircle2, Copy, ExternalLink, RefreshCw, Train, Calendar, Tag, MapPin, Hash } from 'lucide-react';

interface RegisterComplaintProps {
  currentUser: User;
  onSubmitComplaint: (
    newComplaint: Omit<Complaint, 'id' | 'complaintId' | 'createdAt' | 'updatedAt'>
  ) => Promise<Complaint> | Complaint;
  onNavigate: (view: ViewMode) => void;
  onSelectComplaint: (complaint: Complaint) => void;
}

const PRESET_TEMPLATES = [
  {
    label: '✨ Washroom Cleaning',
    category: 'Cleanliness' as ComplaintCategory,
    train: '12951 / Mumbai Rajdhani Express',
    pnr: '2458901234',
    location: 'Coach B3, Berth 24',
    subject: 'Waterlogged washroom and no liquid soap in coach B3',
    description: 'The toilet in Coach B3 was uncleaned, waterlogged, and lacked soap throughout the journey between Surat and Kota.',
  },
  {
    label: '🍱 Catering Quality',
    category: 'Catering and Food Quality' as ComplaintCategory,
    train: '22436 / Vande Bharat Express',
    pnr: '8765432190',
    location: 'Executive Chair Car C1, Seat 14',
    subject: 'Stale and cold dinner meal served after Kanpur',
    description: 'Dinner meal served in executive car C1 was cold and stale. Water bottle seal was also broken.',
  },
  {
    label: '⚡ AC & Electrical',
    category: 'Electrical Issues' as ComplaintCategory,
    train: '12002 / Bhopal Shatabdi',
    pnr: '4521098734',
    location: 'Coach C4, Seat 42',
    subject: 'AC cooling unit stopped working for over 2 hours',
    description: 'Air conditioning stopped functioning after Mathura. Charging socket is also not working.',
  },
  {
    label: '💧 Water Availability',
    category: 'Water Availability' as ComplaintCategory,
    train: '12259 / Sealdah Bikaner Duronto',
    pnr: '9812345678',
    location: 'Coach A2, Berth 12',
    subject: 'Overhead water tank empty since early morning',
    description: 'Both washrooms in coach A2 ran out of water after Mughalsarai junction. Please refill at next junction.',
  },
];

export const RegisterComplaint: React.FC<RegisterComplaintProps> = ({
  currentUser,
  onSubmitComplaint,
  onNavigate,
  onSelectComplaint,
}) => {
  const [trainNumber, setTrainNumber] = useState('');
  const [pnrNumber, setPnrNumber] = useState('');
  const [journeyDate, setJourneyDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<ComplaintCategory>('Cleanliness');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [presetNotice, setPresetNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const applyPreset = (template: typeof PRESET_TEMPLATES[0]) => {
    setTrainNumber(template.train);
    setPnrNumber(template.pnr);
    setCategory(template.category);
    setLocation(template.location);
    setSubject(template.subject);
    setDescription(template.description);
    setPresetNotice(`Loaded "${template.label}" incident template! You can now edit details.`);
    setTimeout(() => setPresetNotice(null), 3000);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard?.writeText?.(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handleResetForm = () => {
    setSubmittedComplaint(null);
    setTrainNumber('');
    setPnrNumber('');
    setCategory('Cleanliness');
    setSubject('');
    setDescription('');
    setLocation('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form validation
    if (!trainNumber.trim()) {
      setError('Train Number or Train Name is required.');
      return;
    }
    if (!journeyDate) {
      setError('Journey Date is required.');
      return;
    }
    if (!category) {
      setError('Please select a valid complaint category.');
      return;
    }
    if (!subject.trim()) {
      setError('Complaint Subject is required.');
      return;
    }
    if (!description.trim()) {
      setError('Complaint Description is required.');
      return;
    }

    if (pnrNumber && !/^\d{10}$/.test(pnrNumber.trim())) {
      setError('PNR Number must be exactly 10 digits if provided.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await Promise.resolve(
        onSubmitComplaint({
          userId: currentUser.id,
          passengerName: currentUser.fullName,
          passengerEmail: currentUser.email,
          passengerMobile: currentUser.mobile,
          trainNumber: trainNumber.trim(),
          pnrNumber: pnrNumber.trim() || undefined,
          journeyDate,
          category,
          subject: subject.trim(),
          description: description.trim(),
          location: location.trim() || undefined,
          status: 'Pending',
        })
      );

      // Present the explicit Complaint Submitted screen with tracking ID
      setSubmittedComplaint(created);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Dedicated "Complaint Submitted" Confirmation Screen
  if (submittedComplaint) {
    return (
      <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-[#DDE4E6] shadow-md p-6 sm:p-10 space-y-6">
          
          {/* Success Header Badge */}
          <div className="text-center space-y-3 pb-6 border-b border-[#DDE4E6]">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#DDF8EF] border border-[#65D6B0] text-[#1E6B52] flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-9 h-9 text-[#1E6B52]" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DDF8EF] text-[#1E6B52] text-xs font-black uppercase tracking-wider border border-[#65D6B0]/60">
              Grievance Registered Successfully
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#202A2B] tracking-tight">
              Complaint Received &amp; Broadcasted
            </h1>
            <p className="text-xs sm:text-sm text-[#526365] max-w-lg mx-auto">
              Your grievance has been logged into the Indian Railways central grievance registry. Control room officers and on-duty station supervisors have been notified.
            </p>
          </div>

          {/* Prominent Complaint ID Tracking Card */}
          <div className="bg-[#F8FAFB] p-5 sm:p-6 rounded-2xl border-2 border-dashed border-[#65D6B0] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#526365] block mb-1">
                Your Official Complaint Tracking ID
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-2xl sm:text-3xl font-black text-[#202A2B] tracking-wider">
                  {submittedComplaint.complaintId}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase bg-[#FFECC7] text-[#915900] border border-[#FFD68A]">
                  {submittedComplaint.status}
                </span>
              </div>
              <p className="text-[11px] text-[#526365] mt-1">
                Save this tracking ID to follow live platform investigation and resolution.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleCopyId(submittedComplaint.complaintId)}
              className="px-4 py-2.5 bg-[#202A2B] hover:bg-[#202A2B]/90 text-white rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-xs border border-[#202A2B] shrink-0"
            >
              {copiedId ? (
                <>
                  <Check className="w-4 h-4 text-[#65D6B0]" />
                  <span>ID Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#65D6B0]" />
                  <span>Copy Tracking ID</span>
                </>
              )}
            </button>
          </div>

          {/* Grievance Summary Recap */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#202A2B] flex items-center gap-1.5">
              <Train className="w-3.5 h-3.5 text-[#007D99]" />
              <span>Grievance Summary</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#FFFDF5] p-4 rounded-2xl border border-[#FFD68A]/60">
              <div className="flex items-start gap-2">
                <Train className="w-4 h-4 text-[#007D99] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#526365] block text-[11px]">Train Number / Name</span>
                  <strong className="text-[#202A2B] font-bold">{submittedComplaint.trainNumber}</strong>
                </div>
              </div>

              {submittedComplaint.pnrNumber && (
                <div className="flex items-start gap-2">
                  <Hash className="w-4 h-4 text-[#007D99] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#526365] block text-[11px]">10-Digit PNR</span>
                    <strong className="font-mono text-[#202A2B] font-bold">{submittedComplaint.pnrNumber}</strong>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <Tag className="w-4 h-4 text-[#007D99] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#526365] block text-[11px]">Grievance Category</span>
                  <strong className="text-[#202A2B] font-bold">{submittedComplaint.category}</strong>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-[#007D99] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#526365] block text-[11px]">Journey Date</span>
                  <strong className="text-[#202A2B] font-bold">{submittedComplaint.journeyDate}</strong>
                </div>
              </div>

              {submittedComplaint.location && (
                <div className="flex items-start gap-2 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-[#007D99] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#526365] block text-[11px]">Coach / Berth / Location</span>
                    <strong className="text-[#202A2B] font-bold">{submittedComplaint.location}</strong>
                  </div>
                </div>
              )}

              <div className="sm:col-span-2 pt-2 border-t border-[#FFD68A]/60">
                <span className="text-[#526365] block text-[11px]">Subject</span>
                <p className="text-[#202A2B] font-bold mt-0.5">{submittedComplaint.subject}</p>
              </div>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#DDE4E6]">
            <button
              type="button"
              onClick={handleResetForm}
              className="w-full sm:w-auto px-4 py-2.5 border border-[#DDE4E6] hover:bg-[#F8FAFB] text-[#202A2B] text-xs font-bold rounded-xl transition cursor-pointer"
            >
              File Another Grievance
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onNavigate('user-dashboard')}
                className="w-full sm:w-auto px-5 py-2.5 border border-[#202A2B] hover:bg-[#F8FAFB] text-[#202A2B] text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Back to My Dashboard
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectComplaint(submittedComplaint);
                  onNavigate('complaint-details');
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#007D99] hover:bg-[#00B8D9] text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Track Complaint Live</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Back button */}
      <div className="mb-5">
        <button
          onClick={() => onNavigate('user-dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#202A2B] hover:text-[#B94A3A] transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#B94A3A]" />
          <span>Back to My Dashboard</span>
        </button>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-3xl border border-[#DDE4E6] shadow-sm p-6 sm:p-10 space-y-6">
        
        {/* Header */}
        <div className="border-b border-[#DDE4E6] pb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFECC7] text-[#915900] text-[11px] font-extrabold uppercase tracking-wider mb-2 border border-[#FFD68A]">
            OFFICIAL GRIEVANCE REGISTRATION
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#202A2B] tracking-tight">
            Register a Complaint
          </h1>
          <p className="text-xs text-[#526365] mt-1 font-normal">
            Tell us about the issue you experienced during your railway journey.
          </p>
        </div>

        {/* Quick Presets Bar */}
        <div className="bg-[#FFFDF5] p-4 rounded-2xl border border-[#FFD68A]/60 space-y-2">
          <div className="text-xs font-bold text-[#202A2B] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#007D99]" /> Common Grievance Incident Templates
            </span>
            {presetNotice && (
              <span className="text-[11px] text-[#1E6B52] font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" /> {presetNotice}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(tmpl)}
                className="px-3 py-1.5 bg-white hover:bg-[#FFFDF5] text-[#202A2B] border border-[#DDE4E6] rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                {tmpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-[#FBE0E6] border border-[#D72645]/40 text-xs text-[#92182D] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#D72645]" />
            <div className="space-y-1">
              <span className="font-semibold">{error}</span>
              <p className="text-[11px] text-[#92182D]/80">Please check the required fields and submit again.</p>
            </div>
          </div>
        )}

        {/* Submitting Progress Indicator */}
        {submitting && (
          <div className="p-4 rounded-2xl bg-[#D7F7FC] border border-[#00B8D9]/40 text-xs text-[#007D99] flex items-center gap-3">
            <RefreshCw className="w-4 h-4 animate-spin text-[#007D99] shrink-0" />
            <div>
              <span className="font-black text-[#202A2B]">Submitting Railway Grievance to Control Room...</span>
              <p className="text-[11px] text-[#526365]">Assigning official reference ID and broadcasting to coach inspection sahayaks.</p>
            </div>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Passenger Information Banner */}
          <div className="p-4 bg-[#FFFDF5] rounded-2xl border border-[#FFD68A]/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[#526365]">Complainant:</span>{' '}
              <strong className="text-[#202A2B] font-bold">{currentUser.fullName}</strong>
            </div>
            <div className="text-[#526365]">
              Email: <span className="font-mono text-[#202A2B] font-semibold">{currentUser.email}</span> · Mobile:{' '}
              <span className="font-mono text-[#202A2B] font-semibold">{currentUser.mobile}</span>
            </div>
          </div>

          {/* Train Number & PNR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="complaint-train-number" className="block text-xs font-bold text-[#202A2B] mb-1.5">
                Train Number or Name <span className="text-[#D72645]">*</span>
              </label>
              <input
                id="complaint-train-number"
                type="text"
                disabled={submitting}
                value={trainNumber}
                onChange={(e) => setTrainNumber(e.target.value)}
                placeholder="e.g. 12951 / Mumbai Rajdhani"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DDE4E6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007D99] transition text-[#202A2B] disabled:opacity-60"
                required
              />
            </div>

            <div>
              <label htmlFor="complaint-pnr-number" className="block text-xs font-bold text-[#202A2B] mb-1.5">
                PNR Number <span className="text-[#526365] font-normal">(10 digits, optional)</span>
              </label>
              <input
                id="complaint-pnr-number"
                type="text"
                disabled={submitting}
                value={pnrNumber}
                onChange={(e) => setPnrNumber(e.target.value)}
                placeholder="e.g. 2458901234"
                maxLength={10}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DDE4E6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007D99] transition text-[#202A2B] disabled:opacity-60"
              />
            </div>
          </div>

          {/* Journey Date & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="complaint-journey-date" className="block text-xs font-bold text-[#202A2B] mb-1.5">
                Journey Date <span className="text-[#D72645]">*</span>
              </label>
              <input
                id="complaint-journey-date"
                type="date"
                disabled={submitting}
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DDE4E6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007D99] transition text-[#202A2B] disabled:opacity-60"
                required
              />
            </div>

            <div>
              <label htmlFor="complaint-category" className="block text-xs font-bold text-[#202A2B] mb-1.5">
                Grievance Category <span className="text-[#D72645]">*</span>
              </label>
              <select
                id="complaint-category"
                disabled={submitting}
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DDE4E6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007D99] transition text-[#202A2B] disabled:opacity-60"
                required
              >
                {ALLOWED_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Coach / Location */}
          <div>
            <label htmlFor="complaint-coach-location" className="block text-xs font-bold text-[#202A2B] mb-1.5">
              Coach &amp; Berth or Station Location <span className="text-[#526365] font-normal">(Optional)</span>
            </label>
            <input
              id="complaint-coach-location"
              type="text"
              disabled={submitting}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Coach B3, Berth 24 or Platform 2"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DDE4E6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007D99] transition text-[#202A2B] disabled:opacity-60"
            />
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="complaint-subject" className="block text-xs font-bold text-[#202A2B] mb-1.5">
              Grievance Subject <span className="text-[#D72645]">*</span>
            </label>
            <input
              id="complaint-subject"
              type="text"
              disabled={submitting}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of the issue"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DDE4E6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007D99] transition text-[#202A2B] disabled:opacity-60"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="complaint-description" className="block text-xs font-bold text-[#202A2B] mb-1.5">
              Detailed Description <span className="text-[#D72645]">*</span>
            </label>
            <textarea
              id="complaint-description"
              rows={4}
              disabled={submitting}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide complete details including time, specific location, or staff involved..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DDE4E6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007D99] transition text-[#202A2B] disabled:opacity-60"
              required
            />
          </div>

          {/* Submission Bar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DDE4E6]">
            <button
              type="button"
              disabled={submitting}
              onClick={() => onNavigate('user-dashboard')}
              className="px-5 py-2.5 border border-[#DDE4E6] hover:bg-[#F8FAFB] text-[#202A2B] text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-3 bg-[#007D99] hover:bg-[#00B8D9] text-white font-black text-xs rounded-xl shadow-xs transition-all border border-[#007D99] flex items-center gap-2 cursor-pointer ${
                submitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Submitting Grievance...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-white" />
                  <span>Submit Grievance to RAIL CARE</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

