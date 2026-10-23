export type ComplaintCategory =
  | 'Cleanliness'
  | 'Catering and Food Quality'
  | 'Electrical Issues'
  | 'Water Availability'
  | 'Staff Behaviour'
  | 'Ticketing Issues'
  | 'Train Delay'
  | 'Security and Safety'
  | 'Other';

export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved';

export interface User {
  id: number;
  fullName: string;
  email: string;
  mobile: string;
  isAdmin: boolean;
  role?: 'passenger' | 'worker' | 'admin';
}

export interface Complaint {
  id: number;
  complaintId: string;
  userId: number;
  passengerName: string;
  passengerEmail: string;
  passengerMobile: string;
  trainNumber: string;
  pnrNumber?: string;
  journeyDate: string;
  category: ComplaintCategory;
  subject: string;
  description: string;
  location?: string;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// RAIL CARE WORKFORCE — Gig Worker Services Types
// ---------------------------------------------------------------------------

export type WorkerSkillCategory =
  | 'Coach Electrician & AC Technician'
  | 'Railway Coach Plumber & Sanitation Worker'
  | 'Coach Cleaning & Housekeeping Worker'
  | 'Coach Mechanical Technician'
  | 'Approved Pantry & Food Delivery Assistant'
  | 'General Passenger & Luggage Assistance Worker'
  | 'Emergency First-Aid & Medical Assistant';

export type WorkerVerificationStatus = 'Pending Verification' | 'Verified' | 'Rejected' | 'Suspended';

export type WorkerAvailabilityStatus = 'Available' | 'Busy' | 'Unavailable';

export interface Worker {
  id: number;
  workerId: string;
  fullName: string;
  email: string;
  mobile: string;
  headline?: string;
  bio?: string;
  skillCategory: WorkerSkillCategory;
  skills?: string[];
  stationCode: string;
  stationCodes?: string[];
  stationName: string;
  city: string;
  experienceYears?: number;
  qualifications?: string;
  verificationDocuments?: string;
  verificationStatus: WorkerVerificationStatus;
  rejectionReason?: string;
  verificationDate?: string;
  verifiedBy?: string;
  availability: WorkerAvailabilityStatus;
  activeJobId?: string | null;
  profileImage?: string;
  verificationPhoto?: string;
  photoUpdatedAt?: string;
  rating?: number;
  totalJobsCompleted: number;
  reviews?: WorkerFeedback[];
  createdAt: string;
  updatedAt?: string;
}

export type WorkerRequestStatus =
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

export interface WorkerFeedback {
  id: number;
  requestId: string;
  workerId: number;
  passengerId: number;
  passengerName: string;
  rating: number; // 1 to 5
  tags?: string[];
  comment: string;
  createdAt: string;
}

export interface WorkerServiceRequest {
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
  serviceCategory: WorkerSkillCategory;
  requestedSkill?: string;
  description: string;
  status: WorkerRequestStatus;
  assignedWorkerId?: number | null;
  assignedWorkerName?: string | null;
  assignedWorkerMobile?: string | null;
  completionNotes?: string;
  rejectionReason?: string;
  feedback?: WorkerFeedback;
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
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface RailwayStation {
  code: string;
  name: string;
  city: string;
  state: string;
}

export type ViewMode =
  | 'landing'
  | 'login'
  | 'register'
  | 'admin-login'
  | 'user-dashboard'
  | 'register-complaint'
  | 'complaint-details'
  | 'admin-dashboard'
  | 'worker-login'
  | 'worker-register'
  | 'worker-dashboard'
  | 'book-worker'
  | 'portal-selection';
