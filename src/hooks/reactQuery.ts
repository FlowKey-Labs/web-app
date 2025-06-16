import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  registerUser,
  loginUser,
  passwordResetRequest,
  resetPassword,
  get_user_profile,
  update_user_profile,
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
  get_analytics,
  get_upcoming_sessions,
  cancel_session,
  reschedule_session,
  create_session,
  get_sessions,
  get_session_detail,
  // Session Categories API functions
  get_session_categories,
  create_session_category,
  update_session_category,
  delete_session_category,
  // Session Subcategories API functions
  get_session_subcategories,
  create_session_subcategory,
  update_session_subcategory,
  delete_session_subcategory,
  // Session Skills API functions
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
  activate_session,
  deactivate_session,
  remove_client_from_session,
  activate_staff,
  deactivate_staff,
  update_attendance_status,
  // Group API functions
  get_groups,
  get_group,
  add_group,
  update_group,
  get_group_members,
  add_member_to_group,
  remove_member_from_group,
  setStaffPassword,
  // Policy API
  getPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  get_staff_sessions,
  // Makeup Session API functions
  getMakeupSessions,
  createMakeupSession,
  updateMakeupSession,
  deleteMakeupSession,
  // Attended Session API functions
  getAttendedSessions,
  createAttendedSession,
  updateAttendedSession,
  deleteAttendedSession,
  // Cancelled Session API functions
  getCancelledSessions,
  createCancelledSession,
  updateCancelledSession,
  deleteCancelledSession,
  markOutcomeComplete,
  markOutcomeIncomplete,
  getSeries,
  getClientProgress,
  getOutcomes,
  submitProgressFeedback,
  getLevelFeedback,
  PaginatedResponse,
  get_calendar_sessions,
  get_booking_requests,
  approve_booking_request,
  reject_booking_request,
  convert_client_to_regular,
  convert_client_to_booking,
  get_progress_feedback,
  cancel_booking_request,
  // Booking Settings API functions
  get_booking_settings,
  update_booking_settings,
  // Booking Notifications API functions
  get_booking_notifications,
  mark_notification_as_read,
  mark_all_notifications_as_read,
  // Booking Audit Logs API functions
  get_booking_audit_logs,
  get_availability,
  create_availability,
  update_availability,
  partial_update_availability,
  // Public Booking imports
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
} from "../api/api";
import { Role, useAuthStore } from "../store/auth";
import { AddClient, Client, ClientData } from "../types/clientTypes";
import { CreateStaffRequest, StaffResponse } from "../types/staffTypes";
import {
  AnalyticsData,
  DateFilterOption,
  UpcomingSession,
} from "../types/dashboard";
import {
  AttendedSession,
  CancelledSession,
  MakeUpSession,
  ProgressFeedback,
  Session,
} from "../types/sessionTypes";
import { CreateLocationData } from "../types/location";
import { Group, GroupData } from "../types/clientTypes";
import { SeriesLevel, SeriesProgress } from "../store/progressStore";

export const useRegisterUser = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      setAuth(data.access, data.refresh, data.user);
    },
    onError: (error) => {
      console.error("Failed to register==>", error);
    },
  });
};

export const useLoginUser = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      setAuth(data.access, data.refresh, data.user);
    },
    onError: (error) => {
      console.error("Failed to log in==>", error);
    },
  });
};

export const useSetStaffPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setStaffPassword,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error("Failed to set staff passsword==>", error);
    },
  });
};

export const usePasswordResetRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: passwordResetRequest,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error("Failed to send reset password request==>", error);
    },
  });
};

export const useResetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error("Failed to reset password==>", error);
    },
  });
};

// Policy CRUD hooks

export const useGetPolicies = () => {
  return useQuery({
    queryKey: ["policies"],
    queryFn: getPolicies,
  });
};

export const useCreatePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
    },
  });
};

export const useUpdatePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: number;
      title?: string;
      content?: string;
      policy_type?: string;
      file?: File;
    }) => updatePolicy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
    },
  });
};

export const useDeletePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
    },
  });
};

// Roles CRUD hooks

