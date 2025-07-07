import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  BookingFlowState,
  BookingStep,
  PublicService,
  PublicServiceCategory,
  PublicServiceSubcategory,
  AvailabilitySlot,
  PublicBusinessInfo,
  PublicStaff,
  PublicLocation,
  FlexibleBookingSettings,
  BookingConfirmation,
} from '../../types/clientTypes';
import { useTimezone } from '../../contexts/TimezoneContext';

interface BookingAction {
  type: 'SET_BUSINESS_INFO' | 'SELECT_SERVICE' | 'SELECT_SERVICE_CATEGORY' | 'SELECT_SERVICE_SUBCATEGORY' | 'SELECT_STAFF' | 'SELECT_LOCATION' | 'SELECT_DATE' | 'SELECT_SLOT' | 'SELECT_TIME_SLOT' | 'SET_TIMEZONE' | 'UPDATE_FORM_DATA' | 'SET_STEP' | 'SET_CURRENT_STEP' | 'RESET_FLOW' | 'RESET_SELECTIONS' | 'SET_FLEXIBLE_SETTINGS' | 'CLEAR_FLEXIBLE_SELECTIONS' | 'SET_BOOKING_CONFIRMATION' | 'SET_BOOKING_MODE';
  payload?: any;
  
}

const initialState: BookingFlowState & { bookingConfirmation?: BookingConfirmation | null } = {
  currentStep: 'service',
  selectedService: null,
  selectedServiceCategory: null,
  selectedServiceSubcategory: null,
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
  bookingMode: 'hybrid',
  isFlexibleBooking: false,
};

