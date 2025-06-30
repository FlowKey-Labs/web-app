interface SessionStaff {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    mobile_number: string;
    role: string;
  };
  role: string;
  isActive: boolean;
}

interface ClientSession {
  session_id: number;
  session_title: string;
  staff: SessionStaff;
  start_time: string;
  end_time: string;
  attended: boolean;
  status?: string;
  status_display?: string;
  session_type: string;
  class_type: string;
}

export interface BookingRequest {
  id: number;
  booking_reference: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  notes: string;
  quantity: number;
  total_spots_requested: number;
  group_booking_notes: string;
  is_group_booking: boolean;
  booking_type: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled';
  status_display: string;
  rejection_reason: string;
  session_title: string;
  session_date: string;
  session_end_time: string;
  business_name: string;
  category_name: string;
  created_at: string;
  expires_at: string;
  approved_at: string | null;
  is_expired: boolean;
  can_be_cancelled_by_client: boolean;
  can_be_rescheduled_by_client: boolean;
  reschedule_info: any;
  original_session_info: any;
  is_deleted: boolean;
  deletion_info: any;
  cancellation_info: any;
}

export type ClientSource = 'manual' | 'booking_link';

export interface Client {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  active: boolean;
  assigned_classes: number;
  created_at: string;
  created_by: number;
  business: number;
  profileImage?: string;
  class?: string;
  classCategory?: string;
  clientLevel?: string;
  assignedTo?: string;
  attendances?: any[];
  location?: string;
  dob?: string;
  gender: string;
  sessions?: ClientSession[];
  source?: ClientSource;
  booking_request_id?: number;
  can_book_makeup?: boolean;
  booking_restrictions?: {
    max_future_bookings?: number;
    require_approval?: boolean;
    allowed_services?: string[];
  };
}

export interface AddClient {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  active: boolean;
  assigned_classes: number;
  created_at: string;
  created_by: number;
  business: number;
  profileImage?: string;
  class?: string;
  classCategory?: string;
  clientLevel?: string;
  assignedTo?: string;
  attendances?: any[];
  location: string;
  dob?: string;
  gender: string;
  group_id?: number | null;
  session_ids?: number[];
  sessions?: Array<{
    label: string;
    value: string;
  }>;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  active: boolean;
  location: string;
  created_at: string;
  created_by: number;
  business: number;
  member_count: number;
}

export interface GroupData {
  id?: number;
  name: string;
  description?: string;
  location?: string | number;
  location_name?: string;
  active?: boolean;
  contact_person?: {
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
  };
  first_name?: string;
  last_name?: string;
  email?: string;
  member_count?: number;
  created_at?: string;
  client_ids?: number[];
  session_ids?: number[];
  members?: number[];
  source?: ClientSource;
}

export interface ClientData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  location: string;
  assigned_classes: number;
  active: boolean;
  created_at: string;
  created_by: number;
  business: number;
  dob?: string;
  gender: string;
  group?: number | null;
  group_id?: number | null;
  group_details?: Group;
  session_ids?: number[];
}

export interface PublicBusinessInfo {
  slug: string;
  business_name: string;
  business_type: string;
  about?: string;
  address?: string;
  phone?: string;
  email?: string;
  booking_url: string;
  timezone?: string;
  settings: {
    requires_approval: boolean;
    auto_approve_returning_clients: boolean;
    send_confirmation_emails: boolean;
    allow_client_cancellation: boolean;
    allow_client_reschedule: boolean;
    cancellation_deadline_hours: number;
    reschedule_deadline_hours: number;
    max_reschedules_per_booking: number;
  };
}

export interface PublicService {
  id: number;
  name: string;
  description?: string;
  duration_minutes: number;
  capacity: number;
  price?: string;
  category_type: 'group' | 'individual' | 'private';
  image_url?: string;
}

export interface AvailabilitySlot {
  id?: string;
  session_id: number;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  session_title: string;
  available_spots: number;
  total_spots: number;
  confirmed_bookings: number;
  pending_bookings: number;
  capacity_status: 'available' | 'low' | 'full';
  location?: string;
  staff_name?: string;
  is_bookable?: boolean;
}

export interface PublicAvailabilityResponse {
  slots: AvailabilitySlot[];
  total_count: number;
  date_range: {
    start_date: string;
    end_date: string;
  };
}

export interface PublicBookingFormData {
  session_id?: number;
  selected_staff_id?: number;
  selected_location_id?: number;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  notes?: string;
  quantity: number;
  is_group_booking?: boolean;
  group_booking_notes?: string;
}

export interface BookingConfirmation {
  booking_reference: string;
  status: 'pending' | 'approved' | 'auto_approved';
  message: string;
  requires_approval: boolean;
  session_details: {
    title: string;
    date: string;
    start_time: string;
    end_time: string;
    location?: string;
  };
  client_info: {
    name: string;
    email: string;
    phone: string;
  };
  business_info: {
    name: string;
    email?: string;
    phone?: string;
  };
  next_steps?: string[];
}

