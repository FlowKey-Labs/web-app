import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Text, 
  Button, 
  Title,
} from '@mantine/core';
import { motion } from 'framer-motion';
import { withBranding } from '../../hoc/withBranding';

type SuccessType = 'cancelled' | 'rescheduled';

interface BookingSuccessProps {
  type: SuccessType;
}

const BookingSuccess: React.FC<BookingSuccessProps> = ({ type }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { bookingReference, sessionTitle, businessName, reason } = location.state || {};

  const config = {
    cancelled: {
      emoji: '✅',
      title: 'Booking Cancelled',
      message: 'Your booking has been successfully cancelled.',
      description: 'We understand plans can change. Your spot is now available for other clients.',
      bgGradient: 'from-emerald-50 via-green-50 to-teal-50',
    },
    rescheduled: {
      emoji: '🔄',
      title: 'Booking Rescheduled',
      message: 'Your booking has been successfully rescheduled.',
      description: 'You should receive a confirmation email with your new booking details shortly.',
      bgGradient: 'from-emerald-50 via-green-50 to-teal-50',
    }
  };

  const { emoji, title, message, description, bgGradient } = config[type];

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className={`min-h-screen w-full bg-gradient-to-br ${bgGradient} flex items-center justify-center px-4`}>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-4xl mx-auto"
      >
        <div className="flex flex-col lg:flex-row min-h-[80vh] bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
          {/* LEFT SECTION - Visual Success Indicator */}
          <div className="lg:w-2/5 bg-gradient-to-br from-emerald-500 to-green-600 p-8 lg:p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full translate-y-12 -translate-x-12"></div>
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="relative z-10 text-center"
            >
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5, type: "spring", bounce: 0.3 }}
                className="w-32 h-32 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30"
              >
                <span className="text-6xl">{emoji}</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <Title 
                  order={1} 
                  className="text-3xl lg:text-4xl font-bold mb-4 text-white"
                >
                  {title}
                </Title>
                <Text className="text-white/90 text-lg lg:text-xl leading-relaxed">
                  {message}
                </Text>
              </motion.div>
            </motion.div>
          </div>

          {/* RIGHT SECTION - Details and Actions */}
          <div className="lg:w-3/5 p-8 lg:p-12 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="space-y-8"
            >
              {/* Description */}
              <div className="text-center lg:text-left">
                <Text className="text-slate-600 text-lg leading-relaxed">
                  {description}
                </Text>
              </div>

              {/* Booking Details */}
              {bookingReference && (
                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200/50">
                  <Title order={3} className="text-emerald-800 font-semibold mb-4">
                    📋 Booking Details
                  </Title>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Text className="text-slate-600 font-medium">Reference: </Text>
                      <Text className="text-emerald-700 font-bold text-lg">{bookingReference}</Text>
                    </div>
                    {sessionTitle && (
                      <div className="flex justify-between items-center">
                        <Text className="text-slate-600 font-medium">Session: </Text>
                        <Text className="text-slate-800 font-semibold">{sessionTitle}</Text>
                      </div>
                    )}
                    {businessName && (
                      <div className="flex justify-between items-center">
                        <Text className="text-slate-600 font-medium">Business: </Text>
                        <Text className="text-slate-800 font-semibold">{businessName}</Text>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cancellation Reason */}
              {reason && type === 'cancelled' && (
                <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200/50">
                  <Title order={3} className="text-orange-800 font-semibold mb-4">
                    💬 Cancellation Reason
                  </Title>
                  <Text className="text-orange-700 italic">"{reason}"</Text>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  size="lg"
                  className="border-emerald-500 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-600 transition-all duration-200"
                >
                  Return Home
                </Button>
                {type === 'cancelled' && (
                  <Button 
                    onClick={() => navigate('/book')}
                    size="lg"
                    className="btn-green-primary font-semibold shadow-lg hover:shadow-xl"
                  >
                    Book Another Session
                  </Button>
                )}
              </div>

              {/* Additional Info */}
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200/50">
                <div className="text-center">
                  <Text className="text-blue-800 font-medium mb-2">
                    📧 Email Confirmation
                  </Text>
                  <Text className="text-blue-700 text-sm leading-relaxed">
                    You will receive an email confirmation shortly.
                    <br />
                    If you have any questions, please contact the business directly.
                  </Text>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const BookingCancelled = withBranding(() => <BookingSuccess type="cancelled" />, {showHelpText: false});
export const BookingRescheduled = withBranding(() => <BookingSuccess type="rescheduled" />);

export default BookingSuccess; 