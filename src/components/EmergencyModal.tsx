import React, { useState } from 'react';
import { AlertCircle, Shield, HeartPulse, X, CheckCircle2, PhoneCall } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: { fullName?: string; mobile?: string } | null;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [trainNumber, setTrainNumber] = useState('');
  const [coachSeat, setCoachSeat] = useState('');
  const [emergencyType, setEmergencyType] = useState('Medical Emergency');
  const [sosSent, setSosSent] = useState(false);

  if (!isOpen) return null;

  const handleSendSos = (e: React.FormEvent) => {
    e.preventDefault();
    setSosSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#202A2B]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-[#D72645]/40 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-fadeIn">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#DDE4E6]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#D72645] text-white flex items-center justify-center shadow-md animate-pulse">
              <PhoneCall className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FBE0E6] text-[#92182D] text-[10px] font-black uppercase tracking-wider mb-0.5 border border-[#D72645]/30">
                24x7 RAILWAY EMERGENCY
              </div>
              <h3 className="text-xl font-black text-[#202A2B]">
                VYOM RATH Emergency SOS
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              setSosSent(false);
              onClose();
            }}
            className="p-1.5 text-[#7E9092] hover:text-[#202A2B] rounded-lg hover:bg-[#F0F4F6] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Direct Contact Badges */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#F8FAFB] border border-[#DDE4E6] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#202A2B] text-[#65D6B0] flex items-center justify-center font-black text-xs shrink-0">
              139
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#526365] uppercase">Rail Madad Helpline</div>
              <div className="font-black text-[#202A2B] text-sm">Toll-Free 139</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8FAFB] border border-[#DDE4E6] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D72645] text-white flex items-center justify-center font-bold text-xs shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#526365] uppercase">Security / RPF</div>
              <div className="font-black text-[#202A2B] text-sm">139 / 182</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8FAFB] border border-[#DDE4E6] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#65D6B0] text-[#202A2B] flex items-center justify-center font-black text-xs shrink-0">
              <HeartPulse className="w-4 h-4 text-[#1E6B52]" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#526365] uppercase">Medical Assistance</div>
              <div className="font-black text-[#202A2B] text-sm">Station First Aid</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8FAFB] border border-[#DDE4E6] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#007D99] text-white flex items-center justify-center font-bold text-xs shrink-0">
              112
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#526365] uppercase">National Emergency</div>
              <div className="font-black text-[#202A2B] text-sm">Police 112</div>
            </div>
          </div>
        </div>

        {/* Rapid SOS Trigger Form */}
        {sosSent ? (
          <div className="p-5 rounded-2xl bg-[#DDF8EF] border border-[#65D6B0]/40 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-[#3EA684] mx-auto" />
            <h4 className="font-black text-[#202A2B] text-base">Emergency Broadcast Triggered</h4>
            <p className="text-xs text-[#526365]">
              Station master and railway security for train <strong>{trainNumber || 'your train'}</strong> have been notified. Please also dial <strong>139</strong> for immediate spoken contact.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendSos} className="space-y-4 pt-1">
            <div className="text-xs font-black text-[#202A2B] uppercase tracking-wide">
              Quick Coach SOS Dispatch
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#526365] mb-1">
                  Train No. / Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 12951 Rajdhani"
                  value={trainNumber}
                  onChange={(e) => setTrainNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#DDE4E6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D72645] bg-white text-[#202A2B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#526365] mb-1">
                  Coach &amp; Berth
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B4 / Berth 21"
                  value={coachSeat}
                  onChange={(e) => setCoachSeat(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#DDE4E6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D72645] bg-white text-[#202A2B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#526365] mb-1">
                Emergency Category
              </label>
              <select
                value={emergencyType}
                onChange={(e) => setEmergencyType(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#DDE4E6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D72645] bg-white text-[#202A2B] font-bold"
              >
                <option value="Medical Emergency">Medical Emergency / First-Aid</option>
                <option value="Security Threat">Security / Harassment / Theft</option>
                <option value="Fire / Hazard">Smoke / Electrical Spark / Fire</option>
                <option value="Differently Abled Support">Divyangjan / Elderly Stretcher Support</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#D72645] hover:bg-[#92182D] text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Broadcast Coach Emergency SOS</span>
            </button>
          </form>
        )}

        <div className="text-[11px] text-[#526365] text-center border-t border-[#DDE4E6] pt-3">
          For non-emergency assistance, use the Passenger Portal to book station gig workers.
        </div>

      </div>
    </div>
  );
};
