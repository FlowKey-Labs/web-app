import { motion } from 'framer-motion';
import { Text } from '@mantine/core';
import { useBookingFlow } from '../PublicBookingProvider';
import { BookingStep } from '../../../types/clientTypes';

interface UnifiedProgressIndicatorProps {
  className?: string;
}

const stepNumbers: Record<BookingStep, number> = {
  service: 1,
  date: 2,
  time: 2,
  details: 3,
  confirmation: 4
};

export function UnifiedProgressIndicator({ className = '' }: UnifiedProgressIndicatorProps) {
  const { state } = useBookingFlow();
  const currentStepNumber = stepNumbers[state.currentStep] || 1;
  const totalSteps = 4;
  const progressPercentage = (currentStepNumber / totalSteps) * 100;

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
          Step {currentStepNumber} of {totalSteps}
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
      
      <div className="flex justify-between mt-2 text-xs">
        <span className={currentStepNumber > 1 ? "text-emerald-600" : "text-slate-900 font-medium"}>
          {currentStepNumber > 1 ? "✓" : ""} Service
        </span>
        <span className={currentStepNumber > 2 ? "text-emerald-600" : currentStepNumber === 2 ? "text-slate-900 font-medium" : "text-slate-400"}>
          {currentStepNumber > 2 ? "✓" : ""} Date
        </span>
        <span className={currentStepNumber > 3 ? "text-emerald-600" : currentStepNumber === 3 ? "text-slate-900 font-medium" : "text-slate-400"}>
          {currentStepNumber > 3 ? "✓" : ""} Details
        </span>
        <span className={currentStepNumber === 4 ? "text-slate-900 font-medium" : "text-slate-400"}>
          Confirm
        </span>
      </div>
    </motion.div>
  );
} 