import { FormProvider, useForm, Controller } from 'react-hook-form';
import type { DropDownItem } from '../common/Dropdown';
import { Client, GroupData } from '../../types/clientTypes';
import Input from '../common/Input';
import DropdownSelectInput from '../common/Dropdown';
import Button from '../common/Button';
import {
  useGetClients,
  useGetLocations,
  useUpdateGroup,
} from '../../hooks/reactQuery';
import { useEffect, useMemo } from 'react';
import { Location } from '../../types/location';
import { notifications } from '@mantine/notifications';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';

interface UpdateGroupProps {
  groupData: GroupData;
  onSuccess: () => void;
}

const UpdateGroup = ({ groupData, onSuccess }: UpdateGroupProps) => {
  const { data: clientsResponse, isLoading: isClientsLoading } = useGetClients(
    1, // page
    1000, // pageSize
    '' // search
  );

  const clientsData = clientsResponse?.items || [];
  const { data: locationsData, isLoading: isLocationsLoading } =
    useGetLocations() as { data: Location[] | undefined; isLoading: boolean }; 

  const { mutate: updateGroupMutation, isPending: isUpdating } =
    useUpdateGroup();

  const methods = useForm<GroupData>({
    defaultValues: {
      name: '',
      description: '',
      location: '',
      client_ids: [],
      contact_person: { id: undefined },
    },
  });

  const { control, handleSubmit, reset, watch, setValue } = methods;

  // Ensure client_ids are numbers in the form state
  const clientIds = watch('client_ids');
  useEffect(() => {
    if (Array.isArray(clientIds)) {
      const numericIds = clientIds
        .map((id) => {
          const num = Number(id);
          return isNaN(num) ? null : num;
        })
        .filter((id): id is number => id !== null);

      if (JSON.stringify(numericIds) !== JSON.stringify(clientIds)) {
        setValue('client_ids', numericIds);
      }
    }
  }, [clientIds, setValue]);

  // Pre-fill form with group data
  useEffect(() => {
    if (groupData) {
      let clientIds: number[] = [];

      if (Array.isArray(groupData.members) && groupData.members.length > 0) {
        if (typeof groupData.members[0] === 'number') {
          clientIds = (groupData.members as number[]).filter(
            (id) => id != null
          );
        }
        else if (typeof groupData.members[0] === 'object') {
          clientIds = (groupData.members as any[])
            .map((member) => member?.id)
            .filter((id): id is number => id != null);
        }
      }
      else if (
        Array.isArray(groupData.client_ids) &&
        groupData.client_ids.length > 0
      ) {
        clientIds = groupData.client_ids.filter((id) => id != null);
      }
      else if (
        Array.isArray(groupData.clients) &&
        groupData.clients.length > 0
      ) {
        clientIds = groupData.clients
          .map((client) => client?.id)
          .filter((id): id is number => id != null);
      }

      // Set contact person
      let contactPerson = undefined;
      if (groupData.contact_person?.id) {
        contactPerson = {
          id: groupData.contact_person.id,
          first_name: groupData.contact_person.first_name || '',
          last_name: groupData.contact_person.last_name || '',
          email: groupData.contact_person.email,
        };
      }
      else if (clientIds.length > 0) {
        if (Array.isArray(groupData.clients) && groupData.clients.length > 0) {
          const firstClient = groupData.clients[0];
          contactPerson = {
            id: firstClient.id,
            first_name: firstClient.first_name || '',
            last_name: firstClient.last_name || '',
            email: firstClient.email,
          };
        }
      }

      const formData = {
        name: groupData.name || '',
        description: groupData.description || '',
        location: groupData.location || '',
        client_ids: clientIds,
        contact_person: contactPerson,
      };

      reset(formData);
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

    const updateData = {
      name: data.name,
      description: data.description,
      location: data.location,
      client_ids: data.client_ids || [],
      contact_person_id: data.contact_person?.id,
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
          onSuccess();
        },
        onError: () => {
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

  const selectedClientIds = watch('client_ids') || [];

  const selectedClients = useMemo(() => {
    const filteredClients = clientsData.filter((client: Client) => {
      const isIncluded = selectedClientIds.includes(client.id);
      return isIncluded;
    });

    const contactPerson = watch('contact_person');

    if (contactPerson?.id && !selectedClientIds.includes(contactPerson.id)) {
      const contactClient = clientsData.find(
        (c: Client) => c.id === contactPerson.id
      );

      if (contactClient) {
        const enhancedContact = {
          ...contactClient,
          first_name: contactPerson.first_name || contactClient.first_name,
          last_name: contactPerson.last_name || contactClient.last_name,
          email: contactPerson.email || contactClient.email,
        };
        filteredClients.push(enhancedContact);
      }
    }
    return filteredClients;
  }, [selectedClientIds, clientsData, watch('contact_person')]);

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
            render={({ field }) => {
              const locationOptions = isLocationsLoading
                ? [{ label: 'Loading...', value: '' }]
                : locationsData?.map((location) => ({
                    label: location.name,
                    value: location.id.toString(),
                  })) || [];

              return (
                <DropdownSelectInput
                  label='Location'
                  placeholder={
                    isLocationsLoading
                      ? 'Loading locations...'
                      : 'Select business location'
                  }
                  options={locationOptions}
                  value={field.value ? field.value.toString() : ''}
                  onSelectItem={(selected) => {
                    field.onChange(Number(selected.value));
                  }}
                />
              );
            }}
          />

          <Controller
            name='client_ids'
            control={control}
            render={({ field }) => {
              const clientOptions: DropDownItem[] = isClientsLoading
                ? [{ label: 'Loading...', value: '' }]
                : Array.isArray(clientsData)
                ? clientsData
                    .filter((client): client is Client => !!client?.id)
                    .map((client) => ({
                      label:
                        `${client.first_name || ''} ${
                          client.last_name || ''
                        }`.trim() || 'Unnamed Client',
                      value: client.id.toString(), // Ensure value is string for dropdown
                      code: client.id.toString(),
                      subLabel: client.email || '',
                      status: client.active ? 'active' : 'inactive',
                    }))
                : [];

              const currentValue = field.value || [];
              const dropdownValue = Array.isArray(currentValue)
                ? currentValue.map(String)
                : [];

              const selectedValues = clientOptions
                .filter((option) =>
                  dropdownValue.includes(option.value.toString())
                )
                .map((option) => option.value.toString());

              return (
                <DropdownSelectInput
                  label='Group Members'
                  placeholder={
                    isClientsLoading
                      ? 'Loading clients...'
                      : 'Select clients to add to this group'
                  }
                  singleSelect={false}
                  options={clientOptions}
                  value={selectedValues}
                  onSelectItem={(selectedItems) => {
                    if (!selectedItems) {
                      field.onChange([]);
                      return;
                    }

                    const itemsArray = Array.isArray(selectedItems)
                      ? selectedItems
                      : [selectedItems];
                    const newValues = itemsArray
                      .filter((item) => item?.value && !item.isCreateOption)
                      .map((item) => {
                        const num = Number(item.value);
                        return isNaN(num) ? null : num;
                      })
                      .filter((id): id is number => id !== null);

                    field.onChange(newValues);
                  }}
                  createLabel='Create new client'
                  createDrawerType='client'
                />
              );
            }}
          />

          <Controller
            name='contact_person.id'
            control={control}
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
                    selected.value ? parseInt(selected.value) : undefined
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
