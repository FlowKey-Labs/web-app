import React from 'react';
import { Box, Group, Text, Progress, Stack } from '@mantine/core';
import { CheckIcon } from './bookingIcons';
import { BookingStep } from '../../types/clientTypes';
import { useBookingFlow } from './PublicBookingProvider';

const stepLabels: Record<BookingStep, string> = {
  service: 'Select Service',
  date: 'Choose Date',
  time: 'Pick Time',
  details: 'Your Details',
  confirmation: 'Confirmation',
};

const stepOrder: BookingStep[] = ['service', 'date', 'time', 'details', 'confirmation'];

export function BookingProgressIndicator() {
  const { state } = useBookingFlow();
  const currentStepIndex = stepOrder.indexOf(state.currentStep);
  const progressPercentage = ((currentStepIndex + 1) / stepOrder.length) * 100;

  return (
    <Stack gap="lg">
      {/* Progress Bar */}
      <Progress 
        value={progressPercentage} 
        color="#1D9B5E" 
        size="sm" 
        radius="xl"
        style={{
          backgroundColor: '#f1f3f4',
        }}
      />
      
      {/* Step Indicators */}
      <Group justify="space-between" gap="xs">
        {stepOrder.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isUpcoming = index > currentStepIndex;

          return (
            <Group key={step} gap="xs" style={{ flex: 1, minWidth: 0 }}>
              {/* Step Circle */}
              <Box
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isCompleted 
                    ? '#1D9B5E' 
                    : isCurrent 
                    ? '#1D9B5E' 
                    : '#f1f3f4',
                  color: isCompleted || isCurrent ? 'white' : '#9ca3af',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: isCurrent ? '2px solid #1D9B5E' : 'none',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
              >
                {isCompleted ? (
                  <CheckIcon className="w-3.5 h-3.5" />
                ) : (
                  index + 1
                )}
              </Box>

              {/* Step Label */}
              <Text
                size="sm"
                color={
                  isCompleted || isCurrent ? '#1D9B5E' : '#9ca3af'
                }
                fw={isCurrent ? 600 : 500}
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  minWidth: 0,
                }}
              >
                {stepLabels[step]}
              </Text>
            </Group>
          );
        })}
      </Group>
    </Stack>
  );
} 