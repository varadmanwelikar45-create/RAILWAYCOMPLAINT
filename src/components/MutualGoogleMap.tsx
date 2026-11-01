import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  LocateFixed, 
  ExternalLink, 
  Compass, 
  Train, 
  UserCheck, 
  ShieldCheck, 
  RefreshCw,
  Layers,
  Clock,
  Radio
} from 'lucide-react';

interface MutualGoogleMapProps {
  userRole: 'passenger' | 'worker';
  requestId: string;
  trainNumber: string;
  coachNumber?: string;
  seatNumber?: string;
  stationName: string;
  stationCode: string;
  passengerName: string;
  workerName: string;
  workerSkill: string;
  workerStatusText?: string;
  passengerLocation?: {
    latitude: number;
    longitude: number;
    platform?: string;
    coach?: string;
    seat?: string;
    lastUpdated: string;
  };
  workerLocation?: {
    latitude: number;
    longitude: number;
    platform?: string;
    currentStatusText?: string;
    lastUpdated: string;
  };
  onLocationUpdate?: (role: 'passenger' | 'worker', coords: {
    latitude: number;
    longitude: number;
    platform?: string;
    coach?: string;
    seat?: string;
    currentStatusText?: string;
  }) => void;
}

// Station reference coordinates for Indian Railway hubs
const STATION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  NDLS: { lat: 28.6431, lng: 77.2197 },
  CSMT: { lat: 18.9400, lng: 72.8353 },
  HWH: { lat: 22.5838, lng: 88.3426 },
  MAS: { lat: 13.0827, lng: 80.2757 },
  SBC: { lat: 12.9774, lng: 77.5682 },
  PUNE: { lat: 18.5284, lng: 73.8739 },
  CNB: { lat: 26.4547, lng: 80.3508 },
  BSB: { lat: 25.3284, lng: 82.9860 },
  ADI: { lat: 23.0225, lng: 72.5714 },
};

