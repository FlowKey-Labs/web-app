import { useForm, Controller, FormProvider } from 'react-hook-form';
import Input from '../common/Input';
import DropdownSelectInput from '../common/Dropdown';
import Button from '../common/Button';
import clientlocationIcons from '../../assets/icons/clientLocation.svg';
import {
  useGetClassSessions,
  useUpdateClient,
  useGetClient,
  useGetLocations, // Added
} from '../../hooks/reactQuery';
import { useEffect } from 'react';
import moment from 'moment';
import { AddClient, ClientData } from '../../types/clientTypes';
import { Location } from '../../types/location'; // Added
import { Drawer } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';

interface UpdateClientProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
}

const UpdateClient = ({ isOpen, onClose, clientId }: UpdateClientProps) => {
  const methods = useForm<AddClient>({
    defaultValues: {
      first_name: '',
      last_name: '',
      phone_number: '',
      email: '',
      location: '',
      dob: '',
      gender: 'M',
      assigned_classes: 0,
      sessions: [],
    },
  });
  const { control, handleSubmit, reset } = methods;

  const { data: clientData, isLoading } = useGetClient(clientId || '');
  const { mutate: updateClient, isPending, isSuccess } = useUpdateClient();
  const { data: classSessionsData, isLoading: isClassSessionsLoading } =
    useGetClassSessions();
  const { data: locationsData, isLoading: isLocationsLoading } =
    useGetLocations() as { data: Location[] | undefined; isLoading: boolean }; // Added

  useEffect(() => {
    if (clientData && isOpen) {
      reset({
        first_name: clientData.first_name || '',
        last_name: clientData.last_name || '',
        phone_number: clientData.phone_number || '',
        email: clientData.email || '',
        location: clientData.location || '',
        dob: clientData.dob || '',
        gender: clientData.gender || 'M',
        assigned_classes: clientData.assigned_classes || 0,
        sessions:
          clientData.sessions?.map((session: any) => ({
            label: session.title || '',
            value: session.id?.toString() || '',
          })) || [],
      });
    }
  }, [clientData, isOpen, reset]);

  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess, onClose]);

  const onSubmit = (data: AddClient) => {
    if (!clientId) return;

    try {
      const formattedDob = data.dob
        ? moment(data.dob).format('YYYY-MM-DD')
        : undefined;

      const updateData: Partial<ClientData> = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone_number,
        location: data.location,
        dob: formattedDob,
        gender: data.gender,
      };

      // Always include session_ids in the payload.
      // If no sessions are selected, an empty array will be sent,
      // signaling the backend to clear existing session associations.
      const selectedSessions = data.sessions || [];
      const sessionIds = selectedSessions
        .map((session) => parseInt(session.value))
        .filter((id) => !isNaN(id));
      updateData.session_ids = sessionIds;

      updateClient(
        { id: clientId, updateData },
        {
          onSuccess: () => {
            notifications.show({
              title: 'Success',
              message: 'Client updated successfully',
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
          onError: (error) => {
            notifications.show({
              title: 'Error',
              message: 'Failed to update client. Please try again.',
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
            console.error('Error updating client:', error);
          },
        }
      );
    } catch (error) {
      console.error('Error preparing update data:', error);
    }
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <Drawer
        opened={isOpen}
        onClose={onClose}
        position='right'
        size='lg'
        title='Update Client'
      >
        <div className='p-6'>Loading client data...</div>
      </Drawer>
    );
  }

  if (!clientData) {
    return (
      <Drawer
        opened={isOpen}
        onClose={onClose}
        position='right'
        size='lg'
        title='Update Client'
      >
        <div className='p-6'>Client not found.</div>
      </Drawer>
    );
  }

  return (
    <Drawer
      opened={isOpen}
      onClose={onClose}
      position='right'
      size='lg'
      title='Update Client'
      styles={{
        header: {
          padding: '1rem 1.5rem',
        },
        title: {
          fontSize: '24px',
          fontWeight: 'bold',
        },
        body: {
          padding: 0,
        },
      }}
    >
      <div className='w-full flex flex-col p-6'>
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='flex-1 flex flex-col p-2'
          >
            <div className='space-y-4 mb-8'>
              <h4 className='text-lg font-semibold text-gray-700'>
                Personal Information
              </h4>

              <div className='grid grid-cols-2 gap-4'>
                <Controller
                  name='first_name'
                  control={control}
                  rules={{ required: 'First name is required' }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label='First Name'
                      placeholder='Enter first name'
                    />
                  )}
                />
                <Controller
                  name='last_name'
                  control={control}
                  rules={{ required: 'Last name is required' }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label='Last Name'
                      placeholder='Enter last name'
                    />
                  )}
                />
              </div>

              <Controller
                name='phone_number'
                control={control}
                rules={{
                  pattern: {
                    value:
                      /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im,
                    message: 'Invalid phone number',
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label='Phone Number'
                    placeholder='Enter phone number'
                    type='tel'
                  />
                )}
              />

              <Controller
                name='email'
                control={control}
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label='Email Address'
                    placeholder='Enter email'
                    type='email'
                  />
                )}
              />

              <Controller
                name='location'
                control={control}
                render={({ field }) => (
                  <DropdownSelectInput
                    label='Location'
                    placeholder={
                      isLocationsLoading
                        ? 'Loading locations...'
                        : 'Select business location'
                    }
                    options={
                      isLocationsLoading
                        ? [{ label: 'Loading...', value: '' }]
                        : locationsData?.map((location) => ({
                            label: location.name,
                            value: location.name,
                          })) || []
                    }
                    value={field.value}
                    onSelectItem={(selected) => {
                      field.onChange(selected.value);
                    }}
                  />
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <Controller
                  name='dob'
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type='date'
                      label='Date of Birth'
                      placeholder='Select date'
                    />
                  )}
                />
                <Controller
                  name='gender'
                  control={control}
                  render={({ field }) => (
                    <DropdownSelectInput
                      label='Gender'
                      placeholder='Select gender'
                      options={[
                        { label: 'Male', value: 'M' },
                        { label: 'Female', value: 'F' },
                      ]}
                      value={field.value}
                      onSelectItem={(selected) => {
                        field.onChange(selected.value);
                      }}
                    />
                  )}
                />
              </div>
            </div>

            <div className='mb-8'>
              <Controller
                name='sessions'
                control={methods.control}
                render={({ field }) => (
                  <DropdownSelectInput
                    label='Sessions'
                    singleSelect={false}
                    placeholder='Select sessions'
                    options={
                      isClassSessionsLoading
                        ? [{ label: 'Loading...', value: '' }]
                        : classSessionsData
                            ?.filter(
                              (session) => session.session_type === 'class'
                            )
                            .map((session) => ({
                              label: session.title,
                              value: session.id.toString(),
                            })) || []
                    }
                    value={field.value?.map((item: any) => item.value) || []}
                    onSelectItem={(selectedItems) => {
                      field.onChange(selectedItems);
                    }}
                  />
                )}
              />
            </div>

            <div className='mt-auto flex justify-end gap-4'>
              <Button
                type='submit'
                color='#1D9B5E'
                radius='8px'
                className='w-full md:w-auto'
                disabled={isPending}
              >
                {isPending ? 'Updating...' : 'Update Client'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </Drawer>
  );
};

export default UpdateClient;
