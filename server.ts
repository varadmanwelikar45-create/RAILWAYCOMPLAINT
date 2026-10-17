import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface User {
  id: number;
  fullName: string;
  email: string;
  mobile: string;
  isAdmin: boolean;
}

interface Complaint {
  id: number;
  complaintId: string;
  userId: number;
  passengerName: string;
  passengerEmail: string;
  passengerMobile: string;
  trainNumber: string;
  pnrNumber?: string;
  journeyDate: string;
  category: string;
  subject: string;
  description: string;
  location?: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  createdAt: string;
  updatedAt: string;
}

interface RailwayStation {
  code: string;
  name: string;
  city: string;
  state: string;
}

interface Worker {
  id: number;
  workerId: string;
  fullName: string;
  email: string;
  mobile: string;
  headline?: string;
  bio?: string;
  skillCategory: string;
  skills?: string[];
  stationCode: string;
  stationCodes?: string[];
  stationName: string;
  city: string;
  experienceYears?: number;
  qualifications?: string;
  verificationDocuments?: string;
  verificationStatus: 'Pending Verification' | 'Verified' | 'Rejected' | 'Suspended';
  rejectionReason?: string;
  verificationDate?: string;
  verifiedBy?: string;
  availability: 'Available' | 'Busy' | 'Unavailable';
  activeJobId?: string | null;
  rating?: number;
  totalJobsCompleted: number;
  createdAt: string;
  updatedAt?: string;
}

