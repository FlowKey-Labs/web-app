import { useEffect } from 'react';
import { Drawer, Button, Group, Checkbox } from '@mantine/core';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { notifications } from '@mantine/notifications';

import Input from '../common/Input';
import { useUIStore } from '../../store/ui';
import {
  useGetLocations,
  useCreateLocation,
  useUpdateLocation,
} from '../../hooks/reactQuery';
import { CreateLocationData, Location } from '../../types/location';

import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';

const emptyLocation: CreateLocationData = {
  name: '',
  address: '',
  city: '',
  state: '',
  zip_code: '',
  country: '',
  is_primary: false,
  notes: '',
};

interface LocationDrawerProps {
  entityId?: number | string | null;
  isEditing?: boolean;
  zIndex?: number;
}

export default function LocationDrawer({ entityId, isEditing, zIndex }: LocationDrawerProps) {
  const { closeDrawer } = useUIStore();
  const editingId = entityId ? Number(entityId) : null;
  
  const methods = useForm<CreateLocationData>({
    defaultValues: emptyLocation,
  });
  
  const { handleSubmit, reset } = methods;
  const { data: locationsData = [] } = useGetLocations();
  const createLocationMutation = useCreateLocation();
  const updateLocationMutation = useUpdateLocation();

  const locations = locationsData as unknown as Location[];

  useEffect(() => {
    if (editingId && locations.length > 0) {
      const locationToEdit = locations.find(location => location.id === editingId);
      if (locationToEdit) {
        reset({
          name: locationToEdit.name,
          address: locationToEdit.address,
          city: locationToEdit.city,
          state: locationToEdit.state,
          zip_code: locationToEdit.zip_code,
          country: locationToEdit.country,
          is_primary: locationToEdit.is_primary,
          notes: locationToEdit.notes || '',
        });
      }
    } else {
      reset(emptyLocation);
    }
  }, [editingId, locations, reset]);

  const onSubmit = (data: CreateLocationData) => {
    if (editingId) {
      updateLocationMutation.mutate(
        {
          id: editingId,
          data: data,
        },
        {
          onSuccess: () => {
            notifications.show({
              title: 'Success',
              message: 'Location updated successfully!',
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
            closeDrawer();
          },
          onError: (_error) => {
            notifications.show({
              title: 'Error',
              message: 'Failed to update location. Please try again.',
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
    } else {
      createLocationMutation.mutate(data, {
        onSuccess: () => {
          notifications.show({
            title: 'Success',
            message: 'Location created successfully!',
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
          closeDrawer();
        },
        onError: (_error) => {
          notifications.show({
            title: 'Error',
            message: 'Failed to create location. Please try again.',
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
      });
    }
  };

  return (
    <Drawer
      opened={true}
      onClose={closeDrawer}
      title={editingId ? 'Edit Location' : 'Add New Location'}
      position='right'
      size='md'
      padding='xl'
      zIndex={zIndex}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <Controller
            name='name'
            control={methods.control}
            rules={{ required: 'Location name is required' }}
            render={({ field }) => (
              <Input
                {...field}
                label='Location Name'
                placeholder='Main Office'
                containerClassName='mb-4'
              />
            )}
          />
          <Controller
            name='address'
            control={methods.control}
            rules={{ required: 'Address is required' }}
            render={({ field }) => (
              <Input
                {...field}
                label='Address'
                placeholder='123 Business St'
                containerClassName='mb-4'
              />
            )}
          />
          <div className='grid grid-cols-2 gap-4 mb-4'>
            <Controller
              name='city'
              control={methods.control}
              rules={{ required: 'City is required' }}
              render={({ field }) => (
                <Input
                  {...field}
                  label='City'
                  placeholder='Nairobi'
                />
              )}
            />
            <Controller
              name='state'
              control={methods.control}
              rules={{ required: 'State is required' }}
              render={({ field }) => (
                <Input
                  {...field}
                  label='State/Province'
                  placeholder='Nairobi'
                />
              )}
            />
          </div>
          <div className='grid grid-cols-2 gap-4 mb-4'>
            <Controller
              name='zip_code'
              control={methods.control}
              rules={{ required: 'ZIP code is required' }}
              render={({ field }) => (
                <Input
                  {...field}
                  label='ZIP/Postal Code'
                  placeholder='00100'
                />
              )}
            />
            <Controller
              name='country'
              control={methods.control}
              rules={{ required: 'Country is required' }}
              render={({ field }) => (
                <Input
                  {...field}
                  label='Country'
                  placeholder='Kenya'
                />
              )}
            />
          </div>

          <Controller
            name='notes'
            control={methods.control}
            render={({ field }) => (
              <Input
                {...field}
                label='Notes'
                placeholder='Additional information about this location'
                type='textarea'
                rows={3}
                containerClassName='mb-4'
              />
            )}
          />
          <div className='flex items-center space-x-2 mb-8'>
            <Controller
              name='is_primary'
              control={methods.control}
              render={({ field: { value, onChange } }) => (
                <Checkbox
                  id='is_primary'
                  checked={value}
                  onChange={(e) => onChange(e.currentTarget.checked)}
                  label='Set as primary location'
                  color='#1D9B5E'
                />
              )}
            />
          </div>

          <Group justify='flex-end' mt='xl'>
            <Button 
              color='#1D9B5E' 
              type='submit' 
              radius='md' 
              size='sm'
              loading={createLocationMutation.isPending || updateLocationMutation.isPending}
            >
              {editingId ? 'Update' : 'Add'} Location
            </Button>
          </Group>
        </form>
      </FormProvider>
    </Drawer>
  );
} 