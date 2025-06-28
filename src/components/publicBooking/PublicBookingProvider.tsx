import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  BookingFlowState,
  BookingStep,
  PublicService,
  AvailabilitySlot,
  PublicBusinessInfo,
  PublicStaff,
  PublicLocation,
  FlexibleBookingSettings,
  BookingConfirmation,
} from '../../types/clientTypes';
import { useTimezone } from '../../contexts/TimezoneContext';

interface BookingAction {
  type: 'SET_BUSINESS_INFO' | 'SELECT_SERVICE' | 'SELECT_STAFF' | 'SELECT_LOCATION' | 'SELECT_DATE' | 'SELECT_SLOT' | 'SELECT_TIME_SLOT' | 'SET_TIMEZONE' | 'UPDATE_FORM_DATA' | 'SET_STEP' | 'SET_CURRENT_STEP' | 'RESET_FLOW' | 'RESET_SELECTIONS' | 'SET_FLEXIBLE_SETTINGS' | 'CLEAR_FLEXIBLE_SELECTIONS' | 'SET_BOOKING_CONFIRMATION';
  payload?: any;
  
}

const initialState: BookingFlowState & { bookingConfirmation?: BookingConfirmation | null } = {
  currentStep: 'service',
  selectedService: null,
  selectedStaff: null,
  selectedLocation: null,
  selectedDate: null,
  selectedSlot: null,
  selectedTimeSlot: null,
  selectedTimezone: 'Africa/Nairobi',
  formData: {},
  businessInfo: null,
  flexibleBookingSettings: undefined,
  bookingConfirmation: null,
};

function bookingReducer(state: BookingFlowState & { bookingConfirmation?: BookingConfirmation | null }, action: BookingAction): BookingFlowState & { bookingConfirmation?: BookingConfirmation | null } {
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
        selectedStaff: null,
        selectedLocation: null,
        selectedDate: null, 
        selectedSlot: null,
        selectedTimeSlot: null,
        formData: { ...state.formData, session_id: action.payload?.id },
      };
    case 'SELECT_STAFF':
      return {
        ...state,
        selectedStaff: action.payload as PublicStaff,
        selectedLocation: null,
        formData: { ...state.formData, selected_staff_id: action.payload?.id },
      };
    case 'SELECT_LOCATION':
      return {
        ...state,
        selectedLocation: action.payload as PublicLocation,
        formData: { ...state.formData, selected_location_id: action.payload?.id },
      };
    case 'SELECT_DATE':
      return {
        ...state,
        selectedDate: action.payload.date || action.payload,  
        selectedSlot: null, 
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
        selectedSlot: action.payload.timeSlot, 
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
    case 'SET_FLEXIBLE_SETTINGS':
      console.log('🎯 SET_FLEXIBLE_SETTINGS action received:', action.payload);
      console.log('🎯 Previous settings:', state.flexibleBookingSettings);
      const newState = {
        ...state,
        flexibleBookingSettings: action.payload as FlexibleBookingSettings,
        // Clear staff selection if not allowed in new settings
        selectedStaff: action.payload?.allow_staff_selection ? state.selectedStaff : null,
        // Clear location selection if not allowed in new settings  
        selectedLocation: action.payload?.allow_location_selection ? state.selectedLocation : null,
      };
      console.log('🎯 New state with flexible settings:', newState.flexibleBookingSettings);
      return newState;
    case 'RESET_SELECTIONS':
      return {
        ...state,
        selectedService: null,
        selectedStaff: null,
        selectedLocation: null,
        selectedDate: null,
        selectedSlot: null,
        selectedTimeSlot: null,
        formData: {},
        currentStep: 'service',
      };
    case 'CLEAR_FLEXIBLE_SELECTIONS':
      return {
        ...state,
        selectedStaff: null,
        selectedLocation: null,
      };
    case 'SET_BOOKING_CONFIRMATION':
      return {
        ...state,
        bookingConfirmation: action.payload as BookingConfirmation,
      };
    case 'RESET_FLOW':
      return initialState;
    default:
      return state;
  }
}

interface BookingContextType {
  state: BookingFlowState & { bookingConfirmation?: BookingConfirmation | null };
  dispatch: React.Dispatch<BookingAction>;
  goToStep: (step: BookingStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  canProceedToNext: () => boolean;
  resetFlow: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const stepOrder: BookingStep[] = ['service', 'date', 'staff', 'location', 'details', 'confirmation'];

interface BookingProviderProps {
  children: ReactNode;
}

export function PublicBookingProvider({ children }: BookingProviderProps) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);
  const { state: timezoneState, actions: timezoneActions } = useTimezone();
  
  // Use ref to always have access to current state
  const stateRef = useRef(state);
  stateRef.current = state;

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
    // Use the ref to get the latest state values
    const currentState = stateRef.current;
    
    console.log('🚀 goToNextStep called - Current step:', currentState.currentStep);
    console.log('🚀 Flexible booking settings:', currentState.flexibleBookingSettings);
    console.log('🚀 Selected time slot:', currentState.selectedTimeSlot);
    console.log('🚀 Selected date:', currentState.selectedDate);
    
    const currentIndex = stepOrder.indexOf(currentState.currentStep);
    
