import { useForm, Controller, FormProvider } from 'react-hook-form';
import Input from '../common/Input';
import DropdownSelectInput from '../common/Dropdown';
import Button from '../common/Button';
import clientlocationIcons from '../../assets/icons/clientLocation.svg';
import { useAddClient, useGetClassSessions, useGetGroups, useAddGroup, useGetLocations, useGetClients, useGetSessions } from '../../hooks/reactQuery';
import React from 'react';
import moment from 'moment';
import { AddClient, ClientData, GroupData, Client } from '../../types/clientTypes';
import { Location } from '../../types/location';
import { Drawer } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';

interface ClientsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddClients = ({ isOpen, onClose }: ClientsModalProps) => {
  const [activeTab, setActiveTab] = React.useState<string>('individual');
  
  const handleTabChange = (value: string | null) => {
    if (value) setActiveTab(value);
  };

  const individualMethods = useForm<AddClient>({
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
      group_id: null,
    },
  });
  
  const groupFormMethods = useForm<GroupData & { client_ids: number[], session_ids: number[] }>({
    defaultValues: {
      name: '',
      description: '',
      location: '',
      active: true,
      client_ids: [],
      session_ids: [],
      contact_person_id: undefined,
    },
  });
  
  const { control: individualControl, handleSubmit: individualHandleSubmit, reset: individualReset } = individualMethods;
  const { control: groupControl, handleSubmit: groupHandleSubmit, reset: groupReset } = groupFormMethods;

  const { mutate: addClient, isPending: isAddingClient, isSuccess: isClientSuccess } = useAddClient();
  const { mutate: addGroup, isPending: isAddingGroup, isSuccess: isGroupSuccess } = useAddGroup();
  const { data: classSessionsData, isLoading: isClassSessionsLoading } = useGetClassSessions();
  const { data: locationsData, isLoading: isLocationsLoading } = useGetLocations() as { data: Location[] | undefined, isLoading: boolean };
  const { data: clientsData, isLoading: isClientsLoading } = useGetClients() as { data: Client[] | undefined, isLoading: boolean };
  const { data: sessionsData, isLoading: isSessionsLoading } = useGetSessions() as { data: any[] | undefined, isLoading: boolean };
  useGetGroups();

  React.useEffect(() => {
    if (isClientSuccess) {
      individualReset();
      groupReset();
      onClose();
    }
  }, [isClientSuccess, individualReset, groupReset, onClose]);
  
  React.useEffect(() => {
    if (isGroupSuccess) {
      groupReset();
      onClose();
    }
  }, [isGroupSuccess, groupReset, onClose]);

  // const handleCreateGroup = async (groupData: GroupData) => {
  //   return new Promise<number>((resolve, reject) => {
  //     addGroup(groupData, {
  //       onSuccess: (response) => {
  //         notifications.show({
  //           title: 'Success',
  //           message: 'Group created successfully',
  //           color: 'green',
  //           icon: (
  //             <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
  //               <img src={successIcon} alt='Success' className='w-4 h-4' />
  //             </span>
  //           ),
  //           withBorder: true,
  //           autoClose: 3000,
  //         });
  //         resolve(response.id);
  //       },
  //       onError: (error) => {
  //         notifications.show({
  //           title: 'Error',
  //           message: 'Failed to create group. Please try again.',
  //           color: 'red',
  //           icon: (
  //             <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
  //               <img src={errorIcon} alt='Error' className='w-4 h-4' />
  //             </span>
  //           ),
  //           withBorder: true,
  //           autoClose: 3000,
  //         });
  //         reject(error);
  //       }
  //     });
  //   });
  // };

  const handleSubmitIndividual = individualHandleSubmit(async (data) => {
    try {
      const formattedDob = data.dob
        ? moment(data.dob).format('YYYY-MM-DD')
        : undefined;

      const clientData: ClientData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone_number,
        location: data.location,
        assigned_classes: data.assigned_classes || 0,
        active: false,
        created_at: '',
        created_by: 0,
        business: 0,
        dob: formattedDob,
        gender: data.gender ? data.gender : 'M',
        group_id: null,
      };

      if (data.sessions && data.sessions.length > 0) {
        clientData.session_ids = data.sessions.map((session) => parseInt(session.value));
      }

      addClient(clientData, {
        onSuccess: () => {
          notifications.show({
            title: 'Success',
            message: 'Client added successfully',
            color: 'green',
            icon: (
              <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
                <img src={successIcon} alt='Success' className='w-4 h-4' />
              </span>
            ),
            withBorder: true,
            autoClose: 3000,
          });
        },
        onError: (error) => {
          console.error('Failed to add client:', error);
          notifications.show({
            title: 'Error',
            message: 'Failed to add client. Please try again.',
            color: 'red',
            icon: (
              <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
                <img src={errorIcon} alt='Error' className='w-4 h-4' />
              </span>
            ),
            withBorder: true,
            autoClose: 3000,
          });
        },
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  });
  
  const [selectedClients, setSelectedClients] = React.useState<{id: number, name: string}[]>([]);

  React.useEffect(() => {
    const subscription = groupFormMethods.watch((value, { name }) => {
      if (name === 'client_ids' && value.client_ids) {
        const clientIds = value.client_ids as number[];
        if (clientIds.length > 0 && clientsData) {
          const selectedClientsList = clientsData
            .filter(client => clientIds.includes(client.id))
            .map(client => ({
              id: client.id,
              name: `${client.first_name} ${client.last_name}`
            }));
          
          setSelectedClients(selectedClientsList);
          
          const currentContactPerson = groupFormMethods.getValues('contact_person_id');
          if (!currentContactPerson && selectedClientsList.length > 0) {
            groupFormMethods.setValue('contact_person_id', selectedClientsList[0].id);
          }
        } else {
          setSelectedClients([]);
          groupFormMethods.setValue('contact_person_id', undefined);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [groupFormMethods, clientsData]);

  const handleSubmitGroup = groupHandleSubmit(async (data) => {
    try {
      if (!data.client_ids || data.client_ids.length === 0) {
        notifications.show({
          title: 'Error',
          message: 'A group must have at least one client',
          color: 'red',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
          withBorder: true,
          autoClose: 3000,
        });
        return;
      }
      
      if (!data.contact_person_id) {
        notifications.show({
          title: 'Error',
          message: 'Please select a contact person for the group',
          color: 'red',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
          withBorder: true,
          autoClose: 3000,
        });
        return;
      }
      
      const groupData: GroupData & { client_ids: number[], session_ids: number[], contact_person_id: number } = {
        name: data.name,
        description: data.description || '',
        location: data.location || '',
        active: data.active !== undefined ? data.active : true,
        client_ids: data.client_ids,
        session_ids: data.session_ids || [],
        contact_person_id: data.contact_person_id,
      };
      
      addGroup(groupData, {
        onSuccess: () => {
          notifications.show({
            title: 'Success',
            message: 'Group created successfully',
            color: 'green',
            icon: (
              <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
                <img src={successIcon} alt='Success' className='w-4 h-4' />
              </span>
            ),
            withBorder: true,
            autoClose: 3000,
          });
        },
        onError: (error) => {
          console.error('Failed to create group:', error);
          notifications.show({
            title: 'Error',
            message: 'Failed to create group. Please try again.',
            color: 'red',
            icon: (
              <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
                <img src={errorIcon} alt='Error' className='w-4 h-4' />
              </span>
            ),
            withBorder: true,
            autoClose: 3000,
          });
        },
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  });

  if (!isOpen) return null;

  return (
    <Drawer
      opened={isOpen}
      onClose={onClose}
      position='right'
      size='lg'
      title='Add Client or Group'
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
        <div className='flex gap-4 mb-6'>
          <button
            type='button'
            onClick={() => handleTabChange('individual')}
            className={`px-6 py-2 font-medium rounded-lg hover:opacity-90 transition-opacity text-sm ${
              activeTab === 'individual'
                ? 'text-primary bg-[#1D9B5E33]'
                : 'text-gray-500 bg-gray-100'
            }`}
          >
            Individual Client
          </button>
          <button
            type='button'
            onClick={() => handleTabChange('group')}
            className={`px-6 py-2 font-medium rounded-lg hover:opacity-90 transition-opacity text-sm ${
              activeTab === 'group'
                ? 'text-primary bg-[#1D9B5E33]'
                : 'text-gray-500 bg-gray-100'
            }`}
          >
            Group
          </button>
        </div>

        {/* Individual Client Form */}
        {activeTab === 'individual' && (
          <FormProvider {...individualMethods}>
            <form
              onSubmit={handleSubmitIndividual}
              className='flex-1 flex flex-col p-2'
            >
              <div className='space-y-4 mb-8'>
                <h4 className='text-lg font-semibold text-gray-700'>
                  Client Information
                </h4>
                
                <div className='grid grid-cols-2 gap-4'>
                  <Controller
                    name='first_name'
                    control={individualControl}
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
                    control={individualControl}
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
                  control={individualControl}
                  rules={{
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9+\s-]+$/,
                      message: 'Invalid phone number'
                    }
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
                  control={individualControl}
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
                  control={individualControl}
                  render={({ field }) => (
                    <DropdownSelectInput
                      {...field}
                      label='Location'
                      placeholder='Select location'
                      options={locationsData?.map((location: any) => ({
                        label: location.name,
                        value: location.id,
                      })) || []}
                      onSelectItem={(item) => {
                        field.onChange(item.value);
                      }}
                      value={field.value}
                    />
                  )}
                />

                <div className='grid grid-cols-2 gap-4'>
                  <Controller
                    name='dob'
                    control={individualControl}
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
                    control={individualControl}
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
                  control={individualControl}
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
                  disabled={isAddingClient}
                >
                  {isAddingClient ? 'Creating...' : 'Add Client'}
                </Button>
              </div>
            </form>
          </FormProvider>
        )}

        {/* Group Form */}
        {activeTab === 'group' && (
          <FormProvider {...groupFormMethods}>
            <form
              onSubmit={handleSubmitGroup}
              className='flex-1 flex flex-col p-2'
            >
              <div className='space-y-4 mb-8'>
                <h4 className='text-lg font-semibold text-gray-700'>
                  Group Information
                </h4>
                
                <Controller
                  name='name'
                  control={groupControl}
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
                  control={groupControl}
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
                  control={groupControl}
                  render={({ field }) => (
                    <DropdownSelectInput
                      label='Location'
                      placeholder={isLocationsLoading ? 'Loading locations...' : 'Select business location'}
                      options={
                        isLocationsLoading
                          ? [{ label: 'Loading...', value: '' }]
                          : locationsData
                              ?.map((location) => ({
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
                  control={groupControl}
                  rules={{ required: 'At least one client is required for a group' }}
                  render={({ field }) => (
                    <DropdownSelectInput
                      label='Group Members'
                      placeholder={isClientsLoading ? 'Loading clients...' : 'Select clients to add to this group'}
                      singleSelect={false}
                      options={
                        isClientsLoading
                          ? [{ label: 'Loading...', value: '' }]
                          : clientsData
                              ?.map((client) => ({
                                label: `${client.first_name} ${client.last_name}`,
                                value: client.id.toString(),
                              })) || []
                      }
                      value={field.value?.map((id: number) => id.toString()) || []}
                      onSelectItem={(selectedItems) => {
                        field.onChange(selectedItems.map((item: { value: string }) => parseInt(item.value)));
                      }}
                    />
                  )}
                />
                
                <Controller
                  name='session_ids'
                  control={groupControl}
                  render={({ field }) => (
                    <DropdownSelectInput
                      label='Sessions'
                      placeholder={isSessionsLoading ? 'Loading sessions...' : 'Select sessions for this group'}
                      singleSelect={false}
                      options={
                        isSessionsLoading
                          ? [{ label: 'Loading...', value: '' }]
                          : sessionsData
                              ?.map((session) => ({
                                label: session.title,
                                value: session.id.toString(),
                              })) || []
                      }
                      value={field.value?.map((id: number) => id.toString()) || []}
                      onSelectItem={(selectedItems) => {
                        field.onChange(selectedItems.map((item: { value: string }) => parseInt(item.value)));
                      }}
                    />
                  )}
                />
                
                <Controller
                  name='contact_person_id'
                  control={groupControl}
                  rules={{ required: 'Contact person is required' }}
                  render={({ field }) => (
                    <DropdownSelectInput
                      label='Contact Person'
                      placeholder={selectedClients.length === 0 ? 'First select group members' : 'Select contact person'}
                      options={
                        selectedClients.length === 0
                          ? [{ label: 'First select group members', value: '' }]
                          : selectedClients.map((client) => ({
                              label: client.name,
                              value: client.id.toString(),
                            }))
                      }
                      value={field.value ? field.value.toString() : ''}
                      onSelectItem={(selected) => {
                        field.onChange(selected.value ? parseInt(selected.value) : null);
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
                  disabled={isAddingGroup}
                >
                  {isAddingGroup ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            </form>
          </FormProvider>
        )}
      </div>
    </Drawer>
  );
};

export default AddClients;