export const useGetRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
    } & Role) => updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export const useGetUserProfile = (options = {}) => {
  return useQuery({
    queryKey: ["user_profile"],
    queryFn: get_user_profile,
    ...options,
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updateData,
    }: {
      id: string;
      updateData: {
        timezone?: string;
        first_name?: string;
        last_name?: string;
        mobile_number?: string;
        email?: string;
      };
    }) => {
      return update_user_profile(updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_profile"] });
      queryClient.invalidateQueries({ queryKey: ["business_profile"] });
    },
    onError: (error) => console.error("Update user profile error:", error),
  });
};

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);

  return () => {
    logout();
    window.location.href = "/login";
  };
};

export const useBusinessProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: business_profile,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error("Failed to update business profile==>", error);
    },
  });
};

export const useUpdateBusinessProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updateData,
    }: {
      id: string;
      updateData: {
        business_name?: string;
        contact_person?: string;
        contact_email?: string;
        contact_phone?: string;
        address?: string;
        about?: string;
        timezone?: string;
      };
    }) => {
      return update_business_profile(id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    onError: (error) => console.error("Update error:", error),
  });
};

export const useGetBusinessProfile = () => {
  return useQuery({
    queryKey: ["business_profile"],
    queryFn: get_business_profile,
  });
};

// Availability hooks
export const useGetAvailability = () => {
  return useQuery({
    queryKey: ["availability"],
    queryFn: get_availability,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes cache time
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403/404 errors (user might not have availability setup yet)
      if (error?.response?.status === 401 || error?.response?.status === 403 || error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Handle 404 as a valid state (no availability setup yet)
    throwOnError: (error: any) => {
      if (error?.response?.status === 404) {
        return false; // Don't throw error for 404, treat it as empty state
      }
      return true; // Throw for other errors
    },
  });
};

export const useCreateAvailability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: create_availability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      // Also invalidate related queries that might be affected
      queryClient.invalidateQueries({ queryKey: ["calendar-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["booking-settings"] });
    },
    onError: (error: any) => {
      console.error("Create availability error:", error);
      // Don't throw here, let component handle the error
    },
    retry: 1, // Retry once for mutations
  });
};

export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: update_availability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      queryClient.invalidateQueries({ queryKey: ["calendar-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["booking-settings"] });
    },
    onError: (error: any) => {
      console.error("Update availability error:", error);
    },
    retry: 1,
  });
};

export const usePartialUpdateAvailability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: partial_update_availability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      queryClient.invalidateQueries({ queryKey: ["calendar-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["booking-settings"] });
    },
    onError: (error: any) => {
      console.error("Partial update availability error:", error);
    },
    retry: 1,
  });
};

export const useSearchCities = () => {
  return useMutation({
    mutationFn: searchCities,
    onError: (error) => {
      console.error("Failed to search cities:", error);
    },
  });
};

