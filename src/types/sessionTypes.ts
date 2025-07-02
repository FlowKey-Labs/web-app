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
  } | null;
  session: number;
  attended: boolean;
  status: AttendanceStatus;
  status_display: string;
  timestamp: string;
  session_title?: string;
  client_name?: string;
  booking_reference?: string;
  participant_name?: string;
  participant_type?: 'client' | 'booking';
  participant_email?: string;
  participant_phone?: string;
  display_status?: string;
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
export type RepeatUnit = 'days' | 'weeks' | 'months';
export type EndType = 'never' | 'on' | 'after';

export interface CreateSessionData {
  title: string;
  session_type: SessionType;
  class_type: ClassType;
  staff?: number;
  staff_ids?: number[];
  date: string;
  start_time: string;
  end_time: string;
  spots: number;
  category: number;
  location_id?: number;
  location_ids?: number[];
  is_active?: boolean;
  client_ids?: number[];
  policy_ids?: number[];
  description?: string;
  email?: string;
  phone_number?: string;
  selected_class?: number;
  repetition?: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  repeat_every?: number;
  repeat_unit?: RepeatUnit;
  repeat_on?: string[];
  repeat_end_type?: EndType;
  repeat_end_date?: string;
  repeat_occurrences?: number | null;

  // Flexible booking fields
  allow_staff_selection?: boolean;
  allow_location_selection?: boolean;
  require_staff_confirmation?: boolean;
  staff_confirmation_timeout_hours?: number;
  auto_assign_when_single_option?: boolean;
}

export interface Session
  extends Omit<
    CreateSessionData,
    'category' | 'client_ids' | 'location_id' | 'location_ids' | 'class_type'
  > {
  id: number;
  assigned_staff: AssignedStaff | null;
  category: Category;
  location?: Location;
  locations?: Location[]; // For multiple locations
  available_staff?: AssignedStaff[]; // Staff available for flexible booking
  available_locations?: Location[]; // Locations available for flexible booking
  attendances?: Attendance[];
  booking_requests?: BookingRequest[];
  total_participants?: TotalParticipants;
  policies?: Policy[];
  policy_ids?: number[];
  _frontend_start_time?: string;
  _frontend_end_time?: string;
  client_ids?: number[];

  // Flexible booking fields
  allow_staff_selection?: boolean;
  allow_location_selection?: boolean;
  require_staff_confirmation?: boolean;
  staff_confirmation_timeout_hours?: number;
  auto_assign_when_single_option?: boolean;
  class_type?: string;
  class_type_detail?: ClassType;
}

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

export interface ClassFields {
  title: string;
  class_type: 'private' | 'regular' | 'workshop';
  spots: number;
  client_ids?: number[];
}

export interface AppointmentFields {
  client_ids: number[];
  email?: string;
  phone_number?: string;
  selected_class?: number;
  category?: number;
  title?: string;
}

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
export interface ProgressFeedback {
  client_id: string;
  subcategory_id: string;
  feedback: string;
  attachment: File;
}

export interface BookingRequest {
  id: number;
  booking_reference: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled';
  quantity: number;
  is_group_booking: boolean;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
}

export interface TotalParticipants {
  attendance_count: number;
  booking_count: number;
  total: number;
  capacity: number;
  available: number;
}

/**
 * Extended Session type used specifically for calendar event generation
 * This type includes all fields needed for proper recurrence handling
 */
export interface CalendarSessionType extends Omit<Session, 'repeat_end_date'> {
  // Make sure these fields are properly typed for calendar use
  repeat_on?: string[];
  repeat_end_date?: string | null;
  repeat_end_type?: EndType;
  repeat_every?: number;
  repeat_unit?: RepeatUnit;
  repeat_occurrences?: number | null;

  // Booking-related fields for calendar display
  booking_requests?: BookingRequest[];
  total_participants?: TotalParticipants;

  date: string;
  spots: number;
  attendances?: Attendance[];
  // Allow for any additional properties coming from the backend
  [key: string]: unknown;
}

export interface SessionFilters {
  sessionTypes?: string[];
  categories?: string[];
  dateRange?: [Date | null, Date | null];
  pageIndex: number;
}

export interface ClassType {
  id?: string;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}
