import { create } from "zustand";
import { FormData } from "../types/staffTypes";

interface StaffFormState {
  formData: FormData;
  activeSection: "Profile" | "Roles" | "Review";
  setFormData: (data: Partial<FormData>) => void;
  setActiveSection: (section: "Profile" | "Roles" | "Review") => void;
  resetForm: () => void;
}

const initialFormData: FormData = {
  profile: {
    email: "",
    userId: "",
  },
  role: {
    role: "staff",
    payType: "hourly",
    hourlyRate: "0",
  },
  permissions: {
    createEvents: false,
    addClients: false,
    createInvoices: false,
  },
};

export const useStaffFormStore = create<StaffFormState>((set) => ({
  formData: initialFormData,
  activeSection: "Profile",
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  setActiveSection: (section) =>
    set(() => ({
      activeSection: section,
    })),
  resetForm: () =>
    set(() => ({
      formData: initialFormData,
      activeSection: "Profile",
    })),
}));