export const useGetBusinessServices = () => {
  return useQuery({
    queryKey: ["business-services"],
    queryFn: get_business_services,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useGetLocations = () => {
  return useQuery({
    queryKey: ["locations"],
    queryFn: get_locations,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useGetLocation = (id: number) => {
  return useQuery({
    queryKey: ["locations", id],
    queryFn: () => get_location(id),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
    enabled: !!id,
  });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: create_location,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
    onError: (error) => console.error("Create location error:", error),
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateLocationData>;
    }) => {
      return update_location(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
    onError: (error) => console.error("Update location error:", error),
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: delete_location,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
    onError: (error) => console.error("Delete location error:", error),
  });
};

export const useSetPrimaryLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: set_primary_location,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
    onError: (error) => console.error("Set primary location error:", error),
  });
};

export const useGetClients = (
  pageIndex?: number,
  pageSize?: number,
  searchQuery?: string
): UseQueryResult<PaginatedResponse<Client>, Error> => {
  return useQuery({
    queryKey: ["clients", pageIndex, pageSize, searchQuery],
    queryFn: () => get_clients(pageIndex, pageSize, searchQuery),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useGetClient = (id: string) => {
  return useQuery({
    queryKey: ["client", id],
    queryFn: () => get_client(id),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
    enabled: !!id,
  });
};

export const useAddClient = () => {
  const queryClient = useQueryClient();
  return useMutation<Client, Error, AddClient>({
    mutationFn: (data) =>
      add_client({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone_number,
        location: data.location || "",
        gender: data.gender,
        dob: data.dob,
        session_ids: data.session_ids,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error) => console.error("Add client error:", error),
  });
};

export const useGetStaff = () => {
  return useQuery({
    queryKey: ["staff"],
    queryFn: get_staff,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useGetStaffMember = (id: string) => {
  return useQuery({
    queryKey: ["staff", id],
    queryFn: () => get_staff_member(id),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
    enabled: !!id,
  });
};

export const useCreateStaffMember = () => {
  const queryClient = useQueryClient();
  return useMutation<StaffResponse, Error, CreateStaffRequest>({
    mutationFn: (data: CreateStaffRequest) => create_staff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
    onError: (error) => console.error("Create staff member error ====>", error),
  });
};

export const useUpdateStaffMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updateStaffData,
    }: {
      id: string;
      updateStaffData: any;
    }) => update_staff_member(id, updateStaffData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff", id] });
    },
    onError: (error) => console.error("Update staff member error ====>", error),
  });
};

export const useGetAnalytics = (filterOption?: DateFilterOption) => {
  return useQuery<AnalyticsData>({
    queryKey: ["analytics", filterOption],
    queryFn: () => get_analytics(filterOption),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useGetUpcomingSessions = () => {
  return useQuery<UpcomingSession[]>({
    queryKey: ["upcoming_sessions"],
    queryFn: get_upcoming_sessions,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useCancelSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => cancel_session(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upcoming_sessions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
};

export const useRescheduleSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      newDateTime,
    }: {
      sessionId: string;
      newDateTime: { date: string; startTime: string; endTime: string };
    }) => reschedule_session(sessionId, newDateTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upcoming_sessions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
};

export const useGetSessionAnalytics = (sessionId: string) => {
  return useQuery({
    queryKey: ["session_analytics", sessionId],
    queryFn: () => get_session_analytics(sessionId),
    staleTime: 0, // Set to 0 to ensure it always fetches fresh data
    refetchOnWindowFocus: true,
    enabled: !!sessionId,
  });
};

export const useGetClientAnalytics = (clientId: string) => {
  return useQuery({
    queryKey: ["client_analytics", clientId],
    queryFn: () => get_client_analytics(clientId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: !!clientId,
  });
};

export interface SessionFilters {
  sessionTypes?: string[];
  categories?: string[];
  dateRange?: [Date | null, Date | null];
}

export const useGetSessions = (
  pageIndex?: number,
  pageSize?: number,
  filters?: SessionFilters
): UseQueryResult<PaginatedResponse<Session>, Error> => {
  return useQuery<PaginatedResponse<Session>, Error>({
    queryKey: ["sessions", pageIndex, pageSize, filters],
    queryFn: () => get_sessions(filters, pageIndex, pageSize),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useGetCalendarSessions = (): UseQueryResult<Session[], Error> => {
  return useQuery<Session[], Error>({
    queryKey: ["sessions"],
    queryFn: () => get_calendar_sessions(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useGetStaffSessions = (
  id: string
): UseQueryResult<Session[], Error> => {
  return useQuery<Session[], Error>({
    queryKey: ["sessions", id],
    queryFn: () => get_staff_sessions(id),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useGetClassSessions = () => {
  return useQuery<Session[]>({
    queryKey: ["class_sessions"],
    queryFn: get_class_sessions,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useGetSessionDetail = (id: string) => {
  return useQuery<Session>({
    queryKey: ["session", id],
    queryFn: () => get_session_detail(id),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
    enabled: !!id,
  });
};

// Session related hooks

export const useGetSessionCategories = () => {
  return useQuery({
    queryKey: ["session_categories"],
    queryFn: get_session_categories,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
};

export const useCreateSessionCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      description,
    }: {
      name: string;
      description?: string;
    }) => create_session_category({ name, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session_categories"] });
    },
    onError: (error) => {
      console.error("Failed to create session category:", error);
    },
  });
};

export const useUpdateSessionCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      name,
      description,
    }: {
      id: number;
      name: string;
      description?: string;
    }) => update_session_category(id, { name, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session_categories"] });
    },
    onError: (error) => {
      console.error("Failed to update session category:", error);
    },
  });
};

export const useDeleteSessionCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => delete_session_category(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session_categories"] });
    },
    onError: (error) => {
      console.error("Failed to delete session category:", error);
    },
  });
};

export const useGetSessionSubCategories = () => {
  return useQuery({
    queryKey: ["session_subcategories"],
    queryFn: get_session_subcategories,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
};

export const useCreateSessionSubCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      description,
      category,
    }: {
      name: string;
      description?: string;
      category: number;
    }) => create_session_subcategory({ name, description, category }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session_subcategories"] });
    },
    onError: (error) => {
      console.error("Failed to create session subcategory:", error);
    },
  });
};

export const useUpdateSessionSubCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      name,
      description,
      category,
    }: {
      id: number;
      name: string;
      description?: string;
      category: number;
    }) => update_session_subcategory(id, { name, description, category }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session_subcategories"] });
    },
    onError: (error) => {
      console.error("Failed to update session subcategory:", error);
    },
  });
};

export const useDeleteSessionSubCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => delete_session_subcategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session_subcategories"] });
    },
    onError: (error) => {
      console.error("Failed to delete session subcategory:", error);
    },
  });
};

