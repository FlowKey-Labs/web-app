import { api } from "../lib/axios";
import axios from "axios";

import {
  CreateSessionData,
  AttendedSession,
  CancelledSession,
  ProgressFeedback,
  Session,
  MakeUpSession,
} from "../types/sessionTypes";
import { CreateLocationData } from "../types/location";
import { Role } from "../store/auth";
import { Client } from "../types/clientTypes";
import { BookingRequest } from '../types/clientTypes';
import { BookingSettings } from '../types/bookingTypes';

// Define a type for the session filters
interface SessionFilters {
  sessionTypes?: string[];
  categories?: string[];
  dateRange?: [Date | null, Date | null];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number | undefined;
  pageSize: number | undefined;
  totalPages: number | undefined;
}

const BASE_URL = import.meta.env.VITE_APP_BASEURL;

const GOOGLE_API_KEY = import.meta.env.VITE_APP_GOOGLE_API_KEY;

const END_POINTS = {
  AUTH: {
    REGISTER: `${BASE_URL}/api/auth/register/`,
    LOGIN: `${BASE_URL}/api/auth/login/`,
    REFRESH: `${BASE_URL}/api/auth/refresh/`,
    STAFF_PASSWORD: `${BASE_URL}/api/auth/set-password/`,
    PASSWORD_RESET_REQUEST: `${BASE_URL}/api/auth/password-reset/`,
    RESET_PASSWORD: `${BASE_URL}/api/auth/reset-password/`,
  },
  USER: {
    PROFILE: `${BASE_URL}/api/auth/profile/`,
    PROFILE_UPDATE: `${BASE_URL}/api/auth/profile/update/`,
  },
  PROFILE: {
    BUSINESS_PROFILE: `${BASE_URL}/api/business/profile/`,
    SERVICES: `${BASE_URL}/api/business/services/`,
    LOCATIONS: `${BASE_URL}/api/business/locations/`,
    AVAILABILITY: `${BASE_URL}/api/business/availability/`,
  },
  CLIENTS: {
    CLIENTS_DATA_LIST: (pageIndex?: number, pageSize?: number) =>
      pageIndex
        ? `${BASE_URL}/api/client/?pageIndex=${pageIndex}&pageSize=${pageSize}`
        : `${BASE_URL}/api/client/`,
    CLIENTS_DATA: `${BASE_URL}/api/client/`,
    ATTENDANCE: `${BASE_URL}/api/client/attendance/manage/`,
    GROUPS: `${BASE_URL}/api/client/groups/`,
    GROUP_DETAIL: (id: string) => `${BASE_URL}/api/client/groups/${id}/`,
    GROUP_MEMBERS: (id: string) =>
      `${BASE_URL}/api/client/groups/${id}/members/`,
    ADD_MEMBER: (id: string) =>
      `${BASE_URL}/api/client/groups/${id}/add_member/`,
    REMOVE_MEMBER: (id: string) =>
      `${BASE_URL}/api/client/groups/${id}/remove_member/`,
  },
  BOOKING: {
    SETTINGS: `${BASE_URL}/api/booking/settings/`,
    BOOKING_REQUESTS: (pageIndex?: number, pageSize?: number) =>
      pageIndex
        ? `${BASE_URL}/api/booking/manage/?page=${pageIndex}&page_size=${pageSize}`
        : `${BASE_URL}/api/booking/manage/`,
    APPROVE_REQUEST: (requestId: number) =>
      `${BASE_URL}/api/booking/manage/${requestId}/`,
    REJECT_REQUEST: (requestId: number) =>
      `${BASE_URL}/api/booking/manage/${requestId}/`,
    CONVERT_TO_REGULAR: (clientId: number) =>
      `${BASE_URL}/api/booking/clients/${clientId}/convert-to-regular/`,
    CONVERT_TO_BOOKING: (clientId: number) =>
      `${BASE_URL}/api/booking/clients/${clientId}/convert-to-booking/`,
    PROGRESS_FEEDBACK: (clientId: string, subcategoryId: string) =>
      `${BASE_URL}/api/booking/progress-feedback/?client_id=${clientId}&subcategory_id=${subcategoryId}`,
    NOTIFICATIONS: `${BASE_URL}/api/booking/notifications/`,
    MARK_ALL_READ: `${BASE_URL}/api/booking/notifications/mark_all_read/`,
    AUDIT_LOGS: `${BASE_URL}/api/booking/audit-logs/`,
  },
  STAFF: {
    STAFF_DATA: `${BASE_URL}/api/staff/`,
  },
  SESSION: {
    SESSIONS_DATA: `${BASE_URL}/api/session/`,
    CALENDAR_SESSIONS_DATA: `${BASE_URL}/api/session/calendar-sessions/`,
    SESSION_DETAIL: (id: string) => `${BASE_URL}/api/session/${id}/`,
    SESSION_CLIENTS: (id: string) => `${BASE_URL}/api/session/${id}/clients/`,
    CATEGORIES: `${BASE_URL}/api/session/categories/`,
    CLASS_SESSIONS: `${BASE_URL}/api/session/?session_type=class`,
    STAFF_SESSIONS: (id: string) => `${BASE_URL}/api/staff/sessions/${id}`,
    SUBCATEGORIES: `${BASE_URL}/api/session/subcategories/`,
    SUBSKILLS: `${BASE_URL}/api/session/subskills/`,
    MAKEUP_SESSIONS: `${BASE_URL}/api/session/makeup-sessions/`,
    ATTENDED_SESSIONS: `${BASE_URL}/api/attendance/`,
    CANCELLED_SESSIONS: `${BASE_URL}/api/attendance/cancelled/`,
  },
  ANALYTICS: {
    ANALYTICS_DATA: `${BASE_URL}/api/dashboard/analytics/`,
    UPCOMING_SESSIONS: `${BASE_URL}/api/dashboard/upcoming-sessions/`,
    SESSION_ANALYTICS: (id: string) =>
      `${BASE_URL}/api/dashboard/sessions/analytics/${id}/`,
    CLIENT_ANALYTICS: (id: string) =>
      `${BASE_URL}/api/dashboard/clients/analytics/${id}/`,
    CANCEL_SESSION: (id: string) =>
      `${BASE_URL}/api/dashboard/upcoming-sessions/${id}/`,
  },
  POLICY: {
    POLICIES: `${BASE_URL}/api/policy/policies/`,
    POLICY_DETAIL: (id: number) => `${BASE_URL}/api/policy/policies/${id}/`,
  },
  ROLE: {
    ROLES: `${BASE_URL}/api/auth/roles/`,
    ROLE_DETAIL: (id: string) => `${BASE_URL}/api/auth/roles/${id}/`,
  },
  GOOGLE: {
    PLACES_AUTOCOMPLETE: `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
  },
  PROGRESS: {
    SERIES: `${BASE_URL}/api/progress/series`,
    OUTCOMES: (client_id: string) =>
      `${BASE_URL}/api/progress/outcomes?client_id=` + client_id,
    CLIENT_PROGRESS: (clientId: string) =>
      `${BASE_URL}/api/progress/${clientId}/`,
    MARK_OUTCOME_COMPLETED: `${BASE_URL}/api/progress/mark/`,
    MARK_OUTCOME_INCOMPLETE: `${BASE_URL}/api/progress/unmark/`,
    FEEDBACK: `${BASE_URL}/api/progress/feedback/`,
    LEVEL_FEEDBACK: (client_id: string, subcategory_id: string) =>
      `${BASE_URL}/api/progress/get-feedback/?client_id=` +
      client_id +
      `&subcategory_id=` +
      subcategory_id,
  },
};

const registerUser = async (credentials: {
  first_name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  password: string;
  confirm_password: string;
}) => {
  const { data } = await axios.post(END_POINTS.AUTH.REGISTER, credentials);
  return data;
};

const loginUser = async (credentials: { email: string; password: string }) => {
  const { data } = await axios.post(END_POINTS.AUTH.LOGIN, credentials);
  return data;
};

const setStaffPassword = async (credentials: {
  uid: string;
  token: string;
  email: string;
  first_name: string;
  last_name: string;
  mobile_number: string;
  password: string;
  new_password: string;
}) => {
  const { data } = await axios.post(
    END_POINTS.AUTH.STAFF_PASSWORD,
    credentials
  );
  return data;
};

const passwordResetRequest = async (credentials: { email: string }) => {
  const { data } = await axios.post(
    END_POINTS.AUTH.PASSWORD_RESET_REQUEST,
    credentials
  );
  return data;
};

const resetPassword = async (credentials: {
  uid: string;
  token: string;
  email: string;
  new_password: string;
}) => {
  const { data } = await axios.post(
    END_POINTS.AUTH.RESET_PASSWORD,
    credentials
  );
  return data;
};

const get_user_profile = async () => {
  const { data } = await api.get(END_POINTS.USER.PROFILE);
  return data;
};

const update_user_profile = async (updateData: {
  timezone?: string;
  first_name?: string;
  last_name?: string;
  mobile_number?: string;
  email?: string;
}) => {
  const { data } = await api.patch(END_POINTS.USER.PROFILE, updateData);
  return data;
};

const business_profile = async (profileData: {
  business_type: string;
  team_size: number;
  monthly_clients: string;
  reason_for_using: string;
}) => {
  const { data } = await api.post(
    END_POINTS.PROFILE.BUSINESS_PROFILE,
    profileData
  );
  return data;
};

const get_business_profile = async () => {
  const { data } = await api.get(END_POINTS.PROFILE.BUSINESS_PROFILE);
  return data;
};

const update_business_profile = async (
  id: string,
  updateData: {
    business_name?: string;
    contact_person?: string;
    contact_email?: string;
    contact_phone?: string;
    address?: string;
    about?: string;
    timezone?: string;
  }
) => {
  const { data } = await api.patch(
    `${END_POINTS.PROFILE.BUSINESS_PROFILE}${id}/`,
    updateData
  );
  return data;
};

const searchCities = async (query: string) => {
  const { data } = await axios.get(END_POINTS.GOOGLE.PLACES_AUTOCOMPLETE, {
    params: {
      input: query,
      types: "(cities)",
      key: GOOGLE_API_KEY,
    },
  });
  return data.predictions.map((prediction: { description: string; place_id: string }) => ({
    label: prediction.description,
    value: prediction.place_id,
  }));
};

const get_business_services = async () => {
  const { data } = await api.get(END_POINTS.PROFILE.SERVICES);
  return data;
};

const get_clients = async (
  pageIndex?: number,
  pageSize?: number,
  searchQuery?: string
): Promise<PaginatedResponse<Client>> => {
  let url = END_POINTS.CLIENTS.CLIENTS_DATA_LIST(pageIndex, pageSize);
  
  // Add search query if provided
  if (searchQuery && searchQuery.trim()) {
    const separator = url.includes('?') ? '&' : '?';
    url += `${separator}search=${encodeURIComponent(searchQuery.trim())}`;
  }
  
  const { data } = await api.get<PaginatedResponse<Client>>(url);
  return data;
};

const get_client = async (id: string) => {
  const { data } = await api.get(`${END_POINTS.CLIENTS.CLIENTS_DATA}${id}/`);
  return data;
};

const add_client = async (clientData: {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  location: string;
  dob?: string;
  gender: string;
  group_id?: number | null;
  session_ids?: number[];
}) => {
  const { data } = await api.post(END_POINTS.CLIENTS.CLIENTS_DATA, clientData);
  return data;
};

const get_staff = async () => {
  const { data } = await api.get(END_POINTS.STAFF.STAFF_DATA);
  return data;
};

const get_staff_member = async (id: string) => {
  const { data } = await api.get(`${END_POINTS.STAFF.STAFF_DATA}${id}/`);
  return data;
};

const update_staff_member = async (
  id: string,
  updateStaffData: {
    first_name: string;
    last_name: string;
    phone_number: string;
    role: string;
    permissions: {
      create_events: boolean;
      add_clients: boolean;
      create_invoices: boolean;
    };
  }
) => {
  const { data } = await api.patch(
    `${END_POINTS.STAFF.STAFF_DATA}${id}/`,
    updateStaffData
  );
  return data;
};

const deactivate_staff = async (id: string) => {
  const { data } = await api.patch(`${END_POINTS.STAFF.STAFF_DATA}${id}/`, {
    isActive: false,
  });
  return data;
};

const activate_staff = async (id: string) => {
  const { data } = await api.patch(`${END_POINTS.STAFF.STAFF_DATA}${id}/`, {
    isActive: true,
  });
  return data;
};

const create_staff = async (staffData: {
  email: string;
  member_id?: string;
  role: string;
  pay_type: string;
  rate: string;
}) => {
  const { data } = await api.post(END_POINTS.STAFF.STAFF_DATA, staffData);
  return data;
};

const get_analytics = async (filterOption?: string) => {
  const params = filterOption ? { filter: filterOption } : {};
  const { data } = await api.get(END_POINTS.ANALYTICS.ANALYTICS_DATA, {
    params,
  });
  return data;
};

const get_session_analytics = async (sessionId: string) => {
  const { data } = await api.get(
    END_POINTS.ANALYTICS.SESSION_ANALYTICS(sessionId)
  );
  return data;
};

const get_client_analytics = async (clientId: string) => {
  const { data } = await api.get(
    END_POINTS.ANALYTICS.CLIENT_ANALYTICS(clientId)
  );
  return data;
};

const get_upcoming_sessions = async () => {
  const { data } = await api.get(END_POINTS.ANALYTICS.UPCOMING_SESSIONS);
  return data;
};

const cancel_session = async (sessionId: string) => {
  const { data } = await api.delete(
    END_POINTS.ANALYTICS.CANCEL_SESSION(sessionId)
  );
  return data;
};

const reschedule_session = async (
  sessionId: string,
  newDateTime: { date: string; startTime: string; endTime: string }
) => {
  const { data } = await api.put(
    END_POINTS.ANALYTICS.SESSION_ANALYTICS(sessionId),
    newDateTime
  );
  return data;
};

const get_calendar_sessions = async () => {
  const { data } = await api.get(END_POINTS.SESSION.CALENDAR_SESSIONS_DATA);
  return data;
};

const get_sessions = async (
  filters?: SessionFilters,
  pageIndex?: number,
  pageSize?: number
): Promise<PaginatedResponse<Session>> => {
  let url = END_POINTS.SESSION.SESSIONS_DATA;

  if (filters) {
    const params = new URLSearchParams();

    if (filters.sessionTypes && filters.sessionTypes.length > 0) {
      filters.sessionTypes.forEach((type: string) => {
        params.append("session_type", type);
      });
    }

    if (filters.categories && filters.categories.length > 0) {
      filters.categories.forEach((category: string) => {
        params.append("category", category);
      });
    }

    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
      const startDate = new Date(filters.dateRange[0]);
      const endDate = new Date(filters.dateRange[1]);
      params.append("start_date", startDate.toISOString().split("T")[0]);
      params.append("end_date", endDate.toISOString().split("T")[0]);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }

  console.log(`Page Index: ${pageIndex}, Page Size: ${pageSize}`);
  if (pageIndex !== undefined) {
    url += `?pageIndex=` + `${pageIndex}` + `&pageSize=` + `${pageSize}`;
  }

  const { data } = await api.get<PaginatedResponse<Session>>(url);
  return data;
};

const get_class_sessions = async () => {
  const { data } = await api.get(END_POINTS.SESSION.CLASS_SESSIONS);
  return data;
};

const get_staff_sessions = async (id: string) => {
  const { data } = await api.get(END_POINTS.SESSION.STAFF_SESSIONS(id));
  return data.sessions || [];
};

const get_session_detail = async (id: string) => {
  const { data } = await api.get(END_POINTS.SESSION.SESSION_DETAIL(id));
  return data;
};

const get_session_categories = async () => {
  const { data } = await api.get(END_POINTS.SESSION.CATEGORIES);
  return data;
};

const create_session_category = async (categoryData: {
  name: string;
  description?: string;
}) => {
  const { data } = await api.post(END_POINTS.SESSION.CATEGORIES, categoryData);
  return data;
};

const update_session_category = async (
  id: number,
  categoryData: { name: string; description?: string }
) => {
  const { data } = await api.patch(
    `${END_POINTS.SESSION.CATEGORIES}${id}/`,
    categoryData
  );
  return data;
};

const delete_session_category = async (id: number) => {
  const { data } = await api.delete(`${END_POINTS.SESSION.CATEGORIES}${id}/`);
  return data;
};

const create_session_subcategory = async (subcategoryData: {
  name: string;
  description?: string;
  category: number;
}) => {
  const { data } = await api.post(
    END_POINTS.SESSION.SUBCATEGORIES,
    subcategoryData
  );
  return data;
};

const get_session_subcategories = async () => {
  const { data } = await api.get(END_POINTS.SESSION.SUBCATEGORIES);
  return data;
};

const update_session_subcategory = async (
  id: number,
  subcategoryData: { name: string; description?: string; category: number }
) => {
  const { data } = await api.patch(
    `${END_POINTS.SESSION.SUBCATEGORIES}${id}/`,
    subcategoryData
  );
  return data;
};

const delete_session_subcategory = async (id: number) => {
  const { data } = await api.delete(
    `${END_POINTS.SESSION.SUBCATEGORIES}${id}/`
  );
  return data;
};

const create_session_skill = async (skillData: {
  name: string;
  description?: string;
  subcategory: number;
}) => {
  const { data } = await api.post(END_POINTS.SESSION.SUBSKILLS, skillData);
  return data;
};

const get_session_skills = async () => {
  const { data } = await api.get(END_POINTS.SESSION.SUBSKILLS);
  return data;
};

const update_session_skill = async (
  id: number,
  skillData: { name: string; description?: string; subcategory: number }
) => {
  const { data } = await api.patch(
    `${END_POINTS.SESSION.SUBSKILLS}${id}/`,
    skillData
  );
  return data;
};

const delete_session_skill = async (id: number) => {
  const { data } = await api.delete(`${END_POINTS.SESSION.SUBSKILLS}${id}/`);
  return data;
};

const create_session = async (sessionData: CreateSessionData) => {
  const { data } = await api.post(
    END_POINTS.SESSION.SESSIONS_DATA,
    sessionData
  );
  return data;
};

const mark_client_attended = async (clientId: string, sessionId: string) => {
  const { data } = await api.post(END_POINTS.CLIENTS.ATTENDANCE, {
    client: clientId,
    session: sessionId,
    attended: true,
    status: "attended",
  });
  return data;
};

const mark_client_not_attended = async (
  clientId: string,
  sessionId: string
) => {
  const { data } = await api.post(END_POINTS.CLIENTS.ATTENDANCE, {
    client: clientId,
    session: sessionId,
    attended: false,
    status: "missed",
  });
  return data;
};

const update_attendance_status = async (
  clientId: string,
  sessionId: string,
  status: string
) => {
  const { data } = await api.post(
    `${END_POINTS.CLIENTS.ATTENDANCE}update_status/`,
    {
      client: clientId,
      session: sessionId,
      status: status,
    }
  );
  return data;
};

const activate_session = async (sessionId: string) => {
  const { data } = await api.patch(
    END_POINTS.SESSION.SESSION_DETAIL(sessionId),
    {
      is_active: true,
    }
  );
  return data;
};

const deactivate_session = async (sessionId: string) => {
  const { data } = await api.patch(
    END_POINTS.SESSION.SESSION_DETAIL(sessionId),
    {
      is_active: false,
    }
  );
  return data;
};

const update_client = async (
  id: string,
  updateData: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    location?: string;
    dob?: string;
    gender?: string;
    session_ids?: number[];
  }
) => {
  const { data } = await api.patch(
    `${END_POINTS.CLIENTS.CLIENTS_DATA}${id}/`,
    updateData
  );
  return data;
};

const deactivate_client = async (id: string) => {
  const { data } = await api.patch(`${END_POINTS.CLIENTS.CLIENTS_DATA}${id}/`, {
    active: false,
  });
  return data;
};

const activate_client = async (id: string) => {
  const { data } = await api.patch(`${END_POINTS.CLIENTS.CLIENTS_DATA}${id}/`, {
    active: true,
  });
  return data;
};

const update_session = async (
  id: string,
  sessionData: Partial<CreateSessionData>
) => {
  const { data } = await api.patch(
    END_POINTS.SESSION.SESSION_DETAIL(id),
    sessionData
  );
  return data;
};

const get_session_clients = async (sessionId: string) => {
  const { data } = await api.get(END_POINTS.SESSION.SESSION_CLIENTS(sessionId));
  return data;
};

const remove_client_from_session = async (
  clientId: string,
  sessionId: string
) => {
  const { data } = await api.delete(
    `${BASE_URL}/api/session/${sessionId}/clients/${clientId}/`
  );
  return data;
};

const get_places_autocomplete = async (input: string) => {
  const { data } = await axios.get(END_POINTS.GOOGLE.PLACES_AUTOCOMPLETE, {
    params: {
      input,
      key: GOOGLE_API_KEY,
      types: "geocode",
    },
  });
  return data.predictions;
};

// Location API functions
const get_locations = async (): Promise<Location[]> => {
  const { data } = await api.get(END_POINTS.PROFILE.LOCATIONS);
  return data;
};

const get_location = async (id: number): Promise<Location> => {
  const { data } = await api.get(`${END_POINTS.PROFILE.LOCATIONS}${id}/`);
  return data;
};

const create_location = async (
  locationData: CreateLocationData
): Promise<Location> => {
  const { data } = await api.post(END_POINTS.PROFILE.LOCATIONS, locationData);
  return data;
};

const update_location = async (
  id: number,
  locationData: Partial<CreateLocationData>
): Promise<Location> => {
  const { data } = await api.put(
    `${END_POINTS.PROFILE.LOCATIONS}${id}/`,
    locationData
  );
  return data;
};

const delete_location = async (id: number): Promise<void> => {
  await api.delete(`${END_POINTS.PROFILE.LOCATIONS}${id}/`);
};

const set_primary_location = async (id: number): Promise<Location> => {
  const { data } = await api.patch(
    `${END_POINTS.PROFILE.LOCATIONS}${id}/set_primary/`,
    {}
  );
  return data;
};

// Group API functions
const get_groups = async () => {
  try {
    const { data } = await api.get(`${BASE_URL}/api/client/list-groups/`);
    return data;
  } catch (error) {
    console.error("Error fetching groups:", error);
    return [];
  }
};

const get_group = async (id: string) => {
  const { data } = await api.get(END_POINTS.CLIENTS.GROUP_DETAIL(id));
  return data;
};

const add_group = async (groupData: {
  name: string;
  description?: string;
  location?: string;
  active?: boolean;
  client_ids?: number[];
  session_ids?: number[];
  contact_person_id?: number;
}) => {
  const { data } = await api.post(
    `${BASE_URL}/api/client/create-group/`,
    groupData
  );
  return data;
};

const update_group = async (
  id: string,
  updateData: {
    name?: string;
    description?: string;
    size?: number;
    location?: string;
    active?: boolean;
  }
) => {
  const { data } = await api.patch(
    END_POINTS.CLIENTS.GROUP_DETAIL(id),
    updateData
  );
  return data;
};

const get_group_members = async (groupId: string) => {
  const { data } = await api.get(END_POINTS.CLIENTS.GROUP_MEMBERS(groupId));
  return data;
};

const add_member_to_group = async (groupId: string, clientId: string) => {
  const { data } = await api.post(END_POINTS.CLIENTS.ADD_MEMBER(groupId), {
    client_id: clientId,
  });
  return data;
};

const remove_member_from_group = async (groupId: string, clientId: string) => {
  const { data } = await api.post(END_POINTS.CLIENTS.REMOVE_MEMBER(groupId), {
    client_id: clientId,
  });
  return data;
};

// Policy API functions

const getPolicies = async () => {
  const { data } = await api.get(END_POINTS.POLICY.POLICIES);
  return data;
};

const createPolicy = async (policyData: {
  title: string;
  content: string;
  policy_type: string;
  file?: File;
}) => {
  const formData = new FormData();
  formData.append("title", policyData.title);
  formData.append("content", policyData.content);
  formData.append("policy_type", policyData.policy_type);

  if (policyData.file) {
    formData.append("file", policyData.file);
  }

  const { data } = await api.post(END_POINTS.POLICY.POLICIES, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

const updatePolicy = async (
  id: number,
  policyData: {
    title?: string;
    content?: string;
    policy_type?: string;
    file?: File;
  }
) => {
  const formData = new FormData();

  if (policyData.title) formData.append("title", policyData.title);
  if (policyData.content) formData.append("content", policyData.content);
  if (policyData.policy_type)
    formData.append("policy_type", policyData.policy_type);

  if (policyData.file) {
    formData.append("file", policyData.file);
  }

  const { data } = await api.patch(
    END_POINTS.POLICY.POLICY_DETAIL(id),
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
};

const deletePolicy = async (id: number) => {
  const { data } = await api.delete(END_POINTS.POLICY.POLICY_DETAIL(id));
  return data;
};

// Roles API functions

const getRoles = async () => {
  const { data } = await api.get(END_POINTS.ROLE.ROLES);
  return data;
};

const createRole = async (roleData: Role) => {
  const { data } = await api.post(END_POINTS.ROLE.ROLES, roleData);
  return data;
};

const updateRole = async (id: string, roleData: Omit<Role, "id">) => {
  const { data } = await api.patch(END_POINTS.ROLE.ROLE_DETAIL(id), roleData);
  return data;
};

const deleteRole = async (id: string) => {
  const { data } = await api.delete(END_POINTS.ROLE.ROLE_DETAIL(id));
  return data;
};

// Make up session API functions

const getMakeupSessions = async () => {
  const { data } = await api.get(END_POINTS.SESSION.MAKEUP_SESSIONS);
  return data;
};

const createMakeupSession = async (makeupSessionData: MakeUpSession) => {
  const { data } = await api.post(
    END_POINTS.SESSION.MAKEUP_SESSIONS,
    makeupSessionData
  );
  return data;
};

const updateMakeupSession = async (
  id: string,
  makeupSessionData: MakeUpSession
) => {
  const { data } = await api.patch(
    `${END_POINTS.SESSION.MAKEUP_SESSIONS}${id}/`,
    makeupSessionData
  );
  return data;
};

const deleteMakeupSession = async (id: string) => {
  const { data } = await api.delete(
    `${END_POINTS.SESSION.MAKEUP_SESSIONS}${id}/`
  );
  return data;
};

const getAttendedSessions = async () => {
  const { data } = await api.get(END_POINTS.SESSION.ATTENDED_SESSIONS);
  return data;
};

const createAttendedSession = async (attendedSessionData: AttendedSession) => {
  const { data } = await api.post(
    END_POINTS.SESSION.ATTENDED_SESSIONS,
    attendedSessionData
  );
  return data;
};

// Progress tracker API functions

const getSeries = async () => {
  const { data } = await api.get(END_POINTS.PROGRESS.SERIES);
  return data;
};

const getClientProgress = async (clientId: string) => {
  const { data } = await api.get(END_POINTS.PROGRESS.CLIENT_PROGRESS(clientId));
  return data;
};

const getOutcomes = async (clientId: string) => {
  const { data } = await api.get(END_POINTS.PROGRESS.OUTCOMES(clientId));
  return data;
};

const markOutcomeComplete = async (payload: {
  client_id: string;
  subskill_id: string;
}) => {
  const { data } = await api.post(
    END_POINTS.PROGRESS.MARK_OUTCOME_COMPLETED,
    payload
  );
  return data;
};

const updateAttendedSession = async (
  id: string,
  attendedSessionData: AttendedSession
) => {
  const { data } = await api.patch(
    `${END_POINTS.SESSION.ATTENDED_SESSIONS}${id}/`,
    attendedSessionData
  );
  return data;
};

const deleteAttendedSession = async (id: string) => {
  const { data } = await api.delete(
    `${END_POINTS.SESSION.ATTENDED_SESSIONS}${id}/`
  );
  return data;
};

const getCancelledSessions = async () => {
  const { data } = await api.get(END_POINTS.SESSION.CANCELLED_SESSIONS);
  return data;
};

const createCancelledSession = async (
  cancelledSessionData: CancelledSession
) => {
  const { data } = await api.post(
    END_POINTS.SESSION.CANCELLED_SESSIONS,
    cancelledSessionData
  );
  return data;
};

const markOutcomeIncomplete = async (payload: {
  client_id: string;
  subskill_id: string;
}) => {
  const { data } = await api.post(
    END_POINTS.PROGRESS.MARK_OUTCOME_INCOMPLETE,
    payload
  );
  return data;
};

const updateCancelledSession = async (
  id: string,
  cancelledSessionData: CancelledSession
) => {
  const { data } = await api.patch(
    `${END_POINTS.SESSION.CANCELLED_SESSIONS}${id}/`,
    cancelledSessionData
  );
  return data;
};

const deleteCancelledSession = async (id: string) => {
  const { data } = await api.delete(
    `${END_POINTS.SESSION.CANCELLED_SESSIONS}${id}/`
  );
  return data;
};

const submitProgressFeedback = async (payload: ProgressFeedback) => {
  const formData = new FormData();
  formData.append("client_id", payload.client_id);
  formData.append("subcategory_id", payload.subcategory_id);
  formData.append("feedback", payload.feedback);
  formData.append("attachment", payload.attachment);
  const { data } = await api.post(END_POINTS.PROGRESS.FEEDBACK, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

const getLevelFeedback = async (clientId: string, subcategory_id: string) => {
  const { data } = await api.get(
    END_POINTS.PROGRESS.LEVEL_FEEDBACK(clientId, subcategory_id)
  );
  return data;
};

// Booking Requests API Functions
const get_booking_requests = async (
  pageIndex?: number,
  pageSize?: number,
  searchQuery?: string
): Promise<PaginatedResponse<BookingRequest>> => {
  let url = END_POINTS.BOOKING.BOOKING_REQUESTS(pageIndex, pageSize);
  
  // Add search query if provided
  if (searchQuery && searchQuery.trim()) {
    const separator = url.includes('?') ? '&' : '?';
    url += `${separator}search=${encodeURIComponent(searchQuery.trim())}`;
  }
  
  const { data } = await api.get(url);
  // The backend returns { bookings: [...], total_count: N }
  return {
    items: data.bookings || [],
    total: data.total_count || 0,
    page: pageIndex,
    pageSize: pageSize,
    totalPages: pageSize ? Math.ceil((data.total_count || 0) / pageSize) : undefined,
  };
};

const approve_booking_request = async (requestId: number) => {
  const { data } = await api.patch(END_POINTS.BOOKING.APPROVE_REQUEST(requestId), {
    action: 'approve'
  });
  return data;
};

const reject_booking_request = async (requestId: number, reason?: string) => {
  const { data } = await api.patch(END_POINTS.BOOKING.REJECT_REQUEST(requestId), {
    action: 'reject',
    reason: reason || ''
  });
  return data;
};

const convert_client_to_regular = async (clientId: number) => {
  const { data } = await api.post(END_POINTS.BOOKING.CONVERT_TO_REGULAR(clientId));
  return data;
};

const convert_client_to_booking = async (clientId: number) => {
  const { data } = await api.post(END_POINTS.BOOKING.CONVERT_TO_BOOKING(clientId));
  return data;
};

const get_progress_feedback = async (clientId: string, subcategoryId: string) => {
  const { data } = await api.get(END_POINTS.BOOKING.PROGRESS_FEEDBACK(clientId, subcategoryId));
  return data;
};

const cancel_booking_request = async (requestId: number, reason?: string) => {
  const { data } = await api.patch(END_POINTS.BOOKING.APPROVE_REQUEST(requestId), {
    action: 'cancel',
    reason: reason || ''
  });
  return data;
};

// Updated interfaces for exceptions
interface Exception {
  date: string;
  reason?: string;
  isAllDay: boolean;
  timeSlots?: Array<{ start: string; end: string }>;
}

// Availability API Functions
const get_availability = async () => {
  try {
    const { data } = await api.get(END_POINTS.PROFILE.AVAILABILITY);
    return data;
  } catch (error) {
    // Handle 404 gracefully - user might not have availability setup yet
    if ((error as { response?: { status?: number } })?.response?.status === 404) {
      console.log('No availability found for user, returning null');
      return null;
    }
    throw error;
  }
};

const create_availability = async (availabilityData: {
  schedule?: Record<string, {
    isOpen: boolean;
    shifts: Array<{ start: string; end: string }>;
  }>;
  working_hours?: Record<string, Array<{ start: string; end: string }>>;
  open_days?: string[];
  exceptions?: Exception[];
  appointment_duration?: number;
}) => {
  const { data } = await api.post(END_POINTS.PROFILE.AVAILABILITY, availabilityData);
  return data;
};

const update_availability = async (availabilityData: {
  schedule?: Record<string, {
    isOpen: boolean;
    shifts: Array<{ start: string; end: string }>;
  }>;
  working_hours?: Record<string, Array<{ start: string; end: string }>>;
  open_days?: string[];
  exceptions?: Exception[];
  appointment_duration?: number;
}) => {
  const { data } = await api.put(END_POINTS.PROFILE.AVAILABILITY, availabilityData);
  return data;
};

const partial_update_availability = async (availabilityData: {
  schedule?: Record<string, {
    isOpen: boolean;
    shifts: Array<{ start: string; end: string }>;
  }>;
  working_hours?: Record<string, Array<{ start: string; end: string }>>;
  open_days?: string[];
  exceptions?: Exception[];
  appointment_duration?: number;
}) => {
  console.log('🌐 partial_update_availability called with data:', availabilityData);
  console.log('🌐 Exceptions in API request:', availabilityData.exceptions);
  
  try {
    const { data } = await api.patch(END_POINTS.PROFILE.AVAILABILITY, availabilityData);
    console.log('🌐 partial_update_availability response:', data);
    console.log('🌐 Exceptions in API response:', data.exceptions);
    return data;
  } catch (error) {
    console.error('🌐 partial_update_availability error:', error);
    console.error('🌐 Error response:', (error as { response?: { data?: unknown } })?.response?.data);
    throw error;
  }
};

// Mark all notifications as read
const mark_all_notifications_as_read = async () => {
  const { data } = await api.post(END_POINTS.BOOKING.MARK_ALL_READ);
  return data;
};

// Booking Settings API Functions
const get_booking_settings = async () => {
  const { data } = await api.get(END_POINTS.BOOKING.SETTINGS);
  return data;
};

const update_booking_settings = async (settingsData: Partial<BookingSettings>) => {
  const { data } = await api.patch(END_POINTS.BOOKING.SETTINGS, settingsData);
  return data;
};

// Booking Notifications API Functions
const get_booking_notifications = async () => {
  const { data } = await api.get(END_POINTS.BOOKING.NOTIFICATIONS);
  return data;
};

const mark_notification_as_read = async (notificationId: number) => {
  const { data } = await api.patch(`${END_POINTS.BOOKING.NOTIFICATIONS}${notificationId}/`, {
    is_read: true
  });
  return data;
};

// Booking Audit Logs API Functions
const get_booking_audit_logs = async () => {
  const { data } = await api.get(END_POINTS.BOOKING.AUDIT_LOGS);
  return data;
};

// ========================================
// PUBLIC BOOKING API ENDPOINTS
// ========================================

// Public business information for booking page
const get_public_business_info = async (businessSlug: string) => {
  const { data } = await api.get(`/api/booking/${businessSlug}/info/`);
  return data;
};

// Public business services/categories
const get_public_business_services = async (businessSlug: string) => {
  const { data } = await api.get(`/api/booking/${businessSlug}/services/`);
  return data;
};

// Get availability slots for a service on a specific date
const getAvailableSlots = async (
  businessSlug: string,
  serviceId: string,
  date: string
) => {
  const { data } = await api.get(`/api/booking/${businessSlug}/availability/`, {
    params: {
      category_id: serviceId,
      start_date: date,
      end_date: date,
    },
  });
  return data;
};

// Get availability slots for a service
const get_public_availability = async (
  businessSlug: string,
  categoryId: number | null,
  startDate: string,
  endDate: string
) => {
  console.log('🌐 DEBUG: get_public_availability API function called with:', {
    businessSlug,
    categoryId,
    startDate,
    endDate
  });

  const params: { start_date: string; end_date: string; category_id?: number } = {
    start_date: startDate,
    end_date: endDate,
  };
  
  // Only add category_id if it's not null
  if (categoryId !== null && categoryId > 0) {
    params.category_id = categoryId;
  }

  console.log('🔧 DEBUG: API request params being sent:', params);
  console.log('🔗 DEBUG: API endpoint:', `/api/booking/${businessSlug}/availability/`);

  try {
    const { data } = await api.get(`/api/booking/${businessSlug}/availability/`, {
      params,
    });
    
    console.log('📦 DEBUG: Raw API response received:', data);
    console.log('📊 DEBUG: Response slots array:', data?.slots);
    console.log('📈 DEBUG: Response slots count:', data?.slots?.length || 0);
    
    return data;
  } catch (error: unknown) {
    console.error('🚨 DEBUG: API request failed:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { status: number; data: unknown } };
      console.error('🚨 DEBUG: Error response status:', axiosError.response.status);
      console.error('🚨 DEBUG: Error response data:', axiosError.response.data);
    }
    throw error;
  }
};

// Create public booking
const create_public_booking = async (
  businessSlug: string,
  bookingData: {
    session_id: number;
    client_name: string;
    client_email: string;
    client_phone: string;
    notes?: string;
    quantity?: number;
    is_group_booking?: boolean;
    group_booking_notes?: string;
    client_timezone?: string;
    business_timezone?: string;
    selected_staff_id?: number;
    selected_location_id?: number;
  }
) => {
  const { data } = await api.post(`/api/booking/${businessSlug}/book/`, bookingData);
  return data;
};

// Get booking status by reference
const get_booking_status = async (bookingReference: string) => {
  const { data } = await api.get(`/api/booking/status/${bookingReference}/`);
  return data;
};

// Client self-service: Get booking info
const get_client_booking_info = async (bookingReference: string) => {
  const { data } = await api.get(`/api/booking/client/${bookingReference}/`);
  return data;
};

// Client self-service: Cancel booking
const cancel_client_booking = async (
  bookingReference: string,
  reason?: string
) => {
  const { data } = await api.post(`/api/booking/client/${bookingReference}/cancel/`, {
    reason,
  });
  return data;
};

// Client self-service: Get reschedule options
const get_client_reschedule_options = async (
  bookingReference: string,
  dateFrom?: string,
  dateTo?: string,
  filterType?: string
) => {
  const params: Record<string, string> = {};
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;
  if (filterType) params.filter_type = filterType;
  
  const { data } = await api.get(
    `/api/booking/client/${bookingReference}/reschedule-options/`,
    { params }
  );
  return data;
};

// Client self-service: Reschedule booking
const reschedule_client_booking = async (
  bookingReference: string,
  newSessionId: number,
  newDate?: string,
  newStartTime?: string,
  newEndTime?: string,
  identityVerification?: {
    email?: string;
    phone?: string;
  },
  reason?: string
) => {
  const payload: any = {
    new_session_id: newSessionId,
  };
  
  if (newDate) payload.new_date = newDate;
  if (newStartTime) payload.new_start_time = newStartTime;
  if (newEndTime) payload.new_end_time = newEndTime;
  
  if (identityVerification) {
    payload.identity_verification = identityVerification;
  }
  
  if (reason) {
    payload.reason = reason;
  }
  
  const { data } = await api.post(`/api/booking/client/${bookingReference}/reschedule/`, payload);
  return data;
};

// Get available staff for flexible booking
const get_public_available_staff = async (businessSlug: string, params: {
  session_id: number;
  date?: string;
}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });
  
  const { data } = await api.get(`/api/booking/${businessSlug}/available-staff/?${searchParams.toString()}`);
  return data;
};

// Get available locations for flexible booking
const get_public_available_locations = async (businessSlug: string, params: {
  session_id: number;
  staff_id?: number;
  date?: string;
}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });
  
  const { data } = await api.get(`/api/booking/${businessSlug}/available-locations/?${searchParams.toString()}`);
  return data;
};

export {
  END_POINTS,
  registerUser,
  loginUser,
  passwordResetRequest,
  resetPassword,
  business_profile,
  update_business_profile,
  get_business_profile,
  searchCities,
  get_business_services,
  get_locations,
  get_location,
  create_location,
  update_location,
  delete_location,
  set_primary_location,
  get_clients,
  get_client,
  add_client,
  get_staff,
  get_staff_member,
  update_staff_member,
  create_staff,
  create_session,
  get_user_profile,
  update_user_profile,
  get_analytics,
  get_upcoming_sessions,
  cancel_session,
  reschedule_session,
  get_sessions,
  get_staff_sessions,
  get_session_detail,
  get_session_categories,
  create_session_category,
  update_session_category,
  delete_session_category,
  get_session_subcategories,
  create_session_subcategory,
  update_session_subcategory,
  delete_session_subcategory,
  get_session_skills,
  create_session_skill,
  update_session_skill,
  delete_session_skill,
  get_session_analytics,
  get_client_analytics,
  get_class_sessions,
  update_client,
  deactivate_client,
  activate_client,
  update_session,
  get_session_clients,
  mark_client_attended,
  mark_client_not_attended,
  update_attendance_status,
  activate_session,
  deactivate_session,
  remove_client_from_session,
  get_places_autocomplete,
  activate_staff,
  deactivate_staff,
  setStaffPassword,
  // Group exports
  get_groups,
  get_group,
  add_group,
  update_group,
  get_group_members,
  add_member_to_group,
  remove_member_from_group,
  getPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getMakeupSessions,
  createMakeupSession,
  updateMakeupSession,
  deleteMakeupSession,
  // Attended sessions exports
  getAttendedSessions,
  createAttendedSession,
  updateAttendedSession,
  deleteAttendedSession,
  // Cancelled sessions exports
  getCancelledSessions,
  createCancelledSession,
  updateCancelledSession,
  deleteCancelledSession,
  getSeries,
  markOutcomeComplete,
  markOutcomeIncomplete,
  submitProgressFeedback,
  getClientProgress,
  getOutcomes,
  getLevelFeedback,
  get_calendar_sessions,
  // Booking exports
  get_booking_requests,
  approve_booking_request,
  reject_booking_request,
  cancel_booking_request,
  convert_client_to_regular,
  convert_client_to_booking,
  get_progress_feedback,
  // Booking Settings exports
  get_booking_settings,
  update_booking_settings,
  // Booking Notifications exports
  get_booking_notifications,
  mark_notification_as_read,
  // Booking Audit Logs exports
  get_booking_audit_logs,
  // Availability exports
  get_availability,
  create_availability,
  update_availability,
  partial_update_availability,
  mark_all_notifications_as_read,
  // Public Booking exports
  get_public_business_info,
  get_public_business_services,
  getAvailableSlots,
  get_public_availability,
  create_public_booking,
  get_booking_status,
  get_client_booking_info,
  cancel_client_booking,
  get_client_reschedule_options,
  reschedule_client_booking,
  get_public_available_staff,
  get_public_available_locations,
};
