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
  
}

export interface AddClient {
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
  location: string;
  
}
