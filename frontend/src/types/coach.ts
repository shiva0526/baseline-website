export interface Tournament {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  matchType: string;
  ageGroups: string[];
  registrationOpen: string;
  registrationClose: string;
  status?: 'upcoming' | 'completed' | 'cancelled';
}

export const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export type Program = '2-Day' | '4-Day';

export interface Player {
  id: number;
  name: string;
  program: string;
  attendedClasses: number;
  weeklyAttendance: number;
  phone?: string;
  batch?: string;
  gender?: string | null;
  age?: number | null;
  avatar?: string | null;
  joining_date?: string | null;
  created_at?: string;
  performance_ratings?: Record<string, number>;
}

export interface Announcement {
  id: number;
  text: string;
  duration: '24hours' | '48hours' | 'manual';
  createdAt: number;
  expiresAt?: number;
}
