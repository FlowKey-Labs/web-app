import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  registerUser,
  loginUser,
  get_user_profile,
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
} from "../api/api";
import { useAuthStore } from "../store/auth";
// import { BusinessServices } from "../types/business";
import { AddClient, Client } from "../types/clientTypes";
import { CreateStaffRequest, StaffResponse } from "../types/staffTypes";
import {
  AnalyticsData,
  DateFilterOption,
  UpcomingSession,
} from "../types/dashboard";
import { Session } from "../types/sessionTypes";
import { CreateLocationData } from "../types/location";
import { Group, GroupData } from "../types/clientTypes";

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
    mutationFn: ({ id, ...data }: { id: number; title?: string; content?: string; policy_type?: string, file?: File }) => updatePolicy(id, data),
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

export const useGetUserProfile = () => {
  return useQuery({
    queryKey: ["user_profile"],
    queryFn: get_user_profile,
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

export const useGetClients = () => {
  return useQuery({
    queryKey: ["clients"],
    queryFn: get_clients,
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
  filters?: SessionFilters
): UseQueryResult<Session[], Error> => {
  return useQuery<Session[], Error>({
    queryKey: ["sessions", filters],
    queryFn: () => get_sessions(filters),
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
    mutationFn: ({
      id,
    }: {
      id: number;
    }) => delete_session_category(id),
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
    mutationFn: ({
      id,
    }: {
      id: number;
    }) => delete_session_subcategory(id),
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
    mutationFn: ({
      id,
    }: {
      id: number;
    }) => delete_session_skill(id),
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
      updateData: Partial<Client>;
    }) => update_client(id, updateData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["client", id] });
      queryClient.invalidateQueries({ queryKey: ["client_members", id] });
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
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["session_clients", sessionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["session_analytics", sessionId],
      });
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
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["session_clients", sessionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["session_analytics", sessionId],
      });
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
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["session_clients", sessionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["session_analytics", sessionId],
      });
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
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["session_clients", sessionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["session_analytics", sessionId],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard_analytics"] });
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

