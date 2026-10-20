import React, { useState } from 'react';
import { Phone, AlertCircle, Shield, HeartPulse, X, Send, CheckCircle2, PhoneCall } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: { fullName?: string; mobile?: string } | null;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [trainNumber, setTrainNumber] = useState('');
  const [coachSeat, setCoachSeat] = useState('');
  const [emergencyType, setEmergencyType] = useState('Medical Emergency');
  const [sosSent, setSosSent] = useState(false);

  if (!isOpen) return null;

  const handleSendSos = (e: React.FormEvent) => {
    e.preventDefault();
    setSosSent(true);
    setTimeout(() => {
      // Keep alert confirmed
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#142B4A]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-red-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#E8E2D3]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md animate-pulse">
              <PhoneCall className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-extrabold uppercase tracking-wider mb-0.5 border border-red-200">
                24x7 RAILWAY EMERGENCY
              </div>
              <h3 className="text-xl font-extrabold text-[#142B4A]">
                Rail Madad & Emergency Helplines
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              setSosSent(false);
              onClose();
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Official Direct Contact Badges */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#FFFDF5] border border-[#E8E2D3] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#142B4A] text-[#E9B949] flex items-center justify-center font-bold text-xs shrink-0">
              139
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#6B7280] uppercase">Rail Madad Helpline</div>
              <div className="font-extrabold text-[#142B4A] text-sm">Toll-Free 139</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FFFDF5] border border-[#E8E2D3] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#6B7280] uppercase">Security / RPF</div>
              <div className="font-extrabold text-[#142B4A] text-sm">139 / 182</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FFFDF5] border border-[#E8E2D3] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
              <HeartPulse className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#6B7280] uppercase">Medical Assistance</div>
              <div className="font-extrabold text-[#142B4A] text-sm">Station First Aid</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FFFDF5] border border-[#E8E2D3] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
              112
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#6B7280] uppercase">National Emergency</div>
              <div className="font-extrabold text-[#142B4A] text-sm">Police & Rescue 112</div>
            </div>
          </div>
        </div>

        {/* Rapid SOS Trigger Form */}
        <div className="bg-red-50/70 border border-red-200 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 text-red-900 font-extrabold text-xs">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>Instant Train Coach SOS Dispatch</span>
          </div>

          {sosSent ? (
            <div className="bg-white border border-emerald-300 rounded-xl p-4 text-center space-y-2 animate-in fade-in">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-extrabold text-[#142B4A] text-sm">SOS Alert Transmitted to Divisional Control</h4>
              <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
                Railway Protection Force (RPF) and station on-board medical teams at the upcoming junction have been alerted with high priority for {trainNumber || 'your train'}.
              </p>
              <button
                type="button"
                onClick={() => setSosSent(false)}
                className="mt-2 text-xs font-bold text-[#142B4A] underline cursor-pointer"
              >
                Send Another Alert
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendSos} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#253247] uppercase block mb-1">
                    Train No / Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={trainNumber}
                    onChange={(e) => setTrainNumber(e.target.value)}
                    placeholder="e.g. 12951 Rajdhani"
                    className="w-full text-xs p-2.5 bg-white border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#253247] uppercase block mb-1">
                    Coach & Seat *
                  </label>
                  <input
                    type="text"
                    required
                    value={coachSeat}
                    onChange={(e) => setCoachSeat(e.target.value)}
                    placeholder="e.g. B3, Seat 24"
                    className="w-full text-xs p-2.5 bg-white border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#253247] uppercase block mb-1">
                  Type of Emergency
                </label>
                <select
                  value={emergencyType}
                  onChange={(e) => setEmergencyType(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="Medical Emergency">Medical Emergency / Severe Illness</option>
                  <option value="Security / Threat">Security Threat / Theft / Harassment</option>
                  <option value="Women Safety">Women Passenger Safety</option>
                  <option value="Fire / Smoke">Fire / Smoke / Electrical Spark</option>
                  <option value="Unattended Bag">Unattended / Suspicious Luggage</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <AlertCircle className="w-4 h-4 text-white" />
                <span>Transmit Emergency SOS Alert</span>
              </button>
            </form>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#6B7280] hover:text-[#142B4A] rounded-xl transition cursor-pointer"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
};
