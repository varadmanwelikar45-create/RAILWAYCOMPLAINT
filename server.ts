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

interface StoreData {
  users: User[];
  passwords: Record<string, string>;
  complaints: Complaint[];
  counter: number;
}

const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_PATH = path.resolve(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

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
