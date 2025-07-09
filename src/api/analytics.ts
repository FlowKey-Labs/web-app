import { api } from '../lib/axios';

const BASE_URL = import.meta.env.VITE_APP_BASEURL;

const END_POINTS = {
  UPCOMING_BIRTHDAYS: `${BASE_URL}/api/dashboard/upcoming-birthdays/`,
  CATEGORY_DISTRIBUTION: `${BASE_URL}/api/dashboard/category-distribution/`,
  SESSIONS_PER_STAFF: `${BASE_URL}/api/dashboard/sessions-per-staff/`,
  CANCELLATION_RESCHEDULE_ANALYTICS: `${BASE_URL}/api/dashboard/cancellation-reschedule-analytics/`,
  WEEKLY_CLIENTS: `${BASE_URL}/api/dashboard/weekly-clients/`,
};

export const get_upcoming_birthdays = async () => {
  const { data } = await api.get(END_POINTS.UPCOMING_BIRTHDAYS);
  return data;
};

export const get_category_distribution = async () => {
  const { data } = await api.get(END_POINTS.CATEGORY_DISTRIBUTION);
  return data;
};

export const get_sessions_per_staff = async () => {
  const { data } = await api.get(END_POINTS.SESSIONS_PER_STAFF);
  return data;
};

export const get_cancellation_reschedule_analytics = async (
  timeFilter: string = 'last_30_days'
) => {
  const { data } = await api.get(END_POINTS.CANCELLATION_RESCHEDULE_ANALYTICS, {
    params: {
      filter: timeFilter,
    },
  });
  return data;
};

export const get_weekly_clients = async () => {
  const { data } = await api.get(END_POINTS.WEEKLY_CLIENTS);
  return data;
};