export const useGetSessionSkills = () => {
  return useQuery({
    queryKey: ["session_skills"],
    queryFn: get_session_skills,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
};

export const useCreateSessionSkill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      description,
      subcategory,
    }: {
      name: string;
      description?: string;
      subcategory: number;
    }) => create_session_skill({ name, description, subcategory }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session_skills"] });
    },
    onError: (error) => {
      console.error("Failed to create session skill:", error);
    },
  });
};

export const useUpdateSessionSkill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      name,
      description,
      subcategory,
    }: {
      id: number;
      name: string;
      description?: string;
      subcategory: number;
    }) => update_session_skill(id, { name, description, subcategory }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session_skills"] });
    },
    onError: (error) => {
      console.error("Failed to update session skill:", error);
    },
  });
};

export const useDeleteSessionSkill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => delete_session_skill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session_skills"] });
    },
    onError: (error) => {
      console.error("Failed to delete session skill:", error);
    },
  });
};

export const useGetSessionClients = (sessionId: string) => {
  return useQuery({
    queryKey: ["session_clients", sessionId],
    queryFn: () => get_session_clients(sessionId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
    enabled: !!sessionId,
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionData: any) => create_session(sessionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming_sessions"] });
    },
  });
};

export const useUpdateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updateData }: { id: string; updateData: any }) =>
      update_session(id, updateData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["session", id] });
      queryClient.invalidateQueries({ queryKey: ["upcoming_sessions"] });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updateData,
    }: {
      id: string;
      updateData: {
        first_name?: string;
        last_name?: string;
        email?: string;
        phone_number?: string;
        location?: string;
        dob?: string;
        gender?: string;
        session_ids?: number[];
      };
    }) => update_client(id, updateData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["client", id] });
      queryClient.invalidateQueries({ queryKey: ["client_members", id] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["class_sessions"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming_sessions"] });
    },
    onError: (error) => console.error("Update client error:", error),
  });
};

export const useDeactivateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivate_client,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};

export const useActivateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activate_client,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};

