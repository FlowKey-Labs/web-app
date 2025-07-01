import { api } from '../lib/axios';
import {
  AttendedSession,
  CancelledSession,
  ClassType,
  CreateSessionData,
  MakeUpSession,
  Session,
  SessionFilters,
} from '../types/sessionTypes';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number | undefined;
  pageSize: number | undefined;
  totalPages: number | undefined;
}

const BASE_URL = import.meta.env.VITE_APP_BASEURL;

const END_POINTS = {
  SESSIONS_DATA: `${BASE_URL}/api/session/`,
  CALENDAR_SESSIONS_DATA: `${BASE_URL}/api/session/calendar-sessions/`,
  SESSION_DETAIL: (id: string) => `${BASE_URL}/api/session/${id}/`,
  SESSION_CLIENTS: (id: string) => `${BASE_URL}/api/session/${id}/clients/`,
  CATEGORIES: `${BASE_URL}/api/session/categories/`,
  CLASS_SESSIONS: `${BASE_URL}/api/session/?session_type=class`,
  STAFF_SESSIONS: (id: string) => `${BASE_URL}/api/staff/sessions/${id}/`,
  SUBCATEGORIES: `${BASE_URL}/api/session/subcategories/`,
  SUBSKILLS: `${BASE_URL}/api/session/subskills/`,
  MAKEUP_SESSIONS: `${BASE_URL}/api/attendance/makeup-sessions/`,
  BULK_MAKEUP_SESSIONS: `${BASE_URL}/api/attendance/makeup-sessions/bulk_create_makeup/`,
  ATTENDED_SESSIONS: `${BASE_URL}/api/attendance/`,
  BULK_ATTENDANCE: `${BASE_URL}/api/attendance/bulk_mark_attendance/`,
  CANCELLED_SESSIONS: `${BASE_URL}/api/attendance/cancelled/`,
  BULK_CANCELLED_SESSIONS: `${BASE_URL}/api/attendance/cancelled/bulk_cancel/`,
  CLASS_TYPES: `${BASE_URL}/api/session/class-types/`,
  CLASS_TYPE: (id: string) => `${BASE_URL}/api/session/class-types/${id}/`,
  DELETE_CLASS_TYPE: (id: string) =>
    `${BASE_URL}/api/session/class-types/${id}/`,
  DELETE_SESSION: (id: string) => `${BASE_URL}/api/session/${id}/`,
};

export const get_calendar_sessions = async () => {
  const { data } = await api.get(END_POINTS.CALENDAR_SESSIONS_DATA);
  return data;
};

export const get_sessions = async (
  filters?: SessionFilters,
  pageIndex?: number,
  pageSize?: number,
  searchQuery?: string
): Promise<PaginatedResponse<Session>> => {
  let url = END_POINTS.SESSIONS_DATA;
  const params = new URLSearchParams();

  // Handle filters if they exist
  if (filters) {
    if (filters.sessionTypes && filters.sessionTypes.length > 0) {
      filters.sessionTypes.forEach((type: string) => {
        params.append('session_type', type);
      });
    }

    if (filters.categories && filters.categories.length > 0) {
      // Join category IDs with commas for the backend to parse
      params.append('category', filters.categories.join(','));
    }
  }

  if (searchQuery) {
    params.append('search', searchQuery);
  }

  // Handle pagination
  if (pageIndex !== undefined) {
    params.append('pageIndex', pageIndex.toString());
  }
  if (pageSize !== undefined) {
    params.append('pageSize', pageSize.toString());
  }

  // Construct final URL
  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const { data } = await api.get<PaginatedResponse<Session>>(url);
  return data;
};

export const create_session = async (sessionData: CreateSessionData) => {
  const { data } = await api.post(END_POINTS.SESSIONS_DATA, sessionData);
  return data;
};

export const get_session_detail = async (id: string) => {
  const { data } = await api.get(END_POINTS.SESSION_DETAIL(id));
  return data;
};

export const activate_session = async (sessionId: string) => {
  const { data } = await api.patch(END_POINTS.SESSION_DETAIL(sessionId), {
    is_active: true,
  });
  return data;
};

export const deactivate_session = async (sessionId: string) => {
  const { data } = await api.patch(END_POINTS.SESSION_DETAIL(sessionId), {
    is_active: false,
  });
  return data;
};

export const update_session = async (
  id: string,
  sessionData: Partial<CreateSessionData>
) => {
  const { data } = await api.patch(END_POINTS.SESSION_DETAIL(id), sessionData);
  return data;
};

export const get_session_clients = async (sessionId: string) => {
  const { data } = await api.get(END_POINTS.SESSION_CLIENTS(sessionId));
  return data;
};

export const get_session_categories = async () => {
  const { data } = await api.get(END_POINTS.CATEGORIES);
  return data;
};

export const create_session_category = async (categoryData: {
  name: string;
  description?: string;
}) => {
  const { data } = await api.post(END_POINTS.CATEGORIES, categoryData);
  return data;
};

export const update_session_category = async (
  id: number,
  categoryData: { name: string; description?: string }
) => {
  const { data } = await api.patch(
    `${END_POINTS.CATEGORIES}${id}/`,
    categoryData
  );
  return data;
};

export const delete_session_category = async (id: number) => {
  const { data } = await api.delete(`${END_POINTS.CATEGORIES}${id}/`);
  return data;
};

export const get_class_sessions = async () => {
  const { data } = await api.get(END_POINTS.CLASS_SESSIONS);
  return data;
};

export const get_staff_sessions = async (id: string) => {
  const { data } = await api.get(END_POINTS.STAFF_SESSIONS(id));
  return data.sessions || [];
};