export const MutualGoogleMap: React.FC<MutualGoogleMapProps> = ({
  userRole,
  requestId,
  trainNumber,
  coachNumber = 'B3',
  seatNumber = 'Berth 24',
  stationName,
  stationCode,
  passengerName,
  workerName,
  workerSkill,
  workerStatusText = 'Approaching coach platform',
  passengerLocation,
  workerLocation,
  onLocationUpdate,
}) => {
  const [mapType, setMapType] = useState<'platform-radar' | 'google-map'>('platform-radar');
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [lastSyncText, setLastSyncText] = useState('Just now');
  const [walkSimulationStep, setWalkSimulationStep] = useState(0);

  // Fallback coordinates based on station code
  const stationCenter = STATION_COORDINATES[stationCode] || { lat: 28.6431, lng: 77.2197 };

  // Current coords with minor realistic offset along platform
  const passengerLat = passengerLocation?.latitude || stationCenter.lat + 0.00035;
  const passengerLng = passengerLocation?.longitude || stationCenter.lng + 0.00020;

  // Worker coordinates simulate movement or use stored
  const workerLat = workerLocation?.latitude || (stationCenter.lat + 0.00085 - walkSimulationStep * 0.0001);
  const workerLng = workerLocation?.longitude || (stationCenter.lng + 0.00065 - walkSimulationStep * 0.00009);

  // Compute straight-line distance in meters (Haversine formula approximation)
  const calculateDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.max(15, Math.round(R * c));
  };

  const distanceMeters = calculateDistanceMeters(passengerLat, passengerLng, workerLat, workerLng);
  const etaMinutes = Math.max(1, Math.ceil(distanceMeters / 65)); // 65 meters per minute walking speed

  // Handle GPS coordinate update
  const handlePingGPS = async () => {
    setIsUpdatingLocation(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const newLat = pos.coords.latitude;
            const newLng = pos.coords.longitude;
            sendLocationUpdate(newLat, newLng);
            setIsUpdatingLocation(false);
          },
          (err) => {
            console.warn('Geolocation warning (using station platform coordinates):', err.message);
            // Simulated walk step along platform
            simulateMovementStep();
            setIsUpdatingLocation(false);
          },
          { enableHighAccuracy: true, timeout: 6000 }
        );
      } else {
        simulateMovementStep();
        setIsUpdatingLocation(false);
      }
    } catch (e) {
      simulateMovementStep();
      setIsUpdatingLocation(false);
    }
  };

  const simulateMovementStep = () => {
    const nextStep = Math.min(4, walkSimulationStep + 1);
    setWalkSimulationStep(nextStep);

    if (userRole === 'worker') {
      const newLat = stationCenter.lat + 0.00085 - nextStep * 0.0001;
      const newLng = stationCenter.lng + 0.00065 - nextStep * 0.00009;
      sendLocationUpdate(newLat, newLng, `Walking on Platform toward Coach ${coachNumber}`);
    } else {
      sendLocationUpdate(passengerLat, passengerLng, undefined);
    }
  };

  const sendLocationUpdate = async (
    lat: number,
    lng: number,
    statusDesc?: string
  ) => {
    try {
      await fetch(`/api/worker-requests/${requestId}/location`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: userRole,
          latitude: lat,
          longitude: lng,
          platform: 'Platform 2',
          coach: coachNumber,
          seat: seatNumber,
          currentStatusText: statusDesc || (userRole === 'worker' ? 'Approaching Coach Door' : 'At Berth Seat'),
        }),
      });
      setLastSyncText(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      onLocationUpdate?.(userRole, {
        latitude: lat,
        longitude: lng,
        platform: 'Platform 2',
        coach: coachNumber,
        seat: seatNumber,
        currentStatusText: statusDesc,
      });
    } catch (e) {
      console.warn('Location sync notice:', e);
    }
  };

  // Google Maps Directions link for native app navigation
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${workerLat},${workerLng}&destination=${passengerLat},${passengerLng}&travelmode=walking`;

  // Google Maps Embed URL centered on coordinates
  const googleMapsEmbedUrl = `https://www.google.com/maps?q=${passengerLat},${passengerLng}&z=18&output=embed`;

  return (
    <div className="bg-white rounded-3xl border border-[#DDE4E6] shadow-xs overflow-hidden">
      
      {/* Header Bar */}
      <div className="bg-[#202A2B] text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#65D6B0] animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-wider text-[#65D6B0] bg-[#65D6B0]/20 px-2 py-0.5 rounded border border-[#65D6B0]/40">
              Live Mutual Tracking Active
            </span>
            <span className="text-xs text-slate-300 font-mono">
              Req #{requestId}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <span>{userRole === 'passenger' ? `Tracking Worker: ${workerName}` : `Navigating to Passenger: ${passengerName}`}</span>
          </h3>

          <p className="text-xs text-slate-300">
            {stationName} ({stationCode}) · Platform 2 · Train {trainNumber} · Coach {coachNumber} ({seatNumber})
          </p>
        </div>

        {/* View Switcher & Action */}
        <div className="flex items-center gap-2">
          <div className="flex bg-[#2F3D3F] p-1 rounded-xl border border-white/10 text-xs font-bold">
            <button
              onClick={() => setMapType('platform-radar')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                mapType === 'platform-radar'
                  ? 'bg-[#65D6B0] text-[#202A2B] font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Coach Radar</span>
            </button>

            <button
              onClick={() => setMapType('google-map')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                mapType === 'google-map'
                  ? 'bg-[#65D6B0] text-[#202A2B] font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Google Map</span>
            </button>
          </div>

          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open turn-by-turn route in Google Maps app"
            className="p-2 bg-[#2F3D3F] hover:bg-[#3E5052] text-white rounded-xl border border-white/10 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
          >
            <Navigation className="w-3.5 h-3.5 text-[#65D6B0]" />
            <span className="hidden sm:inline">Directions</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="bg-[#DDF8EF]/50 border-b border-[#DDE4E6] p-3 sm:px-5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 font-bold text-[#1E6B52]">
            <Radio className="w-4 h-4 text-[#3EA684] animate-pulse" />
            <span>Mutual Distance: <strong className="text-sm font-black text-[#202A2B]">{distanceMeters} meters</strong></span>
          </div>

          <div className="flex items-center gap-1.5 text-[#526365]">
            <Clock className="w-3.5 h-3.5 text-[#007D99]" />
            <span>Walking ETA: <strong className="text-[#007D99] font-bold">~{etaMinutes} min{etaMinutes > 1 ? 's' : ''}</strong></span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-[#7E9092] text-[11px]">
            <span>Synced: {lastSyncText}</span>
          </div>
        </div>

        {/* Update / Ping Button */}
        <button
          onClick={handlePingGPS}
          disabled={isUpdatingLocation}
          className="px-3 py-1.5 bg-[#202A2B] hover:bg-[#202A2B]/90 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
        >
          <LocateFixed className={`w-3.5 h-3.5 text-[#65D6B0] ${isUpdatingLocation ? 'animate-spin' : ''}`} />
          <span>{userRole === 'worker' ? 'Update My Walking Position' : 'Update My Berth Location'}</span>
        </button>
      </div>

      {/* Map Content Area */}
      <div className="relative">
        {mapType === 'platform-radar' ? (
          <div className="p-4 sm:p-6 bg-[#F8FAFB] space-y-4">
            
            {/* Visual Railway Coach & Platform Radar View */}
            <div className="relative bg-white border border-[#DDE4E6] rounded-2xl p-5 shadow-inner overflow-hidden min-h-[300px] flex flex-col justify-between">
              
              {/* Background Railway Track Lines */}
              <div className="absolute inset-0 opacity-15 pointer-events-none flex flex-col justify-around py-4">
                <div className="border-b-2 border-dashed border-[#526365] w-full" />
                <div className="border-b-4 border-[#202A2B] w-full" />
                <div className="border-b-2 border-dashed border-[#526365] w-full" />
              </div>

              {/* Top Radar Legend */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#DDE4E6] text-xs">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#B94A3A] ring-2 ring-[#B94A3A]/30" />
                    <span className="font-bold text-[#202A2B]">Passenger: Coach {coachNumber} ({seatNumber})</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#007D99] ring-2 ring-[#007D99]/30 animate-pulse" />
                    <span className="font-bold text-[#007D99]">Worker: {workerName} ({workerSkill})</span>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-[#526365] bg-[#F0F4F6] px-2 py-0.5 rounded border border-[#DDE4E6]">
                  Platform 2 · Long-Distance Track
                </div>
              </div>

              {/* Train Carriage Representation */}
              <div className="relative z-10 my-4 space-y-2">
                <div className="text-[11px] font-bold text-[#526365] flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[#202A2B]">
                    <Train className="w-3.5 h-3.5 text-[#B94A3A]" />
                    <span>Train {trainNumber} ({stationCode} Halt)</span>
                  </span>
                  <span>Engine ◄──</span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto py-2 px-1">
                  {['ENG', 'H1', 'A1', 'A2', 'B1', 'B2', 'B3', 'B4', 'S1', 'S2'].map((c) => {
                    const isTargetCoach = c === coachNumber || (coachNumber && coachNumber.includes(c));
                    return (
                      <div
                        key={c}
                        className={`relative px-3 py-2.5 rounded-xl text-center font-mono text-xs shrink-0 font-black transition-all ${
                          isTargetCoach
                            ? 'bg-[#B94A3A] text-white shadow-md ring-4 ring-[#B94A3A]/20 scale-105'
                            : 'bg-white text-[#526365] border border-[#DDE4E6]'
                        }`}
                      >
                        {c}
                        {isTargetCoach && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#202A2B] text-[#65D6B0] text-[9px] px-1.5 py-0.2 rounded-full font-sans font-bold whitespace-nowrap shadow-xs">
                            🎯 Passenger
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Platform Concourse Walk Path */}
              <div className="relative z-10 bg-[#F0F4F6] rounded-xl p-3 border border-[#DDE4E6] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#202A2B]">Platform 2 Walkway Concourse:</span>
                  <span className="text-[#007D99] font-bold text-[11px]">
                    Status: {workerStatusText}
                  </span>
                </div>

                {/* Progress Line */}
                <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#007D99] to-[#65D6B0] transition-all duration-700 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(15, 100 - (distanceMeters / 150) * 100))}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-[#526365]">
                  <span>Worker Platform Entry (FOB Stairs)</span>
                  <span className="font-bold text-[#1E6B52]">{distanceMeters}m to Passenger Door</span>
                  <span>Coach {coachNumber} Doorway</span>
                </div>
              </div>

              {/* Bottom Live Summary */}
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-[#DDE4E6] text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#3EA684]" />
                  <span className="text-[#526365]">
                    {userRole === 'passenger'
                      ? `Worker ${workerName} is wearing an official Indian Railways service badge.`
                      : `Passenger ${passengerName} is seated at Berth ${seatNumber} in Coach ${coachNumber}.`}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[#7E9092]">
                  <span>GPS: {passengerLat.toFixed(4)}, {passengerLng.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Real Google Maps Embedded iFrame */
          <div className="relative w-full h-[360px] bg-slate-100">
            <iframe
              title="Google Maps Mutual Tracking"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={googleMapsEmbedUrl}
              className="w-full h-full"
            />
            
            {/* Overlay pill with distance */}
            <div className="absolute top-3 left-3 bg-[#202A2B]/90 backdrop-blur-xs text-white p-2.5 rounded-xl border border-white/20 text-xs shadow-md space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#65D6B0]">
                <MapPin className="w-3.5 h-3.5" />
                <span>Station: {stationName} ({stationCode})</span>
              </div>
              <div className="text-[11px] text-slate-300">
                Mutual Distance: <strong>{distanceMeters} meters</strong> · ETA: <strong>~{etaMinutes} min</strong>
              </div>
            </div>

            <div className="absolute bottom-3 right-3">
              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#007D99] hover:bg-[#007D99]/90 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Open in Google Maps App</span>
                <ExternalLink className="w-3 h-3 text-white/70" />
              </a>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
