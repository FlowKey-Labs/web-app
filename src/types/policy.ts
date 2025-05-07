export interface PolicyUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export type PolicyType = 'TEXT' | 'PDF';

export interface Policy {
  id: number;
  title: string;
  content?: string;
  file_url: string | null;  
  policy_type: PolicyType;  
  last_modified: string;
  modified_by: PolicyUser | null;
  sessions_count: number;
  file?: File | null;       
}