import React, { useState } from 'react';
import { Complaint, ComplaintCategory, User, ViewMode } from '../types';
import { ALLOWED_CATEGORIES } from '../data/mockData';
import { ArrowLeft, Send, AlertCircle, Info, Sparkles, Check } from 'lucide-react';

interface RegisterComplaintProps {
  currentUser: User;
  onSubmitComplaint: (newComplaint: Omit<Complaint, 'id' | 'complaintId' | 'createdAt' | 'updatedAt'>) => Complaint;
  onNavigate: (view: ViewMode) => void;
  onSelectComplaint: (complaint: Complaint) => void;
}

const PRESET_TEMPLATES = [
  {
    label: '✨ Dirty Washroom',
    category: 'Cleanliness' as ComplaintCategory,
    train: '12951 / Mumbai Rajdhani Express',
    pnr: '2458901234',
    location: 'Coach B3, Berth 24',
    subject: 'Waterlogged washroom and no liquid soap in coach B3',
    description: 'The toilet in Coach B3 was uncleaned, waterlogged, and lacked soap throughout the journey between Surat and Kota.',
  },
  {
    label: '🍱 Poor Food Quality',
    category: 'Catering and Food Quality' as ComplaintCategory,
    train: '22436 / Vande Bharat Express',
    pnr: '8765432190',
    location: 'Executive Chair Car C1, Seat 14',
    subject: 'Stale and cold dinner meal served after Kanpur',
    description: 'Dinner meal served in executive car C1 was cold and stale. Water bottle seal was also broken.',
  },
  {
    label: '⚡ AC Not Cooling',
    category: 'Electrical Issues' as ComplaintCategory,
    train: '12002 / Bhopal Shatabdi',
    pnr: '4521098734',
    location: 'Coach C4, Seat 42',
    subject: 'AC cooling unit stopped working for over 2 hours',
    description: 'Air conditioning stopped functioning after Mathura. Charging socket is also not working.',
  },
  {
    label: '💧 No Water in Toilet',
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

  const applyPreset = (template: typeof PRESET_TEMPLATES[0]) => {
    setTrainNumber(template.train);
    setPnrNumber(template.pnr);
    setCategory(template.category);
    setLocation(template.location);
    setSubject(template.subject);
    setDescription(template.description);
    setPresetNotice(`Loaded "${template.label}" preset! You can now edit or submit.`);
    setTimeout(() => setPresetNotice(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    const created = onSubmitComplaint({
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
    });

    onSelectComplaint(created);
    onNavigate('complaint-details');
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      
      {/* Back button */}
      <div className="mb-4">
        <button
          onClick={() => onNavigate('user-dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#2563EB] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#12304A]">
              Register a Railway Complaint
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Filing on behalf of passenger: <strong>{currentUser.fullName}</strong>
            </p>
          </div>
        </div>

        {/* 1-Click Auto-Fill Quick Presets */}
        <div className="px-6 py-3.5 bg-blue-50/60 border-b border-blue-100/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick 1-Click Sample Fillers (Reduces effort to 1 click):
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_TEMPLATES.map((tpl) => (
              <button
                key={tpl.label}
                type="button"
                onClick={() => applyPreset(tpl)}
                className="px-2.5 py-1 bg-white hover:bg-blue-100/70 border border-blue-200 text-[#12304A] text-xs font-medium rounded-md shadow-2xs transition"
              >
                {tpl.label}
              </button>
            ))}
          </div>
          {presetNotice && (
            <div className="text-[11px] text-emerald-700 font-medium mt-2 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              {presetNotice}
            </div>
          )}
        </div>

        {error && (
          <div className="m-6 mb-0 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Train Number or Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={trainNumber}
                onChange={(e) => setTrainNumber(e.target.value)}
                placeholder="e.g. 12951 Mumbai Rajdhani"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                PNR Number <span className="text-slate-400 font-normal">(Optional, 10 digits)</span>
              </label>
              <input
                type="text"
                value={pnrNumber}
                onChange={(e) => setPnrNumber(e.target.value)}
                placeholder="10-digit PNR"
                maxLength={10}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Journey Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Complaint Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white"
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Coach & Berth / Location <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Coach B3, Berth 24"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Complaint Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Short title of the problem"
              maxLength={140}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {description.length} characters
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what occurred in detail..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-y"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate('user-dashboard')}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Grievance
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
