// Booking Settings Types
export interface BookingSettings {
  // Core settings
  requires_approval: boolean;
  buffer_time_minutes: number;
  booking_expiry_hours: number;
  is_active: boolean;
  
  // Advanced settings
  auto_approve_returning_clients: boolean;
  max_advance_booking_days: number;
  min_advance_booking_hours: number;
  
  // Group booking settings
  allow_group_bookings: boolean;
  max_group_size: number;
  group_booking_requires_approval: boolean;
  allow_duplicate_bookings: boolean;
  
  // Email notification settings
  send_confirmation_emails: boolean;
  send_reminder_emails: boolean;
  reminder_hours_before: number;
  
  // Booking expiry and cleanup
  auto_release_expired: boolean;
  send_expiry_notifications: boolean;
  
  // Customization
  booking_page_title: string;
  booking_page_description: string;
  success_message: string;
  
  // Cancellation policy settings
  allow_client_cancellation: boolean;
  cancellation_deadline_hours: number;
  send_cancellation_emails: boolean;
  cancellation_fee_policy: string;
  
  // Admin deletion settings
  allow_admin_deletion: boolean;
  require_deletion_reason: boolean;
  
  // Reschedule policy settings
  allow_client_reschedule: boolean;
  reschedule_deadline_hours: number;
  max_reschedules_per_booking: number;
  send_reschedule_emails: boolean;
  reschedule_fee_policy: string;
}

// Booking Request Types
export interface BookingRequest {
  id: number;
  booking_reference: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  notes?: string;
  quantity: number;
  total_spots_requested: number;
  group_booking_notes?: string;
  is_group_booking: boolean;
  booking_type: string;
  
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';
  status_display: string;
  rejection_reason?: string;
  
  session_title: string;
  session_date: string;
  session_end_time: string;
  business_name: string;
  category_name: string;
  
  created_at: string;
  expires_at: string;
  approved_at?: string;
  is_expired: boolean;
  
  can_be_cancelled_by_client: boolean;
  can_be_rescheduled_by_client: boolean;
  
  reschedule_info?: {
    reschedule_count: number;
    last_rescheduled_at?: string;
    reschedule_reason?: string;
    rescheduled_by_client: boolean;
    max_reschedules_allowed: number;
  };
  
  original_session_info?: any;
  
  // Deletion and cancellation status
  is_deleted: boolean;
  deletion_info?: {
    deleted_at: string;
    deleted_by: string;
    deletion_reason: string;
  };
  cancellation_info?: {
    cancelled_at: string;
    cancelled_by: string;
    cancellation_reason: string;
    cancelled_by_client: boolean;
  };
}

// Booking Notification Types
export interface BookingNotification {
  id: number;
  type: 'booking_request' | 'booking_approved' | 'booking_rejected' | 'booking_cancelled' | 'booking_expired';
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  booking_request: {
    id: number;
    booking_reference: string;
    client_name: string;
    client_email: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';
    session: {
      id: number;
      title: string;
      start_time: string;
      end_time: string;
    } | null;
  } | null;
  time_since: string;
  data: Record<string, any>;
}

// Booking Audit Log Types
export interface BookingAuditLog {
  id: number;
  action: 'created' | 'approved' | 'rejected' | 'cancelled' | 'deleted' | 'restored' | 'rescheduled';
  action_display: string;
  details: string;
  performed_at: string;
  booking_request: {
    booking_reference: string;
    client_name: string;
    session_title: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
  time_since: string;
}

// Booking Management Response Types
export interface BookingManagementResponse {
  bookings: BookingRequest[];
  total_count: number;
  filters: {
    status?: string;
    include_deleted: boolean;
    search: string;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface BookingActionResponse {
  success: boolean;
  message: string;
  booking_reference: string;
  status: string;
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  deleted_at?: string;
  deletion_reason?: string;
} 