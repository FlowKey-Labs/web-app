import { useState } from 'react';
import { Button, Modal, ActionIcon, Card, Text, Group, Loader } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

import { IconEdit, IconTrash, IconPlus, IconMapPin } from '@tabler/icons-react';

import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';

import {
  useGetLocations,
  useDeleteLocation,
  useSetPrimaryLocation,
} from '../../hooks/reactQuery';
import { Location } from '../../types/location';
import { useUIStore } from '../../store/ui';


export const BusinessLocation = () => {
  const { openDrawer } = useUIStore();
  const [locationToDelete, setLocationToDelete] = useState<number | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const { data: locations = [], isLoading } = useGetLocations();
  const deleteLocationMutation = useDeleteLocation();
  const setPrimaryLocationMutation = useSetPrimaryLocation();

  const handleAddLocation = () => {
    openDrawer({
      type: 'location',
      isEditing: false
    });
  };

  const handleEditLocation = (location: Location) => {
    openDrawer({
      type: 'location',
      entityId: location.id,
      isEditing: true
    });
  };

  const handleDeleteClick = (id: number) => {
    setLocationToDelete(id);
    open();
  };

  const handleDeleteConfirm = () => {
    if (locationToDelete) {
      deleteLocationMutation.mutate(locationToDelete, {
        onSuccess: () => {
          notifications.show({
            title: 'Success',
            message: 'Location deleted successfully!',
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
          close();
        },
        onError: (_error) => {
          notifications.show({
            title: 'Error',
            message: 'Failed to delete location. Please try again.',
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

  const handleSetPrimary = (id: number) => {
    setPrimaryLocationMutation.mutate(id, {
      onSuccess: () => {
        notifications.show({
          title: 'Success',
          message: 'Primary location set successfully!',
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
      onError: (_error) => {
        notifications.show({
          title: 'Error',
          message: 'Failed to set primary location. Please try again.',
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
  };

  return (
    <div className='p-6 bg-white rounded-lg shadow-sm w-full'>
      <div className='flex justify-between items-center mb-6'>
        <Text fw={600} size='lg'>
          Business Locations
        </Text>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={handleAddLocation}
          color='#1D9B5E'
          radius='md'
          size='sm'
        >
          Add Location
        </Button>
      </div>

      {isLoading ? (
        <div className='flex justify-center items-center h-screen'>
          <Loader color='#1D9B5E' size='xl' />
        </div>
      ) : locations.length === 0 ? (
        <div className='text-center py-12 bg-gray-50 rounded-lg border border-gray-200 space-y-2'>
          <IconMapPin size={48} className='mx-auto text-gray-400 mb-4' />
          <Text size='lg' fw={500} className='mb-2'>
            No locations added yet
          </Text>
          <Text size='sm' c='dimmed' className='mb-4'>
            Add your first business location to get started
          </Text>
          <Button
            variant='outline'
            color='green'
            radius='md'
            onClick={handleAddLocation}
          >
            Add Location
          </Button>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {(locations as unknown as Location[]).map((location) => (
            <Card
              key={location.id}
              shadow='sm'
              p='lg'
              radius='md'
              withBorder
              bg='#F8F7F7'
              className='font-sans'
            >
              {location.is_primary && (
                <div className='absolute top-2 right-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-lg'>
                  Primary
                </div>
              )}
              <div className='flex-grow'>
                <Text fw={500} size='md' className='mb-2 font-sans'>
                  {location.name}
                </Text>
                <div className='flex items-start mb-3'>
                  <IconMapPin size={16} className='text-gray-500 mr-2 mt-1' />
                  <Text size='sm' c='dimmed' className='font-sans'>
                    {location.address}, {location.city}, {location.state}{' '}
                    {location.zip_code}, {location.country}
                  </Text>
                </div>
                {location.notes && (
                  <Text size='sm' className='mb-4 text-gray-600 font-sans'>
                    {location.notes}
                  </Text>
                )}
              </div>

              <Group justify='space-between' mt='auto' pt='md'>
                {!location.is_primary ? (
                  <Button
                    variant='outline'
                    color='#1D9B5E'
                    size='xs'
                    radius='md'
                    onClick={() => handleSetPrimary(location.id)}
                    loading={setPrimaryLocationMutation.isPending}
                  >
                    Set as Primary
                  </Button>
                ) : (
                  <div>
                    {/* Empty div to maintain spacing when no button */}
                  </div>
                )}
                <Group gap={8} ml='auto'>
                  <ActionIcon
                    color='blue'
                    variant='light'
                    radius='xl'
                    onClick={() => handleEditLocation(location)}
                    className='hover:bg-blue-50'
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    color='red'
                    variant='light'
                    radius='xl'
                    onClick={() => handleDeleteClick(location.id)}
                    className='hover:bg-red-50'
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>
            </Card>
          ))}
        </div>
      )}

      <Modal
        opened={opened}
        onClose={close}
        title={
          <Text fw={600} size='lg'>
            Delete Location
          </Text>
        }
        centered
        radius='md'
        size='md'
        withCloseButton={false}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        shadow='xl'
      >
        <div className='flex items-start space-x-4 mb-6'>
          <div className='flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center'>
            <img src={errorIcon} alt='Warning' className='w-5 h-5' />
          </div>
          <div>
            <Text fw={500} size='md' mb={8} c='gray.8'>
              Are you sure you want to delete this location?
            </Text>
            <Text size='sm' c='gray.6'>
              This action cannot be undone. The location will be permanently
              removed from your business profile.
            </Text>
          </div>
        </div>

        <div className='flex justify-end gap-2 mt-4'>
          <Button variant="default" onClick={close}>
            Cancel
          </Button>
          <Button
            color='red'
            onClick={handleDeleteConfirm}
            loading={deleteLocationMutation.isPending}
            radius='md'
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
