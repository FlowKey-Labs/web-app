import { Location } from './location';
import { Policy } from './policy';

export interface Category {
  id: number;
  name: string;
}

export interface Staff {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
  email: string;
}

export type AttendanceStatus =
  | 'not_yet'
  | 'attended'
  | 'missed'
  | 'make_up'
  | 'cancelled';

export interface Attendance {
  id: number;
  client: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  session: number;
  attended: boolean;
  status: AttendanceStatus;
  status_display: string;
  timestamp: string;
}

export interface SessionUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  role: string;
}

export interface AssignedStaff {
  id: number;
  user: SessionUser;
  role: string;
  isActive: boolean;
}

export type SessionType = 'class' | 'appointment' | 'event';
export type ClassType = 'private' | 'regular' | 'workshop';
export type RepeatUnit = 'days' | 'weeks' | 'months';
export type EndType = 'never' | 'on' | 'after';

// For creating a new session
export interface CreateSessionData {
  title: string;
  session_type: SessionType;
  class_type: ClassType;
  staff: number; 
  date: string; 
  start_time: string; 
  end_time: string; 
  spots: number;
  category: number; 
  location_id?: number; 
  is_active?: boolean;
  client_ids?: number[]; 
  policy_ids?: number[]; 
  description?: string; 
  // Appointment specific fields
  email?: string;
  phone_number?: string;
  selected_class?: number;
  // Repetition fields (all optional)
  repetition?: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  repeat_every?: number;
  repeat_unit?: RepeatUnit;
  repeat_on?: string[];
  repeat_end_type?: EndType;
  repeat_end_date?: string; 
  repeat_occurrences?: number;
}

// Session data as returned by the API
export interface Session
  extends Omit<CreateSessionData, 'category' | 'client_ids' | 'location_id'> {
  id: number;
  assigned_staff: AssignedStaff | null;
  category: Category;
  location?: Location;
  attendances?: Attendance[];
  policies?: Policy[]; 
}

// For the frontend table display
export interface SessionTableData {
  id: number;
  class: string;
  classLevel?: string;
  AssignedTo: string;
  classType: string;
  slots: number;
  date: Date;
  duration: string;
  repeats: string[];
}

// Class session specific fields
export interface ClassFields {
  title: string;
  class_type: 'private' | 'regular' | 'workshop';
  spots: number;
  client_ids?: number[];
}

// Appointment session specific fields
export interface AppointmentFields {
  client_ids: number[];
  email?: string;
  phone_number?: string;
  selected_class?: number;
  category?: number;
  title?: string;
}

// Event session specific fields
export interface EventFields {
  title: string;
  description?: string;
  spots: number;
  category?: number;
  client_ids?: number[];
}

export interface MakeUpSession {
  id?: number | string;
  session_title?: string;
  client_name?: string;
  original_date: CreateSessionData['date'];
  new_date: string;
  new_start_time: string;
  new_end_time: string;
  created_at?: string;
  updated_at?: string;
  session: number | string;
  client: number | string;
}

export interface AttendedSession {
  id?: number | string;
  session_title?: string;
  client_name?: string;
  date: string; 
  created_at?: string; 
  updated_at?: string; 
  client: number | string; 
  session: number | string; 
}

export interface CancelledSession {
  id?: number | string;
  client_name?: string;
  session_title?: string;
  date: string; 
  created_at?: string;
  updated_at?: string;
  client: number | string; 
  session: number | string; 
}