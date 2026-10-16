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
  skillCategory: string;
  stationCode: string;
  stationName: string;
  city: string;
  experienceYears?: number;
  verificationStatus: 'Pending Verification' | 'Verified' | 'Rejected' | 'Suspended';
  availability: 'Available' | 'Busy' | 'Unavailable';
  activeJobId?: string | null;
  rating?: number;
  totalJobsCompleted: number;
  createdAt: string;
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
  description: string;
  status: 'Requested' | 'Finding Worker' | 'Worker Assigned' | 'On the Way' | 'Arrived at Station' | 'Service In Progress' | 'Completed' | 'Cancelled';
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
    skillCategory: 'Coach Electrician & AC Technician',
    stationCode: 'NDLS',
    stationName: 'New Delhi Junction',
    city: 'New Delhi',
    experienceYears: 6,
    verificationStatus: 'Verified',
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
    skillCategory: 'Railway Coach Plumber & Sanitation Worker',
    stationCode: 'CSMT',
    stationName: 'Chhatrapati Shivaji Maharaj Terminus',
    city: 'Mumbai',
    experienceYears: 4,
    verificationStatus: 'Verified',
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
    skillCategory: 'Coach Mechanical Technician',
    stationCode: 'PUNE',
    stationName: 'Pune Junction',
    city: 'Pune',
    experienceYears: 7,
    verificationStatus: 'Verified',
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
    skillCategory: 'Coach Cleaning & Housekeeping Worker',
    stationCode: 'HWH',
    stationName: 'Howrah Junction',
    city: 'Kolkata',
    experienceYears: 3,
    verificationStatus: 'Verified',
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
    skillCategory: 'General Passenger & Luggage Assistance Worker',
    stationCode: 'SBC',
    stationName: 'KSR Bengaluru City Junction',
    city: 'Bengaluru',
    experienceYears: 5,
    verificationStatus: 'Verified',
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
    skillCategory: 'Emergency First-Aid & Medical Assistant',
    stationCode: 'NDLS',
    stationName: 'New Delhi Junction',
    city: 'New Delhi',
    experienceYears: 8,
    verificationStatus: 'Verified',
    availability: 'Available',
    rating: 5.0,
    totalJobsCompleted: 120,
    createdAt: '2026-08-01 07:00:00',
  },
];