interface WorkerServiceRequest {
  id: number;
  requestId: string;
  passengerId: number;
  passengerName: string;
  passengerEmail: string;
  passengerMobile: string;
  relatedComplaintId?: string;
  trainNumber: string;
  trainName?: string;
  coachNumber?: string;
  seatNumber?: string;
  stationCode: string;
  stationName: string;
  expectedArrivalTime?: string;
  serviceCategory: string;
  requestedSkill?: string;
  description: string;
  status:
    | 'Requested'
    | 'Awaiting Worker Confirmation'
    | 'Finding Worker'
    | 'Worker Assigned'
    | 'On the Way'
    | 'Arrived at Station'
    | 'Service In Progress'
    | 'Completed'
    | 'Cancelled'
    | 'Declined';
  assignedWorkerId?: number | null;
  assignedWorkerName?: string | null;
  assignedWorkerMobile?: string | null;
  completionNotes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface StoreData {
  users: User[];
  passwords: Record<string, string>;
  complaints: Complaint[];
  counter: number;
  workers: Worker[];
  workerPasswords: Record<string, string>;
  workerRequests: WorkerServiceRequest[];
  workerCounter: number;
  requestCounter: number;
  stations: RailwayStation[];
}

const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_PATH = path.resolve(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_STATIONS: RailwayStation[] = [
  { code: 'NDLS', name: 'New Delhi Junction', city: 'New Delhi', state: 'Delhi' },
  { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal' },
  { code: 'MAS', name: 'Puratchi Thalaivar Dr. MGR Central (Chennai)', city: 'Chennai', state: 'Tamil Nadu' },
  { code: 'SBC', name: 'KSR Bengaluru City Junction', city: 'Bengaluru', state: 'Karnataka' },
  { code: 'PUNE', name: 'Pune Junction', city: 'Pune', state: 'Maharashtra' },
  { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat' },
  { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi', state: 'Uttar Pradesh' },
  { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur', state: 'Uttar Pradesh' },
  { code: 'GHY', name: 'Guwahati Junction', city: 'Guwahati', state: 'Assam' },
  { code: 'PNBE', name: 'Patna Junction', city: 'Patna', state: 'Bihar' },
  { code: 'BPL', name: 'Bhopal Junction', city: 'Bhopal', state: 'Madhya Pradesh' },
  { code: 'NGP', name: 'Nagpur Junction', city: 'Nagpur', state: 'Maharashtra' },
  { code: 'HYB', name: 'Hyderabad Deccan / Secunderabad', city: 'Hyderabad', state: 'Telangana' },
  { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur', state: 'Rajasthan' },
];

const DEFAULT_WORKERS: Worker[] = [
  {
    id: 101,
    workerId: 'WRK-101',
    fullName: 'Ramesh Kumar Verma',
    email: 'ramesh.verma@worker.railcare.gov.in',
    mobile: '9871122334',
    headline: 'Senior AC & Electrical Coach Specialist',
    bio: 'Certified Indian Railways coach electrician with over 6 years of experience troubleshooting high-voltage LHB AC coaches, power cars, and berth charging circuits.',
    skillCategory: 'Coach Electrician & AC Technician',
    skills: [
      'Coach AC Cooling Troubleshooting',
      'Berth Mobile/Laptop Charging Socket Repair',
      'Cabin Reading Light & Fluorescent Fixture Repair',
      'Switchboard & Fuse Box Inspection',
    ],
    stationCode: 'NDLS',
    stationCodes: ['NDLS', 'CNB'],
    stationName: 'New Delhi Junction',
    city: 'New Delhi',
    experienceYears: 6,
    qualifications: 'Govt ITI Electrical Diploma #ITI-ND-4412 · High-Voltage Certified',
    verificationDocuments: 'Aadhar Verified · Railway Contractor Identity Card #IR-NDLS-E-09',
    verificationStatus: 'Verified',
    verificationDate: '2026-09-15 08:30:00',
    verifiedBy: 'Senior Divisional Officer (Admin)',
    availability: 'Available',
    rating: 4.9,
    totalJobsCompleted: 142,
    createdAt: '2026-09-15 08:30:00',
  },
  {
    id: 102,
    workerId: 'WRK-102',
    fullName: 'Suresh Babu Patil',
    email: 'suresh.patil@worker.railcare.gov.in',
    mobile: '9820033445',
    headline: 'Certified Railway Sanitation & Plumbing Technician',
    bio: 'Specialist in rapid bio-toilet maintenance, overhead water tank filling pipelines, and emergency washroom unclogging on mail/express trains.',
    skillCategory: 'Railway Coach Plumber & Sanitation Worker',
    skills: [
      'Overhead Tank Water Flow Restoration',
      'Toilet Flush Valve Servicing & Pressure Repair',
      'Washbasin Tap Leakage & Drainage Unclogging',
    ],
    stationCode: 'CSMT',
    stationCodes: ['CSMT', 'PUNE'],
    stationName: 'Chhatrapati Shivaji Maharaj Terminus',
    city: 'Mumbai',
    experienceYears: 4,
    qualifications: 'Maharashtra State Vocational Sanitation Certification #VTC-2022-P',
    verificationDocuments: 'Govt Identity Card #CSMT-SAN-881 · Police Clearance Verified',
    verificationStatus: 'Verified',
    verificationDate: '2026-09-20 10:15:00',
    verifiedBy: 'Senior Divisional Officer (Admin)',
    availability: 'Available',
    rating: 4.8,
    totalJobsCompleted: 98,
    createdAt: '2026-09-20 10:15:00',
  },
  {
    id: 103,
    workerId: 'WRK-103',
    fullName: 'Anand Mohan Rao',
    email: 'anand.rao@worker.railcare.gov.in',
    mobile: '9448855667',
    headline: 'Senior Carriage & Wagon Mechanical Technician',
    bio: 'Ex-railway mechanical fitter specializing in coach berth mechanisms, sliding door tracks, and structural vestibule connections.',
    skillCategory: 'Coach Mechanical Technician',
    skills: [
      'Upper & Middle Berth Chain/Hinge Lock Repair',
      'Coach Vestibule Door Slider & Latch Maintenance',
      'Luggage Rack Fastening & Safety Check',
      'Toilet Door Lock & Bolt Repair',
    ],
    stationCode: 'PUNE',
    stationCodes: ['PUNE', 'CSMT'],
    stationName: 'Pune Junction',
    city: 'Pune',
    experienceYears: 7,
    qualifications: 'Diploma in Mechanical Engineering (Automotive/Fitter) #DME-8841',
    verificationDocuments: 'Central Railway Mechanical Division Badge #CR-M-412',
    verificationStatus: 'Verified',
    verificationDate: '2026-08-10 11:00:00',
    verifiedBy: 'Senior Divisional Officer (Admin)',
    availability: 'Available',
    rating: 4.95,
    totalJobsCompleted: 210,
    createdAt: '2026-08-10 11:00:00',
  },
  {
    id: 104,
    workerId: 'WRK-104',
    fullName: 'Pooja Sunita Devi',
    email: 'pooja.devi@worker.railcare.gov.in',
    mobile: '9830044556',
    headline: 'On-Board Housekeeping (OBHS) Supervisor',
    bio: 'Trained in deep coach disinfection, allergen-free berth wiping, and rapid bio-waste containment during station halts.',
    skillCategory: 'Coach Cleaning & Housekeeping Worker',
    skills: [
      'On-Board Coach Floor Deep Cleaning & Mopping',
      'Berth Sanitization & Spill Neutralization',
      'Coach Dustbin Emptying & Bio-Waste Bag Collection',
      'Odour Neutralizer Spray Treatment',
    ],
    stationCode: 'HWH',
    stationCodes: ['HWH'],
    stationName: 'Howrah Junction',
    city: 'Kolkata',
    experienceYears: 3,
    qualifications: 'Eastern Railway Swachh Rail Sanitation Training Certified',
    verificationDocuments: 'Contractor Workforce ID #ER-HWH-CLN-19 · Verified',
    verificationStatus: 'Verified',
    verificationDate: '2026-10-01 09:40:00',
    verifiedBy: 'Senior Divisional Officer (Admin)',
    availability: 'Available',
    rating: 4.75,
    totalJobsCompleted: 85,
    createdAt: '2026-10-01 09:40:00',
  },
  {
    id: 105,
    workerId: 'WRK-105',
    fullName: 'Manjunath Gowda',
    email: 'manju.gowda@worker.railcare.gov.in',
    mobile: '9980077889',
    headline: 'Licensed Station Attendant & Passenger Escort',
    bio: 'Authorised porter and passenger assistant at SBC platform. Expert in wheelchair assistance, bulky luggage boarding, and elderly passenger transfers.',
    skillCategory: 'General Passenger & Luggage Assistance Worker',
    skills: [
      'Platform-to-Coach Heavy Luggage Porter Service',
      'Senior Citizen / Divyangjan Wheelchair Escort',
      'Berth Exchange & Seat Guidance Assistance',
    ],
    stationCode: 'SBC',
    stationCodes: ['SBC'],
    stationName: 'KSR Bengaluru City Junction',
    city: 'Bengaluru',
    experienceYears: 5,
    qualifications: 'South Western Railway Licensed Passenger Assistant #SWR-SBC-42',
    verificationDocuments: 'Official Brass Badge #SBC-42 · Police Background Checked',
    verificationStatus: 'Verified',
    verificationDate: '2026-09-05 14:20:00',
    verifiedBy: 'Senior Divisional Officer (Admin)',
    availability: 'Available',
    rating: 4.9,
    totalJobsCompleted: 167,
    createdAt: '2026-09-05 14:20:00',
  },
  {
    id: 106,
    workerId: 'WRK-106',
    fullName: 'Dr. Vivek Saxena (First Aid)',
    email: 'vivek.saxena@worker.railcare.gov.in',
    mobile: '9810088990',
    headline: 'St. John Ambulance Certified Station Paramedic',
    bio: 'Station emergency first-aid provider. Trained in motion sickness management, minor fracture splints, digital vitals monitoring, and emergency stretcher coordination.',
    skillCategory: 'Emergency First-Aid & Medical Assistant',
    skills: [
      'Motion Sickness, Nausea & ORS Hydration Kit',
      'Minor Wound Dressing & Sterile Antiseptic Bandaging',
      'Digital BP & Pulse Oximeter Quick Check',
      'Certified First-Aid Attendant Support',
    ],
    stationCode: 'NDLS',
    stationCodes: ['NDLS', 'CNB'],
    stationName: 'New Delhi Junction',
    city: 'New Delhi',
    experienceYears: 8,
    qualifications: 'First Aid & CPR Certified (St. John Ambulance) #SJA-ND-2021',
    verificationDocuments: 'Medical Council Reg #MC-7712-FA · Verified Govt ID',
    verificationStatus: 'Verified',
    verificationDate: '2026-08-01 07:00:00',
    verifiedBy: 'Senior Divisional Officer (Admin)',
    availability: 'Available',
    rating: 5.0,
    totalJobsCompleted: 120,
    createdAt: '2026-08-01 07:00:00',
  },
  {
    id: 107,
    workerId: 'WRK-107',
    fullName: 'Mohd Irfan Khan',
    email: 'irfan.khan@worker.railcare.gov.in',
    mobile: '9792211334',
    headline: 'IRCTC Approved Pantry & Meal Coordinator',
    bio: 'Station platform coordinator for hot sealed meals, special dietary packets, and baby food water assistance for long-distance trains.',
    skillCategory: 'Approved Pantry & Food Delivery Assistant',
    skills: [
      'Approved Sealed Meal Boarding at Station Platform',
      'Hot Water & Tea/Coffee Service to Berth',
      'FSSAI-Certified Packaged Refreshment Delivery',
    ],
    stationCode: 'CNB',
    stationCodes: ['CNB', 'NDLS'],
    stationName: 'Kanpur Central',
    city: 'Kanpur',
    experienceYears: 4,
    qualifications: 'FSSAI Food Handling Certificate #FSSAI-2023-CNB-99',
    verificationDocuments: 'IRCTC Vendor Badge #IRCTC-CNB-04 · Health Certificate Verified',
    verificationStatus: 'Verified',
    verificationDate: '2026-09-10 11:20:00',
    verifiedBy: 'Senior Divisional Officer (Admin)',
    availability: 'Available',
    rating: 4.85,
    totalJobsCompleted: 114,
    createdAt: '2026-09-10 11:20:00',
  },
  {
    id: 108,
    workerId: 'WRK-108',
    fullName: 'Deepak Subhash Chougule',
    email: 'deepak.chougule@worker.railcare.gov.in',
    mobile: '9890123456',
    headline: 'Junior Coach Electrician (Trainee)',
    bio: 'Apprentice coach electrician registered for Pune Junction platform services.',
    skillCategory: 'Coach Electrician & AC Technician',
    skills: [
      'Berth Mobile/Laptop Charging Socket Repair',
      'Cabin Reading Light & Fluorescent Fixture Repair',
    ],
    stationCode: 'PUNE',
    stationCodes: ['PUNE'],
    stationName: 'Pune Junction',
    city: 'Pune',
    experienceYears: 1,
    qualifications: 'ITI Electrician Trade Certificate submitted for verification',
    verificationDocuments: 'Aadhar Card Scan uploaded · Awaiting Admin verification',
    verificationStatus: 'Pending Verification',
    availability: 'Available',
    rating: 5.0,
    totalJobsCompleted: 0,
    createdAt: '2026-10-15 14:00:00',
  },
];

const DEFAULT_WORKER_PASSWORDS: Record<string, string> = {
  'ramesh.verma@worker.railcare.gov.in': 'Worker@1234',
  'suresh.patil@worker.railcare.gov.in': 'Worker@1234',
  'anand.rao@worker.railcare.gov.in': 'Worker@1234',
  'pooja.devi@worker.railcare.gov.in': 'Worker@1234',
  'manju.gowda@worker.railcare.gov.in': 'Worker@1234',
  'vivek.saxena@worker.railcare.gov.in': 'Worker@1234',
  'irfan.khan@worker.railcare.gov.in': 'Worker@1234',
  'deepak.chougule@worker.railcare.gov.in': 'Worker@1234',
};

const DEFAULT_STORE: StoreData = {
  users: [
    {
      id: 1,
      fullName: 'Senior Divisional Officer (Admin)',
      email: 'admin@railcare.gov.in',
      mobile: '9876543210',
      isAdmin: true,
    },
  ],
  passwords: {
    'admin@railcare.gov.in': 'Admin@1234',
  },
  complaints: [],
  counter: 1000,
  workers: DEFAULT_WORKERS,
  workerPasswords: DEFAULT_WORKER_PASSWORDS,
  workerRequests: [],
  workerCounter: 106,
  requestCounter: 5000,
  stations: DEFAULT_STATIONS,
};

function readStore(): StoreData {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const content = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.complaints)) {
        // Ensure admin user always exists
        const hasAdmin = parsed.users.some((u: User) => u && u.isAdmin);
        if (!hasAdmin) {
          parsed.users.unshift(DEFAULT_STORE.users[0]);
          parsed.passwords = { ...parsed.passwords, ...DEFAULT_STORE.passwords };
        }
        if (typeof parsed.counter !== 'number') {
          parsed.counter = 1000 + parsed.complaints.length;
        }

        // Backward-compatible extensions for Gig Worker Services
        if (!Array.isArray(parsed.workers) || parsed.workers.length === 0) {
          parsed.workers = DEFAULT_WORKERS;
        } else {
          // Normalize existing worker records to contain all structured fields
          parsed.workers = parsed.workers.map((w: any) => {
            const dw = DEFAULT_WORKERS.find((d) => d.workerId === w.workerId || d.id === w.id);
            return {
              ...w,
              headline: w.headline || dw?.headline || `${w.skillCategory} Specialist`,
              bio: w.bio || dw?.bio || `Certified railway services provider stationed at ${w.stationName || 'station'}.`,
              skills: Array.isArray(w.skills) && w.skills.length > 0 ? w.skills : dw?.skills || [w.skillCategory],
              stationCodes: Array.isArray(w.stationCodes) && w.stationCodes.length > 0 ? w.stationCodes : dw?.stationCodes || [w.stationCode],
              qualifications: w.qualifications || dw?.qualifications || 'Verified Technical & Safety Certifications',
              verificationDocuments: w.verificationDocuments || dw?.verificationDocuments || 'Government Identity & Police Clearance Verified',
              verificationStatus: w.verificationStatus || 'Pending Verification',
              availability: w.availability || 'Available',
              rating: typeof w.rating === 'number' ? w.rating : 5.0,
              totalJobsCompleted: typeof w.totalJobsCompleted === 'number' ? w.totalJobsCompleted : 0,
            };
          });

          // Ensure any default seed workers not yet in store are added
          DEFAULT_WORKERS.forEach((dw) => {
            if (!parsed.workers.some((w: Worker) => w.workerId === dw.workerId || w.email === dw.email)) {
              parsed.workers.push(dw);
            }
          });
        }

        if (!parsed.workerPasswords || typeof parsed.workerPasswords !== 'object') {
          parsed.workerPasswords = DEFAULT_WORKER_PASSWORDS;
        } else {
          parsed.workerPasswords = { ...DEFAULT_WORKER_PASSWORDS, ...parsed.workerPasswords };
        }
        if (!Array.isArray(parsed.workerRequests)) {
          parsed.workerRequests = [];
        }
        if (typeof parsed.workerCounter !== 'number') {
          parsed.workerCounter = 108 + parsed.workers.length;
        }
        if (typeof parsed.requestCounter !== 'number') {
          parsed.requestCounter = 5000 + parsed.workerRequests.length;
        }
        if (!Array.isArray(parsed.stations) || parsed.stations.length === 0) {
          parsed.stations = DEFAULT_STATIONS;
        }

        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading store file, falling back to default:', err);
  }
  writeStore(DEFAULT_STORE);
  return DEFAULT_STORE;
}

function writeStore(data: StoreData): void {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing store file:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());

  // API Routes
  app.get('/api/health', (_req: Request, res: Response) => {
    const store = readStore();
    res.json({
      status: 'ok',
      usersCount: store.users.length,
      complaintsCount: store.complaints.length,
      workersCount: (store.workers || []).length,
      workerRequestsCount: (store.workerRequests || []).length,
      timestamp: new Date().toISOString(),
    });
  });

  // Get all complaints
  app.get('/api/complaints', (_req: Request, res: Response) => {
    const store = readStore();
    res.json({ success: true, complaints: store.complaints });
  });

  // Create complaint
  app.post('/api/complaints', (req: Request, res: Response) => {
    try {
      const body = req.body;
      const store = readStore();

      store.counter = (store.counter || 1000) + 1;
      const complaintId = `RC${store.counter}`;
      const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);

      const newComplaint: Complaint = {
        id: Date.now(),
        complaintId,
        userId: Number(body.userId || 1),
        passengerName: String(body.passengerName || 'Passenger').trim(),
        passengerEmail: String(body.passengerEmail || '').toLowerCase().trim(),
        passengerMobile: String(body.passengerMobile || '').trim(),
        trainNumber: String(body.trainNumber || 'N/A').trim(),
        pnrNumber: body.pnrNumber ? String(body.pnrNumber).trim() : '',
        journeyDate: String(body.journeyDate || nowIso.slice(0, 10)),
        category: String(body.category || 'Other'),
        subject: String(body.subject || 'Railway Grievance').trim(),
        description: String(body.description || '').trim(),
        location: body.location ? String(body.location).trim() : '',
        status: 'Pending',
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      store.complaints.unshift(newComplaint);
      writeStore(store);

      res.status(201).json({ success: true, complaint: newComplaint });
    } catch (err: any) {
      console.error('Failed to create complaint:', err);
      res.status(500).json({ success: false, message: 'Failed to record complaint on server.' });
    }
  });

  // Update complaint status
  app.put('/api/complaints/:id/status', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const store = readStore();
      const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);

      let found = false;
      let updatedComplaint: Complaint | null = null;

      store.complaints = store.complaints.map((c) => {
        if (c.complaintId === id || String(c.id) === id) {
          found = true;
          updatedComplaint = {
            ...c,
            status: ['Pending', 'In Progress', 'Resolved'].includes(status) ? status : c.status,
            updatedAt: nowIso,
          };
          return updatedComplaint;
        }
        return c;
      });

      if (!found || !updatedComplaint) {
        return res.status(404).json({ success: false, message: 'Complaint not found.' });
      }

      writeStore(store);
      res.json({ success: true, complaint: updatedComplaint });
    } catch (err: any) {
      console.error('Failed to update complaint status:', err);
      res.status(500).json({ success: false, message: 'Error updating complaint status.' });
    }
  });

  // FIFO Next Dequeue
  app.post('/api/complaints/fifo-next', (_req: Request, res: Response) => {
    try {
      const store = readStore();
      const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);

      // Find earliest Pending complaint by creation time
      const pendingComplaints = store.complaints
        .filter((c) => c.status === 'Pending')
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

      if (pendingComplaints.length === 0) {
        return res.json({ success: false, message: 'Queue is empty. No pending complaints.' });
      }

      const nextToProcess = pendingComplaints[0];
      let processed: Complaint | null = null;

      store.complaints = store.complaints.map((c) => {
        if (c.complaintId === nextToProcess.complaintId) {
          processed = {
            ...c,
            status: 'In Progress',
            updatedAt: nowIso,
          };
          return processed;
        }
        return c;
      });

      writeStore(store);
      res.json({ success: true, complaint: processed });
    } catch (err: any) {
      console.error('Failed FIFO next process:', err);
      res.status(500).json({ success: false, message: 'Failed to process next FIFO complaint.' });
    }
  });

