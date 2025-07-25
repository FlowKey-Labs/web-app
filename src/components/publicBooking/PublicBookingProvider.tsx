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
import { useGetPublicBusinessServices } from '../../hooks/reactQuery';

interface BookingAction {
  type: 'SET_BUSINESS_INFO' | 'SELECT_SERVICE' | 'SELECT_SERVICE_CATEGORY' | 'SELECT_SERVICE_SUBCATEGORY' | 'SELECT_STAFF' | 'SELECT_LOCATION' | 'SELECT_DATE' | 'SELECT_SLOT' | 'SELECT_TIME_SLOT' | 'SET_TIMEZONE' | 'UPDATE_FORM_DATA' | 'SET_STEP' | 'SET_CURRENT_STEP' | 'RESET_FLOW' | 'RESET_SELECTIONS' | 'SET_FLEXIBLE_SETTINGS' | 'CLEAR_FLEXIBLE_SELECTIONS' | 'SET_BOOKING_CONFIRMATION' | 'SET_BOOKING_MODE' | 'SET_PRESELECTION' | 'SET_PRESELECTED_LOCATION_ID' | 'SET_PRESELECTED_STAFF_ID';
  payload?: any;
  
}

const initialState: BookingFlowState & { bookingConfirmation?: BookingConfirmation | null; preselectedLocationId?: number; preselectedStaffId?: number } = {
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
  preselectedLocationId: undefined,
  preselectedStaffId: undefined,
};

function bookingReducer(state: BookingFlowState & { bookingConfirmation?: BookingConfirmation | null; preselectedLocationId?: number; preselectedStaffId?: number }, action: BookingAction): BookingFlowState & { bookingConfirmation?: BookingConfirmation | null; preselectedLocationId?: number; preselectedStaffId?: number } {
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
    case 'SELECT_SERVICE_CATEGORY': {
      // Handle service category selection (check business settings for flexible booking)
      const category = action.payload as PublicServiceCategory;
      const hasSubcategories = category.subcategories && category.subcategories.length > 0;
      
      // Only enable flexible booking if business settings allow it AND there are subcategories
      const businessAllowsFlexible = state.businessInfo?.booking_settings?.enable_flexible_booking && 
                                     state.businessInfo?.booking_settings?.available_booking_types?.flexible;
      const shouldUseFlexible = businessAllowsFlexible && hasSubcategories;
      
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
        isFlexibleBooking: shouldUseFlexible,
        bookingMode: shouldUseFlexible ? 'flexible' : 'fixed',
      };
    }
    case 'SELECT_SERVICE_SUBCATEGORY': {
      // Handle service subcategory selection (flexible bookings)
      // Only allow flexible booking if business settings permit it
      const businessAllowsFlexibleSubcat = state.businessInfo?.booking_settings?.enable_flexible_booking && 
                                          state.businessInfo?.booking_settings?.available_booking_types?.flexible;
      
      return {
        ...state,
        selectedServiceSubcategory: action.payload as PublicServiceSubcategory,
        selectedStaff: null,
        selectedLocation: null,
        selectedDate: null, 
        selectedSlot: null,
        selectedTimeSlot: null,
        formData: { ...state.formData, service_id: action.payload?.id },
        isFlexibleBooking: businessAllowsFlexibleSubcat,
        bookingMode: businessAllowsFlexibleSubcat ? 'flexible' : 'fixed',
      };
    }
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
    case 'SET_PRESELECTION':
      return {
        ...state,
        selectedService: action.payload.selectedService,
        selectedServiceCategory: action.payload.selectedServiceCategory,
        selectedServiceSubcategory: action.payload.selectedServiceSubcategory,
        selectedStaff: action.payload.selectedStaff,
        selectedLocation: action.payload.selectedLocation,
        selectedDate: action.payload.selectedDate,
        selectedSlot: action.payload.selectedSlot,
        selectedTimeSlot: action.payload.selectedTimeSlot,
        formData: { ...state.formData, ...action.payload.formData },
        currentStep: action.payload.currentStep,
        isFlexibleBooking: action.payload.isFlexibleBooking,
        bookingMode: action.payload.bookingMode,
        flexibleBookingSettings: action.payload.flexibleBookingSettings,
        bookingConfirmation: action.payload.bookingConfirmation,
      };
    case 'SET_PRESELECTED_LOCATION_ID':
      return {
        ...state,
        preselectedLocationId: action.payload as number,
        formData: { ...state.formData, selected_location_id: action.payload as number },
      };
    case 'SET_PRESELECTED_STAFF_ID':
      return {
        ...state,
        preselectedStaffId: action.payload as number,
        formData: { ...state.formData, selected_staff_id: action.payload as number },
      };
    default:
      return state;
  }
}

