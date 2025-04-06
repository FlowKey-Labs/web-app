import { api } from '../lib/axios';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_APP_BASEURL;

const GOOGLE_API_KEY = 'AIzaSyBqwYZJ0UXWi7CmzgKoXLiJ87y7vYe6Xw8';

const END_POINTS = {
  AUTH: {
    REGISTER: `${BASE_URL}/api/auth/register/`,
    LOGIN: `${BASE_URL}/api/auth/login/`,
  },
  PROFILE: {
    BUSINESS_PROFILE: `${BASE_URL}/api/business/profile/`,
    SERVICES: `${BASE_URL}/api/business/services/`,
  },
  CLIENTS: {
    CLIENTS_DATA: `${BASE_URL}/api/client/`,
  },
  STAFF: {
    STAFF_DATA: `${BASE_URL}/api/staff/`,
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
      types: '(cities)',
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

export {
  END_POINTS,
  registerUser,
  loginUser,
  business_profile,
  update_business_profile,
  get_business_profile,
  searchCities,
  get_business_services,
  get_clients,
  get_client,
  add_client,
  get_staff,
  get_staff_member,
  update_staff_member,
};
