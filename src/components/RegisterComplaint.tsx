import React, { useState, useRef, useEffect } from 'react';
import { Complaint, ComplaintCategory, User, ViewMode, AIComplaintAnalysis } from '../types';
import { ALLOWED_CATEGORIES } from '../data/mockData';
import { 
  ArrowLeft, 
  Send, 
  AlertCircle, 
  Sparkles, 
  Check, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Train, 
  Calendar, 
  Tag, 
  MapPin, 
  Hash,
  Mic,
  MicOff,
  Image as ImageIcon,
  Camera,
  UploadCloud,
  Volume2,
  Bot,
  Wand2,
  Trash2,
  ShieldCheck,
  Zap,
  Flame
} from 'lucide-react';

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
  const [severity, setSeverity] = useState<'Urgent' | 'High' | 'Medium' | 'Low'>('Medium');
  const [error, setError] = useState<string | null>(null);
  const [presetNotice, setPresetNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // AI Multimodal Evidence States (Image + Voice)
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [imageFileName, setImageFileName] = useState<string | null>(null);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceAudioBase64, setVoiceAudioBase64] = useState<string | null>(null);
  const [voiceMimeType, setVoiceMimeType] = useState<string>('audio/webm');
  const [voiceAudioUrl, setVoiceAudioUrl] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>('');

  // AI Analysis states
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIComplaintAnalysis | null>(null);
  const [aiSuccessBadge, setAiSuccessBadge] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const speechRecognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch (e) {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try { mediaRecorderRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  // Handle Photo File Upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    setImageFileName(file.name);
    setImageMimeType(file.type || 'image/jpeg');

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setUploadedImageBase64(result);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setUploadedImageBase64(null);
    setImageFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle Voice Recording
  const startVoiceRecording = async () => {
    setError(null);
    audioChunksRef.current = [];
    setRecordingSeconds(0);
    setLiveTranscript('');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Voice microphone access is not supported by your browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/ogg';
      setVoiceMimeType(mime);

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mime });
        const audioUrl = URL.createObjectURL(audioBlob);
        setVoiceAudioUrl(audioUrl);

        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          setVoiceAudioBase64(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      // Web Speech API for immediate live transcription preview
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-IN';

          recognition.onresult = (event: any) => {
            let current = '';
            for (let i = 0; i < event.results.length; i++) {
              current += event.results[i][0].transcript;
            }
            setLiveTranscript(current);
          };

          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch (e) {
          // Fall back gracefully to audio transmission only
        }
      }
    } catch (err: any) {
      console.error('Microphone error:', err);
      setError('Could not access microphone. Please grant permission or type your grievance.');
      setIsRecording(false);
    }
  };

  const stopVoiceRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleRemoveVoice = () => {
    setVoiceAudioBase64(null);
    setVoiceAudioUrl(null);
    setLiveTranscript('');
    setRecordingSeconds(0);
  };

  // Multimodal Gemini AI Analysis
  const handleAnalyzeWithAI = async () => {
    if (!uploadedImageBase64 && !voiceAudioBase64 && !liveTranscript && !description) {
      setError('Please upload a photo, record a voice complaint, or type brief notes first for the AI to analyze.');
      return;
    }

    setError(null);
    setIsAnalyzingAI(true);
    setAiSuccessBadge(null);

    try {
      const res = await fetch('/api/analyze-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: uploadedImageBase64,
          mimeType: imageMimeType,
          voiceBase64: voiceAudioBase64,
          voiceMimeType: voiceMimeType,
          voiceText: liveTranscript,
          notes: description || subject,
        }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        const result: AIComplaintAnalysis = data.analysis;
        setAiAnalysis(result);

        // Autofill the form fields
        if (result.category && ALLOWED_CATEGORIES.includes(result.category)) {
          setCategory(result.category);
        }
        if (result.subject) {
          setSubject(result.subject);
        }
        if (result.description) {
          setDescription(result.description);
        }
        if (result.severity) {
          setSeverity(result.severity);
        }
        if (result.locationHint && !location) {
          setLocation(result.locationHint);
        }

        setAiSuccessBadge(
          `AI Analysis Complete: Classified as "${result.category}" · Recommended Specialist: ${result.recommendedRole}`
        );
      } else {
        setError(data.message || 'AI analysis could not complete. You can still fill the details manually.');
      }
    } catch (err: any) {
      console.error('AI analysis error:', err);
      setError('AI service temporarily unreachable. You can continue filling details manually.');
    } finally {
      setIsAnalyzingAI(false);
    }
  };

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
          imageUrl: uploadedImageBase64 || undefined,
          voiceUrl: voiceAudioUrl || undefined,
          severity,
          aiAnalysis: aiAnalysis || undefined,
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

          {/* AI SMART ASSISTANT: MULTIMODAL IMAGE & VOICE COMPLAINT */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#F0FBF7] via-[#F8FAFB] to-[#F0FAFD] border-2 border-[#65D6B0]/60 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DDE4E6] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#202A2B] text-[#65D6B0] flex items-center justify-center shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-[#202A2B]">AI Smart Grievance Assistant</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#65D6B0]/20 text-[#1E6B52] border border-[#65D6B0]/40 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-[#1E6B52]" /> Gemini Vision &amp; Voice
                    </span>
                  </div>
                  <p className="text-[11px] text-[#526365]">
                    Upload an incident photo or speak your grievance. Railway AI will analyze the evidence and auto-fill the complaint.
                  </p>
                </div>
              </div>

              {/* AI Trigger Button */}
              <button
                type="button"
                onClick={handleAnalyzeWithAI}
                disabled={isAnalyzingAI || (!uploadedImageBase64 && !voiceAudioBase64 && !description)}
                className={`px-4 py-2 bg-[#202A2B] hover:bg-[#202A2B]/90 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-xs border border-[#202A2B] shrink-0 ${
                  isAnalyzingAI || (!uploadedImageBase64 && !voiceAudioBase64 && !description)
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:scale-[1.02]'
                }`}
              >
                {isAnalyzingAI ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#65D6B0]" />
                    <span>Analyzing with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5 text-[#65D6B0]" />
                    <span>Auto-Fill with AI</span>
                  </>
                )}
              </button>
            </div>

            {/* Evidence Inputs Grid: Image Upload & Voice Recorder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Box 1: Image Upload */}
              <div className="p-4 bg-white rounded-xl border border-[#DDE4E6] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#202A2B] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#007D99]" />
                    Incident Photo Evidence
                  </span>
                  <span className="text-[10px] text-[#526365]">PNG, JPG, WebP</span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="hidden"
                  id="incident-photo-upload"
                />

                {uploadedImageBase64 ? (
                  <div className="relative rounded-xl overflow-hidden border border-[#DDE4E6] bg-[#F8FAFB]">
                    <img
                      src={uploadedImageBase64}
                      alt="Incident Evidence"
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-[#202A2B]/80 text-white p-2 text-[10px] flex items-center justify-between backdrop-blur-xs">
                      <span className="truncate max-w-[180px] font-medium">{imageFileName || 'Uploaded Photo'}</span>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-red-300 hover:text-red-100 p-1 cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-6 border-2 border-dashed border-[#DDE4E6] hover:border-[#007D99] rounded-xl flex flex-col items-center justify-center gap-1.5 transition text-center hover:bg-[#F8FAFB] cursor-pointer"
                  >
                    <UploadCloud className="w-6 h-6 text-[#7E9092]" />
                    <span className="text-xs font-bold text-[#202A2B]">Upload or Snap Photo</span>
                    <span className="text-[10px] text-[#526365]">Unclean coach, leaking tap, broken AC, food</span>
                  </button>
                )}
              </div>

              {/* Box 2: Voice Complaint Recorder */}
              <div className="p-4 bg-white rounded-xl border border-[#DDE4E6] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#202A2B] flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-[#B94A3A]" />
                    Voice Complaint Note
                  </span>
                  {isRecording && (
                    <span className="flex items-center gap-1 text-[10px] font-black text-red-600 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-red-600" />
                      REC 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}s
                    </span>
                  )}
                </div>

                {isRecording ? (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-red-600 text-white flex items-center justify-center animate-pulse shadow-md">
                      <Mic className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-red-900">
                      Listening... Speak your complaint clearly
                    </p>
                    {liveTranscript && (
                      <p className="text-[11px] text-[#526365] italic max-h-12 overflow-y-auto bg-white p-2 rounded-lg border border-red-200">
                        "{liveTranscript}"
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={stopVoiceRecording}
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                    >
                      <MicOff className="w-3.5 h-3.5" />
                      <span>Stop &amp; Save Recording</span>
                    </button>
                  </div>
                ) : voiceAudioUrl ? (
                  <div className="space-y-2 p-2 rounded-xl bg-[#F8FAFB] border border-[#DDE4E6]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#202A2B] flex items-center gap-1">
                        <Volume2 className="w-3.5 h-3.5 text-[#1E6B52]" /> Voice Note Recorded
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveVoice}
                        className="text-red-500 hover:text-red-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                    <audio src={voiceAudioUrl} controls className="w-full h-8" />
                    {liveTranscript && (
                      <p className="text-[10px] text-[#526365] bg-white p-1.5 rounded border border-[#DDE4E6] italic">
                        <strong>Transcript:</strong> "{liveTranscript}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-5 space-y-2">
                    <button
                      type="button"
                      onClick={startVoiceRecording}
                      className="w-12 h-12 mx-auto rounded-full bg-[#B94A3A] hover:bg-[#B94A3A]/90 text-white flex items-center justify-center transition shadow-xs hover:scale-105 cursor-pointer"
                      title="Start voice recording"
                    >
                      <Mic className="w-6 h-6" />
                    </button>
                    <div>
                      <span className="text-xs font-bold text-[#202A2B] block">Tap Mic to Record</span>
                      <span className="text-[10px] text-[#526365]">Explain issue in Hindi, English, or regional language</span>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* AI Analysis Result Showcase */}
            {aiAnalysis && (
              <div className="p-4 rounded-xl bg-white border border-[#65D6B0] space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DDE4E6] pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1E6B52]" />
                    <span className="text-xs font-black text-[#202A2B]">Gemini AI Analysis &amp; Routing Recommendation</span>
                  </div>
                  {aiAnalysis.confidence && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#DDF8EF] text-[#1E6B52] border border-[#65D6B0]/40">
                      Confidence: {aiAnalysis.confidence}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                  <div className="p-2 rounded-lg bg-[#F8FAFB] border border-[#DDE4E6]">
                    <span className="text-[10px] text-[#526365] block">Detected Category</span>
                    <strong className="text-[#202A2B] font-bold">{aiAnalysis.category}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#F8FAFB] border border-[#DDE4E6]">
                    <span className="text-[10px] text-[#526365] block">Assessed Severity</span>
                    <strong className={`font-bold ${
                      aiAnalysis.severity === 'Urgent' ? 'text-red-600' : aiAnalysis.severity === 'High' ? 'text-amber-600' : 'text-[#202A2B]'
                    }`}>
                      {aiAnalysis.severity}
                    </strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#DDF8EF] border border-[#65D6B0]/40">
                    <span className="text-[10px] text-[#1E6B52] block font-semibold">Recommended Specialist</span>
                    <strong className="text-[#1E6B52] font-black">{aiAnalysis.recommendedRole}</strong>
                  </div>
                </div>

                {Array.isArray(aiAnalysis.detectedIssues) && aiAnalysis.detectedIssues.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                    <span className="text-[#526365] font-semibold">Detected Issues:</span>
                    {aiAnalysis.detectedIssues.map((issue, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-[#FFFDF5] border border-[#FFD68A] text-[#915900] text-[10px] font-bold">
                        {issue}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-[11px] text-[#1E6B52] font-semibold pt-1">
                  ✓ Form fields below have been automatically populated! You can review or edit before submitting.
                </p>
              </div>
            )}
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
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="complaint-category" className="block text-xs font-bold text-[#202A2B]">
                  Grievance Category <span className="text-[#D72645]">*</span>
                </label>
                {aiAnalysis?.recommendedRole && (
                  <span className="text-[10px] font-bold text-[#1E6B52] bg-[#DDF8EF] px-1.5 py-0.5 rounded border border-[#65D6B0]/40">
                    Routing: {aiAnalysis.recommendedRole}
                  </span>
                )}
              </div>
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

          {/* Severity & Coach / Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="complaint-severity" className="block text-xs font-bold text-[#202A2B] mb-1.5">
                Priority / Severity Level
              </label>
              <select
                id="complaint-severity"
                disabled={submitting}
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DDE4E6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007D99] transition text-[#202A2B] disabled:opacity-60 font-semibold"
              >
                <option value="Urgent">🚨 Urgent - Safety / Medical / High Impact</option>
                <option value="High">⚡ High - AC Breakdown / Washroom Leak</option>
                <option value="Medium">⚖️ Medium - Standard Coach Defect</option>
                <option value="Low">ℹ️ Low - Minor Feedback / Suggestion</option>
              </select>
            </div>

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

