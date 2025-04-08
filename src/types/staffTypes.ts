// Base types for enums
export type StaffRole = 'intern' | 'manager' | 'staff' | 'supervisor';
export type PayType = 'hourly' | 'salary' | 'commission';

export interface FormData {
  profile?: {
    email: string;
    userId: string;
  };
  role?: {
    role: StaffRole;
    payType: PayType;
    hourlyRate?: string;
  };
  permissions?: {
    createEvents: boolean;
    addClients: boolean;
    createInvoices: boolean;
  };
}

// User type

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  mobile_number?: string;
  is_staff: boolean;
  role: string;
}

// BusinessProfile type
interface BusinessProfile {
  id: number;
  name: string;
}

// Permissions type (based on your serializer)
interface Permissions {
  id?: number;
  can_create_events: boolean;
  can_add_clients: boolean;
  can_create_invoices: boolean;
}

// Staff type (main interface)
interface Staff {
  id: number;
  user: User;
  created_by: User | null;
  role: StaffRole;
  email: string;
  member_id: string | null;
  pay_type: PayType;
  rate: number | string;
  business: BusinessProfile | number;
  isActive: boolean;
  created_at: string;
  permissions?: Permissions;
}

// Types for API requests
export interface CreateStaffRequest {
  email: string;
  member_id?: string;
  role: StaffRole;
  pay_type: PayType;
  rate: string;
  permissions: {
    can_create_events: boolean;
    can_add_clients: boolean;
    can_create_invoices: boolean;
  };
}

export interface UpdateStaffRequest {
  id: number;
  first_name?: string;
  last_name?: string;
  mobile_number?: string;
  role?: StaffRole;
  pay_type?: PayType;
  rate?: number | string;
  member_id?: string | null;
  isActive?: boolean;
  permissions?: Partial<Permissions>;
}

// API response types
export interface StaffResponse {
  id: number;
  user: User;
  created_by: User | null;
  role: StaffRole;
  email: string;
  member_id: string | null;
  pay_type: PayType;
  rate: string;
  business: BusinessProfile;
  isActive: boolean;
  created_at: string;
  permissions?: Permissions;
  token?: string;
  uidb64?: string;
}

export interface StaffListResponse extends Array<StaffResponse> {}

// Error response type
export interface StaffErrorResponse {
  detail?: string;
  email?: string[];
  role?: string[];
  pay_type?: string[];
}
