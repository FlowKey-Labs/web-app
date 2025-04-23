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
  dob?: string; // YYYY-MM-DD format
  gender: string; // 'M' or 'F'
  sessions?: ClientSession[];
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
  dob?: string; // YYYY-MM-DD format
  gender: string; // 'M' or 'F'
  session_ids?: number[]; // Optional session IDs for initial session assignments
  sessions?: Array<{ // For dropdown selection
    label: string;
    value: string;
  }>;
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
  session_ids?: number[];
}