    // After date selection, check if we need flexible booking steps
    if (currentState.currentStep === 'date') {
      console.log('📅 After date selection - checking flexible booking requirements');
      console.log('📅 Allow staff selection:', currentState.flexibleBookingSettings?.allow_staff_selection);
      console.log('📅 Allow location selection:', currentState.flexibleBookingSettings?.allow_location_selection);
      
      if (currentState.flexibleBookingSettings?.allow_staff_selection) {
        console.log('📅 ✅ Going to staff selection step');
        dispatch({ type: 'SET_CURRENT_STEP', payload: 'staff' });
        return;
      }
      // Skip staff, check location
      if (currentState.flexibleBookingSettings?.allow_location_selection) {
        console.log('📅 ✅ Skipping staff, going to location selection step');
        dispatch({ type: 'SET_CURRENT_STEP', payload: 'location' });
        return;
      }
      // Skip both, go to details
      console.log('📅 ⏭️ Skipping both staff and location, going to details');
      dispatch({ type: 'SET_CURRENT_STEP', payload: 'details' });
      return;
    }
    
    // After staff selection, check if we need location
    if (currentState.currentStep === 'staff') {
      console.log('👤 After staff selection - checking location requirement');
      if (currentState.flexibleBookingSettings?.allow_location_selection) {
        console.log('👤 ✅ Going to location selection step');
        dispatch({ type: 'SET_CURRENT_STEP', payload: 'location' });
        return;
      }
      // Skip location, go to details
      console.log('👤 ⏭️ Skipping location, going to details');
      dispatch({ type: 'SET_CURRENT_STEP', payload: 'details' });
      return;
    }
    
    // After location selection, go to details
    if (currentState.currentStep === 'location') {
      console.log('📍 After location selection - going to details');
      dispatch({ type: 'SET_CURRENT_STEP', payload: 'details' });
      return;
    }
    
    // Default behavior: go to next step in order
    console.log('⚡ Default progression - Current index:', currentIndex, 'Step order:', stepOrder);
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];
      console.log('⚡ Going to next step:', nextStep);
      dispatch({ type: 'SET_CURRENT_STEP', payload: nextStep });
    }
  }, []); // Empty dependency array since we're using ref

  const goToPreviousStep = useCallback(() => {
    // Use the ref to get the latest state values
    const currentState = stateRef.current;
    
    console.log('⬅️ goToPreviousStep called - Current step:', currentState.currentStep);
    console.log('⬅️ Flexible booking settings:', currentState.flexibleBookingSettings);
    console.log('⬅️ Selected location:', currentState.selectedLocation);
    
    // Handle flexible booking step navigation backwards
    if (currentState.currentStep === 'details') {
      console.log('📝 Coming back from details - checking previous step');
      // Coming back from details, check what step we should go to
      if (currentState.flexibleBookingSettings?.allow_location_selection && 
          (currentState.flexibleBookingSettings?.allow_staff_selection || currentState.selectedLocation)) {
        console.log('📝 ✅ Going back to location selection');
        dispatch({ type: 'SET_STEP', payload: 'location' });
        return;
      }
      if (currentState.flexibleBookingSettings?.allow_staff_selection) {
        console.log('📝 ✅ Going back to staff selection');
        dispatch({ type: 'SET_STEP', payload: 'staff' });
        return;
      }
      // If no flexible steps, go back to date
      console.log('📝 ⬅️ No flexible steps, going back to date');
      dispatch({ type: 'SET_STEP', payload: 'date' });
      return;
    }
    
    if (currentState.currentStep === 'location') {
      console.log('📍 Coming back from location selection');
      // Coming back from location selection
      if (currentState.flexibleBookingSettings?.allow_staff_selection) {
        console.log('📍 ✅ Going back to staff selection');
        dispatch({ type: 'SET_STEP', payload: 'staff' });
        return;
      }
      // If no staff selection, go back to date
      console.log('📍 ⬅️ No staff selection, going back to date');
      dispatch({ type: 'SET_STEP', payload: 'date' });
      return;
    }
    
    if (currentState.currentStep === 'staff') {
      console.log('👤 Coming back from staff selection - going to date');
      // Coming back from staff selection, go to date
      dispatch({ type: 'SET_STEP', payload: 'date' });
      return;
    }
    
    // Default behavior for other steps
    console.log('⚡ Default backward progression');
    const currentIndex = stepOrder.indexOf(currentState.currentStep);
    if (currentIndex > 0) {
      const previousStep = stepOrder[currentIndex - 1];
      console.log('⚡ Going to previous step:', previousStep);
      dispatch({ type: 'SET_STEP', payload: previousStep });
    }
  }, []); // Empty dependency array since we're using ref

  const canProceedToNext = useCallback((): boolean => {
    switch (state.currentStep) {
      case 'service':
        return !!state.selectedService;
      case 'date':
        return !!state.selectedDate && !!state.selectedTimeSlot;
      case 'staff':
        return !!state.selectedStaff;
      case 'location':  
        return !!state.selectedLocation;
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
  }, [state.currentStep, state.selectedService, state.selectedDate, state.selectedTimeSlot, state.selectedStaff, state.selectedLocation, state.formData]);

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