export interface PolicyUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface Policy {
  id: number;
  title: string;
  content: string;
  last_modified: string;
  modified_by: PolicyUser | null;
  sessions_count: number;
}