function bookingReducer(state: BookingFlowState & { bookingConfirmation?: BookingConfirmation | null }, action: BookingAction): BookingFlowState & { bookingConfirmation?: BookingConfirmation | null } {
  switch (action.type) {
    case 'SET_BUSINESS_INFO':
      return {
        ...state,
        businessInfo: action.payload as PublicBusinessInfo,
      };
    case 'SELECT_SERVICE':
      // Handle legacy session-based services (fixed bookings)
      return {
        ...state,
        selectedService: action.payload as PublicService,
        selectedServiceCategory: null,
        selectedServiceSubcategory: null,
        selectedStaff: null,
        selectedLocation: null,
        selectedDate: null, 
        selectedSlot: null,
        selectedTimeSlot: null,
        formData: { ...state.formData, session_id: action.payload?.id },
        isFlexibleBooking: false,
        bookingMode: 'fixed',
      };
    case 'SELECT_SERVICE_CATEGORY':
      // Handle service category selection (potentially flexible bookings)
      const category = action.payload as PublicServiceCategory;
      const hasSubcategories = category.subcategories && category.subcategories.length > 0;
      
      return {
        ...state,
        selectedServiceCategory: category,
        selectedService: null,
        selectedServiceSubcategory: null,
        selectedStaff: null,
        selectedLocation: null,
        selectedDate: null, 
        selectedSlot: null,
        selectedTimeSlot: null,
        formData: { ...state.formData },
        isFlexibleBooking: hasSubcategories,
        bookingMode: hasSubcategories ? 'flexible' : 'fixed',
      };
    case 'SELECT_SERVICE_SUBCATEGORY':
      // Handle service subcategory selection (flexible bookings)
      return {
        ...state,
        selectedServiceSubcategory: action.payload as PublicServiceSubcategory,
        selectedStaff: null,
        selectedLocation: null,
        selectedDate: null, 
        selectedSlot: null,
        selectedTimeSlot: null,
        formData: { ...state.formData, service_id: action.payload?.id },
        isFlexibleBooking: true,
        bookingMode: 'flexible',
      };
    case 'SELECT_STAFF':
      console.log('🎯 SELECT_STAFF action - Preserving location state:', {
        currentLocation: state.selectedLocation,
        newStaff: action.payload,
        isFlexibleBooking: state.isFlexibleBooking
      });
      return {
        ...state,
        selectedStaff: action.payload as PublicStaff,
        // Don't clear location - maintain selection across steps
        formData: { ...state.formData, selected_staff_id: action.payload?.id },
      };
    case 'SELECT_LOCATION':
      console.log('📍 SELECT_LOCATION action - Setting location state:', {
        newLocation: action.payload,
        currentStaff: state.selectedStaff,
        isFlexibleBooking: state.isFlexibleBooking,
        currentStep: state.currentStep
      });
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
      console.log('🚶 STEP CHANGE:', {
        from: state.currentStep,
        to: action.payload,
        preservedState: {
          selectedStaff: state.selectedStaff?.id,
          selectedLocation: state.selectedLocation?.id,
          isFlexibleBooking: state.isFlexibleBooking
        }
      });
      return {
        ...state,
        currentStep: action.payload as BookingStep,
      };
    case 'SET_BOOKING_MODE':
      return {
        ...state,
        bookingMode: action.payload,
        isFlexibleBooking: action.payload === 'flexible',
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
        selectedServiceCategory: null,
        selectedServiceSubcategory: null,
        selectedStaff: null,
        selectedLocation: null,
        selectedDate: null,
        selectedSlot: null,
        selectedTimeSlot: null,
        formData: {},
        currentStep: 'service',
        isFlexibleBooking: false,
        bookingMode: 'hybrid',
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

const stepOrder: BookingStep[] = ['service', 'subcategory', 'date', 'location', 'staff', 'details', 'confirmation'];

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
    console.log('🚀 Booking mode:', currentState.bookingMode);
    console.log('🚀 Is flexible booking:', currentState.isFlexibleBooking);
    console.log('🚀 Selected category:', currentState.selectedServiceCategory);
    console.log('🚀 Selected subcategory:', currentState.selectedServiceSubcategory);
    
    const currentIndex = stepOrder.indexOf(currentState.currentStep);
    
    // Service selection logic
    if (currentState.currentStep === 'service') {
      console.log('🔄 After service selection - determining next step');
      
      // If we selected a category with subcategories (flexible booking)
      if (currentState.selectedServiceCategory && currentState.isFlexibleBooking) {
        console.log('📋 Selected category with subcategories - going to subcategory step');
        dispatch({ type: 'SET_CURRENT_STEP', payload: 'subcategory' });
        return;
      }
      
      // If we selected a legacy service (fixed booking) or category without subcategories
      if (currentState.selectedService || (currentState.selectedServiceCategory && !currentState.isFlexibleBooking)) {
        console.log('📅 Selected fixed service/category - going to date step');
        dispatch({ type: 'SET_CURRENT_STEP', payload: 'date' });
        return;
      }
    }
    
    // Subcategory selection logic
    if (currentState.currentStep === 'subcategory') {
      console.log('🎯 After subcategory selection - going to location selection');
      dispatch({ type: 'SET_CURRENT_STEP', payload: 'location' });
      return;
    }
    
    // Location selection logic (flexible booking only)
    if (currentState.currentStep === 'location') {
      console.log('📍 After location selection - going to staff selection');
      dispatch({ type: 'SET_CURRENT_STEP', payload: 'staff' });
      return;
    }
    
    // Staff selection logic (flexible booking only)
    if (currentState.currentStep === 'staff') {
      console.log('👤 After staff selection - going to date selection');
      dispatch({ type: 'SET_CURRENT_STEP', payload: 'date' });
      return;
    }
    
    // After date selection
    if (currentState.currentStep === 'date') {
      console.log('📅 After date selection - checking flexible booking requirements');
      
      // For flexible bookings, we've already selected location and staff, go to details
      if (currentState.isFlexibleBooking) {
        console.log('📅 ✅ Flexible booking - going to details');
        dispatch({ type: 'SET_CURRENT_STEP', payload: 'details' });
        return;
      }
      
      // For fixed bookings, check if we need flexible booking steps
      if (currentState.flexibleBookingSettings?.allow_location_selection) {
        console.log('📅 ✅ Fixed booking with location selection - going to location');
        dispatch({ type: 'SET_CURRENT_STEP', payload: 'location' });
        return;
      }
      
      if (currentState.flexibleBookingSettings?.allow_staff_selection) {
        console.log('📅 ✅ Fixed booking with staff selection - going to staff');
        dispatch({ type: 'SET_CURRENT_STEP', payload: 'staff' });
        return;
      }
      
      // Fixed booking without flexible options, go to details
      console.log('📅 ⏭️ Fixed booking - going to details');
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
    console.log('⬅️ Booking mode:', currentState.bookingMode);
    console.log('⬅️ Is flexible booking:', currentState.isFlexibleBooking);
    
    // Handle flexible booking step navigation backwards
    if (currentState.currentStep === 'details') {
      console.log('📝 Coming back from details - checking previous step');
      
      // For flexible bookings, go back to date
      if (currentState.isFlexibleBooking) {
        console.log('📝 ✅ Flexible booking - going back to date');
        dispatch({ type: 'SET_STEP', payload: 'date' });
        return;
      }
      
      // For fixed bookings, check what step we should go to
      if (currentState.flexibleBookingSettings?.allow_staff_selection && 
          (currentState.flexibleBookingSettings?.allow_location_selection || currentState.selectedStaff)) {
        console.log('📝 ✅ Fixed booking - going back to staff selection');
        dispatch({ type: 'SET_STEP', payload: 'staff' });
        return;
      }
      if (currentState.flexibleBookingSettings?.allow_location_selection) {
        console.log('📝 ✅ Fixed booking - going back to location selection');
        dispatch({ type: 'SET_STEP', payload: 'location' });
        return;
      }
      // If no flexible steps, go back to date
      console.log('📝 ⬅️ Fixed booking - going back to date');
      dispatch({ type: 'SET_STEP', payload: 'date' });
      return;
    }
    
    if (currentState.currentStep === 'date') {
      // For flexible bookings, go back to staff
      if (currentState.isFlexibleBooking) {
        console.log('📅 Flexible booking - going back to staff');
        dispatch({ type: 'SET_STEP', payload: 'staff' });
        return;
      }
      
      // For fixed bookings, go back to service
      console.log('📅 Fixed booking - going back to service');
      dispatch({ type: 'SET_STEP', payload: 'service' });
      return;
    }
    
    if (currentState.currentStep === 'staff') {
      // For flexible bookings, go back to location
      if (currentState.isFlexibleBooking) {
        console.log('👤 Flexible booking - going back to location');
        dispatch({ type: 'SET_STEP', payload: 'location' });
        return;
      }
      
      // For fixed bookings with staff selection
      console.log('👤 Fixed booking - going back to date');
      dispatch({ type: 'SET_STEP', payload: 'date' });
      return;
    }
    
    if (currentState.currentStep === 'location') {
      // For flexible bookings, go back to subcategory
      if (currentState.isFlexibleBooking) {
        console.log('📍 Flexible booking - going back to subcategory');
        dispatch({ type: 'SET_STEP', payload: 'subcategory' });
        return;
      }
      
      // For fixed bookings with location selection
      console.log('📍 Fixed booking - going back to date');
      dispatch({ type: 'SET_STEP', payload: 'date' });
      return;
    }
    
    if (currentState.currentStep === 'subcategory') {
      console.log('🎯 Coming back from subcategory - going to service');
      dispatch({ type: 'SET_STEP', payload: 'service' });
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
        return !!(state.selectedService || state.selectedServiceCategory);
      case 'subcategory':
        return !!state.selectedServiceSubcategory;
      case 'location':
        return !!state.selectedLocation;
      case 'staff':
        return !!state.selectedStaff;
      case 'date':
        return !!state.selectedDate && (state.isFlexibleBooking || !!state.selectedTimeSlot);
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
  }, [state.currentStep, state.selectedService, state.selectedServiceCategory, state.selectedServiceSubcategory, state.selectedStaff, state.selectedLocation, state.selectedDate, state.selectedTimeSlot, state.isFlexibleBooking, state.formData]);

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