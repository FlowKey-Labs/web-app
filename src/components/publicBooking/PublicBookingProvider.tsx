import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { BookingFlowState, BookingStep, PublicService, AvailabilitySlot, PublicBookingFormData, PublicBusinessInfo } from '../../types/clientTypes';
import { useTimezone } from '../../contexts/TimezoneContext';

interface BookingAction {
  type: 'SET_BUSINESS_INFO' | 'SELECT_SERVICE' | 'SELECT_DATE' | 'SELECT_SLOT' | 'SELECT_TIME_SLOT' | 'SET_TIMEZONE' | 'UPDATE_FORM_DATA' | 'SET_STEP' | 'SET_CURRENT_STEP' | 'RESET_FLOW' | 'RESET_SELECTIONS';
  payload?: any;
}

const initialState: BookingFlowState = {
  currentStep: 'service',
  selectedService: null,
  selectedDate: null,
  selectedSlot: null,
  selectedTimeSlot: null,
  selectedTimezone: 'Africa/Nairobi',
  formData: {},
  businessInfo: null,
};

function bookingReducer(state: BookingFlowState, action: BookingAction): BookingFlowState {
  switch (action.type) {
    case 'SET_BUSINESS_INFO':
      return {
        ...state,
        businessInfo: action.payload as PublicBusinessInfo,
      };
    case 'SELECT_SERVICE':
      return {
        ...state,
        selectedService: action.payload as PublicService,
        selectedDate: null, // Reset subsequent selections
        selectedSlot: null,
        selectedTimeSlot: null,
        formData: { ...state.formData, session_id: action.payload?.id },
      };
    case 'SELECT_DATE':
      return {
        ...state,
        selectedDate: action.payload.date || action.payload, // Handle both Date objects and date strings
        selectedSlot: null, // Reset subsequent selections
        selectedTimeSlot: null,
      };
    case 'SELECT_SLOT':
      return {
        ...state,
        selectedSlot: action.payload as AvailabilitySlot,
        formData: { ...state.formData, session_id: action.payload?.session_id },
      };
    case 'SELECT_TIME_SLOT':
      return {
        ...state,
        selectedDate: action.payload.date,
        selectedTimeSlot: action.payload.timeSlot,
        selectedSlot: action.payload.timeSlot, // Keep backward compatibility
        selectedTimezone: action.payload.timezone || state.selectedTimezone,
        formData: { 
          ...state.formData, 
          session_id: action.payload.timeSlot?.session_id 
        },
      };
    case 'SET_TIMEZONE':
      return {
        ...state,
        selectedTimezone: action.payload,
      };
    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
      };
    case 'SET_STEP':
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload as BookingStep,
      };
    case 'RESET_SELECTIONS':
      return {
        ...state,
        selectedService: null,
        selectedDate: null,
        selectedSlot: null,
        selectedTimeSlot: null,
        formData: {},
        currentStep: 'service',
      };
    case 'RESET_FLOW':
      return initialState;
    default:
      return state;
  }
}

interface BookingContextType {
  state: BookingFlowState;
  dispatch: React.Dispatch<BookingAction>;
  goToStep: (step: BookingStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  canProceedToNext: () => boolean;
  resetFlow: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const stepOrder: BookingStep[] = ['service', 'date', 'details', 'confirmation'];

interface BookingProviderProps {
  children: ReactNode;
}

export function PublicBookingProvider({ children }: BookingProviderProps) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);
  const { state: timezoneState, actions: timezoneActions } = useTimezone();

  // Sync timezone state from TimezoneContext to PublicBooking (one-way to prevent loops)
  useEffect(() => {
    if (timezoneState.selectedTimezone && timezoneState.selectedTimezone !== state.selectedTimezone) {
      dispatch({ 
        type: 'SET_TIMEZONE', 
        payload: timezoneState.selectedTimezone 
      });
    }
  }, [timezoneState.selectedTimezone, state.selectedTimezone]);

  // Update timezone context when business info is available
  useEffect(() => {
    if (state.businessInfo?.timezone) {
      timezoneActions.setBusinessTimezone(state.businessInfo.timezone);
    }
  }, [state.businessInfo?.timezone]);

  const goToStep = useCallback((step: BookingStep) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const goToNextStep = useCallback(() => {
    const currentIndex = stepOrder.indexOf(state.currentStep);
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];
      dispatch({ type: 'SET_STEP', payload: nextStep });
    }
  }, [state.currentStep]);

  const goToPreviousStep = useCallback(() => {
    const currentIndex = stepOrder.indexOf(state.currentStep);
    if (currentIndex > 0) {
      const previousStep = stepOrder[currentIndex - 1];
      dispatch({ type: 'SET_STEP', payload: previousStep });
    }
  }, [state.currentStep]);

  const canProceedToNext = useCallback((): boolean => {
    switch (state.currentStep) {
      case 'service':
        return !!state.selectedService;
      case 'date':
        return !!state.selectedDate && !!state.selectedTimeSlot;
      case 'details':
        return !!(
          state.formData.client_name &&
          state.formData.client_email &&
          state.formData.client_phone &&
          state.formData.quantity &&
          state.formData.quantity > 0
        );
      case 'confirmation':
        return false; // Final step
      default:
        return false;
    }
  }, [state.currentStep, state.selectedService, state.selectedDate, state.selectedTimeSlot, state.formData]);

  const resetFlow = useCallback(() => {
    dispatch({ type: 'RESET_FLOW' });
  }, []);

  const contextValue: BookingContextType = useMemo(() => ({
    state,
    dispatch,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    canProceedToNext,
    resetFlow,
  }), [state, goToStep, goToNextStep, goToPreviousStep, canProceedToNext, resetFlow]);

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBookingFlow() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookingFlow must be used within a PublicBookingProvider');
  }
  return context;
} 