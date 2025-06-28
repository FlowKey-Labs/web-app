/**
 * Timezone Context Provider for Global Timezone State Management
 * Production-ready with real-time updates and comprehensive error handling
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { DateTime } from 'luxon';
import { 
  getUserTimezone, 
  getTimezoneOptions, 
  validateBookingTimezone,
  getTimezoneDebugInfo,
  processAvailabilitySlots,
  AvailabilitySlot
} from '../utils/timezone';

export interface TimezoneState {
  selectedTimezone: string;
  businessTimezone: string;
  userTimezone: string;
  use24Hour: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string;
  availableTimezones: ReturnType<typeof getTimezoneOptions>;
  currentTime: {
    selected: string;
    business: string;
    user: string;
  };
  conversionErrors: string[];
  debugInfo: {
    selectedTimezone: ReturnType<typeof getTimezoneDebugInfo>;
    businessTimezone: ReturnType<typeof getTimezoneDebugInfo>;
    userTimezone: ReturnType<typeof getTimezoneDebugInfo>;
  };
}

export interface TimezoneActions {
  setSelectedTimezone: (timezone: string) => void;
  setBusinessTimezone: (timezone: string) => void;
  setUse24Hour: (use24Hour: boolean) => void;
  refreshTimezones: () => void;
  convertSlots: (slots: AvailabilitySlot[], sourceTimezone?: string) => AvailabilitySlot[];
  getFormattedTime: (time: string, date?: string) => string;
  validateTimezone: (timezone: string) => ReturnType<typeof validateBookingTimezone>;
  clearErrors: () => void;
  reset: () => void;
}

type TimezoneAction =
  | { type: 'SET_SELECTED_TIMEZONE'; payload: string }
  | { type: 'SET_BUSINESS_TIMEZONE'; payload: string }
  | { type: 'SET_USE_24_HOUR'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'REFRESH_TIMEZONES' }
  | { type: 'UPDATE_CURRENT_TIME' }
  | { type: 'ADD_CONVERSION_ERROR'; payload: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'RESET' };

const initialState: TimezoneState = {
  selectedTimezone: 'Africa/Nairobi',
  businessTimezone: 'Africa/Nairobi',
  userTimezone: getUserTimezone(),
  use24Hour: false,
  isLoading: false,
  error: null,
  lastUpdated: DateTime.now().toISO(),
  availableTimezones: getTimezoneOptions(),
  currentTime: {
    selected: DateTime.now().setZone('Africa/Nairobi').toFormat('h:mm a'),
    business: DateTime.now().setZone('Africa/Nairobi').toFormat('h:mm a'),
    user: DateTime.now().setZone(getUserTimezone()).toFormat('h:mm a'),
  },
  conversionErrors: [],
  debugInfo: {
    selectedTimezone: getTimezoneDebugInfo('Africa/Nairobi'),
    businessTimezone: getTimezoneDebugInfo('Africa/Nairobi'),
    userTimezone: getTimezoneDebugInfo(getUserTimezone()),
  }
};

function timezoneReducer(state: TimezoneState, action: TimezoneAction): TimezoneState {
  switch (action.type) {
    case 'SET_SELECTED_TIMEZONE': {
      const validation = validateBookingTimezone(action.payload);
      const newTimezone = validation.normalizedTimezone;
      
      return {
        ...state,
        selectedTimezone: newTimezone,
        error: validation.isValid ? null : validation.warnings.join(', '),
        conversionErrors: validation.warnings,
        lastUpdated: DateTime.now().toISO(),
        debugInfo: {
          ...state.debugInfo,
          selectedTimezone: getTimezoneDebugInfo(newTimezone)
        }
      };
    }

    case 'SET_BUSINESS_TIMEZONE': {
      const validation = validateBookingTimezone(action.payload);
      const newTimezone = validation.normalizedTimezone;
      
      return {
        ...state,
        businessTimezone: newTimezone,
        error: validation.isValid ? null : validation.warnings.join(', '),
        conversionErrors: validation.warnings,
        lastUpdated: DateTime.now().toISO(),
        debugInfo: {
          ...state.debugInfo,
          businessTimezone: getTimezoneDebugInfo(newTimezone)
        }
      };
    }

    case 'SET_USE_24_HOUR':
      return {
        ...state,
        use24Hour: action.payload,
        lastUpdated: DateTime.now().toISO()
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };

    case 'REFRESH_TIMEZONES':
      return {
        ...state,
        availableTimezones: getTimezoneOptions(),
        lastUpdated: DateTime.now().toISO(),
        currentTime: {
          selected: DateTime.now().setZone(state.selectedTimezone).toFormat(state.use24Hour ? 'HH:mm' : 'h:mm a'),
          business: DateTime.now().setZone(state.businessTimezone).toFormat(state.use24Hour ? 'HH:mm' : 'h:mm a'),
          user: DateTime.now().setZone(state.userTimezone).toFormat(state.use24Hour ? 'HH:mm' : 'h:mm a'),
        },
        debugInfo: {
          selectedTimezone: getTimezoneDebugInfo(state.selectedTimezone),
          businessTimezone: getTimezoneDebugInfo(state.businessTimezone),
          userTimezone: getTimezoneDebugInfo(state.userTimezone),
        }
      };

    case 'UPDATE_CURRENT_TIME':
      return {
        ...state,
        currentTime: {
          selected: DateTime.now().setZone(state.selectedTimezone).toFormat(state.use24Hour ? 'HH:mm' : 'h:mm a'),
          business: DateTime.now().setZone(state.businessTimezone).toFormat(state.use24Hour ? 'HH:mm' : 'h:mm a'),
          user: DateTime.now().setZone(state.userTimezone).toFormat(state.use24Hour ? 'HH:mm' : 'h:mm a'),
        },
        lastUpdated: DateTime.now().toISO()
      };

    case 'ADD_CONVERSION_ERROR':
      return {
        ...state,
        conversionErrors: [...state.conversionErrors, action.payload]
      };

    case 'CLEAR_ERRORS':
      return {
        ...state,
        error: null,
        conversionErrors: []
      };

    case 'RESET':
      return {
        ...initialState,
        userTimezone: getUserTimezone()
      };

    default:
      return state;
  }
}

const TimezoneContext = createContext<{
  state: TimezoneState;
  actions: TimezoneActions;
} | null>(null);

interface TimezoneProviderProps {
  children: ReactNode;
  initialBusinessTimezone?: string;
  initialSelectedTimezone?: string;
  autoUpdate?: boolean;
  updateInterval?: number;
}

export function TimezoneProvider({ 
  children, 
  initialBusinessTimezone = 'Africa/Nairobi',
  initialSelectedTimezone,
  autoUpdate = true,
  updateInterval = 60000 // 1 minute
}: TimezoneProviderProps) {
  const [state, dispatch] = useReducer(timezoneReducer, {
    ...initialState,
    businessTimezone: initialBusinessTimezone,
    selectedTimezone: initialSelectedTimezone || initialBusinessTimezone,
    debugInfo: {
      selectedTimezone: getTimezoneDebugInfo(initialSelectedTimezone || initialBusinessTimezone),
      businessTimezone: getTimezoneDebugInfo(initialBusinessTimezone),
      userTimezone: getTimezoneDebugInfo(getUserTimezone()),
    }
  });

  // Auto-update current time
  useEffect(() => {
    if (!autoUpdate) return;

    const interval = setInterval(() => {
      dispatch({ type: 'UPDATE_CURRENT_TIME' });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [autoUpdate, updateInterval]);

  // Refresh timezone options when DST changes
  useEffect(() => {
    const checkDSTChanges = () => {
      dispatch({ type: 'REFRESH_TIMEZONES' });
    };

    // Check for DST changes daily
    const dstCheckInterval = setInterval(checkDSTChanges, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(dstCheckInterval);
  }, []);

  // Actions
  const setSelectedTimezone = useCallback((timezone: string) => {
    dispatch({ type: 'SET_SELECTED_TIMEZONE', payload: timezone });
  }, []);

  const setBusinessTimezone = useCallback((timezone: string) => {
    dispatch({ type: 'SET_BUSINESS_TIMEZONE', payload: timezone });
  }, []);

  const setUse24Hour = useCallback((use24Hour: boolean) => {
    dispatch({ type: 'SET_USE_24_HOUR', payload: use24Hour });
  }, []);

  const refreshTimezones = useCallback(() => {
    dispatch({ type: 'REFRESH_TIMEZONES' });
  }, []);

  const convertSlots = useCallback((slots: any[], sourceTimezone?: string) => {
    try {
      const source = sourceTimezone || state.businessTimezone;
      return processAvailabilitySlots(slots, source, state.selectedTimezone);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown slot conversion error';
      dispatch({ type: 'ADD_CONVERSION_ERROR', payload: errorMessage });
      console.error('Slot conversion error:', error);
      return slots; // Return original slots on error
    }
  }, [state.businessTimezone, state.selectedTimezone]);

  const getFormattedTime = useCallback((time: string, date?: string) => {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const baseDate = date || DateTime.now().toISODate();
      const sourceDateTime = DateTime.fromISO(`${baseDate}T${time}:00`, { zone: state.businessTimezone });
      const converted = sourceDateTime.setZone(state.selectedTimezone);
      
      return state.use24Hour ? converted.toFormat('HH:mm') : converted.toFormat('h:mm a');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Time formatting error';
      dispatch({ type: 'ADD_CONVERSION_ERROR', payload: errorMessage });
      console.error('Time formatting error:', error);
      return time; // Return original time on error
    }
  }, [state.businessTimezone, state.selectedTimezone, state.use24Hour]);

  const validateTimezone = useCallback((timezone: string) => {
    return validateBookingTimezone(timezone);
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const value = {
    state,
    actions: {
      setSelectedTimezone,
      setBusinessTimezone,
      setUse24Hour,
      refreshTimezones,
      convertSlots,
      getFormattedTime,
      validateTimezone,
      clearErrors,
      reset
    }
  };

  return (
    <TimezoneContext.Provider value={value}>
      {children}
    </TimezoneContext.Provider>
  );
}

// Custom hook to use timezone context
export function useTimezone() {
  const context = useContext(TimezoneContext);
  
  if (!context) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  
  return context;
}

// Hook for timezone-aware slot processing
export function useTimezoneSlots(slots: any[], sourceTimezone?: string) {
  const { state, actions } = useTimezone();
  
  return React.useMemo(() => {
    return actions.convertSlots(slots, sourceTimezone);
  }, [slots, sourceTimezone, state.selectedTimezone, state.businessTimezone, actions]);
}

// Hook for timezone-aware time formatting
export function useTimezoneFormat() {
  const { state, actions } = useTimezone();
  
  return React.useCallback((time: string, date?: string) => {
    return actions.getFormattedTime(time, date);
  }, [actions, state.selectedTimezone, state.use24Hour]);
}

// Production debug utilities
export function useTimezoneDebug() {
  const { state } = useTimezone();
  
  return {
    state,
    logState: () => console.log('Timezone State:', state),
    getDebugInfo: () => state.debugInfo,
    hasErrors: () => state.error !== null || state.conversionErrors.length > 0,
    getErrors: () => ({
      error: state.error,
      conversionErrors: state.conversionErrors
    })
  };
} 