  // User Registration
  app.post('/api/register', (req: Request, res: Response) => {
    try {
      const { fullName, email, mobile, password } = req.body;
      const cleanEmail = String(email || '').toLowerCase().trim();
      const cleanName = String(fullName || '').trim();
      const cleanMobile = String(mobile || '').trim();
      const cleanPass = String(password || '');

      if (!cleanEmail || !cleanName || !cleanPass) {
        return res.status(400).json({
          success: false,
          message: 'All registration fields (name, email, password) are required.',
        });
      }

      const store = readStore();
      const existingUser = store.users.find(
        (u) => u.email.toLowerCase().trim() === cleanEmail
      );

      if (existingUser) {
        // If already registered, update password so the passenger can easily log in
        store.passwords[cleanEmail] = cleanPass;
        existingUser.fullName = cleanName || existingUser.fullName;
        if (cleanMobile) existingUser.mobile = cleanMobile;
        writeStore(store);
        return res.json({
          success: true,
          message: 'Account updated successfully. You can now log in.',
          user: existingUser,
        });
      }

      const newUser: User = {
        id: Date.now(),
        fullName: cleanName,
        email: cleanEmail,
        mobile: cleanMobile || '9876543210',
        isAdmin: false,
      };

      store.users.push(newUser);
      store.passwords[cleanEmail] = cleanPass;
      writeStore(store);

      res.status(201).json({
        success: true,
        message: 'Registration completed successfully!',
        user: newUser,
      });
    } catch (err: any) {
      console.error('Registration API error:', err);
      res.status(500).json({
        success: false,
        message: 'Server error during registration.',
      });
    }
  });

