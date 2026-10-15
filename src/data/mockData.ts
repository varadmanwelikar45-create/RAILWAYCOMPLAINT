import { Complaint, ComplaintCategory, User } from '../types';

export const ALLOWED_CATEGORIES: ComplaintCategory[] = [
  'Cleanliness',
  'Catering and Food Quality',
  'Electrical Issues',
  'Water Availability',
  'Staff Behaviour',
  'Ticketing Issues',
  'Train Delay',
  'Security and Safety',
  'Other',
];

// Only the official Administrator account exists initially; passengers register their own accounts
export const INITIAL_USERS: User[] = [
  {
    id: 1,
    fullName: 'Senior Divisional Officer (Admin)',
    email: 'admin@railcare.gov.in',
    mobile: '9876543210',
    isAdmin: true,
  },
];

// Clean initial complaints list; grievances will be filed by registered passengers
export const INITIAL_COMPLAINTS: Complaint[] = [];