// Client booking management
export interface ClientBookingInfo {
  booking_reference: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';
  client_name: string;
  client_email: string;
  client_phone: string;
  quantity: number;
  notes?: string;
  session: {
    id: number;
    title: string;
    date: string;
    start_time: string;
    end_time: string;
    location?: string;
    category_name: string;
    timezone: string;
  };
  business: {
    name: string;
    slug: string;
    business_type: string;
    contact_email?: string;
    phone?: string;
    address?: string;
    timezone: string;
    location?: {
      id: number;
      name: string;
      address: string;
      city: string;
      state: string;
      zip_code: string;
      country: string;
      full_address: string;
    };
  };
  created_at: string;
  expires_at?: string;
  approved_at?: string;
  can_cancel: boolean;
  can_reschedule: boolean;
  cancellation_policy: {
    allowed: boolean;
    deadline_hours: number;
    fee_policy?: string;
    time_remaining_seconds: number;
  };
  reschedule_policy: {
    allowed: boolean;
    deadline_hours: number;
    max_reschedules: number;
    current_reschedules: number;
    reschedules_remaining: number;
  };
  flexible_booking_info?: {
    selected_staff?: {
      id: number;
      name: string;
      email: string;
      specialization?: string;
    };
    selected_location?: {
      id: number;
      name: string;
      address: string;
      full_address: string;
    };
    is_flexible: boolean;
  };
  client_email_hint?: string;
  client_phone_hint?: string;
  client_email_masked?: string;
  client_phone_masked?: string;
}

export interface RescheduleOption {
  session_id: number;
  id: number;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  location: string;
  available_spots: number;
  total_spots: number;
  capacity_status: 'available' | 'low' | 'full';
  category_name: string;
  staff_name?: string;
}

export interface RescheduleInfo {
  current_booking: {
    booking_reference: string;
    client_name: string;
    client_email_hint: string;
    client_phone_hint: string;
    client_email_masked: string;
    client_phone_masked: string;
    session: {
      id: number;
      title: string;
      start_time: string;
      end_time: string;
      duration_minutes: number;
      location: string;
      category_name: string;
    };
    flexible_booking_info?: {
      selected_staff?: {
        id: number;
        name: string;
        email: string;
      };
      selected_location?: {
        id: number;
        name: string;
        address: string;
      };
      is_flexible: boolean;
    };
    quantity: number;
    status: string;
  };
  business: {
    name: string;
    slug: string;
    business_type: string;
    contact_email: string;
    phone?: string;
    address?: string;
    timezone: string;
    location?: {
      id: number;
      name: string;
      address: string;
      city: string;
      state: string;
      zip_code: string;
      country: string;
      full_address: string;
    };
  };
  available_sessions: RescheduleOption[];
  filter_options: {
    current_filter: string;
    available_filters: Array<{
      value: string;
      label: string;
      count: number;
    }>;
  };
  reschedule_policy: {
    allowed: boolean;
    deadline_hours: number;
    deadline: string;
    can_reschedule: boolean;
    max_reschedules: number;
    current_reschedules: number;
    reschedules_remaining: number;
  };
  reschedule_fee_policy: string;
}

export interface RescheduleErrorReason {
  id: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  details?: {
    current_reschedules?: number;
    max_reschedules?: number;
    hours_remaining?: number;
    required_hours?: number;
  };
}

export interface RescheduleErrorResponse {
  error: string;
  can_reschedule: boolean;
  reasons: RescheduleErrorReason[];
  policy?: {
    max_reschedules: number;
    current_reschedules: number;
    deadline_hours: number;
  };
}

// Booking step management
export type BookingStep = 'service' | 'staff' | 'location' | 'date' | 'time' | 'details' | 'confirmation';

export interface PublicStaff {
  id: number;
  name: string;
  specializations?: string[];
  availability_hours?: {
    [key: string]: { start: string; end: string }[];
  };
  image_url?: string;
  bio?: string;
  is_available?: boolean;
  rating?: number;
}

export interface PublicLocation {
  id: number;
  name: string;
  address: string;
  city: string;
  amenities?: string[];
  capacity?: number;
  image_url?: string;
  is_available?: boolean;
}

export interface FlexibleBookingSettings {
  allow_staff_selection: boolean;
  allow_location_selection: boolean;
  require_staff_confirmation: boolean;
  auto_assign_when_single_option: boolean;
}

export interface BookingFlowState {
  currentStep: BookingStep;
  selectedService: PublicService | null;
  selectedStaff: PublicStaff | null;
  selectedLocation: PublicLocation | null;
  selectedDate: string | Date | null;
  selectedSlot: AvailabilitySlot | null;
  selectedTimeSlot: AvailabilitySlot | null;
  selectedTimezone?: string;
  formData: Partial<PublicBookingFormData>;
  businessInfo: PublicBusinessInfo | null;
  flexibleBookingSettings?: FlexibleBookingSettings;
}