interface BookingContextType {
  state: BookingFlowState & { bookingConfirmation?: BookingConfirmation | null; preselectedLocationId?: number; preselectedStaffId?: number };
  dispatch: React.Dispatch<BookingAction>;
  goToStep: (step: BookingStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  canProceedToNext: () => boolean;
  resetFlow: () => void;
  setPreselection: (preselection: any) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const stepOrder: BookingStep[] = ['service', 'subcategory', 'date', 'location', 'staff', 'details', 'confirmation'];

interface BookingProviderProps {
  children: ReactNode;
  businessSlug?: string;
  preselection?: {
    sessionId?: number;
    serviceId?: number;
    staffId?: number;
    locationId?: number;
  };
}

export function PublicBookingProvider({ children, businessSlug, preselection }: BookingProviderProps) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);
  const { state: timezoneState, actions: timezoneActions } = useTimezone();
  
  // Fetch services data when preselection is provided and we have a businessSlug
  const shouldFetchServices = !!(businessSlug && preselection);
  const {
    data: services,
    isLoading: servicesLoading,
  } = useGetPublicBusinessServices(shouldFetchServices ? businessSlug! : '');
  
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

  // Handle preselection when business info and services are available
  useEffect(() => {
    if (preselection && state.businessInfo && !state.selectedService && !state.selectedServiceCategory && !servicesLoading) {
      console.log('🎯 Processing preselection:', preselection);
      
      // Process direct session link
      if (preselection.sessionId && services) {
        // Look for session in services data (sessions appear as individual services)
        const session = services.find((service: any) => 
          service.session_id === preselection.sessionId || service.id === preselection.sessionId
        );
        
        if (session) {
          console.log('📋 Direct session link - selecting session:', session);
          dispatch({ 
            type: 'SELECT_SERVICE', 
            payload: {
              id: session.id,
              name: session.name,
              description: session.description,
              duration_minutes: session.duration_minutes,
              capacity: session.capacity,
              price: session.price,
              category_type: session.category_type,
              image_url: session.image_url,
              session_id: session.session_id || session.id,
              is_session: true,
            }
          });
          // Skip to date selection for direct session bookings
          dispatch({ 
            type: 'SET_CURRENT_STEP', 
            payload: 'date' 
          });
          return;
        } else {
          console.warn('⚠️ Session not found for sessionId:', preselection.sessionId);
        }
      }
      
      // Process direct service link (flexible booking)
      if (preselection.serviceId && services) {
        const service = services.find((cat: any) => 
          cat.subcategories?.some((sub: any) => sub.id === preselection.serviceId)
        );
        const subcategory = service?.subcategories?.find((sub: any) => sub.id === preselection.serviceId);
        
        // Also check if the subcategory is marked as a service
        if (service && subcategory && subcategory.is_service === true) {
          console.log('🎯 Direct service link - selecting service category and subcategory:', { service, subcategory });
          
          // Set service category and subcategory
          dispatch({ 
            type: 'SELECT_SERVICE_CATEGORY', 
            payload: service 
          });
          dispatch({ 
            type: 'SELECT_SERVICE_SUBCATEGORY', 
            payload: subcategory 
          });
          
          // Store preselected staff ID (staff object will be resolved later)
          if (preselection.staffId) {
            console.log('👤 Storing preselected staff ID:', preselection.staffId);
            dispatch({ 
              type: 'SET_PRESELECTED_STAFF_ID', 
              payload: preselection.staffId 
            });
          }
          
          // Store preselected location ID (location object will be resolved later)
          if (preselection.locationId) {
            console.log('📍 Storing preselected location ID:', preselection.locationId);
            dispatch({ 
              type: 'SET_PRESELECTED_LOCATION_ID', 
              payload: preselection.locationId 
            });
          }
          
          // Determine starting step based on what's pre-selected
          if (preselection.staffId && preselection.locationId) {
            // Both staff and location pre-selected, go to date
            console.log('🎯 Both staff and location pre-selected, going to date');
            dispatch({ 
              type: 'SET_CURRENT_STEP', 
              payload: 'date' 
            });
          } else if (preselection.staffId) {
            // Only staff pre-selected, go to location
            console.log('🎯 Only staff pre-selected, going to location');
            dispatch({ 
              type: 'SET_CURRENT_STEP', 
              payload: 'location' 
            });
          } else if (preselection.locationId) {
            // Only location pre-selected, go to staff
            console.log('🎯 Only location pre-selected, going to staff');
            dispatch({ 
              type: 'SET_CURRENT_STEP', 
              payload: 'staff' 
            });
          } else {
            // Nothing pre-selected, go to location (normal flexible booking flow)
            console.log('🎯 Nothing pre-selected, going to location');
            dispatch({ 
              type: 'SET_CURRENT_STEP', 
              payload: 'location' 
            });
          }
          
          return;
        } else {
          console.warn('⚠️ Service not found or not marked as service for serviceId:', preselection.serviceId);
        }
      }
    }
  }, [preselection, state.businessInfo, state.selectedService, state.selectedServiceCategory, services, servicesLoading]);

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

  const setPreselection = useCallback((preselection: any) => {
    dispatch({ type: 'SET_PRESELECTION', payload: preselection });
  }, []);

  const contextValue: BookingContextType = useMemo(() => ({
    state,
    dispatch,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    canProceedToNext,
    resetFlow,
    setPreselection,
  }), [state, goToStep, goToNextStep, goToPreviousStep, canProceedToNext, resetFlow, setPreselection]);

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