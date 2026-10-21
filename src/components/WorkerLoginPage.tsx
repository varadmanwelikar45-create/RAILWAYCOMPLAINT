import React, { useState, useRef, useEffect } from 'react';
import { ViewMode, Worker } from '../types';
import { INITIAL_WORKERS } from '../data/mockData';
import { 
  Briefcase, 
  ArrowLeft, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Shield, 
  CheckCircle2, 
  Camera, 
  Upload, 
  KeyRound, 
  Check, 
  Sparkles 
} from 'lucide-react';
import trainJourneyImg from '../assets/images/rail_care_train_journey_1792164300619.jpg';

interface WorkerLoginPageProps {
  onWorkerLogin: (
    email: string, 
    password: string, 
    photo?: string
  ) => Promise<{ success: boolean; message: string; worker?: Worker }> | { success: boolean; message: string; worker?: Worker };
  onNavigate: (view: ViewMode) => void;
  onBack?: () => void;
}

// Preset verified worker badges/photos for instant convenience
const PRESET_WORKER_PHOTOS = [
  {
    id: 'tech-badge',
    label: 'Railway Contractor Badge',
    description: 'Official Railway Duty Contractor Photo',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'uniform-selfie',
    label: 'Station Uniform Selfie',
    description: 'Standard Coach Technician Yellow High-Vis',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'id-card',
    label: 'Divisional Duty ID Card',
    description: 'Railway Electrician & Service Personnel Card',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
];

export const WorkerLoginPage: React.FC<WorkerLoginPageProps> = ({
  onWorkerLogin,
  onNavigate,
  onBack,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationPhoto, setVerificationPhoto] = useState<string>(PRESET_WORKER_PHOTOS[0].url);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [photoSource, setPhotoSource] = useState<'preset' | 'upload' | 'camera'>('preset');

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera when unmounting or switching away
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera access is not supported on this browser. Please use file upload.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
      setPhotoSource('camera');
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraError('Could not access camera. Please allow camera permissions or upload an image file.');
      setIsCameraActive(false);
    }
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setVerificationPhoto(dataUrl);
      setPhotoSource('camera');
      stopCameraStream();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setVerificationPhoto(result);
        setPhotoSource('upload');
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please provide both worker email and password.');
      return;
    }

    if (!verificationPhoto) {
      setError('Please update your verification image before signing in. This is required for station verification.');
      return;
    }

    setLoading(true);
    try {
      const res = await onWorkerLogin(email.toLowerCase().trim(), password, verificationPhoto);
      if (!res.success) {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Worker login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoWorker = (demoWorker: Worker) => {
    setEmail(demoWorker.email);
    setPassword('Worker@1234');
    setError(null);
    if (demoWorker.verificationPhoto || demoWorker.profileImage) {
      setVerificationPhoto(demoWorker.verificationPhoto || demoWorker.profileImage || PRESET_WORKER_PHOTOS[0].url);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Top Breadcrumb & Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack || (() => onNavigate('landing'))}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#183B3A] hover:text-[#0F766E] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#0F766E]" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-[#647773]">Looking for a different portal?</span>
          <button
            onClick={() => onNavigate('landing')}
            className="text-[#0F766E] underline hover:text-[#115E59] font-bold cursor-pointer"
          >
            Role Portals
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Worker Login Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#D8EAE4] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-[#CCFBF1] text-[#0F766E] text-[10px] font-extrabold rounded-md tracking-wider uppercase border border-[#A7E8D0]">
              WORKER PORTAL
            </span>
            <span className="text-xs text-[#647773] font-medium">RAIL CARE WORKFORCE</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#115E59] tracking-tight">
            Gig Worker Sign In
          </h1>
          <p className="text-xs text-[#647773] mt-1 mb-6">
            Sign in to check station assignments, manage your availability, and accept passenger assistance requests.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-[#C74646] text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#C74646]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Worker Registered Email */}
            <div>
              <label className="block text-xs font-bold text-[#183B3A] uppercase tracking-wider mb-1.5">
                Worker Registered Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. ramesh.verma@worker.railcare.gov.in"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8EAE4] bg-white text-xs text-[#183B3A] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:border-[#0F766E]"
              />
            </div>

            {/* 2. Password */}
            <div>
              <label className="block text-xs font-bold text-[#183B3A] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter worker password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8EAE4] bg-white text-xs text-[#183B3A] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:border-[#0F766E] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#647773] hover:text-[#0F766E] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 3. Update Worker Image for Verification Process */}
            <div className="p-4 sm:p-5 rounded-2xl border border-[#A7E8D0] bg-[#F4FBF8] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0F766E] text-[#CCFBF1] flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[#115E59] uppercase tracking-wider">
                      Update Image for Verification Process
                    </label>
                    <p className="text-[10px] text-[#647773]">
                      Required: Admin will verify this live photo to approve your account.
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#16845B] text-white text-[10px] font-bold">
                  Live Audit
                </span>
              </div>

              {/* Live Camera Stream Container */}
              {isCameraActive && (
                <div className="relative rounded-xl overflow-hidden border border-[#0F766E] bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-48 sm:h-56 object-cover"
                  />
                  <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={captureCameraPhoto}
                      className="px-4 py-2 bg-[#16845B] hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer border border-white"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={stopCameraStream}
                      className="px-3 py-2 bg-slate-800/80 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {cameraError && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[#C58B20] text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-[#C58B20] shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Photo Preview & Selection Controls */}
              {!isCameraActive && (
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-xl border border-[#D8EAE4]">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-[#0F766E] shadow-2xs shrink-0 bg-slate-100 flex items-center justify-center">
                    {verificationPhoto ? (
                      <img
                        src={verificationPhoto}
                        alt="Verification Photo Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-[#647773]" />
                    )}
                    <div className="absolute top-1 right-1 bg-[#16845B] text-white p-0.5 rounded-full">
                      <Check className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-3 py-1.5 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#A7E8D0]" />
                        <span>Use Camera</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-[#E5F5EF] hover:bg-[#CCFBF1] text-[#0F766E] rounded-lg text-xs font-bold transition border border-[#A7E8D0] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="user"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>

                    <p className="text-[10px] text-[#647773]">
                      {photoSource === 'camera'
                        ? 'Captured via live camera snapshot.'
                        : photoSource === 'upload'
                        ? 'Uploaded from device storage.'
                        : 'Using official verification portrait.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Fast Presets Options */}
              <div className="pt-2 border-t border-[#D8EAE4]">
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#183B3A] mb-2">
                  <Sparkles className="w-3 h-3 text-[#0F766E]" />
                  <span>Or select quick verification portrait:</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_WORKER_PHOTOS.map((preset) => {
                    const isSelected = verificationPhoto === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setVerificationPhoto(preset.url);
                          setPhotoSource('preset');
                          stopCameraStream();
                        }}
                        className={`p-1.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-white border-[#0F766E] ring-2 ring-[#0F766E]/20 shadow-2xs'
                            : 'bg-white/70 border-[#D8EAE4] hover:border-[#0F766E]'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-8 h-8 rounded-lg object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-[#183B3A] truncate">{preset.label}</p>
                          <p className="text-[8px] text-[#647773] truncate">{preset.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold rounded-xl shadow-xs transition-all mt-4 flex items-center justify-center gap-2 cursor-pointer border border-[#0F766E] ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <Briefcase className="w-4 h-4 text-[#A7E8D0]" />
              <span>{loading ? 'Authenticating & Syncing Image...' : 'Sign In & Update Verification Image'}</span>
            </button>
          </form>

          {/* Authorized Duty Worker Fast-Select Box */}
          <div className="mt-8 pt-6 border-t border-[#D8EAE4]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#183B3A] mb-3">
              <KeyRound className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Authorized Station Personnel (Fast Access · Password: Worker@1234)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INITIAL_WORKERS.slice(0, 4).map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => handleQuickDemoWorker(w)}
                  className="text-left p-2.5 rounded-xl border border-[#D8EAE4] hover:border-[#0F766E] hover:bg-[#E5F5EF] transition text-xs flex flex-col gap-0.5 cursor-pointer bg-[#F4FBF8]"
                >
                  <span className="font-bold text-[#183B3A] truncate">{w.fullName}</span>
                  <span className="text-[10px] text-[#647773] truncate">{w.skillCategory.split('&')[0]} · {w.stationCode}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Registration & Navigation links */}
          <div className="mt-6 pt-4 border-t border-[#D8EAE4] flex flex-col sm:flex-row items-center justify-between text-xs text-[#647773] gap-2">
            <span>
              Don't have a worker account?{' '}
              <button
                onClick={() => onNavigate('worker-register')}
                className="font-bold text-[#0F766E] underline hover:text-[#115E59] cursor-pointer"
              >
                Register as New Worker
              </button>
            </span>
            <button
              onClick={() => onNavigate('landing')}
              className="font-semibold text-[#647773] hover:text-[#0F766E] cursor-pointer"
            >
              &larr; Back to Role Selection
            </button>
          </div>
        </div>

        {/* Right Column: Portal info & Policy */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-[#D8EAE4] p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#115E59] mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#0F766E]" />
              <span>Worker Verification Policy</span>
            </h3>
            <p className="text-xs text-[#647773] leading-relaxed mb-4">
              All railway workers undergo administrative background check and station assignment before receiving live service requests.
            </p>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-[#183B3A]">
                <CheckCircle2 className="w-4 h-4 text-[#16845B] shrink-0" />
                <span>Station platform access permit</span>
              </div>
              <div className="flex items-center gap-2 text-[#183B3A]">
                <CheckCircle2 className="w-4 h-4 text-[#16845B] shrink-0" />
                <span>Live verification photo submitted to Administrator</span>
              </div>
              <div className="flex items-center gap-2 text-[#183B3A]">
                <CheckCircle2 className="w-4 h-4 text-[#16845B] shrink-0" />
                <span>Real-time train arrival coordination</span>
              </div>
              <div className="flex items-center gap-2 text-[#183B3A]">
                <CheckCircle2 className="w-4 h-4 text-[#16845B] shrink-0" />
                <span>Passenger grievance resolution</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-[#D8EAE4] shadow-xs">
            <img
              src={trainJourneyImg}
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== '/images/rail_care_train_journey.jpg') {
                  target.src = '/images/rail_care_train_journey.jpg';
                }
              }}
              alt="Railway Worker Platform"
              className="w-full h-44 object-cover"
            />
            <div className="bg-[#115E59] text-white p-3.5 text-xs font-semibold flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Station Gig Workforce</p>
                <p className="text-[10px] text-[#A7E8D0]">Interconnected with Passengers & Admin</p>
              </div>
              <span className="text-[#CCFBF1] font-mono">RAIL CARE</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
