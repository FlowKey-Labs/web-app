import { useEffect, useState } from 'react';
import { Drawer, Loader } from '@mantine/core';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { notifications } from '@mantine/notifications';
import moment from 'moment';

import { AddClient, Client, GroupData } from '../../types/clientTypes';
import { Location } from '../../types/location';
import { useUIStore } from '../../store/ui';
import {
  useAddClient,
  useUpdateClient,
  useGetClient,
  useAddGroup,
  useGetClients,
  useGetSessions,
  useGetLocations,
} from '../../hooks/reactQuery';
import Input from '../common/Input';
import DropdownSelectInput from '../common/Dropdown';
import Button from '../common/Button';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';

const emptyClient: AddClient = {
  first_name: '',
  last_name: '',
  phone_number: '',
  email: '',
  location: '',
  dob: '',
  gender: 'M',
  assigned_classes: 0,
  active: false,
  created_at: '',
  created_by: 0,
  business: 0,
  sessions: [],
  group_id: null,
};

interface ClientDrawerProps {
  entityId?: number | string | null;
  isEditing?: boolean;
  zIndex?: number;
}

export default function ClientDrawer({ entityId, isEditing, zIndex }: ClientDrawerProps) {
  const { closeDrawer, drawerStack } = useUIStore();
  const [activeTab, setActiveTab] = useState<string>('individual');
  const editingId = entityId ? Number(entityId) : null;
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const parentDrawer = drawerStack.length > 1 
    ? drawerStack[drawerStack.length - 2] 
    : null;
  
  const isFromSessionDrawer = parentDrawer?.type === 'session';
  
  const methods = useForm<AddClient>({
    defaultValues: emptyClient,
  });
  
  const groupFormMethods = useForm<GroupData & { client_ids: number[], session_ids: number[], contact_person_id?: number }>({
    defaultValues: {
      name: '',
      description: '',
      location: '',
      active: true,
      client_ids: [],
      session_ids: [],
      contact_person: undefined,
    },
  });
  
  const { control: individualControl, handleSubmit: individualHandleSubmit, reset: individualReset } = methods;
  const { control: groupControl, handleSubmit: groupHandleSubmit, reset: groupReset } = groupFormMethods;

  const { data: clientData, isLoading: isClientLoading } = useGetClient(editingId ? String(editingId) : '');
  const { mutate: addClient, isPending: isAddingClient } = useAddClient();
  const { mutate: updateClient, isPending: isUpdatingClient } = useUpdateClient();
  const { data: locationsData, isLoading: isLocationsLoading } = useGetLocations()
  const { data: clientsData, isLoading: isClientsLoading } = useGetClients()
  const { data: sessionsData, isLoading: isSessionsLoading } = useGetSessions();
  const { mutate: addGroup, isPending: isAddingGroup } = useAddGroup();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  useEffect(() => {
    if (isEditing && editingId && clientData) {
      
      setTimeout(() => {
        try {
          const formattedDob = clientData.dob 
            ? moment(clientData.dob).format('YYYY-MM-DD') 
            : '';
          
          const formattedSessions = clientData.sessions?.map((session: any) => {
            if (!session || typeof session !== 'object') return null;
            
            return {
              label: session.title || session.name || session.session_title || 'Unnamed Session',
              value: session.id?.toString() || session.session_id?.toString() || ''
            };
          }).filter(Boolean) || [];
          
          let locationValue = '';
          if (clientData.location_id) {
            locationValue = clientData.location_id.toString();
          } else if (clientData.location) {
            if (typeof clientData.location === 'object' && clientData.location.id) {
              locationValue = clientData.location.id.toString();
            } else if (typeof clientData.location === 'number') {
              locationValue = clientData.location.toString();
            } else if (typeof clientData.location === 'string') {
              locationValue = clientData.location;
            }
          }
          
          individualReset({
            first_name: clientData.first_name || '',
            last_name: clientData.last_name || '',
            phone_number: clientData.phone_number || '',
            email: clientData.email || '',
            location: locationValue,
            dob: formattedDob,
            gender: clientData.gender || 'M',
            assigned_classes: clientData.assigned_classes || 0,
            sessions: formattedSessions,
            group_id: clientData.group_id ? Number(clientData.group_id) : null,
            active: clientData.active,
            created_at: clientData.created_at || '',
            created_by: clientData.created_by || 0,
            business: clientData.business || 0,
          });
        } catch (error) {
          console.error('Error resetting form with client data:', error);
        }
      }, 0);
    } else {
      individualReset(emptyClient);
      groupReset();
    }
  }, [editingId, clientData, individualReset, groupReset, isEditing, locationsData]);

  const [selectedClients, setSelectedClients] = useState<{id: number, name: string}[]>([]);

  useEffect(() => {
    const subscription = groupFormMethods.watch((value, { name }) => {
      if (name === 'client_ids' && value.client_ids) {
        const clientIds = value.client_ids as number[];
        if (clientIds.length > 0 && clientsData) {
          const selectedClientsList = clientsData.items
            .filter(client => clientIds.includes(client.id))
            .map(client => ({
              id: client.id,
              name: `${client.first_name} ${client.last_name}`
            }));
          
          setSelectedClients(selectedClientsList);
          
          const currentContactPerson = groupFormMethods.getValues('contact_person');
          if (!currentContactPerson && selectedClientsList.length > 0) {
            groupFormMethods.setValue('contact_person', {
              id: selectedClientsList[0].id,
              first_name: selectedClientsList[0].name.split(' ')[0],
              last_name: selectedClientsList[0].name.split(' ')[1],
            });
          }
        } else {
          setSelectedClients([]);
          groupFormMethods.setValue('contact_person', undefined);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [groupFormMethods, clientsData]);

  const handleSubmitIndividual = individualHandleSubmit(async (data) => {
    try {
      setFormErrors({});
      
      const formattedDob = data.dob
        ? moment(data.dob).format('YYYY-MM-DD')
        : undefined;

      const clientData: any = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone_number,
        location: data.location || "",
        dob: formattedDob,
        gender: data.gender || 'M',
        group_id: data.group_id || null,
      };

      if (isFromSessionDrawer && parentDrawer?.entityId) {
        const sessionId = parentDrawer.entityId;
        console.log(`Adding client to session ID: ${sessionId}`);
        clientData.session_ids = [parseInt(sessionId.toString())];
      } else if (data.sessions && data.sessions.length > 0) {
        const sessionIds = data.sessions
          .filter(session => session && typeof session === 'object' && session.value)
          .map(session => parseInt(session.value));
        
        if (sessionIds.length > 0) {
          clientData.session_ids = sessionIds;
        }
      }

      if (isEditing && editingId) {
        updateClient({
          id: editingId.toString(),
          updateData: clientData
        }, {
          onSuccess: () => {
            notifications.show({
              title: 'Success',
              message: 'Client updated successfully',
              color: 'green',
              icon: (
                <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
                  <img src={successIcon} alt='Success' className='w-4 h-4' />
                </span>
              ),
              withBorder: true,
              autoClose: 3000,
              styles: { root: { zIndex: 10000 } },
            });
            closeDrawer();
          },
          onError: (error: any) => {
            console.error('Failed to update client:', error);

            let errorMessage = 'Failed to update client. Please try again.';
            const newFormErrors: Record<string, string> = {};
            
            if (error.response?.data) {
              const errorData = error.response.data;
              if (typeof errorData === 'object' && Object.keys(errorData).length > 0) {
                Object.entries(errorData).forEach(([field, messages]) => {
                  if (Array.isArray(messages) && messages.length > 0) {
                    newFormErrors[field] = messages[0];
                  }
                });
                
                const formattedErrors = Object.entries(errorData)
                  .map(([field, messages]) => {
                    if (Array.isArray(messages) && messages.length > 0) {
                      return `${field.replace(/_/g, ' ')}: ${messages[0]}`;
                    }
                    return null;
                  })
                  .filter(Boolean)
                  .join('\n');
                
                if (formattedErrors) {
                  errorMessage = formattedErrors;
                }
              } else if (typeof errorData === 'string') {
                errorMessage = errorData;
              }
            }
            
            setFormErrors(newFormErrors);

            notifications.show({
              title: 'Error',
              message: errorMessage,
              color: 'red',
              icon: (
                <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
                  <img src={errorIcon} alt='Error' className='w-4 h-4' />
                </span>
              ),
              withBorder: true,
              autoClose: 5000,
              styles: { root: { zIndex: 10000 } },
            });
          },
        });
      } else {
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
              styles: { root: { zIndex: 10000 } },
            });
            closeDrawer();
          },
          onError: (error: any) => {
            console.error('Failed to add client:', error);
            let errorMessage = 'Failed to add client. Please try again.';
            const newFormErrors: Record<string, string> = {};
            
            if (error.response?.data) {
              const errorData = error.response.data;
              if (typeof errorData === 'object' && Object.keys(errorData).length > 0) {
                Object.entries(errorData).forEach(([field, messages]) => {
                  if (Array.isArray(messages) && messages.length > 0) {
                    newFormErrors[field] = messages[0];
                  }
                });
                
                const formattedErrors = Object.entries(errorData)
                  .map(([field, messages]) => {
                    if (Array.isArray(messages) && messages.length > 0) {
                      return `${field.replace(/_/g, ' ')}: ${messages[0]}`;
                    }
                    return null;
                  })
                  .filter(Boolean)
                  .join('\n');
                
                if (formattedErrors) {
                  errorMessage = formattedErrors;
                }
              } else if (typeof errorData === 'string') {
                errorMessage = errorData;
              }
            }
            
            setFormErrors(newFormErrors);

            notifications.show({
              title: 'Error',
              message: errorMessage,
              color: 'red',
              icon: (
                <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
                  <img src={errorIcon} alt='Error' className='w-4 h-4' />
                </span>
              ),
              withBorder: true,
              autoClose: 5000,
              styles: { root: { zIndex: 10000 } },
            });
          },
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  });
  
  const handleSubmitGroup = groupHandleSubmit(async (data) => {
    try {
      setFormErrors({});
      
      if (!data.client_ids || data.client_ids.length === 0) {
        setFormErrors({ client_ids: 'A group must have at least one client' });
        notifications.show({
          title: 'Error',
          message: 'A group must have at least one client',
          color: 'red',
          styles: { root: { zIndex: 10000 } },
        });
        return;
      }
      
      if (!data.contact_person) {
        setFormErrors({ contact_person: 'Please select a contact person for the group' });
        notifications.show({
          title: 'Error',
          message: 'Please select a contact person for the group',
          color: 'red',
          styles: { root: { zIndex: 10000 } },
        });
        return;
      }
      
      const groupData = {
        name: data.name,
        description: data.description || '',
        location: data.location || '',
        active: data.active !== undefined ? data.active : true,
        client_ids: data.client_ids,
        session_ids: data.session_ids || [],
        contact_person_id: data.contact_person.id,
      };
      
      if (isFromSessionDrawer && parentDrawer?.entityId) {
        const sessionId = parentDrawer.entityId;
        console.log(`Adding group to session ID: ${sessionId}`);
        groupData.session_ids = [parseInt(sessionId.toString())];
      }
      
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
            styles: { root: { zIndex: 10000 } },
          });
          closeDrawer();
        },
        onError: (error: any) => {
          console.error('Failed to create group:', error);
          let errorMessage = 'Failed to create group. Please try again.';
          const newFormErrors: Record<string, string> = {};
          
          if (error.response?.data) {
            const errorData = error.response.data;
            if (typeof errorData === 'object' && Object.keys(errorData).length > 0) {
              Object.entries(errorData).forEach(([field, messages]) => {
                if (Array.isArray(messages) && messages.length > 0) {
                  newFormErrors[field] = messages[0];
                }
              });
              
              const formattedErrors = Object.entries(errorData)
                .map(([field, messages]) => {
                  if (Array.isArray(messages) && messages.length > 0) {
                    return `${field.replace(/_/g, ' ')}: ${messages[0]}`;
                  }
                  return null;
                })
                .filter(Boolean)
                .join('\n');
              
              if (formattedErrors) {
                errorMessage = formattedErrors;
              }
            } else if (typeof errorData === 'string') {
              errorMessage = errorData;
            }
          }
          
          setFormErrors(newFormErrors);

          notifications.show({
            title: 'Error',
            message: errorMessage,
            color: 'red',
            icon: (
              <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
                <img src={errorIcon} alt='Error' className='w-4 h-4' />
              </span>
            ),
            withBorder: true,
            autoClose: 5000,
            styles: { root: { zIndex: 10000 } },
          });
        },
      });
    } catch (error) {
      console.error('Form submission error:', error);
      notifications.show({
        title: 'Error',
        message: 'An unexpected error occurred. Please try again.',
        color: 'red',
        icon: (
          <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
            <img src={errorIcon} alt='Error' className='w-4 h-4' />
          </span>
        ),
        withBorder: true,
        autoClose: 3000,
        styles: { root: { zIndex: 10000 } },
      });
    }
  });

  if (isClientLoading && isEditing) {
    return (
      <Drawer
        opened={true}
        onClose={closeDrawer}
        position='right'
        size='lg'
        title='Loading Client Data'
      >
        <div className='p-6 flex flex-col items-center justify-center'>
          <Loader color="#1D9B5E" size="xl" />
          <p className="mt-4">Loading client data...</p>
        </div>
      </Drawer>
    );
  }

  return (
    <Drawer
      opened={true}
      onClose={closeDrawer}
      position='right'
      size='lg'
      title={isEditing ? 'Update Client' : 'Add Client or Group'}
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
      zIndex={zIndex}
    >
      <div className='w-full flex flex-col p-6'>
        {!isEditing && (
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
        )}

        {/* Individual Client Form */}
        {(activeTab === 'individual' || isEditing) && (
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmitIndividual}
              className='flex-1 flex flex-col p-2'
            >
              <div className='space-y-4 mb-8'>
                {Object.keys(formErrors).length > 0 && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <img src={errorIcon} alt="Error" className="w-5 h-5" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">
                          Please correct the errors in the form to continue.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Show notice when creating from session drawer */}
                {isFromSessionDrawer && !isEditing && (
                  <div className="bg-blue-50 p-3 mb-4 rounded-md border border-blue-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Creating Client for Session</h3>
                        <div className="mt-1 text-sm text-blue-700">
                          <p>This client will be automatically assigned to the session you're creating.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <h4 className='text-lg font-semibold text-gray-700'>
                  {isEditing ? 'Personal Information' : 'Client Information'}
                </h4>
                
                <div className='grid grid-cols-2 gap-4'>
                  <Controller
                    name='first_name'
                    control={individualControl}
                    rules={{ required: 'First name is required' }}
                    render={({ field, fieldState }) => (
                      <div className="w-full">
                        <Input
                          {...field}
                          label='First Name'
                          placeholder='Enter first name'
                        />
                        {(formErrors.first_name || fieldState.error?.message) && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.first_name || fieldState.error?.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                  <Controller
                    name='last_name'
                    control={individualControl}
                    rules={{ required: 'Last name is required' }}
                    render={({ field, fieldState }) => (
                      <div className="w-full">
                        <Input
                          {...field}
                          label='Last Name'
                          placeholder='Enter last name'
                        />
                        {(formErrors.last_name || fieldState.error?.message) && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.last_name || fieldState.error?.message}
                          </p>
                        )}
                      </div>
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
                  render={({ field, fieldState }) => (
                    <div className="w-full">
                      <Input
                        {...field}
                        label='Phone Number'
                        placeholder='Enter phone number'
                        type='tel'
                      />
                      {(formErrors.phone_number || fieldState.error?.message) && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.phone_number || fieldState.error?.message}
                        </p>
                      )}
                    </div>
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
                  render={({ field, fieldState }) => (
                    <div className="w-full">
                      <Input
                        {...field}
                        label='Email Address'
                        placeholder='Enter email'
                        type='email'
                      />
                      {(formErrors.email || fieldState.error?.message) && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.email || fieldState.error?.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name='location'
                  control={individualControl}
                  render={({ field }) => (
                    <div className="w-full">
                      <DropdownSelectInput
                        {...field}
                        label='Location'
                        placeholder='Select a location'
                        options={
                          locationsData
                            ? locationsData
                                .filter(Boolean)
                                .map((location) => ({
                                  label: location.name,
                                  value: location.id.toString(),
                                }))
                            : []
                        }
                        value={field.value}
                        onSelectItem={(item) => {
                          field.onChange(item.value);
                        }}
                        isLoading={isLocationsLoading}
                        createLabel="Create new location"
                        createDrawerType="location"
                      />
                      {formErrors.location && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.location}
                        </p>
                      )}
                    </div>
                  )}
                />

                <div className='grid grid-cols-2 gap-4'>
                  <Controller
                    name='dob'
                    control={individualControl}
                    render={({ field }) => (
                      <div className="w-full">
                        <div className="relative w-full">
                          <input
                            type="date"
                            id="dob"
                            value={field.value || ''}
                            onChange={field.onChange}
                            className="w-full h-[58px] border border-gray-300 rounded-lg px-4 pt-6 pb-2 text-sm focus:outline-none focus:ring-[1px] focus:ring-primary focus:border-primary"
                          />
                          <label
                            htmlFor="dob"
                            className="absolute top-2 text-xs left-4 transition-all duration-200 text-gray-600 pointer-events-none"
                          >
                            Date of Birth
                          </label>
                        </div>
                      </div>
                    )}
                  />
                  <Controller
                    name='gender'
                    control={individualControl}
                    render={({ field }) => (
                      <div className="w-full">
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
                        {formErrors.gender && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.gender}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>

              {/* Only show sessions dropdown if not from session drawer */}
              {!isFromSessionDrawer && (
                <div className='mb-8'>
                  <Controller
                    name='sessions'
                    control={individualControl}
                    render={({ field }) => (
                      <div className="w-full">
                        <DropdownSelectInput
                          label='Sessions'
                          singleSelect={false}
                          placeholder='Select sessions'
                          options={
                            isSessionsLoading
                              ? [{ label: 'Loading...', value: '' }]
                              : sessionsData?.items
                                  ?.filter(Boolean)
                                  .map((session: any) => ({
                                    label: session.title || session.name || 'Unnamed Session',
                                    value: session.id?.toString() || ''
                                  }))
                                  .filter(item => item.value) || []
                          }
                          value={field.value && Array.isArray(field.value) 
                            ? field.value
                              .filter(item => item && typeof item === 'object' && item.value)
                              .map(item => item.value)
                            : []
                          }
                          onSelectItem={(selectedItems) => {
                            field.onChange(selectedItems);
                          }}
                          createLabel="Create new session"
                          createDrawerType="session"
                        />
                        {formErrors.sessions && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.sessions}
                          </p>
                        )}
                        {formErrors.session_ids && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.session_ids}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>
              )}

              <div className='mt-auto flex justify-end gap-4'>
                <Button
                  type='submit'
                  color='#1D9B5E'
                  radius='8px'
                  className='w-full md:w-auto'
                  disabled={isAddingClient || isUpdatingClient}
                  loading={isAddingClient || isUpdatingClient}
                >
                  {isEditing ? (isUpdatingClient ? 'Updating...' : 'Update Client') : (isAddingClient ? 'Creating...' : 'Add Client')}
                </Button>
              </div>
            </form>
          </FormProvider>
        )}

        {/* Group Form */}
        {activeTab === 'group' && !isEditing && (
          <FormProvider {...groupFormMethods}>
            <form
              onSubmit={handleSubmitGroup}
              className='flex-1 flex flex-col p-2'
            >
              <div className='space-y-4 mb-8'>
                {Object.keys(formErrors).length > 0 && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <img src={errorIcon} alt="Error" className="w-5 h-5" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">
                          Please correct the errors in the form to continue.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Show notice when creating from session drawer */}
                {isFromSessionDrawer && (
                  <div className="bg-blue-50 p-3 mb-4 rounded-md border border-blue-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Creating Group for Session</h3>
                        <div className="mt-1 text-sm text-blue-700">
                          <p>This group will be automatically assigned to the session you're creating.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
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
                              ?.filter(Boolean)
                              .map((location) => ({
                                label: location.name,
                                value: location.name,
                              })) || []
                      }
                      value={field.value}
                      onSelectItem={(selected) => {
                        field.onChange(selected.value);
                      }}
                      createLabel="Create new location"
                      createDrawerType="location"
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
                              ?.filter(Boolean)
                              .map((client) => ({
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
                
                {/* Only show sessions dropdown if not from session drawer */}
                {!isFromSessionDrawer && (
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
                            : sessionsData?.items
                                ?.filter(Boolean)
                                .map((session) => ({
                                  label: session.title || session.name || 'Unnamed Session',
                                  value: session.id.toString(),
                                })) || []
                        }
                        value={field.value?.map((id: number) => id.toString()) || []}
                        onSelectItem={(selectedItems) => {
                          field.onChange(selectedItems.map((item: { value: string }) => parseInt(item.value)));
                        }}
                        createLabel="Create new session"
                        createDrawerType="session"
                      />
                    )}
                  />
                )}
                
                <Controller
                  name='contact_person'
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
                  loading={isAddingGroup}
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
} 