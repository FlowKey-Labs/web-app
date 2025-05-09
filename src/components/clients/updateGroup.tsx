import { FormProvider, useForm } from 'react-hook-form';
import { Client, GroupData } from '../../types/clientTypes';
import Input from '../common/Input';
import DropdownSelectInput from '../common/Dropdown';
import Button from '../common/Button';
import { Controller } from 'react-hook-form';
import { useGetClients, useGetLocations } from '../../hooks/reactQuery'; // Added useGetLocations
import { useGetSessions } from '../../hooks/reactQuery';
import { useUpdateGroup } from '../../hooks/reactQuery';
import { useEffect } from 'react';
import { Location } from '../../types/location'; // Added

import { notifications } from '@mantine/notifications';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';
import clientlocationIcons from '../../assets/icons/clientLocation.svg';

interface UpdateGroupProps {
  groupData: GroupData;
  onSuccess: () => void;
}

const UpdateGroup = ({ groupData, onSuccess }: UpdateGroupProps) => {
  const { data: clientsData, isLoading: isClientsLoading } = useGetClients();
  const { data: sessionsData, isLoading: isSessionsLoading } = useGetSessions();
  const { data: locationsData, isLoading: isLocationsLoading } =
    useGetLocations() as { data: Location[] | undefined; isLoading: boolean }; // Added

  const { mutate: updateGroupMutation, isPending: isUpdating } =
    useUpdateGroup();

  const methods = useForm<GroupData>({
    defaultValues: {
      name: '',
      description: '',
      location: '',
      client_ids: [],
      session_ids: [],
      contact_person_id: undefined,
    },
  });

  const { control, handleSubmit, reset, watch } = methods;

  // Pre-fill form with group data
  useEffect(() => {
    if (groupData) {
      reset({
        name: groupData.name,
        description: groupData.description || '',
        location: groupData.location || '',
        client_ids: groupData.client_ids || [],
        session_ids: groupData.session_ids || [],
        contact_person_id: groupData.contact_person_id || undefined,
      });
    }
  }, [groupData, reset]);

  const onSubmit = (data: GroupData) => {
    if (!groupData.id) {
      notifications.show({
        title: 'Error',
        message: 'Group ID is missing. Cannot update group.',
        color: 'red',
      });
      return;
    }

    // Prepare the data for submission
    const updateData = {
      name: data.name,
      description: data.description,
      location: data.location,
      client_ids: data.client_ids || [],
      session_ids: data.session_ids || [],
      contact_person_id: data.contact_person_id,
    };

    updateGroupMutation(
      {
        id: groupData.id.toString(),
        updateData,
      },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Success',
            message: 'Group updated successfully.',
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
          // Trigger a full data refresh
          onSuccess();
        },
        onError: (error) => {
          console.error('Update error:', error);
          notifications.show({
            title: 'Error',
            message: 'Failed to update group. Please try again.',
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

  // Get selected clients for contact person dropdown
  const selectedClientIds = watch('client_ids') || [];
  const selectedClients =
    clientsData?.filter((client: Client) =>
      selectedClientIds.includes(client.id)
    ) || [];

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='flex-1 flex flex-col p-2'
      >
        <div className='space-y-4 mb-8'>
          <h4 className='text-lg font-semibold text-gray-700'>
            Update Group Information
          </h4>

          <Controller
            name='name'
            control={control}
            rules={{ required: 'Group name is required' }}
            render={({ field }) => (
              <Input
                {...field}
                label='Group Name'
                placeholder='Enter group name'
              />
            )}
          />

          <Controller
            name='description'
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type='textarea'
                rows={4}
                label='Group Description'
                placeholder='Enter additional information about the group (optional)'
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

          <Controller
            name='client_ids'
            control={control}
            rules={{
              required: 'At least one client is required for a group',
            }}
            render={({ field }) => (
              <DropdownSelectInput
                label='Group Members'
                placeholder={
                  isClientsLoading
                    ? 'Loading clients...'
                    : 'Select clients to add to this group'
                }
                singleSelect={false}
                options={
                  isClientsLoading
                    ? [{ label: 'Loading...', value: '' }]
                    : clientsData?.map((client: Client) => ({
                        label: `${client.first_name} ${client.last_name}`,
                        value: client.id.toString(),
                      })) || []
                }
                value={field.value?.map((id: number) => id.toString()) || []}
                onSelectItem={(selectedItems) => {
                  field.onChange(
                    selectedItems.map((item: { value: string }) =>
                      parseInt(item.value)
                    )
                  );
                }}
              />
            )}
          />

          <Controller
            name='session_ids'
            control={control}
            render={({ field }) => (
              <DropdownSelectInput
                label='Sessions'
                placeholder={
                  isSessionsLoading
                    ? 'Loading sessions...'
                    : 'Select sessions for this group'
                }
                singleSelect={false}
                options={
                  isSessionsLoading
                    ? [{ label: 'Loading...', value: '' }]
                    : sessionsData?.map((session) => ({
                        label: session.title,
                        value: session.id.toString(),
                      })) || []
                }
                value={field.value?.map((id: number) => id.toString()) || []}
                onSelectItem={(selectedItems) => {
                  field.onChange(
                    selectedItems.map((item: { value: string }) =>
                      parseInt(item.value)
                    )
                  );
                }}
              />
            )}
          />

          <Controller
            name='contact_person_id'
            control={control}
            rules={{ required: 'Contact person is required' }}
            render={({ field }) => (
              <DropdownSelectInput
                label='Contact Person'
                placeholder={
                  selectedClients.length === 0
                    ? 'First select group members'
                    : 'Select contact person'
                }
                options={
                  selectedClients.length === 0
                    ? [{ label: 'First select group members', value: '' }]
                    : selectedClients.map((client: Client) => ({
                        label: `${client.first_name} ${client.last_name}`,
                        value: client.id.toString(),
                      }))
                }
                value={field.value ? field.value.toString() : ''}
                onSelectItem={(selected) => {
                  field.onChange(
                    selected.value ? parseInt(selected.value) : null
                  );
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
            loading={isUpdating}
          >
            Update Group
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default UpdateGroup;
