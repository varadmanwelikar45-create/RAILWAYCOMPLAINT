import React, { useState, useMemo } from 'react';
import { Worker, WorkerSkillCategory, RailwayStation, ViewMode } from '../types';
import { 
  WORKER_SKILL_CATEGORIES, 
  RAILWAY_STATIONS, 
  SKILLS_BY_CATEGORY 
} from '../data/mockData';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  Filter, 
  Wrench, 
  Sparkles, 
  Clock, 
  Eye, 
  ArrowRight, 
  X,
  Phone,
  Calendar,
  Check
} from 'lucide-react';

interface ServiceDiscoveryMarketplaceProps {
  workers: Worker[];
  onSelectWorkerForBooking: (worker: Worker, category?: WorkerSkillCategory) => void;
  onNavigate?: (view: ViewMode) => void;
  currentUser?: any;
}

const CATEGORY_ICONS: Record<string, string> = {
  'Coach Electrician & AC Technician': '⚡',
  'Railway Coach Plumber & Sanitation Worker': '🚰',
  'Coach Mechanical Technician': '🔧',
  'Coach Cleaning & Housekeeping Worker': '🧼',
  'General Passenger & Luggage Assistance Worker': '🧳',
  'Approved Pantry & Food Delivery Assistant': '🍱',
  'Emergency First-Aid & Medical Assistant': '🩺',
};

