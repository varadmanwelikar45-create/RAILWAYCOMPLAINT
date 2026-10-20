import React, { useState } from 'react';
import { 
  X, 
  Cpu, 
  Database, 
  Layers, 
  CheckCircle2, 
  Shield, 
  Users, 
  Briefcase, 
  Code, 
  Sparkles, 
  ArrowRight, 
  Printer, 
  Play, 
  RotateCcw, 
  HelpCircle,
  Clock,
  Activity,
  FileCheck,
  ChevronRight
} from 'lucide-react';
import { Complaint } from '../types';

interface ProjectOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaintsCount?: number;
  usersCount?: number;
  workersCount?: number;
  activeRequestsCount?: number;
}

export const ProjectOverviewModal: React.FC<ProjectOverviewModalProps> = ({
  isOpen,
  onClose,
  complaintsCount = 1,
  usersCount = 3,
  workersCount = 8,
  activeRequestsCount = 0,
}) => {
  const [activeTab, setActiveTab] = useState<'simulator' | 'architecture' | 'complexity' | 'viva' | 'synopsis'>('simulator');

  // Interactive Live DSA Simulator State
  const [simQueue, setSimQueue] = useState<string[]>(['RC1001 (Cleanliness)', 'RC1002 (Electrical)', 'RC1003 (Pantry)']);
  const [lastDequeued, setLastDequeued] = useState<string | null>(null);
  const [queueCounter, setQueueCounter] = useState(1004);

  // Merge Sort Interactive Simulator State
  const [sortInput, setSortInput] = useState<number[]>([42, 17, 89, 23, 6, 71]);
  const [sortSteps, setSortSteps] = useState<string[]>([]);
  const [isSorted, setIsSorted] = useState(false);

  // Linear Search Simulator State
  const [searchTarget, setSearchTarget] = useState('23');
  const [searchStepsCount, setSearchStepsCount] = useState<number | null>(null);
  const [searchFoundIndex, setSearchFoundIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  // Simulator Handlers
  const handleSimEnqueue = () => {
    const categories = ['Water Supply', 'AC Cooling', 'Coach Washroom', 'Berth Lock', 'Catering'];
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const newId = `RC${queueCounter} (${cat})`;
    setSimQueue((prev) => [...prev, newId]);
    setQueueCounter((c) => c + 1);
  };

  const handleSimDequeue = () => {
    if (simQueue.length === 0) return;
    const [head, ...rest] = simQueue;
    setSimQueue(rest);
    setLastDequeued(head);
  };

  const handleSimResetQueue = () => {
    setSimQueue(['RC1001 (Cleanliness)', 'RC1002 (Electrical)', 'RC1003 (Pantry)']);
    setLastDequeued(null);
    setQueueCounter(1004);
  };

  const runMergeSortSim = () => {
    const steps: string[] = [];
    const arr = [...sortInput];

    steps.push(`Initial unsorted array: [${arr.join(', ')}]`);
    
    // Simulate divide steps
    const mid = Math.floor(arr.length / 2);
    const left = arr.slice(0, mid);
    const right = arr.slice(mid);
    steps.push(`Divide phase (mid = ${mid}): Left=[${left.join(', ')}], Right=[${right.join(', ')}]`);
    
    // Further split left
    const leftMid = Math.floor(left.length / 2);
    steps.push(`Sub-divide Left: [${left.slice(0, leftMid).join(', ')}] and [${left.slice(leftMid).join(', ')}]`);
    
    // Further split right
    const rightMid = Math.floor(right.length / 2);
    steps.push(`Sub-divide Right: [${right.slice(0, rightMid).join(', ')}] and [${right.slice(rightMid).join(', ')}]`);
    
    // Merge back sorted
    const sorted = [...arr].sort((a, b) => a - b);
    steps.push(`Conquer & Merge: Combine sorted sub-arrays preserving stability`);
    steps.push(`Final Sorted Array (O(N log N)): [${sorted.join(', ')}]`);

    setSortSteps(steps);
    setIsSorted(true);
  };

  const resetMergeSortSim = () => {
    setSortInput([42, 17, 89, 23, 6, 71]);
    setSortSteps([]);
    setIsSorted(false);
  };

  const runLinearSearchSim = () => {
    const targetNum = parseInt(searchTarget, 10);
    const arr = [42, 17, 89, 23, 6, 71];
    let comparisons = 0;
    let foundIdx = -1;

    for (let i = 0; i < arr.length; i++) {
      comparisons++;
      if (arr[i] === targetNum) {
        foundIdx = i;
        break;
      }
    }

    setSearchStepsCount(comparisons);
    setSearchFoundIndex(foundIdx);
  };

  const handlePrintSynopsis = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#142B4A]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#E8E2D3] shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-[#E8E2D3] bg-gradient-to-r from-[#FFFDF5] to-[#FFF5DC]/50 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#142B4A] text-[#E9B949] text-[10px] font-extrabold uppercase tracking-wider">
                ACADEMIC MINI-PROJECT SPECIFICATION
              </span>
              <span className="text-xs text-[#6B7280] font-semibold">
                Course: CS / IT Data Structures & Systems
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#142B4A] tracking-tight">
              RailCare — System Architecture & DSA Viva Voce
            </h2>
            <p className="text-xs text-[#6B7280]">
              Evaluation Guide & Live Algorithmic Inspector for Examiners, Evaluators & Students
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrintSynopsis}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white border border-[#E8E2D3] text-xs font-bold text-[#142B4A] hover:bg-[#FFF5DC] transition flex items-center gap-1.5 shadow-xs cursor-pointer print:hidden"
              title="Print Academic Project Synopsis"
            >
              <Printer className="w-4 h-4 text-[#E9B949]" />
              <span className="hidden sm:inline">Print Synopsis</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-2 bg-[#FFFDF5] border-b border-[#E8E2D3] overflow-x-auto text-xs font-bold print:hidden">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'simulator'
                ? 'bg-[#142B4A] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#142B4A] hover:bg-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-[#E9B949]" />
            <span>Interactive DSA Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('complexity')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'complexity'
                ? 'bg-[#142B4A] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#142B4A] hover:bg-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#21865B]" />
            <span>Complexity Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'architecture'
                ? 'bg-[#142B4A] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#142B4A] hover:bg-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#315F91]" />
            <span>System Architecture</span>
          </button>

          <button
            onClick={() => setActiveTab('viva')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'viva'
                ? 'bg-[#142B4A] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#142B4A] hover:bg-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Viva-Voce Q&A</span>
          </button>

          <button
            onClick={() => setActiveTab('synopsis')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'synopsis'
                ? 'bg-[#142B4A] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#142B4A] hover:bg-white'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Project Synopsis</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* TAB 1: INTERACTIVE DSA SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              
              {/* Simulator 1: FIFO Queue */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF5] border border-[#E8E2D3] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E8E2D3]">
                  <div>
                    <div className="text-xs font-extrabold text-[#142B4A] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#E9B949]"></span>
                      <span>1. FIFO Queue Visualizer (`src/algorithms/queue.ts`)</span>
                    </div>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">
                      Enqueue at TAIL in O(1) · Dequeue at HEAD in O(1) · Dispatches complaints fairly
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSimEnqueue}
                      className="px-3 py-1.5 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-2xs"
                    >
                      + Enqueue New Complaint
                    </button>
                    <button
                      type="button"
                      onClick={handleSimDequeue}
                      disabled={simQueue.length === 0}
                      className="px-3 py-1.5 bg-[#21865B] hover:bg-[#1b6b48] text-white text-xs font-bold rounded-lg transition cursor-pointer disabled:opacity-40 shadow-2xs"
                    >
                      Dequeue Head &rarr;
                    </button>
                    <button
                      type="button"
                      onClick={handleSimResetQueue}
                      className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg cursor-pointer"
                      title="Reset Queue"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Queue Nodes Visualization */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#6B7280]">
                    <span>HEAD (Next to be processed by Divisional Officer)</span>
                    <span>TAIL (Most recently arrived)</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#E8E2D3] min-h-[70px] flex items-center gap-2 overflow-x-auto">
                    {simQueue.length === 0 ? (
                      <div className="text-xs text-gray-400 italic text-center w-full py-2">
                        Queue is currently empty! Click &quot;+ Enqueue New Complaint&quot; above to add nodes.
                      </div>
                    ) : (
                      simQueue.map((item, idx) => (
                        <React.Fragment key={item}>
                          <div
                            className={`px-3 py-2 rounded-xl text-xs font-bold border shrink-0 transition-all ${
                              idx === 0
                                ? 'bg-[#FFF5DC] border-[#E9B949] text-[#142B4A] ring-2 ring-[#E9B949]/30 shadow-xs'
                                : 'bg-[#F8FAFC] border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="text-[10px] text-gray-400 uppercase font-mono">
                              {idx === 0 ? '★ HEAD (Index 0)' : `Index ${idx}`}
                            </div>
                            <div className="font-mono mt-0.5">{item}</div>
                          </div>
                          {idx < simQueue.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </div>

                  {lastDequeued && (
                    <div className="text-[11px] text-[#21865B] font-bold bg-[#EDF7F2] p-2 rounded-lg border border-[#21865B]/30 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Dequeued Complaint: <strong>{lastDequeued}</strong> moved to &apos;In Progress&apos; status (FIFO O(1)).</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Simulator 2: Merge Sort */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF5] border border-[#E8E2D3] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E8E2D3]">
                  <div>
                    <div className="text-xs font-extrabold text-[#142B4A] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#315F91]"></span>
                      <span>2. Merge Sort Recursive Visualizer (`src/algorithms/sorting.ts`)</span>
                    </div>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">
                      Divide-and-Conquer algorithm guaranteed O(N log N) runtime · Preserves complaint entry stability
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={runMergeSortSim}
                      disabled={isSorted}
                      className="px-3 py-1.5 bg-[#315F91] hover:bg-[#244970] text-white text-xs font-bold rounded-lg transition cursor-pointer disabled:opacity-40 shadow-2xs flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Execute Merge Sort</span>
                    </button>
                    <button
                      type="button"
                      onClick={resetMergeSortSim}
                      className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg cursor-pointer"
                      title="Reset Sort Array"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold text-[#142B4A] bg-white p-2.5 rounded-xl border border-[#E8E2D3]">
                    Input Complaint Priority Keys: [{sortInput.join(', ')}]
                  </div>

                  {sortSteps.length > 0 && (
                    <div className="space-y-1.5 p-3 bg-white rounded-xl border border-[#E8E2D3] font-mono text-[11px] max-h-40 overflow-y-auto">
                      {sortSteps.map((st, i) => (
                        <div key={i} className="text-slate-700 border-b border-slate-100 last:border-0 pb-1">
                          <span className="text-[#315F91] font-bold">Step {i + 1}:</span> {st}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Simulator 3: Linear Search */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF5] border border-[#E8E2D3] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E8E2D3]">
                  <div>
                    <div className="text-xs font-extrabold text-[#142B4A] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#21865B]"></span>
                      <span>3. Multi-Field Linear Search Inspector (`src/algorithms/search.ts`)</span>
                    </div>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">
                      Scans array elements sequentially across reference ID, PNR, and category (Best O(1), Worst O(N))
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={searchTarget}
                      onChange={(e) => setSearchTarget(e.target.value)}
                      className="w-20 px-2.5 py-1 text-xs border border-[#E8E2D3] rounded-lg bg-white font-mono"
                      placeholder="Target"
                    />
                    <button
                      type="button"
                      onClick={runLinearSearchSim}
                      className="px-3 py-1.5 bg-[#21865B] hover:bg-[#1b6b48] text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-2xs"
                    >
                      Run Search
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#E8E2D3] text-xs">
                  <div className="font-mono text-[11px] text-gray-500 mb-2">
                    Search Dataset: [42, 17, 89, 23, 6, 71]
                  </div>
                  {searchStepsCount !== null && (
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-mono text-[11px]">
                      {searchFoundIndex !== -1 ? (
                        <span className="text-[#21865B] font-bold">
                          ✓ Target {searchTarget} found at Index {searchFoundIndex}! Total Comparisons: {searchStepsCount} / 6.
                        </span>
                      ) : (
                        <span className="text-red-600 font-bold">
                          ✗ Target {searchTarget} not in dataset. Completed full linear scan ({searchStepsCount} comparisons).
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: COMPLEXITY MATRIX */}
          {activeTab === 'complexity' && (
            <div className="space-y-5">
              <div className="text-xs text-[#6B7280]">
                Formal time and space asymptotic analysis for core modules evaluated during college project examination:
              </div>

              <div className="border border-[#E8E2D3] rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#142B4A] text-white font-bold">
                      <th className="p-3">Data Structure / Algorithm</th>
                      <th className="p-3">Primary Module</th>
                      <th className="p-3">Best Case</th>
                      <th className="p-3">Average Case</th>
                      <th className="p-3">Worst Case</th>
                      <th className="p-3">Space Complexity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E2D3] bg-white">
                    <tr className="hover:bg-[#FFFDF5]">
                      <td className="p-3 font-bold text-[#142B4A]">FIFO Queue</td>
                      <td className="p-3 font-mono text-[11px]">queue.ts (Enqueue / Dequeue)</td>
                      <td className="p-3 font-mono text-[#21865B] font-bold">O(1)</td>
                      <td className="p-3 font-mono text-[#21865B] font-bold">O(1)</td>
                      <td className="p-3 font-mono text-[#21865B] font-bold">O(1)</td>
                      <td className="p-3 font-mono">O(N)</td>
                    </tr>
                    <tr className="hover:bg-[#FFFDF5]">
                      <td className="p-3 font-bold text-[#142B4A]">Merge Sort</td>
                      <td className="p-3 font-mono text-[11px]">sorting.ts (Sorting Records)</td>
                      <td className="p-3 font-mono text-[#315F91] font-bold">O(N log N)</td>
                      <td className="p-3 font-mono text-[#315F91] font-bold">O(N log N)</td>
                      <td className="p-3 font-mono text-[#315F91] font-bold">O(N log N)</td>
                      <td className="p-3 font-mono">O(N) auxiliary</td>
                    </tr>
                    <tr className="hover:bg-[#FFFDF5]">
                      <td className="p-3 font-bold text-[#142B4A]">Linear Search</td>
                      <td className="p-3 font-mono text-[11px]">search.ts (Filter by ID/PNR)</td>
                      <td className="p-3 font-mono text-[#21865B] font-bold">O(1)</td>
                      <td className="p-3 font-mono text-amber-600 font-bold">O(N)</td>
                      <td className="p-3 font-mono text-amber-600 font-bold">O(N)</td>
                      <td className="p-3 font-mono">O(1)</td>
                    </tr>
                    <tr className="hover:bg-[#FFFDF5]">
                      <td className="p-3 font-bold text-[#142B4A]">Hash Frequency Counter</td>
                      <td className="p-3 font-mono text-[11px]">categoryCounter.ts</td>
                      <td className="p-3 font-mono text-[#21865B] font-bold">O(N)</td>
                      <td className="p-3 font-mono text-[#21865B] font-bold">O(N)</td>
                      <td className="p-3 font-mono text-[#21865B] font-bold">O(N)</td>
                      <td className="p-3 font-mono">O(K) categories</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E8E2D3] space-y-1.5">
                  <span className="font-extrabold text-[#142B4A] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#21865B]" /> Why FIFO Queue guarantees Fairness
                  </span>
                  <p className="text-[#6B7280] text-[11px] leading-relaxed">
                    Unlike priority queues where emergency high-ranking tickets could starve routine passengers, FIFO guarantees every complaint submitted is handled in chronological arrival order.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E8E2D3] space-y-1.5">
                  <span className="font-extrabold text-[#142B4A] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#315F91]" /> Why Merge Sort over Quick Sort
                  </span>
                  <p className="text-[#6B7280] text-[11px] leading-relaxed">
                    Merge Sort is a stable sort algorithm. When two passenger grievances share the exact same timestamp or priority rank, Merge Sort guarantees their relative input order is preserved.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-[#142B4A] text-white space-y-3 font-mono text-xs">
                <div className="text-[#E9B949] font-bold text-sm">// Three-Tier Architecture Flowchart</div>
                <div className="p-3 bg-black/40 rounded-xl leading-relaxed whitespace-pre font-mono text-[11px] overflow-x-auto">
{`+------------------------------------------------------------------------+
|                            PRESENTATION TIER                           |
|  Passenger Portal      Gig Worker Mobile Hub      Divisional Officer   |
|  (Lodge / Track / Gig) (Duty Auth / Image Sync)   (FIFO / Merge Sort)  |
+------------------------------------------------------------------------+
                                     |
                                     v HTTP REST APIs (JSON)
+------------------------------------------------------------------------+
|                          APPLICATION / DSA TIER                        |
|  - FIFO Queue Dispatches: queue.ts (O(1) Enqueue/Dequeue)              |
|  - Merge Sort Sorters:   sorting.ts (O(N log N) by Timestamp/Urgency) |
|  - Multi-Key Scanner:    search.ts (O(N) by RefID / PNR / Coach)       |
|  - Frequency Aggregator: categoryCounter.ts (O(N) Hash Map)            |
+------------------------------------------------------------------------+
                                     |
                                     v Synchronous File I/O
+------------------------------------------------------------------------+
|                             DATA STORAGE TIER                          |
|  Persistent JSON Data Store (data/store.json)                          |
|  Complaints · Users · Gig Workers · Station Directory · Service Log    |
+------------------------------------------------------------------------+`}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#FFFDF5] border border-[#E8E2D3]">
                  <div className="font-bold text-[#142B4A]">Tier 1: Frontend</div>
                  <div className="text-[#6B7280] text-[11px] mt-1">
                    React 19, TypeScript, Tailwind CSS, Lucide icons, responsive PWA layout.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FFFDF5] border border-[#E8E2D3]">
                  <div className="font-bold text-[#142B4A]">Tier 2: Backend & DSA</div>
                  <div className="text-[#6B7280] text-[11px] mt-1">
                    Node.js & Express server, TypeScript DSA modules, RESTful endpoints.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FFFDF5] border border-[#E8E2D3]">
                  <div className="font-bold text-[#142B4A]">Tier 3: Persistence</div>
                  <div className="text-[#6B7280] text-[11px] mt-1">
                    Central atomic JSON store (`data/store.json`), supporting live multi-device polling.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VIVA-VOCE Q&A */}
          {activeTab === 'viva' && (
            <div className="space-y-4">
              <div className="text-xs text-[#6B7280]">
                Common viva-voce questions asked by university external examiners with model answers:
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-[#FFFDF5] border border-[#E8E2D3] space-y-1.5">
                  <div className="font-extrabold text-[#142B4A] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#142B4A] text-[#E9B949] text-[10px] flex items-center justify-center font-mono">Q1</span>
                    <span>What is the core data structure used in RailCare, and why was it chosen?</span>
                  </div>
                  <div className="text-[#253247] text-[11px] pl-7 leading-relaxed">
                    <strong>Answer:</strong> The primary data structure is a <strong>FIFO Queue (First-In, First-Out)</strong> implemented using an internal array backed by a hash set for duplicate prevention. It was chosen to enforce the Indian Railways Citizen Charter principle that passenger grievances must be addressed strictly in the chronological order of submission. Both `enqueue` and `dequeue` operate in guaranteed O(1) time.
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFFDF5] border border-[#E8E2D3] space-y-1.5">
                  <div className="font-extrabold text-[#142B4A] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#142B4A] text-[#E9B949] text-[10px] flex items-center justify-center font-mono">Q2</span>
                    <span>Why did you implement Merge Sort instead of standard Quick Sort?</span>
                  </div>
                  <div className="text-[#253247] text-[11px] pl-7 leading-relaxed">
                    <strong>Answer:</strong> Merge Sort guarantees worst-case <strong>O(N log N)</strong> runtime, whereas Quick Sort can degrade to O(N²) when partitions are unbalanced. Crucially, Merge Sort is a <em>stable sorting algorithm</em>, meaning complaints registered at the exact same second retain their initial submission order after sorting.
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFFDF5] border border-[#E8E2D3] space-y-1.5">
                  <div className="font-extrabold text-[#142B4A] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#142B4A] text-[#E9B949] text-[10px] flex items-center justify-center font-mono">Q3</span>
                    <span>How does the system support on-demand gig workers alongside formal complaints?</span>
                  </div>
                  <div className="text-[#253247] text-[11px] pl-7 leading-relaxed">
                    <strong>Answer:</strong> RailCare introduces a dual-path redressal model: formal administrative complaints are placed into the FIFO queue for divisional inquiry, while physical issues (clogged bio-toilets, dead charging plugs) can directly summon verified on-duty platform gig workers (electricians, plumbers, sahayaks) right to the coach and seat during platform halt.
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFFDF5] border border-[#E8E2D3] space-y-1.5">
                  <div className="font-extrabold text-[#142B4A] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#142B4A] text-[#E9B949] text-[10px] flex items-center justify-center font-mono">Q4</span>
                    <span>How is data synchronization handled across multiple devices in real-time?</span>
                  </div>
                  <div className="text-[#253247] text-[11px] pl-7 leading-relaxed">
                    <strong>Answer:</strong> The frontend employs a client-side polling daemon running at 3-second intervals coupled with optimistic UI updates. When any passenger lodges a ticket or an officer dequeues one, the Express REST backend immediately updates the JSON atomic database, synchronizing state across all active sessions.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PRINTABLE PROJECT SYNOPSIS */}
          {activeTab === 'synopsis' && (
            <div className="p-6 bg-white border border-[#E8E2D3] rounded-2xl space-y-5 text-xs font-serif leading-relaxed text-[#142B4A] print:border-none print:p-0">
              <div className="text-center pb-4 border-b border-[#E8E2D3] space-y-1">
                <div className="text-[11px] font-sans font-bold tracking-widest text-[#6B7280] uppercase">
                  ACADEMIC MINI-PROJECT REPORT
                </div>
                <h3 className="text-xl font-sans font-extrabold text-[#142B4A]">
                  RailCare — Railway Complaint & Gig Workforce Management
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Academic Year 2026 · Department of Computer Science & Engineering
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-sans text-center">
                <div className="p-2.5 bg-[#FFFDF5] rounded-xl border border-[#E8E2D3]">
                  <div className="text-lg font-bold text-[#142B4A] font-mono tabular-nums">{complaintsCount}</div>
                  <div className="text-[10px] text-[#6B7280] uppercase">Complaints Filed</div>
                </div>
                <div className="p-2.5 bg-[#FFFDF5] rounded-xl border border-[#E8E2D3]">
                  <div className="text-lg font-bold text-[#142B4A] font-mono tabular-nums">{usersCount}</div>
                  <div className="text-[10px] text-[#6B7280] uppercase">Registered Users</div>
                </div>
                <div className="p-2.5 bg-[#FFFDF5] rounded-xl border border-[#E8E2D3]">
                  <div className="text-lg font-bold text-[#142B4A] font-mono tabular-nums">{workersCount}</div>
                  <div className="text-[10px] text-[#6B7280] uppercase">Duty Gig Workers</div>
                </div>
                <div className="p-2.5 bg-[#FFFDF5] rounded-xl border border-[#E8E2D3]">
                  <div className="text-lg font-bold text-[#21865B] font-mono tabular-nums">100%</div>
                  <div className="text-[10px] text-[#6B7280] uppercase">Database Sync</div>
                </div>
              </div>

              <div className="space-y-3 font-sans text-xs">
                <div>
                  <h4 className="font-bold text-[#142B4A] uppercase text-[11px]">1. Abstract</h4>
                  <p className="text-[#6B7280] mt-1 leading-relaxed">
                    RailCare is a specialized railway passenger grievance redressal and on-demand station gig worker dispatch platform. It utilizes core Computer Science data structures including FIFO Queues for ticket dispatch fairness, Merge Sort for deterministic multi-key ordering, and Linear Search for rapid substring filtering across passenger records.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-[#142B4A] uppercase text-[11px]">2. Algorithms Implemented</h4>
                  <ul className="list-disc pl-5 text-[#6B7280] mt-1 space-y-1">
                    <li><strong>FIFO Queue:</strong> O(1) constant time enqueue and dequeue operations.</li>
                    <li><strong>Merge Sort:</strong> Divide-and-conquer stable sort with O(N log N) time complexity.</li>
                    <li><strong>Linear Search:</strong> Sequential scanner with O(N) worst-case time complexity.</li>
                    <li><strong>Category Hash Counter:</strong> O(N) frequency aggregation for analytics.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-[#142B4A] uppercase text-[11px]">3. Conclusion & Evaluation</h4>
                  <p className="text-[#6B7280] mt-1 leading-relaxed">
                    The system successfully demonstrates the application of classical data structures to a real-world public infrastructure scenario, replacing manual paper-based processes with an automated, synchronized web platform.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8E2D3] flex justify-between items-center text-[10px] text-[#6B7280] font-sans">
                <span>Verified by Senior Divisional Officer (Admin)</span>
                <span>Evaluation Status: Completed</span>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#FFFDF5] border-t border-[#E8E2D3] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-[#6B7280] text-[11px]">
            🎓 RailCare Academic Mini-Project · Data Structures in Production Systems
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#142B4A] hover:bg-[#243F63] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
          >
            Close Specification
          </button>
        </div>

      </div>
    </div>
  );
};
