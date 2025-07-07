import { Location } from './location';
import { Policy } from './policy';

export interface Category {
  id: number;
  name: string;
  description?: string;
  business: number;
  created_at: string;
  updated_at: string;
  subcategories?: SubCategory[];
}

// Enhanced SubCategory interface for salon services
export interface SubCategory {
  id: number;
  name: string;
  description?: string;
  category: number;
  // Service-specific fields
  is_service?: boolean;
  base_price?: number;
  default_duration?: number;
  min_duration?: number;
  max_duration?: number;
  price_per_minute?: number;
}

export interface SubSkill {
  id: number;
  name: string;
  description?: string;
  subcategory: number;
  created_at: string;
  updated_at: string;
}

// Enhanced interfaces for staff service management
export interface StaffServiceCompetency {
  id: number;
  staff: number;
  staff_name?: string;
  subcategory: number;
  subcategory_name?: string;
  category_name?: string;
  skill_level: 'trainee' | 'competent' | 'expert' | 'master';
  hourly_rate?: string;
  is_active: boolean;
  created_at: string;
  
  // Enhanced service information
  service_details?: SubCategory;
}

export interface StaffLocationAssignment {
  id: number;
  staff: number;
  staff_name?: string;
  location: number;
  location_name?: string;
  location_address?: string;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
}

export interface StaffException {
  id: number;
  staff?: {
    id: number;
    user: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
    };
  };
  date: string;
  exception_type: 'unavailable' | 'vacation' | 'sick' | 'training' | 'personal';
  reason: string;
  is_all_day: boolean;
  start_time?: string;
  end_time?: string;
  status: 'pending' | 'approved' | 'denied';
  admin_notes?: string;
  created_at: string;
}

export interface CreateSessionData {
  title: string;
  description?: string;
  session_type: 'class' | 'appointment' | 'event';
  class_type?: 'private' | 'regular' | 'workshop';
  date: string;
  start_time: string;
  end_time: string;
  spots: number;
  category?: number;
  staff?: number;
  location?: number;
  client_ids?: number[];
  policy_ids?: number[];
  staff_ids?: number[];
  location_ids?: number[];
  // Repetition fields
  repeat_every?: number;
  repeat_unit?: 'days' | 'weeks' | 'months';
  repeat_on?: string[];
  repeat_end_type?: 'never' | 'on' | 'after';
  repeat_end_date?: string;
  repeat_occurrences?: number;
  // Flexible booking fields
  allow_staff_selection?: boolean;
  allow_location_selection?: boolean;
  require_staff_confirmation?: boolean;
  staff_confirmation_timeout_hours?: number;
  auto_assign_when_single_option?: boolean;
}

// Enhanced service pricing utilities
export interface ServicePricing {
  basePrice: number;
  duration: number;
  pricePerMinute?: number;
  totalPrice: number;
  formattedPrice: string;
}

export const calculateServicePrice = (
  service: SubCategory, 
  duration?: number,
  business?: { currency?: string; currency_symbol?: string }
): ServicePricing => {
  const basePrice = parseFloat(service.base_price || '0');
  const serviceDuration = duration || service.default_duration || 60;
  const pricePerMinute = parseFloat(service.price_per_minute || '0');
  
  let totalPrice = basePrice;
  
  // Add variable pricing if duration exceeds default
  if (duration && service.default_duration && duration > service.default_duration && pricePerMinute > 0) {
    const extraMinutes = duration - service.default_duration;
    totalPrice += extraMinutes * pricePerMinute;
  }
  
  // Use business currency symbol or default to KSH
  const currencySymbol = business?.currency_symbol || 'KSH';
  
  return {
    basePrice,
    duration: serviceDuration,
    pricePerMinute,
    totalPrice,
    formattedPrice: `${currencySymbol} ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
  };
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}hr${hours > 1 ? 's' : ''}`;
  }
  
  return `${hours}hr${hours > 1 ? 's' : ''} ${remainingMinutes}min`;
};

export const getDurationOptions = (
  service: SubCategory, 
  business?: { currency?: string; currency_symbol?: string }
): Array<{value: number, label: string}> => {
  const options: Array<{value: number, label: string}> = [];
  const min = service.min_duration || service.default_duration || 30;
  const max = service.max_duration || service.default_duration || 120;
  const step = 15; // 15-minute increments
  
  for (let duration = min; duration <= max; duration += step) {
    const pricing = calculateServicePrice(service, duration, business);
    options.push({
      value: duration,
      label: `${formatDuration(duration)} - ${pricing.formattedPrice}`
    });
  }
  
  return options;
};

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
export type ClassType = 'private' | 'regular' | 'workshop';
export type RepeatUnit = 'days' | 'weeks' | 'months';
export type EndType = 'never' | 'on' | 'after';

export interface Session
  extends Omit<
    CreateSessionData,
    'category' | 'client_ids' | 'location_id' | 'location_ids'
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
  sessionTypes: string[];
  pageIndex: number;
}

export interface Business {
  id: number;
  business_name: string;
  business_type: string;
  currency: string;
  currency_symbol: string;
  timezone: string;
  // ... other fields
}
