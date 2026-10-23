import React, { useState, useRef, useEffect } from 'react';
import { ViewMode, Worker } from '../types';
import { 
  Briefcase, 
  ArrowLeft, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Shield, 
  Camera, 
  Train,
  UserPlus
} from 'lucide-react';

interface WorkerLoginPageProps {
  onWorkerLogin: (
    email: string, 
    password: string, 
    photo?: string
  ) => Promise<{ success: boolean; message: string; worker?: Worker }> | { success: boolean; message: string; worker?: Worker };
  onNavigate: (view: ViewMode) => void;
  onBack?: () => void;
}

const PRESET_WORKER_PHOTOS = [
  {
    id: 'badge-1',
    label: 'Railway Duty Badge',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'badge-2',
    label: 'Station Uniform Photo',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'badge-3',
    label: 'Divisional Service ID',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
];

const DEMO_WORKER_PROFILES = [
  {
    workerId: 'WRK-101',
    name: 'Ramesh Kumar Verma',
    role: 'AC & Electrician',
    station: 'NDLS',
    email: 'ramesh.verma@worker.railcare.gov.in',
    mobile: '9871122334',
    photo: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=400&q=80',
  },
  {
    workerId: 'WRK-102',
    name: 'Suresh Babu Patil',
    role: 'Sanitation & Plumber',
    station: 'CSMT',
    email: 'suresh.patil@worker.railcare.gov.in',
    mobile: '9820033445',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    workerId: 'WRK-103',
    name: 'Anand Mohan Rao',
    role: 'Mechanical Fitter',
    station: 'PUNE',
    email: 'anand.rao@worker.railcare.gov.in',
    mobile: '9448855667',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    workerId: 'WRK-104',
    name: 'Pooja Sunita Devi',
    role: 'OBHS Housekeeping',
    station: 'HWH',
    email: 'pooja.devi@worker.railcare.gov.in',
    mobile: '9830044556',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
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

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    } catch (err: any) {
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
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectDemoWorker = async (prof: typeof DEMO_WORKER_PROFILES[0], autoLogin = false) => {
    setEmail(prof.workerId);
    setPassword('Worker@1234');
    if (prof.photo) {
      setVerificationPhoto(prof.photo);
    }
    setError(null);

    if (autoLogin) {
      setLoading(true);
      try {
        const res = await onWorkerLogin(prof.workerId, 'Worker@1234', prof.photo || verificationPhoto);
        if (!res.success) {
          setError(res.message);
        }
      } catch (err: any) {
        setError(err?.message || 'Worker sign in failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanIdentifier = email.trim();
    if (!cleanIdentifier || !password.trim()) {
      setError('Please provide your Worker ID / registered email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await onWorkerLogin(cleanIdentifier, password, verificationPhoto);
      if (!res.success) {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Worker login failed. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack || (() => onNavigate('landing'))}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#202A2B] hover:text-[#B94A3A] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#B94A3A]" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-[#526365]">Need to register as worker?</span>
          <button
            onClick={() => onNavigate('worker-register')}
            className="text-[#007D99] underline hover:text-[#00B8D9] font-bold cursor-pointer"
          >
            Create Worker Profile
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#DDE4E6] p-6 sm:p-10 shadow-sm max-w-2xl mx-auto">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#202A2B] text-[#65D6B0] flex items-center justify-center shadow-xs">
            <Train className="w-5 h-5" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 bg-[#D7F7FC] text-[#007D99] text-[10px] font-black rounded-md tracking-wider uppercase border border-[#00B8D9]/40">
              VYOM RATH
            </span>
            <span className="text-xs text-[#526365] font-medium ml-2">Worker Duty Hub</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-[#202A2B] tracking-tight mt-2">
          Worker Sign In
        </h1>
        <p className="text-xs text-[#526365] mt-1 mb-6">
          Sign in to check station calls, manage on-duty availability, and accept passenger assistance requests.
        </p>

        {/* Quick Demo Worker Sign-In Box */}
        <div className="mb-6 p-4 rounded-2xl bg-[#F8FAFB] border border-[#DDE4E6] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#202A2B] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00B8D9] animate-pulse"></span>
              ⚡ Quick Demo Worker Login
            </span>
            <span className="text-[10px] text-[#526365] font-semibold">One-Click Access</span>
          </div>
          <p className="text-[11px] text-[#526365]">
            Choose an active duty profile to prefill credentials and enter the station workforce dashboard:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DEMO_WORKER_PROFILES.map((prof) => {
              const isSelected = email === prof.workerId || email.toLowerCase() === prof.email.toLowerCase();
              return (
                <div
                  key={prof.workerId}
                  className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-[#D7F7FC] border-[#00B8D9] shadow-2xs'
                      : 'bg-white border-[#DDE4E6] hover:border-[#00B8D9]/50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-[#202A2B] flex items-center gap-1.5">
                      <span className="truncate">{prof.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-[#DDE4E6] rounded text-[#202A2B] font-mono shrink-0">
                        {prof.workerId}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#526365] truncate">
                      {prof.role} · {prof.station}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectDemoWorker(prof, true)}
                    className="shrink-0 px-2 py-1 bg-[#007D99] hover:bg-[#00B8D9] text-white text-[11px] font-bold rounded-lg transition cursor-pointer shadow-2xs"
                  >
                    Sign In
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#FBE0E6] border border-[#D72645]/40 text-[#92182D] text-xs space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#D72645] mt-0.5" />
              <span className="font-semibold text-[#92182D]">{error}</span>
            </div>
            <div className="pt-2 border-t border-[#D72645]/20 flex flex-wrap items-center gap-2 justify-between">
              <button
                type="button"
                onClick={() => handleSelectDemoWorker(DEMO_WORKER_PROFILES[0], true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#007D99] hover:bg-[#00B8D9] text-white font-bold rounded-lg text-[11px] transition cursor-pointer"
              >
                <span>Use Demo Profile (WRK-101)</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('worker-register')}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-[#F8FAFB] text-[#202A2B] font-bold rounded-lg text-[11px] border border-[#DDE4E6] transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#007D99]" />
                <span>Register as Worker</span>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Worker ID / Email / Mobile */}
          <div>
            <label className="block text-xs font-bold text-[#202A2B] uppercase tracking-wider mb-1.5">
              Worker ID, Registered Email, or Mobile <span className="text-[#D72645]">*</span>
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. WRK-101 or ramesh.verma@worker.railcare.gov.in"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE4E6] bg-white text-xs text-[#202A2B] focus:outline-none focus:ring-2 focus:ring-[#00B8D9] focus:border-transparent shadow-2xs"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#202A2B] uppercase tracking-wider">
                Password <span className="text-[#D72645]">*</span>
              </label>
              <span className="text-[10px] text-[#526365]">
                Demo accounts password: <span className="font-mono font-bold text-[#007D99]">Worker@1234</span>
              </span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter worker password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE4E6] bg-white text-xs text-[#202A2B] focus:outline-none focus:ring-2 focus:ring-[#00B8D9] focus:border-transparent pr-10 shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#7E9092] hover:text-[#202A2B] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Station Verification Photo */}
          <div className="pt-2 border-t border-[#DDE4E6] space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#202A2B] uppercase tracking-wider">
                Duty Verification Photo
              </label>
              <span className="text-[10px] font-semibold text-[#1E6B52] bg-[#DDF8EF] border border-[#65D6B0]/40 px-2 py-0.5 rounded-full">
                Railway Security Verified
              </span>
            </div>

            {/* Camera View */}
            {isCameraActive && (
              <div className="rounded-xl border-2 border-[#00B8D9] bg-[#202A2B] p-3 space-y-3">
                <div className="relative rounded-lg overflow-hidden aspect-video bg-black flex items-center justify-center">
                  <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={stopCameraStream}
                    className="px-3 py-1.5 text-xs text-white hover:text-[#D7F7FC] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={captureCameraPhoto}
                    className="px-4 py-1.5 bg-[#007D99] text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Capture
                  </button>
                </div>
              </div>
            )}

            {cameraError && (
              <p className="text-[11px] text-[#92182D] bg-[#FBE0E6] p-2 rounded-lg">{cameraError}</p>
            )}

            {/* Presets and Upload */}
            <div className="flex items-center gap-3">
              <img
                src={verificationPhoto}
                alt="Selected verification photo"
                className="w-12 h-12 rounded-xl object-cover border border-[#DDE4E6]"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-2.5 py-1.5 bg-[#F0F4F6] hover:bg-[#D7F7FC] text-[#202A2B] text-xs font-bold rounded-lg border border-[#DDE4E6] flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-[#007D99]" />
                  <span>Take Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 bg-[#F0F4F6] hover:bg-[#D7F7FC] text-[#202A2B] text-xs font-bold rounded-lg border border-[#DDE4E6] cursor-pointer"
                >
                  Upload File
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 bg-[#007D99] hover:bg-[#00B8D9] text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer border border-[#007D99] ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <Briefcase className="w-4 h-4 text-[#D7F7FC]" />
              <span>{loading ? 'Verifying Credentials...' : 'Sign In as Worker'}</span>
            </button>
          </div>

        </form>

        <div className="mt-6 pt-4 border-t border-[#DDE4E6] text-center text-xs text-[#526365]">
          <span>New to VYOM RATH Workforce? </span>
          <button
            onClick={() => onNavigate('worker-register')}
            className="text-[#007D99] font-bold hover:underline cursor-pointer"
          >
            Register Here &rarr;
          </button>
        </div>

      </div>
    </div>
  );
};
