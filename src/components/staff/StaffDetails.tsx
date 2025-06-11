import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import MembersHeader from '../headers/MembersHeader';
import { Loader } from '@mantine/core';
import Button from '../common/Button';
import Input from '../common/Input';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { notifications } from '@mantine/notifications';

import {
  useGetRoles,
  useGetStaffMember,
  useGetStaffSessions,
  useUpdateStaffMember,
} from '../../hooks/reactQuery';

import avatar from '../../assets/icons/newAvatar.svg';
import editIcon from '../../assets/icons/edit.svg';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';
import DropdownSelectInput from '../common/Dropdown';
import { Role } from '../../store/auth';
import Table from '../common/Table';
import { navigateToSessionDetails } from '../../utils/navigationHelpers';
import { Session } from '../../types/sessionTypes';
import { createColumnHelper } from '@tanstack/react-table';

interface PersonalFormData {
  firstName: string;
  lastName: string;
  mobile_number: string;
  email: string;
  role: string;
  staffNumber: string;
}

const columnHelper = createColumnHelper<Session>();

const StaffDetails = () => {
  const { id: staffId } = useParams();
  const {
    data: staffDetails,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetStaffMember(staffId || '');
  const navigate = useNavigate();
  const { data: roles = [] } = useGetRoles();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [rowSelection, setRowSelection] = useState({});

  const methods = useForm<PersonalFormData>();
  const { control, handleSubmit, reset } = methods;

  const roleOptions = roles.map((role: Role) => ({
    label: role.name,
    value: role.id,
  }));

  useEffect(() => {
    if (staffDetails?.user) {
      reset({
        firstName: staffDetails.user.first_name || '',
        lastName: staffDetails.user.last_name || '',
        mobile_number: staffDetails.user.mobile_number || '',
        email: staffDetails.user.email || '',
        role: staffDetails.user.role.id || '',
        staffNumber: staffDetails.member_id || '',
      });
    }
  }, [staffDetails, reset]);

  const { mutate: updateStaff } = useUpdateStaffMember();

  const sessionColumns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <input
            type='checkbox'
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className='w-4 h-4 rounded cursor-pointer bg-[#F7F8FA] accent-[#DBDEDF]'
          />
        ),
        cell: ({ row }) => (
          <input
            type='checkbox'
            checked={row.getIsSelected()}
            onClick={(e) => e.stopPropagation()}
            onChange={row.getToggleSelectedHandler()}
            className='w-4 h-4 rounded cursor-pointer bg-[#F7F8FA] accent-[#DBDEDF]'
          />
        ),
      }),
      columnHelper.accessor('title', {
        header: 'Session',
        cell: (info) => (
          <div className='text-start'>
            <p className='font-medium text-gray-900 text-sm'>
              {info.getValue()}
            </p>
            <p className='text-xs text-gray-500'>
              {info.row.original.category?.name || ''}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor('class_type', {
        header: 'Session Type',
        cell: (info) => {
          const SessionType = info.getValue();
          return SessionType
            ? SessionType.charAt(0).toUpperCase() + SessionType.slice(1)
            : '';
        },
      }),
      columnHelper.accessor('spots', {
        header: 'Slots',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('date', {
        header: 'Date',
        cell: (info) => {
          const dateValue = info.getValue();
          const date = new Date(dateValue);
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
        },
      }),
      columnHelper.accessor(
        (row) => ({ start: row.start_time, end: row.end_time }),
        {
          id: 'duration',
          header: 'Duration',
          cell: (info) => {
            const { start, end } = info.getValue();

            const formatTo12Hour = (isoDateTimeStr: string) => {
              if (!isoDateTimeStr || typeof isoDateTimeStr !== 'string')
                return isoDateTimeStr;

              try {
                const timePart = isoDateTimeStr.split('T')[1];
                if (!timePart) {
                  return isoDateTimeStr;
                }

                const timeComponents = timePart.split(':');
                let hours = parseInt(timeComponents[0], 10);
                const minutes = timeComponents[1].padStart(2, '0');

                const ampm = hours >= 12 ? 'PM' : 'AM';

                hours = hours % 12;
                hours = hours ? hours : 12;

                return `${hours}:${minutes} ${ampm}`;
              } catch (e) {
                console.error('Error formatting time:', isoDateTimeStr, e);
                return isoDateTimeStr;
              }
            };

            return `${formatTo12Hour(start)} - ${formatTo12Hour(end)}`;
          },
        }
      ),
      columnHelper.accessor(
        (row) => ({
          repeat_on: row.repeat_on,
          repeat_unit: row.repeat_unit,
          repeat_every: row.repeat_every,
        }),
        {
          id: 'repeats',
          header: 'Repeats',
          cell: (info) => {
            const { repeat_on, repeat_unit, repeat_every } = info.getValue();

            const dayMap: Record<number, string> = {
              1: 'Mon',
              2: 'Tue',
              3: 'Wed',
              4: 'Thu',
              5: 'Fri',
              6: 'Sat',
              0: 'Sun',
            };

            if (repeat_unit === 'days' && repeat_every) {
              return `Daily`;
            }

            if (repeat_unit === 'weeks') {
              return `Weekly`;
            }
            if (repeat_unit === 'months' && repeat_every) {
              return `Monthly`;
            }

            if (repeat_on && repeat_on.length > 0) {
              return repeat_on
                .map((day: string) => dayMap[Number(day)] || '')
                .join(', ');
            }

            return 'No Repeats';
          },
        }
      ),
      columnHelper.accessor('is_active', {
        header: 'Status',
        cell: (info) => (
          <span
            className={`inline-block px-2 py-1 rounded-lg text-sm text-center min-w-[70px] ${
              info.getValue()
                ? 'bg-active text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {info.getValue() ? 'Active' : 'Inactive'}
          </span>
        ),
      }),
    ],
    [open]
  );

  const { data: staffSessionsData } = useGetStaffSessions(staffDetails?.id);

  const onSubmit = (data: PersonalFormData) => {
    if (!staffId) return;

    updateStaff(
      {
        id: staffId,
        updateStaffData: {
          first_name: data.firstName,
          last_name: data.lastName,
          mobile_number: data.mobile_number,
          role: selectedRoleId || staffDetails.user.role.id,
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          notifications.show({
            title: 'Success',
            message: 'Staff member updated successfully!',
            color: 'green',
            radius: 'md',
            icon: (
              <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
                <img src={successIcon} alt='Success' className='w-4 h-4' />
              </span>
            ),
            withBorder: true,
            autoClose: 3000,
            position: 'top-right',
          });
        },
        onError: () => {
          notifications.show({
            title: 'Error',
            message: 'Failed to update staff member. Please try again.',
            color: 'red',
            radius: 'md',
            icon: (
              <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
                <img src={errorIcon} alt='Error' className='w-4 h-4' />
              </span>
            ),
            withBorder: true,
            autoClose: 3000,
            position: 'top-right',
          });
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
        role: staffDetails.user.role.id,
        staffNumber: staffDetails.member_id || '',
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className='flex flex-col h-screen bg-cardsBg w-full overflow-y-auto'>
        <MembersHeader
          title='Staff Details'
          showFilterIcons={false}
          showButton={false}
          showSearch={false}
        />
        <div className='flex justify-center items-center h-[80vh]'>
          <div className='text-center'>
            <Loader color='#1D9B5E' size='xl' />
            <p className='mt-4 text-gray-600'>Loading staff details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='flex flex-col h-screen bg-cardsBg w-full overflow-y-auto'>
        <MembersHeader
          title='Staff Details'
          showFilterIcons={false}
          showButton={false}
          showSearch={false}
        />
        <div className='flex justify-center items-center h-[80vh]'>
          <div className='space-y-4 text-center'>
            <p className='text-red-500 font-medium text-lg'>
              Error loading staff details
            </p>
            <p className='text-red-400'>
              {error?.message || 'Something went wrong'}
            </p>
            <button
              onClick={() => refetch()}
              className='px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90'
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!staffDetails) {
    return (
      <div className='flex flex-col h-screen bg-cardsBg w-full overflow-y-auto'>
        <MembersHeader
          title='Staff Details'
          showFilterIcons={false}
          showButton={false}
          showSearch={false}
        />
        <div className='flex justify-center items-center h-[80vh]'>
          <div className='space-y-4 text-center'>
            <h2 className='text-2xl font-bold text-primary'>Staff not found</h2>
            <p className='text-gray-500'>
              The staff member you're looking for doesn't exist or has been
              removed.
            </p>
            <button
              onClick={() => navigate('/staff')}
              className='px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 mt-4'
            >
              Back to Staff List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className='flex flex-col h-screen bg-cardsBg w-full md:pl-16 overflow-y-auto'>
        <MembersHeader
          title='Staff Details'
          showFilterIcons={false}
          showButton={false}
          showSearch={false}
        />
        <div className='flex flex-col justify-center items-center mt-10 space-y-4 pb-4'>
          <div className='border items-center rounded-xl w-[95%] p-8 bg-white'>
            <div className='flex justify-between'>
              <div className='flex justify-center items-center gap-4'>
                <img
                  src={staffDetails.profileImage || avatar}
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

          <div className='border rounded-xl w-[95%] p-8 bg-white'>
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
                    <Input
                      {...field}
                      label='First Name'
                      className='w-full'
                      placeholder='Enter First Name'
                    />
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
                    <Input
                      {...field}
                      label='Last Name'
                      className='w-full'
                      placeholder='Enter Last Name'
                    />
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
                        backgroundColor: '#80808052',
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
                    <Input
                      {...field}
                      label='Phone Number'
                      className='w-full'
                      placeholder='Enter Phone Number'
                    />
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
                    <DropdownSelectInput
                      {...field}
                      label='Primary Role'
                      className='w-full'
                      options={roleOptions}
                      onSelectItem={(item) => {
                        console.log('Selected item:', item);
                        setSelectedRoleId(item.value);
                        field.onChange(item.value);
                      }}
                      value={
                        roleOptions.find(
                          (role: { value: string }) =>
                            role.value === selectedRoleId
                        ) || null
                      }
                    />
                  )}
                />
              ) : (
                <div>
                  <p className='text-sm text-gray-400'>Primary Role</p>
                  <p className='text-sm text-gray-500'>
                    {staffDetails?.user?.role?.name || 'Not assigned'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className='border rounded-xl w-[95%] md:p-8 p-1 bg-white'>
            <div className='flex justify-between items-start p-4 md:p-0'>
              <h3 className='text-primary text-md font-semibold md:mb-4'>
                Assigned Sessions
              </h3>
            </div>
            <div className='flex-1 px-2 pt-2 w-full overflow-x-auto'>
              <div className='min-w-[800px] md:min-w-0'>
                <Table
                  data={staffSessionsData || []}
                  columns={sessionColumns}
                  rowSelection={rowSelection}
                  onRowSelectionChange={setRowSelection}
                  className='mt-4'
                  pageSize={7}
                  onRowClick={(row: Session) =>
                    navigateToSessionDetails(navigate, row.id.toString())
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default StaffDetails;