  // User & Admin Login
  app.post('/api/login', (req: Request, res: Response) => {
    try {
      const { email, password, isAdminLogin } = req.body;
      const cleanEmail = String(email || '').toLowerCase().trim();
      const cleanPass = String(password || '');

      if (!cleanEmail || !cleanPass) {
        return res.status(400).json({
          success: false,
          message: 'Please provide both email and password.',
        });
      }

      const store = readStore();

      // Check admin login
      if (isAdminLogin || cleanEmail === 'admin@railcare.gov.in') {
        const adminUser = store.users.find((u) => u.isAdmin || u.email === 'admin@railcare.gov.in');
        const expectedPass = store.passwords['admin@railcare.gov.in'] || 'Admin@1234';

        if (cleanEmail === 'admin@railcare.gov.in' && cleanPass === expectedPass) {
          const userObj = adminUser || DEFAULT_STORE.users[0];
          return res.json({
            success: true,
            message: 'Admin authentication successful.',
            user: userObj,
          });
        }

        if (isAdminLogin) {
          return res.status(401).json({
            success: false,
            message: 'Invalid administrative credentials.',
          });
        }
      }

      // Check passenger login
      const user = store.users.find((u) => u.email.toLowerCase().trim() === cleanEmail);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'No account registered with this email. Please register as a new passenger first.',
        });
      }

