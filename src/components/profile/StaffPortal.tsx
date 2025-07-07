import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
import {
  Card,
  Badge,
  Button,
  Text,
  Title,
  Loader,
  Paper,
  Modal,
  TextInput,
  Textarea,
  Select,
  Switch,
  Group,
  Stack,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { 
  useGetStaffPortalData,
  useCreateStaffOwnException,
  useUpdateStaffOwnException,
} from '../../hooks/reactQuery';

import errorIcon from '../../assets/icons/error.svg';
import { InfoIcon } from '../publicBooking/bookingIcons';

interface StaffExceptionFormData {
  date: string;
  exception_type: 'unavailable' | 'vacation' | 'sick' | 'training' | 'personal';
  reason: string;
  is_all_day: boolean;
  start_time?: string;
  end_time?: string;
}

interface StaffPortalData {
  staff_profile: {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    pay_type: string;
    rate: number | null;
  };
  business_info: {
    name: string;
    timezone: string;
    working_hours: Record<string, unknown>;
  };
  competencies: Array<{
    id: number;
    staff: number;
    staff_name: string;
    subcategory: number;
    subcategory_name: string;
    category_name: string;
    skill_level: string;
    hourly_rate: string | null;
    is_active: boolean;
    created_at: string;
  }>;
  locations: Array<{
    id: number;
    staff: number;
    staff_name: string;
    location: number;
    location_name: string;
    location_address: string;
    is_primary: boolean;
    is_active: boolean;
    created_at: string;
  }>;
  exceptions: Array<{
    id: number;
    staff: number;
    staff_name: string;
    date: string;
    exception_type: string;
    reason: string;
    is_all_day: boolean;
    start_time: string | null;
    end_time: string | null;
    status: string;
    reviewed_by: number | null;
    reviewed_by_name: string | null;
    reviewed_at: string | null;
    admin_notes: string;
    created_by: number;
    created_by_name: string;
    created_by_staff: boolean;
    approved_by_admin: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }>;
  exception_settings: {
    approval_mode: 'auto' | 'manual' | 'hybrid';
    auto_approve_types: string[];
    advance_notice_hours: number;
    max_exceptions_per_month: number;
    send_notifications: boolean;
  };
  monthly_exception_count: number;
  permissions: {
    can_create_exceptions: boolean;
    can_edit_own_exceptions: boolean;
    can_access_staff_portal: boolean;
    can_view_business_settings: boolean;
    requires_admin_approval: boolean;
  };
}

// Animation variants
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

// Professional competency card
const CompetencyCard: React.FC<{ competency: StaffPortalData['competencies'][0] }> = ({ competency }) => {
  const skillLevelColors = {
    trainee: 'gray',
    competent: 'blue',
    expert: 'green',
    master: 'yellow',
  } as const;

  const skillLevelIcons = {
    trainee: '🌱',
    competent: '✅',
    expert: '⭐',
    master: '👑',
  } as const;

  return (
    <motion.div variants={itemVariants}>
      <Paper className="p-4 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
              <span className="text-lg">{skillLevelIcons[competency.skill_level as keyof typeof skillLevelIcons]}</span>
            </div>
            <div>
              <Text fw={600} className="text-gray-900 text-sm">
                {competency.subcategory_name}
              </Text>
              <Text size="xs" c="dimmed" className="text-gray-500">
                {competency.category_name}
              </Text>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge 
              size="sm" 
              color={skillLevelColors[competency.skill_level as keyof typeof skillLevelColors]}
              className="capitalize"
            >
              {competency.skill_level}
            </Badge>
            {competency.hourly_rate && (
              <Badge variant="outline" color="green" size="xs">
                ${parseFloat(competency.hourly_rate)}/hr
              </Badge>
            )}
          </div>
        </div>
      </Paper>
    </motion.div>
  );
};

// Professional location card
const LocationCard: React.FC<{ location: StaffPortalData['locations'][0] }> = ({ location }) => {
  return (
    <motion.div variants={itemVariants}>
      <Paper className="p-4 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
              <span className="text-lg">📍</span>
            </div>
            <div>
              <Text fw={600} className="text-gray-900 text-sm">
                {location.location_name}
              </Text>
              <Text size="xs" c="dimmed" className="text-gray-500">
                {location.location_address}
              </Text>
            </div>
          </div>
          {location.is_primary && (
            <Badge color="green" variant="light" size="sm">
              Primary
            </Badge>
          )}
        </div>
      </Paper>
    </motion.div>
  );
};



const StaffPortalContent: React.FC = () => {
  const [activeTabValue, setActiveTabValue] = useState('overview');
  const [exceptionModalOpen, setExceptionModalOpen] = useState(false);
  const [editingException, setEditingException] = useState<StaffPortalData['exceptions'][0] | null>(null);

  // Get staff portal data
  const { data: portalData, isLoading: portalLoading, error: portalError } = useGetStaffPortalData() as {
    data: StaffPortalData | undefined;
    isLoading: boolean;
    error: Error | null;
  };

  // Permissions - FIX: Use permissions from portalData, not role
  const canCreateExceptions = portalData?.permissions?.can_create_exceptions || false;
  const canEditExceptions = portalData?.permissions?.can_edit_own_exceptions || false;



  // Form and mutations
  const createExceptionMutation = useCreateStaffOwnException();
  const updateExceptionMutation = useUpdateStaffOwnException();
  
  const exceptionForm = useForm<StaffExceptionFormData>({
    initialValues: {
      date: '',
      exception_type: 'unavailable',
      reason: '',
      is_all_day: true,
      start_time: '',
      end_time: '',
    },
    validate: {
      date: (value) => !value ? 'Date is required' : null,
      exception_type: (value) => !value ? 'Exception type is required' : null,
      reason: (value) => !value ? 'Reason is required' : null,
      start_time: (value, values) => {
        if (!values.is_all_day && !value) {
          return 'Start time is required when not all day';
        }
        return null;
      },
      end_time: (value, values) => {
        if (!values.is_all_day && !value) {
          return 'End time is required when not all day';
        }
        return null;
      },
    },
  });



  // Loading state - check this first
  if (portalLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader color="green" size="lg" />
          <Text size="lg" fw={500}>Loading your staff profile...</Text>
        </motion.div>
      </motion.div>
    );
  }

  // Error state
  if (portalError || !portalData) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-md text-center p-8 shadow-lg">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <InfoIcon className="w-8 h-8 text-orange-600" />
          </motion.div>
          <Title order={3} className="text-gray-900 mb-3">Setup Required</Title>
          <Text className="text-gray-600 mb-6">
            Staff profile setup is required to access this portal.
          </Text>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'} fullWidth>
            Return to Dashboard
          </Button>
        </Card>
      </motion.div>
    );
  }

  // Permission check - FIX: Only check after we have data
  if (!canCreateExceptions) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-md text-center p-8 shadow-lg">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <InfoIcon className="w-8 h-8 text-red-600" />
          </motion.div>
          <Title order={3} className="text-gray-900 mb-3">Access Denied</Title>
          <Text className="text-gray-600 mb-6">
            You don't have permission to access the staff portal.
          </Text>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'} fullWidth>
            Return to Dashboard
          </Button>
        </Card>
      </motion.div>
    );
  }

  // Defensive destructuring with fallbacks
  const { 
    staff_profile, 
    business_info, 
    competencies = [], 
    locations = [], 
    exceptions = [], 
    exception_settings, 
    monthly_exception_count = 0 
  } = portalData;

  // Calculate if monthly limit is reached
  const monthlyLimitReached = monthly_exception_count >= (exception_settings?.max_exceptions_per_month || 5);

  // Additional safety checks
  if (!staff_profile || !business_info || !exception_settings) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-md text-center p-8 shadow-lg">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <InfoIcon className="w-8 h-8 text-orange-600" />
          </motion.div>
          <Title order={3} className="text-gray-900 mb-3">Data Missing</Title>
          <Text className="text-gray-600 mb-6">
            Some required staff data is missing. Please contact your administrator.
          </Text>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'} fullWidth>
            Return to Dashboard
          </Button>
        </Card>
      </motion.div>
    );
  }

  // Modal handlers
  const handleOpenExceptionModal = (exception?: StaffPortalData['exceptions'][0]) => {
    if (exception) {
      setEditingException(exception);
      exceptionForm.setValues({
        date: exception.date,
        exception_type: exception.exception_type as StaffExceptionFormData['exception_type'],
        reason: exception.reason || '',
        is_all_day: exception.is_all_day,
        start_time: exception.start_time?.slice(0, 5) || '',
        end_time: exception.end_time?.slice(0, 5) || '',
      });
    } else {
      setEditingException(null);
      exceptionForm.reset();
    }
    setExceptionModalOpen(true);
  };

  const handleCloseExceptionModal = () => {
    setExceptionModalOpen(false);
    setEditingException(null);
    exceptionForm.reset();
  };

  const handleSubmitException = (values: StaffExceptionFormData) => {
    const payload = {
      ...values,
      start_time: values.is_all_day ? undefined : values.start_time,
      end_time: values.is_all_day ? undefined : values.end_time,
    };

    if (editingException) {
      updateExceptionMutation.mutate(
        { id: editingException.id, ...payload },
        {
          onSuccess: () => {
            notifications.show({
              title: 'Request Updated',
              message: 'Your exception request has been updated successfully and is pending approval.',
              color: 'green',
              autoClose: 5000,
            });
            handleCloseExceptionModal();
          },
          onError: (error: unknown) => {
            const errorMessage = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || 
                                 (error as { message?: string })?.message || 
                                 'Failed to update exception request';
            notifications.show({
              title: 'Update Failed',
              message: errorMessage,
              color: 'red',
              autoClose: 7000,
            });
          },
        }
      );
    } else {
      createExceptionMutation.mutate(payload, {
        onSuccess: (data: unknown) => {
          const isAutoApproved = (data as { status?: string })?.status === 'approved';
          notifications.show({
            title: isAutoApproved ? 'Request Approved' : 'Request Submitted',
            message: isAutoApproved 
              ? 'Your exception request was automatically approved!' 
              : 'Your exception request has been submitted and is pending approval.',
            color: 'green',
            autoClose: 5000,
          });
          handleCloseExceptionModal();
        },
        onError: (error: unknown) => {
          let errorMessage = 'Failed to create exception request';
          
          const serverMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
          if (serverMessage) {
            
            // Handle specific error cases with user-friendly messages
            if (serverMessage.includes('monthly limit') || serverMessage.includes('maximum')) {
              errorMessage = `You've reached your monthly limit of ${exception_settings?.max_exceptions_per_month || 5} exception requests. Please try again next month.`;
            } else if (serverMessage.includes('advance notice')) {
              errorMessage = `This request requires ${exception_settings?.advance_notice_hours || 24} hours advance notice. Please select a future date.`;
            } else if (serverMessage.includes('overlapping') || serverMessage.includes('conflict')) {
              errorMessage = 'This time conflicts with an existing request. Please choose a different time.';
            } else if (serverMessage.includes('past date')) {
              errorMessage = 'You cannot create requests for past dates. Please select a future date.';
            } else if (serverMessage.includes('weekend') || serverMessage.includes('holiday')) {
              errorMessage = 'Exception requests are not allowed for weekends or holidays.';
            } else {
              errorMessage = serverMessage;
            }
          }
          
          notifications.show({
            title: 'Request Failed',
            message: errorMessage,
            color: 'red',
            autoClose: 8000,
          });
        },
      });
    }
  };

  // Main content with smooth animations
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Professional Header - Clean design matching the images */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="bg-white shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <div>
                <Title order={3} className="text-lg text-gray-900 mb-1">
                  Welcome back, {staff_profile.name.split(' ')[0]}
                </Title>
                <Text className="text-gray-600 text-xs">
                  {business_info.name} • Staff Portal
                </Text>
              </div>
            </motion.div>
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-4 sm:mt-0 flex items-center gap-3"
            >
              <Badge 
                variant="light" 
                color={staff_profile.is_active ? 'green' : 'red'} 
                size="lg"
                className="px-3 py-1"
              >
                {staff_profile.is_active ? 'ACTIVE' : 'INACTIVE'}
              </Badge>
              {staff_profile.rate && (
                <Badge variant="outline" color="blue" size="lg" className="px-3 py-1">
                  ${staff_profile.rate}/HR
                </Badge>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

             {/* Main Content Area */}
       <motion.div 
         initial={{ y: 20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         transition={{ delay: 0.5, duration: 0.6 }}
         className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8"
       >
         {/* STEP 2: Exception Policy Alert */}
         <motion.div 
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.6, duration: 0.5 }}
           className="mb-8"
         >
           <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
               <div>
                 <Text fw={600} size="sm" className="text-blue-800">Exception Policy</Text>
                 <Text size="xs" className="text-blue-600 mt-1">
                   {exception_settings.approval_mode === 'manual' && 'Manual approval required'} • 
                   {exception_settings.advance_notice_hours}h advance notice required
                   {exception_settings.max_exceptions_per_month > 0 && (
                     <> • {monthly_exception_count}/{exception_settings.max_exceptions_per_month} used this month</>
                   )}
                 </Text>
               </div>
             </div>
           </div>
         </motion.div>

         {/* STEP 3: Professional Tab Navigation */}
         <motion.div 
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.7, duration: 0.5 }}
           className="mb-6"
         >
           <nav className="flex gap-1 overflow-x-auto bg-white rounded-lg p-1 shadow-sm border border-gray-200 scrollbar-hide">
             {[
               { id: 'overview', label: '📊 Overview', icon: '📊' },
               { id: 'competencies', label: '🎯 Skills & Services', icon: '🎯' },
               { id: 'locations', label: '📍 Locations', icon: '📍' },
               { id: 'exceptions', label: '📅 Time Off', icon: '📅' }
             ].map((tab, index) => (
               <motion.button
                 key={tab.id}
                 initial={{ y: 10, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                 className={`relative px-3 lg:px-4 py-2.5 text-xs lg:text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap flex-shrink-0 min-w-max ${
                   activeTabValue === tab.id 
                     ? 'bg-[#1D9B5E] text-white shadow-sm transform scale-[0.98] lg:scale-100' 
                     : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                 }`}
                 onClick={() => setActiveTabValue(tab.id)}
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
               >
                 {tab.label}
                 {activeTabValue === tab.id && (
                   <motion.div 
                     layoutId="activeTab"
                     className="absolute inset-0 bg-[#1D9B5E]/10 rounded-md -z-10" 
                   />
                 )}
               </motion.button>
             ))}
           </nav>
         </motion.div>

         {/* STEP 4 & 5: Tab Content */}
         {activeTabValue === 'overview' && (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.4 }}
             className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
           >
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1, duration: 0.4 }}
             >
               <Card className="p-6 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
                 <Text size="sm" c="dimmed" className="mb-2">Total Competencies</Text>
                 <Text size="xl" fw={700} className="text-blue-700">{competencies.length}</Text>
                 <Text size="xs" className="text-blue-600 mt-1">Active skills</Text>
               </Card>
             </motion.div>
             
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2, duration: 0.4 }}
             >
               <Card className="p-6 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
                 <Text size="sm" c="dimmed" className="mb-2">Location Assignments</Text>
                 <Text size="xl" fw={700} className="text-green-700">{locations.length}</Text>
                 <Text size="xs" className="text-green-600 mt-1">Service locations</Text>
               </Card>
             </motion.div>
             
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3, duration: 0.4 }}
             >
               <Card className="p-6 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
                 <Text size="sm" c="dimmed" className="mb-2">Exception Requests</Text>
                 <Text size="xl" fw={700} className="text-purple-700">{exceptions.length}</Text>
                 <Text size="xs" className="text-purple-600 mt-1">Recent & upcoming</Text>
               </Card>
             </motion.div>
           </motion.div>
         )}

         {activeTabValue === 'competencies' && (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.4 }}
             className="mb-8"
           >
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
               <div>
                 <Text size="lg" fw={600} className="text-gray-900">Service Competencies</Text>
                 <Text size="sm" c="dimmed">Your skills and expertise areas</Text>
               </div>
               <Badge variant="light" color="blue" size="lg">{competencies.length}</Badge>
             </div>
             
             {competencies.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {competencies.map((competency, index) => (
                   <motion.div
                     key={competency.id}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: index * 0.1, duration: 0.4 }}
                   >
                     <CompetencyCard competency={competency} />
                   </motion.div>
                 ))}
               </div>
             ) : (
               <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                 <Text size="sm">
                   No service competencies assigned yet. Contact your administrator to get assigned to services.
                 </Text>
               </div>
             )}
           </motion.div>
         )}

         {activeTabValue === 'locations' && (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.4 }}
             className="mb-8"
           >
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
               <div>
                 <Text size="lg" fw={600} className="text-gray-900">Location Assignments</Text>
                 <Text size="sm" c="dimmed">Where you provide your services</Text>
               </div>
               <Badge variant="light" color="green" size="lg">{locations.length}</Badge>
             </div>
             
             {locations.length > 0 ? (
               <div className="space-y-4">
                 {locations.map((location, index) => (
                   <motion.div
                     key={location.id}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: index * 0.1, duration: 0.4 }}
                   >
                     <LocationCard location={location} />
                   </motion.div>
                 ))}
               </div>
             ) : (
               <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                 <Text size="sm">
                   No location assignments yet. Contact your administrator to get assigned to locations.
                 </Text>
               </div>
             )}
           </motion.div>
         )}

         {activeTabValue === 'exceptions' && (
           <div className="mb-8">
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
               <div>
                 <Text size="lg" fw={600} className="text-gray-900">Exception Requests</Text>
                 <Text size="sm" c="dimmed">Manage your time off requests</Text>
               </div>
               <Badge variant="light" color="purple" size="lg">{exceptions.length}</Badge>
             </div>
             
             {canCreateExceptions && (
               <div className="mb-6">
                 {monthlyLimitReached ? (
                   <div className="space-y-3">
                     <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                       <div className="flex items-center gap-3">
                         <span className="text-2xl">⚠️</span>
                         <div>
                           <Text size="sm" fw={600} className="text-orange-800">
                             Monthly Limit Reached
                           </Text>
                           <Text size="xs" className="text-orange-700">
                             You've used all {exception_settings?.max_exceptions_per_month || 5} exception requests this month. 
                             You can create new requests next month.
                           </Text>
                         </div>
                       </div>
                     </div>
                     <Button 
                       disabled
                       className="bg-gray-400 text-white w-full sm:w-auto cursor-not-allowed"
                       leftSection={<span>➕</span>}
                       size="md"
                     >
                       Request Time Off (Limit Reached)
                     </Button>
                   </div>
                 ) : (
                   <Button 
                     onClick={() => handleOpenExceptionModal()}
                     className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                     leftSection={<span>➕</span>}
                     size="md"
                   >
                     Request Time Off
                   </Button>
                 )}
               </div>
             )}
             
             {exceptions.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {exceptions.map((exception) => (
                   <Card key={exception.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 bg-white">
                     <div className="flex items-start justify-between mb-3">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                           <span className="text-lg">
                             {exception.exception_type === 'vacation' && '🏖️'}
                             {exception.exception_type === 'sick' && '🤒'}
                             {exception.exception_type === 'personal' && '👤'}
                             {exception.exception_type === 'training' && '📚'}
                             {exception.exception_type === 'unavailable' && '🚫'}
                           </span>
                         </div>
                         <div className="flex-1 min-w-0">
                           <Text fw={600} className="text-gray-900 text-sm capitalize truncate">
                             {exception.exception_type}
                           </Text>
                           <Text size="xs" c="dimmed" className="text-gray-500">
                             {new Date(exception.date).toLocaleDateString('en-US', {
                               weekday: 'short',
                               month: 'short',
                               day: 'numeric'
                             })}
                           </Text>
                         </div>
                       </div>
                       <Badge 
                         size="sm" 
                         color={
                           exception.status === 'approved' ? 'green' : 
                           exception.status === 'rejected' ? 'red' : 
                           exception.status === 'pending' ? 'yellow' : 'gray'
                         }
                         className="capitalize flex-shrink-0"
                       >
                         {exception.status}
                       </Badge>
                     </div>
                     
                     {!exception.is_all_day && (
                       <div className="mb-2">
                         <Text size="xs" c="dimmed" className="text-gray-500">
                           {exception.start_time?.slice(0, 5)} - {exception.end_time?.slice(0, 5)}
                         </Text>
                       </div>
                     )}
                     
                     {exception.reason && (
                       <Text size="xs" className="text-gray-600 mb-3 bg-gray-50 p-2 rounded break-words">
                         {exception.reason}
                       </Text>
                     )}
                     
                     {exception.admin_notes && (
                       <Text size="xs" className="text-blue-600 mb-3 bg-blue-50 p-2 rounded break-words">
                         <strong>Admin:</strong> {exception.admin_notes}
                       </Text>
                     )}
                     
                     {exception.status === 'pending' && canEditExceptions && (
                       <div className="mt-3 pt-3 border-t border-gray-200">
                         <Button
                           size="xs"
                           variant="light"
                           onClick={() => handleOpenExceptionModal(exception)}
                           className="text-blue-600 hover:bg-blue-50"
                         >
                           Edit Request
                         </Button>
                       </div>
                     )}
                   </Card>
                 ))}
               </div>
             ) : (
               <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
                 <Text size="sm">
                   No exception requests yet. Use the "Request Time Off" button to create your first request.
                 </Text>
               </div>
             )}
           </div>
         )}


       </motion.div>

       {/* Exception Request Modal */}
       <Modal
         opened={exceptionModalOpen}
         onClose={handleCloseExceptionModal}
         title={editingException ? 'Edit Exception Request' : 'Request Time Off'}
         size="md"
         centered
       >
         <form onSubmit={exceptionForm.onSubmit(handleSubmitException)}>
           <Stack gap="md">
             <TextInput
               label="Date"
               type="date"
               {...exceptionForm.getInputProps('date')}
               required
             />

             <Select
               label="Exception Type"
               data={[
                 { value: 'unavailable', label: 'Unavailable' },
                 { value: 'vacation', label: 'Vacation' },
                 { value: 'sick', label: 'Sick Leave' },
                 { value: 'training', label: 'Training' },
                 { value: 'personal', label: 'Personal' },
               ]}
               {...exceptionForm.getInputProps('exception_type')}
               required
             />

             <Switch
               label="All Day"
               description="Check if this applies to the entire day"
               {...exceptionForm.getInputProps('is_all_day', { type: 'checkbox' })}
             />

             {!exceptionForm.values.is_all_day && (
               <Group grow>
                 <TextInput
                   label="Start Time"
                   type="time"
                   {...exceptionForm.getInputProps('start_time')}
                   required
                 />
                 <TextInput
                   label="End Time"
                   type="time"
                   {...exceptionForm.getInputProps('end_time')}
                   required
                 />
               </Group>
             )}

             <Textarea
               label="Reason"
               placeholder="Please provide a reason for this request"
               {...exceptionForm.getInputProps('reason')}
               required
               rows={3}
             />

             <Group justify="flex-end">
               <Button variant="outline" onClick={handleCloseExceptionModal}>
                 Cancel
               </Button>
               <Button 
                 type="submit" 
                 loading={createExceptionMutation.isPending || updateExceptionMutation.isPending}
                 className="bg-green-600 hover:bg-green-700"
               >
                 {editingException ? 'Update Request' : 'Submit Request'}
               </Button>
             </Group>
           </Stack>
         </form>
               </Modal>
    </motion.div>
  );


};

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class StaffPortalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'development') {
      console.error('StaffPortal Error Boundary caught an error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center min-h-[60vh]"
        >
          <Paper className="p-8 max-w-md mx-auto text-center">
            <div className="mb-4">
              <img src={errorIcon} alt="Error" className="w-16 h-16 mx-auto mb-4" />
              <Title order={3} className="text-gray-700 mb-2">Something went wrong</Title>
              <Text size="sm" c="dimmed" className="mb-4">
                There was an error loading the staff portal. Please refresh the page.
              </Text>
              <Button 
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Refresh Page
              </Button>
            </div>
          </Paper>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

const StaffPortal: React.FC = () => {
  return (
    <StaffPortalErrorBoundary>
      <StaffPortalContent />
    </StaffPortalErrorBoundary>
  );
};

export default StaffPortal; 