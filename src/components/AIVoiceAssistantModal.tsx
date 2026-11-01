import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowRight, 
  Bot, 
  ShieldCheck, 
  Radio, 
  Send,
  Train,
  Check,
  RefreshCw,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Complaint, ComplaintCategory, AIComplaintAnalysis, User } from '../types';

interface AIVoiceAssistantModalProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onSubmitGrievance: (
    newComplaint: Omit<Complaint, 'id' | 'complaintId' | 'createdAt' | 'updatedAt'>
  ) => Promise<Complaint> | Complaint;
  onComplaintCreated?: (complaint: Complaint) => void;
}

const VOICE_SCENARIOS = [
  {
    title: '💧 Washroom Leakage',
    spokenText: 'I am on train 12951 in coach B3 berth 24. The washroom flush is leaking water and spreading across the floor. Please send a plumber urgently.',
    train: '12951 / Mumbai Rajdhani',
    coach: 'Coach B3, Berth 24'
  },
  {
    title: '⚡ AC & Charging Socket',
    spokenText: 'I am in Coach C2 berth 18 on train 22436 Vande Bharat. The AC is not cooling and the mobile charging socket is not working.',
    train: '22436 / Vande Bharat',
    coach: 'Coach C2, Berth 18'
  },
  {
    title: '🍱 Food Quality Defect',
    spokenText: 'I am on train 12002 Bhopal Shatabdi in coach C4 seat 12. The dinner packet served by pantry was cold and unsealed.',
    train: '12002 / Bhopal Shatabdi',
    coach: 'Coach C4, Seat 12'
  },
  {
    title: '🧹 Coach Housekeeping',
    spokenText: 'I am in Coach S4 berth 52 on train 12259. There is food spilled near the door and the dustbin is overflowing. Need housekeeping sahayak.',
    train: '12259 / Sealdah Duronto',
    coach: 'Coach S4, Berth 52'
  }
];

