import React, { useState } from 'react';
import { Complaint, ComplaintCategory, User, ViewMode } from '../types';
import { ALLOWED_CATEGORIES } from '../data/mockData';
import { ArrowLeft, Send, AlertCircle, Info, Sparkles, Check, Train, Calendar, FileText, MapPin } from 'lucide-react';

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

      onSelectComplaint(created);
      onNavigate('complaint-details');
    } catch (err: any) {
      setError(err?.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Back button */}
      <div className="mb-5">
        <button
          onClick={() => onNavigate('user-dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#142B4A] hover:text-[#243F63] transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to My Complaints
        </button>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-3xl border border-[#E8E2D3] shadow-md p-6 sm:p-10 space-y-6">
        
        {/* Header */}
        <div className="border-b border-[#E8E2D3] pb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF5DC] text-[#142B4A] text-[11px] font-extrabold uppercase tracking-wider mb-2 border border-[#E9B949]/30">
            OFFICIAL GRIEVANCE REGISTRATION
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] tracking-tight">
            Register a Complaint
          </h1>
          <p className="text-xs text-[#6B7280] mt-1 font-normal">
            Tell us about the issue you experienced during your railway journey.
          </p>
        </div>

        {/* Quick Presets Bar */}
        <div className="bg-[#FFFDF5] p-4 rounded-2xl border border-[#E8E2D3] space-y-2">
          <div className="text-xs font-bold text-[#142B4A] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E9B949]" /> Common Grievance Incident Templates
            </span>
            {presetNotice && (
              <span className="text-[11px] text-[#21865B] font-semibold flex items-center gap-1">
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
                className="px-3 py-1.5 bg-white hover:bg-[#FFF5DC] text-[#142B4A] border border-[#E8E2D3] rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                {tmpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Passenger Information Banner */}
          <div className="p-4 bg-[#FFFDF5] rounded-2xl border border-[#E8E2D3] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[#6B7280]">Complainant:</span>{' '}
              <strong className="text-[#142B4A]">{currentUser.fullName}</strong>
            </div>
            <div className="text-[#6B7280]">
              Email: <span className="font-mono text-[#253247]">{currentUser.email}</span> · Mobile:{' '}
              <span className="font-mono text-[#253247]">{currentUser.mobile}</span>
            </div>
          </div>

          {/* Train Number & PNR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#253247] mb-1.5">
                Train Number or Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={trainNumber}
                onChange={(e) => setTrainNumber(e.target.value)}
                placeholder="e.g. 12951 / Mumbai Rajdhani"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FFFDF5] border border-[#E8E2D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A] focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#253247] mb-1.5">
                PNR Number <span className="text-slate-400 font-normal">(10 digits, optional)</span>
              </label>
              <input
                type="text"
                value={pnrNumber}
                onChange={(e) => setPnrNumber(e.target.value)}
                placeholder="e.g. 2458901234"
                maxLength={10}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FFFDF5] border border-[#E8E2D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A] focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Journey Date & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#253247] mb-1.5">
                Journey Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FFFDF5] border border-[#E8E2D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A] focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#253247] mb-1.5">
                Grievance Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FFFDF5] border border-[#E8E2D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A] focus:border-transparent transition"
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
            <label className="block text-xs font-bold text-[#253247] mb-1.5">
              Coach & Berth or Station Location <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Coach B3, Berth 24 or Platform 2"
              className="w-full px-3.5 py-2.5 text-sm bg-[#FFFDF5] border border-[#E8E2D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A] focus:border-transparent transition"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-[#253247] mb-1.5">
              Grievance Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of the issue"
              className="w-full px-3.5 py-2.5 text-sm bg-[#FFFDF5] border border-[#E8E2D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A] focus:border-transparent transition"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#253247] mb-1.5">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide complete details including time, specific location, or staff involved..."
              className="w-full px-3.5 py-2.5 text-sm bg-[#FFFDF5] border border-[#E8E2D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A] focus:border-transparent transition"
              required
            />
          </div>

          {/* Submission Bar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E2D3]">
            <button
              type="button"
              onClick={() => onNavigate('user-dashboard')}
              className="px-5 py-2.5 border border-[#E8E2D3] hover:bg-[#FFF5DC] text-[#253247] text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-3 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-xl shadow-md transition-all border border-[#142B4A] hover:border-[#E9B949] flex items-center gap-2 cursor-pointer ${
                submitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <Send className="w-3.5 h-3.5 text-[#E9B949]" />
              <span>{submitting ? 'Submitting to Central Database...' : 'Submit Grievance to RAIL CARE'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
