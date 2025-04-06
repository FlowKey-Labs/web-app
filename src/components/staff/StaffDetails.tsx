import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MembersHeader from '../headers/MembersHeader';
import Button from '../common/Button';
import { Switch } from '@mantine/core';
import Input from '../common/Input';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import NotificationToast from '../common/NotificationToast';

import {
  useGetStaffMember,
  useUpdateStaffMember,
} from '../../hooks/reactQuery';

import defaultAvatar from '../../assets/images/staffImage.jpg';
import editIcon from '../../assets/icons/edit.svg';
import checkIcon from '../../assets/icons/check.svg';

interface PersonalFormData {
  firstName: string;
  lastName: string;
  mobile_number: string;
  email: string;
  role: string;
  staffNumber: string;
}

const StaffDetails = () => {
  const { id: staffId } = useParams();
  const {
    data: staffMember,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetStaffMember(staffId || '');

  const [permissions, setPermissions] = useState({
    can_add_clients: false,
    can_create_invoices: false,
    can_create_events: false,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const methods = useForm<PersonalFormData>();
  const { control, handleSubmit, reset } = methods;

  // const { notifications, addNotification } = useNotification();

  // addNotification({
  //   type: 'success',
  //   title: 'Success!',
  //   description: 'Operation completed',
  // });

  const staffDetails = staffMember;

  // Handle success notification
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => setShowNotification(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  useEffect(() => {
    if (staffDetails?.user) {
      reset({
        firstName: staffDetails.user.first_name || '',
        lastName: staffDetails.user.last_name || '',
        mobile_number: staffDetails.user.mobile_number || '',
        email: staffDetails.user.email || '',
        role: staffDetails.role || '',
        staffNumber: staffDetails.member_id || '',
      });

      // Also initialize permissions
      if (staffDetails.permissions) {
        setPermissions({
          can_add_clients: staffDetails.permissions.can_add_clients || false,
          can_create_invoices:
            staffDetails.permissions.can_create_invoices || false,
          can_create_events:
            staffDetails.permissions.can_create_events || false,
        });
      }
    }
  }, [staffDetails, reset]);

  const { mutate: updateStaff } = useUpdateStaffMember();

  const onSubmit = (data: PersonalFormData) => {
    if (!staffId) return;

    updateStaff(
      {
        id: staffId,
        updateStaffData: {
          first_name: data.firstName,
          last_name: data.lastName,
          mobile_number: data.mobile_number,
          role: data.role,
          permissions: {
            can_create_events: permissions.can_create_events,
            can_add_clients: permissions.can_add_clients,
            can_create_invoices: permissions.can_create_invoices,
          },
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          setShowNotification(true);
        },
      }
    );
  };

  const handleCancel = () => {
    if (staffDetails) {
      reset({
        firstName: staffDetails.user.first_name,
        lastName: staffDetails.user.last_name,
        mobile_number: staffDetails.user.mobile_number || '',
        email: staffDetails.user.email,
        role: staffDetails.role,
        staffNumber: staffDetails.member_id || '',
      });
    }
    setIsEditing(false);
  };

  const handlePermissionChange = (
    name: keyof typeof permissions,
    checked: boolean
  ) => {
    const updatedPermissions = { ...permissions, [name]: checked };
    setPermissions(updatedPermissions);

    // Update staff permissions immediately
    if (!staffId) return;

    updateStaff(
      {
        id: staffId,
        updateStaffData: {
          first_name: staffDetails?.user?.first_name || '',
          last_name: staffDetails?.user?.last_name || '',
          mobile_number: staffDetails?.user?.mobile_number || '',
          role: staffDetails?.role || '',
          permissions: {
            can_create_events:
              name === 'can_create_events'
                ? checked
                : updatedPermissions.can_create_events,
            can_add_clients:
              name === 'can_add_clients'
                ? checked
                : updatedPermissions.can_add_clients,
            can_create_invoices:
              name === 'can_create_invoices'
                ? checked
                : updatedPermissions.can_create_invoices,
          },
        },
      },
      {
        onSuccess: () => {
          setShowNotification(true);
        },
      }
    );
  };

  if (!staffDetails) {
    return (
      <div className='p-8'>
        <h2 className='text-[40px] font-bold text-primary'>Staff not found</h2>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='w-full min-h-screen space-y-6 bg-white rounded-lg p-6'>
        <p className='text-primary'>Loading staff details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='w-full min-h-screen space-y-6 bg-white rounded-lg p-6'>
        <div className='space-y-4'>
          <p className='text-red-500'>
            Error loading staff details: {error?.message}
          </p>
          <button
            onClick={() => refetch()}
            className='px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      {showNotification && (
        <NotificationToast
          type='success'
          title='Success'
          description='Staff details updated successfully!'
          onClose={() => setShowNotification(false)}
        />
      )}
      <div className='flex flex-col h-screen bg-cardsBg w-full pl-16 overflow-y-auto'>
        <MembersHeader
          title='Staff Details'
          showFilterIcons={false}
          showButton={false}
          showSearch={false}
        />
        <div className='flex flex-col justify-center items-center mt-10 space-y-4 pb-4'>
          <div className='border items-center rounded-xl w-[95%] p-8'>
            <div className='flex justify-between'>
              <div className='flex justify-center items-center gap-4'>
                <img
                  src={staffDetails.profileImage || defaultAvatar}
                  alt='avatar'
                  className='rounded-full w-12 h-12 object-cover'
                />
                <div className='text-primary space-y-1'>
                  <p className='text-sm font-semibold'>
                    {staffDetails?.user?.first_name}{' '}
                    {staffDetails?.user?.last_name}
                  </p>
                  <p className='text-xs text-gray-400 font-semibold'>
                    {staffDetails.role}
                  </p>
                  <span className='text-xs text-gray-400 font-semibold'>
                    ID:{staffDetails?.member_id}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className='border rounded-xl w-[95%] p-8'>
            <div className='flex justify-between items-start'>
              <h3 className='text-primary text-sm font-semibold mb-4'>
                Personal Information
              </h3>
              {!isEditing ? (
                <Button
                  variant='outline'
                  color='gray'
                  radius='md'
                  h='40'
                  leftSection={
                    <img src={editIcon} alt='edit' className='w-4 h-4' />
                  }
                  size='sm'
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              ) : (
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    color='red'
                    radius='md'
                    h='40'
                    size='sm'
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    color='#1D9B5E'
                    radius='md'
                    h='40'
                    size='sm'
                    onClick={handleSubmit(onSubmit)}
                  >
                    Save
                  </Button>
                </div>
              )}
            </div>
            <div className='grid grid-cols-2 gap-4'>
              {isEditing ? (
                <Controller
                  name='firstName'
                  control={control}
                  render={({ field }) => (
                    <Input {...field} label='First Name' className='w-full' />
                  )}
                />
              ) : (
                <div>
                  <p className='text-sm text-gray-400'>First Name</p>
                  <p className='text-sm text-gray-500'>
                    {staffDetails?.user?.first_name}
                  </p>
                </div>
              )}

              {/* Last Name */}
              {isEditing ? (
                <Controller
                  name='lastName'
                  control={control}
                  render={({ field }) => (
                    <Input {...field} label='Last Name' className='w-full' />
                  )}
                />
              ) : (
                <div>
                  <p className='text-sm text-gray-400'>Last Name</p>
                  <p className='text-sm text-gray-500'>
                    {staffDetails?.user?.last_name}
                  </p>
                </div>
              )}

              {isEditing ? (
                <Controller
                  name='email'
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label='Email Address'
                      className='w-full bg-gray-100 text-gray-500'
                      readOnly
                      style={{
                        backgroundColor: '#000000',
                        cursor: 'not-allowed',
                      }}
                      onFocus={(e) => {
                        e.target.blur();
                      }}
                    />
                  )}
                />
              ) : (
                <div>
                  <p className='text-sm text-gray-400'>Email Address</p>
                  <p className='text-sm text-gray-500'>
                    {staffDetails?.user?.email}
                  </p>
                </div>
              )}

              {isEditing ? (
                <Controller
                  name='mobile_number'
                  control={control}
                  render={({ field }) => (
                    <Input {...field} label='Phone Number' className='w-full' />
                  )}
                />
              ) : (
                <div>
                  <p className='text-sm text-gray-400'>Phone Number</p>
                  <p className='text-sm text-gray-500'>
                    {staffDetails?.user?.mobile_number || 'Not provided'}
                  </p>
                </div>
              )}

              {isEditing ? (
                <Controller
                  name='role'
                  control={control}
                  render={({ field }) => (
                    <Input {...field} label='Primary Role' className='w-full' />
                  )}
                />
              ) : (
                <div>
                  <p className='text-sm text-gray-400'>Primary Role</p>
                  <p className='text-sm text-gray-500'>
                    {staffDetails?.role || 'Not assigned'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {staffDetails.assignedClasses && (
            <div className='border rounded-xl w-[95%] p-8'>
              <div className='flex justify-between items-start'>
                <h3 className='text-primary text-sm font-semibold mb-4'>
                  Assigned Classes
                </h3>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                {staffDetails.assignedClasses
                  .split(', ')
                  .map((className: string, index: number) => (
                    <div key={index} className='flex items-center gap-2'>
                      <div className='w-2 h-2 bg-secondary rounded-full'></div>
                      <p className='text-sm text-gray-500'>{className}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className='border rounded-xl w-[95%] p-8'>
            <div className='flex justify-between items-start'>
              <h3 className='text-primary text-sm font-semibold mb-4'>
                Permissions
              </h3>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='flex gap-4'>
                <Switch
                  color='#1D9B5E'
                  size='xs'
                  style={{ marginTop: '4px' }}
                  checked={permissions.can_add_clients}
                  onChange={(event) =>
                    handlePermissionChange(
                      'can_add_clients',
                      event.currentTarget.checked
                    )
                  }
                />
                <div className='text-sm text-gray-400'>
                  <p className='font-bold'>Add new Client</p>
                  <p className='text-xs'>
                    Add new classes, appointments and personal appointments
                  </p>
                </div>
              </div>
              <div className='flex gap-4'>
                <Switch
                  color='#1D9B5E'
                  size='xs'
                  style={{ marginTop: '4px' }}
                  checked={permissions.can_create_invoices}
                  onChange={(event) =>
                    handlePermissionChange(
                      'can_create_invoices',
                      event.currentTarget.checked
                    )
                  }
                />
                <div className='text-sm text-gray-400'>
                  <p className='font-bold'>Create and send clients invoices</p>
                  <p className='text-xs'>
                    Generate payment receipts and confirm transactions
                  </p>
                </div>
              </div>
              <div className='flex gap-4'>
                <Switch
                  color='#1D9B5E'
                  checked={permissions.can_create_events}
                  size='xs'
                  style={{ marginTop: '4px' }}
                  onChange={(event) =>
                    handlePermissionChange(
                      'can_create_events',
                      event.currentTarget.checked
                    )
                  }
                />
                <div className='text-sm text-gray-400'>
                  <p className='font-bold'>Create new events</p>
                  <p className='text-xs'>Onboard new clients</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showNotification && (
        <NotificationToast
          type='success'
          title='Success!'
          description='Your action was completed successfully.'
          onClose={() => setShowNotification(false)}
          icon={
            <div className='rounded-full p-2 bg-secondary'>
              <img src={checkIcon} alt='' className='w-5 h-5' />
            </div>
          }
          autoClose={5000}
        />
      )}
      {/* {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          type={notification.type}
          title={notification.title}
          description={notification.description}
          onClose={() => removeNotification(notification.id)}
          autoClose={notification.autoClose}
        />
      ))} */}
    </FormProvider>
  );
};

export default StaffDetails;