export const useMarkClientAttended = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      clientId,
      sessionId,
    }: {
      clientId: string;
      sessionId: string;
    }) => mark_client_attended(clientId, sessionId),
    onSuccess: (data, { clientId, sessionId }) => {
      // Invalidate session-related queries
      queryClient.invalidateQueries({
        queryKey: ["session_clients", sessionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["session_analytics", sessionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["session", sessionId],
      });

      // Invalidate client-related queries
      queryClient.invalidateQueries({
        queryKey: ["client_analytics", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["client_sessions", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["client_session_details", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["client", clientId],
      });

      // Invalidate global analytics and sessions queries
      queryClient.invalidateQueries({
        queryKey: ["client_analytics"],
      });
      queryClient.invalidateQueries({
        queryKey: ["class_sessions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["sessions"],
      });

      // Force a full refetch of the data
      queryClient.refetchQueries({
        queryKey: ["session_clients", sessionId],
      });
      queryClient.refetchQueries({
        queryKey: ["client_sessions", clientId],
      });

      return data;
    },
  });
};

export const useMarkClientNotAttended = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      clientId,
      sessionId,
    }: {
      clientId: string;
      sessionId: string;
    }) => mark_client_not_attended(clientId, sessionId),
    onSuccess: (data, { clientId, sessionId }) => {
      // Invalidate session-related queries
      queryClient.invalidateQueries({
        queryKey: ["session_clients", sessionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["session_analytics", sessionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["session", sessionId],
      });

      // Invalidate client-related queries
      queryClient.invalidateQueries({
        queryKey: ["client_analytics", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["client_sessions", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["client_session_details", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["client", clientId],
      });

      // Invalidate global analytics and sessions queries
      queryClient.invalidateQueries({
        queryKey: ["client_analytics"],
      });
      queryClient.invalidateQueries({
        queryKey: ["class_sessions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["sessions"],
      });

      // Force a full refetch of the data
      queryClient.refetchQueries({
        queryKey: ["session_clients", sessionId],
      });
      queryClient.refetchQueries({
        queryKey: ["client_sessions", clientId],
      });

      return data;
    },
  });
};

export const useUpdateAttendanceStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      clientId,
      sessionId,
      status,
    }: {
      clientId: string;
      sessionId: string;
      status: string;
    }) => update_attendance_status(clientId, sessionId, status),
    onSuccess: (data, { clientId, sessionId }) => {
      // Invalidate session-related queries
      queryClient.invalidateQueries({
        queryKey: ["session_clients", sessionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["session_analytics", sessionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["session", sessionId],
      });

      // Invalidate client-related queries
      queryClient.invalidateQueries({
        queryKey: ["client_analytics", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["client_sessions", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["client_session_details", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["client", clientId],
      });

      // Invalidate global analytics and sessions queries
      queryClient.invalidateQueries({
        queryKey: ["client_analytics"],
      });
      queryClient.invalidateQueries({
        queryKey: ["class_sessions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["sessions"],
      });

      // Force a full refetch of the data
      queryClient.refetchQueries({
        queryKey: ["session_clients", sessionId],
      });
      queryClient.refetchQueries({
        queryKey: ["client_sessions", clientId],
      });

      return data;
    },
  });
};

export const useActivateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activate_session,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
};

export const useDeactivateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivate_session,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
};

export const useRemoveClientFromSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      clientId,
      sessionId,
    }: {
      clientId: string;
      sessionId: string;
    }) => remove_client_from_session(clientId, sessionId),
    onSuccess: (_, { clientId, sessionId }) => {
      // Invalidate session-related queries
      queryClient.invalidateQueries({
        queryKey: ["session_clients", sessionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["session_analytics", sessionId],
      });

      // Invalidate client-related queries
      queryClient.invalidateQueries({
        queryKey: ["client_analytics", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["client_sessions", clientId],
      });

      // Invalidate global queries
      queryClient.invalidateQueries({ queryKey: ["dashboard_analytics"] });
      queryClient.invalidateQueries({
        queryKey: ["client_analytics"],
      });
      queryClient.invalidateQueries({
        queryKey: ["class_sessions"],
      });
    },
  });
};

export const useActivateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activate_staff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};

export const useDeactivateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivate_staff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};

// Group related hooks
export const useGetGroups = () => {
  return useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: get_groups,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useGetGroup = (id: string) => {
  return useQuery<Group>({
    queryKey: ["group", id],
    queryFn: () => get_group(id),
    enabled: !!id,
  });
};

export const useAddGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: add_group,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (error) => {
      console.error("Failed to add group:", error);
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updateData,
    }: {
      id: string;
      updateData: Partial<GroupData>;
    }) => update_group(id, updateData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      queryClient.invalidateQueries({ queryKey: ["group_members", id] });
    },
    onError: (error) => {
      console.error("Failed to update group:", error);
    },
  });
};

