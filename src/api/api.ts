import { api } from "../lib/axios";
import axios from "axios";

import { CreateSessionData, Session } from "../types/sessionTypes";
import { CreateLocationData } from "../types/location";

const BASE_URL = import.meta.env.VITE_APP_BASEURL;

const GOOGLE_API_KEY = import.meta.env.VITE_APP_GOOGLE_API_KEY;

const END_POINTS = {
  AUTH: {
    REGISTER: `${BASE_URL}/api/auth/register/`,
    LOGIN: `${BASE_URL}/api/auth/login/`,
    REFRESH: `${BASE_URL}/api/auth/refresh/`,
    STAFF_PASSWORD: `${BASE_URL}/api/auth/set-password/`,
  },
  USER: {
    PROFILE: `${BASE_URL}/api/auth/profile/`,
  },
  PROFILE: {
    BUSINESS_PROFILE: `${BASE_URL}/api/business/profile/`,
    SERVICES: `${BASE_URL}/api/business/services/`,
    LOCATIONS: `${BASE_URL}/api/business/locations/`,
  },
  CLIENTS: {
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
  STAFF: {
    STAFF_DATA: `${BASE_URL}/api/staff/`,
  },
  SESSION: {
    SESSIONS_DATA: `${BASE_URL}/api/session/`,
    SESSION_DETAIL: (id: string) => `${BASE_URL}/api/session/${id}/`,
    SESSION_CLIENTS: (id: string) => `${BASE_URL}/api/session/${id}/clients/`,
    CATEGORIES: `${BASE_URL}/api/session/categories/`,
    CLASS_SESSIONS: `${BASE_URL}/api/session/?session_type=class`,
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
  GOOGLE: {
    PLACES_AUTOCOMPLETE: `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
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
  password: string;
  new_password: string;
}) => {
  const { data } = await axios.post(
    END_POINTS.AUTH.STAFF_PASSWORD,
    credentials
  );
  return data;
};

const get_user_profile = async () => {
  const { data } = await api.get(END_POINTS.USER.PROFILE);
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
  return data.predictions.map((prediction: any) => ({
    label: prediction.description,
    value: prediction.place_id,
  }));
};

const get_business_services = async () => {
  const { data } = await api.get(END_POINTS.PROFILE.SERVICES);
  return data;
};

const get_clients = async () => {
  const { data } = await api.get(END_POINTS.CLIENTS.CLIENTS_DATA);
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
  permissions: {
    can_create_events: boolean;
    can_add_clients: boolean;
    can_create_invoices: boolean;
  };
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

// Define a type for the session filters
interface SessionFilters {
  sessionTypes?: string[];
  categories?: string[];
  dateRange?: [Date | null, Date | null];
}

const get_sessions = async (filters?: SessionFilters): Promise<Session[]> => {
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

  const { data } = await api.get<Session[]>(url);
  return data;
};

const get_class_sessions = async () => {
  const { data } = await api.get(END_POINTS.SESSION.CLASS_SESSIONS);
  return data;
};

const get_session_detail = async (id: string) => {
  const { data } = await api.get(END_POINTS.SESSION.SESSION_DETAIL(id));
  return data;
};

const get_session_categories = async () => {
  const { data } = await api.get(END_POINTS.SESSION.CATEGORIES);
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
  console.log("Attendance status update response:", data);
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

export {
  END_POINTS,
  registerUser,
  loginUser,
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
  get_analytics,
  get_upcoming_sessions,
  cancel_session,
  reschedule_session,
  get_sessions,
  get_session_detail,
  get_session_categories,
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
};
