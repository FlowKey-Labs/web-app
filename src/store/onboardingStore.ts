import { create } from 'zustand';

interface OnboardingState {
  businessType: string | null;
  teamSize: string | null;
  monthlyClients: string | null;
  purpose: string | null;
  setBusinessType: (type: string | null) => void;
  setTeamSize: (size: string | null) => void;
  setMonthlyClients: (clients: string | null) => void;
  setPurpose: (purpose: string | null) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  businessType: null,
  teamSize: null,
  monthlyClients: null,
  purpose: null,
  setBusinessType: (type) => set({ businessType: type }),
  setTeamSize: (size) => set({ teamSize: size }),
  setMonthlyClients: (clients) => set({ monthlyClients: clients }),
  setPurpose: (purpose) => set({ purpose: purpose }),
  reset: () => set({ businessType: null, teamSize: null, monthlyClients: null, purpose: null }),
}));
