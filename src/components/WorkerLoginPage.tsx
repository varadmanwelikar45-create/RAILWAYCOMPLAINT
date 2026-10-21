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
  Sparkles,
  UserPlus
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

  // Instant login with authorized personnel
  const handleDirectDemoLogin = async (demoWorker: Worker) => {
    setEmail(demoWorker.email);
    setPassword('Worker@1234');
    setError(null);
    setLoading(true);
    const photoToUse = demoWorker.verificationPhoto || demoWorker.profileImage || PRESET_WORKER_PHOTOS[0].url;
    setVerificationPhoto(photoToUse);
    try {
      const res = await onWorkerLogin(demoWorker.email, 'Worker@1234', photoToUse);
      if (!res.success) {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Direct login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Top Breadcrumb & Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack || (() => onNavigate('landing'))}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-amber-600 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-600" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-slate-500">Looking for a different portal?</span>
          <button
            onClick={() => onNavigate('landing')}
            className="text-amber-600 underline hover:text-amber-700 font-bold cursor-pointer"
          >
            Role Portals
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Worker Login Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-extrabold rounded-md tracking-wider uppercase border border-amber-300">
              WORKER PORTAL
            </span>
            <span className="text-xs text-slate-500 font-medium">RAIL CARE WORKFORCE</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Gig Worker Sign In
          </h1>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Sign in to check station assignments, manage your availability, and accept passenger assistance requests.
          </p>

          {/* Error Notice with Smart Direct Action */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-300 text-slate-900 text-xs space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                <span className="font-semibold text-slate-900">{error}</span>
              </div>
              {error.toLowerCase().includes('register') && (
                <div className="pt-2 border-t border-amber-200 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-600">Need to create your worker profile?</span>
                  <button
                    type="button"
                    onClick={() => onNavigate('worker-register')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register as Worker</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Worker Registered Email */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Worker Registered Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. ramesh.verma@worker.railcare.gov.in"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
              />
            </div>

            {/* 2. Password */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter worker password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 pr-10 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 3. Station Verification Identity Photo */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Station Verification Photo
                </label>
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Railway ID Requirement
                </span>
              </div>

              {/* Live Camera Interface */}
              {isCameraActive && (
                <div className="rounded-2xl border-2 border-amber-400 bg-slate-900 p-3 space-y-3">
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                      LIVE CAMERA
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={stopCameraStream}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={captureCameraPhoto}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take Photo</span>
                    </button>
                  </div>
                </div>
              )}

              {cameraError && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Photo Preview & Selection Controls */}
              {!isCameraActive && (
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#FFFDF5] p-3.5 rounded-xl border border-amber-100">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-2xs shrink-0 bg-slate-100 flex items-center justify-center">
                    {verificationPhoto ? (
                      <img
                        src={verificationPhoto}
                        alt="Verification Photo Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-slate-400" />
                    )}
                    <div className="absolute top-1 right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Use Camera</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white hover:bg-amber-50 text-slate-800 rounded-lg text-xs font-bold transition border border-slate-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-amber-600" />
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

                    <p className="text-[10px] text-slate-500">
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
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 mb-2">
                  <Sparkles className="w-3 h-3 text-amber-500" />
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
                            ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/20 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-amber-300'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-8 h-8 rounded-lg object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-slate-900 truncate">{preset.label}</p>
                          <p className="text-[8px] text-slate-500 truncate">{preset.description}</p>
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
              className={`w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold rounded-xl shadow-sm transition-all mt-4 flex items-center justify-center gap-2 cursor-pointer border border-amber-400 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <Briefcase className="w-4 h-4 text-slate-950" />
              <span>{loading ? 'Authenticating...' : 'Sign In as Railway Gig Worker'}</span>
            </button>
          </form>

          {/* Authorized Duty Worker Fast-Select Box */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-3">
              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
              <span>Authorized Station Personnel (1-Click Instant Login · Password: Worker@1234)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INITIAL_WORKERS.slice(0, 4).map((w) => (
                <button
                  key={w.id}
                  type="button"
                  disabled={loading}
                  onClick={() => handleDirectDemoLogin(w)}
                  className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50 transition text-xs flex items-center justify-between gap-2 cursor-pointer bg-white group shadow-2xs"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 block truncate group-hover:text-amber-700">{w.fullName}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{w.skillCategory.split('&')[0]} · {w.stationCode}</span>
                  </div>
                  <span className="px-2 py-1 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-lg shrink-0 border border-amber-200 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                    Sign In &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Registration & Navigation links */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <span>
              Don't have a worker account?{' '}
              <button
                onClick={() => onNavigate('worker-register')}
                className="font-bold text-amber-600 underline hover:text-amber-700 cursor-pointer"
              >
                Register as New Worker
              </button>
            </span>
            <button
              onClick={() => onNavigate('landing')}
              className="font-semibold text-slate-600 hover:text-amber-600 cursor-pointer"
            >
              &larr; Back to Role Selection
            </button>
          </div>
        </div>

        {/* Right Column: Portal info & Policy */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-600" />
              <span>Worker Verification Policy</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              All railway workers undergo administrative background check and station assignment before receiving live service requests.
            </p>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Station platform access permit</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Live verification photo submitted to Administrator</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Real-time train arrival coordination</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Passenger grievance resolution</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
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
            <div className="bg-slate-900 text-white p-3.5 text-xs font-semibold flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Station Gig Workforce</p>
                <p className="text-[10px] text-amber-300">Interconnected with Passengers &amp; Admin</p>
              </div>
              <span className="text-amber-400 font-mono font-bold">RAIL CARE</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
