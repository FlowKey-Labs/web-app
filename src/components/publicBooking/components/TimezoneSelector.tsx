/**
 * Timezone Selector Component
 * Production-ready timezone selection with real-time updates and enhanced UX
 */

import React, { useMemo } from 'react';
import { Select, Switch, Text, Badge, Alert, Paper } from '@mantine/core';
import { useTimezone } from '../../../contexts/TimezoneContext';
import { validateBookingTimezone } from '../../../utils/timezone';

interface TimezoneSelectorProps {
  className?: string;
  showCurrentTime?: boolean;
  show24HourToggle?: boolean;
  showBusinessTimezone?: boolean;
  businessTimezone?: string;
  onTimezoneChange?: (timezone: string) => void;
}

export function TimezoneSelector({
  className = '',
  showCurrentTime = true,
  show24HourToggle = true,
  showBusinessTimezone = true,
  businessTimezone,
  onTimezoneChange
}: TimezoneSelectorProps) {
  const { state: timezoneState, actions: timezoneActions } = useTimezone();

  // Enhanced timezone options with real-time offsets
  const timezoneOptions = useMemo(() => {
    return timezoneState.availableTimezones?.all?.map(option => ({
      value: option.value,
      label: option.label,
      group: option.region
    })) || [];
  }, [timezoneState.availableTimezones]);

  // Enhanced timezone change handler
  const handleTimezoneChange = (value: string | null) => {
    if (!value) return;
    
    const validation = validateBookingTimezone(value);
    if (!validation.isValid) {
      console.warn('Invalid timezone selected:', value, validation.warnings);
      return;
    }
    
    const newTimezone = validation.normalizedTimezone;
    timezoneActions.setSelectedTimezone(newTimezone);
    
    // Call external handler if provided
    if (onTimezoneChange) {
      onTimezoneChange(newTimezone);
    }
    
    console.log('🌍 Timezone changed:', {
      from: timezoneState.selectedTimezone,
      to: newTimezone,
      validation
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Timezone Selector */}
      <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 items-start">
        <Select
          label="Timezone"
          value={timezoneState.selectedTimezone}
          onChange={handleTimezoneChange}
          data={timezoneOptions}
          className="flex-1"
          classNames={{
            input: "bg-white/60 backdrop-blur-sm border-white/30 focus:border-emerald-300",
            label: "text-slate-700 font-medium text-sm"
          }}
          searchable
          clearable={false}
          description={`Times will be displayed in ${timezoneState.selectedTimezone}`}
        />
        
        {/* 24-hour format toggle */}
        {show24HourToggle && (
          <div className="flex items-center gap-2 mt-6">
            <Switch
              checked={timezoneState.use24Hour}
              onChange={(event) => timezoneActions.setUse24Hour(event.currentTarget.checked)}
              size="sm"
              color="teal"
              label="24-hour format"
            />
          </div>
        )}
      </div>

      {/* Current Time Display */}
      {showCurrentTime && (
        <Paper className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <Text size="xs" className="text-slate-500 mb-1">Current Time</Text>
              <Text className="font-mono font-semibold text-slate-800">
                {timezoneState.currentTime.selected}
              </Text>
            </div>
            {showBusinessTimezone && businessTimezone && businessTimezone !== timezoneState.selectedTimezone && (
              <div className="text-right">
                <Text size="xs" className="text-slate-500 mb-1">Business Time</Text>
                <Text className="font-mono text-sm text-slate-600">
                  {timezoneState.currentTime.business}
                </Text>
                <Badge size="xs" color="blue" variant="light">
                  {businessTimezone}
                </Badge>
              </div>
            )}
          </div>
        </Paper>
      )}

      {/* Timezone Conversion Status */}
      {timezoneState.conversionErrors.length > 0 && (
        <Alert
          color="yellow"
          size="sm"
          onClose={timezoneActions.clearErrors}
          withCloseButton
        >
          <Text size="sm">
            Timezone conversion warnings: {timezoneState.conversionErrors.join(', ')}
          </Text>
        </Alert>
      )}

      {/* Timezone Information */}
      {timezoneState.selectedTimezone !== timezoneState.userTimezone && (
        <Paper className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Badge size="sm" color="blue" variant="light">
              Info
            </Badge>
            <Text size="sm" className="text-blue-800">
              Times are being converted from your local timezone ({timezoneState.userTimezone}) to {timezoneState.selectedTimezone}
            </Text>
          </div>
        </Paper>
      )}

      {/* Business Timezone Different Warning */}
      {businessTimezone && businessTimezone !== timezoneState.selectedTimezone && (
        <Paper className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Badge size="sm" color="orange" variant="light">
              Notice
            </Badge>
            <Text size="sm" className="text-amber-800">
              The business operates in {businessTimezone}. Times shown are converted to your selected timezone ({timezoneState.selectedTimezone}).
            </Text>
          </div>
        </Paper>
      )}
    </div>
  );
}

export default TimezoneSelector; 