export const create_session_subcategory = async (subcategoryData: {
  name: string;
  description?: string;
  category: number;
}) => {
  const { data } = await api.post(END_POINTS.SUBCATEGORIES, subcategoryData);
  return data;
};

export const get_session_subcategories = async () => {
  const { data } = await api.get(END_POINTS.SUBCATEGORIES);
  return data;
};

export const update_session_subcategory = async (
  id: number,
  subcategoryData: { name: string; description?: string; category: number }
) => {
  const { data } = await api.patch(
    `${END_POINTS.SUBCATEGORIES}${id}/`,
    subcategoryData
  );
  return data;
};

export const delete_session_subcategory = async (id: number) => {
  const { data } = await api.delete(`${END_POINTS.SUBCATEGORIES}${id}/`);
  return data;
};

export const create_session_skill = async (skillData: {
  name: string;
  description?: string;
  subcategory: number;
}) => {
  const { data } = await api.post(END_POINTS.SUBSKILLS, skillData);
  return data;
};

export const get_session_skills = async () => {
  const { data } = await api.get(END_POINTS.SUBSKILLS);
  return data;
};

export const update_session_skill = async (
  id: number,
  skillData: { name: string; description?: string; subcategory: number }
) => {
  const { data } = await api.patch(`${END_POINTS.SUBSKILLS}${id}/`, skillData);
  return data;
};

export const delete_session_skill = async (id: number) => {
  const { data } = await api.delete(`${END_POINTS.SUBSKILLS}${id}/`);
  return data;
};

export const getMakeupSessions = async () => {
  const { data } = await api.get(END_POINTS.MAKEUP_SESSIONS);
  return data;
};

export const createMakeupSession = async (makeupSessionData: MakeUpSession) => {
  const { data } = await api.post(
    END_POINTS.MAKEUP_SESSIONS,
    makeupSessionData
  );
  return data;
};

export const updateMakeupSession = async (
  id: string,
  makeupSessionData: MakeUpSession
) => {
  const { data } = await api.patch(
    `${END_POINTS.MAKEUP_SESSIONS}${id}/`,
    makeupSessionData
  );
  return data;
};

export const deleteMakeupSession = async (id: string) => {
  const { data } = await api.delete(`${END_POINTS.MAKEUP_SESSIONS}${id}/`);
  return data;
};

export const bulkCreateMakeupSessions = async (makeupData: {
  session: number;
  client_ids: number[];
  original_date: string;
  new_date: string;
  new_start_time: string;
  new_end_time: string;
}) => {
  const { data } = await api.post(END_POINTS.BULK_MAKEUP_SESSIONS, makeupData);
  return data;
};

export const getAttendedSessions = async () => {
  const { data } = await api.get(END_POINTS.ATTENDED_SESSIONS);
  return data;
};

export const createAttendedSession = async (
  attendedSessionData: AttendedSession
) => {
  const { data } = await api.post(
    END_POINTS.ATTENDED_SESSIONS,
    attendedSessionData
  );
  return data;
};

export const updateAttendedSession = async (
  id: string,
  attendedSessionData: AttendedSession
) => {
  const { data } = await api.patch(
    `${END_POINTS.ATTENDED_SESSIONS}${id}/`,
    attendedSessionData
  );
  return data;
};

export const deleteAttendedSession = async (id: string) => {
  const { data } = await api.delete(`${END_POINTS.ATTENDED_SESSIONS}${id}/`);
  return data;
};

export const bulk_mark_attendance = (data: {
  sessionId: number;
  clientIds: number[];
  date: string;
}) => {
  return api.post(END_POINTS.BULK_ATTENDANCE, {
    session: data.sessionId,
    client_ids: data.clientIds,
    date: data.date,
  });
};

export const getCancelledSessions = async () => {
  const { data } = await api.get(END_POINTS.CANCELLED_SESSIONS);
  return data;
};

export const createCancelledSession = async (
  cancelledSessionData: CancelledSession
) => {
  const { data } = await api.post(
    END_POINTS.CANCELLED_SESSIONS,
    cancelledSessionData
  );
  return data;
};

export const updateCancelledSession = async (
  id: string,
  cancelledSessionData: CancelledSession
) => {
  const { data } = await api.patch(
    `${END_POINTS.CANCELLED_SESSIONS}${id}/`,
    cancelledSessionData
  );
  return data;
};

export const deleteCancelledSession = async (id: string) => {
  const { data } = await api.delete(`${END_POINTS.CANCELLED_SESSIONS}${id}/`);
  return data;
};

export const bulkCancelSessions = async (bulkCancelData: {
  session: number;
  client_ids: number[];
  date: string;
}) => {
  const { data } = await api.post(
    END_POINTS.BULK_CANCELLED_SESSIONS,
    bulkCancelData
  );
  return data;
};

export const delete_session = async (sessionId: string) => {
  const { data } = await api.delete(END_POINTS.DELETE_SESSION(sessionId));
  return data;
};

export const get_class_types = async () => {
  const { data } = await api.get(END_POINTS.CLASS_TYPES);
  return data;
};

export const get_class_type = async (id: string) => {
  const { data } = await api.get(END_POINTS.CLASS_TYPE(id));
  return data;
};

export const create_class_type = async (classTypeData: ClassType) => {
  const { data } = await api.post(END_POINTS.CLASS_TYPES, classTypeData);
  return data;
};

export const update_class_type = async (
  id: string,
  classTypeData: ClassType
) => {
  const { data } = await api.patch(
    `${END_POINTS.CLASS_TYPES}${id}/`,
    classTypeData
  );
  return data;
};

export const delete_class_type = async (id: string) => {
  const { data } = await api.delete(END_POINTS.DELETE_CLASS_TYPE(id));
  return data;
};
