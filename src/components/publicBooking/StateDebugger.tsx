import React from 'react';
import { useBookingFlow } from './PublicBookingProvider';

export function StateDebugger() {
  const { state } = useBookingFlow();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '400px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#4ade80' }}>🔍 Booking State Debug</h4>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Current Step:</strong> <span style={{ color: '#fbbf24' }}>{state.currentStep}</span>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Booking Mode:</strong> <span style={{ color: '#a78bfa' }}>{state.bookingMode || 'unknown'}</span>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Is Flexible:</strong> <span style={{ color: state.isFlexibleBooking ? '#10b981' : '#ef4444' }}>
          {state.isFlexibleBooking ? 'Yes' : 'No'}
        </span>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Selected Service:</strong> <span style={{ color: '#60a5fa' }}>
          {state.selectedService?.name || 'None'}
        </span>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Selected Category:</strong> <span style={{ color: '#60a5fa' }}>
          {state.selectedServiceCategory?.name || 'None'}
        </span>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Selected Subcategory:</strong> <span style={{ color: '#60a5fa' }}>
          {state.selectedServiceSubcategory?.name || 'None'}
        </span>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Selected Staff:</strong> <span style={{ color: '#34d399' }}>
          {state.selectedStaff?.name || 'None'} {state.selectedStaff?.id ? `(ID: ${state.selectedStaff.id})` : ''}
        </span>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Selected Location:</strong> <span style={{ color: '#f472b6' }}>
          {state.selectedLocation?.name || 'None'} {state.selectedLocation?.id ? `(ID: ${state.selectedLocation.id})` : ''}
        </span>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Selected Date:</strong> <span style={{ color: '#fb7185' }}>
          {state.selectedDate ? new Date(state.selectedDate).toDateString() : 'None'}
        </span>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Selected Time Slot:</strong> <span style={{ color: '#fbbf24' }}>
          {state.selectedTimeSlot ? `${state.selectedTimeSlot.start_time}-${state.selectedTimeSlot.end_time}` : 'None'}
        </span>
      </div>
    </div>
  );
} 