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
  timestamp: string;
}

export interface Session {
  id: number;
  title: string;
  session_type: 'class' | 'appointment';
  class_type: 'private' | 'regular' | 'workshop';
  staff: number;
  assigned_staff?: Staff;
  date: string;
  start_time: string;
  end_time: string;
  spots: number;
  category: Category;
  attendances?: Attendance[];
  
  // Repetition fields
  repeat_every?: number;
  repeat_unit?: 'days' | 'weeks' | 'months';
  repeat_on?: string[];
  repeat_end_type: 'never' | 'on' | 'after';
  repeat_end_date?: string;
  repeat_occurrences?: number;
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