export const useGetGroupMembers = (groupId: string) => {
  return useQuery({
    queryKey: ["group_members", groupId],
    queryFn: () => get_group_members(groupId),
    enabled: !!groupId,
  });
};

export const useAddMemberToGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      clientId,
    }: {
      groupId: string;
      clientId: string;
    }) => add_member_to_group(groupId, clientId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ["group_members", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
    },
  });
};

export const useRemoveMemberFromGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      clientId,
    }: {
      groupId: string;
      clientId: string;
    }) => remove_member_from_group(groupId, clientId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ["group_members", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
    },
  });
};

// Makeup Session related hooks
export const useGetMakeupSessions = () => {
  return useQuery({
    queryKey: ["makeup_sessions"],
    queryFn: getMakeupSessions,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useCreateMakeupSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMakeupSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["makeup_sessions"] });
    },
    onError: (error) => {
      console.error("Failed to create makeup session:", error);
    },
  });
};

export const useUpdateMakeupSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      makeupSessionData,
    }: {
      id: string;
      makeupSessionData: MakeUpSession;
    }) => updateMakeupSession(id, makeupSessionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["makeup_sessions"] });
    },
    onError: (error) => {
      console.error("Failed to update makeup session:", error);
    },
  });
};

export const useDeleteMakeupSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteMakeupSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["makeup_sessions"] });
    },
    onError: (error) => {
      console.error("Failed to delete makeup session:", error);
    },
  });
};

// Attended Session related hooks
export const useGetAttendedSessions = () => {
  return useQuery({
    queryKey: ["attended_sessions"],
    queryFn: getAttendedSessions,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useGetProgressSeries = () => {
  return useQuery<SeriesLevel[]>({
    queryKey: ["series"],
    queryFn: getSeries,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useCreateAttendedSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAttendedSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attended_sessions"] });
    },
    onError: (error) => {
      console.error("Failed to create attended session:", error);
    },
  });
};

export const useUpdateAttendedSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      attendedSessionData,
    }: {
      id: string;
      attendedSessionData: AttendedSession;
    }) => updateAttendedSession(id, attendedSessionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attended_sessions"] });
    },
    onError: (error) => {
      console.error("Failed to update attended session:", error);
    },
  });
};

export const useDeleteAttendedSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteAttendedSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attended_sessions"] });
    },
    onError: (error) => {
      console.error("Failed to delete attended session:", error);
    },
  });
};

// Cancelled Session related hooks
export const useGetCancelledSessions = () => {
  return useQuery({
    queryKey: ["cancelled_sessions"],
    queryFn: getCancelledSessions,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useGetClientProgress = (clientId: string) => {
  return useQuery<SeriesProgress>({
    queryKey: ["client_progress", clientId],
    queryFn: () => getClientProgress(clientId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useCreateCancelledSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCancelledSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cancelled_sessions"] });
    },
    onError: (error) => {
      console.error("Failed to create cancelled session:", error);
    },
  });
};

export const useGetOutcomes = (clientId: string) => {
  return useQuery<SeriesLevel[]>({
    queryKey: ["outcomes", clientId],
    queryFn: () => getOutcomes(clientId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useMarkOutcomeCompleted = () => {
  return useMutation({
    mutationFn: ({
      client_id,
      subskill_id,
    }: {
      client_id: string;
      subskill_id: string;
    }) => markOutcomeComplete({ client_id, subskill_id }),
  });
};

export const useUnmarkOutcomeIncomplete = () => {
  return useMutation({
    mutationFn: ({
      client_id,
      subskill_id,
    }: {
      client_id: string;
      subskill_id: string;
    }) => markOutcomeIncomplete({ client_id, subskill_id }),
  });
};

export const useSubmitProgressFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProgressFeedback) => submitProgressFeedback(payload),
    onSuccess: (_, { client_id, subcategory_id }) => {
      queryClient.invalidateQueries({
        queryKey: ["levelFeedback", client_id, subcategory_id],
      });
    },
  });
};

export const useUpdateCancelledSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      cancelledSessionData,
    }: {
      id: string;
      cancelledSessionData: CancelledSession;
    }) => updateCancelledSession(id, cancelledSessionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cancelled_sessions"] });
    },
    onError: (error) => {
      console.error("Failed to update cancelled session:", error);
    },
  });
};

