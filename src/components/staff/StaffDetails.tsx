import { useParams } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { data } from '../../utils/dummyData';
import MembersHeader from '../headers/MembersHeader';
import Button from '../common/Button';
import { Switch } from '@mantine/core';
import Input from '../common/Input';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import NotificationToast from '../common/NotificationToast';

import plusIcon from '../../assets/icons/plus.svg';
import defaultAvatar from '../../assets/images/staffImage.jpg';
import editIcon from '../../assets/icons/edit.svg';
import checkIcon from '../../assets/icons/check.svg';

interface PersonalFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  role: string;
  staffNumber: string;
}

const StaffDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [permissions, setPermissions] = useState({
    addClient: false,
    createInvoices: false,
    createEvents: true,
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

  const staffDetails = useMemo(() => {
    return data.find((s) => s.id.toString() === id);
  }, [id]);

  useEffect(() => {
    if (staffDetails) {
      reset({
        firstName: staffDetails.firstName,
        lastName: staffDetails.lastName,
        phoneNumber: staffDetails.phoneNumber,
        email: staffDetails.email,
        role: staffDetails.role,
        staffNumber: staffDetails.staffNumber,
      });
    }
  }, [staffDetails, reset]);

  const onSubmit = (data: PersonalFormData) => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (staffDetails) {
      reset({
        firstName: staffDetails.firstName,
        lastName: staffDetails.lastName,
        phoneNumber: staffDetails.phoneNumber,
        email: staffDetails.email,
        role: staffDetails.role,
        staffNumber: staffDetails.staffNumber,
      });
    }
    setIsEditing(false);
  };

  const handlePermissionChange = (
    name: keyof typeof permissions,
    checked: boolean
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  if (!staffDetails) {
    return (
      <div className='p-8'>
        <h2 className='text-[40px] font-bold text-primary'>Staff not found</h2>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className='flex flex-col h-screen bg-cardsBg w-full pl-16 overflow-y-auto'>
        <MembersHeader
          title='Staff Details'
          buttonText='New Class'
          searchPlaceholder='Search by ID, Name or Subject'
          buttonIcon={plusIcon}
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
                  <p className='text-sm font-semibold'>{staffDetails.name}</p>
                  <p className='text-xs text-gray-400 font-semibold'>
                    {staffDetails.role}
                  </p>
                  <span className='text-xs text-gray-400 font-semibold'>
                    ID:{staffDetails.staffNumber}
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
                    onClick={() => {
                      setShowNotification(true);
                      handleSubmit(onSubmit);
                    }}
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
                    {staffDetails.firstName}
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
                    {staffDetails.lastName}
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
                  <p className='text-sm text-gray-500'>{staffDetails.email}</p>
                </div>
              )}

              {isEditing ? (
                <Controller
                  name='phoneNumber'
                  control={control}
                  render={({ field }) => (
                    <Input {...field} label='Phone Number' className='w-full' />
                  )}
                />
              ) : (
                <div>
                  <p className='text-sm text-gray-400'>Phone Number</p>
                  <p className='text-sm text-gray-500'>
                    {staffDetails.phoneNumber}
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
                  <p className='text-sm text-gray-500'>{staffDetails.role}</p>
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
                  .map((className, index) => (
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
                  checked={permissions.addClient}
                  onChange={(event) =>
                    handlePermissionChange(
                      'addClient',
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
                  checked={permissions.createInvoices}
                  onChange={(event) =>
                    handlePermissionChange(
                      'createInvoices',
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
                  checked={permissions.createEvents}
                  size='xs'
                  style={{ marginTop: '4px' }}
                  onChange={(event) =>
                    handlePermissionChange(
                      'createEvents',
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