export const ServiceDiscoveryMarketplace: React.FC<ServiceDiscoveryMarketplaceProps> = ({
  workers,
  onSelectWorkerForBooking,
  onNavigate,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStation, setSelectedStation] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [inspectedWorker, setInspectedWorker] = useState<Worker | null>(null);

  // Filter workers based on search, station, category, availability
  const filteredWorkers = useMemo(() => {
    return (workers || []).filter((w) => {
      // Exclude only explicitly rejected or suspended profiles
      if (w.verificationStatus === 'Rejected' || w.verificationStatus === 'Suspended') return false;

      // Availability filter
      if (onlyAvailable && w.availability !== 'Available') return false;

      // Priority Search: If search term is provided, search globally across all stations and categories!
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const qDigits = q.replace(/\D/g, '');
        const inName = (w.fullName || '').toLowerCase().includes(q);
        const inId = (w.workerId || '').toLowerCase().includes(q) || (w.workerId || '').toLowerCase().replace('-', '').includes(q.replace('-', ''));
        const inMobile = qDigits.length >= 3 && (w.mobile || '').replace(/\D/g, '').includes(qDigits);
        const inBio = (w.bio || '').toLowerCase().includes(q);
        const inHeadline = (w.headline || '').toLowerCase().includes(q);
        const inCategory = (w.skillCategory || '').toLowerCase().includes(q);
        const inCity = (w.city || '').toLowerCase().includes(q);
        const inStation = (w.stationName || '').toLowerCase().includes(q) || (w.stationCode || '').toLowerCase().includes(q);
        const inSkills = Array.isArray(w.skills) && w.skills.some((sk) => sk.toLowerCase().includes(q));

        if (inName || inId || inMobile || inBio || inHeadline || inCategory || inCity || inStation || inSkills) {
          return true;
        }
        return false;
      }

      // Station filter (only when not explicitly searching by name/ID)
      if (selectedStation !== 'ALL') {
        const matchesStation =
          w.stationCode === selectedStation ||
          (Array.isArray(w.stationCodes) && w.stationCodes.includes(selectedStation));
        if (!matchesStation) return false;
      }

      // Category filter (only when not explicitly searching by name/ID)
      if (selectedCategory !== 'ALL') {
        const cat = selectedCategory.toLowerCase();
        const matchesCat =
          w.skillCategory.toLowerCase() === cat ||
          w.skillCategory.toLowerCase().includes(cat) ||
          (Array.isArray((w as any).serviceCategories) && (w as any).serviceCategories.some((c: string) => c.toLowerCase() === cat));
        if (!matchesCat) return false;
      }

      return true;
    });
  }, [workers, searchTerm, selectedStation, selectedCategory, onlyAvailable]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStation('ALL');
    setSelectedCategory('ALL');
    setOnlyAvailable(false);
  };

  return (
    <div className="space-y-8">
      {/* SECTION HEADER */}
      <div className="bg-white rounded-3xl border border-[#DDE4E6] p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDF8EF] text-[#1E6B52] text-xs font-black uppercase tracking-wider border border-[#65D6B0]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#3EA684]" />
            <span>SERVICE-FIRST MARKETPLACE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#202A2B] tracking-tight">
            Find Assistance Near Your Station
          </h2>
          <p className="text-xs sm:text-sm text-[#526365] leading-relaxed">
            Discover skilled service providers, book assistance, and coordinate your meeting directly at your train coach and platform.
          </p>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-[#7E9092] absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search problem, skill (e.g. AC cooling, tap leak, luggage)..."
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#F8FAFB] border border-[#DDE4E6] rounded-xl text-[#202A2B] focus:outline-none focus:ring-2 focus:ring-[#65D6B0] shadow-2xs font-medium"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 text-[#7E9092] hover:text-[#202A2B] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Station Selector */}
            <div className="md:col-span-4 relative">
              <MapPin className="w-4 h-4 text-[#7E9092] absolute left-3.5 top-3" />
              <select
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#F8FAFB] border border-[#DDE4E6] rounded-xl text-[#202A2B] font-bold focus:outline-none focus:ring-2 focus:ring-[#65D6B0] shadow-2xs cursor-pointer"
              >
                <option value="ALL">All Railway Stations</option>
                {RAILWAY_STATIONS.map((st) => (
                  <option key={st.code} value={st.code}>
                    {st.name} ({st.code}) - {st.city}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Quick Selector */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#F8FAFB] border border-[#DDE4E6] rounded-xl text-[#202A2B] font-bold focus:outline-none focus:ring-2 focus:ring-[#65D6B0] shadow-2xs cursor-pointer"
              >
                <option value="ALL">All Service Categories</option>
                {WORKER_SKILL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Availability and Clear Filter Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-[#202A2B]">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="rounded border-[#DDE4E6] text-[#1E6B52] focus:ring-[#65D6B0]"
                />
                <span>Only Show Available Personnel</span>
              </label>

              {(searchTerm || selectedStation !== 'ALL' || selectedCategory !== 'ALL' || onlyAvailable) && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs font-bold text-[#D72645] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  <span>Clear All Filters</span>
                </button>
              )}
            </div>

            <div className="text-xs text-[#526365] font-semibold">
              Showing <strong className="text-[#202A2B]">{filteredWorkers.length}</strong> verified station specialist(s)
            </div>
          </div>
        </div>

        {/* SERVICE CATEGORIES INTERACTIVE CARDS */}
        <div className="mt-6 pt-6 border-t border-[#DDE4E6]">
          <div className="text-[11px] font-black text-[#526365] uppercase tracking-wider mb-3">
            Popular Station Service Categories
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {WORKER_SKILL_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              const icon = CATEGORY_ICONS[cat] || '🔧';
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(isSelected ? 'ALL' : cat)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                    isSelected
                      ? 'bg-[#202A2B] text-white border-[#202A2B] shadow-xs'
                      : 'bg-[#F8FAFB] border-[#DDE4E6] text-[#202A2B] hover:border-[#65D6B0] hover:bg-white'
                  }`}
                >
                  <span className="text-xl">{icon}</span>
                  <span className="text-[11px] font-bold leading-snug line-clamp-2">
                    {cat}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MATCHING WORKER CARDS GRID */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-[#202A2B] tracking-tight">
            Verified Station Personnel
          </h3>
          <span className="text-xs text-[#526365]">
            Platform Halt Coach Assistance
          </span>
        </div>

        {filteredWorkers.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#DDE4E6] p-12 text-center space-y-3 shadow-xs">
            <Briefcase className="w-12 h-12 text-[#7E9092] mx-auto opacity-50" />
            <h4 className="text-base font-bold text-[#202A2B]">No Verified Workers Match Your Criteria</h4>
            <p className="text-xs text-[#526365] max-w-md mx-auto">
              We couldn't find active technicians at this station matching your specific filter. Try selecting "All Railway Stations" or resetting filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-[#202A2B] hover:bg-[#202A2B]/90 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
            >
              Reset Filters &amp; View All
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredWorkers.map((worker) => (
              <div
                key={worker.id}
                className="bg-white rounded-2xl border border-[#DDE4E6] p-5 shadow-xs hover:border-[#65D6B0] hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Top: Avatar & Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={worker.profileImage || worker.verificationPhoto || 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=150&q=80'}
                        alt={worker.fullName}
                        className="w-12 h-12 rounded-xl object-cover border border-[#DDE4E6] group-hover:scale-105 transition-transform shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-black text-[#202A2B] group-hover:text-[#1E6B52] transition-colors truncate max-w-[150px]">
                            {worker.fullName}
                          </h4>
                          <span title="Railway Verified">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#3EA684] shrink-0" />
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-[#007D99] bg-[#D7F7FC] px-1.5 py-0.5 rounded">
                          {worker.workerId}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      worker.availability === 'Available'
                        ? 'bg-[#DDF8EF] text-[#1E6B52] border border-[#65D6B0]/40'
                        : 'bg-[#FBE0E6] text-[#92182D] border border-[#D72645]/40'
                    }`}>
                      {worker.availability}
                    </span>
                  </div>

                  {/* Role & Bio */}
                  <div>
                    <span className="text-xs font-black text-[#202A2B] block">
                      {worker.skillCategory}
                    </span>
                    <p className="text-[11px] text-[#526365] mt-1 line-clamp-2 leading-relaxed">
                      {worker.bio || worker.headline || 'Certified railway services provider stationed for rapid passenger assistance.'}
                    </p>
                  </div>

                  {/* Skills Tag Pills */}
                  {Array.isArray(worker.skills) && worker.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {worker.skills.slice(0, 2).map((sk) => (
                        <span key={sk} className="text-[9px] font-semibold bg-[#F0F4F6] text-[#202A2B] px-2 py-0.5 rounded-md border border-[#DDE4E6] truncate max-w-[140px]">
                          {sk}
                        </span>
                      ))}
                      {worker.skills.length > 2 && (
                        <span className="text-[9px] font-semibold text-[#526365] px-1 py-0.5">
                          +{worker.skills.length - 2} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Station, Experience & Rating Meta */}
                  <div className="space-y-1.5 text-xs text-[#526365] pt-3 border-t border-[#DDE4E6]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px]">Station Hub:</span>
                      <strong className="text-[#202A2B] font-bold text-[11px]">
                        {worker.stationName} ({worker.stationCode})
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px]">Experience:</span>
                      <span className="text-[#202A2B] font-semibold text-[11px]">
                        {worker.experienceYears || 2} Years Practical
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px]">Passenger Rating:</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-[#EAB308] fill-current" />
                        <strong className="text-[#202A2B] text-xs font-bold">
                          {worker.rating ? worker.rating.toFixed(1) : '5.0'}
                        </strong>
                        <span className="text-[10px] text-[#7E9092]">
                          ({worker.totalJobsCompleted || 12} jobs)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px]">Assistance Fee:</span>
                      <span className="text-[11px] font-bold text-[#1E6B52]">
                        Govt Approved Assistance
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-3 border-t border-[#DDE4E6] grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInspectedWorker(worker)}
                    className="py-2 px-3 bg-[#F8FAFB] hover:bg-[#F0F4F6] text-[#202A2B] text-xs font-bold rounded-xl border border-[#DDE4E6] transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#526365]" />
                    <span>View Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectWorkerForBooking(worker, worker.skillCategory as WorkerSkillCategory)}
                    className="py-2 px-3 bg-[#202A2B] hover:bg-[#202A2B]/90 text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border border-[#202A2B]"
                  >
                    <span>Book Service</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#65D6B0]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WORKER PROFILE DETAIL MODAL */}
      {inspectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#DDE4E6] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setInspectedWorker(null)}
              className="absolute right-5 top-5 p-2 rounded-full hover:bg-[#F0F4F6] text-[#7E9092] hover:text-[#202A2B] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <img
                src={inspectedWorker.profileImage || inspectedWorker.verificationPhoto || 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=200&q=80'}
                alt={inspectedWorker.fullName}
                className="w-16 h-16 rounded-2xl object-cover border border-[#DDE4E6] shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-[#202A2B]">
                    {inspectedWorker.fullName}
                  </h3>
                  <ShieldCheck className="w-4 h-4 text-[#3EA684]" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono font-bold bg-[#D7F7FC] text-[#007D99] px-2 py-0.5 rounded">
                    {inspectedWorker.workerId}
                  </span>
                  <span className="text-xs font-bold text-[#1E6B52] bg-[#DDF8EF] px-2 py-0.5 rounded">
                    {inspectedWorker.verificationStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#526365]">
                Specialist Category
              </span>
              <div className="text-sm font-bold text-[#202A2B]">
                {inspectedWorker.skillCategory}
              </div>
              <p className="text-xs text-[#526365] leading-relaxed pt-1">
                {inspectedWorker.bio || inspectedWorker.headline}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFB] border border-[#DDE4E6] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#526365]">Station Hub:</span>
                <strong className="text-[#202A2B]">{inspectedWorker.stationName} ({inspectedWorker.stationCode})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526365]">Station City:</span>
                <strong className="text-[#202A2B]">{inspectedWorker.city}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526365]">Experience:</span>
                <strong className="text-[#202A2B]">{inspectedWorker.experienceYears} Years Certified</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526365]">Total Completed Coach Tasks:</span>
                <strong className="text-[#3EA684]">{inspectedWorker.totalJobsCompleted || 14} Jobs</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526365]">Qualifications:</span>
                <span className="text-[#202A2B] font-medium text-right max-w-[200px] truncate">
                  {inspectedWorker.qualifications || 'Certified Technical Trade Verification'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#526365]">
                Verified Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Array.isArray(inspectedWorker.skills) && inspectedWorker.skills.map((sk) => (
                  <span key={sk} className="text-xs font-semibold bg-[#DDF8EF] text-[#1E6B52] px-2.5 py-1 rounded-lg border border-[#65D6B0]/40 flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#3EA684]" />
                    <span>{sk}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#DDE4E6] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setInspectedWorker(null)}
                className="px-4 py-2.5 bg-[#F0F4F6] hover:bg-[#DDE4E6] text-[#202A2B] text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = inspectedWorker;
                  setInspectedWorker(null);
                  onSelectWorkerForBooking(target, target.skillCategory as WorkerSkillCategory);
                }}
                className="px-5 py-2.5 bg-[#202A2B] hover:bg-[#202A2B]/90 text-white text-xs font-black rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs border border-[#202A2B]"
              >
                <span>Book This Specialist</span>
                <ArrowRight className="w-4 h-4 text-[#65D6B0]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