export const useDeleteCancelledSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteCancelledSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cancelled_sessions"] });
    },
    onError: (error) => {
      console.error("Failed to delete cancelled session:", error);
    },
  });
};

// Booking Requests API Hooks
export const useGetBookingRequests = (
  pageIndex?: number,
  pageSize?: number,
  searchQuery?: string
): UseQueryResult<PaginatedResponse<BookingRequest>, Error> => {
  return useQuery({
    queryKey: ["booking_requests", pageIndex, pageSize, searchQuery],
    queryFn: () => get_booking_requests(pageIndex, pageSize, searchQuery),
    staleTime: 1000 * 60 * 2, // Shorter stale time for booking requests
    refetchOnWindowFocus: true,
    retry: 2,
  });
};

export const useApproveBookingRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: number) => approve_booking_request(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking_requests"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error) => console.error("Approve booking request error:", error),
  });
};

export const useRejectBookingRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: number; reason?: string }) => 
      reject_booking_request(requestId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking_requests"] });
    },
    onError: (error) => console.error("Reject booking request error:", error),
  });
};

export const useConvertClientToRegular = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clientId: number) => convert_client_to_regular(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["booking_requests"] });
    },
    onError: (error) => console.error("Convert client to regular error:", error),
  });
};

export const useConvertClientToBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clientId: number) => convert_client_to_booking(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error) => {
      console.error('Error converting client to booking:', error);
    }
  });
};

export const useGetProgressFeedback = (
  clientId: string,
  subcategoryId: string
) => {
  return useQuery<{
    feedback: string;
    attachment: string;
  }>({
    queryKey: ["levelFeedback", clientId, subcategoryId],
    queryFn: () => getLevelFeedback(clientId, subcategoryId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useCancelBookingRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: number; reason?: string }) => 
      cancel_booking_request(requestId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking_requests"] });
    },
    onError: (error) => console.error("Cancel booking request error:", error),
  });
};

// Booking Settings APIs
export const useGetBookingSettings = () => {
  return useQuery({
    queryKey: ['booking-settings'],
    queryFn: get_booking_settings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateBookingSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: update_booking_settings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-settings'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
};

// Booking Notifications APIs
export const useGetBookingNotifications = () => {
  return useQuery({
    queryKey: ['booking-notifications'],
    queryFn: get_booking_notifications,
    staleTime: 1 * 60 * 1000, // 1 minute for notifications
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mark_notification_as_read,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-notifications'] });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mark_all_notifications_as_read,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-notifications'] });
    },
  });
};

// Booking Audit Logs APIs
export const useGetBookingAuditLogs = () => {
  return useQuery({
    queryKey: ['booking-audit-logs'],
    queryFn: get_booking_audit_logs,
    staleTime: 5 * 60 * 1000, // 5 minutes for audit logs
  });
};

// ========================================
// PUBLIC BOOKING HOOKS
// ========================================

// Get public business information
export const useGetPublicBusinessInfo = (businessSlug: string) => {
  return useQuery({
    queryKey: ['publicBusinessInfo', businessSlug],
    queryFn: () => get_public_business_info(businessSlug),
    enabled: !!businessSlug,
  });
};

// Get public business services
export const useGetPublicBusinessServices = (businessSlug: string) => {
  return useQuery({
    queryKey: ['publicBusinessServices', businessSlug],
    queryFn: () => get_public_business_services(businessSlug),
    enabled: !!businessSlug,
  });
};