      const savedPass = store.passwords[cleanEmail];
      if (savedPass && savedPass !== cleanPass) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password. Please verify and try again.',
        });
      }

      // If password was missing from legacy store, save it now
      if (!savedPass) {
        store.passwords[cleanEmail] = cleanPass;
        writeStore(store);
      }

      res.json({
        success: true,
        message: 'Login successful!',
        user,
      });
    } catch (err: any) {
      console.error('Login API error:', err);
      res.status(500).json({
        success: false,
        message: 'Server error during authentication.',
      });
    }
  });

  // Get users (excluding passwords)
  app.get('/api/users', (_req: Request, res: Response) => {
    const store = readStore();
    res.json({ success: true, users: store.users });
  });

  // =========================================================================
  // RAIL CARE WORKFORCE — Gig Worker Services API Endpoints
  // =========================================================================

  // 1. Get Railway Stations
  app.get('/api/stations', (_req: Request, res: Response) => {
    const store = readStore();
    res.json({ success: true, stations: store.stations || DEFAULT_STATIONS });
  });

  // 2. Get Registered Workers (filtered by station, skill, verification status, or availability)
  app.get('/api/workers', (req: Request, res: Response) => {
    const store = readStore();
    const { stationCode, skillCategory, skill, verificationStatus, availability, search, role, verifiedOnly } = req.query;
    let filtered = store.workers || [];

    if (stationCode) {
      const sc = String(stationCode).trim().toUpperCase();
      filtered = filtered.filter((w) => w.stationCode === sc || (Array.isArray(w.stationCodes) && w.stationCodes.includes(sc)));
    }
    if (skillCategory) {
      filtered = filtered.filter((w) => w.skillCategory === String(skillCategory));
    }
    if (skill) {
      const s = String(skill).trim();
      filtered = filtered.filter((w) => Array.isArray(w.skills) && w.skills.includes(s));
    }
    if (verificationStatus) {
      filtered = filtered.filter((w) => w.verificationStatus === String(verificationStatus));
    }
    if (availability) {
      filtered = filtered.filter((w) => w.availability === String(availability));
    }
    if (search) {
      const q = String(search).toLowerCase().trim();
      filtered = filtered.filter(
        (w) =>
          w.fullName.toLowerCase().includes(q) ||
          w.workerId.toLowerCase().includes(q) ||
          w.city.toLowerCase().includes(q) ||
          (w.headline && w.headline.toLowerCase().includes(q)) ||
          (w.stationName && w.stationName.toLowerCase().includes(q))
      );
    }

    // Strict visibility rules:
    // When queried by passengers or requested with verifiedOnly, show ONLY verified workers
    // and strip sensitive private documents/IDs for privacy
    if (role === 'passenger' || verifiedOnly === 'true') {
      filtered = filtered
        .filter((w) => w.verificationStatus === 'Verified')
        .map((w) => {
          const { verificationDocuments, rejectionReason, ...safeWorker } = w;
          return safeWorker as Worker;
        });
    }

    res.json({ success: true, workers: filtered });
  });

  // 3. Register Gig Worker
  app.post('/api/workers/register', (req: Request, res: Response) => {
    try {
      const body = req.body;
      const store = readStore();
      const email = String(body.email || '').toLowerCase().trim();
      const password = String(body.password || '').trim();
      const fullName = String(body.fullName || '').trim();
      const mobile = String(body.mobile || '').trim();
      const headline = body.headline ? String(body.headline).trim() : `${body.skillCategory || 'Railway'} Specialist`;
      const bio = body.bio ? String(body.bio).trim() : '';
      const skillCategory = String(body.skillCategory || 'General Passenger & Luggage Assistance Worker').trim();
      const skills = Array.isArray(body.skills) && body.skills.length > 0 ? body.skills : [skillCategory];
      const stationCode = String(body.stationCode || 'NDLS').trim().toUpperCase();
      const stationCodes = Array.isArray(body.stationCodes) && body.stationCodes.length > 0 ? body.stationCodes : [stationCode];
      const stationName = String(body.stationName || 'New Delhi Junction').trim();
      const city = String(body.city || 'New Delhi').trim();
      const experienceYears = Number(body.experienceYears || 1);
      const qualifications = body.qualifications ? String(body.qualifications).trim() : 'Certified Railway Contractor / Technician';
      const verificationDocuments = body.verificationDocuments
        ? String(body.verificationDocuments).trim()
        : 'Government Identity & Police Clearance Submitted';

      if (!email || !password || !fullName || !mobile) {
        return res.status(400).json({ success: false, message: 'Full name, email, mobile number, and password are required.' });
      }

      // Check if worker email already exists
      const exists = (store.workers || []).some((w) => w.email.toLowerCase().trim() === email);
      if (exists) {
        return res.status(400).json({ success: false, message: 'A railway worker account already exists with this email address.' });
      }

      store.workerCounter = (store.workerCounter || 108) + 1;
      const workerId = `WRK-${store.workerCounter}`;
      const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);

      const newWorker: Worker = {
        id: Date.now(),
        workerId,
        fullName,
        email,
        mobile,
        headline,
        bio,
        skillCategory,
        skills,
        stationCode,
        stationCodes,
        stationName,
        city,
        experienceYears,
        qualifications,
        verificationDocuments,
        verificationStatus: 'Pending Verification', // Strict rule: must be verified by administrator before bookable
        availability: 'Available',
        rating: 5.0,
        totalJobsCompleted: 0,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      store.workers.unshift(newWorker);
      store.workerPasswords[email] = password;
      writeStore(store);

      res.status(201).json({
        success: true,
        message: 'Worker registration submitted successfully! Your profile is pending administrative verification before receiving requests.',
        worker: newWorker,
      });
    } catch (err: any) {
      console.error('Worker registration error:', err);
      res.status(500).json({ success: false, message: 'Server error during worker registration.' });
    }
  });

  // 4. Worker Login
  app.post('/api/workers/login', (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const store = readStore();
      const cleanEmail = String(email || '').toLowerCase().trim();
      const cleanPass = String(password || '').trim();

      if (!cleanEmail || !cleanPass) {
        return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
      }

      const worker = (store.workers || []).find((w) => w.email.toLowerCase().trim() === cleanEmail);
      if (!worker) {
        return res.status(401).json({ success: false, message: 'No registered railway worker found with this email. Please register your profile first.' });
      }

      const savedPass = store.workerPasswords[cleanEmail];
      if (savedPass && savedPass !== cleanPass) {
        return res.status(401).json({ success: false, message: 'Incorrect worker password. Please try again.' });
      }

      res.json({
        success: true,
        message: 'Worker logged in successfully!',
        worker,
      });
    } catch (err: any) {
      console.error('Worker login error:', err);
      res.status(500).json({ success: false, message: 'Server error during worker authentication.' });
    }
  });

  // 5. Worker Self-Profile Update (cannot change verification status)
  app.put('/api/workers/:id/profile', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const store = readStore();
      const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);

      let updatedWorker: Worker | null = null;
      store.workers = (store.workers || []).map((w) => {
        if (String(w.id) === id || w.workerId === id) {
          updatedWorker = {
            ...w,
            headline: body.headline !== undefined ? String(body.headline).trim() : w.headline,
            bio: body.bio !== undefined ? String(body.bio).trim() : w.bio,
            skills: Array.isArray(body.skills) && body.skills.length > 0 ? body.skills : w.skills,
            stationCodes: Array.isArray(body.stationCodes) && body.stationCodes.length > 0 ? body.stationCodes : w.stationCodes,
            experienceYears: typeof body.experienceYears === 'number' ? body.experienceYears : w.experienceYears,
            qualifications: body.qualifications !== undefined ? String(body.qualifications).trim() : w.qualifications,
            city: body.city !== undefined ? String(body.city).trim() : w.city,
            availability: ['Available', 'Busy', 'Unavailable'].includes(body.availability) ? body.availability : w.availability,
            updatedAt: nowIso,
          };
          return updatedWorker;
        }
        return w;
      });

      if (!updatedWorker) {
        return res.status(404).json({ success: false, message: 'Worker not found.' });
      }

      writeStore(store);
      res.json({ success: true, worker: updatedWorker, message: 'Profile updated successfully.' });
    } catch (err: any) {
      console.error('Update worker profile error:', err);
      res.status(500).json({ success: false, message: 'Server error updating worker profile.' });
    }
  });

  // 6. Admin Verification / Rejection / Suspension
  app.put('/api/workers/:id/verify', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { action, rejectionReason, adminName } = req.body;
      const store = readStore();
      const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);

      let targetWorker: Worker | null = null;
      store.workers = (store.workers || []).map((w) => {
        if (String(w.id) === id || w.workerId === id) {
          if (action === 'approve') {
            targetWorker = {
              ...w,
              verificationStatus: 'Verified',
              verificationDate: nowIso,
              verifiedBy: adminName || 'Senior Divisional Officer (Admin)',
              rejectionReason: undefined,
              updatedAt: nowIso,
            };
          } else if (action === 'reject') {
            targetWorker = {
              ...w,
              verificationStatus: 'Rejected',
              verificationDate: nowIso,
              verifiedBy: adminName || 'Senior Divisional Officer (Admin)',
              rejectionReason: rejectionReason
                ? String(rejectionReason).trim()
                : 'Application credentials did not satisfy railway identity and qualification requirements.',
              updatedAt: nowIso,
            };
          } else if (action === 'suspend') {
            targetWorker = {
              ...w,
              verificationStatus: 'Suspended',
              availability: 'Unavailable',
              updatedAt: nowIso,
            };
          } else if (action === 'reactivate') {
            targetWorker = {
              ...w,
              verificationStatus: 'Verified',
              availability: 'Available',
              updatedAt: nowIso,
            };
          }
          return targetWorker || w;
        }
        return w;
      });

      if (!targetWorker) {
        return res.status(404).json({ success: false, message: 'Worker record not found.' });
      }

      writeStore(store);
      const updated: Worker = targetWorker;
      res.json({
        success: true,
        worker: updated,
        message: `Worker ${updated.fullName} status updated to "${updated.verificationStatus}".`,
      });
    } catch (err: any) {
      console.error('Worker verification error:', err);
      res.status(500).json({ success: false, message: 'Error processing worker verification.' });
    }
  });

  // 7. Quick Status Changer (Admin Legacy)
  app.put('/api/workers/:id/status', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { verificationStatus } = req.body;
      const store = readStore();
      const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);

      let foundWorker: Worker | null = null;
      store.workers = (store.workers || []).map((w) => {
        if (String(w.id) === id || w.workerId === id) {
          foundWorker = {
            ...w,
            verificationStatus: ['Pending Verification', 'Verified', 'Rejected', 'Suspended'].includes(verificationStatus)
              ? verificationStatus
              : w.verificationStatus,
            updatedAt: nowIso,
          };
          return foundWorker;
        }
        return w;
      });

      if (!foundWorker) {
        return res.status(404).json({ success: false, message: 'Worker record not found.' });
      }

      writeStore(store);
      const savedWorker: Worker = foundWorker;
      res.json({
        success: true,
        worker: savedWorker,
        message: `Worker ${savedWorker.fullName} status updated to "${savedWorker.verificationStatus}".`,
      });
    } catch (err: any) {
      console.error('Worker status update error:', err);
      res.status(500).json({ success: false, message: 'Error updating worker verification status.' });
    }
  });

  // 8. Update Worker Availability (Worker Controls)
  app.put('/api/workers/:id/availability', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { availability } = req.body;
      const store = readStore();
      const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);

      let foundWorker: Worker | null = null;
      store.workers = (store.workers || []).map((w) => {
        if (String(w.id) === id || w.workerId === id) {
          foundWorker = {
            ...w,
            availability: ['Available', 'Busy', 'Unavailable'].includes(availability)
              ? availability
              : w.availability,
            updatedAt: nowIso,
          };
          return foundWorker;
        }
        return w;
      });

      if (!foundWorker) {
        return res.status(404).json({ success: false, message: 'Worker not found.' });
      }

      writeStore(store);
      const savedWorker: Worker = foundWorker;
      res.json({ success: true, worker: savedWorker, message: `Availability status set to ${savedWorker.availability}.` });
    } catch (err: any) {
      console.error('Worker availability update error:', err);
      res.status(500).json({ success: false, message: 'Error updating availability.' });
    }
  });

  // 9. Get Worker Service Requests / Bookings (with multi-field filters)
  app.get('/api/worker-requests', (req: Request, res: Response) => {
    const store = readStore();
    const { passengerId, passengerEmail, workerId, stationCode, status } = req.query;
    let requests = store.workerRequests || [];

    if (passengerId) {
      requests = requests.filter((r) => String(r.passengerId) === String(passengerId));
    }
    if (passengerEmail) {
      requests = requests.filter((r) => r.passengerEmail.toLowerCase().trim() === String(passengerEmail).toLowerCase().trim());
    }
    if (workerId) {
      requests = requests.filter((r) => String(r.assignedWorkerId) === String(workerId));
    }
    if (stationCode) {
      requests = requests.filter((r) => r.stationCode.toUpperCase() === String(stationCode).toUpperCase().trim());
    }
    if (status) {
      requests = requests.filter((r) => r.status === String(status));
    }

    res.json({ success: true, requests });
  });

  // 10. Create Service Booking (Passenger books specific worker or station queue with concurrency validation)
  app.post('/api/worker-requests', (req: Request, res: Response) => {
    try {
      const body = req.body;
      const store = readStore();
      const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);

      const stationCode = String(body.stationCode || 'NDLS').trim().toUpperCase();
      const serviceCategory = String(body.serviceCategory || 'General Passenger & Luggage Assistance Worker').trim();
      const requestedWorkerId = body.assignedWorkerId ? Number(body.assignedWorkerId) : null;

      let assignedWorker: Worker | null = null;

      // Concurrency & Double-Booking Protection
      if (requestedWorkerId) {
        const found = (store.workers || []).find((w) => w.id === requestedWorkerId || w.workerId === String(requestedWorkerId));
        if (!found) {
          return res.status(404).json({ success: false, message: 'The selected worker could not be found.' });
        }
        if (found.verificationStatus !== 'Verified') {
          return res.status(400).json({ success: false, message: 'The selected worker is not yet verified by railway administration.' });
        }
        if (found.availability !== 'Available') {
          return res.status(409).json({
            success: false,
            message: `${found.fullName} is currently engaged on another task or marked unavailable. Please select another available worker at ${stationCode}.`,
          });
        }

        // Concurrency check: Does the worker have an active booking right now?
        const hasActiveJob = (store.workerRequests || []).some(
          (r) =>
            r.assignedWorkerId === found.id &&
            ['Worker Assigned', 'On the Way', 'Arrived at Station', 'Service In Progress'].includes(r.status)
        );
        if (hasActiveJob) {
          return res.status(409).json({
            success: false,
            message: `${found.fullName} was just booked by another passenger. Please select another verified worker.`,
          });
        }

        assignedWorker = found;
      }

      store.requestCounter = (store.requestCounter || 5000) + 1;
      const requestId = `BK-${store.requestCounter}`;

      const newRequest: WorkerServiceRequest = {
        id: Date.now(),
        requestId,
        passengerId: Number(body.passengerId || 1),
        passengerName: String(body.passengerName || 'Passenger').trim(),
        passengerEmail: String(body.passengerEmail || '').toLowerCase().trim(),
        passengerMobile: String(body.passengerMobile || '').trim(),
        relatedComplaintId: body.relatedComplaintId ? String(body.relatedComplaintId).trim() : undefined,
        trainNumber: String(body.trainNumber || 'N/A').trim(),
        trainName: body.trainName ? String(body.trainName).trim() : undefined,
        coachNumber: body.coachNumber ? String(body.coachNumber).trim() : undefined,
        seatNumber: body.seatNumber ? String(body.seatNumber).trim() : undefined,
        stationCode,
        stationName: String(body.stationName || stationCode).trim(),
        expectedArrivalTime: body.expectedArrivalTime ? String(body.expectedArrivalTime).trim() : undefined,
        serviceCategory,
        requestedSkill: body.requestedSkill ? String(body.requestedSkill).trim() : undefined,
        description: String(body.description || '').trim(),
        status: assignedWorker ? 'Worker Assigned' : 'Finding Worker',
        assignedWorkerId: assignedWorker ? assignedWorker.id : null,
        assignedWorkerName: assignedWorker ? assignedWorker.fullName : null,
        assignedWorkerMobile: assignedWorker ? assignedWorker.mobile : null,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      // Atomic lock on worker availability
      if (assignedWorker) {
        assignedWorker.availability = 'Busy';
        assignedWorker.activeJobId = requestId;
      }

      store.workerRequests.unshift(newRequest);
      writeStore(store);

      res.status(201).json({
        success: true,
        request: newRequest,
        message: assignedWorker
          ? `Booking confirmed! ${assignedWorker.fullName} has been booked to meet your coach at ${newRequest.stationName}.`
          : `Service request recorded. Looking for available workers at ${newRequest.stationName}.`,
      });
    } catch (err: any) {
      console.error('Create worker request error:', err);
      res.status(500).json({ success: false, message: 'Server error creating worker request.' });
    }
  });

  // 11. Accept Service Request (Worker accepts job atomically)
  app.put('/api/worker-requests/:id/accept', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { workerId } = req.body;
      const store = readStore();
      const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);

      const worker = (store.workers || []).find((w) => String(w.id) === String(workerId) || w.workerId === String(workerId));
      if (!worker) {
        return res.status(404).json({ success: false, message: 'Worker record not found.' });
      }

      if (worker.verificationStatus !== 'Verified') {
        return res.status(403).json({ success: false, message: 'Only verified railway workers can accept service requests.' });
      }

      if (worker.availability !== 'Available') {
        return res.status(400).json({ success: false, message: 'Worker is currently busy or unavailable.' });
      }

      const reqIndex = (store.workerRequests || []).findIndex((r) => String(r.id) === id || r.requestId === id);
      if (reqIndex === -1) {
        return res.status(404).json({ success: false, message: 'Service request not found.' });
      }

      const targetReq = store.workerRequests[reqIndex];
      if (targetReq.assignedWorkerId && targetReq.status !== 'Requested' && targetReq.status !== 'Finding Worker') {
        return res.status(409).json({ success: false, message: 'This request has already been accepted by another worker.' });
      }

      // Assign worker
      targetReq.assignedWorkerId = worker.id;
      targetReq.assignedWorkerName = worker.fullName;
      targetReq.assignedWorkerMobile = worker.mobile;
      targetReq.status = 'Worker Assigned';
      targetReq.updatedAt = nowIso;

      // Update worker availability
      worker.availability = 'Busy';
      worker.activeJobId = targetReq.requestId;

      writeStore(store);

      res.json({
        success: true,
        message: `Request ${targetReq.requestId} successfully accepted!`,
        request: targetReq,
        worker,
      });
    } catch (err: any) {
      console.error('Accept request error:', err);
      res.status(500).json({ success: false, message: 'Server error accepting service request.' });
    }
  });

  // 12. Update Request Progress (On the Way, Arrived at Station, In Progress, Completed, Cancelled, Declined)
  app.put('/api/worker-requests/:id/status', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, completionNotes } = req.body;
      const store = readStore();
      const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);

      const targetReq = (store.workerRequests || []).find((r) => String(r.id) === id || r.requestId === id);
      if (!targetReq) {
        return res.status(404).json({ success: false, message: 'Service request not found.' });
      }

      const validStatuses = [
        'Requested',
        'Awaiting Worker Confirmation',
        'Finding Worker',
        'Worker Assigned',
        'On the Way',
        'Arrived at Station',
        'Service In Progress',
        'Completed',
        'Cancelled',
        'Declined',
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid request status.' });
      }

      targetReq.status = status;
      targetReq.updatedAt = nowIso;

      if (completionNotes) {
        targetReq.completionNotes = String(completionNotes).trim();
      }

      if (status === 'Completed') {
        targetReq.completedAt = nowIso;
        // Free assigned worker and increment jobs completed
        if (targetReq.assignedWorkerId) {
          const w = (store.workers || []).find((wrk) => wrk.id === targetReq.assignedWorkerId);
          if (w) {
            w.availability = 'Available';
            w.activeJobId = null;
            w.totalJobsCompleted = (w.totalJobsCompleted || 0) + 1;
            w.updatedAt = nowIso;
          }
        }
      } else if (status === 'Cancelled' || status === 'Declined') {
        // Free assigned worker if any
        if (targetReq.assignedWorkerId) {
          const w = (store.workers || []).find((wrk) => wrk.id === targetReq.assignedWorkerId);
          if (w && w.activeJobId === targetReq.requestId) {
            w.availability = 'Available';
            w.activeJobId = null;
            w.updatedAt = nowIso;
          }
        }
        if (status === 'Declined') {
          targetReq.assignedWorkerId = null;
          targetReq.assignedWorkerName = null;
          targetReq.assignedWorkerMobile = null;
          targetReq.status = 'Finding Worker';
        }
      }

      writeStore(store);
      res.json({ success: true, request: targetReq, message: `Request status updated to "${status}".` });
    } catch (err: any) {
      console.error('Update request status error:', err);
      res.status(500).json({ success: false, message: 'Server error updating request status.' });
    }
  });

  // Serve static /images endpoint for direct image requests
  const imagesDir = path.resolve(__dirname, 'public/images');

  app.get(['/images/:filename', '/public/images/:filename'], (req: Request, res: Response, next) => {
    // Never intercept Vite module imports (?import)
    if (req.query.import !== undefined) {
      return next();
    }
    const cleanName = path.basename(req.params.filename);
    const pubPath = path.join(imagesDir, cleanName);

    if (fs.existsSync(pubPath)) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.sendFile(pubPath);
    }
    next();
  });

  app.use('/images', express.static(imagesDir));
  app.use('/public/images', express.static(imagesDir));
  app.use(express.static(path.resolve(__dirname, 'public')));

  // Vite Integration:
  // In development, mount Vite's connect middleware to serve index.html and assets
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist folder
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.use('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RailCare Server listening on port ${PORT} at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start RailCare server:', err);
});
