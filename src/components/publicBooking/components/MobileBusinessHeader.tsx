import React from 'react';
import { motion } from 'framer-motion';
import { Text, Progress, Collapse, Badge, Button, ActionIcon } from '@mantine/core';
import { ChevronDownIcon, ChevronUpIcon } from '../bookingIcons';
import { useBookingFlow } from '../PublicBookingProvider';
import { PublicBusinessInfo } from '../../../types/clientTypes';

interface MobileBusinessHeaderProps {
  businessInfo: PublicBusinessInfo;
  scrollY: number;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onServiceChange?: () => void;
}

const stepLabels = {
  service: 'Select Service',
  date: 'Choose Date & Time', 
  details: 'Your Details',
  confirmation: 'Confirm Booking'
};

const stepNumbers = {
  service: 1,
  date: 2,
  details: 3,
  confirmation: 4
};

export function MobileBusinessHeader({ 
  businessInfo, 
  scrollY, 
  isExpanded, 
  onToggleExpanded,
  onServiceChange 
}: MobileBusinessHeaderProps) {
  const { state } = useBookingFlow();
  const isCompact = scrollY > 100;
  
  const businessName = businessInfo.business_name || 'Business';
  const serviceName = state.selectedService?.name || 'Service';
  
  // Calculate progress
  const currentStepNumber = stepNumbers[state.currentStep] || 1;
  const totalSteps = 4;
  const progressPercentage = (currentStepNumber / totalSteps) * 100;

  return (
    <motion.div
      className="lg:hidden sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-white/20"
      animate={{
        height: isCompact ? 80 : isExpanded ? 'auto' : 120,
        paddingTop: isCompact ? 8 : 16,
        paddingBottom: isCompact ? 8 : 16,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              className="rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg"
              animate={{
                width: isCompact ? 40 : 48,
                height: isCompact ? 40 : 48,
              }}
            >
              <span className={`font-bold text-white ${isCompact ? 'text-lg' : 'text-xl'}`}>
                {businessName.charAt(0).toUpperCase()}
              </span>
            </motion.div>
            
            <div className="flex-1">
              <motion.div
                animate={{
                  fontSize: isCompact ? '16px' : '18px',
                }}
                className="font-bold text-slate-900 leading-tight"
              >
                {businessName}
              </motion.div>
              {!isCompact && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-slate-600"
                >
                  {stepLabels[state.currentStep]}
                </motion.div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isCompact && (
              <ActionIcon
                variant="subtle"
                onClick={onToggleExpanded}
                className="text-slate-600"
              >
                {isExpanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
              </ActionIcon>
            )}
          </div>
        </div>
        
        {/* Progress bar */}
        <motion.div
          className="mt-3"
          animate={{ opacity: isCompact ? 0.7 : 1 }}
        >
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
            <span>Step {currentStepNumber} of {totalSteps}</span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} size="sm" color="teal" />
        </motion.div>
        
        {/* Expandable details */}
        <Collapse in={isExpanded && !isCompact}>
          <div className="mt-4 space-y-3">
            {state.selectedService && (
              <div className="bg-emerald-50 rounded-lg p-3">
                <Text className="text-sm font-medium text-emerald-800 mb-1">Selected Service</Text>
                <Text className="text-xs text-emerald-700">{serviceName}</Text>
                <div className="flex items-center justify-between mt-2">
                  {state.selectedService.duration_minutes && (
                    <Text className="text-xs text-emerald-600">
                      {state.selectedService.duration_minutes} min
                    </Text>
                  )}
                  {state.selectedService.price ? (
                    <Text className="text-xs font-bold text-emerald-700">
                      KSh {state.selectedService.price}
                    </Text>
                  ) : (
                    <Badge color="green" variant="light" size="xs">Free</Badge>
                  )}
                </div>
              </div>
            )}
            
            {state.selectedDate && state.selectedTimeSlot && (
              <div className="bg-blue-50 rounded-lg p-3">
                <Text className="text-sm font-medium text-blue-800 mb-1">Selected Date & Time</Text>
                <Text className="text-xs text-blue-700">
                  {typeof state.selectedDate === 'string' 
                    ? new Date(state.selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                    : state.selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                  }
                </Text>
                <Text className="text-xs text-blue-700">
                  {state.selectedTimeSlot.start_time} - {state.selectedTimeSlot.end_time}
                </Text>
              </div>
            )}
            
            {onServiceChange && (
              <Button
                variant="outline"
                size="xs"
                className="w-full border-emerald-200 text-emerald-700"
                onClick={onServiceChange}
              >
                Change Service
              </Button>
            )}
          </div>
        </Collapse>
      </div>
    </motion.div>
  );
} 