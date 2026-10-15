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

export type ViewMode =
  | 'landing'
  | 'login'
  | 'register'
  | 'admin-login'
  | 'user-dashboard'
  | 'register-complaint'
  | 'complaint-details'
  | 'admin-dashboard';
