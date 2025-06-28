import { motion } from 'framer-motion';
import { Text } from '@mantine/core';
import { useBookingFlow } from '../PublicBookingProvider';
import { BookingStep } from '../../../types/clientTypes';

interface UnifiedProgressIndicatorProps {
  className?: string;
}

export function UnifiedProgressIndicator({ className = '' }: UnifiedProgressIndicatorProps) {
  const { state } = useBookingFlow();

  // Dynamically calculate steps based on flexible booking settings
  const getStepOrder = () => {
    const baseSteps = ['service', 'date'];
    const flexibleSteps = [];
    
    if (state.flexibleBookingSettings?.allow_staff_selection) {
      flexibleSteps.push('staff');
    }
    if (state.flexibleBookingSettings?.allow_location_selection) {
      flexibleSteps.push('location');
    }
    
    return [...baseSteps, ...flexibleSteps, 'details', 'confirmation'];
  };

  const getStepLabels = () => {
    const labels: Record<string, string> = {
      service: 'Service',
      date: 'Date',
      staff: 'Staff',
      location: 'Location',
      details: 'Details',
      confirmation: 'Confirm'
    };
    return labels;
  };

  const stepOrder = getStepOrder();
  const stepLabels = getStepLabels();
  const currentStepIndex = stepOrder.indexOf(state.currentStep);
  const totalSteps = stepOrder.length;
  const progressPercentage = ((currentStepIndex + 1) / totalSteps) * 100;

  // Only render desktop variant - mobile progress is handled in MobileBusinessHeader
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className={`hidden lg:block bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/20 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <Text className="text-slate-800 text-sm font-medium">
          Progress
        </Text>
        <Text size="xs" className="text-slate-600">
          Step {currentStepIndex + 1} of {totalSteps}
        </Text>
      </div>
      
      {/* Horizontal Progress Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-slate-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <Text size="xs" className="text-slate-600 font-medium">
          {Math.round(progressPercentage)}%
        </Text>
      </div>
      
      {/* Dynamic Step Labels */}
      <div className="flex justify-between mt-2 text-xs flex-wrap gap-1">
        {stepOrder.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          
          return (
            <span 
              key={step}
              className={
                isCompleted 
                  ? "text-emerald-600" 
                  : isCurrent 
                  ? "text-slate-900 font-medium" 
                  : "text-slate-400"
              }
            >
              {isCompleted ? "✓ " : ""}{stepLabels[step]}
            </span>
          );
        })}
      </div>
    </motion.div>
  );
} 