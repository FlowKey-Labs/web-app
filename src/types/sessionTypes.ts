import { Location } from './location';

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

export type AttendanceStatus = 'not_yet' | 'attended' | 'missed' | 'make_up' | 'cancelled';

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
  staff: number; // staff ID
  date: string; // YYYY-MM-DD
  start_time: string; // ISO datetime
  end_time: string; // ISO datetime
  spots: number;
  category: number; // category ID
  location_id?: number; // optional location ID
  is_active?: boolean;
  client_ids?: number[]; // optional list of client IDs
  description?: string; // optional description for the session
  // Appointment specific fields
  email?: string; // optional, for appointments
  phone_number?: string; // optional, for appointments
  selected_class?: number; // optional, for appointments - references a class ID
  // Repetition fields (all optional)
  repetition?: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom'; // UI field for repetition type
  repeat_every?: number;
  repeat_unit?: RepeatUnit;
  repeat_on?: string[]; // for weekly repeat, array of weekday strings
  repeat_end_type?: EndType;
  repeat_end_date?: string; // YYYY-MM-DD, required if repeat_end_type is 'on'
  repeat_occurrences?: number; // required if repeat_end_type is 'after'
}


// Session data as returned by the API
export interface Session
  extends Omit<CreateSessionData, 'category' | 'client_ids' | 'location_id'> {
  id: number;
  assigned_staff: AssignedStaff | null;
  category: Category;
  location?: Location;
  attendances?: Attendance[];
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
