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
  sessions?: any[];
  location?: string;
  dob?: string; // YYYY-MM-DD format
  gender: string; // 'M' or 'F'
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
  sessions?: any[];
  location: string;
  dob?: string; // YYYY-MM-DD format
  gender: string; // 'M' or 'F'
  session_id?: number; // Optional session ID for initial session assignment
  session?: { // For dropdown selection
    label: string;
    value: string;
  };
}