export const AIVoiceAssistantModal: React.FC<AIVoiceAssistantModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSubmitGrievance,
  onComplaintCreated,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [trainInfo, setTrainInfo] = useState('12951 / Mumbai Rajdhani Express');
  const [coachBerth, setCoachBerth] = useState('Coach B3, Berth 24');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResponseText, setAiResponseText] = useState<string | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AIComplaintAnalysis | null>(null);
  const [createdComplaint, setCreatedComplaint] = useState<Complaint | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isSpeakingBack, setIsSpeakingBack] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isOpen) return null;

  // Speak AI response using Web Speech Synthesis
  const speakAIResponse = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeakingBack(true);
      utterance.onend = () => setIsSpeakingBack(false);
      utterance.onerror = () => setIsSpeakingBack(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      setIsSpeakingBack(false);
    }
  };

  // Start listening to voice input
  const handleStartListening = async () => {
    setErrorMessage(null);
    setSpeechTranscript('');
    setAiResponseText(null);
    setAiAnalysisResult(null);
    setCreatedComplaint(null);
    setRecordingSeconds(0);

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
          setSpeechTranscript(current);
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition warning:', e.error);
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsListening(true);

        timerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      } catch (err: any) {
        console.warn('Speech recognition start failed:', err);
        setErrorMessage('Microphone initialized in manual input mode.');
        setIsListening(true);
      }
    } else {
      setIsListening(true);
    }
  };

  // Stop listening and analyze
  const handleStopListeningAndProcess = async (textOverride?: string) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setIsListening(false);

    const spokenText = (textOverride || speechTranscript).trim();
    if (!spokenText) {
      setErrorMessage('No voice input detected. Please speak into your microphone or pick a quick scenario below.');
      return;
    }

    setAiAnalyzing(true);
    setErrorMessage(null);

    try {
      // 1. Analyze with Gemini API
      const res = await fetch('/api/analyze-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceText: spokenText,
          notes: `Train: ${trainInfo}, Coach/Berth: ${coachBerth}`,
        }),
      });

      const data = await res.json();
      const analysis: AIComplaintAnalysis = data.analysis || {
        category: 'Cleanliness',
        subject: 'Railway Coach Issue Reported via Voice',
        description: spokenText,
        severity: 'High',
        recommendedRole: 'Railway Coach Plumber & Sanitation Worker',
        locationHint: coachBerth,
        confidence: '95%',
      };

      setAiAnalysisResult(analysis);

      // AI Spoken Response
      const aiReply = `Grievance understood: ${analysis.subject}. I have classified this as ${analysis.severity} priority and immediately transmitted it to the Railway Divisional Officer Control Room for approval.`;
      setAiResponseText(aiReply);
      speakAIResponse(aiReply);

      // 2. Automatically register complaint to send to Officer Control Center!
      const railMadadRef = `RM-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const resolvedPriority =
        analysis.severity === 'Urgent'
          ? 'Emergency'
          : analysis.severity === 'High'
          ? 'High'
          : analysis.severity === 'Low'
          ? 'Low'
          : 'Medium';

      const complaintData: Omit<Complaint, 'id' | 'complaintId' | 'createdAt' | 'updatedAt'> = {
        userId: currentUser.id || 1,
        passengerName: currentUser.fullName || 'Passenger',
        passengerEmail: currentUser.email || 'passenger@railcare.gov.in',
        passengerMobile: currentUser.mobile || '9876543210',
        trainNumber: trainInfo,
        journeyDate: new Date().toISOString().slice(0, 10),
        category: (analysis.category as ComplaintCategory) || 'Cleanliness',
        subject: analysis.subject || 'Voice Registered Grievance',
        description: `${spokenText} (AI Classification: ${analysis.category} · Recommended: ${analysis.recommendedRole})`,
        location: coachBerth,
        status: 'Pending', // Pending Officer Control Approval & Worker Dispatch
        severity: analysis.severity || 'High',
        priority: resolvedPriority,
        railMadadRef,
        slaMinutesRemaining: 120,
        aiAnalysis: analysis,
      };

      const created = await Promise.resolve(onSubmitGrievance(complaintData));
      setCreatedComplaint(created);
      onComplaintCreated?.(created);
    } catch (err: any) {
      console.error('Error processing voice complaint:', err);
      setErrorMessage('Could not connect to Railway AI server. Please try again.');
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handlePickScenario = (scenario: typeof VOICE_SCENARIOS[0]) => {
    setSpeechTranscript(scenario.spokenText);
    setTrainInfo(scenario.train);
    setCoachBerth(scenario.coach);
    handleStopListeningAndProcess(scenario.spokenText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#DDE4E6] shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#DDF8EF] border border-[#65D6B0] flex items-center justify-center text-[#1E6B52] shadow-xs shrink-0">
            <Bot className="w-6 h-6 text-[#1E6B52]" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D7F7FC] text-[#007D99] text-[10px] font-black uppercase tracking-wider border border-[#00B8D9]/40">
              <Sparkles className="w-3 h-3 text-[#007D99]" />
              <span>AI Railway Sahayak Voice Conversation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#202A2B] tracking-tight">
              Speak Your Railway Grievance
            </h2>
          </div>
        </div>

        {/* 3-Step Coordination Flow Banner */}
        <div className="bg-[#F8FAFB] border border-[#DDE4E6] rounded-2xl p-3.5 text-xs">
          <span className="text-[10px] uppercase tracking-wider font-black text-[#526365] block mb-2">
            3-Panel Government Coordination Ecosystem:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            
            <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
              createdComplaint ? 'bg-[#DDF8EF] border-[#65D6B0]/60 text-[#1E6B52]' : 'bg-white border-[#DDE4E6] text-[#202A2B]'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-black text-[11px]">1. Passenger Voice</span>
                {createdComplaint ? <Check className="w-3.5 h-3.5 text-[#1E6B52]" /> : <Radio className="w-3.5 h-3.5 text-[#007D99]" />}
              </div>
              <p className="text-[10px] text-[#526365]">Passenger speaks to AI → AI analyzes issue</p>
            </div>

            <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
              createdComplaint ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse' : 'bg-white border-[#DDE4E6] text-[#526365]'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-black text-[11px]">2. Officer Control</span>
                <Clock className="w-3.5 h-3.5 text-amber-700" />
              </div>
              <p className="text-[10px] text-[#526365]">Officer reviews &amp; approves gig worker</p>
            </div>

            <div className="p-2.5 rounded-xl border bg-white border-[#DDE4E6] text-[#526365] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="font-black text-[11px]">3. Gig Worker</span>
                <Train className="w-3.5 h-3.5 text-[#526365]" />
              </div>
              <p className="text-[10px] text-[#526365]">Worker gets alert &amp; proceeds to coach</p>
            </div>

          </div>
        </div>

        {/* Live Speaking / Listening Interaction Section */}
        {!createdComplaint && (
          <div className="space-y-4">
            
            {/* Coach & Train Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-[#526365] block mb-1">Train Number / Name:</label>
                <input
                  type="text"
                  value={trainInfo}
                  onChange={(e) => setTrainInfo(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#DDE4E6] text-[#202A2B] font-bold focus:outline-none focus:border-[#65D6B0]"
                  placeholder="e.g. 12951 / Mumbai Rajdhani"
                />
              </div>

              <div>
                <label className="font-bold text-[#526365] block mb-1">Coach &amp; Berth Location:</label>
                <input
                  type="text"
                  value={coachBerth}
                  onChange={(e) => setCoachBerth(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#DDE4E6] text-[#202A2B] font-bold focus:outline-none focus:border-[#65D6B0]"
                  placeholder="e.g. Coach B3, Berth 24"
                />
              </div>
            </div>

            {/* Microphone Centerpiece */}
            <div className="bg-white border-2 border-dashed border-[#DDE4E6] rounded-3xl p-6 text-center space-y-4">
              
              <div className="relative inline-block">
                {isListening && (
                  <>
                    <span className="absolute -inset-3 rounded-full bg-[#65D6B0]/30 animate-ping pointer-events-none" />
                    <span className="absolute -inset-6 rounded-full bg-[#65D6B0]/15 animate-pulse pointer-events-none" />
                  </>
                )}

                <button
                  onClick={isListening ? () => handleStopListeningAndProcess() : handleStartListening}
                  disabled={aiAnalyzing}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer relative z-10 ${
                    isListening
                      ? 'bg-[#B94A3A] text-white ring-4 ring-[#B94A3A]/40'
                      : 'bg-[#202A2B] hover:bg-[#202A2B]/90 text-[#65D6B0]'
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-8 h-8 animate-pulse text-white" />
                  ) : (
                    <Mic className="w-8 h-8 text-[#65D6B0]" />
                  )}
                </button>
              </div>

              <div>
                <h4 className="text-sm font-black text-[#202A2B]">
                  {isListening ? `Listening... (${recordingSeconds}s) Speak your issue` : 'Click Microphone to Speak'}
                </h4>
                <p className="text-xs text-[#526365] mt-1 max-w-sm mx-auto">
                  {isListening
                    ? 'Say what is wrong (e.g. flush leaking, AC not cooling, meal stale). Click again when finished.'
                    : 'AI will transcribe your speech, classify the severity, and send it directly to the Officer Control Room.'}
                </p>
              </div>

              {/* Live Audio Transcript Display */}
              <div className="min-h-[50px] bg-[#F8FAFB] rounded-2xl p-3 border border-[#DDE4E6] text-xs text-left">
                <span className="text-[10px] uppercase font-bold text-[#7E9092] block mb-1">
                  Live Voice Transcript:
                </span>
                {speechTranscript ? (
                  <p className="text-[#202A2B] font-medium italic">"{speechTranscript}"</p>
                ) : (
                  <p className="text-slate-400 italic">Microphone idle. Click above or type below.</p>
                )}
              </div>

              {/* Text fallback input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={speechTranscript}
                  onChange={(e) => setSpeechTranscript(e.target.value)}
                  placeholder="Or type what you would say to AI..."
                  className="flex-1 px-3.5 py-2 bg-white rounded-xl border border-[#DDE4E6] text-xs text-[#202A2B] focus:outline-none focus:border-[#65D6B0]"
                />
                <button
                  onClick={() => handleStopListeningAndProcess()}
                  disabled={!speechTranscript.trim() || aiAnalyzing}
                  className="px-4 py-2 bg-[#202A2B] text-[#65D6B0] rounded-xl text-xs font-bold transition hover:bg-[#202A2B]/90 disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to AI</span>
                </button>
              </div>

            </div>

            {/* Quick Voice Scenarios */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#526365] block">
                Or pick a quick spoken scenario to test:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {VOICE_SCENARIOS.map((sc, i) => (
                  <button
                    key={i}
                    onClick={() => handlePickScenario(sc)}
                    disabled={aiAnalyzing}
                    className="p-2.5 bg-[#F8FAFB] hover:bg-[#DDF8EF]/50 border border-[#DDE4E6] hover:border-[#65D6B0] rounded-xl text-left transition cursor-pointer space-y-1 text-xs"
                  >
                    <div className="font-black text-[#202A2B]">{sc.title}</div>
                    <div className="text-[11px] text-[#526365] truncate">"{sc.spokenText}"</div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* AI Analyzing Spinner */}
        {aiAnalyzing && (
          <div className="bg-[#DDF8EF]/50 border border-[#65D6B0]/40 rounded-2xl p-6 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#1E6B52] animate-spin mx-auto" />
            <h4 className="text-sm font-black text-[#1E6B52]">AI Analyzing Spoken Grievance...</h4>
            <p className="text-xs text-[#526365]">
              Classifying railway service category, severity, and identifying required specialist for officer dispatch.
            </p>
          </div>
        )}

        {/* SUCCESS / ACTIVE STAGE DISPLAY */}
        {createdComplaint && (
          <div className="space-y-5">
            
            {/* Success Card */}
            <div className="bg-[#DDF8EF] border border-[#65D6B0] rounded-3xl p-6 text-center space-y-3 shadow-xs">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-[#65D6B0] text-[#1E6B52] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[#1E6B52]" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white text-[#1E6B52] text-[10px] font-black uppercase tracking-wider border border-[#65D6B0]">
                Sent to Railway Officer Control Center
              </div>

              <h3 className="text-xl font-black text-[#202A2B]">
                Grievance #{createdComplaint.complaintId} Transmitted!
              </h3>

              <p className="text-xs text-[#526365] max-w-md mx-auto">
                Your complaint has been successfully analyzed and sent to the <strong>Railway Divisional Officer Control Center</strong>. The Officer will now approve and dispatch an authorized gig worker to your coach.
              </p>
            </div>

            {/* AI Diagnosis Details */}
            {aiAnalysisResult && (
              <div className="bg-[#F8FAFB] border border-[#DDE4E6] rounded-2xl p-4 text-xs space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#DDE4E6]">
                  <span className="font-bold text-[#526365] uppercase tracking-wider text-[10px]">
                    AI Analysis Redressal Summary
                  </span>
                  <span className="font-bold text-[#007D99] bg-[#D7F7FC] px-2 py-0.5 rounded text-[10px]">
                    {aiAnalysisResult.confidence || '94% Confidence'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="font-black text-[#202A2B] text-sm">
                    {aiAnalysisResult.subject}
                  </div>
                  <div className="text-[#526365] leading-relaxed">
                    {aiAnalysisResult.description}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-[#DDE4E6] text-[11px]">
                  <div>
                    <span className="text-[#7E9092] block">Category:</span>
                    <strong className="text-[#202A2B]">{aiAnalysisResult.category}</strong>
                  </div>
                  <div>
                    <span className="text-[#7E9092] block">Priority:</span>
                    <strong className="text-[#B94A3A]">{aiAnalysisResult.severity}</strong>
                  </div>
                  <div>
                    <span className="text-[#7E9092] block">Target Specialist:</span>
                    <strong className="text-[#007D99]">{aiAnalysisResult.recommendedRole}</strong>
                  </div>
                </div>

                {/* AI Audio Response playback notice */}
                {aiResponseText && (
                  <div className="bg-white p-2.5 rounded-xl border border-[#DDE4E6] flex items-center justify-between gap-2 mt-2">
                    <div className="flex items-center gap-2 text-[#202A2B]">
                      <Volume2 className="w-4 h-4 text-[#007D99] shrink-0" />
                      <span className="italic text-[11px]">"{aiResponseText}"</span>
                    </div>
                    <button
                      onClick={() => speakAIResponse(aiResponseText)}
                      className="px-2 py-1 bg-[#F0F4F6] hover:bg-slate-200 text-[#202A2B] rounded text-[10px] font-bold shrink-0 cursor-pointer"
                    >
                      Replay
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Next Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="w-full sm:flex-1 py-3 bg-[#202A2B] hover:bg-[#202A2B]/90 text-white rounded-xl text-xs font-black shadow-xs transition cursor-pointer text-center"
              >
                Go to Dashboard &amp; Track Resolution
              </button>

              <button
                onClick={() => {
                  setCreatedComplaint(null);
                  setSpeechTranscript('');
                  setAiResponseText(null);
                  setAiAnalysisResult(null);
                }}
                className="w-full sm:w-auto px-4 py-3 border border-[#DDE4E6] hover:bg-slate-100 text-[#526365] rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Register Another Voice Complaint
              </button>
            </div>

          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 bg-[#FBE0E6] border border-[#D72645]/40 text-[#92182D] rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#D72645] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

      </div>
    </div>
  );
};