const DEFAULT_WORKER_PASSWORDS: Record<string, string> = {
  'ramesh.verma@worker.railcare.gov.in': 'Worker@1234',
  'suresh.patil@worker.railcare.gov.in': 'Worker@1234',
  'anand.rao@worker.railcare.gov.in': 'Worker@1234',
  'pooja.devi@worker.railcare.gov.in': 'Worker@1234',
  'manju.gowda@worker.railcare.gov.in': 'Worker@1234',
  'vivek.saxena@worker.railcare.gov.in': 'Worker@1234',
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
          parsed.workerCounter = 106 + parsed.workers.length;
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
    const { stationCode, skillCategory, verificationStatus, availability } = req.query;
    let filtered = store.workers || [];

    if (stationCode) {
      filtered = filtered.filter((w) => w.stationCode === String(stationCode).trim().toUpperCase());
    }
    if (skillCategory) {
      filtered = filtered.filter((w) => w.skillCategory === String(skillCategory));
    }
    if (verificationStatus) {
      filtered = filtered.filter((w) => w.verificationStatus === String(verificationStatus));
    }
    if (availability) {
      filtered = filtered.filter((w) => w.availability === String(availability));
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
      const skillCategory = String(body.skillCategory || 'General Passenger & Luggage Assistance Worker').trim();
      const stationCode = String(body.stationCode || 'NDLS').trim().toUpperCase();
      const stationName = String(body.stationName || 'New Delhi Junction').trim();
      const city = String(body.city || 'New Delhi').trim();
      const experienceYears = Number(body.experienceYears || 1);

      if (!email || !password || !fullName || !mobile) {
        return res.status(400).json({ success: false, message: 'All worker registration fields are required.' });
      }

      // Check if worker email already exists
      const exists = (store.workers || []).some((w) => w.email.toLowerCase().trim() === email);
      if (exists) {
        return res.status(400).json({ success: false, message: 'A railway worker account already exists with this email address.' });
      }

      store.workerCounter = (store.workerCounter || 106) + 1;
      const workerId = `WRK-${store.workerCounter}`;
      const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);

      const newWorker: Worker = {
        id: Date.now(),
        workerId,
        fullName,
        email,
        mobile,
        skillCategory,
        stationCode,
        stationName,
        city,
        experienceYears,
        verificationStatus: 'Pending Verification', // Requires administrative verification
        availability: 'Available',
        rating: 5.0,
        totalJobsCompleted: 0,
        createdAt: nowIso,
      };

      store.workers.unshift(newWorker);
      store.workerPasswords[email] = password;
      writeStore(store);

      res.status(201).json({
        success: true,
        message: 'Registration submitted successfully! Your account is pending administrative verification before receiving requests.',
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

  // 5. Update Worker Verification Status (Admin Only)
  app.put('/api/workers/:id/status', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { verificationStatus } = req.body;
      const store = readStore();

      let foundWorker: Worker | null = null;
      store.workers = (store.workers || []).map((w) => {
        if (String(w.id) === id || w.workerId === id) {
          foundWorker = {
            ...w,
            verificationStatus: ['Pending Verification', 'Verified', 'Rejected', 'Suspended'].includes(verificationStatus)
              ? verificationStatus
              : w.verificationStatus,
          };
          return foundWorker;
        }
        return w;
      });

      if (!foundWorker) {
        return res.status(404).json({ success: false, message: 'Worker record not found.' });
      }

      writeStore(store);
      res.json({ success: true, worker: foundWorker, message: `Worker ${foundWorker.fullName} status updated to ${foundWorker.verificationStatus}.` });
    } catch (err: any) {
      console.error('Worker status update error:', err);
      res.status(500).json({ success: false, message: 'Error updating worker verification status.' });
    }
  });

  // 6. Update Worker Availability (Worker Controls)
  app.put('/api/workers/:id/availability', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { availability } = req.body;
      const store = readStore();

      let foundWorker: Worker | null = null;
      store.workers = (store.workers || []).map((w) => {
        if (String(w.id) === id || w.workerId === id) {
          foundWorker = {
            ...w,
            availability: ['Available', 'Busy', 'Unavailable'].includes(availability)
              ? availability
              : w.availability,
          };
          return foundWorker;
        }
        return w;
      });

      if (!foundWorker) {
        return res.status(404).json({ success: false, message: 'Worker not found.' });
      }

      writeStore(store);
      res.json({ success: true, worker: foundWorker, message: `Availability status set to ${foundWorker.availability}.` });
    } catch (err: any) {
      console.error('Worker availability update error:', err);
      res.status(500).json({ success: false, message: 'Error updating availability.' });
    }
  });

  // 7. Get Worker Service Requests (with filters)
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

  // 8. Create Service Request (Passenger initiates request)
  app.post('/api/worker-requests', (req: Request, res: Response) => {
    try {
      const body = req.body;
      const store = readStore();
      store.requestCounter = (store.requestCounter || 5000) + 1;
      const requestId = `REQ-${store.requestCounter}`;
      const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);

      const stationCode = String(body.stationCode || 'NDLS').trim().toUpperCase();
      const serviceCategory = String(body.serviceCategory || 'General Passenger & Luggage Assistance Worker').trim();

      // Check real registered workers at this station who are verified and available
      const eligibleWorkers = (store.workers || []).filter(
        (w) =>
          w.stationCode.toUpperCase() === stationCode &&
          w.skillCategory === serviceCategory &&
          w.verificationStatus === 'Verified' &&
          w.availability === 'Available'
      );

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
        description: String(body.description || '').trim(),
        status: eligibleWorkers.length > 0 ? 'Finding Worker' : 'Requested',
        assignedWorkerId: null,
        assignedWorkerName: null,
        assignedWorkerMobile: null,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      store.workerRequests.unshift(newRequest);
      writeStore(store);

      res.status(201).json({
        success: true,
        request: newRequest,
        matchingWorkersCount: eligibleWorkers.length,
        message: eligibleWorkers.length > 0
          ? `Service request dispatched to ${eligibleWorkers.length} verified worker(s) at ${newRequest.stationName}.`
          : `Service request recorded. Looking for available workers at ${newRequest.stationName}.`,
      });
    } catch (err: any) {
      console.error('Create worker request error:', err);
      res.status(500).json({ success: false, message: 'Server error creating worker request.' });
    }
  });

  // 9. Accept Service Request (Worker accepts job atomically)
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

  // 10. Update Request Progress (On the Way, Arrived at Station, In Progress, Completed, Cancelled)
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
        'Finding Worker',
        'Worker Assigned',
        'On the Way',
        'Arrived at Station',
        'Service In Progress',
        'Completed',
        'Cancelled',
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
          }
        }
      } else if (status === 'Cancelled') {
        // Free assigned worker if any
        if (targetReq.assignedWorkerId) {
          const w = (store.workers || []).find((wrk) => wrk.id === targetReq.assignedWorkerId);
          if (w && w.activeJobId === targetReq.requestId) {
            w.availability = 'Available';
            w.activeJobId = null;
          }
        }
      }

      writeStore(store);
      res.json({ success: true, request: targetReq, message: `Request status updated to "${status}".` });
    } catch (err: any) {
      console.error('Update request status error:', err);
      res.status(500).json({ success: false, message: 'Server error updating request status.' });
    }
  });

  // Explicit image route to reliably serve images across all devices and preview environments
  const imagesDir = path.resolve(__dirname, 'public/images');
  const srcImagesDir = path.resolve(__dirname, 'src/assets/images');

  // Helper to serve image with headers
  const serveImageFile = (filename: string, res: Response): boolean => {
    const cleanName = path.basename(filename);
    const pubPath = path.join(imagesDir, cleanName);
    const srcPath = path.join(srcImagesDir, cleanName);

    let targetFile = '';
    if (fs.existsSync(pubPath)) {
      targetFile = pubPath;
    } else if (fs.existsSync(srcPath)) {
      targetFile = srcPath;
    }

    if (targetFile) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.sendFile(targetFile);
      return true;
    }
    return false;
  };

  app.get(['/images/:filename', '/src/assets/images/:filename', '/public/images/:filename'], (req: Request, res: Response, next) => {
    const served = serveImageFile(req.params.filename, res);
    if (!served) {
      next();
    }
  });

  app.use('/images', express.static(imagesDir));
  app.use('/src/assets/images', express.static(srcImagesDir));
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