// Get public availability slots
export const useGetPublicAvailability = (
  businessSlug: string,
  categoryId: number | null,
  startDate: string,
  endDate: string
) => {
  console.log('🔌 DEBUG: useGetPublicAvailability hook called with:', {
    businessSlug,
    categoryId,
    startDate,
    endDate
  });

  return useQuery({
    queryKey: ['public-availability', businessSlug, categoryId, startDate, endDate],
    queryFn: async () => {
      console.log('🚀 DEBUG: Executing API call get_public_availability with params:', {
        businessSlug,
        categoryId,
        startDate,
        endDate
      });
      
      try {
        const result = await get_public_availability(businessSlug, categoryId || 0, startDate, endDate);
        console.log('✅ DEBUG: API call successful, response:', result);
        return result;
      } catch (error) {
        console.error('❌ DEBUG: API call failed:', error);
        throw error;
      }
    },
    enabled: !!businessSlug && categoryId !== null && !!startDate && !!endDate,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false, // Don't refetch when window focuses
    retry: 2, // Retry failed requests twice
    onSuccess: (data) => {
      console.log('🎉 DEBUG: Query success callback, data received:', data);
    },
    onError: (error) => {
      console.error('💥 DEBUG: Query error callback:', error);
    },
  });
};

// Create public booking
export const useCreatePublicBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      businessSlug, 
      bookingData 
    }: { 
      businessSlug: string;
      bookingData: {
        session_id: number;
        client_name: string;
        client_email: string;
        client_phone: string;
        notes?: string;
        quantity?: number;
      }
    }) => create_public_booking(businessSlug, bookingData),
    onSuccess: () => {
      // Invalidate availability queries as they might have changed
      queryClient.invalidateQueries({ queryKey: ['public-availability'] });
    },
    onError: (error) => {
      console.error("Failed to create booking:", error);
    },
  });
};

// Get booking status
export const useGetBookingStatus = (bookingReference: string) => {
  return useQuery({
    queryKey: ['booking-status', bookingReference],
    queryFn: () => get_booking_status(bookingReference),
    enabled: !!bookingReference,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Get client booking info
export const useGetClientBookingInfo = (bookingReference: string) => {
  return useQuery({
    queryKey: ['client-booking-info', bookingReference],
    queryFn: () => get_client_booking_info(bookingReference),
    enabled: !!bookingReference,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Cancel client booking
export const useCancelClientBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      bookingReference, 
      reason 
    }: { 
      bookingReference: string;
      reason?: string;
    }) => cancel_client_booking(bookingReference, reason),
    onSuccess: (_, variables) => {
      // Invalidate client booking info and availability
      queryClient.invalidateQueries({ queryKey: ['client-booking-info', variables.bookingReference] });
      queryClient.invalidateQueries({ queryKey: ['booking-status', variables.bookingReference] });
      queryClient.invalidateQueries({ queryKey: ['public-availability'] });
    },
    onError: (error) => {
      console.error("Failed to cancel booking:", error);
    },
  });
};

// Get client reschedule options
export const useGetClientRescheduleOptions = (
  bookingReference: string,
  dateFrom?: string,
  dateTo?: string
) => {
  return useQuery({
    queryKey: ['client-reschedule-options', bookingReference, dateFrom, dateTo],
    queryFn: () => get_client_reschedule_options(bookingReference, dateFrom, dateTo),
    enabled: !!bookingReference,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Reschedule client booking
export const useRescheduleClientBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      bookingReference, 
      newSessionId 
    }: { 
      bookingReference: string;
      newSessionId: number;
    }) => reschedule_client_booking(bookingReference, newSessionId),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['client-booking-info', variables.bookingReference] });
      queryClient.invalidateQueries({ queryKey: ['booking-status', variables.bookingReference] });
      queryClient.invalidateQueries({ queryKey: ['client-reschedule-options', variables.bookingReference] });
      queryClient.invalidateQueries({ queryKey: ['public-availability'] });
    },
    onError: (error) => {
      console.error("Failed to reschedule booking:", error);
    },
  });
};

export const useGetAvailableSlots = (businessSlug: string, serviceId: string, date: string) => {
  return useQuery({
    queryKey: ['availableSlots', businessSlug, serviceId, date],
    queryFn: () => getAvailableSlots(businessSlug, serviceId, date),
    enabled: !!businessSlug && !!serviceId && !!date,
    refetchOnWindowFocus: true, // Refresh when user comes back to the page
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
};

